import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * /llms-full.txt — 全部中文文章的完整 markdown 合集(llms.txt 慣例)。
 * 供 LLM 一次抓取全站內容;單篇請用 /articles/<slug>.md。
 */
export const GET: APIRoute = async () => {
  const zh = (await getCollection('articles', ({ data }) => !data.archived))
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

  const parts = zh.map((a) => {
    const d = a.data;
    return [
      `# ${d.title}`,
      '',
      `> ${d.description}`,
      '',
      `- 網址:https://launchdock.app/articles/${a.id}`,
      `- 類型:${d.contentType}|難度:${d.difficulty}|最後驗證:${d.verifiedAt}`,
      d.tags?.length ? `- 標籤:${d.tags.join('、')}` : '',
      '',
      a.body ?? '',
    ]
      .filter((l) => l !== '')
      .join('\n');
  });

  const header = [
    'LaunchDock 藍鴨 — 全站中文文章合集(自動生成)',
    `生成時間:${new Date().toISOString()}`,
    '出處:https://launchdock.app|索引:https://launchdock.app/llms.txt',
    '',
    '='.repeat(60),
    '',
  ].join('\n');

  return new Response(header + parts.join('\n\n' + '='.repeat(60) + '\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
