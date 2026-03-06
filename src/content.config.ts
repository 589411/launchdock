import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Shared schema fields (locale-neutral) ─────────────────────
const articleSchemaBase = {
  title: z.string(),
  description: z.string(),
  contentType: z.enum(['tutorial', 'guide', 'reference', 'troubleshoot']),
  pathStep: z.number().optional(),
  series: z.object({ name: z.string(), part: z.number() }).optional(),
  order: z.number().optional().default(0),
  prerequisites: z.array(z.string()).optional().default([]),
  estimatedMinutes: z.number().min(1).max(60),
  createdAt: z.string(),
  verifiedAt: z.string(),
  compatibleVersion: z.string().optional(),
  archived: z.boolean().optional().default(false),
  archivedReason: z.string().optional(),
  discussionUrl: z.string().url().optional(),
  stuckOptions: z.record(z.string(), z.array(z.string())).optional().default({}),
  tags: z.array(z.string()).min(1).max(8),
};

// ── Chinese (zh-tw) articles ──────────────────────────────────
// Glob uses *.md (not **/*.md) to exclude the en/ subfolder.
const articles = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/articles' }),
  schema: z.object({
    ...articleSchemaBase,
    scene: z.enum([
      '認識 OpenClaw',
      '環境準備',
      '安裝與部署',
      '基礎使用',
      '核心功能',
      '整合與自動化',
      '知識與進階',
      '鴨編的碎碎念',
    ]),
    difficulty: z.enum(['入門', '中級', '進階']),
  }),
});

// ── English (en) articles ─────────────────────────────────────
// Uses neutral English keys for scene and difficulty.
const articlesEn = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/articles/en' }),
  schema: z.object({
    ...articleSchemaBase,
    scene: z.enum([
      'intro', 'env-setup', 'install', 'basics',
      'core', 'integration', 'advanced', 'blog',
    ]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  }),
});

export const collections = { articles, articlesEn };
