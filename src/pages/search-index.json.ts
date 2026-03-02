import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles', ({ data }) => !data.archived);

  const searchIndex = articles.map((article) => ({
    slug: article.id,
    title: article.data.title,
    description: article.data.description,
    scene: article.data.scene,
    difficulty: article.data.difficulty,
    tags: article.data.tags,
    contentType: article.data.contentType,
    estimatedMinutes: article.data.estimatedMinutes,
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' },
  });
};
