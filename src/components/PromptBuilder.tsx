import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// ------------------------------------------------------------
// Option data — ported verbatim from launchdock-meet/prompt-builder.html
// (the single source of truth for the tool's content).
// ------------------------------------------------------------
const PAIN = [
  { id: 'verbose', p: '它老是落落長，講半天沒重點', fix: '先講結論、精簡，不要鋪陳' },
  { id: 'bullet', p: '它超愛條列和粗體，看得好累', fix: '用完整句子講、少用條列和粗體' },
  { id: 'fake', p: '它不懂裝懂，亂編還講得很肯定', fix: '沒把握就說不知道、不要編' },
  { id: 'vague', p: '它給我模稜兩可的「看情況」', fix: '別閃、直接給我立場和建議' },
  { id: 'essay', p: '它滿口「首先、其次、總之」的作文腔', fix: '講人話、不要作文腔' },
  { id: 'decide', p: '它擅自幫我做了決定', fix: '給我選項讓我自己選、不要替我決定' },
] as const;

const ROLE = [
  { id: 'write', p: '寫手（信、提案、跟進）', name: '寫手', fix: '幫我草擬信件、提案與跟進訊息' },
  { id: 'strat', p: '軍師（策略、話術）', name: '軍師', fix: '幫我想策略與話術' },
  { id: 'spar', p: '陪練（模擬對練）', name: '陪練', fix: '扮演對方跟我對練、挑我毛病' },
  { id: 'tidy', p: '整理員（雜訊變表格）', name: '整理員', fix: '把雜亂資訊整理成表格、待辦與重點' },
] as const;

const PREF = [
  { id: 'zh', p: '一律繁中、專有名詞留原文', fix: '一律用繁體中文、專有名詞保留原文' },
  { id: 'rank', p: '選項多幫我排序', fix: '選項多的話幫我排出優先順序' },
  { id: 'ask', p: '不確定先問我一句', fix: '不確定時先問我一句、不要亂猜' },
] as const;

const TUNE: Record<string, { name: string; line: string }> = {
  claude: { name: 'Claude', line: '回答精簡些，不必每次都幫我總結和延伸，該省的鋪陳就省。' },
  chatgpt: { name: 'ChatGPT', line: '少用條列和粗體、用完整句子；沒把握就明講，別硬湊出看起來很肯定的答案。' },
  gemini: { name: 'Gemini', line: '回答完整一點、別太簡略，需要時展開理由，不要只丟結論。' },
  grok: { name: 'Grok', line: '別為了搞笑或語氣而亂扯、誇大，該保守就保守；重點是準確、能用。' },
};

const CAP = { pain: 5, role: 3, pref: 3 } as const;
const PROMPT_LIMIT = 20;

const join = (a: string[]) =>
  a.length < 2 ? a.join('') : a.slice(0, -1).join('、') + '，' + a.slice(-1);

interface Selections {
  who: string;
  use: string;
  pains: string[];
  roles: string[];
  prefs: string[];
  tune: string | null;
}

interface SavedPrompt {
  id: string;
  title: string;
  body: string;
  selections: Selections;
  platform: string | null;
  updated_at: string;
}

const EMPTY: Selections = { who: '', use: '', pains: [], roles: [], prefs: ['zh'], tune: null };

// Build the prose exactly like the original core() + tune line.
function buildCore(s: Selections): string {
  const who = s.who.trim() || '＿＿＿';
  const use = s.use.trim() || '＿＿＿';
  let out = `我是${who}，常用 AI 幫我${use}。`;
  if (s.roles.length) {
    out +=
      '也請把你當成我的' +
      join(s.roles.map((id) => ROLE.find((r) => r.id === id)!.name)) +
      '：' +
      join(s.roles.map((id) => ROLE.find((r) => r.id === id)!.fix)) +
      '。';
  }
  const fixes = [
    ...s.pains.map((id) => PAIN.find((p) => p.id === id)!.fix),
    ...s.prefs.map((id) => PREF.find((p) => p.id === id)!.fix),
  ];
  if (fixes.length) out += '跟我互動時，請' + join(fixes) + '。';
  return out;
}

function buildFullText(s: Selections): string {
  let txt = buildCore(s);
  if (s.tune) txt += '\n\n' + TUNE[s.tune].line;
  return txt;
}

// Default title = first sentence of the composed prose.
function defaultTitle(s: Selections): string {
  const core = buildCore(s);
  const firstSentence = core.split('。')[0];
  return (firstSentence || core).slice(0, 60);
}

export default function PromptBuilder() {
  const [sel, setSel] = useState<Selections>(EMPTY);
  const [copied, setCopied] = useState(false);

  // Auth + saved-prompt state
  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState<SavedPrompt[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving'>('idle');
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const configured = isSupabaseConfigured();

  // --- toggling with caps ---
  const toggle = (key: 'pains' | 'roles' | 'prefs', id: string) => {
    setSel((s) => {
      const cur = s[key];
      const capKey = key === 'pains' ? 'pain' : key === 'roles' ? 'role' : 'pref';
      if (cur.includes(id)) return { ...s, [key]: cur.filter((x) => x !== id) };
      if (cur.length >= CAP[capKey]) return s;
      return { ...s, [key]: [...cur, id] };
    });
  };
  const toggleTune = (k: string) =>
    setSel((s) => ({ ...s, tune: s.tune === k ? null : k }));

  // --- auth wiring (same pattern as EventCard) ---
  const loadSaved = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('saved_prompts')
      .select('id, title, body, selections, platform, updated_at')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false });
    if (data) setSaved(data as unknown as SavedPrompt[]);
  }, []);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (cancelled) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) await loadSaved(u.id);
      else setSaved([]);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured, loadSaved]);

  const flash = (kind: 'ok' | 'err', msg: string) => {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 3200);
  };

  const core = buildCore(sel);
  const full = buildFullText(sel);

  const handleCopy = () => {
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleSave = async () => {
    // Not logged in → promo-to-login, remember where to come back.
    if (!user) {
      sessionStorage.setItem('auth-return-to', window.location.pathname);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' },
        },
      });
      return;
    }
    if (saved.length >= PROMPT_LIMIT) {
      flash('err', `已達 ${PROMPT_LIMIT} 則儲存上限，先刪掉幾則再存。`);
      return;
    }
    setSaveState('saving');
    const { error } = await supabase.from('saved_prompts').insert({
      user_id: user.id,
      title: defaultTitle(sel),
      body: full,
      selections: sel,
      platform: sel.tune,
    });
    setSaveState('idle');
    if (error) {
      // 23514 = check_violation raised by the server-side 20-cap trigger
      if (error.code === '23514' || /limit reached/i.test(error.message)) {
        flash('err', `已達 ${PROMPT_LIMIT} 則儲存上限，先刪掉幾則再存。`);
      } else {
        flash('err', `儲存失敗：${error.message}`);
      }
      return;
    }
    await loadSaved(user.id);
    flash('ok', '已儲存到「我的提示詞」。');
  };

  const handleLoad = (p: SavedPrompt) => {
    // Reload the saved selections back into the editor.
    const s = p.selections || EMPTY;
    setSel({
      who: s.who ?? '',
      use: s.use ?? '',
      pains: s.pains ?? [],
      roles: s.roles ?? [],
      prefs: s.prefs ?? ['zh'],
      tune: s.tune ?? null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    flash('ok', `已載回「${p.title}」，可以繼續改。`);
  };

  const handleDelete = async (p: SavedPrompt) => {
    if (!user) return;
    if (!window.confirm(`刪除「${p.title}」？此動作無法復原。`)) return;
    const { error } = await supabase.from('saved_prompts').delete().eq('id', p.id);
    if (error) return flash('err', `刪除失敗：${error.message}`);
    await loadSaved(user.id);
  };

  const startRename = (p: SavedPrompt) => {
    setRenamingId(p.id);
    setRenameValue(p.title);
  };
  const commitRename = async (p: SavedPrompt) => {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!user || !title || title === p.title) return;
    const { error } = await supabase
      .from('saved_prompts')
      .update({ title: title.slice(0, 200) })
      .eq('id', p.id);
    if (error) return flash('err', `重新命名失敗：${error.message}`);
    await loadSaved(user.id);
  };

  // ---------- render helpers ----------
  const chipCls = (on: boolean) =>
    `text-sm px-3.5 py-1.5 rounded-full cursor-pointer transition-colors border ${
      on
        ? 'bg-brand/15 text-brand-light border-brand/60'
        : 'bg-transparent text-text-secondary border-surface-lighter hover:border-brand/40'
    }`;

  return (
    <div>
      {/* 1. 你是誰 */}
      <Section n={1} title="你是誰" />
      <div className="rounded-xl bg-surface-light border border-surface-lighter px-5 py-4 text-text-secondary leading-loose">
        我是{' '}
        <input
          value={sel.who}
          onChange={(e) => setSel((s) => ({ ...s, who: e.target.value }))}
          placeholder="例：業務／老師／接案設計"
          className="bg-surface border-b border-brand text-text-primary font-mono text-sm px-2 py-0.5 min-w-[160px] focus:outline-none focus:border-brand-light rounded-sm"
        />
        ，常用 AI 幫我{' '}
        <input
          value={sel.use}
          onChange={(e) => setSel((s) => ({ ...s, use: e.target.value }))}
          placeholder="例：寫信、找資料、想點子"
          className="bg-surface border-b border-brand text-text-primary font-mono text-sm px-2 py-0.5 min-w-[160px] focus:outline-none focus:border-brand-light rounded-sm"
        />
        。
      </div>

      {/* 2. 痛點 */}
      <Section n={2} title="先勾你的痛" hint={`哪句戳到你就點 · 最多 ${CAP.pain}`} />
      <p className="text-text-secondary text-sm mb-2">
        用 AI 時，它是不是常這樣？勾了就變成提示詞裡的解藥。
      </p>
      <ul className="list-none">
        {PAIN.map((o) => {
          const on = sel.pains.includes(o.id);
          return (
            <li
              key={o.id}
              onClick={() => toggle('pains', o.id)}
              className={`flex gap-3 items-start py-2.5 border-t border-surface-lighter cursor-pointer select-none first:border-t-0 ${
                on ? 'text-brand-light' : 'text-text-secondary'
              }`}
            >
              <span
                className={`flex-none w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center text-xs ${
                  on ? 'bg-green-500 border-green-500 text-surface' : 'border-text-muted text-transparent'
                }`}
              >
                ✓
              </span>
              <span>
                <b className={on ? 'text-brand-light' : 'text-text-primary'}>{o.p}</b>
                <span className={`block text-xs mt-0.5 ${on ? 'text-green-400' : 'text-text-muted'}`}>
                  → {o.fix}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {/* 3. 角色 */}
      <Section n={3} title="你想要它當你的" hint={`選填 · 目前示範「業務」，更多職業陸續加入 · 最多 ${CAP.role}`} />
      <div className="flex flex-wrap gap-2">
        {ROLE.map((o) => (
          <button key={o.id} onClick={() => toggle('roles', o.id)} className={chipCls(sel.roles.includes(o.id))}>
            {o.p}
          </button>
        ))}
      </div>

      {/* 4. 偏好 */}
      <Section n={4} title="一些偏好" hint={`直接挑 · 最多 ${CAP.pref}`} />
      <div className="flex flex-wrap gap-2">
        {PREF.map((o) => (
          <button key={o.id} onClick={() => toggle('prefs', o.id)} className={chipCls(sel.prefs.includes(o.id))}>
            {o.p}
          </button>
        ))}
      </div>

      {/* 5. 微調 */}
      <Section n={5} title="針對你這次要貼的 AI 微調" hint="選填 · 點一家" />
      <p className="text-text-secondary text-sm mb-2">同一段哪家都能貼；想更順手，點你這次要貼的那家。</p>
      <div className="flex flex-wrap gap-2">
        {Object.keys(TUNE).map((k) => (
          <button key={k} onClick={() => toggleTune(k)} className={chipCls(sel.tune === k)}>
            {TUNE[k].name}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-2">四家個性會變，這幾句以你自己的實測為準。</p>

      {/* Output */}
      <div className="sticky bottom-0 mt-7 pt-3.5 border-t border-surface-lighter bg-surface">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">組出來的系統提示詞</span>
          <button
            onClick={handleCopy}
            className={`font-mono text-sm px-4 py-1.5 rounded-lg font-semibold transition-colors ${
              copied ? 'bg-green-500 text-white' : 'bg-brand hover:bg-brand-dark text-white'
            }`}
          >
            {copied ? '已複製 ✓' : '複製'}
          </button>
        </div>
        <div className="font-mono text-sm leading-relaxed bg-surface-light border border-surface-lighter rounded-xl px-4 py-3.5">
          <div className="whitespace-pre-wrap text-text-primary">{core}</div>
          {sel.tune && (
            <div className="whitespace-pre-wrap text-text-secondary mt-3 pt-3 border-t border-dashed border-surface-lighter">
              （貼到 {TUNE[sel.tune].name} 時，再加這句）{'\n'}
              {TUNE[sel.tune].line}
            </div>
          )}
        </div>

        {/* Save row — locked action, tool itself stays free */}
        {configured && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="text-sm px-4 py-1.5 rounded-lg font-semibold border border-brand/50 text-brand-light hover:bg-brand/10 disabled:opacity-50 transition-colors"
            >
              {saveState === 'saving' ? '儲存中…' : user ? '💾 儲存這段' : '💾 登入以儲存'}
            </button>
            {user && (
              <span className="text-xs text-text-muted">
                已存 {saved.length}/{PROMPT_LIMIT} 則
              </span>
            )}
            {!user && <span className="text-xs text-text-muted">用 Google 一鍵登入，把常用的提示詞存起來</span>}
            {notice && (
              <span className={`text-xs ${notice.kind === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                {notice.msg}
              </span>
            )}
          </div>
        )}
      </div>

      {/* My prompts (logged in) */}
      {configured && user && (
        <div className="mt-10 pt-6 border-t border-surface-lighter">
          <h2 className="text-lg font-bold mb-3">我的提示詞</h2>
          {saved.length === 0 ? (
            <p className="text-text-muted text-sm">還沒有存過提示詞，組一段、按「儲存這段」試試 🦆</p>
          ) : (
            <ul className="grid gap-3">
              {saved.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl bg-surface-light border border-surface-lighter px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {renamingId === p.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(p)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename(p);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          className="w-full bg-surface border-b border-brand text-text-primary text-sm px-1 py-0.5 focus:outline-none"
                        />
                      ) : (
                        <p className="font-medium text-text-primary text-sm truncate">{p.title}</p>
                      )}
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{p.body}</p>
                      {p.platform && (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-brand/15 text-brand-light">
                          {TUNE[p.platform]?.name ?? p.platform}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-none text-xs">
                      <button onClick={() => handleLoad(p)} className="text-brand-light hover:underline">
                        載回編輯
                      </button>
                      <button onClick={() => startRename(p)} className="text-text-secondary hover:text-text-primary">
                        重新命名
                      </button>
                      <button onClick={() => handleDelete(p)} className="text-text-muted hover:text-red-400">
                        刪除
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-text-muted">
        貼在哪裡？看藍鴨教學：{' '}
        <a href="/articles/set-system-prompt/" className="text-brand-light hover:underline">
          四家系統提示詞設定指南 →
        </a>
        　🦆 弄髒雙手，但不孤單。
      </p>
    </div>
  );
}

function Section({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <h2 className="flex items-baseline gap-2.5 flex-wrap text-base font-semibold mt-7 mb-1">
      <span className="flex-none font-mono text-xs bg-brand text-white w-[22px] h-[22px] rounded-md inline-flex items-center justify-center">
        {n}
      </span>
      {title}
      {hint && <span className="text-xs text-text-muted font-normal">{hint}</span>}
    </h2>
  );
}
