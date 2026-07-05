#!/usr/bin/env node

/**
 * generate-handout.mjs — 按課程模組抽組上課講義
 *
 * 讀 docs/article-registry.json(先跑 npm run registry),
 * 抽出掛了指定 module 的文章,產出一份 markdown 講義。
 *
 * 用法:
 *   node scripts/generate-handout.mjs M03           # 產出 docs/handouts/M03.md
 *   node scripts/generate-handout.mjs M03 --list    # 只在終端列出文章清單
 *
 * 模組定義正本:launchdock-lab/data/modules.yaml
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REGISTRY = join(ROOT, 'docs', 'article-registry.json');
const ARTICLES_DIR = join(ROOT, 'src', 'content', 'articles');
const OUT_DIR = join(ROOT, 'docs', 'handouts');
const SITE = 'https://launchdock.app';

const moduleId = process.argv[2];
const listOnly = process.argv.includes('--list');

if (!moduleId || !/^M(0[1-9]|1[0-3])$/.test(moduleId)) {
  console.error('用法:node scripts/generate-handout.mjs M01–M13 [--list]');
  process.exit(1);
}

if (!existsSync(REGISTRY)) {
  console.error('找不到 docs/article-registry.json,先跑:npm run registry');
  process.exit(1);
}

const registry = JSON.parse(readFileSync(REGISTRY, 'utf-8'));
const articles = (registry.articles || []).filter((a) => (a.modules || []).includes(moduleId));

if (articles.length === 0) {
  console.log(`⚠️ 沒有文章掛 modules: [${moduleId}]。在文章 frontmatter 加上後重跑 npm run registry。`);
  process.exit(0);
}

if (listOnly) {
  for (const a of articles) console.log(`- ${a.title}(${SITE}${a.link})`);
  console.log(`共 ${articles.length} 篇`);
  process.exit(0);
}

// 抽踩坑文的「如何預防」段落,彙整到講義最後
function extractPrevention(slug) {
  try {
    const md = readFileSync(join(ARTICLES_DIR, `${slug}.md`), 'utf-8');
    const m = md.match(/##+\s*(?:如何預防|預防)[^\n]*\n([\s\S]*?)(?=\n##|\n---|$)/);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

const today = new Date().toISOString().slice(0, 10);
const lines = [
  `# 講義 ${moduleId}`,
  '',
  `> 自動產出於 ${today},來源:launchdock.app 文章(單一來源,勿手工維護本檔)。`,
  `> 模組定義:launchdock-lab/data/modules.yaml`,
  '',
];

for (const a of articles) {
  lines.push(`## ${a.title}`);
  lines.push('');
  lines.push(a.description || '');
  lines.push('');
  lines.push(`- 難度:${a.difficulty || '—'}|類型:${a.contentType || '—'}`);
  lines.push(`- 線上閱讀(可轉 QR):${SITE}${a.link}`);
  if ((a.prerequisites || []).length) {
    lines.push(`- 前置:${a.prerequisites.map((p) => `${SITE}/articles/${p}`).join('、')}`);
  }
  lines.push('');
}

const preventions = articles
  .filter((a) => a.contentType === 'troubleshoot')
  .map((a) => ({ title: a.title, text: extractPrevention(a.slug) }))
  .filter((p) => p.text);

if (preventions.length) {
  lines.push('---', '', '## 📋 踩坑預防彙整(課堂 checklist)', '');
  for (const p of preventions) {
    lines.push(`### ${p.title}`, '', p.text, '');
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const outFile = join(OUT_DIR, `${moduleId}.md`);
writeFileSync(outFile, lines.join('\n') + '\n', 'utf-8');
console.log(`✅ 講義已產出:docs/handouts/${moduleId}.md(${articles.length} 篇文章,${preventions.length} 條預防彙整)`);
