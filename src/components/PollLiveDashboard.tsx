import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getStoredSession } from '../lib/supabase';
import { questions, warmupQuestion, industries, type PollQuestion } from '../data/class-poll';
import type { PollActiveQuestion } from '../lib/supabase-types';
import AdminGuard from './AdminGuard';

// ============================================================
// 課堂即時投票 — 講師端（可直接投影）
// ------------------------------------------------------------
// 用途：跑完 Colab 得到一個數字 → 問全班「這個數字在你那行是多少？」
//       → 投影分布 → 挑極端值邀請分享 → 沒人分享就走備案。
//
// ⛔ 這一頁**故意沒有「結束收件」按鈕**。
//    Poll 模式整堂課都在收件，中途誤按一次全班交卷全失敗。
//    真要關場次請去 /admin/quiz-live/，那裡才有。
//
// 場次與 AI 能力測驗共用 quiz_sessions：同一組代碼、同一個 QR，
// 學員掃 /quiz/ 做能力測驗、開 /poll/ 投票，兩邊都認同一個代碼。
// ============================================================

interface SessionRow {
  id: string;
  code: string;
  title: string;
  status: 'open' | 'closed';
  poll_active: PollActiveQuestion | null;
  created_at: string;
}

interface ResponseRow {
  participant_id: string;
  question_id: string;
  choice_index: number;
  choice_text: string;
  note: string | null;
  industry: string | null;
  submitted_at: string;
}

const ALL_QUESTIONS: PollQuestion[] = [warmupQuestion, ...questions];

/** 代碼字元集刻意排除易混淆的 0/O/1/I，方便口頭唸給實體學員 */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode(): string {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
}

/** 同一人同一題重複投票只算最新一筆（不開 UPDATE 權限，改在這裡收斂） */
function latestPerParticipant(rows: ResponseRow[]): ResponseRow[] {
  const latest = new Map<string, ResponseRow>();
  for (const r of rows) latest.set(r.participant_id, r); // 依 submitted_at 遞增，後者覆蓋前者
  return [...latest.values()];
}

export default function PollLiveDashboard() {
  return (
    <AdminGuard>
      <PollLive />
    </AdminGuard>
  );
}

function PollLive() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [project, setProject] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showIndustry, setShowIndustry] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customOptions, setCustomOptions] = useState('');
  const [expected, setExpected] = useState('');

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const activeQ = active?.poll_active ?? null;
  const activePreset = activeQ ? ALL_QUESTIONS.find((q) => q.id === activeQ.id) : undefined;

  // ── 讀取 ────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('id, code, title, status, poll_active, created_at')
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
      .from('poll_responses')
      .select('participant_id, question_id, choice_index, choice_text, note, industry, submitted_at')
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

  // 只有講師端輪詢——學員端不輪詢（見檔頭）
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
    const stored = getStoredSession();
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({ code: generateCode(), title, created_by: stored?.userId ?? null })
      .select('id, code, title, status, poll_active, created_at')
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

  /** 出題：把整題寫進場次，學員重新整理就看得到 */
  async function ask(q: PollActiveQuestion | null) {
    if (!active) return;
    const { error } = await supabase.from('quiz_sessions').update({ poll_active: q }).eq('id', active.id);
    if (error) {
      setError(error.message);
      return;
    }
    setSessions((prev) => prev.map((s) => (s.id === active.id ? { ...s, poll_active: q } : s)));
  }

  function askCustom() {
    const text = customText.trim();
    const opts = customOptions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!text || opts.length < 2) return;
    void ask({ id: `adhoc-${Date.now()}`, text, options: opts.slice(0, 8) });
    setCustomText('');
    setCustomOptions('');
  }

  // ── 統計 ────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!activeQ) return null;
    const rows = latestPerParticipant(responses.filter((r) => r.question_id === activeQ.id));
    const counts = activeQ.options.map(() => 0);
    for (const r of rows) if (counts[r.choice_index] !== undefined) counts[r.choice_index]++;

    // 業態 × 選項交叉表——跨業態對照是這八題的教學核心
    const byIndustry = industries
      .map((ind) => {
        const sub = rows.filter((r) => r.industry === ind);
        return { industry: ind, n: sub.length, counts: activeQ.options.map((_, i) => sub.filter((r) => r.choice_index === i).length) };
      })
      .filter((x) => x.n > 0);

    const notes = rows
      .filter((r) => r.note?.trim())
      .map((r) => ({ note: r.note!.trim(), choice: r.choice_text, industry: r.industry }))
      .reverse();

    return { n: rows.length, counts, byIndustry, notes };
  }, [responses, activeQ]);

  /** 每題已投人數，講師掃一眼就知道哪題還沒問過 */
  const answeredPerQuestion = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of ALL_QUESTIONS) {
      map[q.id] = new Set(responses.filter((r) => r.question_id === q.id).map((r) => r.participant_id)).size;
    }
    return map;
  }, [responses]);

  const joinUrl = active
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://launchdock.app'}/poll/?code=${active.code}`
    : '';

  // QR：學員掃了直接進投票頁，不用手打代碼
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    if (!joinUrl) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(joinUrl, { width: 640, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } }),
      )
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [joinUrl]);

  // ── 畫面 ────────────────────────────────────────────────
  return (
    <div>
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {!project && (
        <>
          {/* 建立場次 */}
          <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
            <p className="text-sm font-semibold mb-3">開一場新的課堂投票</p>
            <div className="flex gap-2 flex-wrap">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createSession()}
                placeholder="例：日晴生活 8/12 Day 3"
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
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              場次與 AI 能力測驗共用——同一組代碼、同一個 QR，兩邊都認得。
            </p>
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
        </>
      )}

      {!active ? (
        <p className="text-center py-16 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          還沒有場次。上面建立一場，把連結／代碼給學員即可開始。
        </p>
      ) : (
        <>
          {active.status === 'closed' && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
              ⛔ 這個場次是<b>關閉</b>狀態，學員現在投不了票。去
              <a href="/admin/quiz-live/" className="underline mx-1">班級測驗頁</a>
              按「▶️ 重新開放」。<b>投票期間整堂課都要保持開放，不要按結束收件。</b>
            </div>
          )}

          {!project && (
            /* 加入資訊（可投影） */
            <div className="rounded-2xl p-6 mb-6 border text-center" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-brand)' }}>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    請學員打開
                  </p>
                  <p className="text-lg font-semibold mb-2">launchdock.app/poll</p>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>課堂代碼</p>
                  <p className="text-5xl font-extrabold tracking-[0.2em]" style={{ color: 'var(--color-brand-light)' }}>
                    {active.code}
                  </p>
                </div>
                {qrDataUrl && (
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>或直接掃碼</p>
                    <img src={qrDataUrl} alt={`掃碼加入課堂投票，代碼 ${active.code}`} style={{ width: 176, height: 'auto', backgroundColor: '#fff', padding: 8, borderRadius: 8 }} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <button
                  onClick={() => navigator.clipboard?.writeText(joinUrl)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ backgroundColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
                >
                  📋 複製投票連結
                </button>
              </div>
              <p className="mt-3 text-xs break-all" style={{ color: 'var(--color-text-muted)' }}>{joinUrl}</p>
            </div>
          )}

          {!project && (
            <>
              {/* 出題 */}
              <p className="text-sm font-semibold mb-2">出題（學員按「更新」就會看到）</p>
              {([3, 4] as const).map((day) => (
                <div key={day} className="mb-3">
                  <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    {day === 3 ? 'Day 3（8/12）' : 'Day 4（8/14）'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {questions
                      .filter((q) => q.day === day)
                      .map((q) => (
                        <AskButton key={q.id} q={q} isActive={activeQ?.id === q.id} answered={answeredPerQuestion[q.id]} onAsk={() => ask({ id: q.id, text: q.text, options: q.options })} />
                      ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <AskButton q={warmupQuestion} isActive={activeQ?.id === warmupQuestion.id} answered={answeredPerQuestion[warmupQuestion.id]} onAsk={() => ask({ id: warmupQuestion.id, text: warmupQuestion.text, options: warmupQuestion.options })} />
                {activeQ && (
                  <button onClick={() => ask(null)} className="px-3 py-1.5 rounded-lg text-xs border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-muted)' }}>
                    ⏸ 收起題目
                  </button>
                )}
              </div>

              {/* 現場打字出題 */}
              <details className="mb-6 rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
                <summary className="text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>✏️ 臨時想問別的（現場打字出題）</summary>
                <input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="題目"
                  className="w-full mt-3 px-3 py-2 rounded-lg text-sm border"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
                />
                <textarea
                  value={customOptions}
                  onChange={(e) => setCustomOptions(e.target.value)}
                  rows={4}
                  placeholder={'選項，一行一個（至少兩個，最多八個）'}
                  className="w-full mt-2 px-3 py-2 rounded-lg text-sm border"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
                />
                <button
                  onClick={askCustom}
                  disabled={!customText.trim() || customOptions.split('\n').filter((s) => s.trim()).length < 2}
                  className="mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-brand)' }}
                >
                  出這題
                </button>
              </details>
            </>
          )}

          {/* ── 投影區 ─────────────────────────────────── */}
          {activeQ && stats ? (
            <div className="rounded-2xl p-6 border-2 mb-6" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-brand)' }}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {activePreset && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}>
                      {activePreset.label}
                    </span>
                  )}
                  <p className={project ? 'text-4xl font-extrabold' : 'text-xl font-bold'}>{activeQ.text}</p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className={project ? 'text-2xl font-extrabold' : 'text-lg font-bold'} style={{ color: 'var(--color-text-primary)' }}>
                    {stats.n}
                  </span>
                  <span>票{expected.trim() && ` / ${expected.trim()} 人`}</span>
                  <button onClick={() => setProject((v) => !v)} className="underline">
                    {project ? '↩︎ 離開投影' : '🖥 投影模式'}
                  </button>
                </div>
              </div>

              {stats.n === 0 ? (
                <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  等第一票…（喊一聲「請重新整理」，學員端不會自己跳）
                </p>
              ) : (
                <div className={project ? 'space-y-4' : 'space-y-2'}>
                  {activeQ.options.map((opt, i) => (
                    <BarRow key={i} label={opt} count={stats.counts[i]} total={stats.n} big={project} />
                  ))}
                </div>
              )}

              {/* 匿名文字牆——第 1 層備案：沒人開麥就念這些 */}
              {stats.notes.length > 0 && showNotes && (
                <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    💬 學員留言（匿名，可直接念出來）
                  </p>
                  <div className="space-y-2">
                    {stats.notes.map((n, i) => (
                      <div key={i} className={`rounded-lg px-4 py-3 ${project ? 'text-xl' : 'text-sm'}`} style={{ backgroundColor: 'var(--color-surface)' }}>
                        「{n.note}」
                        <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
                          — 選「{n.choice}」{n.industry ? ` · ${n.industry}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 業態 × 選項：跨業態對照 */}
              {showIndustry && stats.byIndustry.length > 0 && (
                <div className="mt-6 pt-5 border-t overflow-x-auto" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>🏷 業態 × 選項</p>
                  <table className="text-xs w-full" style={{ minWidth: 480 }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)' }}>
                        <th className="text-left py-1 pr-3">業態</th>
                        {activeQ.options.map((o, i) => (
                          <th key={i} className="text-right py-1 px-2 font-normal">{o}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.byIndustry.map((row) => (
                        <tr key={row.industry} style={{ borderTop: '1px solid var(--color-surface-lighter)' }}>
                          <td className="py-1.5 pr-3">{row.industry}（{row.n}）</td>
                          {row.counts.map((c, i) => (
                            <td key={i} className="text-right py-1.5 px-2" style={{ color: c > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                              {c || '·'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            !project && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                還沒出題。上面點一題，然後跟全班說「請重新整理」。
              </p>
            )
          )}

          {/* 控制列 */}
          <div className="flex items-center gap-4 flex-wrap text-xs mb-8" style={{ color: 'var(--color-text-muted)' }}>
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
              自動更新（5 秒）
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} />
              顯示留言
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showIndustry} onChange={(e) => setShowIndustry(e.target.checked)} />
              業態交叉表
            </label>
            <button onClick={() => activeId && loadResponses(activeId)} className="underline">手動刷新</button>
            {lastSync && <span>{lastSync.toLocaleTimeString('zh-TW', { hour12: false })}</span>}
            {project && (
              <button onClick={() => setProject(false)} className="underline">↩︎ 離開投影模式</button>
            )}
          </div>

          {/* 講師提詞（投影模式下自動收起，不會被學員看到） */}
          {!project && activePreset && (
            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: '#f59e0b' }}>
              <p className="text-sm font-semibold mb-2">🎤 講師提詞 · {activePreset.label}</p>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                {activePreset.where}
                {activePreset.star ? ` · ${activePreset.star}` : ''}
              </p>
              {activePreset.colab && (
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  <b>Colab 先跑出：</b>{activePreset.colab}
                </p>
              )}
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-primary)' }}>{activePreset.script}</p>
              {activePreset.fallback && (
                <div className="overflow-x-auto">
                  <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>🔒 備案：沒人分享時講這張跨業態對照</p>
                  <table className="text-xs w-full" style={{ minWidth: 420 }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)' }}>
                        {activePreset.fallback.headers.map((h) => (
                          <th key={h} className="text-left py-1 pr-4 font-normal">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activePreset.fallback.rows.map((row, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--color-surface-lighter)' }}>
                          {row.map((cell, j) => (
                            <td key={j} className="py-1.5 pr-4">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activePreset.fallbackNote && (
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <b>🔒 備案：</b>{activePreset.fallbackNote}
                </p>
              )}
            </div>
          )}

          {!project && (
            <p className="text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
              ⛔ 這一頁故意沒有「結束收件」——投票整堂課都在收，中途誤按一次全班交卷全失敗。
              真要關場次去 <a href="/admin/quiz-live/" className="underline">班級測驗頁</a>。
            </p>
          )}
        </>
      )}
    </div>
  );
}

function AskButton({ q, isActive, answered, onAsk }: { q: PollQuestion; isActive: boolean; answered?: number; onAsk: () => void }) {
  return (
    <button
      onClick={onAsk}
      title={q.text}
      className="px-3 py-1.5 rounded-lg text-xs border transition-all"
      style={{
        backgroundColor: isActive ? 'var(--color-brand)' : 'var(--color-surface-light)',
        borderColor: isActive ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
        color: isActive ? '#fff' : 'var(--color-text-secondary)',
      }}
    >
      <b>{q.label}</b> {q.text.length > 14 ? `${q.text.slice(0, 14)}…` : q.text}
      {answered ? <span className="ml-1 opacity-70">({answered})</span> : null}
    </button>
  );
}

function BarRow({ label, count, total, big }: { label: string; count: number; total: number; big?: boolean }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className={big ? 'text-2xl w-[30%] shrink-0' : 'text-sm w-[32%] shrink-0'} style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <div className={`flex-1 rounded overflow-hidden ${big ? 'h-10' : 'h-5'}`} style={{ backgroundColor: 'var(--color-surface-lighter)' }}>
        <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--color-brand)' }} />
      </div>
      <span className={big ? 'text-2xl font-bold w-32 text-right shrink-0' : 'text-xs w-20 text-right shrink-0'} style={{ color: 'var(--color-text-muted)' }}>
        {count}（{Math.round(pct)}%）
      </span>
    </div>
  );
}
