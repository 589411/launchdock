import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { questions, warmupQuestion, industries, type PollQuestion } from '../data/class-poll';
import type { PollActiveQuestion } from '../lib/supabase-types';

// ============================================================
// 課堂即時投票 — 學員端
// ------------------------------------------------------------
// 設計要點：
//   1. **不輪詢。** 即時是投影給全班看的，不是給學員看的。
//      講師口頭喊「請重新整理」，學員按一下按鈕就好——
//      學員端也輪詢的話，一堂課 75 萬次請求。
//   2. 全匿名，不需登入。participant_id 只存在自己的瀏覽器。
//   3. **一鍵投票**：點選項即送出，不必再按確認。30 秒內全班到齊。
//      想補一句話的人再展開選填欄（講師會匿名念出來）。
//   4. 講師還沒出題、或網路壞掉時，八題全列在下面，學員可以自己往下投——
//      永遠不會出現「我不知道現在要幹嘛」。
// ============================================================

const PARTICIPANT_KEY = 'launchdock-quiz-participant'; // 與 AI 能力測驗共用同一顆匿名 id
const INDUSTRY_KEY = 'launchdock-poll-industry';
const VOTES_KEY = 'launchdock-poll-votes'; // { [sessionId]: { [questionId]: choiceIndex } }

function getParticipantId(): string {
  try {
    let id = localStorage.getItem(PARTICIPANT_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(PARTICIPANT_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`;
  }
}

function readVotes(sessionId: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) || '{}')[sessionId] ?? {};
  } catch {
    return {};
  }
}

function writeVote(sessionId: string, questionId: string, choiceIndex: number) {
  try {
    const all = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
    all[sessionId] = { ...(all[sessionId] ?? {}), [questionId]: choiceIndex };
    localStorage.setItem(VOTES_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

interface PollSession {
  id: string;
  title: string;
  active: PollActiveQuestion | null;
}

type Status = 'loading' | 'no-code' | 'not-found' | 'ready' | 'offline';

export default function ClassPoll() {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<PollSession | null>(null);
  const [code, setCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [industry, setIndustry] = useState('');
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);

  // ── 解析課堂代碼 ────────────────────────────────────────
  const resolve = useCallback(async (rawCode: string) => {
    if (!isSupabaseConfigured()) {
      setStatus('offline');
      return;
    }
    const { data, error } = await supabase.rpc('resolve_quiz_session', { p_code: rawCode.trim() });
    if (error) {
      setStatus('offline');
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.id) {
      setStatus('not-found');
      return;
    }
    setSession({ id: row.id, title: row.title, active: (row.poll_active as PollActiveQuestion) ?? null });
    setVotes(readVotes(row.id));
    setStatus('ready');
  }, []);

  useEffect(() => {
    try {
      setIndustry(localStorage.getItem(INDUSTRY_KEY) || '');
    } catch {
      /* ignore */
    }
    const urlCode = new URLSearchParams(window.location.search).get('code');
    if (!urlCode) {
      setStatus('no-code');
      return;
    }
    setCode(urlCode.trim());
    void resolve(urlCode);
  }, [resolve]);

  async function refresh() {
    if (!code) return;
    setRefreshing(true);
    await resolve(code);
    setRefreshing(false);
    setNoteFor(null);
    setNote('');
    setNoteSent(false);
  }

  function chooseIndustry(v: string) {
    setIndustry(v);
    try {
      localStorage.setItem(INDUSTRY_KEY, v);
    } catch {
      /* ignore */
    }
  }

  // ── 投票 ────────────────────────────────────────────────
  async function vote(q: { id: string; options: string[] }, idx: number, withNote?: string) {
    if (!session) return;
    setSending(q.id);
    setFailed(null);
    const { error } = await supabase.from('poll_responses').insert({
      session_id: session.id,
      participant_id: getParticipantId(),
      question_id: q.id,
      choice_index: idx,
      choice_text: q.options[idx] ?? String(idx),
      note: withNote?.trim() ? withNote.trim().slice(0, 200) : null,
      industry: industry || null,
    });
    setSending(null);
    if (error) {
      setFailed(q.id);
      return;
    }
    setVotes((prev) => ({ ...prev, [q.id]: idx }));
    writeVote(session.id, q.id, idx);
    if (withNote?.trim()) setNoteSent(true);
  }

  // ── 畫面 ────────────────────────────────────────────────
  if (status === 'loading') {
    return <p className="text-center py-24 text-sm" style={{ color: 'var(--color-text-muted)' }}>連線中…</p>;
  }

  if (status === 'no-code' || status === 'not-found') {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <p className="text-lg font-semibold mb-2">課堂投票</p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {status === 'not-found'
            ? '找不到這個課堂代碼，或這場已經結束了。請跟講師確認代碼。'
            : '請輸入講師唸的 6 碼課堂代碼。'}
        </p>
        <div className="flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && codeInput.trim()) {
                setCode(codeInput.trim());
                setStatus('loading');
                void resolve(codeInput);
              }
            }}
            placeholder="課堂代碼"
            className="flex-1 px-3 py-3 rounded-lg text-center text-lg tracking-[0.2em] border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-surface-lighter)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            onClick={() => {
              if (!codeInput.trim()) return;
              setCode(codeInput.trim());
              setStatus('loading');
              void resolve(codeInput);
            }}
            className="px-5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            進入
          </button>
        </div>
      </div>
    );
  }

  if (status === 'offline' || !session) {
    return (
      <p className="text-center py-24 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        連不上投票系統。請檢查網路後重新整理；若還是不行，跟講師說一聲，這段會改用紙本。
      </p>
    );
  }

  const active = session.active;
  const activePreset = active ? [warmupQuestion, ...questions].find((q) => q.id === active.id) : undefined;

  return (
    <div>
      {/* 業態：選一次，之後每票都帶著 */}
      <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          你的業態（選一次就好，講師會用它做跨業態對照）
        </p>
        <div className="flex flex-wrap gap-1.5">
          {industries.map((v) => (
            <button
              key={v}
              onClick={() => chooseIndustry(v)}
              className="px-2.5 py-1.5 rounded-lg text-xs border transition-all"
              style={{
                backgroundColor: industry === v ? 'var(--color-brand)' : 'var(--color-surface)',
                borderColor: industry === v ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
                color: industry === v ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 現在這一題 */}
      {active ? (
        <div className="rounded-2xl p-5 mb-6 border-2" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-brand)' }}>
          <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}>
              {activePreset?.label ?? '現在這一題'}
            </span>
            <button onClick={refresh} className="text-xs underline" style={{ color: 'var(--color-text-muted)' }}>
              {refreshing ? '更新中…' : '🔄 換題了？點我更新'}
            </button>
          </div>
          <p className="text-xl font-bold mb-4 leading-snug">{active.text}</p>
          <OptionList
            options={active.options}
            picked={votes[active.id]}
            sending={sending === active.id}
            onPick={(i) => vote(active, i)}
          />
          {failed === active.id && (
            <p className="text-xs mt-3" style={{ color: '#f87171' }}>
              送出失敗，可能是網路不穩。等幾秒再點一次就好；若一直失敗請告訴講師。
            </p>
          )}

          {votes[active.id] !== undefined && (
            <div className="mt-4">
              {noteFor === active.id ? (
                <>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 200))}
                    rows={3}
                    placeholder="例：我們抓 28 天，因為保養品差不多那時候用完"
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => vote(active, votes[active.id], note)}
                      disabled={!note.trim() || sending === active.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: 'var(--color-brand)' }}
                    >
                      {sending === active.id ? '送出中…' : '送出這句話'}
                    </button>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {noteSent ? '✅ 已送出，講師會匿名念出來' : `${note.length}/200 · 匿名，不會顯示是誰`}
                    </span>
                  </div>
                </>
              ) : (
                <button onClick={() => setNoteFor(active.id)} className="text-xs underline" style={{ color: 'var(--color-text-secondary)' }}>
                  ＋ 補一句話（選填，講師會匿名念出來）
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl p-6 mb-6 border text-center" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            講師還沒出題。等他喊「開始投票」再按下面的更新，或直接往下自己投。
          </p>
          <button onClick={refresh} className="text-sm underline" style={{ color: 'var(--color-brand-light)' }}>
            {refreshing ? '更新中…' : '🔄 更新'}
          </button>
        </div>
      )}

      {/* 全部題目：講師沒出題、網路壞掉、或中途才加入時的退路 */}
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
        全部題目（跟你手上的講義同編號，可以自己先投）
      </p>
      <div className="space-y-2">
        {([3, 4] as const).map((day) => (
          <div key={day}>
            <p className="text-xs font-semibold mt-4 mb-2" style={{ color: 'var(--color-text-muted)' }}>
              {day === 3 ? 'Day 3（8/12）' : 'Day 4（8/14）'}
            </p>
            {questions
              .filter((q) => q.day === day)
              .map((q) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  open={openId === q.id}
                  picked={votes[q.id]}
                  sending={sending === q.id}
                  failed={failed === q.id}
                  onToggle={() => setOpenId((v) => (v === q.id ? null : q.id))}
                  onPick={(i) => vote(q, i)}
                />
              ))}
          </div>
        ))}
      </div>

      <p className="text-xs mt-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
        全匿名——不收姓名、email、任何身分。講師只看得到全班分布。
      </p>
    </div>
  );
}

function QuestionCard({
  q,
  open,
  picked,
  sending,
  failed,
  onToggle,
  onPick,
}: {
  q: PollQuestion;
  open: boolean;
  picked?: number;
  sending: boolean;
  failed: boolean;
  onToggle: () => void;
  onPick: (i: number) => void;
}) {
  return (
    <div className="rounded-xl border mb-2" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
      <button onClick={onToggle} className="w-full text-left px-4 py-3 flex items-center gap-2">
        <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--color-brand-light)' }}>
          {q.label}
        </span>
        <span className="text-sm flex-1">{q.text}</span>
        {picked !== undefined && <span className="text-xs shrink-0" style={{ color: '#22c55e' }}>✓ 已投</span>}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <OptionList options={q.options} picked={picked} sending={sending} onPick={onPick} />
          {failed && (
            <p className="text-xs mt-2" style={{ color: '#f87171' }}>
              送出失敗，等幾秒再點一次。
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function OptionList({
  options,
  picked,
  sending,
  onPick,
}: {
  options: string[];
  picked?: number;
  sending: boolean;
  onPick: (i: number) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const isPicked = picked === i;
        return (
          <button
            key={i}
            onClick={() => onPick(i)}
            disabled={sending}
            className="w-full text-left px-4 py-3 rounded-xl text-base border-2 transition-all disabled:opacity-60"
            style={{
              backgroundColor: isPicked ? 'var(--color-brand)' : 'var(--color-surface)',
              borderColor: isPicked ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
              color: isPicked ? '#fff' : 'var(--color-text-primary)',
            }}
          >
            {isPicked ? '✓ ' : ''}
            {opt}
          </button>
        );
      })}
      {picked !== undefined && (
        <p className="text-xs pt-1" style={{ color: 'var(--color-text-muted)' }}>
          已送出。改變主意可以直接改點別的，講師看的是你最後一次。
        </p>
      )}
    </div>
  );
}
