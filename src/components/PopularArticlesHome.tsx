import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  scene: string;
  difficulty: string;
  tags: string[];
}

interface ViewData {
  slug: string;
  total_views: number;
}

interface Props {
  articles: ArticleMeta[];
}

/**
 * Homepage popular articles widget.
 * Shows top 5 by page views (Supabase) or localStorage fallback.
 */
export default function PopularArticlesHome({ articles }: Props) {
  const [topArticles, setTopArticles] = useState<(ArticleMeta & { views: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadViewData();
  }, []);

  async function loadViewData() {
    setLoading(true);
    const articleMap = new Map(articles.map(a => [a.slug, a]));

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('article_page_views')
          .select('slug');

        if (!error && data) {
          // Count views per slug
          const counts = new Map<string, number>();
          for (const row of data as { slug: string }[]) {
            counts.set(row.slug, (counts.get(row.slug) || 0) + 1);
          }

          const sorted = Array.from(counts.entries())
            .filter(([slug]) => articleMap.has(slug))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([slug, views]) => ({ ...articleMap.get(slug)!, views }));

          if (sorted.length > 0) {
            setTopArticles(sorted);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }

    // Fallback: localStorage view counts
    const localViews: { slug: string; views: number }[] = [];
    for (const article of articles) {
      const count = Number(localStorage.getItem(`launchdock-views-${article.slug}`) || 0);
      if (count > 0) {
        localViews.push({ slug: article.slug, views: count });
      }
    }

    if (localViews.length > 0) {
      const sorted = localViews
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(({ slug, views }) => ({ ...articleMap.get(slug)!, views }));
      setTopArticles(sorted);
    } else {
      // No view data at all — show newest articles as default
      const newest = [...articles]
        .slice(0, 5)
        .map(a => ({ ...a, views: 0 }));
      setTopArticles(newest);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface-light)' }} />
        ))}
      </div>
    );
  }

  if (topArticles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topArticles.map((article, i) => (
        <a
          key={article.slug}
          href={`/articles/${article.slug}`}
          className="block p-5 rounded-xl transition-all group relative overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface-light)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: i === 0 ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(233, 69, 96, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = i === 0 ? 'var(--color-brand)' : 'var(--color-surface-lighter)';
          }}
        >
          {i === 0 && (
            <span
              className="absolute top-0 right-0 px-2 py-0.5 text-xs font-bold rounded-bl-lg"
              style={{ backgroundColor: 'var(--color-brand)', color: 'white' }}
            >
              🔥 最熱門
            </span>
          )}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--color-brand-light)',
              }}
            >
              {article.scene}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor:
                  article.difficulty === '入門' ? 'rgba(34, 197, 94, 0.2)' :
                  article.difficulty === '中級' ? 'rgba(234, 179, 8, 0.2)' :
                  'rgba(239, 68, 68, 0.2)',
                color:
                  article.difficulty === '入門' ? 'rgb(74, 222, 128)' :
                  article.difficulty === '中級' ? 'rgb(250, 204, 21)' :
                  'rgb(248, 113, 113)',
              }}
            >
              {article.difficulty}
            </span>
          </div>
          <h3
            className="font-semibold text-sm leading-snug mb-1 transition-colors line-clamp-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {article.title}
          </h3>
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {article.description}
          </p>
          {article.views > 0 && (
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              👀 {article.views} 次閱讀
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
