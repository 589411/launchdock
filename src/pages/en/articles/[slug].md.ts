import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

/**
 * /en/articles/<slug>.md — English article as raw markdown for LLM consumption.
 * Human-readable HTML: /en/articles/<slug>; index: /llms.txt
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articlesEn', ({ data }) => !data.archived);
  return articles.map((a) => ({ params: { slug: a.id }, props: { article: a } }));
};

export const GET: APIRoute = async ({ props }) => {
  const { article } = props;
  const d = article.data;
  const md = [
    `# ${d.title}`,
    '',
    `> ${d.description}`,
    '',
    `- Source: https://launchdock.app/en/articles/${article.id} (please attribute)`,
    `- Type: ${d.contentType} | Difficulty: ${d.difficulty} | Created: ${d.createdAt} | Verified: ${d.verifiedAt}`,
    d.tags?.length ? `- Tags: ${d.tags.join(', ')}` : '',
    '',
    '---',
    '',
    article.body ?? '',
  ]
    .filter((l) => l !== '')
    .join('\n');

  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
