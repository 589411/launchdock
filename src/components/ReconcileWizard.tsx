import { useState } from 'react';

/**
 * ReconcileWizard — 對帳工作流互動示範（教學層 / 雲端）
 * 四步引導：選情境 → 一鍵比對 → 結果+解讀 → 換自己資料。
 * 樣式吃站體設計 token（var(--color-*)），自動跟深/淺色主題。
 * 底部交棒地端版。純前端、CSV 不上傳。
 */

type Row = { d: string; m: string; a: number };
type ResultRow = {
  s: string; cls: string; flag: 'ok' | 'bad' | 'warn';
  m: string; bk: number | null; bn: number | null; note: string;
};
type Recon = { rows: ResultRow[]; ok: number; mis: number; bkOnly: number; bnOnly: number };

const BOOK: Row[] = [
  { d: '07/03', m: '日昇貿易 貨款', a: 128500 },
  { d: '07/06', m: '宏達五金 貨款', a: 12500 },
  { d: '07/09', m: '永豐材料 貨款', a: 64200 },
  { d: '07/14', m: '新和企業 貨款', a: 38900 },
  { d: '07/20', m: '立群科技 貨款', a: 91000 },
  { d: '07/25', m: '大有實業 貨款', a: 47600 },
];
const BANK: Row[] = [
  { d: '07/03', m: '日昇貿易 貨款', a: 128500 },
  { d: '07/06', m: '宏達五金 貨款', a: 12050 },
  { d: '07/09', m: '永豐材料 貨款', a: 64200 },
  { d: '07/15', m: '新和企業 貨款', a: 38900 },
  { d: '07/25', m: '大有實業 貨款', a: 47600 },
  { d: '07/31', m: '帳戶管理費', a: -150 },
];

const NT = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString();
const dnum = (s: string) => parseInt(s.replace('/', ''), 10) || 0;

function reconcile(bk: Row[], bn: Row[]): Recon {
  const pool = bn.map((r) => ({ ...r, used: false }));
  const rows: ResultRow[] = [];
  let ok = 0, mis = 0, bkOnly = 0, bnOnly = 0;
  bk.forEach((b) => {
    const hit = pool.find((x) => !x.used && x.m === b.m);
    if (hit) {
      hit.used = true;
      if (hit.a === b.a) {
        const shift = dnum(hit.d) !== dnum(b.d);
        ok++;
        rows.push({ s: shift ? '相符*' : '相符', cls: shift ? 'rwarn' : 'rok', flag: shift ? 'warn' : 'ok',
          m: b.m, bk: b.a, bn: hit.a, note: shift ? `日期差（${b.d}→${hit.d}），金額相符，視為同一筆` : '金額一致' });
      } else {
        mis++;
        rows.push({ s: '金額不符', cls: 'rbad', flag: 'bad', m: b.m, bk: b.a, bn: hit.a,
          note: `差 ${NT(Math.abs(b.a - hit.a))}，需查是打錯還是折讓` });
      }
    } else {
      bkOnly++;
      rows.push({ s: '只在內部帳', cls: 'rbad', flag: 'bad', m: b.m, bk: b.a, bn: null,
        note: '銀行還沒進帳，可能未入帳或跳票' });
    }
  });
  pool.filter((x) => !x.used).forEach((x) => {
    bnOnly++;
    rows.push({ s: '只在銀行', cls: 'rbad', flag: 'bad', m: x.m, bk: null, bn: x.a,
      note: '內部帳沒記到，常見是手續費／利息' });
  });
  rows.sort((a, b) => (a.flag === 'ok' ? 1 : 0) - (b.flag === 'ok' ? 1 : 0));
  return { rows, ok, mis, bkOnly, bnOnly };
}

function parseCSV(txt: string): Row[] {
  const lines = txt.trim().split(/\r?\n/).filter((l) => l.trim());
  const out: Row[] = [];
  lines.forEach((line, i) => {
    if (i === 0 && /日期|date|摘要/i.test(line)) return;
    const c = line.split(',').map((s) => s.trim());
    if (c.length < 3) return;
    const a = parseFloat(c[2].replace(/[^0-9.\-]/g, ''));
    if (isNaN(a)) return;
    out.push({ d: c[0], m: c[1], a });
  });
  return out;
}

const PROMPT = `你是對帳助理。我會給你兩份帳：一份「內部帳」、一份「銀行對帳單」，欄位為日期、摘要、金額。請：
1. 以摘要與金額逐筆比對；
2. 分成四類列出：相符、金額不符、只在內部帳、只在銀行帳；
3. 金額不符的標出差多少；日期差 1–2 天但金額摘要相符的視為相符並註記；
4. 最後用白話講哪幾筆要人工處理、可能原因。
（以下附上我的兩份帳）`;

const NODES = [
  { icon: '📗', lb: '讀取內部帳' },
  { icon: '🏦', lb: '讀取銀行帳' },
  { icon: '🔎', lb: '逐筆比對' },
  { icon: '🚩', lb: '標記差異' },
];
const RUN_MSG = ['讀取內部帳 6 筆…', '讀取銀行對帳單 6 筆…', '逐筆比對摘要與金額…', '標記對不上的項目…'];

export default function ReconcileWizard() {
  const [step, setStep] = useState(1);
  const [lit, setLit] = useState(-1);
  const [result, setResult] = useState<Recon | null>(null);
  const [own, setOwn] = useState<{ 1: Row[] | null; 2: Row[] | null }>({ 1: null, 2: null });
  const [ownNames, setOwnNames] = useState<{ 1: string; 2: string }>({ 1: '', 2: '' });
  const [ownResult, setOwnResult] = useState<Recon | null>(null);
  const [copied, setCopied] = useState(false);

  function goto(n: number) {
    setStep(n);
    setTimeout(() => document.getElementById('rcw-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }

  function run() {
    goto(2);
    setLit(-1);
    let i = 0;
    const tick = () => {
      if (i < NODES.length) { setLit(i); i++; setTimeout(tick, 760); }
      else { setResult(reconcile(BOOK, BANK)); setTimeout(() => goto(3), 380); }
    };
    setTimeout(tick, 200);
  }

  function handleFile(slot: 1 | 2, file?: File | null) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const rows = parseCSV(String(rd.result));
      setOwn((p) => ({ ...p, [slot]: rows }));
      setOwnNames((p) => ({ ...p, [slot]: `${file.name}（${rows.length} 筆）` }));
    };
    rd.readAsText(file, 'utf-8');
  }

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }

  const Ledger = ({ title, rows, count }: { title: string; rows: Row[]; count: string }) => (
    <div className="rcw-ledger">
      <div className="rcw-lh"><span>{title}</span><span>{count}</span></div>
      <table><thead><tr><th>日期</th><th>摘要</th><th className="num">金額</th></tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}><td>{r.d}</td><td>{r.m}</td><td className="num">{NT(r.a)}</td></tr>
        ))}</tbody></table>
    </div>
  );

  const Kpis = ({ r }: { r: Recon }) => (
    <div className="rcw-kpis">
      <div className="rcw-kpi ok"><div className="v">{r.ok}</div><div className="k">相符</div></div>
      <div className="rcw-kpi bad"><div className="v">{r.mis}</div><div className="k">金額不符</div></div>
      <div className="rcw-kpi warn"><div className="v">{r.bkOnly}</div><div className="k">只在內部帳</div></div>
      <div className="rcw-kpi blue"><div className="v">{r.bnOnly}</div><div className="k">只在銀行</div></div>
    </div>
  );

  const ResultTable = ({ r }: { r: Recon }) => (
    <div className="rcw-ledger">
      <table><thead><tr><th>狀態</th><th>摘要</th><th className="num">內部帳</th><th className="num">銀行帳</th><th>說明</th></tr></thead>
        <tbody>{r.rows.map((x, i) => (
          <tr key={i} className={x.cls}>
            <td><span className={`rcw-flag ${x.flag}`}>{x.s}</span></td>
            <td>{x.m}</td>
            <td className="num">{x.bk === null ? '—' : NT(x.bk)}</td>
            <td className="num">{x.bn === null ? '—' : NT(x.bn)}</td>
            <td className="muted small">{x.note}</td>
          </tr>
        ))}</tbody></table>
    </div>
  );

  const stepper = ['選情境', '一鍵比對', '看結果', '換自己的資料'];

  return (
    <div className="rcw" id="rcw-top">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="rcw-stepper">
        {stepper.map((s, i) => {
          const n = i + 1;
          const cls = n === step ? 'active' : n < step ? 'done' : '';
          return <div key={n} className={`rcw-st ${cls}`}><span className="n">{n}</span>{s}</div>;
        })}
      </div>

      {step === 1 && (
        <div className="rcw-card fade">
          <h2>① 這是要對的兩份帳</h2>
          <p className="sub">用一組範例：左邊是公司自己記的「內部帳」，右邊是「銀行對帳單」。金額對得起來就好，對不起來就是要抓的問題。</p>
          <div className="rcw-grid2">
            <Ledger title="📗 內部帳（公司自己記）" rows={BOOK} count={`${BOOK.length} 筆`} />
            <Ledger title="🏦 銀行對帳單" rows={BANK} count={`${BANK.length} 筆`} />
          </div>
          <div className="center mt"><button className="rcw-btn" onClick={run}>開始比對　→</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="rcw-card fade">
          <h2>② AI 正在逐筆比對</h2>
          <p className="sub">這條工作流拆成四個節點，一個一個跑給你看——不是黑箱。</p>
          <div className="rcw-pipeline">
            {NODES.map((nd, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="rcw-connect" />}
                <div className={`rcw-node ${i < lit ? 'done' : i === lit ? 'lit' : ''}`}>
                  <div className="dot">{i < lit ? '✓' : nd.icon}</div>
                  <div className="lb">{nd.lb}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="center muted">{lit >= 0 ? RUN_MSG[lit] : '準備中…'}</p>
        </div>
      )}

      {step === 3 && result && (
        <div className="rcw-card fade">
          <h2>③ 對完了，這幾筆要看</h2>
          <p className="sub">相符的放過，剩下三種狀況就是月底會兜不平的元凶。</p>
          <Kpis r={result} />
          <ResultTable r={result} />
          <div className="rcw-readout">
            <b>白話解讀：</b>共 {result.ok + result.mis + result.bkOnly + result.bnOnly} 筆，{result.ok} 筆自動對上，
            <b>{result.mis + result.bkOnly + result.bnOnly} 筆要人工看</b>——
            <ul>
              <li><b>宏達五金</b>：內部記 12,500、銀行只有 12,050，<b>差 450</b>，多半是 key 錯或有折讓。</li>
              <li><b>立群科技 91,000</b>：內部帳有、銀行沒進帳——這筆錢還沒到，追款或確認是否跳票。</li>
              <li><b>帳戶管理費 -150</b>：銀行扣了、內部帳漏記，補一筆費用就平了。</li>
              <li><b>新和企業</b>：金額摘要都對、只差一天入帳，系統已自動當同一筆，免處理。</li>
            </ul>
          </div>
          <div className="center mt"><button className="rcw-btn ghost" onClick={() => goto(4)}>換自己的資料試試　→</button></div>
        </div>
      )}

      {step === 4 && (
        <div className="rcw-card fade">
          <h2>④ 換成你自己的帳</h2>
          <p className="sub">丟兩個 CSV（欄位：日期、摘要、金額），一樣幫你比。這一步全在你的瀏覽器裡跑，<b>檔案不會上傳到任何地方</b>。</p>
          <div className="rcw-grid2">
            {([1, 2] as const).map((slot) => (
              <label key={slot} className="rcw-drop">
                {slot === 1 ? '📗 內部帳 CSV' : '🏦 銀行帳 CSV'}<br />
                <span className={ownNames[slot] ? 'okc' : 'muted'}>{ownNames[slot] || '點這裡選檔'}</span>
                <input type="file" accept=".csv" hidden onChange={(e) => handleFile(slot, e.target.files?.[0])} />
              </label>
            ))}
          </div>
          <div className="center mt">
            <button className="rcw-btn" disabled={!(own[1] && own[2])}
              onClick={() => own[1] && own[2] && setOwnResult(reconcile(own[1], own[2]))}>比對我的資料</button>
          </div>
          {ownResult && <div className="mt fade"><Kpis r={ownResult} /><ResultTable r={ownResult} /></div>}
          <p className="privacy">🔒 教學版也不碰你的資料：CSV 只在瀏覽器內解析，關掉分頁就沒了。</p>

          <hr className="rcw-hr" />
          <h3 className="h3">想直接在 Claude 雲端跑完整版？</h3>
          <p className="muted small mb">複製這段提示詞，貼到 Claude、把你的兩份帳附上去即可：</p>
          <div className="rcw-prompt">
            <button className="rcw-copy" onClick={copyPrompt}>{copied ? '已複製 ✓' : '複製'}</button>{PROMPT}
          </div>
          <div className="mt"><a className="rcw-btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">開啟 Claude　↗</a></div>
        </div>
      )}

      <div className="rcw-note">
        <b>🔒 這條也有地端模式</b>——真正跑在公司帳務上時，同一條工作流可以在你自己的電腦上執行，資料一筆都不外流。這裡的雲端示範是給你先看懂它怎麼運作。
      </div>
    </div>
  );
}

const CSS = `
.rcw{--b:var(--color-brand);--bd:var(--color-brand-dark);--line:var(--color-surface-lighter);
  --ok:var(--color-success);--warn:var(--color-warn);--bad:var(--color-accent-stuck);--info:var(--color-info);
  --card:var(--color-surface-light);--ink:var(--color-text-primary);--grey:var(--color-text-secondary);--muted:var(--color-text-muted);
  color:var(--ink);line-height:1.7}
.rcw h2{font-size:21px;font-weight:800;margin:0 0 4px}
.rcw .sub{color:var(--grey);margin:0 0 18px;font-size:15px}
.rcw .muted{color:var(--muted)} .rcw .small{font-size:12.5px} .rcw .okc{color:var(--ok)}
.rcw .center{text-align:center} .rcw .mt{margin-top:20px} .rcw .mb{margin-bottom:6px}
.rcw-stepper{display:flex;gap:8px;margin-bottom:22px;flex-wrap:wrap}
.rcw-st{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:600;color:var(--grey);
  background:var(--card);border:1px solid var(--line);border-radius:999px;padding:7px 14px 7px 8px}
.rcw-st .n{width:24px;height:24px;border-radius:50%;background:color-mix(in srgb,var(--b) 18%,transparent);
  color:var(--b);display:grid;place-items:center;font-size:13px;font-weight:800}
.rcw-st.active{color:#fff;background:var(--b);border-color:var(--b)} .rcw-st.active .n{background:#fff;color:var(--b)}
.rcw-st.done{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent)}
.rcw-st.done .n{background:var(--ok);color:#fff}
.rcw-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px}
.rcw-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rcw-ledger{border:1px solid var(--line);border-radius:12px;overflow:hidden}
.rcw-lh{background:color-mix(in srgb,var(--b) 8%,transparent);padding:10px 14px;font-weight:700;font-size:14px;display:flex;justify-content:space-between}
.rcw table{width:100%;border-collapse:collapse;font-size:13.5px}
.rcw th,.rcw td{text-align:left;padding:9px 14px;border-top:1px solid var(--line)}
.rcw th{color:var(--grey);font-weight:600;font-size:12.5px}
.rcw td.num,.rcw th.num{text-align:right;font-variant-numeric:tabular-nums}
.rcw-btn{display:inline-flex;align-items:center;gap:9px;font-size:15.5px;font-weight:700;cursor:pointer;border:none;
  border-radius:12px;padding:13px 22px;background:var(--b);color:#fff;transition:.15s}
.rcw-btn:hover{background:var(--bd)} .rcw-btn:disabled{opacity:.5;cursor:not-allowed}
.rcw-btn.ghost{background:transparent;color:var(--b);border:1.5px solid var(--b)}
.rcw-btn.light{background:#fff;color:var(--bd)}
.rcw-pipeline{display:flex;align-items:center;justify-content:center;gap:2px;flex-wrap:wrap;margin:8px 0 18px}
.rcw-node{display:flex;flex-direction:column;align-items:center;gap:7px;width:100px;text-align:center;opacity:.35;transition:.35s}
.rcw-node .dot{width:46px;height:46px;border-radius:14px;background:var(--card);border:1.5px solid var(--line);
  display:grid;place-items:center;font-size:20px;transition:.35s}
.rcw-node .lb{font-size:12.5px;font-weight:600;color:var(--grey)}
.rcw-node.lit{opacity:1} .rcw-node.lit .dot{background:color-mix(in srgb,var(--b) 15%,transparent);border-color:var(--b);
  box-shadow:0 0 0 5px color-mix(in srgb,var(--b) 12%,transparent)}
.rcw-node.done{opacity:1} .rcw-node.done .dot{background:var(--ok);border-color:var(--ok);color:#fff}
.rcw-connect{width:22px;height:2px;background:var(--line);margin:0 2px}
.rcw-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.rcw-kpi{border:1px solid var(--line);border-radius:12px;padding:14px 16px;background:var(--card)}
.rcw-kpi .v{font-size:26px;font-weight:850;line-height:1} .rcw-kpi .k{font-size:12.5px;color:var(--grey);margin-top:6px}
.rcw-kpi.ok .v{color:var(--ok)} .rcw-kpi.bad .v{color:var(--bad)} .rcw-kpi.warn .v{color:var(--warn)} .rcw-kpi.blue .v{color:var(--info)}
.rcw tr.rok{background:color-mix(in srgb,var(--ok) 9%,transparent)}
.rcw tr.rbad{background:color-mix(in srgb,var(--bad) 9%,transparent)}
.rcw tr.rwarn{background:color-mix(in srgb,var(--warn) 10%,transparent)}
.rcw-flag{font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:6px;white-space:nowrap}
.rcw-flag.ok{background:color-mix(in srgb,var(--ok) 20%,transparent);color:var(--ok)}
.rcw-flag.bad{background:color-mix(in srgb,var(--bad) 18%,transparent);color:var(--bad)}
.rcw-flag.warn{background:color-mix(in srgb,var(--warn) 20%,transparent);color:var(--warn)}
.rcw-readout{margin-top:18px;background:color-mix(in srgb,var(--b) 7%,transparent);border:1px solid var(--line);border-radius:12px;padding:16px 18px;font-size:14.5px}
.rcw-readout ul{margin:8px 0 0;padding-left:20px} .rcw-readout li{margin:4px 0;color:var(--grey)}
.rcw .privacy{font-size:13px;color:var(--grey);margin-top:14px}
.rcw-drop{display:block;border:2px dashed var(--line);border-radius:12px;padding:22px;text-align:center;color:var(--grey);font-size:14px;cursor:pointer}
.rcw-drop:hover{border-color:var(--b)}
.rcw-hr{border:none;border-top:1px solid var(--line);margin:26px 0} .rcw .h3{font-size:17px;margin:0 0 6px;font-weight:700}
.rcw-prompt{position:relative;background:#0f1c2e;color:#d7e3f4;border-radius:12px;padding:18px;font-size:13px;
  font-family:ui-monospace,Menlo,monospace;line-height:1.6;white-space:pre-wrap}
.rcw-copy{position:absolute;top:10px;right:10px;background:#26405f;color:#cfe0f5;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer}
.rcw-note{margin:36px 0 0;background:color-mix(in srgb,var(--b) 6%,transparent);border:1px solid var(--line);
  border-radius:14px;padding:18px 20px;font-size:14.5px;color:var(--grey);line-height:1.7}
.rcw-note b{color:var(--ink)}
.rcw .fade{animation:rcwfade .4s ease}
@keyframes rcwfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:680px){.rcw-grid2{grid-template-columns:1fr}.rcw-kpis{grid-template-columns:1fr 1fr}}
`;
