// 無相依的 .xlsx 讀取器：瀏覽器與 Node 22 都能跑（不用 DOMParser、不用 fs／zlib）。
// 流程：ZIP 中央目錄 → DecompressionStream('deflate-raw') → 手寫的輕量 XML 掃描（不建 DOM）。

export interface XlsxSheet {
  name: string;
  rows: string[][];
}

const ERR_INVALID = '這個檔案不是有效的 Excel（.xlsx）檔';
const ERR_XLS = '這是舊版 .xls 格式，請用 Excel 另存成 .xlsx 或 CSV';
const ERR_PASSWORD = '這個檔案有密碼保護，請先在 Excel 取消密碼再上傳';
const ERR_TOO_BIG = '這個 Excel 檔太大（解壓縮後的內容超過上限）。請先另存成較小的檔案，或只保留需要的欄位與日期範圍';
const KNOWN_ERRORS = new Set([ERR_INVALID, ERR_XLS, ERR_PASSWORD, ERR_TOO_BIG]);

const DEFAULT_MAX_ROWS = 300000;
// 資料表很少超過 500 欄；上限放低，避免一個遠在 XFD1 的雜訊儲存格把每一列都撐成 16384 格
const MAX_COLS = 512;
// 防炸彈：單一項目、全部項目解壓縮後的大小上限，與壓縮倍率上限（正常的試算表約 10 倍以內）
const MAX_ENTRY_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const MAX_RATIO = 200;
const MAX_SHEETS = 50;
// 列數 × 欄數的總格數上限，避免稀疏座標把記憶體撐爆
const MAX_CELLS = 25_000_000;

// ───────────────────────── ZIP ─────────────────────────

interface ZipEntry {
  method: number;
  flags: number;
  compSize: number;
  localOffset: number;
}

const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

function isOle(b: Uint8Array): boolean {
  return b.length >= 8 && OLE_MAGIC.every((v, i) => b[i] === v);
}

/** 在位元組中找 UTF-16LE 的 ASCII 字串（OLE 目錄項目的名稱是 UTF-16LE） */
function containsUtf16(b: Uint8Array, text: string): boolean {
  const n = text.length;
  const first = text.charCodeAt(0);
  for (let i = 0, end = b.length - n * 2; i <= end; i++) {
    if (b[i] !== first || b[i + 1] !== 0) continue;
    let ok = true;
    for (let k = 1; k < n; k++) {
      if (b[i + 2 * k] !== text.charCodeAt(k) || b[i + 2 * k + 1] !== 0) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

/** 從檔尾往前找 End-Of-Central-Directory（後面可能接最長 64KB 的 ZIP 註解），再讀中央目錄 */
function readZipDirectory(b: Uint8Array): Map<string, ZipEntry> {
  if (b.length < 22) throw new Error(ERR_INVALID);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let eocd = -1;
  for (let i = b.length - 22, min = Math.max(0, b.length - 22 - 0xffff); i >= min; i--) {
    if (dv.getUint32(i, true) === 0x06054b50 && i + 22 + dv.getUint16(i + 20, true) <= b.length) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(ERR_INVALID);

  const total = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const utf8 = new TextDecoder('utf-8');
  const entries = new Map<string, ZipEntry>();
  for (let n = 0; n < total; n++) {
    if (p + 46 > b.length || dv.getUint32(p, true) !== 0x02014b50) throw new Error(ERR_INVALID);
    const flags = dv.getUint16(p + 8, true);
    const method = dv.getUint16(p + 10, true);
    const compSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localOffset = dv.getUint32(p + 42, true);
    if (p + 46 + nameLen > b.length) throw new Error(ERR_INVALID);
    const name = utf8.decode(b.subarray(p + 46, p + 46 + nameLen)).replace(/^\/+/, '');
    entries.set(name, { method, flags, compSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/** 解壓縮預算：一次 readXlsx 呼叫內所有項目共用 */
interface Budget {
  total: number;
}

/** 分段讀取解壓縮串流，超過上限就中止（不先把整個結果放進記憶體） */
async function inflateRaw(data: Uint8Array, budget: Budget): Promise<Uint8Array> {
  const limit = Math.min(MAX_ENTRY_BYTES, data.length * MAX_RATIO + 1024 * 1024, MAX_TOTAL_BYTES - budget.total);
  const reader = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel().catch(() => undefined);
      throw new Error(ERR_TOO_BIG);
    }
    chunks.push(value);
  }
  budget.total += size;
  const out = new Uint8Array(size);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

/** 讀一個 ZIP 項目：以「中央目錄」的大小為準；本機標頭只用來算資料起點（它的 extra 長度可能與中央目錄不同） */
async function readEntry(b: Uint8Array, e: ZipEntry, budget: Budget): Promise<Uint8Array> {
  if (e.flags & 1) throw new Error(ERR_PASSWORD); // 傳統 ZIP 加密
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const o = e.localOffset;
  if (o + 30 > b.length || dv.getUint32(o, true) !== 0x04034b50) throw new Error(ERR_INVALID);
  const start = o + 30 + dv.getUint16(o + 26, true) + dv.getUint16(o + 28, true);
  const end = start + e.compSize;
  if (end > b.length) throw new Error(ERR_INVALID);
  const raw = b.subarray(start, end);
  if (e.method === 0) {
    budget.total += raw.length;
    if (budget.total > MAX_TOTAL_BYTES) throw new Error(ERR_TOO_BIG);
    return raw;
  }
  if (e.method === 8) return inflateRaw(raw, budget);
  throw new Error(ERR_INVALID);
}

// ───────────────────────── XML 小工具 ─────────────────────────

/** 解開 XML 實體；Excel 另用 _xHHHH_ 跳脫控制字元，字串內容也一併還原 */
function decodeEntities(s: string): string {
  if (s.indexOf('&') === -1) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos);/g, (m, e: string) => {
    switch (e) {
      case 'amp': return '&';
      case 'lt': return '<';
      case 'gt': return '>';
      case 'quot': return '"';
      case 'apos': return "'";
    }
    const cp = e.charCodeAt(1) === 120 ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
  });
}

function decodeText(s: string): string {
  s = decodeEntities(s);
  if (s.indexOf('_x') === -1) return s;
  return s.replace(/_x([0-9a-fA-F]{4})_/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
}

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of s.matchAll(/([^\s=/"']+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    out[m[1]] = decodeEntities(m[2] ?? m[3] ?? '');
  }
  return out;
}

/**
 * 收集 <si>／<is> 內所有 <t> 文字：豐富文字 <r><t>…</t></r> 會被串接；
 * 注音 <rPh> 的 <t> 不屬於儲存格內容，先整段剔除。
 * 不 trim：xml:space="preserve" 與否都原樣保留前後空白。
 */
function collectText(xml: string): string {
  if (xml.indexOf('<rPh') !== -1) xml = stripElements(xml, 'rPh');
  const parts: string[] = [];
  scanElements(xml, 't', (inner) => {
    if (inner) parts.push(inner);
  });
  return decodeText(parts.join('')); // 一次 join，避免逐段字串相加
}

function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  scanElements(xml, 'si', (inner) => out.push(inner ? collectText(inner) : ''));
  return out;
}

/**
 * 依序掃描 <tag …>內容</tag> 與自閉合 <tag/>，對每個元素呼叫 fn（自閉合時內容為 ''）。
 * 用 indexOf 而不是 [\s\S]*? 的正規式：沒有結束標籤時直接停止，不會每個開頭標籤都掃到檔尾而變成平方時間。
 */
function scanElements(xml: string, tag: string, fn: (inner: string) => void): void {
  const open = '<' + tag;
  const close = '</' + tag + '>';
  let pos = 0;
  for (;;) {
    const i = xml.indexOf(open, pos);
    if (i === -1) return;
    const after = xml.charCodeAt(i + open.length);
    // 後面必須是空白、> 或 /，否則是別的標籤（例如 <t 與 <tr、<si 與 <sizes）
    if (!(after === 62 || after === 47 || after === 32 || after === 9 || after === 10 || after === 13)) {
      pos = i + open.length;
      continue;
    }
    const gt = xml.indexOf('>', i + open.length);
    if (gt === -1) return;
    if (xml.charCodeAt(gt - 1) === 47) {
      fn('');
      pos = gt + 1;
      continue;
    }
    const end = xml.indexOf(close, gt + 1);
    if (end === -1) return;
    fn(xml.slice(gt + 1, end));
    pos = end + close.length;
  }
}

/** 移除所有 <tag>…</tag>（用於剔除注音 rPh）；沒有結束標籤就保留剩餘內容 */
function stripElements(xml: string, tag: string): string {
  const open = '<' + tag;
  const close = '</' + tag + '>';
  let out = '';
  let pos = 0;
  for (;;) {
    const i = xml.indexOf(open, pos);
    if (i === -1) return out + xml.slice(pos);
    const end = xml.indexOf(close, i);
    if (end === -1) return out + xml.slice(pos);
    out += xml.slice(pos, i);
    pos = end + close.length;
  }
}

// ───────────────────────── 樣式與日期 ─────────────────────────

/** 內建的日期／時間格式 id（ECMA-376 §18.8.30 與常見的 CJK 日期格式） */
function isBuiltinDateId(id: number): boolean {
  return (
    (id >= 14 && id <= 22) || (id >= 27 && id <= 36) || (id >= 45 && id <= 47) || (id >= 50 && id <= 58)
  );
}

/** 自訂格式是否為日期／時間：先剔除引號文字、[色彩／區域／經過時間] 與反斜線跳脫，剩下有 y m d h s 才算 */
function isDateFormatCode(code: string): boolean {
  const stripped = code
    .replace(/"[^"]*"/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\\.|_.|\*./g, '')
    .replace(/general/gi, '');
  return /[ymdhs]/i.test(stripped);
}

/** 回傳每個 cellXfs 索引是否為日期格式 */
function parseDateStyles(xml: string): boolean[] {
  const custom = new Map<number, string>();
  for (const m of xml.matchAll(/<numFmt\b([^>]*?)\/?>/g)) {
    const a = parseAttrs(m[1]);
    if (a.numFmtId !== undefined) custom.set(Number(a.numFmtId), a.formatCode ?? '');
  }
  const start = xml.indexOf('<cellXfs');
  if (start === -1) return [];
  const end = xml.indexOf('</cellXfs>', start);
  const block = xml.slice(start, end === -1 ? xml.length : end);
  const result: boolean[] = [];
  const dateCache = new Map<number, boolean>();
  for (const m of block.matchAll(/<xf\b([^>]*?)\/?>/g)) {
    const id = Number(parseAttrs(m[1]).numFmtId ?? 0);
    let isDate = dateCache.get(id);
    if (isDate === undefined) {
      const code = custom.get(id);
      isDate = code !== undefined ? isDateFormatCode(code) : isBuiltinDateId(id);
      dateCache.set(id, isDate);
    }
    result.push(isDate);
  }
  return result;
}

const pad2 = (n: number): string => (n < 10 ? '0' + n : String(n));

/**
 * Excel 序號 → 'YYYY-MM-DD'（無小數）或 'YYYY-MM-DD HH:mm:ss'。
 * 1900 系統：Excel 誤把 1900 當閏年，序號 60 是不存在的 1900-02-29；
 * 序號 > 60 的起算日是 1899-12-30（即「減一天」），< 60 則是 1899-12-31。
 * 序號 < 1 且有小數視為純時間，只輸出 'HH:mm:ss'；1900 系統的 0 或負數、超過 9999 年原樣回傳。
 */
function serialToDate(raw: string, date1904: boolean): string {
  const s = Number(raw);
  if (!Number.isFinite(s) || s < 0) return raw;
  let days = Math.floor(s);
  let secs = Math.round((s - days) * 86400);
  if (secs >= 86400) {
    days += 1;
    secs -= 86400;
  }
  const time = `${pad2(Math.floor(secs / 3600))}:${pad2(Math.floor((secs % 3600) / 60))}:${pad2(secs % 60)}`;
  if (days === 0 && secs > 0) return time;
  if (!date1904 && days === 0) return raw;

  let datePart: string;
  if (!date1904 && days === 60) {
    datePart = '1900-02-29';
  } else {
    const epoch = date1904 ? Date.UTC(1904, 0, 1) : days < 60 ? Date.UTC(1899, 11, 31) : Date.UTC(1899, 11, 30);
    const d = new Date(epoch + days * 86400000);
    const y = d.getUTCFullYear();
    if (y > 9999) return raw;
    datePart = `${String(y).padStart(4, '0')}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }
  return secs === 0 ? datePart : `${datePart} ${time}`;
}

// ───────────────────────── 工作表 ─────────────────────────

interface SheetContext {
  shared: string[];
  dateXf: boolean[];
  date1904: boolean;
}

const RE_TOKEN = /<(row|c)\b([^>]*?)(\/?)>/g; // 以 lastIndex 驅動，使用前一律重設
const RE_ROW_R = /\br=["'](\d+)["']/;
const RE_CELL_R = /\br=["']([A-Za-z]+)\d*["']/;
const RE_CELL_T = /\bt=["']([^"']*)["']/;
const RE_CELL_S = /\bs=["'](\d+)["']/;
const RE_V = /<v\b[^>]*>([\s\S]*?)<\/v>/;

/** 'AB' → 27（0 起算） */
function colIndex(letters: string): number {
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + ((letters.charCodeAt(i) | 32) - 96);
  }
  return n - 1;
}

function parseSheet(xml: string, ctx: SheetContext, maxRows: number): string[][] {
  const open = xml.indexOf('<sheetData');
  if (open === -1) return [];
  const tagEnd = xml.indexOf('>', open);
  if (tagEnd === -1 || xml.charCodeAt(tagEnd - 1) === 47) return []; // <sheetData/>
  const close = xml.indexOf('</sheetData>', tagEnd);
  const body = xml.slice(tagEnd + 1, close === -1 ? xml.length : close);

  const rows: string[][] = [];
  let cur: string[] | null = null;
  let rowIdx = -1;
  let nextCol = 0;
  let maxCol = -1;

  const re = RE_TOKEN;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    if (m[1] === 'row') {
      // 優先採用 r 屬性：Excel 會省略整列空白的 <row>，不能只靠出現順序
      const rm = RE_ROW_R.exec(m[2]);
      rowIdx = rm ? Number(rm[1]) - 1 : rowIdx + 1;
      if (rowIdx >= maxRows) break; // 超過上限：靜默截斷
      while (rows.length <= rowIdx) rows.push([]);
      cur = m[3] === '/' ? null : rows[rowIdx];
      nextCol = 0;
      continue;
    }

    let inner = '';
    if (m[3] !== '/') {
      const end = body.indexOf('</c>', re.lastIndex);
      if (end === -1) break;
      inner = body.slice(re.lastIndex, end);
      re.lastIndex = end + 4;
    }
    if (cur === null) continue;

    const attrs = m[2];
    const rm = RE_CELL_R.exec(attrs);
    const col = rm ? colIndex(rm[1]) : nextCol;
    nextCol = col + 1;
    if (inner === '' || col < 0 || col >= MAX_COLS) continue;

    const type = RE_CELL_T.exec(attrs)?.[1];
    let val = '';
    if (type === 'inlineStr') {
      val = collectText(inner);
    } else {
      const vm = RE_V.exec(inner);
      if (vm !== null) {
        const v = vm[1];
        switch (type) {
          case 's':
            val = ctx.shared[Number(v)] ?? '';
            break;
          case 'str':
            val = decodeText(v);
            break;
          case 'b':
            val = v === '1' || v === 'true' ? 'true' : 'false';
            break;
          case 'e':
            val = ''; // #DIV/0! 之類的錯誤值視為空
            break;
          case 'd':
            val = decodeText(v); // ISO 8601 日期字串，原樣
            break;
          default: {
            // 數字：原文照回，不經 Number() 以免浮點重排；只有日期樣式才換算
            val = v;
            if (v !== '') {
              const sm = RE_CELL_S.exec(attrs);
              if (sm !== null && ctx.dateXf[Number(sm[1])] === true) val = serialToDate(v, ctx.date1904);
            }
          }
        }
      }
    }
    if (val !== '') {
      cur[col] = val;
      if (col > maxCol) maxCol = col;
    }
  }

  // 只有非空值才會寫入列，所以 length 為 0 就是整列空白；去掉尾端空列、保留中間空列
  let last = rows.length - 1;
  while (last >= 0 && rows[last].length === 0) last--;
  rows.length = last + 1;

  // 補洞並補齊成矩形（寬度為整張表實際用到的最大欄）
  const width = maxCol + 1;
  if (rows.length * width > MAX_CELLS) throw new Error(ERR_TOO_BIG);
  for (const row of rows) {
    for (let i = 0; i < width; i++) if (row[i] === undefined) row[i] = '';
  }
  return rows;
}

// ───────────────────────── 主程式 ─────────────────────────

/** 相對於 xl/ 的關聯路徑 → ZIP 內的完整路徑（處理 ./ 與 ../ 與開頭的 /） */
function resolveTarget(target: string): string {
  const parts: string[] = [];
  const full = target.startsWith('/') ? target.slice(1) : 'xl/' + target;
  for (const seg of full.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.' && seg !== '') parts.push(seg);
  }
  return parts.join('/');
}

/** 讀出每個工作表（含隱藏）。所有儲存格值都是字串；失敗時丟出繁體中文訊息的 Error */
export async function readXlsx(buf: ArrayBuffer, opts?: { maxRows?: number }): Promise<XlsxSheet[]> {
  const maxRows = opts?.maxRows ?? DEFAULT_MAX_ROWS;
  try {
    const bytes = new Uint8Array(buf);
    if (isOle(bytes)) {
      // 舊版 .xls 與「加密的 .xlsx」都是 OLE2 容器；後者目錄裡有 EncryptedPackage
      throw new Error(containsUtf16(bytes, 'EncryptedPackage') ? ERR_PASSWORD : ERR_XLS);
    }
    const entries = readZipDirectory(bytes);
    if (entries.has('EncryptedPackage') || entries.has('EncryptionInfo')) throw new Error(ERR_PASSWORD);

    const utf8 = new TextDecoder('utf-8');
    const budget: Budget = { total: 0 };
    const readText = async (path: string): Promise<string | null> => {
      const e = entries.get(path);
      return e ? utf8.decode(await readEntry(bytes, e, budget)) : null;
    };

    const wbXml = await readText('xl/workbook.xml');
    if (wbXml === null) throw new Error(ERR_INVALID);
    const relsXml = (await readText('xl/_rels/workbook.xml.rels')) ?? '';

    const date1904Attr = /<workbookPr\b([^>]*?)\/?>/.exec(wbXml);
    const wbPr = date1904Attr ? parseAttrs(date1904Attr[1]) : {};
    const date1904 = wbPr.date1904 === '1' || wbPr.date1904 === 'true';

    const rels = new Map<string, { target: string; type: string }>();
    for (const m of relsXml.matchAll(/<Relationship\b([^>]*?)\/?>/g)) {
      const a = parseAttrs(m[1]);
      if (a.Id !== undefined && a.Target !== undefined) rels.set(a.Id, { target: a.Target, type: a.Type ?? '' });
    }

    const sstXml = await readText('xl/sharedStrings.xml');
    const stylesXml = await readText('xl/styles.xml');
    const ctx: SheetContext = {
      shared: sstXml ? parseSharedStrings(sstXml) : [],
      dateXf: stylesXml ? parseDateStyles(stylesXml) : [],
      date1904,
    };

    const result: XlsxSheet[] = [];
    const parsed = new Map<string, string[][]>(); // 多個 <sheet> 指向同一個檔案時只解壓、解析一次
    for (const m of wbXml.matchAll(/<sheet\b([^>]*?)\/?>/g)) {
      if (result.length >= MAX_SHEETS) break;
      const a = parseAttrs(m[1]);
      // r:id 的命名空間前綴理論上可以不叫 r，所以找任何 *:id
      const idKey = Object.keys(a).find((k) => k === 'id' || k.endsWith(':id'));
      const rel = idKey ? rels.get(a[idKey]) : undefined;
      if (!rel) throw new Error(ERR_INVALID);
      if (rel.type && !rel.type.endsWith('/worksheet')) continue; // 圖表工作表等沒有儲存格資料
      const path = resolveTarget(rel.target);
      let rows = parsed.get(path);
      if (rows === undefined) {
        const xml = await readText(path);
        if (xml === null) throw new Error(ERR_INVALID);
        rows = parseSheet(xml, ctx, maxRows);
        parsed.set(path, rows);
      }
      result.push({ name: a.name ?? '', rows });
    }
    return result;
  } catch (e) {
    // 已知訊息直接往外丟；其餘（解壓失敗、截斷的資料等）一律當成損毀檔案
    if (e instanceof Error && KNOWN_ERRORS.has(e.message)) throw e;
    throw new Error(ERR_INVALID);
  }
}
