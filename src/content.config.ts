import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    // === 基本資訊 ===
    title: z.string(),
    description: z.string(),

    // === 分類系統 ===
    contentType: z.enum(['tutorial', 'guide', 'reference', 'troubleshoot']),
    scene: z.enum([
      '認識 OpenClaw',
      '環境準備',
      '安裝與部署',
      '基礎使用',
      '核心功能',
      '整合與自動化',
      '知識與進階',
    ]),
    difficulty: z.enum(['入門', '中級', '進階']),
    tags: z.array(z.string()).min(1).max(8),

    // === 學習路徑 ===
    pathStep: z.number().optional(),
    series: z.object({
      name: z.string(),
      part: z.number(),
    }).optional(),
    order: z.number().optional().default(0),
    prerequisites: z.array(z.string()).optional().default([]),
    estimatedMinutes: z.number().min(1).max(60),

    // === 元資料 ===
    createdAt: z.string(),
    verifiedAt: z.string(),
    compatibleVersion: z.string().optional(),
    archived: z.boolean().optional().default(false),
    archivedReason: z.string().optional(),

    // === 互動功能 ===
    discussionUrl: z.string().url().optional(),
    stuckOptions: z.record(z.string(), z.array(z.string())).optional().default({}),
  }),
});

export const collections = { articles };
