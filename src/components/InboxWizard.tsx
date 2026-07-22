import { useState } from 'react';

/**
 * InboxWizard — 郵件/訊息結構化追蹤（教學層 / 雲端）
 * 四步：看原始訊息 → 一鍵結構化 → 追蹤表(抽欄位) → 換自己的訊息。
 * 樣式吃站體設計 token。純前端、貼上的文字不上傳。
 */

type Item = { from: string; type: string; todo: string; due: string; amount: string; urgent?: boolean };

const RAW = [
  '王經理 來信：下週三（7/29）前確認這批報價單，金額約 12 萬，麻煩回覆是否接單。',
  '客服轉來：客戶反映上一批貨少了 2 箱，要求本週內補寄，否則要退單。',
  '會計提醒：7/25 要繳這個月貨款尾款 8.5 萬，別忘了。',
  '供應商報價：新料號 A-203 單價 320 元，交期 10 天，請評估是否採用。',
];

const SAMPLE: Item[] = [
  { from: '王經理', type: '報價確認', todo: '回覆是否接單', due: '7/29', amount: '$120,000', urgent: true },
  { from: '客戶（客服轉）', type: '客訴', todo: '補寄 2 箱', due: '本週', amount: '—', urgent: true },
  { from: '會計', type: '付款', todo: '繳貨款尾款', due: '7/25', amount: '$85,000', urgent: true },
  { from: '供應商', type: '報價', todo: '評估是否採用', due: '—', amount: '單價 $320', urgent: false },
];

function heuristic(text: string): Item[] {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((b) => {
    const from = (b.match(/^([^：:，,。\n]{1,12})[：:]/) || [])[1] || (b.split(/[，,。\n]/)[0] || '').slice(0, 12) || '—';
    const due = (b.match(/(\d{1,2}\/\d{1,2})|本週|本周|今天|明天|下週[一二三四五六日]?/) || [])[0] || '—';
    const amt = (b.match(/([\d,]+)\s*萬/) || [])[1] ? '$' + (parseFloat((b.match(/([\d,]+)\s*萬/) as RegExpMatchArray)[1].replace(/,/g, '')) * 10000).toLocaleString()
      : (b.match(/\$?\s?([\d,]{3,})\s*元?/) || [])[1] ? '$' + (b.match(/\$?\s?([\d,]{3,})/) as RegExpMatchArray)[1] : '—';
    const type = /客訴|反映|退|抱怨|少了/.test(b) ? '客訴' : /報價|單價|接單/.test(b) ? '報價' : /繳|付款|款|發票/.test(b) ? '付款' : /確認|回覆|簽/.test(b) ? '待確認' : '一般';
    const todoM = b.match(/(請|麻煩|需要|記得|別忘|要求|評估|回覆|確認|補|繳)[^，,。\n]{1,18}/);
    const todo = todoM ? todoM[0].replace(/^(請|麻煩|需要|記得|別忘)/, '').trim() : '（無明確動作）';
    const urgent = /本週|本周|今天|明天|\d{1,2}\/\d{1,2}/.test(due) && due !== '—';
    return { from, type, todo, due, amount: amt, urgent };
  });
}

const PROMPT = `你是收件匣整理助理。我會貼上一批郵件或訊息。請幫我：
1. 每一封抽出：寄件人／對象、類型（報價／客訴／付款／待確認…）、我要做的動作、截止日、金額（若有）；
2. 整理成一張表格，一列一封；
3. 依急迫度排序，把有明確截止日、或本週要處理的排最前；
4. 最後用白話講：幾封要回、最急的是哪一封。
（以下貼上我的訊息）`;

const NODES = [{ icon: '📨', lb: '讀訊息' }, { icon: '🔖', lb: '抽欄位' }, { icon: '🗂️', lb: '判類型' }, { icon: '📋', lb: '產追蹤表' }];
const RUN_MSG = ['讀取 4 封訊息…', '抽出對象／待辦／截止／金額…', '判斷每封的類型…', '排序並產出追蹤表…'];

export default function InboxWizard() {
  const [step, setStep] = useState(1);
  const [lit, setLit] = useState(-1);
  const [rows, setRows] = useState<Item[] | null>(null);
  const [reveal, setReveal] = useState(0);
  const [text, setText] = useState('');
  const [own, setOwn] = useState<Item[] | null>(null);
  const [copied, setCopied] = useState(false);

  function goto(n: number) { setStep(n); setTimeout(() => document.getElementById('ibw-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); }

  function run() {
    goto(2); setLit(-1);
    let i = 0;
    const tick = () => {
      if (i < NODES.length) { setLit(i); i++; setTimeout(tick, 700); }
      else { setRows(SAMPLE); setReveal(0); goto(3); staggerReveal(SAMPLE.length); }
    };
    setTimeout(tick, 200);
  }
  function staggerReveal(n: number) { let k = 0; const t = () => { k++; setReveal(k); if (k < n) setTimeout(t, 260); }; setTimeout(t, 200); }

  function copyPrompt() { navigator.clipboard.writeText(PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }); }

  const Table = ({ items, revealN }: { items: Item[]; revealN: number }) => (
    <div className="ibw-ledger">
      <table><thead><tr><th>對象</th><th>類型</th><th>待辦</th><th>截止</th><th className="num">金額</th></tr></thead>
        <tbody>{items.map((it, i) => (
          <tr key={i} className={`${revealN > i ? 'show' : 'hide'} ${it.urgent ? 'urg' : ''}`}>
            <td>{it.from}</td>
            <td><span className="ibw-tag">{it.type}</span></td>
            <td>{it.todo}</td>
            <td>{it.due !== '—' ? <span className={`ibw-due ${it.urgent ? 'hot' : ''}`}>{it.due}</span> : '—'}</td>
            <td className="num">{it.amount}</td>
          </tr>
        ))}</tbody></table>
    </div>
  );

  const stepper = ['看訊息', '一鍵結構化', '追蹤表', '換自己的訊息'];

  return (
    <div className="ibw" id="ibw-top">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ibw-stepper">
        {stepper.map((s, i) => { const n = i + 1; const cls = n === step ? 'active' : n < step ? 'done' : ''; return <div key={n} className={`ibw-st ${cls}`}><span className="n">{n}</span>{s}</div>; })}
      </div>

      {step === 1 && (
        <div className="ibw-card fade">
          <h2>① 這是你收件匣裡的訊息</h2>
          <p className="sub">四封散亂的郵件／群組訊息。平常你得一封封讀、把要做的事手動抄進待辦表——這條工作流幫你一次抽乾淨。</p>
          <div className="ibw-raws">
            {RAW.map((r, i) => <div className="ibw-raw" key={i}>✉️ {r}</div>)}
          </div>
          <div className="center mt"><button className="ibw-btn" onClick={run}>一鍵整理成追蹤表　→</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="ibw-card fade">
          <h2>② AI 正在抽欄位</h2>
          <p className="sub">拆成四個節點，一個一個跑給你看——不是黑箱。</p>
          <div className="ibw-pipeline">
            {NODES.map((nd, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="ibw-connect" />}
                <div className={`ibw-node ${i < lit ? 'done' : i === lit ? 'lit' : ''}`}><div className="dot">{i < lit ? '✓' : nd.icon}</div><div className="lb">{nd.lb}</div></div>
              </div>
            ))}
          </div>
          <p className="center muted">{lit >= 0 ? RUN_MSG[lit] : '準備中…'}</p>
        </div>
      )}

      {step === 3 && rows && (
        <div className="ibw-card fade">
          <h2>③ 一張表，看完該做什麼</h2>
          <p className="sub">散亂訊息變成結構化追蹤表，有截止日的（紅色）自動往前排。</p>
          <Table items={rows} revealN={reveal} />
          <div className="ibw-readout">
            <b>白話解讀：</b>4 封訊息，抽出 <b>4 個待辦、3 個有明確截止</b>——最急的是 <b>7/25 繳貨款尾款 $85,000</b>；客訴要求<b>本週補寄 2 箱</b>否則退單，別壓件；王經理的報價 7/29 前要回覆是否接單。供應商報價無急迫，有空再評估。
          </div>
          <div className="center mt"><button className="ibw-btn ghost" onClick={() => goto(4)}>換自己的訊息試試　→</button></div>
        </div>
      )}

      {step === 4 && (
        <div className="ibw-card fade">
          <h2>④ 換成你自己的訊息</h2>
          <p className="sub">把幾封郵件／訊息貼進來（每封之間空一行），幫你抽成追蹤表。<b>貼上的文字不會上傳。</b></p>
          <textarea className="ibw-ta" rows={7} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={'王經理：7/29 前回覆報價，金額 12 萬。\n\n會計：7/25 要繳尾款 8.5 萬。'} />
          <div className="center mt"><button className="ibw-btn" disabled={!text.trim()} onClick={() => setOwn(heuristic(text))}>整理我的訊息</button></div>
          {own && <div className="mt fade"><Table items={own} revealN={own.length} />
            <p className="muted small">＊教學版用簡易規則抽取，可能不完美；雲端完整版（下方提示詞）由 Claude 做真正的語意抽取，準得多。</p></div>}
          <p className="privacy">🔒 貼上的文字只在瀏覽器內處理，關掉分頁就沒了。</p>
          <hr className="ibw-hr" />
          <h3 className="h3">想直接在 Claude 雲端跑完整版？</h3>
          <p className="muted small mb">複製這段提示詞，貼到 Claude、把你的訊息附上去即可：</p>
          <div className="ibw-prompt"><button className="ibw-copy" onClick={copyPrompt}>{copied ? '已複製 ✓' : '複製'}</button>{PROMPT}</div>
          <div className="mt"><a className="ibw-btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">開啟 Claude　↗</a></div>
        </div>
      )}

      <div className="ibw-note">
        <b>🔒 這條也有地端模式</b>——真正跑在公司真實往來訊息上時，同一條工作流可以在你自己的電腦上執行，資料一筆都不外流。這裡的雲端示範是給你先看懂它怎麼運作。
      </div>
    </div>
  );
}

const CSS = `
.ibw{--b:var(--color-brand);--bd:var(--color-brand-dark);--line:var(--color-surface-lighter);
  --ok:var(--color-success);--warn:var(--color-warn);--bad:var(--color-accent-stuck);
  --card:var(--color-surface-light);--ink:var(--color-text-primary);--grey:var(--color-text-secondary);--muted:var(--color-text-muted);
  color:var(--ink);line-height:1.7}
.ibw h2{font-size:21px;font-weight:800;margin:0 0 4px} .ibw .sub{color:var(--grey);margin:0 0 18px;font-size:15px}
.ibw .muted{color:var(--muted)} .ibw .small{font-size:12.5px} .ibw .center{text-align:center} .ibw .mt{margin-top:20px} .ibw .mb{margin-bottom:6px}
.ibw-stepper{display:flex;gap:8px;margin-bottom:22px;flex-wrap:wrap}
.ibw-st{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:600;color:var(--grey);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:7px 14px 7px 8px}
.ibw-st .n{width:24px;height:24px;border-radius:50%;background:color-mix(in srgb,var(--b) 18%,transparent);color:var(--b);display:grid;place-items:center;font-size:13px;font-weight:800}
.ibw-st.active{color:#fff;background:var(--b);border-color:var(--b)} .ibw-st.active .n{background:#fff;color:var(--b)}
.ibw-st.done{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent)} .ibw-st.done .n{background:var(--ok);color:#fff}
.ibw-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px}
.ibw-raws{display:flex;flex-direction:column;gap:10px}
.ibw-raw{border:1px solid var(--line);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--grey);background:color-mix(in srgb,var(--b) 3%,transparent)}
.ibw-btn{display:inline-flex;align-items:center;gap:9px;font-size:15.5px;font-weight:700;cursor:pointer;border:none;border-radius:12px;padding:13px 22px;background:var(--b);color:#fff;transition:.15s}
.ibw-btn:hover{background:var(--bd)} .ibw-btn:disabled{opacity:.5;cursor:not-allowed} .ibw-btn.ghost{background:transparent;color:var(--b);border:1.5px solid var(--b)}
.ibw-pipeline{display:flex;align-items:center;justify-content:center;gap:2px;flex-wrap:wrap;margin:8px 0 18px}
.ibw-node{display:flex;flex-direction:column;align-items:center;gap:7px;width:96px;text-align:center;opacity:.35;transition:.35s}
.ibw-node .dot{width:44px;height:44px;border-radius:14px;background:var(--card);border:1.5px solid var(--line);display:grid;place-items:center;font-size:19px;transition:.35s}
.ibw-node .lb{font-size:12px;font-weight:600;color:var(--grey)}
.ibw-node.lit{opacity:1} .ibw-node.lit .dot{background:color-mix(in srgb,var(--b) 15%,transparent);border-color:var(--b);box-shadow:0 0 0 5px color-mix(in srgb,var(--b) 12%,transparent)}
.ibw-node.done{opacity:1} .ibw-node.done .dot{background:var(--ok);border-color:var(--ok);color:#fff}
.ibw-connect{width:18px;height:2px;background:var(--line);margin:0 2px}
.ibw-ledger{border:1px solid var(--line);border-radius:12px;overflow:hidden}
.ibw table{width:100%;border-collapse:collapse;font-size:13.5px}
.ibw th,.ibw td{text-align:left;padding:10px 14px;border-top:1px solid var(--line);vertical-align:top}
.ibw th{color:var(--grey);font-weight:600;font-size:12.5px} .ibw td.num,.ibw th.num{text-align:right;font-variant-numeric:tabular-nums}
.ibw tr.hide{opacity:0;transform:translateY(6px)} .ibw tr.show{opacity:1;transform:none;transition:.4s}
.ibw tr.urg{background:color-mix(in srgb,var(--bad) 7%,transparent)}
.ibw-tag{font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:6px;background:color-mix(in srgb,var(--b) 14%,transparent);color:var(--b);white-space:nowrap}
.ibw-due{font-weight:700} .ibw-due.hot{color:var(--bad)}
.ibw-readout{margin-top:18px;background:color-mix(in srgb,var(--b) 7%,transparent);border:1px solid var(--line);border-radius:12px;padding:16px 18px;font-size:14.5px}
.ibw-ta{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:12px;padding:14px;font-size:14px;background:var(--card);color:var(--ink);font-family:inherit;line-height:1.7}
.ibw .privacy{font-size:13px;color:var(--grey);margin-top:14px}
.ibw-hr{border:none;border-top:1px solid var(--line);margin:26px 0} .ibw .h3{font-size:17px;margin:0 0 6px;font-weight:700}
.ibw-prompt{position:relative;background:#0f1c2e;color:#d7e3f4;border-radius:12px;padding:18px;font-size:13px;font-family:ui-monospace,Menlo,monospace;line-height:1.6;white-space:pre-wrap}
.ibw-copy{position:absolute;top:10px;right:10px;background:#26405f;color:#cfe0f5;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer}
.ibw-note{margin:36px 0 0;background:color-mix(in srgb,var(--b) 6%,transparent);border:1px solid var(--line);border-radius:14px;padding:18px 20px;font-size:14.5px;color:var(--grey);line-height:1.7}
.ibw-note b{color:var(--ink)}
.ibw .fade{animation:ibwfade .4s ease}
@keyframes ibwfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:680px){.ibw-node{width:70px}}
`;
