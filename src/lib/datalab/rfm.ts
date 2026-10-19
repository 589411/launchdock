import type { Dataset, RfmCustomer, RfmResult, SegmentKey, SegmentStat } from './types';
import { median } from './stats';

export const SEGMENT_ORDER: SegmentKey[] = [
  'champion',
  'loyal',
  'newPotential',
  'atRiskBig',
  'attention',
  'dormant',
  'lost',
];

/** (cnt/N) 乘 5 再無條件進位，全程整數運算避免浮點誤差 */
function ceil5(cnt: number, n: number): number {
  return Math.min(5, Math.max(1, Math.floor((5 * cnt + n - 1) / n)));
}

/** 值 → 「<= 該值」的客數（升冪累計） */
function cumulativeLE(values: number[]): Map<number, number> {
  const sorted = [...values].sort((a, b) => a - b);
  const m = new Map<number, number>();
  for (let i = 0; i < sorted.length; i++) m.set(sorted[i], i + 1); // 同值取最後一個位置 = 含自己的累計
  return m;
}

/** 值 → 「>= 該值」的客數（降冪累計） */
function cumulativeGE(values: number[]): Map<number, number> {
  const sorted = [...values].sort((a, b) => b - a);
  const m = new Map<number, number>();
  for (let i = 0; i < sorted.length; i++) m.set(sorted[i], i + 1);
  return m;
}

export function classify(rScore: number, fm: number, f: number): SegmentKey {
  if (rScore >= 4 && fm >= 4) return 'champion';
  if (rScore >= 3 && fm >= 3) return 'loyal';
  if (rScore >= 4 && f === 1) return 'newPotential';
  if (rScore <= 2 && fm >= 4) return 'atRiskBig';
  if (rScore === 3) return 'attention';
  if (rScore === 2) return 'dormant';
  return 'lost';
}

/**
 * RFM 客群分群。
 * - 只算有會員編號且至少一筆「非退貨」交易的顧客；匿名交易不進客戶分析。
 * - R＝基準日 − 最後一次非退貨消費日；F＝非退貨交易筆數；M＝非退貨金額 + 該顧客退貨金額（退貨為負），最低 0。
 * - 三項各分 1..5 分（同值同分；R 越近分越高）；FM＝(F 分 + M 分) 四捨五入（0.5 進位）。
 */
export function runRfm(ds: Dataset): RfmResult {
  const acc = new Map<string, { lastDay: number; f: number; sum: number; ret: number }>();
  let anonymous = 0;
  let returns = 0;
  for (const t of ds.txns) {
    if (t.isReturn) returns++;
    if (t.customerId === null) {
      anonymous++;
      continue;
    }
    let a = acc.get(t.customerId);
    if (!a) {
      a = { lastDay: -Infinity, f: 0, sum: 0, ret: 0 };
      acc.set(t.customerId, a);
    }
    if (t.isReturn) a.ret += t.amount;
    else {
      a.f++;
      a.sum += t.amount;
      if (t.day > a.lastDay) a.lastDay = t.day;
    }
  }

  const base = [...acc.entries()]
    .filter(([, a]) => a.f > 0)
    .map(([id, a]) => ({ id, r: ds.asOf - a.lastDay, f: a.f, m: Math.max(0, a.sum + a.ret) }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const n = base.length;
  const rGE = cumulativeGE(base.map((c) => c.r));
  const fLE = cumulativeLE(base.map((c) => c.f));
  const mLE = cumulativeLE(base.map((c) => c.m));

  const customers: RfmCustomer[] = base.map((c) => {
    const rScore = ceil5(rGE.get(c.r)!, n);
    const fScore = ceil5(fLE.get(c.f)!, n);
    const mScore = ceil5(mLE.get(c.m)!, n);
    const fm = Math.floor((fScore + mScore + 1) / 2);
    return { ...c, rScore, fScore, mScore, fm, segment: classify(rScore, fm, c.f) };
  });

  const totalM = customers.reduce((s, c) => s + c.m, 0);
  const segments: SegmentStat[] = SEGMENT_ORDER.map((key) => {
    const cs = customers.filter((c) => c.segment === key);
    const sumM = cs.reduce((s, c) => s + c.m, 0);
    return {
      key,
      count: cs.length,
      countShare: n ? cs.length / n : 0,
      sumM,
      revenueShare: totalM ? sumM / totalM : 0,
      medianR: median(cs.map((c) => c.r)),
      medianF: median(cs.map((c) => c.f)),
      medianM: median(cs.map((c) => c.m)),
    };
  });

  const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
  for (const c of customers) grid[c.rScore - 1][c.fm - 1]++;

  return { asOf: ds.asOf, customers, segments, grid, excluded: { anonymous, returns } };
}

/** 回購間隔（天）：同一顧客不同購買日的相鄰差，只看非退貨交易 */
export function repurchaseIntervals(ds: Dataset): number[] {
  const days = new Map<string, Set<number>>();
  for (const t of ds.txns) {
    if (t.isReturn || t.customerId === null) continue;
    let s = days.get(t.customerId);
    if (!s) days.set(t.customerId, (s = new Set()));
    s.add(t.day);
  }
  const out: number[] = [];
  for (const s of days.values()) {
    const arr = [...s].sort((a, b) => a - b);
    for (let i = 1; i < arr.length; i++) out.push(arr[i] - arr[i - 1]);
  }
  return out;
}
