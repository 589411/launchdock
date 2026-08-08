import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { warmupQuestion, questions, industries, OTHER_INDUSTRY, INDUSTRY_MAX_LEN } from '../data/class-poll';
import type { PollActiveQuestion } from '../lib/supabase-types';

// ============================================================
// 課堂即時投票 — 學員端
// ------------------------------------------------------------
// 設計要點：
//   1. **一次只看得到一題。** 投票是「課程中間停下來的互動」，不是問卷——
//      八題一次列出來，學員會走馬看花地一路投完，然後整堂課的互動點就沒了。
//      畫面最上面標明「Day 3 · 段 2 · N1 商品關聯」，學員一眼知道自己在哪一段。
//   2. **不輪詢。** 即時是投影給全班看的，不是給學員看的。
//      講師口頭喊「請重新整理」，學員按一下按鈕就好——
//      學員端也輪詢的話，一堂課 75 萬次請求。
//   3. 全匿名，不需登入。participant_id 只存在自己的瀏覽器。
//   4. **一鍵投票**：點選項即送出，不必再按確認。30 秒內全班到齊。
//      想補一句話的人再展開選填欄（講師會匿名念出來）。
//   5. 講師按「停下來討論」後，選項收起、改顯示討論題——
//      **這是節奏用的畫面狀態，不是權限**（場次整堂課都不能關，見 runbook 紅線）。
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

/** 題號徽章（Q3…Q10）——跟學員手上的講義同一組編號 */
const PRESETS = [warmupQuestion, ...questions];

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
  const [industryTyping, setIndustryTyping] = useState(false);
  const [industryDraft, setIndustryDraft] = useState('');
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
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

  const enterCode = (v: string) => {
    if (!v.trim()) return;
    setCode(v.trim());
    setStatus('loading');
    void resolve(v);
  };

  async function refresh() {
    if (!code) return;
    setRefreshing(true);
    const before = session?.active?.id;
    await resolve(code);
    setRefreshing(false);
    // 換題了才清掉留言框，否則學員打到一半按更新會被清空
    if (session?.active?.id !== before) {
      setNoteOpen(false);
      setNote('');
      setNoteSent(false);
    }
  }

  function saveIndustry(v: string) {
    setIndustry(v);
    try {
      localStorage.setItem(INDUSTRY_KEY, v);
    } catch {
      /* ignore */
    }
  }

  // ── 投票 ────────────────────────────────────────────────
  async function vote(q: PollActiveQuestion, idx: number, withNote?: string) {
    if (!session) return;
    setSending(true);
    setFailed(false);
    const { error } = await supabase.from('poll_responses').insert({
      session_id: session.id,
      participant_id: getParticipantId(),
      question_id: q.id,
      choice_index: idx,
      choice_text: q.options[idx] ?? String(idx),
      note: withNote?.trim() ? withNote.trim().slice(0, 200) : null,
      industry: industry || null,
    });
    setSending(false);
    if (error) {
      setFailed(true);
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
            onKeyDown={(e) => e.key === 'Enter' && enterCode(codeInput)}
            placeholder="課堂代碼"
            className="flex-1 px-3 py-3 rounded-lg text-center text-lg tracking-[0.2em] border"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
          />
          <button
            onClick={() => enterCode(codeInput)}
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

  // 業態還沒選 → 先問業態（只有第一次），問完才進投票
  if (!industry) {
    return (
      <div className="py-6">
        <p className="text-lg font-bold mb-1">先選一次你的業態</p>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          整堂課只問這一次。講師會用它做<b>跨業態對照</b>——同一個問題，你這行和隔壁行的答案常常差很多，
          那個落差就是這堂課最有價值的部分。
        </p>
        <div className="flex flex-wrap gap-2">
          {industries.map((v) => (
            <button
              key={v}
              onClick={() => saveIndustry(v)}
              className="px-3 py-2.5 rounded-lg text-sm border transition-all"
              style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
            >
              {v}
            </button>
          ))}
          <button
            onClick={() => setIndustryTyping(true)}
            className="px-3 py-2.5 rounded-lg text-sm border transition-all"
            style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-secondary)' }}
          >
            ✏️ {OTHER_INDUSTRY}（自己打）
          </button>
        </div>
        {industryTyping && (
          <div className="flex gap-2 mt-4">
            <input
              autoFocus
              value={industryDraft}
              onChange={(e) => setIndustryDraft(e.target.value.slice(0, INDUSTRY_MAX_LEN))}
              onKeyDown={(e) => e.key === 'Enter' && industryDraft.trim() && saveIndustry(industryDraft.trim())}
              placeholder="例：寵物用品、房仲、水電工程"
              className="flex-1 px-3 py-2.5 rounded-lg text-sm border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)', color: 'var(--color-text-primary)' }}
            />
            <button
              onClick={() => industryDraft.trim() && saveIndustry(industryDraft.trim())}
              disabled={!industryDraft.trim()}
              className="px-4 rounded-lg text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              確定
            </button>
          </div>
        )}
      </div>
    );
  }

  const active = session.active;
  const preset = active ? PRESETS.find((q) => q.id === active.id) : undefined;
  const segment = active?.segment ?? preset?.segment;
  const discuss = active?.discuss ?? preset?.discuss;
  const picked = active ? votes[active.id] : undefined;
  const locked = !!active?.locked;

  return (
    <div>
      {/* 等講師出題 */}
      {!active ? (
        <div className="rounded-2xl p-8 my-8 border text-center" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' }}>
          <p className="text-3xl mb-3">⏳</p>
          <p className="text-base font-semibold mb-2">等講師出題</p>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
            投票會跟著課程一段一段來。講師喊「開始投票」的時候，按下面更新。
          </p>
          <button
            onClick={refresh}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            {refreshing ? '更新中…' : '🔄 更新'}
          </button>
        </div>
      ) : (
        <>
          {/* 這一題掛在課程的哪一段 */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface-lighter)', color: 'var(--color-text-secondary)' }}>
              {segment ?? '課堂投票'}
            </span>
            <button onClick={refresh} className="text-xs underline" style={{ color: 'var(--color-text-muted)' }}>
              {refreshing ? '更新中…' : '🔄 換題了？點我更新'}
            </button>
          </div>

          <div className="rounded-2xl p-5 border-2" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: locked ? '#f59e0b' : 'var(--color-brand)' }}>
            {preset && (
              <span className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-3" style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}>
                {preset.label}
              </span>
            )}
            <p className="text-xl font-bold mb-4 leading-snug">{active.text}</p>

            {locked ? (
              /* 討論階段：收起選項，把全班的注意力拉回討論 */
              <div>
                <div className="rounded-xl px-4 py-4 mb-3" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#f59e0b' }}>💬 投票結束，現在全班討論</p>
                  {discuss && <p className="text-base leading-relaxed">{discuss}</p>}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {picked !== undefined ? `你選的是：${active.options[picked] ?? ''}` : '你這題沒有投到。'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {active.options.map((opt, i) => {
                    const isPicked = picked === i;
                    return (
                      <button
                        key={i}
                        onClick={() => vote(active, i)}
                        disabled={sending}
                        className="w-full text-left px-4 py-4 rounded-xl text-base border-2 transition-all disabled:opacity-60"
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
                </div>

                {failed && (
                  <p className="text-xs mt-3" style={{ color: '#f87171' }}>
                    送出失敗，可能是網路不穩。等幾秒再點一次就好；若一直失敗請告訴講師。
                  </p>
                )}

                {picked !== undefined && (
                  <>
                    <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
                      已送出。改變主意可以直接改點別的，講師看的是你最後一次。
                    </p>
                    <div className="mt-4">
                      {noteOpen ? (
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
                              onClick={() => vote(active, picked, note)}
                              disabled={!note.trim() || sending}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                              style={{ backgroundColor: 'var(--color-brand)' }}
                            >
                              {sending ? '送出中…' : '送出這句話'}
                            </button>
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {noteSent ? '✅ 已送出，講師會匿名念出來' : `${note.length}/200 · 匿名，不會顯示是誰`}
                            </span>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => setNoteOpen(true)} className="text-xs underline" style={{ color: 'var(--color-text-secondary)' }}>
                          ＋ 補一句話（選填，講師會匿名念出來）
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* 業態（選好之後縮成一行，可改） */}
      <div className="flex items-center justify-center gap-2 mt-8 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>你的業態：{industry}</span>
        <button onClick={() => { saveIndustry(''); setIndustryTyping(false); setIndustryDraft(''); }} className="underline">
          改
        </button>
      </div>
      <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
        全匿名——不收姓名、email、任何身分。講師只看得到全班分布。
      </p>
    </div>
  );
}
