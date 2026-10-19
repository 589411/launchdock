import type { Dataset, RfmResult, SegmentKey } from './types';
import type { BasketResult } from './basket';
import { SEGMENT_ORDER } from './rfm';
import { median } from './stats';

export interface CatPref {
  category: string;
  /** 這群裡買過這個品類的顧客數 */
  customers: number;
  /** 這群有品類資料的顧客中，買過的比例 */
  share: number;
  /** share ÷ 全體顧客的比例；大於 1 代表這群特別偏愛 */
  index: number;
}

export interface SegmentBrief {
  key: SegmentKey;
  count: number;
  medianR: number;
  /** 這群裡有品類紀錄的顧客數（偏好的分母） */
  withCategory: number;
  /** 人數太少（< 30），偏好只能參考 */
  small: boolean;
  topCats: CatPref[];
}

export interface Rule {
  from: string;
  to: string;
  nAB: number;
  lift: number;
  /** 買了 from 的單，有多少比例也買了 to */
  conf: number;
  /** 買過 from、但從來沒買過 to 的顧客數：這條規則實際能推薦給誰 */
  audience: number;
}

export interface PersonalizeResult {
  /** 有沒有品類資料（沒有就只有客群簡報，沒有偏好與規則） */
  hasCategories: boolean;
  briefs: SegmentBrief[];
  rules: Rule[];
  rulesNote?: string;
}

const MIN_SEGMENT = 30;
const MIN_CUSTOMERS_PER_CAT = 5;
const MIN_LIFT = 1.2;

/** 值得做的規則：推薦對象至少這麼多人（lift 再高，沒人可推也沒用） */
export const MIN_RULE_AUDIENCE = 30;

/** 第一條「推薦對象夠多」的規則（規則已依 lift 排序） */
export function actionableRule(p: PersonalizeResult): Rule | undefined {
  return p.rules.find((r) => r.audience >= MIN_RULE_AUDIENCE);
}

/** 顧客買過的品類集合（只看非退貨交易、有顧客編號者） */
export function customerCategories(ds: Dataset): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  if (!ds.lines) return out;
  const owner = new Map<string, string>();
  for (const t of ds.txns) if (!t.isReturn && t.customerId !== null) owner.set(t.id, t.customerId);
  for (const l of ds.lines) {
    const g = (l.category ?? '').trim();
    const c = owner.get(l.txnId);
    if (!g || c === undefined) continue;
    let s = out.get(c);
    if (!s) out.set(c, (s = new Set()));
    s.add(g);
  }
  return out;
}

/**
 * 個人化的素材：
 * - 每個客群最偏愛的品類（偏好指數＝客群內買過的比例 ÷ 全體買過的比例）。
 * - 推薦規則「買了 A 的人，推 B」：取商品關聯 lift ≥ 1.2 的配對，方向取信心較高的那邊；
 *   可推薦對象＝買過 A 但從沒買過 B 的顧客。
 */
export function runPersonalize(ds: Dataset, rfm: RfmResult, basket: BasketResult): PersonalizeResult {
  const cats = customerCategories(ds);
  const hasCategories = cats.size > 0;

  const everyone = rfm.customers.filter((c) => cats.has(c.id));
  const all = new Map<string, number>();
  for (const c of everyone) for (const g of cats.get(c.id)!) all.set(g, (all.get(g) ?? 0) + 1);

  const briefs: SegmentBrief[] = SEGMENT_ORDER.map((key) => {
    const members = rfm.customers.filter((c) => c.segment === key);
    const withCat = members.filter((c) => cats.has(c.id));
    const seg = new Map<string, number>();
    for (const c of withCat) for (const g of cats.get(c.id)!) seg.set(g, (seg.get(g) ?? 0) + 1);
    const topCats: CatPref[] = [];
    if (withCat.length && everyone.length) {
      for (const [category, n] of seg) {
        if (n < MIN_CUSTOMERS_PER_CAT) continue;
        const share = n / withCat.length;
        const index = share / ((all.get(category) ?? 0) / everyone.length);
        topCats.push({ category, customers: n, share, index });
      }
      topCats.sort((a, b) => b.index - a.index || b.customers - a.customers || (a.category < b.category ? -1 : 1));
    }
    return {
      key,
      count: members.length,
      medianR: members.length ? median(members.map((c) => c.r)) : 0,
      withCategory: withCat.length,
      small: members.length < MIN_SEGMENT,
      topCats: topCats.slice(0, 3),
    };
  });

  const rules: Rule[] = [];
  let rulesNote: string | undefined;
  if (!basket.available) {
    rulesNote = basket.reason;
  } else {
    const candidates = basket.topByLift.filter((p) => p.lift >= MIN_LIFT);
    for (const p of candidates) {
      const forward = p.confAB >= p.confBA;
      const from = forward ? p.a : p.b;
      const to = forward ? p.b : p.a;
      let audience = 0;
      for (const set of cats.values()) if (set.has(from) && !set.has(to)) audience++;
      rules.push({ from, to, nAB: p.nAB, lift: p.lift, conf: forward ? p.confAB : p.confBA, audience });
      if (rules.length >= 5) break;
    }
    if (rules.length === 0) rulesNote = `沒有任何一組配對的 lift 達 ${MIN_LIFT}。這代表資料裡的「常一起買」大多只是都熱賣，不建議硬做組合推薦。`;
  }
  return { hasCategories, briefs, rules, rulesNote };
}
