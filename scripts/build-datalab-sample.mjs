// 產生「顧客數據戰情室」內建小樣本（公開、不需解鎖碼）。
// 從日晴資料以固定 seed 抽樣：150 位會員與他們的全部交易／明細，加上等比例的匿名交易；
// 保留各種資料瑕疵（匿名、退貨、日期混用、email 大小寫與共用、出生年空白），但 email 全部換成假值。
// 用法：npx tsx scripts/build-datalab-sample.mjs   （來源路徑可用 SUNLIT_DATA 指定）
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { toTable, decodeBuffer } from '../src/lib/datalab/csv.ts';

const dir = process.env.SUNLIT_DATA ?? '/home/user/589411/sunlit-site/data';
const out = new URL('../public/datalab/sample/', import.meta.url).pathname;
const SEED = 20261019;
const N_MEMBERS = 150;

const bytesOf = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const load = (f) => toTable(f, decodeBuffer(bytesOf(readFileSync(`${dir}/${f}.csv`))));
const members = load('members');
const txns = load('transactions');
const items = load('txn_items');
const products = load('products');

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(SEED);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const col = (t, n) => t.headers.indexOf(n);
const q = (v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const toCsv = (headers, rows) => [headers, ...rows].map((r) => r.map(q).join(',')).join('\n') + '\n';

// 1) 會員：先確保抽到的樣本裡含有「共用 email」與「大小寫不一致」等瑕疵
const iMember = col(members, 'member_id');
const iEmail = col(members, 'email');
const norm = (e) => e.trim().toLowerCase();
const byEmail = new Map();
for (const r of members.rows) if (norm(r[iEmail])) byEmail.set(norm(r[iEmail]), [...(byEmail.get(norm(r[iEmail])) ?? []), r[iMember]]);
const sharedPairs = [...byEmail.values()].filter((v) => v.length >= 2).slice(0, 3).flat();
const dirty = members.rows.filter((r) => r[iEmail] && r[iEmail] !== norm(r[iEmail])).slice(0, 4).map((r) => r[iMember]);
const picked = new Set([...sharedPairs, ...dirty]);
for (const r of shuffle(members.rows)) {
  if (picked.size >= N_MEMBERS) break;
  picked.add(r[iMember]);
}
const pseudo = new Map();
let n = 0;
const fakeEmail = (raw) => {
  if (raw.trim() === '') return raw; // 保留空白
  const k = norm(raw);
  if (!pseudo.has(k)) pseudo.set(k, `customer${String(++n).padStart(3, '0')}@example.com`);
  const base = pseudo.get(k);
  if (raw === k) return base;
  return raw.startsWith(' ') || raw.endsWith(' ') ? ` ${base.toUpperCase()} ` : base.replace(/^c/, 'C'); // 保留「大小寫／空白不一致」的樣態
};
const memRows = members.rows
  .filter((r) => picked.has(r[iMember]))
  .map((r) => r.map((v, i) => (i === iEmail ? fakeEmail(v) : v)));

// 2) 交易：樣本會員的全部交易 + 等比例匿名交易（維持原資料約 22% 匿名）
const tMember = col(txns, 'member_id');
const tId = col(txns, 'txn_id');
const memberTx = txns.rows.filter((r) => picked.has(r[tMember]));
const anonAll = txns.rows.filter((r) => (r[tMember] ?? '') === '');
const anonShare = anonAll.length / txns.rows.length;
const nAnon = Math.round((memberTx.length * anonShare) / (1 - anonShare));
const anonPick = shuffle(anonAll).slice(0, nAnon);
const txRows = [...memberTx, ...anonPick].sort((a, b) => (a[tId] < b[tId] ? -1 : 1));
const keep = new Set(txRows.map((r) => r[tId]));

// 3) 明細：被選交易的所有列（保留重複列）
const iiId = col(items, 'txn_id');
const itemRows = items.rows.filter((r) => keep.has(r[iiId]));

mkdirSync(out, { recursive: true });
writeFileSync(`${out}members.csv`, toCsv(members.headers, memRows));
writeFileSync(`${out}transactions.csv`, toCsv(txns.headers, txRows));
writeFileSync(`${out}txn_items.csv`, toCsv(items.headers, itemRows));
// 商品主檔（商品關聯分析要用 sku → 子品類）；日晴的商品是虛構的，整份複製
writeFileSync(`${out}products.csv`, toCsv(products.headers, products.rows));
console.log(`樣本：${memRows.length} 位會員、${txRows.length} 筆交易（匿名 ${anonPick.length}）、${itemRows.length} 列明細`);
