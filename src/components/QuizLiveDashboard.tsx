import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getStoredSession } from '../lib/supabase';
import { questions, dimensions, levels, config, type DimensionKey } from '../data/quiz';
import AdminGuard from './AdminGuard';

// ============================================================
// 團體班即時測驗後台
// 用途：開一場課 → 學員（線上＋實體）掃同一條連結作答 → 老師當場看全班程度分佈。
// 隱私：畫面只呈現聚合數字，永遠不顯示個別作答者（可安全投影）。
// ============================================================

interface SessionRow {
  id: string;
  code: string;
  title: string;
  status: 'open' | 'closed';
  created_at: string;
}

interface ResponseRow {
  participant_id: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
  primary_level: number;
  gap_dimension: string | null;
  submitted_at: string;
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
      .select('id, code, title, status, created_at')
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
      .select('participant_id, answers, scores, primary_level, gap_dimension, submitted_at')
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
      .select('id, code, title, status, created_at')
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

  // ── 統計（同一人重複作答只算最新一筆） ──────────────────────
  const stats = useMemo(() => {
    const latest = new Map<string, ResponseRow>();
    for (const r of responses) latest.set(r.participant_id, r); // 依 submitted_at 遞增，後者覆蓋前者
    const rows = [...latest.values()];
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

    return { n, rows, levelCounts, gapCounts, unlockRate, avgLevel, topGap, perQuestion };
  }, [responses]);

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
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>課堂代碼</p>
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
            </div>
            <p className="mt-3 text-xs break-all" style={{ color: 'var(--color-text-muted)' }}>{joinUrl}</p>
          </div>

          {/* 收件進度 */}
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{stats.n}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                份已交{expected.trim() && ` / ${expected.trim()} 人`}
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

          {stats.n === 0 ? (
            <p className="text-center py-16 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              等待第一份作答…（學員送出後 5 秒內會出現）
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
