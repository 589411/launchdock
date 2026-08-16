#!/usr/bin/env node
/**
 * Astro 只把「根目錄」的 404.astro 特別輸出成 dist/404.html；
 * 巢狀的 src/pages/en/404.astro 走一般 directory 格式，變成 dist/en/404/index.html。
 * 但 Cloudflare Pages 找 404 處理器時是往上找最近的 `404.html`，
 * 所以 /en/* 的請求要吃到英文 404，必須有 dist/en/404.html。
 *
 * 這支就是把它複製出來。刻意做成不會讓 build 失敗：
 * 找不到來源就印個 warning 走人（不然改頁面結構時會連帶炸掉部署）。
 *
 * 背景見 docs/seo-indexing-fix.md §七。
 */
import { copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const src = 'dist/en/404/index.html';
const dest = 'dist/en/404.html';

try {
  await access(src, constants.R_OK);
} catch {
  console.warn(`[emit-en-404] 找不到 ${src}，跳過（英文 404 會退回根目錄的中文 404）`);
  process.exit(0);
}

await copyFile(src, dest);
console.log(`[emit-en-404] ${src} → ${dest}`);
