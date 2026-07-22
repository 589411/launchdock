import { useState } from 'react';

/**
 * DocDiffWizard — 文件版本差異 / 合約 redline（教學層 / 雲端）
 * 四步：看兩版 → 一鍵比對 → redline 結果+摘要 → 換自己的文件。
 * 樣式吃站體設計 token。純前端、貼上的文字不上傳。
 */

type Clause = { title: string; status: '未變' | '修改' | '刪除' | '新增'; old?: string; neu?: string; risk?: string };

const OLD_TEXT = `付款條件：貨到 30 天內付清。
保固期：一年。
交期：下單後 14 個工作天。
逾期罰則：賣方逾交，每日賠 0.1%。`;

const NEW_TEXT = `付款條件：貨到 45 天內付清。
保固期：一年。
交期：下單後 21 個工作天。
驗收期：買方 7 天內未反映，視同驗收通過。`;

const SAMPLE: Clause[] = [
  { title: '付款條件', status: '修改', old: '貨到 30 天內付清', neu: '貨到 45 天內付清', risk: '收款延後 15 天，現金流變差' },
  { title: '保固期', status: '未變', neu: '一年' },
  { title: '交期', status: '修改', old: '下單後 14 個工作天', neu: '下單後 21 個工作天', risk: '交期拉長 7 天' },
  { title: '逾期罰則', status: '刪除', old: '賣方逾交，每日賠 0.1%', risk: '拿掉罰則＝對方晚交也沒代價' },
  { title: '驗收期', status: '新增', neu: '買方 7 天內未反映，視同驗收通過', risk: '沒即時驗收就默認過關，瑕疵難追' },
];

type DLine = { type: 'eq' | 'add' | 'del'; text: string };
function lineDiff(a: string, b: string): DLine[] {
  const A = a.split(/\r?\n/), B = b.split(/\r?\n/);
  const n = A.length, m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DLine[] = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ type: 'eq', text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'del', text: A[i] }); i++; }
    else { out.push({ type: 'add', text: B[j] }); j++; }
  }
  while (i < n) out.push({ type: 'del', text: A[i++] });
  while (j < m) out.push({ type: 'add', text: B[j++] });
  return out.filter((l) => l.text.trim());
}

const PROMPT = `你是合約／文件審閱助理。我會給你同一份文件的舊版與新版。請幫我：
1. 逐條比對，標出哪些條款「未變、修改、刪除、新增」；
2. 修改的把「改前 → 改後」列清楚；
3. 特別點出對我方不利的改動（付款、交期、罰則、驗收、責任歸屬等）；
4. 最後用白話講：這次總共實質改了幾處、哪幾處我簽之前一定要談。
（以下附上舊版與新版）`;

const NODES = [{ icon: '📄', lb: '讀舊版' }, { icon: '📃', lb: '讀新版' }, { icon: '🔍', lb: '逐條比對' }, { icon: '🖍️', lb: '標記差異' }];
const RUN_MSG = ['讀取舊版條款…', '讀取新版條款…', '逐條比對內容…', '標出增刪與修改…'];
const STY: Record<string, string> = { 未變: 'eq', 修改: 'mod', 刪除: 'del', 新增: 'add' };

export default function DocDiffWizard() {
  const [step, setStep] = useState(1);
  const [lit, setLit] = useState(-1);
  const [rows, setRows] = useState<Clause[] | null>(null);
  const [reveal, setReveal] = useState(0);
  const [oldT, setOldT] = useState('');
  const [newT, setNewT] = useState('');
  const [own, setOwn] = useState<DLine[] | null>(null);
  const [copied, setCopied] = useState(false);

  function goto(n: number) { setStep(n); setTimeout(() => document.getElementById('ddw-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); }
  function run() {
    goto(2); setLit(-1);
    let i = 0;
    const tick = () => {
      if (i < NODES.length) { setLit(i); i++; setTimeout(tick, 700); }
      else { setRows(SAMPLE); setReveal(0); goto(3); let k = 0; const t = () => { k++; setReveal(k); if (k < SAMPLE.length) setTimeout(t, 240); }; setTimeout(t, 220); }
    };
    setTimeout(tick, 200);
  }
  function copyPrompt() { navigator.clipboard.writeText(PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }); }

  const changed = rows ? rows.filter((r) => r.status !== '未變').length : 0;
  const risky = rows ? rows.filter((r) => r.risk && r.status !== '未變').length : 0;

  const stepper = ['看兩版', '一鍵比對', 'redline', '換自己的文件'];

  return (
    <div className="ddw" id="ddw-top">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ddw-stepper">
        {stepper.map((s, i) => { const n = i + 1; const cls = n === step ? 'active' : n < step ? 'done' : ''; return <div key={n} className={`ddw-st ${cls}`}><span className="n">{n}</span>{s}</div>; })}
      </div>

      {step === 1 && (
        <div className="ddw-card fade">
          <h2>① 這是同一份合約的兩個版本</h2>
          <p className="sub">左邊舊版、右邊對方回來的新版。平常你得逐條唸、比對哪裡被改了、哪裡對你不利——這條工作流幫你一次抓出來。</p>
          <div className="ddw-grid2">
            <div className="ddw-doc"><div className="dh">📄 舊版</div><pre>{OLD_TEXT}</pre></div>
            <div className="ddw-doc"><div className="dh">📃 新版（對方回稿）</div><pre>{NEW_TEXT}</pre></div>
          </div>
          <div className="center mt"><button className="ddw-btn" onClick={run}>一鍵比對兩版　→</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="ddw-card fade">
          <h2>② AI 正在逐條比對</h2>
          <p className="sub">拆成四個節點，一個一個跑給你看——不是黑箱。</p>
          <div className="ddw-pipeline">
            {NODES.map((nd, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="ddw-connect" />}
                <div className={`ddw-node ${i < lit ? 'done' : i === lit ? 'lit' : ''}`}><div className="dot">{i < lit ? '✓' : nd.icon}</div><div className="lb">{nd.lb}</div></div>
              </div>
            ))}
          </div>
          <p className="center muted">{lit >= 0 ? RUN_MSG[lit] : '準備中…'}</p>
        </div>
      )}

      {step === 3 && rows && (
        <div className="ddw-card fade">
          <h2>③ 改了哪裡，一眼看完</h2>
          <p className="sub">綠色新增、紅色刪除、黃色修改。標 ⚠️ 的是對你不利、簽之前要談的。</p>
          <div className="ddw-list">
            {rows.map((c, i) => (
              <div className={`ddw-clause ${STY[c.status]} ${reveal > i ? 'show' : 'hide'}`} key={i}>
                <div className="top"><b>{c.title}</b><span className={`ddw-badge ${STY[c.status]}`}>{c.status}</span>{c.risk && <span className="ddw-risk">⚠️ 對你不利</span>}</div>
                {c.status === '修改' && <div className="body"><span className="old">{c.old}</span> <span className="arr">→</span> <span className="new">{c.neu}</span></div>}
                {c.status === '刪除' && <div className="body"><span className="old">{c.old}</span></div>}
                {c.status === '新增' && <div className="body"><span className="new">{c.neu}</span></div>}
                {c.status === '未變' && <div className="body muted">{c.neu}</div>}
                {c.risk && <div className="note">{c.risk}</div>}
              </div>
            ))}
          </div>
          <div className="ddw-readout">
            <b>白話解讀：</b>這次實質改了 <b>{changed} 處</b>，其中 <b>{risky} 處對你不利</b>——付款延到 45 天、交期多 7 天、砍掉對方的逾期罰則、還新增「7 天不反映視同驗收」。這四條建議簽前都談，尤其罰則被拿掉那條。
          </div>
          <div className="center mt"><button className="ddw-btn ghost" onClick={() => goto(4)}>換自己的文件試試　→</button></div>
        </div>
      )}

      {step === 4 && (
        <div className="ddw-card fade">
          <h2>④ 換成你自己的兩版文件</h2>
          <p className="sub">把舊版、新版分別貼進來，幫你逐行標出增刪。<b>貼上的文字不會上傳。</b></p>
          <div className="ddw-grid2">
            <textarea className="ddw-ta" rows={7} value={oldT} onChange={(e) => setOldT(e.target.value)} placeholder="貼上舊版…" />
            <textarea className="ddw-ta" rows={7} value={newT} onChange={(e) => setNewT(e.target.value)} placeholder="貼上新版…" />
          </div>
          <div className="center mt"><button className="ddw-btn" disabled={!oldT.trim() || !newT.trim()} onClick={() => setOwn(lineDiff(oldT, newT))}>比對我的文件</button></div>
          {own && <div className="mt fade"><div className="ddw-difbox">
            {own.map((l, i) => <div key={i} className={`ddw-difl ${l.type}`}>{l.type === 'add' ? '＋ ' : l.type === 'del' ? '－ ' : '　'}{l.text}</div>)}
          </div><p className="muted small">＊教學版做逐行比對；雲端完整版（下方提示詞）由 Claude 做條款級語意比對並點出風險，準得多。</p></div>}
          <p className="privacy">🔒 貼上的文字只在瀏覽器內處理，關掉分頁就沒了。</p>
          <hr className="ddw-hr" />
          <h3 className="h3">想直接在 Claude 雲端跑完整版？</h3>
          <p className="muted small mb">複製這段提示詞，貼到 Claude、把兩版文件附上去即可：</p>
          <div className="ddw-prompt"><button className="ddw-copy" onClick={copyPrompt}>{copied ? '已複製 ✓' : '複製'}</button>{PROMPT}</div>
          <div className="mt"><a className="ddw-btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">開啟 Claude　↗</a></div>
        </div>
      )}

      <div className="ddw-note">
        <b>🔒 這條也有地端模式</b>——真正跑在公司真實合約文件上時，同一條工作流可以在你自己的電腦上執行，資料一筆都不外流。這裡的雲端示範是給你先看懂它怎麼運作。
      </div>
    </div>
  );
}

const CSS = `
.ddw{--b:var(--color-brand);--bd:var(--color-brand-dark);--line:var(--color-surface-lighter);
  --ok:var(--color-success);--warn:var(--color-warn);--bad:var(--color-accent-stuck);
  --card:var(--color-surface-light);--ink:var(--color-text-primary);--grey:var(--color-text-secondary);--muted:var(--color-text-muted);
  color:var(--ink);line-height:1.7}
.ddw h2{font-size:21px;font-weight:800;margin:0 0 4px} .ddw .sub{color:var(--grey);margin:0 0 18px;font-size:15px}
.ddw .muted{color:var(--muted)} .ddw .small{font-size:12.5px} .ddw .center{text-align:center} .ddw .mt{margin-top:20px} .ddw .mb{margin-bottom:6px}
.ddw-stepper{display:flex;gap:8px;margin-bottom:22px;flex-wrap:wrap}
.ddw-st{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:600;color:var(--grey);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:7px 14px 7px 8px}
.ddw-st .n{width:24px;height:24px;border-radius:50%;background:color-mix(in srgb,var(--b) 18%,transparent);color:var(--b);display:grid;place-items:center;font-size:13px;font-weight:800}
.ddw-st.active{color:#fff;background:var(--b);border-color:var(--b)} .ddw-st.active .n{background:#fff;color:var(--b)}
.ddw-st.done{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent)} .ddw-st.done .n{background:var(--ok);color:#fff}
.ddw-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px}
.ddw-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ddw-doc{border:1px solid var(--line);border-radius:12px;overflow:hidden}
.ddw-doc .dh{background:color-mix(in srgb,var(--b) 8%,transparent);padding:9px 14px;font-weight:700;font-size:14px}
.ddw-doc pre{margin:0;padding:14px;font-size:13px;line-height:1.8;white-space:pre-wrap;font-family:inherit;color:var(--grey)}
.ddw-btn{display:inline-flex;align-items:center;gap:9px;font-size:15.5px;font-weight:700;cursor:pointer;border:none;border-radius:12px;padding:13px 22px;background:var(--b);color:#fff;transition:.15s}
.ddw-btn:hover{background:var(--bd)} .ddw-btn:disabled{opacity:.5;cursor:not-allowed} .ddw-btn.ghost{background:transparent;color:var(--b);border:1.5px solid var(--b)}
.ddw-pipeline{display:flex;align-items:center;justify-content:center;gap:2px;flex-wrap:wrap;margin:8px 0 18px}
.ddw-node{display:flex;flex-direction:column;align-items:center;gap:7px;width:96px;text-align:center;opacity:.35;transition:.35s}
.ddw-node .dot{width:44px;height:44px;border-radius:14px;background:var(--card);border:1.5px solid var(--line);display:grid;place-items:center;font-size:19px;transition:.35s}
.ddw-node .lb{font-size:12px;font-weight:600;color:var(--grey)}
.ddw-node.lit{opacity:1} .ddw-node.lit .dot{background:color-mix(in srgb,var(--b) 15%,transparent);border-color:var(--b);box-shadow:0 0 0 5px color-mix(in srgb,var(--b) 12%,transparent)}
.ddw-node.done{opacity:1} .ddw-node.done .dot{background:var(--ok);border-color:var(--ok);color:#fff}
.ddw-connect{width:18px;height:2px;background:var(--line);margin:0 2px}
.ddw-list{display:flex;flex-direction:column;gap:10px}
.ddw-clause{border:1px solid var(--line);border-left-width:4px;border-radius:10px;padding:12px 14px;transition:.4s}
.ddw-clause.hide{opacity:0;transform:translateY(6px)} .ddw-clause.show{opacity:1;transform:none}
.ddw-clause.eq{border-left-color:var(--line)} .ddw-clause.mod{border-left-color:var(--warn)}
.ddw-clause.del{border-left-color:var(--bad)} .ddw-clause.add{border-left-color:var(--ok)}
.ddw-clause .top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px}
.ddw-badge{font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:6px}
.ddw-badge.eq{background:color-mix(in srgb,var(--muted) 22%,transparent);color:var(--grey)}
.ddw-badge.mod{background:color-mix(in srgb,var(--warn) 20%,transparent);color:var(--warn)}
.ddw-badge.del{background:color-mix(in srgb,var(--bad) 18%,transparent);color:var(--bad)}
.ddw-badge.add{background:color-mix(in srgb,var(--ok) 20%,transparent);color:var(--ok)}
.ddw-risk{font-size:11.5px;font-weight:700;color:var(--bad)}
.ddw-clause .body{font-size:14px} .ddw-clause .old{color:var(--bad);text-decoration:line-through}
.ddw-clause .new{color:var(--ok);font-weight:600} .ddw-clause .arr{color:var(--muted);margin:0 4px}
.ddw-clause .note{font-size:12.5px;color:var(--grey);margin-top:4px}
.ddw-readout{margin-top:18px;background:color-mix(in srgb,var(--b) 7%,transparent);border:1px solid var(--line);border-radius:12px;padding:16px 18px;font-size:14.5px}
.ddw-ta{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:12px;padding:14px;font-size:13.5px;background:var(--card);color:var(--ink);font-family:inherit;line-height:1.7}
.ddw-difbox{border:1px solid var(--line);border-radius:12px;overflow:hidden;font-family:ui-monospace,Menlo,monospace;font-size:13px}
.ddw-difl{padding:5px 14px;white-space:pre-wrap} .ddw-difl.add{background:color-mix(in srgb,var(--ok) 12%,transparent);color:var(--ok)}
.ddw-difl.del{background:color-mix(in srgb,var(--bad) 10%,transparent);color:var(--bad);text-decoration:line-through} .ddw-difl.eq{color:var(--grey)}
.ddw .privacy{font-size:13px;color:var(--grey);margin-top:14px}
.ddw-hr{border:none;border-top:1px solid var(--line);margin:26px 0} .ddw .h3{font-size:17px;margin:0 0 6px;font-weight:700}
.ddw-prompt{position:relative;background:#0f1c2e;color:#d7e3f4;border-radius:12px;padding:18px;font-size:13px;font-family:ui-monospace,Menlo,monospace;line-height:1.6;white-space:pre-wrap}
.ddw-copy{position:absolute;top:10px;right:10px;background:#26405f;color:#cfe0f5;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer}
.ddw-note{margin:36px 0 0;background:color-mix(in srgb,var(--b) 6%,transparent);border:1px solid var(--line);border-radius:14px;padding:18px 20px;font-size:14.5px;color:var(--grey);line-height:1.7}
.ddw-note b{color:var(--ink)}
.ddw .fade{animation:ddwfade .4s ease}
@keyframes ddwfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:680px){.ddw-grid2{grid-template-columns:1fr}.ddw-node{width:70px}}
`;
