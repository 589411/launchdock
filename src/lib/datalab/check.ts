import type { Dataset, RfmResult } from './types';
import type { TouchpointResult } from './touchpoints';
import type { CheckSpec, ExpectedKey } from '../../data/workshop';
import { customerStats } from './rfm';
import type { RepurchaseResult } from './repurchase';
import type { BasketResult } from './basket';
import { actionableRule, type PersonalizeResult } from './personalize';
import type { TriggerResult } from './triggers';
import { requiredPerGroup, SAMPLE_SIZE_CASE, type ExperimentResult } from './experiment';

/** 工作坊「對答案」的標準答案：全部由資料直接算出，不依賴 LLM */
export function expectedValues(
  ds: Dataset,
  touch: TouchpointResult,
  rfm: RfmResult,
  day2?: { repurchase: RepurchaseResult; basket: BasketResult },
  day34?: { personalize: PersonalizeResult; triggers: TriggerResult; experiment: ExperimentResult },
): Record<ExpectedKey, number> {
  const st = customerStats(rfm, ds);
  return {
    // 第 2 天：沒有商品資料等原因算不出來時是 NaN，畫面會略過這個核對項
    repeatRate: day2 ? day2.repurchase.repeatRate * 100 : NaN,
    repeatRevenueShare: day2 ? day2.repurchase.repeatRevenueShare * 100 : NaN,
    topPairCount: day2 && day2.basket.available && day2.basket.topByCount[0] ? day2.basket.topByCount[0].nAB : NaN,
    // 第 3、4 天：同樣，算不出來就是 NaN
    ruleAudience: day34 && actionableRule(day34.personalize) ? actionableRule(day34.personalize)!.audience : NaN,
    triggerUnique: day34 ? day34.triggers.uniqueTotal : NaN,
    baselineRate: day34 && day34.experiment.available ? day34.experiment.baseline * 100 : NaN,
    selectionGap: day34 && day34.experiment.available ? day34.experiment.selected.diffPp : NaN,
    sampleSize: requiredPerGroup(SAMPLE_SIZE_CASE.p1, SAMPLE_SIZE_CASE.p2),
    memberShare: touch.memberShare * 100,
    anonymousCount: touch.anonymousTxns,
    returnCount: ds.txns.filter((t) => t.isReturn).length,
    onceOnly: st.onceOnly,
    top20Share: st.top20Share * 100,
    medianInterval: st.medianInterval,
  };
}

/** 從學員貼的文字取出數字：容許 %、千分位、單位（天、位、筆）；百分比也容許寫成 0.63 */
export function parseClaim(raw: string, unit: CheckSpec['unit'], expected: number): number | null {
  const m = raw.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  let v = Number(m[0]);
  if (unit === 'percent' && v <= 1 && expected > 1 && !/%/.test(raw)) v *= 100;
  return v;
}

export type CheckStatus = 'empty' | 'match' | 'off';

export interface CheckResult {
  status: CheckStatus;
  claimed: number | null;
  expected: number;
  /** claimed − expected */
  diff: number | null;
}

const TOLERANCE: Record<CheckSpec['unit'], number> = { count: 0, percent: 1, days: 1, pp: 1 };

export function compareClaim(spec: CheckSpec, raw: string | undefined, expected: number): CheckResult {
  if (!raw || raw.trim() === '' || !Number.isFinite(expected)) return { status: 'empty', claimed: null, expected, diff: null };
  const claimed = parseClaim(raw, spec.unit, expected);
  if (claimed === null) return { status: 'empty', claimed: null, expected, diff: null };
  const diff = claimed - expected;
  return { status: Math.abs(diff) <= TOLERANCE[spec.unit] + 1e-9 ? 'match' : 'off', claimed, expected, diff };
}

export function formatExpected(spec: CheckSpec, v: number): string {
  if (spec.unit === 'percent') return `${v.toFixed(1)}%`;
  if (spec.unit === 'pp') return `${v.toFixed(1)} 個百分點`;
  if (spec.unit === 'days') return v === 0 ? '沒有人買過兩次（無法計算）' : `${Math.round(v * 10) / 10} 天`;
  return `${Math.round(v).toLocaleString()}`;
}
