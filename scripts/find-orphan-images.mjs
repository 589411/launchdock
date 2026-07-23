#!/usr/bin/env node
/**
 * find-orphan-images.mjs — 揪出「沒被任何文章／頁面引用、卻躺在 repo 裡」的孤兒圖片。
 *
 * 背景（2026-07-23 事故）：批次把桌面截圖丟進 public/images/articles/，沒選進文章的就
 * 變孤兒圖——它們沒經過遮罩審查卻照樣被 push 到 public GitHub，同時是資安曝險又是肥肉。
 * 這支做「引用比對稽核」：掃 src/ + docs/ 所有 /images/articles/... 引用 vs 磁碟實際檔案，
 * 列出差集（孤兒）。
 *
 * 用法：
 *   node scripts/find-orphan-images.mjs            # 只稽核，列出孤兒（預設，安全）
 *   node scripts/find-orphan-images.mjs --rm       # 印出可直接複製的 git rm 指令（不自動執行）
 *
 * ⚠️ 刻意「不」自動刪除：孤兒可能是待用素材（例如錯誤碼截圖是 SEO 原料）。刪除是破壞性操作，
 *    由人看過清單再決定——這條紀律寫進工具本身。
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const IMG_DIR = 'public/images/articles';
const SCAN_DIRS = ['src', 'docs'];
const CODE_EXT = /\.(md|astro|ts|tsx|js|mjs|json|ya?ml)$/i;
const IMG_EXT = /\.(png|jpe?g|gif|webp)$/i;
// 引用格式：![alt](/images/articles/<slug>/<file>) 或任何字串內含該路徑
const REF_RE = /\/images\/articles\/[^\s")'\]<>|]+\.(?:png|jpe?g|gif|webp)/gi;

function walk(dir, onFile) {
  let entries;
  try { entries = readdirSync(join(ROOT, dir), { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) walk(rel, onFile);
    else onFile(rel);
  }
}

// 1) 蒐集被引用的圖片相對路徑（相對 IMG_DIR）
const referenced = new Set();
for (const d of SCAN_DIRS) {
  walk(d, (rel) => {
    if (!CODE_EXT.test(rel)) return;
    const txt = readFileSync(join(ROOT, rel), 'utf8');
    for (const m of txt.match(REF_RE) || []) {
      referenced.add(m.split('/images/articles/')[1]);
    }
  });
}

// 2) 掃磁碟圖片，比對出孤兒
const orphans = [];
let totalBytes = 0;
walk(IMG_DIR, (rel) => {
  if (!IMG_EXT.test(rel)) return;
  const key = relative(IMG_DIR, rel);
  if (!referenced.has(key)) {
    const size = statSync(join(ROOT, rel)).size;
    orphans.push({ rel, key, size });
    totalBytes += size;
  }
});

// 3) 輸出報告
orphans.sort((a, b) => a.rel.localeCompare(b.rel));
if (orphans.length === 0) {
  console.log('✅ 沒有孤兒圖片——每張圖都被至少一篇文章／頁面引用。');
  process.exit(0);
}

const byFolder = new Map();
for (const o of orphans) {
  const folder = o.key.split('/')[0];
  if (!byFolder.has(folder)) byFolder.set(folder, []);
  byFolder.get(folder).push(o);
}

console.log(`🔍 發現 ${orphans.length} 張孤兒圖片，合計 ${(totalBytes / 1024 / 1024).toFixed(1)} MB\n`);
for (const folder of [...byFolder.keys()].sort()) {
  const list = byFolder.get(folder);
  console.log(`[${folder}]  ${list.length} 張`);
  for (const o of list) console.log(`    ${o.key.split('/').slice(1).join('/')}`);
}

if (process.argv.includes('--rm')) {
  console.log('\n# 確認清單無誤後，複製以下指令刪除（含 API key/登入類請先人眼看過）：');
  console.log('git rm \\');
  console.log(orphans.map((o) => `  '${o.rel}'`).join(' \\\n'));
} else {
  console.log('\n提醒：孤兒不一定是垃圾（錯誤碼截圖可能是 SEO 素材）。看過清單再決定；');
  console.log('要刪的話 `node scripts/find-orphan-images.mjs --rm` 會印出可複製的 git rm 指令。');
}
