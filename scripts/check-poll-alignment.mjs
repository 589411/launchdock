#!/usr/bin/env node
// ============================================================
// 課堂投票 × 學員講義 對齊檢查
// ------------------------------------------------------------
// 講義已經印出去了。看板上的題號、題目、選項只要跟紙上差一個字，
// 學員當場就會問「我這題是哪一題」——這是課堂最貴的中斷。
//
// 用法：node scripts/check-poll-alignment.mjs [講義資料夾]
// 預設讀 ~/github/sunlit-retail-sim/wp9-colab/handouts/
// ============================================================
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const handoutDir = process.argv[2] ?? join(homedir(), 'github/sunlit-retail-sim/wp9-colab/handouts');
const HANDOUTS = [
  { day: 3, file: 'day3-學員講義-v2.md' },
  { day: 4, file: 'day4-學員講義-v2.md' },
];

// ── 講義側 ──────────────────────────────────────────────
const printed = [];
for (const { day, file } of HANDOUTS) {
  let lines;
  try {
    lines = readFileSync(join(handoutDir, file), 'utf8').split('\n');
  } catch {
    console.error(`⚠️  讀不到 ${join(handoutDir, file)}——講義不在這台機器上，跳過檢查。`);
    process.exit(0);
  }
  lines.forEach((line, i) => {
    const m = line.trim().match(/^### 💬 投票 (Q\d+)｜(.+?)(?:　←.*)?$/);
    if (!m) return;
    const optLine = lines.slice(i + 1, i + 5).find((l) => l.includes('☐'));
    const options = optLine
      ? optLine.split('☐').map((s) => s.trim()).filter(Boolean)
      : null;
    printed.push({ label: m[1], text: m[2].trim(), options, day });
  });
}

// ── 程式側 ──────────────────────────────────────────────
const raw = readFileSync(new URL('../src/data/class-poll.ts', import.meta.url), 'utf8');
// 只看 questions 陣列——warmupQuestion（Q0）刻意不在講義上，不該進對齊檢查
const src = raw.slice(raw.indexOf('export const questions'), raw.indexOf('export const warmupQuestion'));
const code = [...src.matchAll(/\{\s*id: '(q\d+)',\s*label: '(Q\d+)',\s*day: (\d),\s*text: '(.+?)',\s*options: \[(.*?)\],/gs)].map(
  (m) => ({
    label: m[2],
    day: Number(m[3]),
    text: m[4],
    options: m[5].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean),
  }),
);

// ── 比對 ────────────────────────────────────────────────
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let bad = 0;
printed.forEach((p, i) => {
  const c = code[i];
  const problems = [];
  if (!c) problems.push('程式裡沒有這一題');
  else {
    if (c.label !== p.label) problems.push(`題號順序不同：講義 ${p.label} / 程式 ${c.label}`);
    if (c.text !== p.text) problems.push(`題目不同：\n      講義「${p.text}」\n      程式「${c.text}」`);
    if (!eq(c.options, p.options)) problems.push(`選項不同：\n      講義 ${p.options?.join(' / ')}\n      程式 ${c.options.join(' / ')}`);
    if (c.day !== p.day) problems.push(`天數不同：講義 Day ${p.day} / 程式 Day ${c.day}`);
  }
  if (problems.length) {
    bad++;
    console.log(`❌ ${p.label}\n    ${problems.join('\n    ')}`);
  } else {
    console.log(`✅ ${p.label}  ${p.text}`);
  }
});

if (code.length !== printed.length) {
  bad++;
  console.log(`❌ 題數不同：講義 ${printed.length} 題 / 程式 ${code.length} 題（Q0 暖身題不在 questions 陣列裡，不算）`);
}

console.log('─'.repeat(48));
console.log(bad === 0 ? `全部對齊 ✅（${printed.length} 題）` : `${bad} 處不一致 ❌ —— 看板不要上場，先修`);
process.exit(bad === 0 ? 0 : 1);
