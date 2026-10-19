import type { Dataset, RfmResult } from './types';
import { median } from './stats';

export type TriggerId = 't1' | 't2' | 't3' | 't4';

export interface TriggerDef {
  id: TriggerId;
  name: string;
  /** 白話條件（也是給 AI 的定義） */
  condition: string;
  /** 建議的做法 */
  action: string;
  /** 不要打擾的人 */
  suppress: string;
  /** 怎麼衡量有沒有效 */
  metric: string;
}

/** 優先序：同一個人同時符合多條時，只留最前面那條，避免一天收到好幾則 */
export const TRIGGER_PRIORITY: TriggerId[] = ['t4', 't2', 't1', 't3'];

export const TRIGGER_DEFS: Record<TriggerId, TriggerDef> = {
  t4: {
    id: 't4',
    name: '高價值顧客快流失',
    condition: '累計消費排在前 20%，而且距離上次購買超過 90 天',
    action: '個別關心，不用群發折扣：誰、買過什麼、為什麼不來。可以交給店員或客服。',
    suppress: '近 14 天內已收過任何行銷訊息的人；最近有客訴或退貨糾紛的人。',
    metric: '30 天內回來購買的比例（對照留著不聯絡的一組）。',
  },
  t2: {
    id: 't2',
    name: '回購節奏提醒',
    condition: '買過 2 個購買日以上，而且距離上次購買已超過自己平常回購間隔的 1.5 倍',
    action: '「你上次買的差不多該補了」的提醒，附上一鍵回購連結。',
    suppress: '近 14 天內已收過訊息的人；已經超過 180 天沒來的人另外處理。',
    metric: '14 天內回來購買的比例（對照留著不聯絡的一組）。',
  },
  t1: {
    id: 't1',
    name: '新客第二次購買',
    condition: '只有 1 個購買日，而且距離首購 30 天內',
    action: '感謝 + 一個具體的回購理由（搭配品、使用小技巧），不要急著給折扣。',
    suppress: '退貨的人（先處理售後）；已經收過歡迎訊息但還沒滿 7 天的人。',
    metric: '首購後 60 天內有第二個購買日的比例（對照留著不聯絡的一組）。',
  },
  t3: {
    id: 't3',
    name: '沉睡喚醒',
    condition: '買過 2 個購買日以上，而且距離上次購買 91 至 180 天',
    action: '低成本喚醒：新品或到貨通知。喚醒不到，就放手，不要連續轟炸。',
    suppress: '近 30 天內已收過訊息的人；曾經要求停止接收的人。',
    metric: '30 天內回來購買的比例（對照留著不聯絡的一組）。',
  },
};

export interface TriggerStat {
  def: TriggerDef;
  /** 符合條件的人數（沒有去重） */
  matched: number;
  /** 依優先序去重之後，實際會收到這一條訊息的人數 */
  unique: number;
}

export interface TriggerResult {
  /** 有購買紀錄的顧客數（分母） */
  eligible: number;
  stats: TriggerStat[];
  /** 去重後，會收到至少一則訊息的人數 */
  uniqueTotal: number;
  /** 符合不只一條的人數 */
  overlapPeople: number;
}

export interface CustomerFacts {
  id: string;
  purchaseDays: number;
  /** 距離上次購買的天數（基準日 − 最後購買日） */
  r: number;
  /** 自己的回購間隔中位數；只有 1 個購買日為 null */
  ownMedian: number | null;
  /** 累計消費 */
  m: number;
}

/** 每位顧客的購買日事實（購買日＝有非退貨交易的日曆日） */
export function customerFacts(ds: Dataset, rfm: RfmResult): CustomerFacts[] {
  const days = new Map<string, Set<number>>();
  for (const t of ds.txns) {
    if (t.isReturn || t.customerId === null) continue;
    let s = days.get(t.customerId);
    if (!s) days.set(t.customerId, (s = new Set()));
    s.add(t.day);
  }
  const out: CustomerFacts[] = [];
  for (const c of rfm.customers) {
    const set = days.get(c.id);
    if (!set) continue;
    const arr = [...set].sort((a, b) => a - b);
    const diffs: number[] = [];
    for (let i = 1; i < arr.length; i++) diffs.push(arr[i] - arr[i - 1]);
    out.push({ id: c.id, purchaseDays: arr.length, r: ds.asOf - arr[arr.length - 1], ownMedian: diffs.length ? median(diffs) : null, m: c.m });
  }
  return out;
}

export function matches(f: CustomerFacts, id: TriggerId, top20Threshold: number): boolean {
  switch (id) {
    case 't4':
      return f.m >= top20Threshold && f.r > 90;
    case 't2':
      return f.purchaseDays >= 2 && f.ownMedian !== null && f.r > 1.5 * f.ownMedian;
    case 't1':
      return f.purchaseDays === 1 && f.r <= 30;
    case 't3':
      return f.purchaseDays >= 2 && f.r >= 91 && f.r <= 180;
  }
}

export function runTriggers(ds: Dataset, rfm: RfmResult): TriggerResult {
  const facts = customerFacts(ds, rfm);
  const n = facts.length;
  const sorted = facts.map((f) => f.m).sort((a, b) => b - a);
  const threshold = n ? sorted[Math.ceil(n * 0.2) - 1] : Infinity;
  const matched: Record<TriggerId, number> = { t1: 0, t2: 0, t3: 0, t4: 0 };
  const unique: Record<TriggerId, number> = { t1: 0, t2: 0, t3: 0, t4: 0 };
  let uniqueTotal = 0;
  let overlapPeople = 0;
  for (const f of facts) {
    let first: TriggerId | null = null;
    let hits = 0;
    for (const id of TRIGGER_PRIORITY) {
      if (matches(f, id, threshold)) {
        matched[id]++;
        hits++;
        if (!first) first = id;
      }
    }
    if (first) {
      unique[first]++;
      uniqueTotal++;
      if (hits > 1) overlapPeople++;
    }
  }
  return {
    eligible: n,
    stats: TRIGGER_PRIORITY.map((id) => ({ def: TRIGGER_DEFS[id], matched: matched[id], unique: unique[id] })),
    uniqueTotal,
    overlapPeople,
  };
}
