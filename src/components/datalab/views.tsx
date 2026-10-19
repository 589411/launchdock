import { useState } from 'react';
import { dayToString } from '../../lib/datalab/normalize';
import { basketPrompt, campaignPlanPrompt, healthPrompt, recommendPrompt, repurchasePrompt, rfmPrompt, segmentBriefPrompt, segmentMessagePrompt, triggerSpecPrompt, valuePrompt } from '../../lib/datalab/prompts';
import type { RepurchaseResult } from '../../lib/datalab/repurchase';
import type { BasketResult } from '../../lib/datalab/basket';
import type { ValueResult } from '../../lib/datalab/value';
import { actionableRule, MIN_RULE_AUDIENCE, type PersonalizeResult } from '../../lib/datalab/personalize';
import { TRIGGER_PRIORITY, type TriggerResult } from '../../lib/datalab/triggers';
import { minDetectablePp, requiredPerGroup, SAMPLE_SIZE_CASE, Z_ALPHA, Z_POWER, type ExperimentResult } from '../../lib/datalab/experiment';
import type { Risk } from '../../lib/datalab/risks';
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

/** 複製文字到剪貼簿；失敗時退回 execCommand，回傳是否成功 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** 複製診斷報告的按鈕：報告只含欄位名稱與偵測結果，沒有任何資料列 */
export function DiagCopyButton({ text, label = '複製診斷報告（只含欄位名稱，沒有資料）' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  return (
    <button
      onClick={async () => {
        setState((await copyText(text)) ? 'ok' : 'fail');
        setTimeout(() => setState('idle'), 2200);
      }}
      className="px-4 py-2 rounded-lg text-sm"
      style={{ backgroundColor: 'var(--color-surface-lighter)' }}
    >
      {state === 'ok' ? '已複製 ✓' : state === 'fail' ? '複製失敗，請手動選取' : label}
    </button>
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

      {r.day2 && (
        <section>
          <h3 className="font-semibold mb-2">行為與價值（第 2 天）</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>回購率 {pct(r.day2.repeatRate)}；回頭客貢獻 {pct(r.day2.repeatRevenueShare)} 的營收；回購間隔中位數 {r.day2.medianInterval} 天；已超過回購節奏的顧客 {r.day2.dueNow} 位</li>
            <li>累計消費最高的 20% 顧客貢獻 {pct(r.day2.top20Share)} 的營收</li>
            {r.day2.aovMedian !== undefined && <li>客單價中位數 {money(r.day2.aovMedian)}；每位顧客累計消費中位數 {money(r.day2.spendMedian ?? 0)}</li>}
            {r.day2.topPairs.map((p) => <li key={p.a + p.b}>常一起買：{p.a} × {p.b}（{p.nAB} 次，lift {p.lift.toFixed(1)}）</li>)}
            {r.day2.basketNote && <li>商品關聯：{r.day2.basketNote}</li>}
          </ul>
        </section>
      )}

      {r.day3 && (
        <section>
          <h3 className="font-semibold mb-2">個人化與自動化（第 3 天）</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs" style={muted}><th className="py-1">觸發</th><th className="py-1">符合</th><th className="py-1">去重後</th></tr></thead>
            <tbody>
              {r.day3.triggers.map((t) => (
                <tr key={t.name} className="border-t" style={{ borderColor: 'var(--color-surface-lighter)' }}><td className="py-1">{t.name}</td><td className="py-1">{t.matched}</td><td className="py-1">{t.unique}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm mt-2">去重後共 {r.day3.uniqueTotal} 位顧客會收到至少一則訊息（{r.day3.overlapPeople} 位同時符合多條）。</p>
          {r.day3.rule && <p className="text-sm mt-1">推薦規則：買了「{r.day3.rule.from}」推薦「{r.day3.rule.to}」（lift {r.day3.rule.lift.toFixed(1)}，可推薦 {r.day3.rule.audience} 人）。</p>}
          {r.day3.ruleNote && <p className="text-sm mt-1">推薦規則：{r.day3.ruleNote}</p>}
        </section>
      )}

      {r.day4 && (
        <section>
          <h3 className="font-semibold mb-2">驗證與風險（第 4 天）</h3>
          {r.day4.available ? (
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>什麼都沒做時，30 天基準回購率 {pct(r.day4.baseline)}；隨機分兩組的差距 95% 落在 {r.day4.noiseLowPp.toFixed(1)} 至 {r.day4.noiseHighPp.toFixed(1)} 個百分點</li>
              <li>挑累計消費前 20% 的顧客，什麼都沒做就比其他人高 {r.day4.selectionGapPp.toFixed(1)} 個百分點，所以活動一定要從同一批對象隨機留對照組</li>
            </ul>
          ) : (
            <p className="text-sm">對照組模擬：{r.day4.reason}</p>
          )}
          {r.day4.risks.length > 0 && (
            <ul className="text-sm space-y-1 list-disc pl-5 mt-2">
              {r.day4.risks.map((x) => <li key={x.title}>【{SEVERITY[x.severity].label}】{x.title}</li>)}
            </ul>
          )}
        </section>
      )}

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


// ── 第 2 天：回購週期 ─────────────────────────────────────────
export function RepurchaseView({ r }: { r: RepurchaseResult }) {
  const max = Math.max(...r.buckets.map((b) => b.count), 1);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat value={pct(r.repeatRate)} label={`回購率（${r.repeatCustomers}／${r.eligible} 位）`} />
        <Stat value={`${r.median} 天`} label="回購間隔中位數" />
        <Stat value={`${r.dueNow} 位`} label="已超過自己的回購節奏" />
      </div>
      <p className="text-sm" style={secondary}>
        <b>怎麼算的：</b>「購買日」是顧客有非退貨交易的那一天，同一天買兩次只算一個購買日；回購間隔是同一位顧客相鄰兩個購買日相隔的天數；
        回購率是買過 2 個購買日以上的顧客，除以有購買紀錄的顧客。
      </p>
      <section>
        <h3 className="text-lg font-semibold mb-3">回購間隔分佈（共 {r.intervals.toLocaleString()} 次）</h3>
        <div className="space-y-2">
          {r.buckets.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{b.label}</span>
                <span style={muted}>{b.count.toLocaleString()} 次 · {pct(r.intervals ? b.count / r.intervals : 0)}</span>
              </div>
              <Bar value={b.count / max} color="var(--color-brand)" label={b.label} />
            </div>
          ))}
        </div>
        <p className="text-xs mt-2" style={muted}>
          中位數 {r.median} 天；一半的回購落在 {r.p25} 至 {r.p75} 天之間。想設「回購提醒」，通常放在多數人回來之前一點。
        </p>
      </section>
      <p className="text-sm rounded-xl px-4 py-3 border" style={card}>
        <b>「已超過自己的回購節奏」</b>是指：這位回頭客距離上次購買的天數，已經超過他自己平常回購間隔的 1.5 倍。
        這群人最適合收到提醒，但也包含早已不來的人，所以要搭配對照組測試有沒有效。
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl p-3 border text-center" style={card}>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-xs mt-1" style={muted}>{label}</p>
    </div>
  );
}

// ── 第 2 天：商品關聯 ─────────────────────────────────────────
export function BasketView({ b }: { b: BasketResult }) {
  if (!b.available) {
    return (
      <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }} role="status">
        這一段目前無法進行。{b.reason}
        <span className="block mt-2" style={muted}>你可以直接進入下一段；想練習這一段，可以回到開頭改用示範資料。</span>
      </p>
    );
  }
  const table = (title: string, rows: BasketResult['topByLift']) => (
    <section>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="rounded-xl border overflow-x-auto" style={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs" style={muted}>
              <th className="px-3 py-2">品類配對</th>
              <th className="px-3 py-2">同時出現</th>
              <th className="px-3 py-2">lift</th>
              <th className="px-3 py-2">A→B／B→A</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 8).map((x) => (
              <tr key={`${x.a}|${x.b}`} className="border-t" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                <td className="px-3 py-2">{x.a} × {x.b}</td>
                <td className="px-3 py-2 whitespace-nowrap">{x.nAB.toLocaleString()} 次</td>
                <td className="px-3 py-2">{x.lift.toFixed(2)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{(x.confAB * 100).toFixed(0)}% ／ {(x.confBA * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
  return (
    <div className="space-y-5">
      <p className="text-sm" style={secondary}>
        共 {b.baskets.toLocaleString()} 個購物籃（一張非退貨的單就是一個）、{b.groups} 個品類。同一張單同一品類只算一次，只看兩兩配對，
        同時出現至少 {b.minCount} 次才列入（避免偶然）。
      </p>
      {table('依 lift 排序：最「不只是熱賣」的配對', b.topByLift)}
      {table('依同時出現次數排序：最常一起出現的配對', b.topByCount)}
      <div className="rounded-xl p-4 border text-sm space-y-1" style={card}>
        <p><b>lift 怎麼看：</b>同時出現的比例，除以兩者各自出現比例的乘積。</p>
        <ul className="list-disc pl-5" style={secondary}>
          <li>接近 1：兩者只是剛好都熱賣，沒有特別的關聯。</li>
          <li>明顯大於 1：比「碰巧同時出現」更常一起買，值得做組合推薦或陳列。</li>
          <li><b>次數最多的配對常常 lift 接近 1</b>：光看次數會被熱賣品誤導，這就是為什麼要兩種排序一起看。</li>
        </ul>
        <p className="text-xs" style={muted}>A→B 的意思是「買了 A 的單裡，有多少比例也買了 B」。</p>
      </div>
    </div>
  );
}

// ── 第 2 天：顧客價值 ─────────────────────────────────────────
export function ValueView({ v, repeatRevenueShare }: { v: ValueResult; repeatRevenueShare: number }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Stat value={money(v.spendMedian)} label={`每位顧客累計消費中位數（平均 ${money(v.spendMean)}）`} />
        <Stat value={money(v.aovMedian)} label={`客單價中位數（平均 ${money(v.aovMean)}）`} />
        <Stat value={pct(repeatRevenueShare)} label="回頭客貢獻的營收" />
        <Stat value={pct(v.top20Share)} label="累計消費前 20% 顧客貢獻的營收" />
      </div>
      <p className="text-sm" style={secondary}>
        <b>平均和中位數差很多，就代表有少數大客戶把平均拉高。</b>用平均來規劃（例如「每位顧客約花 {money(v.spendMean)}」）會高估一般顧客，
        中位數更接近「典型顧客」。
      </p>
      <section>
        <h3 className="text-lg font-semibold mb-3">營收集中在哪些顧客</h3>
        <div className="space-y-2">
          {v.tiers.map((t) => (
            <div key={t.label}>
              <div className="flex justify-between text-sm mb-1">
                <b>{t.label}</b>
                <span style={muted}>{t.customers.toLocaleString()} 位 · 貢獻 {pct(t.share)} 的營收</span>
              </div>
              <Bar value={t.share} color="var(--color-brand)" label={t.label} />
            </div>
          ))}
        </div>
      </section>
      <p className="text-xs" style={muted}>
        累計消費＝非退貨金額加上該顧客的退貨（退貨為負），最低 0；沒有顧客編號的交易不納入顧客層級統計，但客單價會包含它們。
      </p>
    </div>
  );
}

// ── 第 2 天：AI 解讀與把關 ────────────────────────────────────
export function Insight2View({ repurchase, basket, value }: { repurchase: RepurchaseResult; basket: BasketResult; value: ValueResult }) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={secondary}>
        把下面任一份提示詞貼到你的 AI 工具。它們只含彙總數字，沒有任何個人資料。拿到報告後，用下面的問題逐條檢查。
      </p>
      <PromptBox title="提示詞 A：解讀購買週期" text={repurchasePrompt(repurchase)} />
      <PromptBox title="提示詞 B：解讀商品關聯" text={basketPrompt(basket)} />
      <PromptBox title="提示詞 C：解讀顧客價值" text={valuePrompt(value, repurchase.repeatRevenueShare)} />
      <div className="rounded-xl p-4 border" style={card}>
        <h4 className="font-semibold text-sm mb-2">這一天特別要檢查的地方</h4>
        <ul className="text-sm space-y-1.5 list-disc pl-5" style={secondary}>
          <li><b>「相關」被說成「因果」</b>：AI 常寫「因為買了 A，所以也會買 B」。資料只能說兩者常一起出現，不能說誰造成誰。</li>
          <li><b>用次數而不是 lift</b>：它推薦的「常一起買」，是不是只是兩個都很熱賣的東西？要求它同時給 lift。</li>
          <li><b>平均數誤導</b>：它說「每位顧客平均花…」，有沒有同時給中位數？營收集中時，平均會高估典型顧客。</li>
          <li><b>回購提醒的時間點</b>：它建議第幾天提醒？依據是中位數還是 P75？請它說明理由。</li>
          <li><b>沒有說怎麼驗證</b>：每個建議都該附上「怎麼知道有沒有效」（要有對照組），沒有的就要求補上。</li>
        </ul>
      </div>
    </div>
  );
}

// ── 第 3 天：推薦規則 ─────────────────────────────────────────
export function RecommendView({ p }: { p: PersonalizeResult }) {
  if (!p.rules.length) {
    return (
      <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }} role="status">
        這一段目前沒有可用的推薦規則。{p.rulesNote}
        <span className="block mt-2" style={muted}>你可以直接進入下一段；想練習這一段，可以回到開頭改用示範資料。</span>
      </p>
    );
  }
  const best = actionableRule(p);
  return (
    <div className="space-y-5">
      <p className="text-sm" style={secondary}>
        規則來自上一天的「常一起買」：只留 lift ≥ 1.2 的配對，方向取信心較高的那邊。「推薦對象」＝買過前者、但從來沒買過後者的顧客。
      </p>
      <div className="rounded-xl border overflow-x-auto" style={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs" style={muted}>
              <th className="px-3 py-2">規則</th><th className="px-3 py-2">同時出現</th><th className="px-3 py-2">lift</th><th className="px-3 py-2">信心</th><th className="px-3 py-2">推薦對象</th>
            </tr>
          </thead>
          <tbody>
            {p.rules.map((r) => (
              <tr key={r.from + r.to} className="border-t" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                <td className="px-3 py-2">買了「{r.from}」→ 推薦「{r.to}」</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.nAB.toLocaleString()} 次</td>
                <td className="px-3 py-2">{r.lift.toFixed(2)}</td>
                <td className="px-3 py-2">{(r.conf * 100).toFixed(0)}%</td>
                <td className="px-3 py-2 whitespace-nowrap"><b>{r.audience.toLocaleString()}</b> 人{r.audience < MIN_RULE_AUDIENCE && <span style={muted}>（太少）</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl p-4 border text-sm space-y-1" style={card}>
        <p><b>lift 最高的規則，常常已經沒人可以推薦。</b></p>
        <p style={secondary}>
          買了 A 的人本來就幾乎都買了 B（例如嬰兒用品成套買），推薦等於重複提醒。真正值得做的，是 lift 夠高、<b>而且還有足夠多的人沒買過 B</b> 的規則（這裡門檻是至少 {MIN_RULE_AUDIENCE} 人）。
        </p>
        {best ? (
          <p>這份資料裡第一條夠多人可推的規則：買了「{best.from}」→ 推薦「{best.to}」，可推薦 <b>{best.audience}</b> 人。</p>
        ) : (
          <p>這份資料裡沒有任何一條規則的推薦對象達 {MIN_RULE_AUDIENCE} 人，不建議硬做。</p>
        )}
      </div>
    </div>
  );
}

// ── 第 3 天：分群文案 ─────────────────────────────────────────
export function SegCopyView({ p, rfm }: { p: PersonalizeResult; rfm: RfmResult }) {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-3">
        {p.briefs.filter((b) => b.count > 0).map((b) => (
          <div key={b.key} className="rounded-xl p-4 border" style={card}>
            <p className="font-semibold text-sm">{segmentInfo[b.key].name} · {b.count} 人{b.small && <span className="ml-2 text-xs" style={{ color: '#f59e0b' }}>人數少，僅供參考</span>}</p>
            <p className="text-xs mt-1" style={muted}>{segmentInfo[b.key].blurb}</p>
            <p className="text-sm mt-2">
              <b>最偏愛：</b>
              {b.topCats.length ? b.topCats.map((c) => `${c.category}（${c.index.toFixed(1)}×）`).join('、') : '沒有品類資料，或人數太少看不出來'}
            </p>
            <p className="text-sm mt-1" style={secondary}><b>第一件事：</b>{segmentInfo[b.key].action}</p>
          </div>
        ))}
      </div>
      <p className="text-xs" style={muted}>偏好指數（×）＝這群買過該品類的比例 ÷ 全體買過的比例；1× 是跟大家一樣，2× 是兩倍偏愛。</p>
      <PromptBox title="提示詞：為每個客群寫訊息（只含彙總數字）" text={p.hasCategories ? segmentBriefPrompt(p) : segmentMessagePrompt(rfm)} />
      <div className="rounded-xl p-4 border" style={card}>
        <h4 className="font-semibold text-sm mb-2">AI 寫完之後，逐條檢查</h4>
        <ul className="text-sm space-y-1.5 list-disc pl-5" style={secondary}>
          <li><b>製造焦慮的字眼</b>：「最後機會」「限時」「只剩」，刪掉。</li>
          <li><b>偷偷加上的優惠</b>：你沒提供折扣，它卻寫「享 9 折」？承諾了就要兌現。</li>
          <li><b>讓人覺得被監視</b>：「我們發現你買過…」「看你很久沒來了」，改成中性的說法。</li>
          <li><b>推論敏感特徵</b>：不要從購買品類推論健康、年齡、家庭狀況，並寫進訊息裡。</li>
          <li><b>分不同客群，是不是只有換稱呼</b>：各群的訊息如果幾乎一樣，那分群就沒有用到。</li>
          <li><b>沒有衡量方式</b>：每則都該說明怎麼知道有沒有效，而且要有不聯絡的對照組。</li>
        </ul>
      </div>
    </div>
  );
}

// ── 第 3 天：自動化觸發清單 ───────────────────────────────────
export function TriggersView({ t }: { t: TriggerResult }) {
  const max = Math.max(...t.stats.map((s) => s.matched), 1);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat value={`${t.eligible.toLocaleString()}`} label="有購買紀錄的顧客" />
        <Stat value={`${t.uniqueTotal.toLocaleString()}`} label="去重後會收到訊息的人" />
        <Stat value={`${t.overlapPeople.toLocaleString()}`} label="同時符合多條的人" />
      </div>
      <p className="text-sm" style={secondary}>
        同一個人可能同時符合好幾條。如果每條各自發送，他會在同一天收到好幾則——所以要排優先序：{TRIGGER_PRIORITY.map((id) => id.toUpperCase()).join(' → ')}，只留第一條。
      </p>
      <div className="space-y-3">
        {t.stats.map((s) => (
          <div key={s.def.id} className="rounded-xl p-4 border" style={card}>
            <div className="flex justify-between gap-3 flex-wrap">
              <p className="font-semibold text-sm">{s.def.id.toUpperCase()}　{s.def.name}</p>
              <p className="text-sm" style={muted}>符合 {s.matched.toLocaleString()} 人 · 去重後 {s.unique.toLocaleString()} 人</p>
            </div>
            <div className="mt-2"><Bar value={s.matched / max} color="var(--color-brand)" label={s.def.name} /></div>
            <dl className="text-sm mt-3 space-y-1" style={secondary}>
              <div><dt className="inline font-semibold">條件：</dt><dd className="inline">{s.def.condition}</dd></div>
              <div><dt className="inline font-semibold">做法：</dt><dd className="inline">{s.def.action}</dd></div>
              <div><dt className="inline font-semibold">不要打擾：</dt><dd className="inline">{s.def.suppress}</dd></div>
              <div><dt className="inline font-semibold">衡量：</dt><dd className="inline">{s.def.metric}</dd></div>
            </dl>
          </div>
        ))}
      </div>
      <p className="text-xs" style={muted}>
        門檻（30、90、180 天、1.5 倍、前 20%）是起點，不是真理。上線後依你的回購節奏調整；調整之前，先看第 2 天的回購間隔分佈。
      </p>
    </div>
  );
}

export function Insight3View({ p, t }: { p: PersonalizeResult; t: TriggerResult }) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={secondary}>把下面的提示詞貼到你的 AI 工具（只含彙總數字，沒有個人資料），請它寫成規格。</p>
      <PromptBox title="提示詞 A：推薦規則的規格" text={recommendPrompt(p)} />
      <PromptBox title="提示詞 B：自動化觸發的規格" text={triggerSpecPrompt(t)} />
      <div className="rounded-xl p-4 border" style={card}>
        <h4 className="font-semibold text-sm mb-2">審查規格時，特別檢查</h4>
        <ul className="text-sm space-y-1.5 list-disc pl-5" style={secondary}>
          <li><b>沒有頻率上限</b>：每人每 N 天最多幾則？沒有的話，四條觸發疊起來會變成轟炸。</li>
          <li><b>沒有排除條件</b>：剛退貨、剛客訴、要求停止接收的人，是不是被排除？</li>
          <li><b>憑空多出來的數字</b>：它引用了你沒給的轉換率、預期營收？一律刪掉。</li>
          <li><b>沒有同意與停發機制</b>：沒寫「只發給同意的人」「附取消方式」，要它補上。</li>
          <li><b>沒有對照組</b>：每條觸發都該寫「留一組不聯絡的人」，否則上線後永遠不知道有沒有效。</li>
        </ul>
      </div>
    </div>
  );
}

// ── 第 4 天：對照組模擬 ───────────────────────────────────────
export function ExperimentView({ e }: { e: ExperimentResult }) {
  if (!e.available) {
    return (
      <p className="text-sm rounded-xl px-4 py-3 border" style={{ ...card, borderColor: '#f59e0b' }} role="status">
        這一段目前無法進行。{e.reason}
        <span className="block mt-2" style={muted}>你可以直接進入下一段；想練習這一段，可以回到開頭改用示範資料。</span>
      </p>
    );
  }
  const s = e.split;
  return (
    <div className="space-y-5">
      <p className="text-sm" style={secondary}>
        我們假裝在資料最後 30 天之前辦了一場活動，對象是活動前買過的 {e.eligible.toLocaleString()} 位顧客——<b>但實際上什麼都沒做</b>。看 30 天後有買的比例：
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Stat value={pct(e.baseline)} label="基準回購率（30 天）" />
        <Stat value={`${s.diffPp >= 0 ? '+' : ''}${s.diffPp.toFixed(1)} 點`} label={`隨機兩組的差距（A ${pct(s.rateA)} · B ${pct(s.rateB)}）`} />
        <Stat value={`${e.selected.diffPp >= 0 ? '+' : ''}${e.selected.diffPp.toFixed(1)} 點`} label="高消費組比其他人高" />
      </div>
      <section className="rounded-xl p-4 border space-y-2" style={card}>
        <h3 className="font-semibold">① 隨機分兩組，差距也不是 0</h3>
        <p className="text-sm" style={secondary}>
          這次分組：A 組 {s.nA} 人、B 組 {s.nB} 人，差 {s.diffPp.toFixed(1)} 個百分點（信賴區間 {s.ciLowPp.toFixed(1)} 至 {s.ciHighPp.toFixed(1)}）。
          重複隨機分組 {e.noise.splits} 次，95% 的情況，差距落在 <b>{e.noise.p025Pp.toFixed(1)} 至 {e.noise.p975Pp.toFixed(1)}</b> 個百分點；
          有 {Math.round(e.noise.shareOver1pp * 100)}% 的分法差距超過 1 個百分點。
        </p>
        <p className="text-sm"><b>意思是：</b>如果你的活動「看起來」讓回購率提高了 1 個百分點，在這個客群大小下，那完全可能只是運氣。</p>
      </section>
      <section className="rounded-xl p-4 border space-y-2" style={card}>
        <h3 className="font-semibold">② 挑好客人，成效一定看起來很好</h3>
        <p className="text-sm" style={secondary}>
          累計消費前 20% 的 {e.selected.nTop} 位顧客，30 天回購率 {pct(e.selected.rateTop)}；其他 {e.selected.nRest} 位只有 {pct(e.selected.rateRest)}。
          什麼都沒做，就差 {e.selected.diffPp.toFixed(1)} 個百分點。
        </p>
        <p className="text-sm"><b>意思是：</b>如果你只對好客人發優惠，再跟沒收到的人比較，你會以為優惠有神效。正確做法是：先決定對象，<b>再從同一批對象裡隨機留一組不聯絡</b>。</p>
      </section>
      <p className="text-xs" style={muted}>
        分組方式：用顧客編號算出固定的雜湊值，再與第幾次分組混合後分成兩組，所以每次重新整理結果都一樣、也不需要真的寄出任何東西。
      </p>
    </div>
  );
}

// ── 第 4 天：對照組規劃器 ─────────────────────────────────────
export function HoldoutView({ e, t }: { e: ExperimentResult; t: TriggerResult }) {
  const options = [
    ...(e.available ? [{ id: 'all', label: '活動前買過的全部顧客', n: e.eligible }] : []),
    ...t.stats.filter((s) => s.unique > 0).map((s) => ({ id: s.def.id, label: `${s.def.id.toUpperCase()} ${s.def.name}`, n: s.unique })),
  ];
  const [pick, setPick] = useState(options[0]?.id ?? '');
  const [holdout, setHoldout] = useState(20);
  const [baseline, setBaseline] = useState(e.available ? Math.round(e.baseline * 1000) / 10 : 10);
  const [lift, setLift] = useState(2);
  const chosen = options.find((o) => o.id === pick) ?? options[0];
  const p1 = baseline / 100;
  const p2 = (baseline + lift) / 100;
  const need = requiredPerGroup(p1, p2);
  const nC = chosen ? Math.floor((chosen.n * holdout) / 100) : 0;
  const nT = chosen ? chosen.n - nC : 0;
  const mde = chosen ? minDetectablePp(p1, chosen.n, holdout / 100) : NaN;
  const enough = Number.isFinite(need) && nC >= need && nT >= need;
  const sampleCase = requiredPerGroup(SAMPLE_SIZE_CASE.p1, SAMPLE_SIZE_CASE.p2);
  const field = 'mt-1 w-full px-3 py-2 rounded-lg border text-sm';
  const fieldStyle = { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-surface-lighter)' } as const;
  return (
    <div className="space-y-5">
      <section className="rounded-xl p-4 border text-sm space-y-2" style={card}>
        <h3 className="font-semibold">公式</h3>
        <p>每組至少 n ＝ (zα + zβ)² × (p1(1−p1) + p2(1−p2)) ÷ (p2 − p1)²，無條件進位。</p>
        <p style={secondary}>zα＝{Z_ALPHA}（顯著水準 5%，雙尾）、zβ＝{Z_POWER}（檢定力 80%：真的有效時，有八成機會看得出來）。這是教學用的近似值。</p>
        <p style={secondary}>固定情境：基準 {SAMPLE_SIZE_CASE.p1 * 100}%，想偵測提升到 {SAMPLE_SIZE_CASE.p2 * 100}%，每組要 <b>{sampleCase.toLocaleString()}</b> 人。想偵測的差距減半，需要的人數大約變成四倍。</p>
      </section>

      {options.length === 0 ? (
        <p className="text-sm" style={muted}>目前沒有可用的對象人數（資料太少），規劃器無法使用。</p>
      ) : (
        <section className="rounded-xl p-4 border space-y-4" style={card}>
          <h3 className="font-semibold">用你的資料規劃</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm">對象
              <select value={pick} onChange={(ev) => setPick(ev.target.value)} className={field} style={fieldStyle}>
                {options.map((o) => <option key={o.id} value={o.id}>{o.label}（{o.n.toLocaleString()} 人）</option>)}
              </select>
            </label>
            <label className="text-sm">對照組比例（不聯絡的人）
              <select value={holdout} onChange={(ev) => setHoldout(Number(ev.target.value))} className={field} style={fieldStyle}>
                {[10, 20, 30, 50].map((v) => <option key={v} value={v}>{v}%</option>)}
              </select>
            </label>
            <label className="text-sm">基準回購率（%，預設是第 1 段算出的）
              <input type="number" min={1} max={90} step={0.1} value={baseline} onChange={(ev) => setBaseline(Math.min(90, Math.max(1, Number(ev.target.value) || 1)))} className={field} style={fieldStyle} />
            </label>
            <label className="text-sm">你預期的提升（百分點）
              <input type="number" min={0.5} max={30} step={0.5} value={lift} onChange={(ev) => setLift(Math.min(30, Math.max(0.5, Number(ev.target.value) || 0.5)))} className={field} style={fieldStyle} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat value={`${nT.toLocaleString()} / ${nC.toLocaleString()}`} label="發送組 / 對照組（人）" />
            <Stat value={Number.isFinite(need) ? need.toLocaleString() : '—'} label="每組至少需要（人）" />
            <Stat value={Number.isFinite(mde) ? `${mde.toFixed(1)} 點` : '—'} label="這樣的分法能可靠偵測的最小提升" />
          </div>
          <p className="text-sm rounded-lg px-3 py-2 border" style={{ ...card, borderColor: enough ? '#22c55e' : '#f59e0b' }} role="status">
            {enough
              ? `✅ 以你預期的提升 ${lift} 個百分點，這樣的分法夠大，有八成機會看出來。`
              : `⚠️ 以你預期的提升 ${lift} 個百分點，每組需要 ${Number.isFinite(need) ? need.toLocaleString() : '—'} 人，你的對照組只有 ${nC.toLocaleString()} 人。這場活動就算有效，也很可能看不出來。可以：合併多次活動一起評估、拉長期間、換更大的對象，或只做預期效果更大的活動。`}
          </p>
          <p className="text-xs" style={muted}>
            留對照組的代價是少寄給 {nC.toLocaleString()} 人，但沒有對照組，你永遠不知道這場活動是不是白做。基準回購率用的是整體的粗估，各群實際的基準可能更高或更低。
          </p>
        </section>
      )}
    </div>
  );
}

// ── 第 4 天：風險清單 ─────────────────────────────────────────
const SEVERITY: Record<Risk['severity'], { label: string; color: string }> = {
  high: { label: '高', color: '#ef4444' },
  medium: { label: '中', color: '#f59e0b' },
  low: { label: '低', color: 'var(--color-brand-light)' },
};

export function RisksView({ risks }: { risks: Risk[] }) {
  return (
    <div className="space-y-4">
      <p className="text-sm" style={secondary}>這份清單是依你的資料自己的特徵產生的。看完之後，選出你最擔心的兩條，把降低的做法寫在「我學到」。</p>
      {risks.map((r) => (
        <div key={r.id} className="rounded-xl p-4 border" style={{ ...card, borderColor: r.severity === 'high' ? SEVERITY.high.color : card.borderColor }}>
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 mt-0.5" style={{ color: SEVERITY[r.severity].color, border: `1px solid ${SEVERITY[r.severity].color}` }}>{SEVERITY[r.severity].label}</span>
            <p className="font-medium text-sm">{r.title}</p>
          </div>
          <p className="text-sm mt-2" style={secondary}>{r.detail}</p>
          <p className="text-sm mt-1"><b>怎麼降低：</b>{r.mitigation}</p>
        </div>
      ))}
    </div>
  );
}

// ── 第 4 天：AI 起草活動計畫 ──────────────────────────────────
export function Insight4View({ e, t }: { e: ExperimentResult; t: TriggerResult }) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={secondary}>把下面的提示詞貼到你的 AI 工具（只含彙總數字，沒有個人資料），請它起草一頁活動計畫。</p>
      <PromptBox title="提示詞：起草一頁活動計畫" text={campaignPlanPrompt(e, t)} />
      <div className="rounded-xl p-4 border" style={card}>
        <h4 className="font-semibold text-sm mb-2">審查活動計畫時，特別檢查</h4>
        <ul className="text-sm space-y-1.5 list-disc pl-5" style={secondary}>
          <li><b>有沒有隨機留對照組</b>：而且是從「同一批對象」裡隨機留，不是拿別的客群當對照。</li>
          <li><b>成功指標有沒有事先講好</b>：看完結果才挑「看起來有效」的指標，就是在騙自己。</li>
          <li><b>只比較「有點開訊息」的人</b>：會點開的人本來就比較想買，這樣比較一定贏。</li>
          <li><b>能不能判斷「無效」</b>：計畫要寫清楚什麼結果算有效、什麼算無效、什麼算「資料不夠，無法判斷」。</li>
          <li><b>有沒有提前停止條件</b>：例如客訴暴增、取消訂閱率異常。</li>
          <li><b>引用了你沒給的數字</b>：預期轉換率、預期營收，沒有依據的一律刪掉。</li>
        </ul>
      </div>
    </div>
  );
}
