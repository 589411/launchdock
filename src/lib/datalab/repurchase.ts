import type { Dataset, RfmResult } from './types';
import { median, quantile } from './stats';

export const BUCKET_LABELS = ['0–7 天', '8–14 天', '15–30 天', '31–60 天', '61–90 天', '91–180 天', '181 天以上'];
const BUCKET_MAX = [7, 14, 30, 60, 90, 180];

export interface RepurchaseResult {
  /** 有購買紀錄的顧客數 */
  eligible: number;
  /** 買過 2 個以上「不同購買日」的顧客數 */
  repeatCustomers: number;
  repeatRate: number;
  /** 回頭客（2 個購買日以上）的消費金額佔全部顧客的比例 */
  repeatRevenueShare: number;
  intervals: number;
  median: number;
  p25: number;
  p75: number;
  buckets: { label: string; count: number }[];
  /** 距上次購買已超過「自己平常回購間隔」1.5 倍的回頭客人數 */
  dueNow: number;
}

/**
 * 購買週期。
 * - 「購買日」＝同一位顧客有非退貨交易的日曆日；同一天買兩次只算一個購買日。
 * - 回購間隔＝同一位顧客相鄰兩個購買日的天數差。
 * - 回購率＝買過 2 個以上購買日的顧客 ÷ 有購買紀錄的顧客。
 */
export function runRepurchase(ds: Dataset, rfm: RfmResult): RepurchaseResult {
  const days = new Map<string, Set<number>>();
  for (const t of ds.txns) {
    if (t.isReturn || t.customerId === null) continue;
    let s = days.get(t.customerId);
    if (!s) days.set(t.customerId, (s = new Set()));
    s.add(t.day);
  }
  const mOf = new Map(rfm.customers.map((c) => [c.id, c.m]));
  let totalM = 0;
  for (const m of mOf.values()) totalM += m;

  const pooled: number[] = [];
  const buckets = BUCKET_LABELS.map((label) => ({ label, count: 0 }));
  let repeat = 0;
  let repeatM = 0;
  let dueNow = 0;
  for (const [id, set] of days) {
    if (set.size < 2) continue;
    repeat++;
    repeatM += mOf.get(id) ?? 0;
    const arr = [...set].sort((a, b) => a - b);
    const diffs: number[] = [];
    for (let i = 1; i < arr.length; i++) diffs.push(arr[i] - arr[i - 1]);
    for (const d of diffs) {
      pooled.push(d);
      let b = BUCKET_MAX.findIndex((mx) => d <= mx);
      if (b < 0) b = BUCKET_MAX.length;
      buckets[b].count++;
    }
    if (ds.asOf - arr[arr.length - 1] > 1.5 * median(diffs)) dueNow++;
  }
  const eligible = days.size;
  return {
    eligible,
    repeatCustomers: repeat,
    repeatRate: eligible ? repeat / eligible : 0,
    repeatRevenueShare: totalM ? repeatM / totalM : 0,
    intervals: pooled.length,
    median: pooled.length ? median(pooled) : 0,
    p25: pooled.length ? quantile(pooled, 0.25) : 0,
    p75: pooled.length ? quantile(pooled, 0.75) : 0,
    buckets,
    dueNow,
  };
}
