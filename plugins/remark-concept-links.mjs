/**
 * remark-concept-links.mjs
 *
 * Remark plugin：在文章 Markdown 中自動將概念登錄表中的名詞
 * 轉為帶 tooltip 的連結（每篇文章每個概念只連結第一次出現）。
 *
 * 運作方式：
 * 1. 載入 concepts.yaml
 * 2. 走訪所有 text node
 * 3. 比對 aliases → 找到概念
 * 4. 第一次出現 → 包成 <a> + data-tooltip
 * 5. 跳過：已經是連結內的文字、code block、heading
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { visit } from 'unist-util-visit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONCEPTS_FILE = join(__dirname, '..', 'src', 'data', 'concepts.yaml');

// ── Parse concepts.yaml (same minimal parser as registry script) ────

function parseSimpleYaml(text) {
  const result = {};
  let currentTopKey = null;
  let currentObj = null;
  let currentArrayKey = null;

  for (const line of text.split('\n')) {
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;

    const topMatch = line.match(/^([A-Za-z][^:]*?):\s*$/);
    if (topMatch) {
      if (currentTopKey && currentObj) result[currentTopKey] = currentObj;
      currentTopKey = topMatch[1].trim();
      currentObj = {};
      currentArrayKey = null;
      continue;
    }

    if (!currentObj) continue;

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

    const scalarMatch = line.match(/^\s+([\w]+):\s*"?(.+?)"?\s*$/);
    if (scalarMatch) {
      const [, key, val] = scalarMatch;
      currentObj[key] = val;
      currentArrayKey = null;
      continue;
    }

    const arrayItemMatch = line.match(/^\s+-\s*"?(.+?)"?\s*$/);
    if (arrayItemMatch && currentArrayKey) {
      currentObj[currentArrayKey].push(arrayItemMatch[1]);
      continue;
    }

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

// ── Load concept data ───────────────────────────────────

let conceptEntries = null;

function getConceptEntries() {
  if (conceptEntries) return conceptEntries;

  const raw = readFileSync(CONCEPTS_FILE, 'utf-8');
  const concepts = parseSimpleYaml(raw);

  // Build lookup: sorted by alias length DESC (longest match first)
  const entries = [];
  for (const [name, c] of Object.entries(concepts)) {
    const aliases = Array.isArray(c.aliases) ? c.aliases : [];
    // Include displayName as alias if not already in list
    const allAliases = [...new Set([name, ...aliases])];

    for (const alias of allAliases) {
      entries.push({
        alias,
        conceptName: name,
        displayName: c.displayName || name,
        shortDesc: c.shortDesc || '',
        canonicalArticle: c.canonicalArticle || '',
        link: `/articles/${c.canonicalArticle}`,
      });
    }
  }

  // Sort longest first to match longer aliases before shorter ones
  entries.sort((a, b) => b.alias.length - a.alias.length);
  conceptEntries = entries;
  return entries;
}

// ── Remark plugin ───────────────────────────────────────

export default function remarkConceptLinks() {
  return (tree, file) => {
    const entries = getConceptEntries();
    const linked = new Set(); // Track which concepts we've already linked in this file

    // Determine current article slug (to skip self-linking)
    const currentSlug = file?.data?.astro?.frontmatter?.slug
      || file?.history?.[0]?.match(/articles\/(.+?)\.md/)?.[1]
      || '';

    visit(tree, 'text', (node, index, parent) => {
      // Skip if parent is heading, link, code, or inlineCode
      if (!parent || !Array.isArray(parent.children)) return;
      if (
        parent.type === 'heading' ||
        parent.type === 'link' ||
        parent.type === 'linkReference' ||
        parent.type === 'strong' ||
        parent.type === 'emphasis'
      ) return;

      // Skip if inside code or table header
      if (parent.type === 'inlineCode' || parent.type === 'code') return;

      // Skip nodes that are children of a link
      let ancestor = parent;
      let insideLink = false;
      // Simple check: just check direct parent (deep nesting is rare in our articles)

      let text = node.value;
      if (!text || text.length < 2) return;

      const newChildren = [];
      let lastIndex = 0;
      let modified = false;

      for (const entry of entries) {
        if (linked.has(entry.conceptName)) continue;
        if (entry.canonicalArticle === currentSlug) continue; // Don't self-link

        // Word-boundary-aware match
        // For English terms: use \b
        // For CJK: match as-is (CJK characters don't have word boundaries)
        const isCJK = /[\u4e00-\u9fff]/.test(entry.alias);
        const escaped = entry.alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = isCJK
          ? new RegExp(escaped)
          : new RegExp(`\\b${escaped}\\b`);

        const match = pattern.exec(text.substring(lastIndex));
        if (match) {
          const matchStart = lastIndex + match.index;
          const matchEnd = matchStart + match[0].length;

          // Add text before match
          if (matchStart > lastIndex) {
            newChildren.push({ type: 'text', value: text.substring(lastIndex, matchStart) });
          }

          // Add linked concept
          newChildren.push({
            type: 'html',
            value: `<a href="${entry.link}" class="concept-link" data-tooltip="${entry.shortDesc}" title="${entry.shortDesc}">${match[0]}</a>`,
          });

          linked.add(entry.conceptName);
          lastIndex = matchEnd;
          modified = true;
        }
      }

      if (modified) {
        // Add remaining text
        if (lastIndex < text.length) {
          newChildren.push({ type: 'text', value: text.substring(lastIndex) });
        }
        // Replace this node with new children
        parent.children.splice(index, 1, ...newChildren);
        return index + newChildren.length; // Skip past inserted nodes
      }
    });
  };
}
