#!/usr/bin/env node
/**
 * After `astro build`, write Cloudflare Pages 302 rules for the stable
 * 藍鴨快報 short links so they always point at the current episode:
 *
 *   /kuaibao/latest    → https://youtu.be/<latestKuaibaoEpisode.youtubeId>
 *   /kuaibao/latest/
 *   /en/kuaibao/latest
 *   /en/kuaibao/latest/
 *
 * Source of truth: `src/data/kuaibao.ts` (`latestKuaibaoEpisode`).
 * Daily automation only needs to bump that object; do not edit _redirects by hand.
 *
 * We emit `_redirects` (HTTP 302) and do not write HTML at the same paths.
 * On Cloudflare Pages a static file at the same path can be served instead of
 * the redirect, which would break `curl -L` following through to YouTube.
 *
 * If `public/_redirects` already exists, its rules are kept and this block is
 * appended (or replaced if a previous generated block is present).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SRC = 'src/data/kuaibao.ts';
const DIST_REDIRECTS = 'dist/_redirects';
const PUBLIC_REDIRECTS = 'public/_redirects';
const BEGIN = '# kuaibao-latest (generated; do not edit — source: src/data/kuaibao.ts)';
const END = '# end kuaibao-latest';
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function extractYoutubeId(src) {
  const block = src.match(/export const latestKuaibaoEpisode = \{([\s\S]*?)\} as const;/);
  if (!block) {
    throw new Error(`[emit-kuaibao-latest-redirect] 找不到 latestKuaibaoEpisode：${SRC}`);
  }
  const idMatch = block[1].match(/youtubeId:\s*'([^']+)'/);
  if (!idMatch) {
    throw new Error(`[emit-kuaibao-latest-redirect] 找不到 youtubeId：${SRC}`);
  }
  const id = idMatch[1];
  if (!YT_ID_RE.test(id)) {
    throw new Error(`[emit-kuaibao-latest-redirect] youtubeId 格式不對：${id}`);
  }
  return id;
}

function stripGeneratedBlock(text) {
  const start = text.indexOf(BEGIN);
  if (start === -1) return text.trimEnd();
  const end = text.indexOf(END, start);
  if (end === -1) {
    throw new Error('[emit-kuaibao-latest-redirect] dist/_redirects 有起始標記但沒有結束標記，請手動檢查');
  }
  const before = text.slice(0, start).trimEnd();
  const after = text.slice(end + END.length).trimStart();
  return [before, after].filter(Boolean).join('\n\n').trimEnd();
}

function loadExisting() {
  if (existsSync(DIST_REDIRECTS)) return readFileSync(DIST_REDIRECTS, 'utf8');
  if (existsSync(PUBLIC_REDIRECTS)) return readFileSync(PUBLIC_REDIRECTS, 'utf8');
  return '';
}

if (!existsSync('dist')) {
  console.error('[emit-kuaibao-latest-redirect] 找不到 dist/，請先跑 astro build');
  process.exit(1);
}

const id = extractYoutubeId(readFileSync(SRC, 'utf8'));
const dest = `https://youtu.be/${id}`;
const paths = [
  '/kuaibao/latest',
  '/kuaibao/latest/',
  '/en/kuaibao/latest',
  '/en/kuaibao/latest/',
];
const block = [
  BEGIN,
  ...paths.map((from) => `${from}    ${dest}    302`),
  END,
].join('\n');

const kept = stripGeneratedBlock(loadExisting());
const output = (kept ? `${kept}\n\n${block}\n` : `${block}\n`);
writeFileSync(DIST_REDIRECTS, output);
console.log(`[emit-kuaibao-latest-redirect] ${DIST_REDIRECTS} → ${dest}`);
