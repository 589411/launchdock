import type { Table } from './types';

/** 先試 UTF-8（嚴格），失敗再退回 Big5：台灣 Excel／POS 匯出常是 Big5 */
export function decodeBuffer(buf: ArrayBuffer): string {
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

export function colIndex(t: Table, name: string): number {
  return t.headers.indexOf(name);
}
