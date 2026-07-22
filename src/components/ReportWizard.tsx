import { useState, useEffect } from 'react';

/**
 * ReportWizard — 一鍵數據報表儀表板（教學層 / 雲端）
 * 四步引導：看原始數據 → 一鍵生成 → 儀表板(KPI+長條圖+異常+解讀) → 換自己資料。
 * 樣式吃站體設計 token，自動跟深/淺色主題。純前端、CSV 不上傳。
 */

type Point = { label: string; value: number };
type Report = {
  series: Point[]; total: number; latest: Point; mom: number | null;
  max: Point; min: Point; anomalies: { label: string; kind: 'down' | 'high'; detail: string }[];
};

const SAMPLE: Point[] = [
  { label: '2月', value: 420 },
  { label: '3月', value: 468 },
  { label: '4月', value: 455 },
  { label: '5月', value: 512 },
  { label: '6月', value: 398 },
  { label: '7月', value: 560 },
];

const K = (n: number) => '$' + Math.round(n).toLocaleString() + 'k';
const PCT = (n: number) => (n >= 0 ? '▲' : '▼') + Math.abs(n * 100).toFixed(0) + '%';

function analyze(series: Point[]): Report {
  const total = series.reduce((s, p) => s + p.value, 0);
  const latest = series[series.length - 1];
  const prev = series.length > 1 ? series[series.length - 2] : null;
  const mom = prev ? (latest.value - prev.value) / prev.value : null;
  let max = series[0], min = series[0];
  series.forEach((p) => { if (p.value > max.value) max = p; if (p.value < min.value) min = p; });
  const anomalies: Report['anomalies'] = [];
  for (let i = 1; i < series.length; i++) {
    const drop = (series[i].value - series[i - 1].value) / series[i - 1].value;
    if (drop <= -0.15) anomalies.push({ label: series[i].label, kind: 'down', detail: `較上期 ${PCT(drop)}，掉幅偏大` });
  }
  if (latest === max && series.length > 1) anomalies.push({ label: latest.label, kind: 'high', detail: '創區間新高' });
  return { series, total, latest, mom, max, min, anomalies };
}

function parseCSV(txt: string): Point[] {
  const lines = txt.trim().split(/\r?\n/).filter((l) => l.trim());
  const out: Point[] = [];
  lines.forEach((line, i) => {
    if (i === 0 && /月|date|項目|label|名稱/i.test(line)) return;
    const c = line.split(',').map((s) => s.trim());
    if (c.length < 2) return;
    const v = parseFloat(c[1].replace(/[^0-9.\-]/g, ''));
    if (isNaN(v)) return;
    out.push({ label: c[0], value: v });
  });
  return out;
}

const PROMPT = `你是數據報表助理。我會給你一份原始數據（第一欄是月份/項目，第二欄是數值）。請：
1. 算出總計、最新一期與上期的環比增減、最高與最低的期別；
2. 找出異常：任何一期較上期掉超過 15%、或創新高的，都標出來；
3. 用長條圖概念描述趨勢；
4. 最後用白話講這份數據的重點與要注意的地方。
（以下附上我的數據）`;

const NODES = [
  { icon: '📥', lb: '讀數據' },
  { icon: '➗', lb: '算指標' },
  { icon: '📈', lb: '抓趨勢' },
  { icon: '🚩', lb: '挑異常' },
  { icon: '📊', lb: '畫儀表板' },
];
const RUN_MSG = ['讀取數據 6 期…', '計算總計與環比…', '分析趨勢方向…', '標記異常期別…', '產生儀表板…'];

export default function ReportWizard() {
  const [step, setStep] = useState(1);
  const [lit, setLit] = useState(-1);
  const [report, setReport] = useState<Report | null>(null);
  const [grow, setGrow] = useState(false);
  const [own, setOwn] = useState<Point[] | null>(null);
  const [ownName, setOwnName] = useState('');
  const [copied, setCopied] = useState(false);

  function goto(n: number) {
    setStep(n);
    setTimeout(() => document.getElementById('rpw-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }

  function run() {
    goto(2); setLit(-1); setGrow(false);
    let i = 0;
    const tick = () => {
      if (i < NODES.length) { setLit(i); i++; setTimeout(tick, 680); }
      else { setReport(analyze(SAMPLE)); goto(3); }
    };
    setTimeout(tick, 200);
  }

  useEffect(() => { if (step === 3 && report) { setGrow(false); const t = setTimeout(() => setGrow(true), 80); return () => clearTimeout(t); } }, [step, report]);

  function handleFile(file?: File | null) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => { const rows = parseCSV(String(rd.result)); setOwn(rows); setOwnName(`${file.name}（${rows.length} 期）`); };
    rd.readAsText(file, 'utf-8');
  }
  function copyPrompt() { navigator.clipboard.writeText(PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }); }

  const Dashboard = ({ r }: { r: Report }) => {
    const peak = Math.max(...r.series.map((p) => p.value));
    const downLabels = new Set(r.anomalies.filter((a) => a.kind === 'down').map((a) => a.label));
    const highLabels = new Set(r.anomalies.filter((a) => a.kind === 'high').map((a) => a.label));
    return (
      <>
        <div className="rpw-kpis">
          <div className="rpw-kpi"><div className="v">{K(r.total)}</div><div className="k">總計</div></div>
          <div className={`rpw-kpi ${r.mom !== null && r.mom >= 0 ? 'up' : 'down'}`}>
            <div className="v">{r.mom !== null ? PCT(r.mom) : '—'}</div><div className="k">最新一期環比</div></div>
          <div className="rpw-kpi up"><div className="v">{r.max.label}</div><div className="k">最高 {K(r.max.value)}</div></div>
          <div className="rpw-kpi down"><div className="v">{r.min.label}</div><div className="k">最低 {K(r.min.value)}</div></div>
        </div>
        <div className="rpw-chart">
          {r.series.map((p, i) => {
            const h = grow ? Math.max(6, (p.value / peak) * 100) : 4;
            const tone = downLabels.has(p.label) ? 'bad' : highLabels.has(p.label) ? 'good' : '';
            return (
              <div className="rpw-bar-col" key={i}>
                <div className="rpw-bar-v">{K(p.value)}</div>
                <div className={`rpw-bar ${tone}`} style={{ height: h + '%' }} />
                <div className="rpw-bar-l">{p.label}</div>
              </div>
            );
          })}
        </div>
        <div className="rpw-readout">
          <b>白話解讀：</b>六期總計 {K(r.total)}，最新 {r.latest.label} {K(r.latest.value)}（環比 {r.mom !== null ? PCT(r.mom) : '—'}）。
          {r.anomalies.length > 0 ? <>有 <b>{r.anomalies.length} 個要注意</b>——</> : '整體平穩。'}
          <ul>
            {r.anomalies.map((a, i) => (
              <li key={i}><b>{a.label}</b>：{a.kind === 'down' ? '⚠️ ' : '🎉 '}{a.detail}
                {a.kind === 'down' ? '，建議往下追是哪個通路或客戶掉的。' : '，把這期做對的事記下來、複製到下一期。'}</li>
            ))}
          </ul>
        </div>
      </>
    );
  };

  const stepper = ['看數據', '一鍵生成', '儀表板', '換自己的資料'];

  return (
    <div className="rpw" id="rpw-top">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rpw-stepper">
        {stepper.map((s, i) => {
          const n = i + 1; const cls = n === step ? 'active' : n < step ? 'done' : '';
          return <div key={n} className={`rpw-st ${cls}`}><span className="n">{n}</span>{s}</div>;
        })}
      </div>

      {step === 1 && (
        <div className="rpw-card fade">
          <h2>① 這是你手上的原始數據</h2>
          <p className="sub">用一組範例：某產品線 2–7 月的月營收（千元）。平常你會把它貼進 Excel、算環比、做圖、找哪個月怪怪的——這條工作流一鍵幫你做完。</p>
          <div className="rpw-ledger">
            <table><thead><tr><th>月份</th><th className="num">營收（千）</th></tr></thead>
              <tbody>{SAMPLE.map((p, i) => <tr key={i}><td>{p.label}</td><td className="num">{p.value.toLocaleString()}</td></tr>)}</tbody></table>
          </div>
          <div className="center mt"><button className="rpw-btn" onClick={run}>一鍵生成報表　→</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="rpw-card fade">
          <h2>② AI 正在生成儀表板</h2>
          <p className="sub">拆成五個節點，一個一個跑給你看——不是黑箱。</p>
          <div className="rpw-pipeline">
            {NODES.map((nd, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="rpw-connect" />}
                <div className={`rpw-node ${i < lit ? 'done' : i === lit ? 'lit' : ''}`}>
                  <div className="dot">{i < lit ? '✓' : nd.icon}</div><div className="lb">{nd.lb}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="center muted">{lit >= 0 ? RUN_MSG[lit] : '準備中…'}</p>
        </div>
      )}

      {step === 3 && report && (
        <div className="rpw-card fade">
          <h2>③ 你的儀表板</h2>
          <p className="sub">指標、趨勢圖、異常一次到位。紅色是掉幅偏大的期、綠色是創新高。</p>
          <Dashboard r={report} />
          <div className="center mt"><button className="rpw-btn ghost" onClick={() => goto(4)}>換自己的資料試試　→</button></div>
        </div>
      )}

      {step === 4 && (
        <div className="rpw-card fade">
          <h2>④ 換成你自己的數據</h2>
          <p className="sub">丟一份 CSV（第一欄月份/項目、第二欄數值），一樣幫你算指標、抓異常、畫圖。<b>檔案不會上傳。</b></p>
          <label className="rpw-drop">📈 數據 CSV<br /><span className={ownName ? 'okc' : 'muted'}>{ownName || '點這裡選檔'}</span>
            <input type="file" accept=".csv" hidden onChange={(e) => handleFile(e.target.files?.[0])} /></label>
          <div className="center mt">
            <button className="rpw-btn" disabled={!own || own.length < 2} onClick={() => own && setReport(analyze(own))}>生成我的儀表板</button>
          </div>
          {report && own && <div className="mt fade"><Dashboard r={report} /></div>}
          <p className="privacy">🔒 教學版也不碰你的資料：CSV 只在瀏覽器內解析，關掉分頁就沒了。</p>
          <hr className="rpw-hr" />
          <h3 className="h3">想直接在 Claude 雲端跑完整版？</h3>
          <p className="muted small mb">複製這段提示詞，貼到 Claude、把你的數據附上去即可：</p>
          <div className="rpw-prompt"><button className="rpw-copy" onClick={copyPrompt}>{copied ? '已複製 ✓' : '複製'}</button>{PROMPT}</div>
          <div className="mt"><a className="rpw-btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">開啟 Claude　↗</a></div>
        </div>
      )}

      <div className="rpw-note">
        <b>🔒 這條也有地端模式</b>——真正跑在公司真實營運數據上時，同一條工作流可以在你自己的電腦上執行，資料一筆都不外流。這裡的雲端示範是給你先看懂它怎麼運作。
      </div>
    </div>
  );
}

const CSS = `
.rpw{--b:var(--color-brand);--bd:var(--color-brand-dark);--line:var(--color-surface-lighter);
  --ok:var(--color-success);--warn:var(--color-warn);--bad:var(--color-accent-stuck);--info:var(--color-info);
  --card:var(--color-surface-light);--ink:var(--color-text-primary);--grey:var(--color-text-secondary);--muted:var(--color-text-muted);
  color:var(--ink);line-height:1.7}
.rpw h2{font-size:21px;font-weight:800;margin:0 0 4px}
.rpw .sub{color:var(--grey);margin:0 0 18px;font-size:15px}
.rpw .muted{color:var(--muted)} .rpw .small{font-size:12.5px} .rpw .okc{color:var(--ok)}
.rpw .center{text-align:center} .rpw .mt{margin-top:20px} .rpw .mb{margin-bottom:6px}
.rpw-stepper{display:flex;gap:8px;margin-bottom:22px;flex-wrap:wrap}
.rpw-st{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:600;color:var(--grey);
  background:var(--card);border:1px solid var(--line);border-radius:999px;padding:7px 14px 7px 8px}
.rpw-st .n{width:24px;height:24px;border-radius:50%;background:color-mix(in srgb,var(--b) 18%,transparent);color:var(--b);display:grid;place-items:center;font-size:13px;font-weight:800}
.rpw-st.active{color:#fff;background:var(--b);border-color:var(--b)} .rpw-st.active .n{background:#fff;color:var(--b)}
.rpw-st.done{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent)} .rpw-st.done .n{background:var(--ok);color:#fff}
.rpw-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px}
.rpw-ledger{border:1px solid var(--line);border-radius:12px;overflow:hidden}
.rpw table{width:100%;border-collapse:collapse;font-size:13.5px}
.rpw th,.rpw td{text-align:left;padding:9px 14px;border-top:1px solid var(--line)}
.rpw th{color:var(--grey);font-weight:600;font-size:12.5px} .rpw td.num,.rpw th.num{text-align:right;font-variant-numeric:tabular-nums}
.rpw-btn{display:inline-flex;align-items:center;gap:9px;font-size:15.5px;font-weight:700;cursor:pointer;border:none;border-radius:12px;padding:13px 22px;background:var(--b);color:#fff;transition:.15s}
.rpw-btn:hover{background:var(--bd)} .rpw-btn:disabled{opacity:.5;cursor:not-allowed} .rpw-btn.ghost{background:transparent;color:var(--b);border:1.5px solid var(--b)}
.rpw-pipeline{display:flex;align-items:center;justify-content:center;gap:2px;flex-wrap:wrap;margin:8px 0 18px}
.rpw-node{display:flex;flex-direction:column;align-items:center;gap:7px;width:88px;text-align:center;opacity:.35;transition:.35s}
.rpw-node .dot{width:44px;height:44px;border-radius:14px;background:var(--card);border:1.5px solid var(--line);display:grid;place-items:center;font-size:19px;transition:.35s}
.rpw-node .lb{font-size:12px;font-weight:600;color:var(--grey)}
.rpw-node.lit{opacity:1} .rpw-node.lit .dot{background:color-mix(in srgb,var(--b) 15%,transparent);border-color:var(--b);box-shadow:0 0 0 5px color-mix(in srgb,var(--b) 12%,transparent)}
.rpw-node.done{opacity:1} .rpw-node.done .dot{background:var(--ok);border-color:var(--ok);color:#fff}
.rpw-connect{width:18px;height:2px;background:var(--line);margin:0 2px}
.rpw-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.rpw-kpi{border:1px solid var(--line);border-radius:12px;padding:14px 16px;background:var(--card)}
.rpw-kpi .v{font-size:22px;font-weight:850;line-height:1.1} .rpw-kpi .k{font-size:12px;color:var(--grey);margin-top:6px}
.rpw-kpi.up .v{color:var(--ok)} .rpw-kpi.down .v{color:var(--bad)}
.rpw-chart{display:flex;align-items:flex-end;gap:10px;height:200px;padding:14px 6px 0;border:1px solid var(--line);border-radius:12px;margin-bottom:20px}
.rpw-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:6px}
.rpw-bar{width:70%;max-width:46px;background:color-mix(in srgb,var(--b) 55%,var(--card));border-radius:7px 7px 0 0;transition:height .9s cubic-bezier(.2,.8,.2,1)}
.rpw-bar.bad{background:var(--bad)} .rpw-bar.good{background:var(--ok)}
.rpw-bar-v{font-size:11px;color:var(--grey);font-variant-numeric:tabular-nums} .rpw-bar-l{font-size:12px;color:var(--grey)}
.rpw-readout{margin-top:6px;background:color-mix(in srgb,var(--b) 7%,transparent);border:1px solid var(--line);border-radius:12px;padding:16px 18px;font-size:14.5px}
.rpw-readout ul{margin:8px 0 0;padding-left:20px} .rpw-readout li{margin:4px 0;color:var(--grey)}
.rpw .privacy{font-size:13px;color:var(--grey);margin-top:14px}
.rpw-drop{display:block;border:2px dashed var(--line);border-radius:12px;padding:22px;text-align:center;color:var(--grey);font-size:14px;cursor:pointer} .rpw-drop:hover{border-color:var(--b)}
.rpw-hr{border:none;border-top:1px solid var(--line);margin:26px 0} .rpw .h3{font-size:17px;margin:0 0 6px;font-weight:700}
.rpw-prompt{position:relative;background:#0f1c2e;color:#d7e3f4;border-radius:12px;padding:18px;font-size:13px;font-family:ui-monospace,Menlo,monospace;line-height:1.6;white-space:pre-wrap}
.rpw-copy{position:absolute;top:10px;right:10px;background:#26405f;color:#cfe0f5;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer}
.rpw-note{margin:36px 0 0;background:color-mix(in srgb,var(--b) 6%,transparent);border:1px solid var(--line);border-radius:14px;padding:18px 20px;font-size:14.5px;color:var(--grey);line-height:1.7}
.rpw-note b{color:var(--ink)}
.rpw .fade{animation:rpwfade .4s ease}
@keyframes rpwfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:680px){.rpw-kpis{grid-template-columns:1fr 1fr}.rpw-node{width:64px}.rpw-chart{gap:5px}}
`;
