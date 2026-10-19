import type { HealthReport, RfmResult } from './types';
import type { RepurchaseResult } from './repurchase';
import type { BasketResult } from './basket';
import type { ValueResult } from './value';
import { segmentInfo } from '../../data/datalab';
import { dayToString } from './normalize';

const money = (n: number) => `NT$${Math.round(n).toLocaleString()}`;
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

/** 提示詞一律只含「彙總數字」，不含任何個人層級資料 */
export function healthPrompt(r: HealthReport): string {
  const lines = r.checks.map((c) => `- [${c.level}] ${c.title}`);
  const pii = r.pii.length
    ? r.pii.map((p) => `- ${p.table}.${p.column}：${p.kind}`).join('\n')
    : '- 未偵測到明顯個資欄位';
  return `你是資料分析顧問。以下是我對一份顧客交易資料做「資料健檢」的彙總結果（只有統計數字，沒有任何個人資料）。

## 健檢結果
${lines.join('\n')}

## 個資欄位掃描
${pii}

請你：
1. 用白話說明這份資料「可以信到什麼程度」，哪些結論要打折扣；
2. 依嚴重程度排出我該先處理的三件事，各附具體做法；
3. 列出做顧客分析前必須先決定的清洗規則（例如匿名交易、退貨、重複列要怎麼處理）；
4. 提醒我這份資料在隱私上要注意什麼。
只能依據上面的數字回答，不要編造表外的數字。`;
}

export function rfmPrompt(res: RfmResult): string {
  const rows = res.segments
    .filter((s) => s.count > 0)
    .map(
      (s) =>
        `| ${segmentInfo[s.key].name} | ${s.count} | ${pct(s.countShare)} | ${pct(s.revenueShare)} | ${Math.round(s.medianR)} 天 | ${s.medianF} 次 | ${money(s.medianM)} |`,
    )
    .join('\n');
  return `你是零售顧客分析顧問。以下是我用 RFM 分群得到的彙總結果（只有統計數字，沒有任何個人資料）。
基準日：${dayToString(res.asOf)}（資料最後一天 + 1）。已排除匿名交易 ${res.excluded.anonymous} 筆；退貨不算一次購買。

| 客群 | 人數 | 佔客數 | 佔營收 | 最近購買（中位數） | 購買次數（中位數） | 累計消費（中位數） |
|---|---|---|---|---|---|---|
${rows}

請你：
1. 用白話摘要：哪幾群最值錢、哪一群最該先處理，為什麼；
2. 比較「佔客數」和「佔營收」，指出最大的落差代表什麼；
3. 針對最該處理的兩群，各提出三個具體、可以在一個月內測試的行動，並說明怎麼知道有沒有效（要留對照組）；
4. 列出這份分析的限制（例如匿名交易被排除、樣本大小）。
只能依據上面的數字回答，不要編造表外的數字。`;
}

export function segmentMessagePrompt(res: RfmResult): string {
  const rows = res.segments
    .filter((s) => s.count > 0)
    .map((s) => `- ${segmentInfo[s.key].name}（${s.count} 人）：${segmentInfo[s.key].blurb} ${segmentInfo[s.key].action}`)
    .join('\n');
  return `你是品牌文案寫手。我把顧客分成以下幾群，請針對每一群各寫一則 LINE 訊息（40 字內、語氣親切不推銷），並在每則後面用一句話說明這則訊息的目的與怎麼衡量有沒有效。

${rows}

限制：不要使用「最後機會」「限時」這類製造焦慮的詞；不要承諾我沒有提供的優惠；不要出現任何個人姓名。`;
}

export function repurchasePrompt(r: RepurchaseResult): string {
  const rows = r.buckets.map((b) => `| ${b.label} | ${b.count} |`).join('\n');
  return `你是零售顧客分析顧問。以下是我分析顧客購買週期的彙總結果（只有統計數字，沒有任何個人資料）。
定義：「購買日」是顧客有非退貨交易的日曆日，同一天買兩次只算一個購買日；回購間隔是同一位顧客相鄰兩個購買日的天數差。

- 有購買紀錄的顧客：${r.eligible} 位；買過 2 個購買日以上的回頭客：${r.repeatCustomers} 位（回購率 ${(r.repeatRate * 100).toFixed(1)}%）
- 回頭客貢獻營收：${(r.repeatRevenueShare * 100).toFixed(1)}%
- 回購間隔（共 ${r.intervals} 次）：中位數 ${r.median} 天，P25 ${r.p25} 天，P75 ${r.p75} 天
- 已超過自己平常回購節奏 1.5 倍的回頭客：${r.dueNow} 位

| 回購間隔 | 次數 |
|---|---|
${rows}

請你：
1. 用白話說明這群顧客的購買節奏，並指出最值得注意的一點；
2. 建議「回購提醒」該在購買後第幾天發送，並說明依據；
3. 針對「已超過回購節奏」的顧客，提出三個一個月內可測試的行動，並說明怎麼知道有沒有效（要留對照組）；
4. 列出這份分析的限制。
只能依據上面的數字回答，不要編造表外的數字。`;
}

export function basketPrompt(b: BasketResult): string {
  if (!b.available) return `（這份資料目前無法做商品關聯分析：${b.reason ?? ''}）`;
  const fmt = (s: BasketResult['topByLift']) =>
    s.slice(0, 8).map((x) => `| ${x.a} × ${x.b} | ${x.nAB} | ${x.lift.toFixed(2)} | ${(x.confAB * 100).toFixed(0)}% / ${(x.confBA * 100).toFixed(0)}% |`).join('\n');
  return `你是零售商品分析顧問。以下是我的商品關聯分析（只有統計數字，沒有任何個人資料）。
定義：購物籃＝一筆非退貨交易；同一張單同一品類只算一次；同時出現次數至少 ${b.minCount} 次的配對才列入；共 ${b.baskets} 個購物籃、${b.groups} 個品類。
lift（提升度）＝同時出現的比例 ÷（兩者各自出現比例的乘積）；大於 1 代表比「碰巧都熱賣」更常一起出現，接近 1 代表只是都熱賣。

【依 lift 排序】
| 品類配對 | 同時出現次數 | lift | A→B／B→A 信心 |
|---|---|---|---|
${fmt(b.topByLift)}

【依同時出現次數排序】
| 品類配對 | 同時出現次數 | lift | A→B／B→A 信心 |
|---|---|---|---|
${fmt(b.topByCount)}

請你：
1. 分辨哪些配對是「真的相關」，哪些只是「都很熱賣」，並說明依據；
2. 針對 lift 最高的兩組，各提出一個可以在一個月內測試的做法（組合推薦、陳列、搭售），並說明怎麼知道有沒有效；
3. 列出這份分析的限制（例如只看兩兩配對、沒有考慮價格與季節）。
只能依據上面的數字回答，不要編造表外的數字。`;
}

export function valuePrompt(v: ValueResult, repeatRevenueShare: number): string {
  return `你是零售顧客價值分析顧問。以下是我分析顧客價值的彙總結果（只有統計數字，沒有任何個人資料）。
定義：每位顧客的累計消費＝非退貨金額 + 該顧客退貨金額（退貨為負），最低 0；沒有顧客編號的交易不納入顧客層級統計；客單價是每筆非退貨交易的金額（含沒有顧客編號的交易）。

- 每位顧客累計消費：平均 NT$${Math.round(v.spendMean).toLocaleString()}、中位數 NT$${Math.round(v.spendMedian).toLocaleString()}
- 客單價：平均 NT$${Math.round(v.aovMean).toLocaleString()}、中位數 NT$${Math.round(v.aovMedian).toLocaleString()}
- 回頭客（2 個購買日以上）貢獻營收：${(repeatRevenueShare * 100).toFixed(1)}%
- 營收集中度：${v.tiers.map((t) => `${t.label}（${t.customers} 位）貢獻 ${(t.share * 100).toFixed(1)}%`).join('；')}

請你：
1. 用白話解釋「平均」與「中位數」為什麼不一樣，以及這代表什麼；
2. 如果營收很集中，說明這對經營的風險與機會；
3. 提出三個「提高顧客價值」的做法，並說明各自怎麼驗證有沒有效；
4. 列出這份分析的限制。
只能依據上面的數字回答，不要編造表外的數字。`;
}
