import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * /llms.txt — 給 LLM 的站點索引(https://llmstxt.org 慣例)。
 * 讓任何 AI 工具可以直接發現並抓取本站文章的純 markdown 版本:
 *   - 每篇文章:/articles/<slug>.md(英文版 /en/articles/<slug>.md)
 *   - 全站合集:/llms-full.txt
 */
export const GET: APIRoute = async () => {
  const zh = (await getCollection('articles', ({ data }) => !data.archived))
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  const en = (await getCollection('articlesEn', ({ data }) => !data.archived))
    .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

  const lines: string[] = [
    '# LaunchDock 藍鴨',
    '',
    '> 為台灣非技術背景使用者(SME 決策者、上班族、老師)提供 AI 工具的繁體中文教學:',
    '> OpenClaw AI Agent、LLM 基礎、自動化工作流(n8n、GAS、LINE Bot)、AI 工具選擇。',
    '> 每篇文章的目標是讓讀者帶走一件「明天就能動手做」的事。',
    '',
    '重要說明:',
    '- 每篇文章都有純 markdown 版本(在文章網址後加 `.md`),適合 LLM 直接抓取使用。',
    '- 全部中文文章合集:https://launchdock.app/llms-full.txt',
    '- 課堂 demo 實例庫:https://lab.launchdock.app',
    '- 內容授權:開源教學內容,引用請註明出處 launchdock.app。',
    '',
    '## 中文文章(zh-TW)',
    '',
    ...zh.map(
      (a) =>
        `- [${a.data.title}](https://launchdock.app/articles/${a.id}.md): ${a.data.description}`,
    ),
    '',
    '## English articles',
    '',
    ...en.map(
      (a) =>
        `- [${a.data.title}](https://launchdock.app/en/articles/${a.id}.md): ${a.data.description}`,
    ),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
