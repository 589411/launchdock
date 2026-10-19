import type { Table } from './types';
import { parseAmount, parseFlexibleDay } from './normalize';

/** 上傳資料的標準欄位。前三個是必要欄位，其餘有就能開啟更多分析 */
export type FieldKey =
  | 'customerId'
  | 'date'
  | 'amount'
  | 'orderId'
  | 'product'
  | 'category'
  | 'isReturn'
  | 'store'
  | 'channel';

export const REQUIRED_FIELDS: FieldKey[] = ['customerId', 'date', 'amount'];

export const FIELD_LABEL: Record<FieldKey, string> = {
  customerId: '顧客編號（會員編號）',
  date: '交易日期',
  amount: '金額',
  orderId: '單號（訂單／發票）',
  product: '商品名稱',
  category: '商品品類',
  isReturn: '是否退貨',
  store: '門市／店別',
  channel: '通路',
};

export type Confidence = 'sure' | 'guess' | 'none';

export interface FieldGuess {
  /** 欄位索引；-1 表示沒找到 */
  col: number;
  confidence: Confidence;
}

export type Mapping = Record<FieldKey, FieldGuess>;

/** 欄名同義詞（中英文）。比對時先轉小寫並去掉空白、底線、連字號 */
const SYNONYMS: Record<FieldKey, string[]> = {
  customerId: ['customerid', 'custid', 'cid', 'memberid', 'member', 'customer', 'userid', 'uid', '會員編號', '會員代號', '會員卡號', '會員', '客戶編號', '客戶代號', '客戶id', '客戶', '顧客編號', '顧客', '卡號', '手機'],
  date: ['date', 'datetime', 'txndate', 'txndatetime', 'orderdate', 'saledate', 'purchasedate', 'time', '交易日期', '交易時間', '訂單日期', '銷售日期', '購買日期', '消費日期', '結帳日期', '日期', '時間'],
  amount: ['amount', 'totalamount', 'total', 'lineamount', 'sales', 'revenue', 'amt', 'subtotal', '金額', '實收金額', '實收', '銷售金額', '交易金額', '訂單金額', '小計', '總額', '總金額', '營業額', '消費金額'],
  orderId: ['orderid', 'orderno', 'ordernumber', 'txnid', 'transactionid', 'invoice', 'invoiceno', 'receipt', 'ticket', '單號', '訂單編號', '訂單號', '交易編號', '發票號碼', '發票', '銷貨單號', '流水號'],
  product: ['product', 'productname', 'item', 'itemname', 'sku', 'goods', '商品名稱', '商品', '品名', '品項', '產品名稱', '產品', '貨號', '料號'],
  category: ['category', 'productcategory', 'cat', 'subcategory', 'class', '商品類別', '商品品類', '品類', '類別', '分類', '大類', '中類'],
  isReturn: ['isreturn', 'return', 'refund', 'isrefund', '是否退貨', '退貨註記', '退貨', '退款'],
  store: ['store', 'storeid', 'storename', 'shop', 'branch', 'outlet', '門市', '店別', '分店', '店名', '門店', '店號', '店代號'],
  channel: ['channel', 'saleschannel', '通路', '渠道', '管道', '銷售通路'],
};

/** 看起來是「名稱／姓名」的欄位不該被當成編號欄 */
const NAME_LIKE = /(名稱|姓名|name)/i;
/** 單價、成本不是交易金額 */
const NOT_AMOUNT = /(unit|單價|cost|成本|price)/i;

const norm = (h: string) => h.toLowerCase().replace(/[\s_\-./()（）]/g, '');

function headerScore(field: FieldKey, header: string): number {
  const h = norm(header);
  if (!h) return 0;
  let best = 0;
  for (const syn of SYNONYMS[field]) {
    if (h === syn) best = Math.max(best, 100);
    else if (syn.length >= 2 && h.includes(syn)) best = Math.max(best, 70);
  }
  if ((field === 'customerId' || field === 'orderId') && NAME_LIKE.test(header) && !/(id|編號|代號|號)/i.test(header)) best = Math.min(best, 20);
  if (field === 'amount' && NOT_AMOUNT.test(header) && !/(total|line|amount|金額|小計)/i.test(header)) best = Math.min(best, 20);
  return best;
}

const TRUTHY = new Set(['true', '1', 'y', 'yes', '是', '退貨', '退', 'r', 'refund', 'returned']);
const FALSY = new Set(['false', '0', 'n', 'no', '否', '', '正常', 'f']);

export function parseBoolish(v: string): boolean | null {
  const s = v.trim().toLowerCase();
  if (TRUTHY.has(s)) return true;
  if (FALSY.has(s)) return false;
  return null;
}

function sampleCol(t: Table, ci: number, n = 500): string[] {
  const out: string[] = [];
  for (const r of t.rows) {
    const v = (r[ci] ?? '').trim();
    if (v !== '') out.push(v);
    if (out.length >= n) break;
  }
  return out;
}

function valueScore(field: FieldKey, vals: string[]): number {
  if (vals.length === 0) return 0;
  const frac = (fn: (v: string) => boolean) => vals.filter(fn).length / vals.length;
  const uniq = new Set(vals).size / vals.length;
  switch (field) {
    case 'date':
      return frac((v) => parseFlexibleDay(v) !== null) >= 0.9 ? 60 : 0;
    case 'amount': {
      const numeric = frac((v) => parseAmount(v) !== null);
      return numeric >= 0.9 ? 25 : 0;
    }
    case 'isReturn':
      return frac((v) => parseBoolish(v) !== null) >= 0.95 && new Set(vals.map((v) => v.toLowerCase())).size <= 4 ? 40 : 0;
    case 'customerId':
      // 顧客會重複出現：不是幾乎全不同（那更像單號），也不是只有幾個值（那更像類別）
      return uniq < 0.95 && new Set(vals).size >= 3 ? 20 : 0;
    case 'orderId':
      return uniq > 0.3 ? 15 : 0;
    case 'store':
    case 'channel':
    case 'category':
      return new Set(vals).size <= Math.max(30, vals.length * 0.05) ? 10 : 0;
    default:
      return 0;
  }
}

/**
 * 自動偵測欄位對應。每個標準欄位挑一個最高分的欄，欄不重複使用。
 * 分數＝欄名比對（0–100）＋值的樣式檢查；
 * 「確定」＝欄名與值都對得上；「猜的」＝只有其中一項；「找不到」＝分數太低。
 */
export function detectMapping(t: Table): Mapping {
  const fields = Object.keys(SYNONYMS) as FieldKey[];
  const samples = t.headers.map((_, ci) => sampleCol(t, ci));
  const cand: { field: FieldKey; col: number; score: number; hdr: number; val: number }[] = [];
  for (const f of fields) {
    t.headers.forEach((h, ci) => {
      const hdr = headerScore(f, h);
      const val = valueScore(f, samples[ci]);
      // 欄名完全對不上時，只有「日期」「是否退貨」這類樣式很獨特的欄位才靠值猜
      const score = hdr + (hdr > 0 || f === 'date' || f === 'isReturn' ? val : 0);
      if (score > 0) cand.push({ field: f, col: ci, score, hdr, val });
    });
  }
  cand.sort((a, b) => b.score - a.score);

  const result = Object.fromEntries(fields.map((f) => [f, { col: -1, confidence: 'none' }])) as Mapping;
  const usedCols = new Set<number>();
  const doneFields = new Set<FieldKey>();
  for (const c of cand) {
    if (usedCols.has(c.col) || doneFields.has(c.field)) continue;
    const minScore = c.field === 'date' || c.field === 'isReturn' ? 55 : 60;
    if (c.score < minScore) continue;
    usedCols.add(c.col);
    doneFields.add(c.field);
    // 日期、金額、是否退貨一定要值也對得上才算確定；其餘欄位欄名完全吻合就夠了
    const valueChecked = c.field === 'date' || c.field === 'amount' || c.field === 'isReturn';
    const sure = valueChecked ? c.hdr >= 70 && c.val > 0 : c.hdr >= 100 || (c.hdr >= 70 && c.val > 0);
    result[c.field] = { col: c.col, confidence: sure ? 'sure' : 'guess' };
  }
  return result;
}

/** 以欄名（而不是索引）記住對應，隔天重新上傳同一份格式時可以自動套用 */
export function mappingToNames(t: Table, m: Mapping): Partial<Record<FieldKey, string>> {
  const out: Partial<Record<FieldKey, string>> = {};
  for (const [k, g] of Object.entries(m) as [FieldKey, FieldGuess][]) {
    if (g.col >= 0 && t.headers[g.col] !== undefined) out[k] = t.headers[g.col];
  }
  return out;
}

export function mappingFromNames(t: Table, names: Partial<Record<FieldKey, string>>): Mapping | null {
  const fields = Object.keys(SYNONYMS) as FieldKey[];
  const res = Object.fromEntries(fields.map((f) => [f, { col: -1, confidence: 'none' as Confidence }])) as Mapping;
  let hit = 0;
  for (const f of fields) {
    const name = names[f];
    if (name === undefined) continue;
    const ci = t.headers.indexOf(name);
    if (ci >= 0) {
      res[f] = { col: ci, confidence: 'sure' };
      hit++;
    }
  }
  return hit > 0 ? res : null;
}

/** 各分析模組需要哪些欄位；缺欄位時要用白話說明為什麼停用 */
export function missingFor(m: Mapping, need: FieldKey[]): FieldKey[] {
  return need.filter((f) => m[f].col < 0);
}

export function templateCsv(): string {
  return [
    'order_id,date,customer_id,product,category,amount,is_return,store',
    'A0001,2025-01-03,C001,保濕乳液,保養,680,0,台北店',
    'A0001,2025-01-03,C001,洗面乳,保養,320,0,台北店',
    'A0002,2025-01-05,C002,綜合維他命,保健,1200,0,線上',
    'A0003,2025-01-09,,洗面乳,保養,320,0,台北店',
    'A0004,2025-01-12,C001,保濕乳液,保養,-680,1,台北店',
  ].join('\n') + '\n';
}
