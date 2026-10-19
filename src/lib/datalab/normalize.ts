import type { Dataset, Day, Line, Table, Txn } from './types';
import type { Mapping } from './detect';
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
      lines = it.rows.map((r) => ({ txnId: r[a], sku: r[b], qty: num(r[c] ?? ''), amount: num(r[d] ?? '') }));
    }
  }

  return { dataset: { source, asOf: maxDay + 1, txns, lines } };
}


// ── 自有資料：寬鬆的日期與金額解析 ────────────────────────────────

/**
 * 比 parseDay 寬鬆，給上傳資料用：
 * ISO／斜線、2025年1月2日、2025.01.02、20250102、民國年 114/01/02（3 位數年份 +1911）、
 * Excel 序號（整數或含小數，約 2000 至 2100 年）。解析不出來回傳 null。
 */
export function parseFlexibleDay(raw: string): Day | null {
  const s = raw.trim();
  if (!s) return null;
  const iso = parseDay(s);
  if (iso !== null) return iso;
  let m = s.match(/^(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日?/);
  if (m) return parseDay(`${m[1]}-${m[2]}-${m[3]}`);
  m = s.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (m) return parseDay(`${m[1]}-${m[2]}-${m[3]}`);
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) return parseDay(`${m[1]}-${m[2]}-${m[3]}`);
  m = s.match(/^(\d{3})[/.\-年](\d{1,2})[/.\-月](\d{1,2})/);
  if (m && Number(m[1]) >= 100 && Number(m[1]) <= 199) return parseDay(`${Number(m[1]) + 1911}-${m[2]}-${m[3]}`);
  if (/^\d{5}(\.\d+)?$/.test(s)) {
    const serial = Math.floor(Number(s));
    // 36526 = 2000-01-01，73415 = 2100-12-31
    if (serial >= 36526 && serial <= 73415) return serial - 25569;
  }
  return null;
}

/** 金額：去掉 NT$、$、元、千分位、空白；(100) 與 −100 視為負數；解析不出來回傳 null */
export function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/NT\$|\$|元|塊|,|\s/gi, '').replace(/[−–]/g, '-');
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
}

export interface OwnBuildResult extends BuildResult {
  stats?: OwnBuildStats;
}

const TRUTHY_RETURN = new Set(['true', '1', 'y', 'yes', '是', '退貨', '退', 'r', 'refund', 'returned']);

/**
 * 以欄位對應把上傳的一張扁平表轉成 Dataset。
 * - 單號欄有重複（一張單多列）→ 以「明細」解讀：每張單的金額＝各列加總，日期與顧客取第一列。
 * - 沒有單號或單號不重複 → 一列就是一筆交易。
 * - 退貨：有「是否退貨」旗標或金額為負；旗標為退貨但金額是正數時轉成負數（才能從消費金額扣除）。
 * - 日期或金額解析不出來的列會略過並計數（健檢會告訴使用者）。
 */
export function buildDatasetFromMapping(t: Table, m: Mapping): OwnBuildResult {
  const need = (['customerId', 'date', 'amount'] as const).filter((f) => m[f].col < 0);
  if (need.length) return { dataset: null, error: `缺少必要欄位：${need.join('、')}` };
  const cCust = m.customerId.col;
  const cDate = m.date.col;
  const cAmt = m.amount.col;
  const cOrd = m.orderId.col;
  const cProd = m.product.col >= 0 ? m.product.col : m.category.col;
  const cRet = m.isReturn.col;
  const cStore = m.store.col;
  const cChan = m.channel.col;

  let droppedDate = 0;
  let droppedAmount = 0;
  type Row = { order: string; cust: string | null; day: number; amt: number; ret: boolean; sku: string; store?: string; channel?: string };
  const rows: Row[] = [];
  t.rows.forEach((r, i) => {
    const day = parseFlexibleDay(r[cDate] ?? '');
    if (day === null) {
      droppedDate++;
      return;
    }
    let amt = parseAmount(r[cAmt] ?? '');
    if (amt === null) {
      droppedAmount++;
      return;
    }
    const flagged = cRet >= 0 && TRUTHY_RETURN.has((r[cRet] ?? '').trim().toLowerCase());
    const ret = flagged || amt < 0;
    if (flagged && amt > 0) amt = -amt;
    const cust = (r[cCust] ?? '').trim();
    rows.push({
      order: cOrd >= 0 && (r[cOrd] ?? '').trim() !== '' ? r[cOrd].trim() : `row${i + 1}`,
      cust: cust === '' ? null : cust,
      day,
      amt,
      ret,
      sku: cProd >= 0 ? (r[cProd] ?? '').trim() : '',
      store: cStore >= 0 ? (r[cStore] ?? '').trim() || undefined : undefined,
      channel: cChan >= 0 ? (r[cChan] ?? '').trim() || undefined : undefined,
    });
  });
  if (rows.length === 0) return { dataset: null, error: '沒有任何一列同時有可辨識的日期與金額' };

  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.order, (counts.get(r.order) ?? 0) + 1);
  const lineLevel = cOrd >= 0 && counts.size < rows.length * 0.98;

  let txns: Txn[];
  let lines: Line[] | undefined;
  if (lineLevel) {
    const byOrder = new Map<string, Txn>();
    lines = [];
    for (const r of rows) {
      let tx = byOrder.get(r.order);
      if (!tx) {
        tx = { id: r.order, customerId: r.cust, day: r.day, amount: 0, isReturn: false, store: r.store, channel: r.channel };
        byOrder.set(r.order, tx);
      }
      if (tx.customerId === null && r.cust) tx.customerId = r.cust;
      tx.amount += r.amt;
      if (r.ret) tx.isReturn = true;
      lines.push({ txnId: r.order, sku: r.sku, qty: 1, amount: r.amt });
    }
    txns = [...byOrder.values()];
    // 整張單加總後為負，也視為退貨
    for (const tx of txns) if (tx.amount < 0) tx.isReturn = true;
  } else {
    txns = rows.map((r) => ({ id: r.order, customerId: r.cust, day: r.day, amount: r.amt, isReturn: r.ret, store: r.store, channel: r.channel }));
    if (cProd >= 0) lines = rows.map((r) => ({ txnId: r.order, sku: r.sku, qty: 1, amount: r.amt }));
  }

  const maxDay = txns.reduce((mx, x) => (x.day > mx ? x.day : mx), -Infinity);
  return {
    dataset: { source: 'own', asOf: maxDay + 1, txns, lines },
    stats: { rows: t.rows.length, droppedDate, droppedAmount, lineLevel },
  };
}
