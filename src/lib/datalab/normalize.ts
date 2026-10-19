import type { Dataset, Day, Line, Table, Txn } from './types';
import type { Mapping } from './detect';
import { LINE_AMOUNT_HEADER, ORDER_TOTAL_HEADER } from '../../data/import-profiles';
import { colIndex } from './csv';

/** 支援 2025-01-01T21:37:00、2025-01-01、2025/1/2 15:39 三種寫法；只取日期 */
export function parseDay(s: string): Day | null {
  const m = s.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  // 2025-02-31 會被 Date 自動進位成 3 月 3 日；轉回去對不上就視為不合法
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  return Math.round(t / 86400000);
}

export function dayToString(d: Day): string {
  return new Date(d * 86400000).toISOString().slice(0, 10);
}

function num(s: string): number {
  const v = Number(s.replace(/[,\s]/g, ''));
  return Number.isFinite(v) ? v : 0;
}

export interface BuildResult {
  dataset: Dataset | null;
  error?: string;
}

/**
 * 以日晴／內建樣本的固定欄位（txn_id、txn_datetime、member_id、total_amount…）建立 Dataset。
 * 自有資料的欄位偵測與對應在 M2 加入，之後會產生同樣的 Dataset。
 */
export function buildDatasetFromSunlitSchema(
  tables: Record<string, Table>,
  source: Dataset['source'],
): BuildResult {
  const t = tables.transactions;
  if (!t) return { dataset: null, error: '缺少 transactions.csv' };
  const iId = colIndex(t, 'txn_id');
  const iDt = colIndex(t, 'txn_datetime');
  const iMember = colIndex(t, 'member_id');
  const iAmt = colIndex(t, 'total_amount');
  if (iId < 0 || iDt < 0 || iMember < 0 || iAmt < 0) {
    return { dataset: null, error: 'transactions.csv 缺少必要欄位（txn_id、txn_datetime、member_id、total_amount）' };
  }
  const iRet = colIndex(t, 'is_return');
  const iCamp = colIndex(t, 'campaign_id');
  const iStore = colIndex(t, 'store_id');
  const iChan = colIndex(t, 'channel');

  const txns: Txn[] = [];
  let maxDay = -Infinity;
  for (const r of t.rows) {
    const day = parseDay(r[iDt] ?? '');
    if (day === null) continue;
    if (day > maxDay) maxDay = day;
    const member = (r[iMember] ?? '').trim();
    txns.push({
      id: r[iId],
      customerId: member === '' ? null : member,
      day,
      amount: num(r[iAmt] ?? ''),
      isReturn: iRet >= 0 ? /^true$/i.test((r[iRet] ?? '').trim()) : false,
      campaignId: iCamp >= 0 && r[iCamp] ? r[iCamp] : undefined,
      store: iStore >= 0 ? r[iStore] : undefined,
      channel: iChan >= 0 ? r[iChan] : undefined,
    });
  }
  if (txns.length === 0) return { dataset: null, error: '沒有可解析日期的交易' };

  let lines: Line[] | undefined;
  const it = tables.txn_items;
  if (it) {
    const a = colIndex(it, 'txn_id');
    const b = colIndex(it, 'sku');
    const c = colIndex(it, 'qty');
    const d = colIndex(it, 'line_amount');
    if (a >= 0 && b >= 0 && c >= 0 && d >= 0) {
      // 商品關聯分析以「子品類」為單位：由商品主檔（sku → subcategory）帶入
      const groupOf = new Map<string, string>();
      const pr = tables.products;
      if (pr) {
        const ps = colIndex(pr, 'sku');
        const psub = colIndex(pr, 'subcategory');
        const pcat = colIndex(pr, 'category');
        if (ps >= 0) for (const r of pr.rows) groupOf.set(r[ps], ((psub >= 0 ? r[psub] : '') || (pcat >= 0 ? r[pcat] : '') || '').trim());
      }
      lines = it.rows.map((r) => ({ txnId: r[a], sku: r[b], category: groupOf.get(r[b]) || undefined, qty: num(r[c] ?? ''), amount: num(r[d] ?? '') }));
    }
  }

  return { dataset: { source, asOf: maxDay + 1, txns, lines } };
}


// ── 自有資料：寬鬆的日期與金額解析 ────────────────────────────────

/**
 * 比 parseDay 寬鬆，給上傳資料用：
 * ISO／斜線、2025年1月2日、2025.01.02、20250102、民國年 114/01/02 與 1140102（3 位數年份 +1911）、
 * Excel 序號（整數或含小數，約 2000 至 2100 年）。全形數字會先轉成半形。解析不出來回傳 null。
 */
export function parseFlexibleDay(raw: string): Day | null {
  const s = raw.normalize('NFKC').trim();
  if (!s) return null;
  const iso = parseDay(s);
  if (iso !== null) return iso;
  let m = s.match(/^(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日?/);
  if (m) return parseDay(`${m[1]}-${m[2]}-${m[3]}`);
  m = s.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (m) return parseDay(`${m[1]}-${m[2]}-${m[3]}`);
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) return parseDay(`${m[1]}-${m[2]}-${m[3]}`);
  // 民國年：114/01/02、114-01-02、114年1月2日，以及緊湊的 1140102
  m = s.match(/^(\d{3})[/.\-年](\d{1,2})[/.\-月](\d{1,2})/) ?? s.match(/^(\d{3})(\d{2})(\d{2})$/);
  if (m && Number(m[1]) >= 100 && Number(m[1]) <= 199) return parseDay(`${Number(m[1]) + 1911}-${m[2]}-${m[3]}`);
  if (/^\d{5}(\.\d+)?$/.test(s)) {
    const serial = Math.floor(Number(s));
    // 36526 = 2000-01-01，73415 = 2100-12-31
    if (serial >= 36526 && serial <= 73415) return serial - 25569;
  }
  return null;
}

/** 金額：全形轉半形；去掉 NT$、$、元、千分位、空白；(100) 與 −100 視為負數；解析不出來回傳 null */
export function parseAmount(raw: string): number | null {
  let s = raw.normalize('NFKC').trim().replace(/NT\$|\$|元|塊|,|\s/gi, '').replace(/[−–]/g, '-');
  if (!s) return null;
  let neg = false;
  const paren = s.match(/^\((.*)\)$/);
  if (paren) {
    neg = true;
    s = paren[1];
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const v = Number(s);
  return neg ? -Math.abs(v) : v;
}

export interface OwnBuildStats {
  rows: number;
  droppedDate: number;
  droppedAmount: number;
  /** 以「一列＝一個商品明細」解讀（單號重複出現） */
  lineLevel: boolean;
  /** 金額欄是「整張單的總額」並重複寫在每一列：每張單只取一次，不加總 */
  orderLevelAmount: boolean;
  /** 金額由「數量 × 單價」推算 */
  derivedAmount: boolean;
}

export interface OwnBuildResult extends BuildResult {
  stats?: OwnBuildStats;
}

const TRUTHY_RETURN = new Set(['true', '1', 'y', 'yes', '是', '退貨', '退', 'r', 'refund', 'returned']);
const FIELD_NAME_ZH: Record<string, string> = { customerId: '顧客編號', date: '交易日期', amount: '金額（或「數量」加「單價」）' };

/**
 * 以欄位對應把上傳的一張扁平表轉成 Dataset。
 * - 單號欄有重複（一張單多列）→ 以「明細」解讀。交易的身分是「單號＋日期＋門市」：
 *   許多 POS 的流水號每天重新編號，只看單號會把不同天的單併在一起；退貨單沿用原發票號碼、但日期不同，也會自然分開。
 * - 一張單的金額＝各列加總；但如果金額欄是「整張單的總額」並重複寫在每一列（欄名像「實收金額」，
 *   且多列的單幾乎都是同一個數字），就只取一次，不加總。
 * - 沒有單號或單號不重複 → 一列就是一筆交易。
 * - 退貨：有「是否退貨」旗標或金額為負；旗標為退貨但金額是正數時轉成負數（才能從消費金額扣除）。
 *   一張單裡只有部分明細退貨，整張單仍算一次購買（淨額為負、或每一列都是退貨才算退貨單）。
 * - 沒有金額欄但有「數量」與「單價」→ 金額＝數量 × 單價。
 * - 日期或金額解析不出來的列會略過並計數（健檢會告訴使用者）。
 */
export function buildDatasetFromMapping(t: Table, m: Mapping): OwnBuildResult {
  const cCust = m.customerId.col;
  const cDate = m.date.col;
  const cAmt = m.amount.col;
  const cQty = m.quantity.col;
  const cUnit = m.unitPrice.col;
  const derive = cAmt < 0 && cQty >= 0 && cUnit >= 0;
  const need: string[] = [];
  if (cCust < 0) need.push('customerId');
  if (cDate < 0) need.push('date');
  if (cAmt < 0 && !derive) need.push('amount');
  if (need.length) return { dataset: null, error: `缺少必要欄位：${need.map((k) => FIELD_NAME_ZH[k]).join('、')}` };
  const cOrd = m.orderId.col;
  const cProd = m.product.col >= 0 ? m.product.col : m.category.col;
  const cCat = m.category.col;
  const cRet = m.isReturn.col;
  const cStore = m.store.col;
  const cChan = m.channel.col;

  let droppedDate = 0;
  let droppedAmount = 0;
  type Row = { key: string; order: string; cust: string | null; day: number; amt: number; ret: boolean; sku: string; cat: string; store?: string; channel?: string };
  const rows: Row[] = [];
  t.rows.forEach((r, i) => {
    const day = parseFlexibleDay(r[cDate] ?? '');
    if (day === null) {
      droppedDate++;
      return;
    }
    let amt: number | null;
    if (derive) {
      const q = parseAmount(r[cQty] ?? '');
      const u = parseAmount(r[cUnit] ?? '');
      amt = q === null || u === null ? null : q * u;
    } else {
      amt = parseAmount(r[cAmt] ?? '');
    }
    if (amt === null) {
      droppedAmount++;
      return;
    }
    const flagged = cRet >= 0 && TRUTHY_RETURN.has((r[cRet] ?? '').trim().toLowerCase());
    const ret = flagged || amt < 0;
    if (flagged && amt > 0) amt = -amt;
    const cust = (r[cCust] ?? '').trim();
    const store = cStore >= 0 ? (r[cStore] ?? '').trim() || undefined : undefined;
    const order = cOrd >= 0 && (r[cOrd] ?? '').trim() !== '' ? r[cOrd].trim() : `row${i + 1}`;
    rows.push({
      key: cOrd >= 0 ? `${order}|${day}|${store ?? ''}` : `row${i + 1}`,
      order,
      cust: cust === '' ? null : cust,
      day,
      amt,
      ret,
      sku: cProd >= 0 ? (r[cProd] ?? '').trim() : '',
      // 商品關聯的分組：有「品類」欄就用品類，否則用商品本身
      cat: cCat >= 0 ? (r[cCat] ?? '').trim() : cProd >= 0 ? (r[cProd] ?? '').trim() : '',
      store,
      channel: cChan >= 0 ? (r[cChan] ?? '').trim() || undefined : undefined,
    });
  });
  if (rows.length === 0) return { dataset: null, error: '沒有任何一列同時有可辨識的日期與金額' };

  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const g = groups.get(r.key);
    if (g) g.push(r);
    else groups.set(r.key, [r]);
  }
  const lineLevel = cOrd >= 0 && groups.size < rows.length * 0.98;

  // 金額欄是不是「整張單的總額，重複寫在每一列」
  let orderLevelAmount = false;
  if (lineLevel && cAmt >= 0 && ORDER_TOTAL_HEADER.test(t.headers[cAmt] ?? '') && !LINE_AMOUNT_HEADER.test(t.headers[cAmt] ?? '')) {
    let multi = 0;
    let same = 0;
    for (const g of groups.values()) {
      if (g.length < 2) continue;
      multi++;
      if (g.every((x) => x.amt === g[0].amt)) same++;
    }
    orderLevelAmount = multi > 0 && same / multi >= 0.8;
  }

  let txns: Txn[];
  let lines: Line[] | undefined;
  if (lineLevel) {
    lines = [];
    txns = [];
    for (const g of groups.values()) {
      const first = g[0];
      const cust = g.find((x) => x.cust !== null)?.cust ?? null;
      const amount = orderLevelAmount ? first.amt : g.reduce((s, x) => s + x.amt, 0);
      const retLines = g.filter((x) => x.ret).length;
      txns.push({
        id: `${first.order}@${first.day}`,
        customerId: cust,
        day: first.day,
        amount,
        isReturn: amount < 0 || retLines === g.length,
        store: first.store,
        channel: first.channel,
      });
      for (const x of g) lines.push({ txnId: `${first.order}@${first.day}`, sku: x.sku, category: x.cat || undefined, qty: 1, amount: x.amt });
    }
  } else {
    txns = rows.map((r) => ({ id: r.order, customerId: r.cust, day: r.day, amount: r.amt, isReturn: r.ret, store: r.store, channel: r.channel }));
    if (cProd >= 0) lines = rows.map((r) => ({ txnId: r.order, sku: r.sku, category: r.cat || undefined, qty: 1, amount: r.amt }));
  }

  let maxDay = -Infinity;
  for (const x of txns) if (x.day > maxDay) maxDay = x.day;
  return {
    dataset: { source: 'own', asOf: maxDay + 1, txns, lines },
    stats: { rows: t.rows.length, droppedDate, droppedAmount, lineLevel, orderLevelAmount, derivedAmount: derive },
  };
}
