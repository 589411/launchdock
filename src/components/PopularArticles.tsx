import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ArticleStats {
  slug: string;
  views: number;
  reactions: number;
}

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  scene: string;
  difficulty: string;
  tags: string[];
}

interface Props {
  /** All articles metadata passed from Astro (since we can't access content collections client-side) */
  articles: ArticleMeta[];
}

type SortMode = 'views' | 'reactions' | 'recent';

const SORT_OPTIONS: { key: SortMode; label: string; icon: string }[] = [
  { key: 'views', label: '最多閱讀', icon: '👀' },
  { key: 'reactions', label: '最多互動', icon: '💬' },
  { key: 'recent', label: '最近發布', icon: '🆕' },
];

export default function PopularArticles({ articles }: Props) {
  const [statsMap, setStatsMap] = useState<Map<string, ArticleStats>>(new Map());
  const [sortMode, setSortMode] = useState<SortMode>('views');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const map = new Map<string, ArticleStats>();

    // Initialize all articles with zero stats
    for (const a of articles) {
      map.set(a.slug, { slug: a.slug, views: 0, reactions: 0 });
    }

    if (isSupabaseConfigured()) {
      try {
        // Load page views
        const { data: viewData } = await supabase
          .from('article_page_views')
          .select('slug');

        if (viewData) {
          for (const row of viewData as { slug: string }[]) {
            const entry = map.get(row.slug);
            if (entry) entry.views++;
          }
        }

        // Load reaction counts
        const { data: reactionData } = await supabase
          .from('article_reactions')
          .select('slug');

        if (reactionData) {
          for (const row of reactionData as { slug: string }[]) {
            const entry = map.get(row.slug);
            if (entry) entry.reactions++;
          }
        }
      } catch {
        // Fall through to localStorage
      }
    }

    // Merge localStorage view data
    for (const a of articles) {
      const localViews = Number(localStorage.getItem(`launchdock-views-${a.slug}`) || 0);
      const entry = map.get(a.slug)!;
      if (localViews > entry.views) {
        entry.views = localViews;
      }
    }

    setStatsMap(map);
    setLoading(false);
  }

  // Sort articles
  const sortedArticles = (() => {
    const list = articles.map(a => ({
      ...a,
      stats: statsMap.get(a.slug) || { slug: a.slug, views: 0, reactions: 0 },
    }));

    switch (sortMode) {
      case 'views':
        return list.sort((a, b) => b.stats.views - a.stats.views);
      case 'reactions':
        return list.sort((a, b) => b.stats.reactions - a.stats.reactions);
      case 'recent':
        // articles are already in collection order; just return as-is
        return list;
      default:
        return list;
    }
  })();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-pulse">
          <span className="text-2xl">🔥</span>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            載入排行中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SORT_OPTIONS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setSortMode(key)}
            className="px-3 py-1.5 rounded-full text-sm transition-all"
            style={{
              backgroundColor: sortMode === key ? 'var(--color-brand)' : 'var(--color-surface-light)',
              color: sortMode === key ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${sortMode === key ? 'var(--color-brand)' : 'var(--color-surface-lighter)'}`,
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Article list */}
      <div className="space-y-3">
        {sortedArticles.map(({ slug, title, description, scene, difficulty, stats }, index) => (
          <a
            key={slug}
            href={`/articles/${slug}`}
            className="block p-5 rounded-lg transition-all group"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--color-surface-lighter)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-lighter)';
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-light)';
              e.currentTarget.style.borderColor = 'var(--color-surface-lighter)';
            }}
          >
            <div className="flex items-center gap-4">
              {/* Rank badge */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: index < 3 ? 'var(--color-brand)' : 'var(--color-surface-lighter)',
                  color: index < 3 ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      color: 'var(--color-brand-light)',
                    }}
                  >
                    {scene}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        difficulty === '入門' ? 'rgba(34, 197, 94, 0.2)' :
                        difficulty === '中級' ? 'rgba(234, 179, 8, 0.2)' :
                        'rgba(239, 68, 68, 0.2)',
                      color:
                        difficulty === '入門' ? 'rgb(74, 222, 128)' :
                        difficulty === '中級' ? 'rgb(250, 204, 21)' :
                        'rgb(248, 113, 113)',
                    }}
                  >
                    {difficulty}
                  </span>
                </div>
                <h3
                  className="font-medium transition-colors truncate"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm mt-1 truncate"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {description}
                </p>
              </div>

              {/* View & reaction stats */}
              <div className="flex-shrink-0 flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {stats.views > 0 && (
                  <span title="閱讀次數">👀 {stats.views}</span>
                )}
                {stats.reactions > 0 && (
                  <span title="互動次數">💬 {stats.reactions}</span>
                )}
              </div>

              <span
                className="transition-colors shrink-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
