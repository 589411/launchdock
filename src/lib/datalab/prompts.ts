import type { HealthReport, RfmResult } from './types';
import type { RepurchaseResult } from './repurchase';
import type { BasketResult } from './basket';
import type { ValueResult } from './value';
import type { PersonalizeResult } from './personalize';
import type { TriggerResult } from './triggers';
import { minDetectablePp, type ExperimentResult } from './experiment';
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

export function segmentBriefPrompt(p: PersonalizeResult): string {
  const rows = p.briefs
    .filter((b) => b.count > 0)
    .map((b) => {
      const cats = b.topCats.length ? b.topCats.map((c) => `${c.category}（偏好指數 ${c.index.toFixed(1)}）`).join('、') : '（沒有品類資料或人數太少）';
      return `- ${segmentInfo[b.key].name}（${b.count} 人${b.small ? '，人數很少，僅供參考' : ''}）：${segmentInfo[b.key].blurb} 最偏愛的品類：${cats}。第一件該做的事：${segmentInfo[b.key].action}`;
    })
    .join('\n');
  return `你是品牌文案寫手。以下是我的顧客分群與每群的偏好（只有彙總，沒有任何個人資料）。偏好指數＝這群買過該品類的比例 ÷ 全體買過的比例，大於 1 代表這群特別偏愛。

${rows}

請針對每一群各寫一則 LINE 訊息（40 字內、語氣親切不推銷），並在每則後面用一句話說明這則訊息的目的、以及怎麼衡量有沒有效（要有不聯絡的對照組）。

限制：
- 不要使用「最後機會」「限時」「只剩」這類製造焦慮的詞；
- 不要承諾我沒有提供的優惠、折扣或贈品；
- 不要出現「我們發現你買過…」這類讓人覺得被監視的句子；
- 不要出現任何個人姓名。`;
}

export function recommendPrompt(p: PersonalizeResult): string {
  if (!p.rules.length) return `（這份資料目前沒有可用的推薦規則：${p.rulesNote ?? ''}）`;
  const rows = p.rules.map((r) => `| 買了「${r.from}」→ 推薦「${r.to}」 | ${r.nAB} | ${r.lift.toFixed(2)} | ${(r.conf * 100).toFixed(0)}% | ${r.audience} |`).join('\n');
  return `你是零售推薦系統顧問。以下是我從交易資料整理出的推薦規則（只有統計數字，沒有任何個人資料）。
定義：lift 大於 1 代表比「碰巧都熱賣」更常一起買；信心＝買了前者的單，也買了後者的比例；推薦對象＝買過前者、但從沒買過後者的顧客數。

| 規則 | 同時出現次數 | lift | 信心 | 推薦對象（人） |
|---|---|---|---|---|
${rows}

請你把每一條規則寫成一份可以交給工程師的「規格」：觸發時機（顧客在哪個情境看到推薦）、顯示文案（20 字內）、排除條件（例如已買過、剛退貨）、頻率上限，以及怎麼衡量有沒有效（需要對照組）。
只能依據上面的數字，不要編造表外的數字，也不要補上我沒有提供的優惠。`;
}

export function triggerSpecPrompt(t: TriggerResult): string {
  const rows = t.stats
    .map((s) => `| ${s.def.id.toUpperCase()} ${s.def.name} | ${s.def.condition} | ${s.matched} | ${s.unique} |`)
    .join('\n');
  return `你是行銷自動化顧問。以下是我設計的四條自動化觸發規則與符合人數（只有統計數字，沒有任何個人資料）。同一個人符合多條時，依 T4 → T2 → T1 → T3 的優先序只保留第一條。

| 觸發 | 條件 | 符合人數 | 去重後 |
|---|---|---|---|
${rows}

去重後總共有 ${t.uniqueTotal} 位顧客會收到至少一則訊息（有 ${t.overlapPeople} 位同時符合兩條以上）。

請你：
1. 為每一條觸發寫一份規格：觸發條件、訊息目的、建議的發送時機、排除條件、每人頻率上限、成功指標；
2. 指出這四條之間會互相干擾的地方，並建議一個「全站頻率上限」；
3. 每一條都要說明怎麼留對照組來驗證有沒有效；
4. 提醒我上線前必須確認的合規事項（聯絡同意、停發機制）。
只能依據上面的數字，不要編造表外的數字。`;
}

export function campaignPlanPrompt(e: ExperimentResult, t: TriggerResult): string {
  if (!e.available) return `（這份資料目前無法做對照組模擬：${e.reason ?? ''}）`;
  const biggest = [...t.stats].sort((a, b) => b.unique - a.unique)[0];
  const mde = minDetectablePp(e.baseline, biggest.unique, 0.2);
  return `你是行銷成效分析顧問。以下是我的資料特徵（只有統計數字，沒有任何個人資料）。

- 活動前買過的顧客 ${e.eligible} 位；什麼都沒做時，30 天內回來購買的基準比例是 ${(e.baseline * 100).toFixed(1)}%。
- 什麼都沒做、把顧客隨機分成兩組，兩組 30 天回購率的差距，95% 的情況落在 ${e.noise.p025Pp.toFixed(1)} 至 ${e.noise.p975Pp.toFixed(1)} 個百分點之間（重複分組 ${e.noise.splits} 次）。
- 累計消費前 20% 的顧客，30 天回購率比其他人高 ${e.selected.diffPp.toFixed(1)} 個百分點（什麼都沒做）。
- 我打算對「${biggest.def.name}」這群（去重後 ${biggest.unique} 人）做一次提醒活動，並留 20% 當對照組；以基準比例估算，這樣大約能可靠偵測到 ${Number.isFinite(mde) ? mde.toFixed(1) : '（對象太少，算不出來）'} 個百分點以上的提升。

請你起草一頁活動計畫：目標與唯一的成功指標（事先講好）、對象與排除條件、怎麼隨機留對照組、活動期間與觀察期間、什麼結果算有效／無效／無法判斷、提前停止的條件，以及需要特別避免的錯誤（例如只比較有點開訊息的人）。
只能依據上面的數字，不要編造表外的數字，不要承諾任何我沒有提供的優惠。`;
}
