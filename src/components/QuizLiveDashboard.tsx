import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getStoredSession } from '../lib/supabase';
import { questions, dimensions, levels, config, type DimensionKey } from '../data/quiz';
import AdminGuard from './AdminGuard';

// ============================================================
// 團體班即時測驗後台
// 用途：開一場課 → 學員（線上＋實體）掃同一條連結作答 → 老師當場看全班程度分佈。
// 隱私：畫面只呈現聚合數字，永遠不顯示個別作答者（可安全投影）。
// ============================================================

type Phase = 'pre' | 'post';

interface SessionRow {
  id: string;
  code: string;
  title: string;
  status: 'open' | 'closed';
  phase: Phase;
  created_at: string;
}

interface ResponseRow {
  participant_id: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
  primary_level: number;
  gap_dimension: string | null;
  phase: Phase;
  submitted_at: string;
}

/** 同一人重複作答只算最新一筆 */
function latestPerParticipant(rows: ResponseRow[]): Map<string, ResponseRow> {
  const latest = new Map<string, ResponseRow>();
  for (const r of rows) latest.set(r.participant_id, r); // 依 submitted_at 遞增，後者覆蓋前者
  return latest;
}

/** 一個階段的聚合統計 */
function computeStats(rows: ResponseRow[]) {
  const n = rows.length;

  const levelCounts = [0, 0, 0, 0]; // L1..L4
  for (const r of rows) levelCounts[Math.min(4, Math.max(1, r.primary_level)) - 1]++;

  const gapCounts: Record<string, number> = { none: 0 };
  for (const d of dimensions) gapCounts[d.key] = 0;
  for (const r of rows) gapCounts[r.gap_dimension ?? 'none']++;

  const unlockRate: Record<DimensionKey, number> = { chat: 0, documents: 0, tools: 0, automation: 0 };
  for (const d of dimensions) {
    const unlocked = rows.filter((r) => (r.scores?.[d.key] ?? 0) >= config.unlockThreshold).length;
    unlockRate[d.key] = n > 0 ? unlocked / n : 0;
  }

  const avgLevel = n > 0 ? rows.reduce((sum, r) => sum + r.primary_level, 0) / n : 0;

  // 主要卡點 = 最多人卡住的維度（不含全解鎖）
  let topGap: { key: string; count: number } | null = null;
  for (const d of dimensions) {
    const c = gapCounts[d.key];
    if (c > 0 && (!topGap || c > topGap.count)) topGap = { key: d.key, count: c };
  }

  // 逐題選項分佈
  const perQuestion = questions.map((q) => {
    const counts = q.options.map(() => 0);
    let answered = 0;
    for (const r of rows) {
      const pick = r.answers?.[q.id];
      if (typeof pick === 'number' && counts[pick] !== undefined) {
        counts[pick]++;
        answered++;
      }
    }
    const lowest = counts[0] ?? 0;
    return { q, counts, answered, lowestShare: answered > 0 ? lowest / answered : 0 };
  });

  return { n, levelCounts, gapCounts, unlockRate, avgLevel, topGap, perQuestion };
}

/** 代碼字元集刻意排除易混淆的 0/O/1/I，方便口頭唸給實體學員 */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode(): string {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
}

export default function QuizLiveDashboard() {
  return (
    <AdminGuard>
      <QuizLive />
    </AdminGuard>
  );
}

function QuizLive() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showPerQuestion, setShowPerQuestion] = useState(false);
  const [expected, setExpected] = useState('');

  const active = sessions.find((s) => s.id === activeId) ?? null;

  // ── 讀取 ────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('id, code, title, status, phase, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      setError(error.message);
      return;
    }
    setSessions((data ?? []) as SessionRow[]);
    setActiveId((prev) => prev ?? (data?.[0] as SessionRow | undefined)?.id ?? null);
  }, []);

  const loadResponses = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('participant_id, answers, scores, primary_level, gap_dimension, phase, submitted_at')
      .eq('session_id', sessionId)
      .order('submitted_at', { ascending: true });
    if (error) {
      setError(error.message);
      return;
    }
    setResponses((data ?? []) as ResponseRow[]);
    setLastSync(new Date());
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase 未設定');
      return;
    }
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!activeId) return;
    void loadResponses(activeId);
  }, [activeId, loadResponses]);

  // 自動更新（分頁不在前景時停，省流量）
  useEffect(() => {
    if (!autoRefresh || !activeId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void loadResponses(activeId);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoRefresh, activeId, loadResponses]);

  // ── 動作 ────────────────────────────────────────────────
  async function createSession() {
    const title = newTitle.trim();
    if (!title) return;
    setCreating(true);
    setError('');
    const session = getStoredSession();
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({ code: generateCode(), title, created_by: session?.userId ?? null })
      .select('id, code, title, status, phase, created_at')
      .single();
    setCreating(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNewTitle('');
    setSessions((prev) => [data as SessionRow, ...prev]);
    setActiveId((data as SessionRow).id);
  }

  async function toggleStatus() {
    if (!active) return;
    const next = active.status === 'open' ? 'closed' : 'open';
    const { error } = await supabase
      .from('quiz_sessions')
      .update({ status: next, closed_at: next === 'closed' ? new Date().toISOString() : null })
      .eq('id', active.id);
    if (error) {
      setError(error.message);
      return;
    }
    setSessions((prev) => prev.map((s) => (s.id === active.id ? { ...s, status: next } : s)));
  }

  /** 課後把場次切到 post，學員重開同一條連結再做一次（作答的 phase 由 DB trigger 決定） */
  async function togglePhase() {
    if (!active) return;
    const next: Phase = active.phase === 'post' ? 'pre' : 'post';
    const { error } = await supabase.from('quiz_sessions').update({ phase: next }).eq('id', active.id);
    if (error) {
      setError(error.message);
      return;
    }
    setSessions((prev) => prev.map((s) => (s.id === active.id ? { ...s, phase: next } : s)));
  }

  // ── 統計（分課前／課後兩階段，同一人重複作答只算最新一筆） ──────
  const { preStats, postStats, delta } = useMemo(() => {
    const preMap = latestPerParticipant(responses.filter((r) => r.phase !== 'post'));
    const postMap = latestPerParticipant(responses.filter((r) => r.phase === 'post'));
    const preRows = [...preMap.values()];
    const postRows = [...postMap.values()];

    // 成效對照：優先用「課前課後都做過」的人配對算，人人可比才公平
    const pairedIds = [...postMap.keys()].filter((id) => preMap.has(id));
    const avg = (rows: ResponseRow[]) =>
      rows.length > 0 ? rows.reduce((s, r) => s + r.primary_level, 0) / rows.length : 0;
    const pairedPre = pairedIds.map((id) => preMap.get(id)!);
    const pairedPost = pairedIds.map((id) => postMap.get(id)!);
    const usePaired = pairedIds.length > 0;

    const before = usePaired ? avg(pairedPre) : avg(preRows);
    const after = usePaired ? avg(pairedPost) : avg(postRows);

    const unlockDelta = dimensions.map((d) => {
      const rate = (rows: ResponseRow[]) =>
        rows.length > 0
          ? rows.filter((r) => (r.scores?.[d.key] ?? 0) >= config.unlockThreshold).length / rows.length
          : 0;
      return {
        key: d.key,
        name: d.name.zh,
        before: rate(usePaired ? pairedPre : preRows),
        after: rate(usePaired ? pairedPost : postRows),
      };
    });

    return {
      preStats: computeStats(preRows),
      postStats: computeStats(postRows),
      delta:
        preRows.length > 0 && postRows.length > 0
          ? { before, after, diff: after - before, pairedCount: pairedIds.length, usePaired, unlockDelta }
          : null,
    };
  }, [responses]);

  const currentPhase: Phase = active?.phase === 'post' ? 'post' : 'pre';
  const stats = currentPhase === 'post' ? postStats : preStats;

  const joinUrl = active ? `${typeof window !== 'undefined' ? window.location.origin : 'https://launchdock.app'}/quiz/?code=${active.code}` : '';

  // ── 畫面 ────────────────────────────────────────────────
  return (
    <div>
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* 建立場次 */}
      <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
        <p className="text-sm font-semibold mb-3">開一場新的班級測驗</p>
        <div className="flex gap-2 flex-wrap">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createSession()}
            placeholder="例：8/15 企業內訓 上午班"
            className="flex-1 min-w-[220px] px-3 py-2 rounded-lg text-sm border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
          />
          <button
            onClick={createSession}
            disabled={creating || !newTitle.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {creating ? '建立中…' : '建立場次'}
          </button>
        </div>
      </div>

      {/* 場次選擇 */}
      {sessions.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className="px-3 py-1.5 rounded-lg text-xs border transition-all"
              style={{
                backgroundColor: s.id === activeId ? 'var(--color-brand)' : 'var(--color-surface-light)',
                borderColor: s.id === activeId ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
                color: s.id === activeId ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {s.status === 'open' ? '🟢' : '⚪'} {s.title}
            </button>
          ))}
        </div>
      )}

      {!active ? (
        <p className="text-center py-16 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          還沒有場次。上面建立一場，把連結／代碼給學員即可開始。
        </p>
      ) : (
        <>
          {/* 加入資訊（可投影） */}
          <div className="rounded-2xl p-6 mb-6 border text-center" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-brand)' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>
              請學員打開
            </p>
            <p className="text-lg font-semibold mb-2">launchdock.app/quiz</p>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              課堂代碼 · 現在收的是{currentPhase === 'post' ? '「課後測」' : '「課前測」'}
            </p>
            <p className="text-5xl font-extrabold tracking-[0.2em]" style={{ color: 'var(--color-brand-light)' }}>
              {active.code}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <button
                onClick={() => navigator.clipboard?.writeText(joinUrl)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
              >
                📋 複製作答連結
              </button>
              <button
                onClick={toggleStatus}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
              >
                {active.status === 'open' ? '⏹ 結束收件' : '▶️ 重新開放'}
              </button>
              <button
                onClick={togglePhase}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: currentPhase === 'post' ? '#f59e0b' : 'var(--color-surface-lighter)',
                  color: currentPhase === 'post' ? '#1a1a1a' : 'var(--color-text-primary)',
                }}
              >
                {currentPhase === 'post' ? '↩︎ 切回課前測' : '🎓 切到課後測'}
              </button>
            </div>
            <p className="mt-3 text-xs break-all" style={{ color: 'var(--color-text-muted)' }}>{joinUrl}</p>
          </div>

          {/* 收件進度 */}
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{stats.n}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                份{currentPhase === 'post' ? '課後測' : '課前測'}已交{expected.trim() && ` / ${expected.trim()} 人`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <input
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="班級人數"
                inputMode="numeric"
                className="w-24 px-2 py-1 rounded border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
              />
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                自動更新
              </label>
              <button onClick={() => activeId && loadResponses(activeId)} className="underline">
                手動刷新
              </button>
              {lastSync && <span>{lastSync.toLocaleTimeString('zh-TW', { hour12: false })}</span>}
            </div>
          </div>

          {/* 成效對照：課前 vs 課後（兩階段都有資料才出現） */}
          {delta && (
            <div className="rounded-2xl p-5 mb-8 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: '#f59e0b' }}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
                <p className="text-sm font-semibold">🎓 這堂課的成效</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {delta.usePaired
                    ? `課前課後都做過的 ${delta.pairedCount} 人配對比較`
                    : `尚無配對到的人，暫以全體平均比較（課前 ${preStats.n} 份 / 課後 ${postStats.n} 份）`}
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap mb-5">
                <div className="text-center">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>課前</p>
                  <p className="text-3xl font-extrabold">L{delta.before.toFixed(1)}</p>
                </div>
                <span className="text-2xl" style={{ color: 'var(--color-text-muted)' }}>→</span>
                <div className="text-center">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>課後</p>
                  <p className="text-3xl font-extrabold" style={{ color: 'var(--color-brand-light)' }}>
                    L{delta.after.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>推進</p>
                  <p className="text-3xl font-extrabold" style={{ color: delta.diff > 0 ? '#22c55e' : 'var(--color-text-muted)' }}>
                    {delta.diff > 0 ? '+' : ''}
                    {delta.diff.toFixed(1)}
                  </p>
                </div>
              </div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>四項能力解鎖率變化</p>
              <div className="space-y-2">
                {delta.unlockDelta.map((d) => (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="text-sm w-[30%] shrink-0" style={{ color: 'var(--color-text-secondary)' }}>{d.name}</span>
                    <div className="flex-1 h-5 rounded relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
                      <div className="h-full absolute inset-y-0 left-0" style={{ width: `${d.after * 100}%`, backgroundColor: 'var(--color-brand)' }} />
                      <div className="h-full absolute inset-y-0 left-0 border-r-2" style={{ width: `${d.before * 100}%`, backgroundColor: 'rgba(0,0,0,0.25)', borderColor: 'var(--color-text-muted)' }} />
                    </div>
                    <span className="text-xs w-28 text-right shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                      {Math.round(d.before * 100)}% → {Math.round(d.after * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.n === 0 ? (
            <p className="text-center py-16 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {currentPhase === 'post'
                ? '已切到課後測——請學員重開同一條連結再做一次（等第一份送出）'
                : '等待第一份作答…（學員送出後 5 秒內會出現）'}
            </p>
          ) : (
            <>
              {/* 一眼看懂：本班程度 + 主要卡點 */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>本班平均程度</p>
                  <p className="text-3xl font-extrabold mt-1" style={{ color: 'var(--color-brand-light)' }}>
                    L{stats.avgLevel.toFixed(1)}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {levels[Math.round(stats.avgLevel)]?.title.zh ?? ''}
                  </p>
                </div>
                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>最多人卡在</p>
                  {stats.topGap ? (
                    <>
                      <p className="text-3xl font-extrabold mt-1" style={{ color: '#f59e0b' }}>
                        {dimensions.find((d) => d.key === stats.topGap!.key)?.name.zh}
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {stats.topGap.count} 人（{Math.round((stats.topGap.count / stats.n) * 100)}%）→ 這段建議放慢、多做示範
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-bold mt-2">全班四項都解鎖了 🎉</p>
                  )}
                </div>
              </div>

              {/* 程度分佈 */}
              <h3 className="text-sm font-semibold mb-3">程度分佈</h3>
              <div className="space-y-2 mb-8">
                {stats.levelCounts.map((count, i) => (
                  <BarRow
                    key={i}
                    label={`L${i + 1} ${levels[i + 1]?.title.zh.replace(/^Level \d+ — /, '') ?? ''}`}
                    count={count}
                    total={stats.n}
                  />
                ))}
              </div>

              {/* 四項能力解鎖率 */}
              <h3 className="text-sm font-semibold mb-3">四項能力解鎖率</h3>
              <div className="space-y-2 mb-8">
                {dimensions.map((d) => (
                  <BarRow
                    key={d.key}
                    label={`${d.name.zh}（L${d.level}）`}
                    count={Math.round(stats.unlockRate[d.key] * stats.n)}
                    total={stats.n}
                    highlight={stats.topGap?.key === d.key}
                  />
                ))}
              </div>

              {/* 逐題分佈（想看細節才展開） */}
              <button
                onClick={() => setShowPerQuestion((v) => !v)}
                className="text-sm underline mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {showPerQuestion ? '▾ 收起逐題分佈' : '▸ 展開逐題分佈（12 題）'}
              </button>

              {showPerQuestion && (
                <div className="space-y-6">
                  {stats.perQuestion.map(({ q, counts, answered, lowestShare }) => (
                    <div key={q.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                      <p className="text-sm font-medium mb-3">{q.text.zh}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, idx) => (
                          <BarRow key={idx} label={opt.text.zh} count={counts[idx]} total={answered} small />
                        ))}
                      </div>
                      {lowestShare >= 0.5 && answered >= 3 && (
                        <p className="text-xs mt-3" style={{ color: '#f59e0b' }}>
                          ⚠️ {Math.round(lowestShare * 100)}% 選了最基礎的選項 → 建議現場補講這一段
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── 長條列 ────────────────────────────────────────────────
function BarRow({
  label,
  count,
  total,
  highlight,
  small,
}: {
  label: string;
  count: number;
  total: number;
  highlight?: boolean;
  small?: boolean;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={small ? 'text-xs w-[45%] shrink-0' : 'text-sm w-[38%] shrink-0'} style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
        <div
          className="h-full rounded transition-all"
          style={{ width: `${pct}%`, backgroundColor: highlight ? '#f59e0b' : 'var(--color-brand)' }}
        />
      </div>
      <span className="text-xs w-16 text-right shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {count}（{Math.round(pct)}%）
      </span>
    </div>
  );
}
