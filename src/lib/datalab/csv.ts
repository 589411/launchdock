import type { Table } from './types';

/** 先試 UTF-8（嚴格），失敗再退回 Big5：台灣 Excel／POS 匯出常是 Big5 */
export function decodeBuffer(buf: ArrayBuffer): string {
  // Excel 的「Unicode 文字」匯出是 UTF-16（有 BOM），不能當 Big5 解
  const head = new Uint8Array(buf, 0, Math.min(2, buf.byteLength));
  if (head.length === 2 && head[0] === 0xff && head[1] === 0xfe) return new TextDecoder('utf-16le').decode(buf);
  if (head.length === 2 && head[0] === 0xfe && head[1] === 0xff) return new TextDecoder('utf-16be').decode(buf);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder('big5').decode(buf);
  }
}

function detectDelimiter(firstLine: string): string {
  let best = ',';
  let bestCount = -1;
  for (const d of [',', ';', '\t']) {
    let inQuote = false;
    let n = 0;
    for (const ch of firstLine) {
      if (ch === '"') inQuote = !inQuote;
      else if (ch === d && !inQuote) n++;
    }
    if (n > bestCount) {
      best = d;
      bestCount = n;
    }
  }
  return best;
}

/** RFC 4180：雙引號、"" 跳脫、引號內逗號與換行、CRLF／LF；去 BOM；自動判斷分隔符 */
export function parseCSV(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const nl = text.search(/\r?\n/);
  const delim = detectDelimiter(nl === -1 ? text : text.slice(0, nl));

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuote = false;
  const n = text.length;
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuote = false;
      } else field += ch;
    } else if (ch === '"' && field === '') {
      // 只有欄位一開始的引號才算「開始引用」；5" wide 這種欄位中間的引號就是普通字元
      inQuote = true;
    } else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
  }
  return rows;
}

export function toTable(name: string, text: string): Table {
  const all = parseCSV(text);
  const headers = (all[0] ?? []).map((h) => h.trim());
  return { name, headers, rows: all.slice(1) };
}

/**
 * 工作表／CSV 的第一列不一定是欄名（POS 匯出常有標題列、空白列）：
 * 挑「前 20 列裡第一個填得夠滿的列」當欄名，其後才是資料。
 */
export function tableFromRows(name: string, rows: string[][]): Table {
  const filled = rows.slice(0, 20).map((r) => r.filter((c) => c.trim() !== '').length);
  let max = 0;
  for (const n of filled) if (n > max) max = n;
  const hi = filled.findIndex((n) => n >= Math.max(2, Math.ceil(max * 0.6)));
  const h = hi < 0 ? 0 : hi;
  return { name, headers: (rows[h] ?? []).map((x) => x.trim()), rows: rows.slice(h + 1) };
}

/**
 * 「欄名」那一列其實是資料（沒有標題列的檔案）：出現 email、電話，或至少兩個日期／純數字。
 * 這種檔案不能繼續：第一列的值會被當成欄名，進到提示詞、報告與本機紀錄。
 */
export function looksLikeDataHeaders(headers: string[]): boolean {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone = /^(\+?886|0)\d[\d\-\s]{7,}$/;
  const dateOrNum = /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}.*|-?\d+(\.\d+)?)$/;
  const hs = headers.map((h) => h.trim());
  if (hs.some((h) => email.test(h) || phone.test(h))) return true;
  return hs.filter((h) => dateOrNum.test(h)).length >= 2;
}

export function colIndex(t: Table, name: string): number {
  return t.headers.indexOf(name);
}
