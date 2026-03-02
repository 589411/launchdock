#!/usr/bin/env node

/**
 * generate-article-registry.mjs
 *
 * 讀取所有文章的 frontmatter + concepts.yaml，
 * 產生 docs/article-registry.json 供 LLM 生成文章時參考。
 *
 * 用法：node scripts/generate-article-registry.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ARTICLES_DIR = join(ROOT, 'src', 'content', 'articles');
const CONCEPTS_FILE = join(ROOT, 'src', 'data', 'concepts.yaml');
const OUTPUT_FILE = join(ROOT, 'docs', 'article-registry.json');

// ── Minimal YAML parser for concepts.yaml ───────────────
// Our YAML is simple flat key-value with string/array values.
// No need for a full YAML parser dependency.

function parseSimpleYaml(text) {
  const result = {};
  let currentTopKey = null;
  let currentObj = null;
  let currentArrayKey = null;

  for (const line of text.split('\n')) {
    // Skip comments and empty lines
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;

    // Top-level key (no leading whitespace, ends with colon)
    const topMatch = line.match(/^([A-Za-z][^:]*?):\s*$/);
    if (topMatch) {
      if (currentTopKey && currentObj) result[currentTopKey] = currentObj;
      currentTopKey = topMatch[1].trim();
      currentObj = {};
      currentArrayKey = null;
      continue;
    }

    if (!currentObj) continue;

    // Sub-key with inline array: key: ["a", "b"]
    const inlineArrayMatch = line.match(/^\s+([\w]+):\s*\[(.*)]\s*$/);
    if (inlineArrayMatch) {
      const [, key, items] = inlineArrayMatch;
      currentObj[key] = items
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      currentArrayKey = null;
      continue;
    }

    // Sub-key with scalar value: key: "value" or key: value
    const scalarMatch = line.match(/^\s+([\w]+):\s*"?(.+?)"?\s*$/);
    if (scalarMatch) {
      const [, key, val] = scalarMatch;
      currentObj[key] = val;
      currentArrayKey = null;
      continue;
    }

    // Array item: - "value"
    const arrayItemMatch = line.match(/^\s+-\s*"?(.+?)"?\s*$/);
    if (arrayItemMatch && currentArrayKey) {
      currentObj[currentArrayKey].push(arrayItemMatch[1]);
      continue;
    }

    // Sub-key starting a block array: key:
    const blockArrayMatch = line.match(/^\s+([\w]+):\s*$/);
    if (blockArrayMatch) {
      currentArrayKey = blockArrayMatch[1];
      currentObj[currentArrayKey] = [];
      continue;
    }
  }
  if (currentTopKey && currentObj) result[currentTopKey] = currentObj;
  return result;
}

function loadConcepts() {
  const raw = readFileSync(CONCEPTS_FILE, 'utf-8');
  return parseSimpleYaml(raw);
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  const lines = match[1].split('\n');
  let currentKey = '';
  let inArray = false;

  for (const line of lines) {
    // Array item
    if (inArray && /^\s+-\s*/.test(line)) {
      const val = line.replace(/^\s+-\s*/, '').replace(/^"|"$/g, '').trim();
      if (val) fm[currentKey].push(val);
      continue;
    }

    // Key: value or Key: [inline array]
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const [, key, rawVal] = kvMatch;
      const val = rawVal.trim();
      inArray = false;

      if (val === '' || val === '[]') {
        fm[key] = [];
        inArray = val === '' || val === '[]';
        if (val === '') inArray = true;
        currentKey = key;
      } else if (val.startsWith('[')) {
        // inline array
        fm[key] = val
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^"|"$/g, ''));
        inArray = false;
      } else {
        fm[key] = val.replace(/^"|"$/g, '');
        inArray = false;
      }
      currentKey = key;
    }
  }
  return fm;
}

// ── Main ────────────────────────────────────────────────

const concepts = loadConcepts();

// Build reverse index: slug → concepts that point to it as canonical
const slugToConceptsDefined = {};
const slugToConceptsReferenced = {};

for (const [name, c] of Object.entries(concepts)) {
  const slug = c.canonicalArticle;
  if (slug) {
    if (!slugToConceptsDefined[slug]) slugToConceptsDefined[slug] = [];
    slugToConceptsDefined[slug].push(name);
  }
  for (const rel of c.relatedArticles || []) {
    if (!slugToConceptsReferenced[rel]) slugToConceptsReferenced[rel] = [];
    slugToConceptsReferenced[rel].push(name);
  }
}

// Read all articles
const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
const articles = [];

for (const file of files) {
  const content = readFileSync(join(ARTICLES_DIR, file), 'utf-8');
  const fm = extractFrontmatter(content);
  const slug = file.replace(/\.md$/, '');

  articles.push({
    slug,
    title: fm.title || '',
    description: fm.description || '',
    scene: fm.scene || '',
    difficulty: fm.difficulty || '',
    contentType: fm.contentType || '',
    tags: fm.tags || [],
    prerequisites: fm.prerequisites || [],
    concepts_defined: slugToConceptsDefined[slug] || [],
    concepts_referenced: [...new Set(slugToConceptsReferenced[slug] || [])],
    link: `/articles/${slug}`,
  });
}

// Sort by scene then order
articles.sort((a, b) => a.scene.localeCompare(b.scene) || a.title.localeCompare(b.title));

const output = {
  _generated: new Date().toISOString(),
  _description:
    'Auto-generated from concepts.yaml + article frontmatter. LLM 生成文章時參考此檔案做跨文章連結。執行 node scripts/generate-article-registry.mjs 重新產生。',
  concepts: Object.fromEntries(
    Object.entries(concepts).map(([name, c]) => [
      name,
      {
        displayName: c.displayName,
        shortDesc: c.shortDesc,
        canonicalArticle: c.canonicalArticle,
        link: `/articles/${c.canonicalArticle}`,
      },
    ]),
  ),
  articles,
};

writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf-8');
console.log(`✅ article-registry.json generated (${articles.length} articles, ${Object.keys(concepts).length} concepts)`);
