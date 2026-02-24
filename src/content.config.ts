import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    scene: z.string(),
    difficulty: z.enum(['入門', '中級', '進階']),
    createdAt: z.string(),
    verifiedAt: z.string(),
    archived: z.boolean().optional().default(false),
    archivedReason: z.string().optional(),
    discussionUrl: z.string().url().optional(),
    order: z.number().optional().default(0),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const collections = { articles };
