import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

/**
 * /articles/<slug>.md — 單篇文章的純 markdown 版本,供 LLM 直接抓取。
 * 人讀 HTML 版:/articles/<slug>;索引:/llms.txt
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getCollection('articles', ({ data }) => !data.archived);
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
    `- 出處:https://launchdock.app/articles/${article.id}(引用請註明)`,
    `- 類型:${d.contentType}|難度:${d.difficulty}|建立:${d.createdAt}|最後驗證:${d.verifiedAt}`,
    d.tags?.length ? `- 標籤:${d.tags.join('、')}` : '',
    d.prerequisites?.length
      ? `- 前置文章:${d.prerequisites.map((p: string) => `https://launchdock.app/articles/${p}.md`).join('、')}`
      : '',
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
