import type { Dataset } from './types';

export interface PairStat {
  a: string;
  b: string;
  /** 同時含有 a 與 b 的購物籃數 */
  nAB: number;
  nA: number;
  nB: number;
  /** nAB × N ÷ (nA × nB)；大於 1 表示比「碰巧都熱賣」更常一起出現 */
  lift: number;
  confAB: number;
  confBA: number;
}

export interface BasketResult {
  available: boolean;
  /** 不能分析時，用白話說明為什麼 */
  reason?: string;
  /** 購物籃數（有分組商品的非退貨交易） */
  baskets: number;
  groups: number;
  /** 一組配對至少要同時出現這麼多次才列入（避免偶然） */
  minCount: number;
  eligiblePairs: number;
  topByLift: PairStat[];
  topByCount: PairStat[];
}

const EMPTY = (reason: string): BasketResult => ({ available: false, reason, baskets: 0, groups: 0, minCount: 0, eligiblePairs: 0, topByLift: [], topByCount: [] });

/**
 * 商品關聯：哪些品類常出現在同一張單。
 * 購物籃＝一筆非退貨交易；分組＝品類（日晴用子品類）；同一張單同一品類只算一次；只看兩兩配對。
 * 門檻：同時出現次數 ≥ max(20, 購物籃數的 1%)，避免被偶然的小樣本誤導。
 */
export function runBasket(ds: Dataset): BasketResult {
  if (!ds.lines || ds.lines.length === 0) {
    return EMPTY('你的資料沒有「商品」或「品類」欄位，算不出哪些東西常一起買。如果你的系統匯出有品名或品類，加進來就能開啟這一段。');
  }
  const returnTxn = new Set<string>();
  for (const t of ds.txns) if (t.isReturn) returnTxn.add(t.id);
  const baskets = new Map<string, Set<string>>();
  for (const l of ds.lines) {
    const g = (l.category ?? '').trim();
    if (!g || returnTxn.has(l.txnId)) continue;
    let s = baskets.get(l.txnId);
    if (!s) baskets.set(l.txnId, (s = new Set()));
    s.add(g);
  }
  const N = baskets.size;
  const nOf = new Map<string, number>();
  const pairs = new Map<string, number>();
  for (const s of baskets.values()) {
    const arr = [...s].sort();
    for (const g of arr) nOf.set(g, (nOf.get(g) ?? 0) + 1);
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      const k = `${arr[i]}\u0001${arr[j]}`;
      pairs.set(k, (pairs.get(k) ?? 0) + 1);
    }
  }
  if (nOf.size < 2) return EMPTY('你的資料裡只有一種品類（或商品），沒辦法比較「哪些東西常一起買」。');
  const minCount = Math.max(20, Math.ceil(0.01 * N));
  const stats: PairStat[] = [];
  for (const [k, nAB] of pairs) {
    if (nAB < minCount) continue;
    const [a, b] = k.split('\u0001');
    const nA = nOf.get(a)!;
    const nB = nOf.get(b)!;
    stats.push({ a, b, nAB, nA, nB, lift: (nAB * N) / (nA * nB), confAB: nAB / nA, confBA: nAB / nB });
  }
  const byName = (x: PairStat, y: PairStat) => (x.a < y.a ? -1 : x.a > y.a ? 1 : x.b < y.b ? -1 : x.b > y.b ? 1 : 0);
  const topByLift = [...stats].sort((x, y) => y.lift - x.lift || y.nAB - x.nAB || byName(x, y)).slice(0, 10);
  const topByCount = [...stats].sort((x, y) => y.nAB - x.nAB || y.lift - x.lift || byName(x, y)).slice(0, 10);
  const base = { available: true, baskets: N, groups: nOf.size, minCount, eligiblePairs: stats.length, topByLift, topByCount };
  if (stats.length === 0) {
    return { ...base, available: false, reason: `購物籃只有 ${N} 個，沒有任何一組品類同時出現達 ${minCount} 次，結果會被偶然左右，不適合下結論。資料量大一些再試，或改用示範資料。` };
  }
  return base;
}
