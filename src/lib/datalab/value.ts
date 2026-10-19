import type { Dataset, RfmResult } from './types';
import { customerStats } from './rfm';
import { median } from './stats';

export interface ValueResult {
  /** 客單價：每筆非退貨交易的金額（含沒有顧客編號的交易） */
  aovMean: number;
  aovMedian: number;
  /** 每位顧客的累計消費（淨額，扣掉退貨，最低 0） */
  spendMean: number;
  spendMedian: number;
  /** 累計消費最高的 20% 顧客貢獻的營收比例 */
  top20Share: number;
  /** 三層：前 20%、中間 30%、後 50% 的顧客各貢獻多少營收 */
  tiers: { label: string; customers: number; share: number }[];
}

export function runValue(ds: Dataset, rfm: RfmResult): ValueResult {
  const orders = ds.txns.filter((t) => !t.isReturn).map((t) => t.amount);
  const ms = rfm.customers.map((c) => c.m).sort((a, b) => b - a);
  const total = ms.reduce((s, v) => s + v, 0);
  const n = ms.length;
  const k1 = Math.ceil(n * 0.2);
  const k2 = Math.ceil(n * 0.5);
  const sum = (a: number, b: number) => ms.slice(a, b).reduce((s, v) => s + v, 0);
  const share = (v: number) => (total ? v / total : 0);
  return {
    aovMean: orders.length ? orders.reduce((s, v) => s + v, 0) / orders.length : 0,
    aovMedian: orders.length ? median(orders) : 0,
    spendMean: n ? total / n : 0,
    spendMedian: n ? median(ms) : 0,
    top20Share: customerStats(rfm, ds).top20Share,
    tiers: [
      { label: '前 20% 顧客', customers: k1, share: share(sum(0, k1)) },
      { label: '中間 30% 顧客', customers: k2 - k1, share: share(sum(k1, k2)) },
      { label: '後 50% 顧客', customers: n - k2, share: share(sum(k2, n)) },
    ],
  };
}
