import type { Dataset } from './types';

export interface Slice {
  label: string;
  count: number;
  /** 淨營收（含退貨扣除） */
  revenue: number;
  memberShare: number;
}

export interface TouchpointResult {
  txns: number;
  memberTxns: number;
  anonymousTxns: number;
  /** 有顧客編號的交易佔比 0..1 */
  memberShare: number;
  /** 有顧客編號的交易佔營收比 0..1 */
  memberRevenueShare: number;
  byStore: Slice[];
  byChannel: Slice[];
  /** 每月淨營收與筆數，依月份排序 */
  monthly: { month: string; revenue: number; count: number }[];
  /** 週日起算 0..6 的交易筆數 */
  weekday: number[];
}

function slices(ds: Dataset, pick: (t: Dataset['txns'][number]) => string | undefined): Slice[] {
  const m = new Map<string, { count: number; revenue: number; member: number }>();
  for (const t of ds.txns) {
    const k = pick(t);
    if (!k) continue;
    const a = m.get(k) ?? { count: 0, revenue: 0, member: 0 };
    a.count++;
    a.revenue += t.amount;
    if (t.customerId !== null) a.member++;
    m.set(k, a);
  }
  return [...m.entries()]
    .map(([label, a]) => ({ label, count: a.count, revenue: a.revenue, memberShare: a.count ? a.member / a.count : 0 }))
    .sort((x, y) => y.revenue - x.revenue);
}

/** 顧客接觸點：交易從哪裡來、有多少留下了顧客編號、時間分佈 */
export function runTouchpoints(ds: Dataset): TouchpointResult {
  const memberTxns = ds.txns.filter((t) => t.customerId !== null).length;
  let memberRev = 0;
  let totalRev = 0;
  const months = new Map<string, { revenue: number; count: number }>();
  const weekday = Array(7).fill(0);
  for (const t of ds.txns) {
    totalRev += t.amount;
    if (t.customerId !== null) memberRev += t.amount;
    const d = new Date(t.day * 86400000);
    const month = d.toISOString().slice(0, 7);
    const a = months.get(month) ?? { revenue: 0, count: 0 };
    a.revenue += t.amount;
    a.count++;
    months.set(month, a);
    weekday[d.getUTCDay()]++;
  }
  return {
    txns: ds.txns.length,
    memberTxns,
    anonymousTxns: ds.txns.length - memberTxns,
    memberShare: ds.txns.length ? memberTxns / ds.txns.length : 0,
    memberRevenueShare: totalRev ? memberRev / totalRev : 0,
    byStore: slices(ds, (t) => t.store),
    byChannel: slices(ds, (t) => t.channel),
    monthly: [...months.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([month, a]) => ({ month, ...a })),
    weekday,
  };
}
