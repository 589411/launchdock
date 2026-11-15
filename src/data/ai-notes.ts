/**
 * 藍鴨快報「AI 學習筆記」
 *
 * 每天從當日快報挑 1–2 個名詞，先按日累積；每週（週日－週六）
 * 跟著週報整理後寫進這裡，部署後才在 /ai-notes/ 上線。
 * 不要把快訊用詞直接寫進 concepts.yaml。
 */
import { kuaibaoPodcastEpisodeUrl } from './kuaibao';

export const aiNotesPath = '/ai-notes/';
export const aiNotesUrl = 'https://launchdock.app/ai-notes/';

export type AiNoteRelated = {
  title: string;
  url: string;
  /** 必須寫出這篇與當天名詞的差別，不能假裝是同一件事。 */
  why: string;
};

export type AiNoteEntry = {
  term: string;
  plain: string;
  date: string;
  youtubeId: string;
  podcastUrl: string;
  /** 意義完全相同的既有文章；沒有就 null。 */
  articleUrl: string | null;
  articleTitle?: string;
  related: AiNoteRelated[];
};

/** 一週的筆記批次。start 是週日、end 是週六（週報上線日），皆為 YYYY-MM-DD。 */
export type AiNotesWeek = {
  start: string;
  end: string;
  entries: AiNoteEntry[];
};

export const aiNotesWeeks: AiNotesWeek[] = [
  {
    start: '2026-11-15',
    end: '2026-11-21',
    entries: [
      {
        term: '4-bit',
        plain: '把模型裡每個數字壓得很小，像把照片壓縮成小檔案',
        date: '2026-11-15',
        youtubeId: 'oyif8x7YwPA',
        podcastUrl: kuaibaoPodcastEpisodeUrl('2026-11-15'),
        articleUrl: null,
        related: [],
      },
      {
        term: 'Skill',
        plain: '把指令打包起來給 AI 用，讓它自己完成一件工作',
        date: '2026-11-15',
        youtubeId: 'oyif8x7YwPA',
        podcastUrl: kuaibaoPodcastEpisodeUrl('2026-11-15'),
        articleUrl: 'https://launchdock.app/articles/from-prompt-to-skill/',
        articleTitle: 'Skill 其實是 GPTs 的進化版：AI 指令打包的三段演化',
        related: [],
      },
    ],
  },
];

/** 從文章 URL 取出 slug（中英路徑都可）。 */
export function articleSlugFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/^(?:\/en)?\/articles\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/** 只回傳 articleUrl 完全對得上的筆記（相關閱讀不當成「出現在」）。 */
export function notesForArticleSlug(slug: string): AiNoteEntry[] {
  return aiNotesWeeks
    .flatMap((week) => week.entries)
    .filter((entry) => entry.articleUrl && articleSlugFromUrl(entry.articleUrl) === slug);
}

export function formatWeekLabel(start: string, end: string, lang: 'zh-tw' | 'en' = 'zh-tw'): string {
  const [, sm, sd] = start.split('-');
  const [ey, em, ed] = end.split('-');
  if (lang === 'en') {
    return `${start} – ${end}`;
  }
  return `${ey}/${Number(sm)}/${Number(sd)}－${Number(em)}/${Number(ed)}`;
}

/** 新到舊。 */
export function aiNotesWeeksNewestFirst(): AiNotesWeek[] {
  return [...aiNotesWeeks].sort((a, b) => b.end.localeCompare(a.end));
}
