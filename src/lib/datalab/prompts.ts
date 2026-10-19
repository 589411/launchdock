import type { HealthReport, RfmResult } from './types';
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
    .map((s) => `- ${segmentInfo[s.key].name}（${s.count} 人）：${segmentInfo[s.key].blurb}${segmentInfo[s.key].action}`)
    .join('\n');
  return `你是品牌文案寫手。我把顧客分成以下幾群，請針對每一群各寫一則 LINE 訊息（40 字內、語氣親切不推銷），並在每則後面用一句話說明這則訊息的目的與怎麼衡量有沒有效。

${rows}

限制：不要使用「最後機會」「限時」這類製造焦慮的詞；不要承諾我沒有提供的優惠；不要出現任何個人姓名。`;
}
