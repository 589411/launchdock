import type { Dataset, Day, RfmResult } from './types';
import { quantile } from './stats';

/** 教學用的近似 z 值（雙尾 α=0.05、檢定力 80%） */
export const Z_ALPHA = 1.96;
export const Z_POWER = 0.84;
export const WINDOW_DAYS = 30;
const NOISE_SPLITS = 200;

export interface ExperimentResult {
  available: boolean;
  reason?: string;
  /** 假想的「活動日」＝基準日 − 30 天 */
  cutoff: Day;
  /** 活動日前買過的顧客（可以被發訊息的人） */
  eligible: number;
  /** 活動日後 30 天內有購買的比例（什麼都沒做的基準回購率） */
  baseline: number;
  /** 隨機分兩組、什麼都沒做的其中一次 */
  split: { nA: number; nB: number; rateA: number; rateB: number; diffPp: number; ciLowPp: number; ciHighPp: number };
  /** 重複隨機分組很多次，兩組差距（百分點）的分佈 */
  noise: { splits: number; p025Pp: number; p975Pp: number; shareOver1pp: number };
  /** 挑「花最多的 20%」當對象 vs 其他人：什麼都沒做，差距也很大 */
  selected: { nTop: number; rateTop: number; nRest: number; rateRest: number; diffPp: number };
}

export function emptyExperiment(reason: string): ExperimentResult {
  const z = { nA: 0, nB: 0, rateA: 0, rateB: 0, diffPp: 0, ciLowPp: 0, ciHighPp: 0 };
  return {
    available: false,
    reason,
    cutoff: 0,
    eligible: 0,
    baseline: 0,
    split: z,
    noise: { splits: 0, p025Pp: 0, p975Pp: 0, shareOver1pp: 0 },
    selected: { nTop: 0, rateTop: 0, nRest: 0, rateRest: 0, diffPp: 0 },
  };
}

/** FNV-1a 32 位元（UTF-8 位元組） */
export function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  const bytes = new TextEncoder().encode(s);
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** 第 salt 次隨機分組：把顧客雜湊值與 salt 攪在一起（murmur3 收尾），取最低位元分成 A／B */
export function groupOf(h0: number, salt: number): number {
  let x = (h0 ^ Math.imul(salt + 1, 0x9e3779b1)) | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return x & 1;
}

/**
 * 假想活動：活動日＝基準日 − 30 天；對象＝活動日前買過的顧客；結果＝活動日後 30 天內有沒有購買。
 * 什麼活動都沒辦，所以「兩組該一樣」——看實際差多少，就知道評估活動時，多大的差距才不能算是運氣。
 */
export function runExperiment(ds: Dataset, _rfm?: RfmResult): ExperimentResult {
  const cutoff = ds.asOf - WINDOW_DAYS;
  const before = new Map<string, number>(); // 活動日前的累計消費（含退貨）
  const hadBefore = new Set<string>();
  const bought = new Set<string>();
  let firstDay = Infinity;
  for (const t of ds.txns) {
    if (t.day < firstDay) firstDay = t.day;
    if (t.customerId === null) continue;
    if (t.day < cutoff) {
      before.set(t.customerId, (before.get(t.customerId) ?? 0) + t.amount);
      if (!t.isReturn) hadBefore.add(t.customerId);
    } else if (!t.isReturn) bought.add(t.customerId);
  }
  const ids = [...hadBefore].sort();
  const n = ids.length;
  if (cutoff - firstDay < 60) return emptyExperiment('資料涵蓋的期間太短（活動日之前不到 60 天），沒辦法切出「活動前」和「活動後 30 天」。換一份涵蓋較長期間的資料再試。');
  if (n < 200) return emptyExperiment(`活動日前買過的顧客只有 ${n} 位，分成兩組後每組太小，差距幾乎都是運氣。建議至少 200 位以上，或改用示範資料。`);

  const hits = ids.map((id) => (bought.has(id) ? 1 : 0));
  const h0 = ids.map(fnv1a);
  const baseline = hits.reduce((s: number, v) => s + v, 0) / n;

  const diffFor = (salt: number) => {
    let nA = 0, nB = 0, hA = 0, hB = 0;
    for (let i = 0; i < n; i++) {
      if (groupOf(h0[i], salt) === 0) { nA++; hA += hits[i]; } else { nB++; hB += hits[i]; }
    }
    return { nA, nB, rateA: nA ? hA / nA : 0, rateB: nB ? hB / nB : 0 };
  };

  const one = diffFor(0);
  const diff = one.rateB - one.rateA;
  const se = Math.sqrt((one.rateA * (1 - one.rateA)) / Math.max(1, one.nA) + (one.rateB * (1 - one.rateB)) / Math.max(1, one.nB));
  const splits = n > 200000 ? 50 : NOISE_SPLITS;
  const diffs: number[] = [];
  for (let s = 0; s < splits; s++) {
    const d = diffFor(s);
    diffs.push((d.rateB - d.rateA) * 100);
  }

  const spend = ids.map((id) => before.get(id) ?? 0);
  const ranked = [...spend].sort((a, b) => b - a);
  const k = Math.ceil(n * 0.2);
  const thr = ranked[k - 1];
  let nTop = 0, hTop = 0, nRest = 0, hRest = 0;
  for (let i = 0; i < n; i++) {
    if (spend[i] >= thr) { nTop++; hTop += hits[i]; } else { nRest++; hRest += hits[i]; }
  }
  const rateTop = nTop ? hTop / nTop : 0;
  const rateRest = nRest ? hRest / nRest : 0;

  return {
    available: true,
    cutoff,
    eligible: n,
    baseline,
    split: { ...one, diffPp: diff * 100, ciLowPp: (diff - 1.96 * se) * 100, ciHighPp: (diff + 1.96 * se) * 100 },
    noise: {
      splits,
      p025Pp: quantile(diffs, 0.025),
      p975Pp: quantile(diffs, 0.975),
      shareOver1pp: diffs.filter((d) => Math.abs(d) >= 1).length / splits,
    },
    selected: { nTop, rateTop, nRest, rateRest, diffPp: (rateTop - rateRest) * 100 },
  };
}

/** 兩組比例檢定，每組至少要多少人：n = (Zα + Zβ)² × (p1(1−p1) + p2(1−p2)) ÷ (p2 − p1)²，無條件進位 */
export function requiredPerGroup(p1: number, p2: number): number {
  if (!(p2 > p1) || p1 < 0 || p2 > 1) return NaN;
  return Math.ceil(((Z_ALPHA + Z_POWER) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2))) / (p2 - p1) ** 2);
}

/** 對象共 N 人、留 holdout 比例當對照組時，能可靠偵測到的最小提升（百分點，用基準率估變異） */
export function minDetectablePp(baseline: number, audience: number, holdoutShare: number): number {
  const nC = audience * holdoutShare;
  const nT = audience - nC;
  if (nC < 1 || nT < 1) return NaN;
  return (Z_ALPHA + Z_POWER) * Math.sqrt(baseline * (1 - baseline) * (1 / nT + 1 / nC)) * 100;
}

/** 第 4 天「樣本數」核對題的固定情境：基準 10%，想偵測提升到 12% */
export const SAMPLE_SIZE_CASE = { p1: 0.1, p2: 0.12 };
