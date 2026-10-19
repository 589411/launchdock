import type { Dataset, Day, Line, Table, Txn } from './types';
import { colIndex } from './csv';

/** 支援 2025-01-01T21:37:00、2025-01-01、2025/1/2 15:39 三種寫法；只取日期 */
export function parseDay(s: string): Day | null {
  const m = s.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(t) ? null : Math.round(t / 86400000);
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
