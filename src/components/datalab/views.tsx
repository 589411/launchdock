import { useState } from 'react';
import { dayToString } from '../../lib/datalab/normalize';
import { healthPrompt, rfmPrompt, segmentMessagePrompt } from '../../lib/datalab/prompts';
import { segmentInfo } from '../../data/datalab';
import type { HealthReport, Level, PiiKind, RfmResult } from '../../lib/datalab/types';
import type { TouchpointResult, Slice } from '../../lib/datalab/touchpoints';
import type { ReportModel } from '../../lib/datalab/report';

export const card = { backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-lighter)' } as const;
export const muted = { color: 'var(--color-text-muted)' } as const;
export const secondary = { color: 'var(--color-text-secondary)' } as const;
export const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
export const money = (n: number) => `NT$${Math.round(n).toLocaleString()}`;

const LEVEL: Record<Level, { label: string; color: string }> = {
  warn: { label: '要注意', color: '#f59e0b' },
  info: { label: '留意', color: 'var(--color-brand-light)' },
  ok: { label: '正常', color: '#22c55e' },
};

const PII_LABEL: Record<PiiKind, string> = {
  email: 'Email',
  phone: '電話',
  national_id: '身分證字號',
  card: '信用卡號',
  hash: '雜湊（假名化）',
  name: '姓名',
  address: '地址',
  quasi: '準識別碼',
};

// ── 資料健檢 ──────────────────────────────────────────────────
export function HealthView({ health }: { health: HealthReport }) {
  const order: Level[] = ['warn', 'info', 'ok'];
  const checks = [...health.checks].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
  return (
    <div className="space-y-6">
      <p className="text-sm" style={secondary}>
        做分析前，先看資料「可以信到什麼程度」。真實資料很少是乾淨的，難的從來不是拿到資料，而是拿到之後怎麼辦。
      </p>

      <div className="space-y-3">
        {checks.map((c) => (
          <div key={c.id} className="rounded-xl p-4 border" style={{ ...card, borderColor: c.level === 'warn' ? '#f59e0b' : card.borderColor }}>
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 mt-0.5" style={{ color: LEVEL[c.level].color, border: `1px solid ${LEVEL[c.level].color}` }}>
                {LEVEL[c.level].label}
              </span>
              <p className="font-medium text-sm">{c.title}</p>
            </div>
            <p className="text-sm mt-2" style={secondary}>
              {c.detail.replace(/\*\*/g, '')}
            </p>
            <p className="text-xs mt-1" style={muted}>
              來自 {/^[a-z_]+$/.test(c.table) ? `${c.table}.csv` : c.table}
            </p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-3">個資欄位掃描</h3>
        {health.pii.length === 0 ? (
          <p className="text-sm" style={secondary}>
            沒有偵測到明顯的個資欄位。
          </p>
        ) : (
          <div className="rounded-xl border overflow-x-auto" style={card}>
            <table className="w-full text-sm">
              <thead>
                <tr style={muted} className="text-left text-xs">
                  <th className="px-3 py-2">欄位</th>
                  <th className="px-3 py-2">類型</th>
                  <th className="px-3 py-2">範例（已遮罩）</th>
                </tr>
              </thead>
              <tbody>
                {health.pii.map((p) => (
                  <tr key={`${p.table}.${p.column}`} className="border-t align-top" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {p.table}.{p.column}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{PII_LABEL[p.kind]}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs">{p.maskedSample || '—'}</span>
                      <span className="block text-xs mt-1" style={muted}>
                        {p.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs mt-2" style={muted}>
          這些欄位預設不納入分析，也不會出現在下面的提示詞裡。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">清洗決策表：後續分析怎麼處理</h3>
        <ul className="space-y-2">
          {health.decisions.map((d) => (
            <li key={d.rule} className="rounded-xl p-3 border text-sm" style={card}>
              <b>{d.rule}</b>
              <span className="block text-xs mt-1" style={secondary}>
                {d.why}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <PromptBox title="複製給你的 AI 工具：幫我解讀這份健檢" text={healthPrompt(health)} />
    </div>
  );
}

// ── RFM ───────────────────────────────────────────────────────
export function RfmView({ rfm }: { rfm: RfmResult }) {
  const n = rfm.customers.length;
  const maxShare = Math.max(...rfm.segments.map((s) => Math.max(s.countShare, s.revenueShare)), 0.01);
  const gridMax = Math.max(...rfm.grid.flat(), 1);
  return (
    <div className="space-y-6">
      <p className="text-sm" style={secondary}>
        用「最近一次消費（R）、消費次數（F）、消費金額（M）」把顧客分成七群。只看有會員編號的顧客（{n.toLocaleString()} 位）；
        已排除匿名交易 {rfm.excluded.anonymous.toLocaleString()} 筆，退貨不算一次購買。基準日 {dayToString(rfm.asOf)}（資料最後一天 + 1）。
      </p>
      {n < 30 && (
        <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }}>
          顧客只有 {n} 位，分群結果僅供示範，不適合據此下決策。
        </p>
      )}

      <section>
        <h3 className="text-lg font-semibold mb-1">各群「佔客數」與「佔營收」</h3>
        <p className="text-xs mb-3" style={muted}>
          兩條不一樣長，就是重點：有些群人很多但沒貢獻多少，有些群人少卻撐起大半營收。
        </p>
        <div className="space-y-3">
          {rfm.segments.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-sm mb-1">
                <b>{segmentInfo[s.key].name}</b>
                <span style={muted}>
                  {s.count} 人 · 客數 {pct(s.countShare)} · 營收 {pct(s.revenueShare)}
                </span>
              </div>
              <Bar value={s.countShare / maxShare} color="var(--color-surface-lighter)" label="客數" />
              <Bar value={s.revenueShare / maxShare} color="var(--color-brand)" label="營收" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-1">熱度圖：最近消費 × 頻次金額</h3>
        <p className="text-xs mb-3" style={muted}>
          縱軸是「最近一次購買距今多久」，把所有顧客排序後分成五等，最上面是最近的前 20%；橫軸是「買幾次、花多少」的綜合分，分成五等，越右邊越多。格子裡的數字是人數，顏色越深人越多。
        </p>
        <Heat grid={rfm.grid} max={gridMax} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">每一群，第一件該做的事</h3>
        <div className="space-y-3">
          {rfm.segments
            .filter((s) => s.count > 0)
            .map((s) => (
              <div key={s.key} className="rounded-xl p-4 border" style={card}>
                <div className="flex justify-between gap-2 flex-wrap">
                  <b>{segmentInfo[s.key].name}</b>
                  <span className="text-xs" style={muted}>
                    最近購買中位數 {Math.round(s.medianR)} 天前 · {s.medianF} 次 · 累計 {money(s.medianM)}
                  </span>
                </div>
                <p className="text-sm mt-1" style={secondary}>
                  {segmentInfo[s.key].blurb}
                </p>
                <p className="text-sm mt-2">👉 {segmentInfo[s.key].action}</p>
              </div>
            ))}
        </div>
      </section>

      <PromptBox title="複製給你的 AI 工具：幫我解讀這個分群" text={rfmPrompt(rfm)} />
      <PromptBox title="複製給你的 AI 工具：每一群各寫一則 LINE 訊息" text={segmentMessagePrompt(rfm)} />
    </div>
  );
}

export function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="h-2 rounded-full mb-1" style={{ backgroundColor: 'var(--color-surface)' }} role="img" aria-label={`${label} ${(value * 100).toFixed(0)}%`}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(value * 100, 1)}%`, backgroundColor: color }} />
    </div>
  );
}

function Heat({ grid, max }: { grid: number[][]; max: number }) {
  // 上面是 R 分高（最近）：把 rScore 5 排在第一列
  const rows = [5, 4, 3, 2, 1];
  const rowLabel: Record<number, string> = { 5: '最近', 4: '較近', 3: '中間', 2: '較久', 1: '很久' };
  const colLabel: Record<number, string> = { 1: '少', 2: '', 3: '', 4: '', 5: '多' };
  return (
    <div className="max-w-[420px] mx-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
        {rows.map((r) => (
          <div key={r} className="contents">
            <span className="text-xs self-center pr-1 whitespace-nowrap" style={muted}>
              {rowLabel[r]}
            </span>
            {[1, 2, 3, 4, 5].map((fm) => {
              const v = grid[r - 1][fm - 1];
              return (
                <div
                  key={fm}
                  className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    opacity: v === 0 ? 0.08 : 0.2 + 0.8 * (v / max),
                    color: '#fff',
                  }}
                  title={`最近消費「${rowLabel[r]}」× 頻次金額第 ${fm} 等：${v} 人`}
                >
                  {v || ''}
                </div>
              );
            })}
          </div>
        ))}
        <span />
        {[1, 2, 3, 4, 5].map((fm) => (
          <span key={fm} className="text-xs text-center" style={muted}>
            {colLabel[fm]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PromptBox({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    let done = false;
    try {
      await navigator.clipboard.writeText(text);
      done = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      done = document.execCommand('copy');
      ta.remove();
    }
    setCopied(done);
    setFailed(!done);
    setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2200);
  }
  return (
    <details className="rounded-xl border" style={card}>
      <summary className="px-4 py-3 text-sm font-medium cursor-pointer">{title}</summary>
      <div className="px-4 pb-4">
        <p className="text-xs mb-2" style={muted}>
          提示詞裡只有彙總數字，沒有任何個人資料。貼到你自己的 AI 工具就能用。
        </p>
        <pre className="text-xs whitespace-pre-wrap rounded-lg p-3 max-h-64 overflow-auto" style={{ backgroundColor: 'var(--color-surface)' }}>
          {text}
        </pre>
        <button onClick={() => void copy()} className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-brand)' }}>
          {copied ? '已複製 ✓' : failed ? '複製失敗，請手動選取上方文字' : '複製提示詞'}
        </button>
      </div>
    </details>
  );
}


// ── 接觸點 ────────────────────────────────────────────────────
export function TouchpointView({ touch }: { touch: TouchpointResult }) {
  const maxMonth = Math.max(...touch.monthly.map((m) => Math.abs(m.revenue)), 1);
  const maxWd = Math.max(...touch.weekday, 1);
  const wdLabel = ['日', '一', '二', '三', '四', '五', '六'];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 border text-center" style={card}>
          <p className="text-2xl font-extrabold">{pct(touch.memberShare)}</p>
          <p className="text-xs mt-1" style={muted}>
            有顧客編號的交易佔比（{touch.memberTxns.toLocaleString()} / {touch.txns.toLocaleString()} 筆）
          </p>
        </div>
        <div className="rounded-xl p-4 border text-center" style={card}>
          <p className="text-2xl font-extrabold">{pct(touch.memberRevenueShare)}</p>
          <p className="text-xs mt-1" style={muted}>有顧客編號的交易佔營收比</p>
        </div>
      </div>
      <p className="text-sm" style={secondary}>
        沒有顧客編號的交易，營收照算，但之後所有「顧客層級」的分析（分群、回購）都看不到它們。這個比例越低，你對顧客的了解就越像盲人摸象。
      </p>

      {touch.byStore.length > 1 && <SliceBars title="各門市／店別" slices={touch.byStore} />}
      {touch.byChannel.length > 1 && <SliceBars title="各通路" slices={touch.byChannel} />}

      <section>
        <h3 className="text-lg font-semibold mb-3">每月營收與筆數</h3>
        <div className="flex items-end gap-1 h-32" role="img" aria-label="每月營收長條圖">
          {touch.monthly.map((m) => (
            <div key={m.month} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full" title={`${m.month}：${m.count} 筆`}>
              <div className="w-full rounded-t" style={{ height: `${Math.max((Math.abs(m.revenue) / maxMonth) * 100, 2)}%`, backgroundColor: 'var(--color-brand)' }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs mt-1" style={muted}>
          <span>{touch.monthly[0]?.month}</span>
          <span>{touch.monthly[touch.monthly.length - 1]?.month}</span>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">一週哪幾天交易最多</h3>
        <div className="flex items-end gap-2 h-24">
          {touch.weekday.map((n, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="w-full rounded-t" style={{ height: `${Math.max((n / maxWd) * 100, 2)}%`, backgroundColor: 'var(--color-brand)' }} title={`週${wdLabel[i]}：${n} 筆`} />
              <span className="text-xs mt-1" style={muted}>{wdLabel[i]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SliceBars({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((s, x) => s + Math.max(x.revenue, 0), 0) || 1;
  const max = Math.max(...slices.map((x) => x.revenue / total), 0.01);
  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {slices.slice(0, 12).map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-sm mb-1">
              <b>{s.label}</b>
              <span style={muted}>營收 {pct(Math.max(s.revenue, 0) / total)} · 有顧客編號 {pct(s.memberShare)}</span>
            </div>
            <Bar value={Math.max(s.revenue, 0) / total / max} color="var(--color-brand)" label="營收" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── AI 解讀與把關 ─────────────────────────────────────────────
export function InsightView({ health, rfm }: { health: HealthReport; rfm: RfmResult }) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={secondary}>
        把下面任一份提示詞貼到你的 AI 工具。它們只含彙總數字，沒有任何個人資料。拿到報告後，用下面的問題逐條檢查。
      </p>
      <PromptBox title="提示詞 A：解讀資料健檢" text={healthPrompt(health)} />
      <PromptBox title="提示詞 B：解讀客群分群" text={rfmPrompt(rfm)} />
      <PromptBox title="提示詞 C：每一群各寫一則訊息" text={segmentMessagePrompt(rfm)} />
      <div className="rounded-xl p-4 border" style={card}>
        <h4 className="font-semibold text-sm mb-2">AI 報告把關清單</h4>
        <ul className="text-sm space-y-1.5 list-disc pl-5" style={secondary}>
          <li>報告裡每一個數字，都能在我貼給它的表格裡找到嗎？找不到的就是它編的。</li>
          <li>它有沒有把「相關」說成「因果」？（例如「冠軍客群因為收到簡訊所以買得多」）</li>
          <li>它的建議，有沒有說明怎麼知道有沒有效？沒有的話，要求它補上對照組的設計。</li>
          <li>它有沒有提到資料的限制（匿名交易被排除、樣本大小）？沒提就是少了一段。</li>
          <li>換個問法再問一次，結論會不會變？會變的結論先別全信。</li>
        </ul>
      </div>
    </div>
  );
}

// ── 一頁報告 ──────────────────────────────────────────────────
export function ReportView({ r }: { r: ReportModel }) {
  const ok = { match: '✅ 一致', off: '⚠️ 有出入', empty: '—' } as const;
  return (
    <article id="datalab-report" className="rounded-2xl border p-6 space-y-5" style={card}>
      <header>
        <p className="text-xs" style={muted}>顧客數據分析成果 · {r.generatedAt}</p>
        <h2 className="text-2xl font-extrabold mt-1">我的顧客數據分析</h2>
        <p className="text-sm mt-2" style={secondary}>
          資料：{r.sourceLabel}｜{r.range.from} 至 {r.range.to}｜{r.txns.toLocaleString()} 筆交易、{r.customers.toLocaleString()} 位顧客
          {r.revenue !== undefined && `｜淨營收 ${money(r.revenue)}`}
        </p>
      </header>

      <section>
        <h3 className="font-semibold mb-2">主要發現</h3>
        <ul className="text-sm space-y-1 list-disc pl-5">{r.findings.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">客群分佈</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs" style={muted}>
              <th className="py-1">客群</th><th className="py-1">人數</th><th className="py-1">佔客數</th><th className="py-1">佔營收</th>
              {r.segments.some((s) => s.sumM !== undefined) && <th className="py-1">累計消費</th>}
            </tr>
          </thead>
          <tbody>
            {r.segments.map((s) => (
              <tr key={s.name} className="border-t" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                <td className="py-1">{s.name}</td><td className="py-1">{s.count}</td><td className="py-1">{pct(s.countShare)}</td><td className="py-1">{pct(s.revenueShare)}</td>
                {s.sumM !== undefined && <td className="py-1">{money(s.sumM)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {r.healthWarnings.length > 0 && (
        <section>
          <h3 className="font-semibold mb-2">資料要注意</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">{r.healthWarnings.map((w) => <li key={w}>{w}</li>)}</ul>
        </section>
      )}

      {r.checks.length > 0 && (
        <section>
          <h3 className="font-semibold mb-2">我跟 AI 的數字核對</h3>
          <ul className="text-sm space-y-1">
            {r.checks.map((c) => (
              <li key={c.label}>{c.label}　我的 AI：<b>{c.mine}</b>　標準算法：<b>{c.expected}</b>　{ok[c.status]}</li>
            ))}
          </ul>
        </section>
      )}

      {r.notes.length > 0 && (
        <section>
          <h3 className="font-semibold mb-2">我學到</h3>
          <ul className="text-sm space-y-2">{r.notes.map((n) => <li key={n.title}><b>{n.title}：</b>{n.text}</li>)}</ul>
        </section>
      )}

      <footer className="text-xs pt-3 border-t" style={{ ...muted, borderColor: 'var(--color-surface-lighter)' }}>
        由藍鴨 LaunchDock 顧客數據戰情室產生，資料只在本機計算，沒有上傳。
      </footer>
    </article>
  );
}
