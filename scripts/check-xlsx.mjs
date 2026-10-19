// xlsx 讀取器自檢：以 Python 獨立算出的參考答案（scripts/fixtures/xlsx/expected.json）比對，
// 另加記憶體內組裝的錯誤檔案與 5 萬列效能測試。
// 用法：npx --yes tsx scripts/check-xlsx.mjs
// 重新產生測試檔：python3 scripts/fixtures/build-xlsx-fixtures.py
import { readFileSync } from 'node:fs';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readXlsx } from '../src/lib/datalab/xlsx.ts';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'xlsx');
// Node 讀小檔案時 buf.buffer 會帶共用記憶體池，必須依 byteOffset 切出這個檔案自己的位元組
const bytesOf = (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const load = (name) => bytesOf(readFileSync(join(dir, name)));
const expected = JSON.parse(readFileSync(join(dir, 'expected.json'), 'utf8'));

const MSG_INVALID = '這個檔案不是有效的 Excel（.xlsx）檔';
const MSG_XLS = '這是舊版 .xls 格式，請用 Excel 另存成 .xlsx 或 CSV';
const MSG_PASSWORD = '這個檔案有密碼保護，請先在 Excel 取消密碼再上傳';

let passed = 0;
const failures = [];
async function test(name, fn) {
  try {
    await fn();
    passed++;
  } catch (e) {
    failures.push(`❌ ${name}\n   ${String(e.message).split('\n').join('\n   ')}`);
  }
}
async function rejectsWith(buf, message) {
  let err = null;
  try {
    await readXlsx(buf);
  } catch (e) {
    err = e;
  }
  if (!err) throw new Error('應該丟出錯誤，但沒有');
  strictEqual(err instanceof Error, true);
  strictEqual(err.message, message);
}

// ── 1. 用 Python 參考答案逐檔比對 ───────────────────────────────
for (const [file, sheets] of Object.entries(expected)) {
  await test(`參考答案：${file}`, async () => {
    deepStrictEqual(await readXlsx(load(file)), sheets);
  });
}

// ── 2. 針對性斷言（避免只靠 JSON 而漏看重點） ──────────────────────
await test('多工作表名稱與順序（含隱藏、空表、名稱含實體）', async () => {
  const s = await readXlsx(load('features.xlsx'));
  deepStrictEqual(s.map((x) => x.name), ['文字', '日期', '稀疏', '寬欄 & 名稱', '隱藏', '空']);
});
await test('數字原文不變（1200、0.1、1E-05、長整數）', async () => {
  const [t] = await readXlsx(load('features.xlsx'));
  deepStrictEqual(t.rows[2].slice(0, 5), ['1200', '0.1', '1E-05', '-0.30000000000000004', '123456789012345678']);
});
await test('日期：Excel 閏年 bug 前後（59／60／61）', async () => {
  const d = (await readXlsx(load('features.xlsx')))[1].rows;
  deepStrictEqual([d[1][0], d[2][0], d[3][0]], ['1900-02-28', '1900-02-29', '1900-03-01']);
});
await test('日期：含小數的日期時間與 23:59:59', async () => {
  const d = (await readXlsx(load('features.xlsx')))[1].rows;
  strictEqual(d[7][0], '2023-03-15 12:00:00');
  strictEqual(d[9][0], '2024-01-01 23:59:59');
});
await test('日期：1904 系統（手工與 openpyxl）', async () => {
  const hand = (await readXlsx(load('dates-1904-handmade.xlsx')))[0].rows;
  strictEqual(hand[0][0], '1904-01-01');
  strictEqual(hand[6][0], '45000'); // 一般格式不轉換
  const op = (await readXlsx(load('openpyxl-1904.xlsx')))[0].rows;
  deepStrictEqual(op.map((r) => r[0]), ['2023-03-15', '1904-01-02', '2024-02-29 13:45:30', '2030-12-31 00:00:01']);
});
await test('稀疏儲存格：矩形、中間空列保留、尾端空列去除', async () => {
  const r = (await readXlsx(load('features.xlsx')))[2].rows;
  strictEqual(r.length, 5);
  for (const row of r) strictEqual(row.length, 3);
});
await test('欄位字母換算（Z、AA、AB、AZ、BA）', async () => {
  const r = (await readXlsx(load('features.xlsx')))[3].rows;
  strictEqual(r[0].length, 53);
  deepStrictEqual([r[0][25], r[0][26], r[0][27], r[0][51], r[0][52]], ['z', 'aa', 'ab', 'az', 'ba']);
});
await test('maxRows 截斷（每張表各自計算）', async () => {
  const s = await readXlsx(load('rows20.xlsx'), { maxRows: 5 });
  strictEqual(s[0].rows.length, 5);
  deepStrictEqual(s[0].rows[4], ['5', 'row5']);
  strictEqual(s[1].rows.length, 5);
  const all = await readXlsx(load('rows20.xlsx'));
  strictEqual(all[0].rows.length, 20);
});
await test('maxRows 為 0 回傳空表', async () => {
  const s = await readXlsx(load('rows20.xlsx'), { maxRows: 0 });
  strictEqual(s[0].rows.length, 0);
});

// ── 3. 錯誤情境 ─────────────────────────────────────────────
await test('錯誤：非 zip（純文字）', () => rejectsWith(load('not-a-zip.xlsx'), MSG_INVALID));
await test('錯誤：空 buffer', () => rejectsWith(new ArrayBuffer(0), MSG_INVALID));
await test('錯誤：截斷的 zip', () => rejectsWith(load('truncated.xlsx'), MSG_INVALID));
await test('錯誤：舊版 .xls（OLE2）', () => rejectsWith(load('legacy.xls'), MSG_XLS));
await test('錯誤：加密檔（OLE 內有 EncryptedPackage）', () => rejectsWith(load('encrypted-ole.xlsx'), MSG_PASSWORD));
await test('錯誤：加密檔（zip 內有 EncryptedPackage 項目）', () => rejectsWith(load('encrypted-entry.xlsx'), MSG_PASSWORD));

// 記憶體內組 zip 的小工具（stored 或自備壓縮資料；效能測試也用它）
const enc = new TextEncoder();
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
async function deflateRaw(data) {
  const s = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
/** files: { name, data(Uint8Array|string), method?: 0|8, raw?: 已壓縮資料, size?: 原始大小 } */
async function makeZip(files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const push = (u8) => {
    chunks.push(u8);
    offset += u8.length;
  };
  for (const f of files) {
    const name = enc.encode(f.name);
    const plain = typeof f.data === 'string' ? enc.encode(f.data) : f.data ?? new Uint8Array(0);
    const method = f.method ?? 8;
    const comp = f.raw ?? (method === 8 ? await deflateRaw(plain) : plain);
    const crc = crc32(plain);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(8, method, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, comp.length, true);
    lh.setUint32(22, plain.length, true);
    lh.setUint16(26, name.length, true);
    const localOffset = offset;
    push(new Uint8Array(lh.buffer));
    push(name);
    push(comp);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint16(10, method, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, comp.length, true);
    ch.setUint32(24, plain.length, true);
    ch.setUint16(28, name.length, true);
    ch.setUint32(42, localOffset, true);
    central.push(new Uint8Array(ch.buffer), name);
  }
  const cdStart = offset;
  for (const c of central) push(c);
  const eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true);
  eo.setUint16(8, files.length, true);
  eo.setUint16(10, files.length, true);
  eo.setUint32(12, offset - cdStart, true);
  eo.setUint32(16, cdStart, true);
  push(new Uint8Array(eo.buffer));
  const out = new Uint8Array(offset);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return out.buffer;
}

const NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
const RNS = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const workbookXml = `<workbook ${NS} ${RNS}><sheets><sheet name="S" sheetId="1" r:id="rId1"/></sheets></workbook>`;
const relsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
const sheetXml = (rows) => `<worksheet ${NS}><sheetData>${rows}</sheetData></worksheet>`;

await test('錯誤：zip 內缺 workbook.xml', async () => {
  const buf = await makeZip([{ name: 'xl/worksheets/sheet1.xml', data: sheetXml('') }]);
  await rejectsWith(buf, MSG_INVALID);
});
await test('錯誤：workbook 指向不存在的工作表檔', async () => {
  const buf = await makeZip([
    { name: 'xl/workbook.xml', data: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', data: relsXml },
  ]);
  await rejectsWith(buf, MSG_INVALID);
});
await test('錯誤：deflate 資料損毀', async () => {
  const buf = await makeZip([
    { name: 'xl/workbook.xml', method: 8, raw: new Uint8Array([0xff, 0xfe, 0xfd, 0x00, 0x11, 0x22, 0x33]), data: workbookXml },
  ]);
  await rejectsWith(buf, MSG_INVALID);
});
await test('stored（method 0）項目可讀', async () => {
  const buf = await makeZip([
    { name: 'xl/workbook.xml', method: 0, data: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', method: 0, data: relsXml },
    { name: 'xl/worksheets/sheet1.xml', method: 0, data: sheetXml('<row r="1"><c r="A1" t="inlineStr"><is><t>ok</t></is></c></row>') },
  ]);
  deepStrictEqual(await readXlsx(buf), [{ name: 'S', rows: [['ok']] }]);
});
await test('沒有 r 屬性的列與格依序排列', async () => {
  const buf = await makeZip([
    { name: 'xl/workbook.xml', data: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', data: relsXml },
    { name: 'xl/worksheets/sheet1.xml', data: sheetXml('<row><c><v>1</v></c><c><v>2</v></c></row><row><c><v>3</v></c></row>') },
  ]);
  deepStrictEqual((await readXlsx(buf))[0].rows, [['1', '2'], ['3', '']]);
});

// ── 4. 效能：5 萬列 × 8 欄 ─────────────────────────────────────
let perfMs = -1;
await test('效能：50,000 列 × 8 欄 < 3000 ms（且內容正確）', async () => {
  const ROWS = 50000;
  const COLS = 8;
  const letters = 'ABCDEFGH';
  const sst = [];
  const parts = [];
  for (let r = 1; r <= ROWS; r++) {
    const cells = [];
    for (let c = 0; c < COLS; c++) {
      const ref = `${letters[c]}${r}`;
      if (c === 0) {
        cells.push(`<c r="${ref}" t="s"><v>${sst.length}</v></c>`);
        sst.push(`<si><t>客戶${r}</t></si>`);
      } else if (c === 1) cells.push(`<c r="${ref}" t="inlineStr"><is><t>品項 &amp; ${r % 97}</t></is></c>`);
      else if (c === 2) cells.push(`<c r="${ref}" s="1"><v>${45000 + (r % 365)}</v></c>`);
      else cells.push(`<c r="${ref}"><v>${r * c}.5</v></c>`);
    }
    parts.push(`<row r="${r}">${cells.join('')}</row>`);
  }
  const styles = `<styleSheet ${NS}><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="14"/></cellXfs></styleSheet>`;
  const buf = await makeZip([
    { name: 'xl/workbook.xml', data: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', data: relsXml },
    { name: 'xl/styles.xml', data: styles },
    { name: 'xl/sharedStrings.xml', data: `<sst ${NS}>${sst.join('')}</sst>` },
    { name: 'xl/worksheets/sheet1.xml', data: sheetXml(parts.join('')) },
  ]);
  const t0 = performance.now();
  const sheets = await readXlsx(buf);
  perfMs = Math.round(performance.now() - t0);
  const rows = sheets[0].rows;
  strictEqual(rows.length, ROWS);
  deepStrictEqual(rows[0], ['客戶1', '品項 & 1', '2023-03-16', '3.5', '4.5', '5.5', '6.5', '7.5']);
  strictEqual(rows[ROWS - 1][0], `客戶${ROWS}`);
  strictEqual(rows[ROWS - 1][7], `${ROWS * 7}.5`);
  if (perfMs >= 3000) throw new Error(`太慢：${perfMs} ms`);
});

// ── 結果 ────────────────────────────────────────────────────
if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`\n${failures.length} 項失敗，${passed} 項通過`);
  process.exit(1);
}
console.log(`✅ xlsx 讀取器：${passed} 項測試全部通過（5 萬列 × 8 欄解析 ${perfMs} ms）`);
