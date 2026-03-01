import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ArticlePopularity {
  slug: string;
  rocket_count: number;
  like_count: number;
  stuck_count: number;
  cry_count: number;
  total_reactions: number;
  popularity_score: number;
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

type SortMode = 'popular' | 'most-reactions' | 'most-rocket' | 'most-stuck';

const SORT_OPTIONS: { key: SortMode; label: string; icon: string }[] = [
  { key: 'popular', label: '綜合熱門', icon: '🔥' },
  { key: 'most-reactions', label: '最多互動', icon: '💬' },
  { key: 'most-rocket', label: '最多發射', icon: '🚀' },
  { key: 'most-stuck', label: '最多卡關', icon: '😵' },
];

export default function PopularArticles({ articles }: Props) {
  const [popularData, setPopularData] = useState<ArticlePopularity[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPopularData();
  }, []);

  async function loadPopularData() {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      // Fallback: gather from localStorage
      const localData: ArticlePopularity[] = [];
      for (const article of articles) {
        const stored = localStorage.getItem(`launchdock-reactions-${article.slug}`);
        if (stored) {
          try {
            const { counts } = JSON.parse(stored);
            if (counts) {
              const r = counts.rocket || 0;
              const l = counts.like || 0;
              const s = counts.stuck || 0;
              const c = counts.cry || 0;
              localData.push({
                slug: article.slug,
                rocket_count: r,
                like_count: l,
                stuck_count: s,
                cry_count: c,
                total_reactions: r + l + s + c,
                popularity_score: r * 3 + l * 2 + s + c,
              });
            }
          } catch {}
        }
      }
      setPopularData(localData);
      setLoading(false);
      return;
    }

    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('get_popular_articles', {
        limit_count: 50,
      });

      if (rpcError) throw rpcError;
      setPopularData((data as ArticlePopularity[]) || []);
    } catch (err) {
      console.error('Failed to load popular articles:', err);
      // Fallback: direct query
      try {
        const { data, error: queryError } = await supabase
          .from('article_reactions')
          .select('slug, reaction_type');

        if (queryError) throw queryError;

        const map = new Map<string, ArticlePopularity>();
        for (const row of (data || []) as { slug: string; reaction_type: string }[]) {
          if (!map.has(row.slug)) {
            map.set(row.slug, {
              slug: row.slug,
              rocket_count: 0,
              like_count: 0,
              stuck_count: 0,
              cry_count: 0,
              total_reactions: 0,
              popularity_score: 0,
            });
          }
          const entry = map.get(row.slug)!;
          entry.total_reactions++;
          switch (row.reaction_type) {
            case 'rocket': entry.rocket_count++; break;
            case 'like': entry.like_count++; break;
            case 'stuck': entry.stuck_count++; break;
            case 'cry': entry.cry_count++; break;
          }
        }
        // Calculate scores
        for (const entry of map.values()) {
          entry.popularity_score =
            entry.rocket_count * 3 +
            entry.like_count * 2 +
            entry.stuck_count +
            entry.cry_count;
        }
        setPopularData(Array.from(map.values()));
      } catch {
        setError('無法載入熱門資料');
      }
    } finally {
      setLoading(false);
    }
  }

  // Sort the combined data
  const sortedArticles = (() => {
    const popMap = new Map(popularData.map(p => [p.slug, p]));

    // Only show articles that have at least 1 reaction
    const articlesWithData = articles
      .filter(a => popMap.has(a.slug))
      .map(a => ({
        ...a,
        pop: popMap.get(a.slug)!,
      }));

    switch (sortMode) {
      case 'popular':
        return articlesWithData.sort((a, b) => b.pop.popularity_score - a.pop.popularity_score);
      case 'most-reactions':
        return articlesWithData.sort((a, b) => b.pop.total_reactions - a.pop.total_reactions);
      case 'most-rocket':
        return articlesWithData.sort((a, b) => b.pop.rocket_count - a.pop.rocket_count);
      case 'most-stuck':
        return articlesWithData.sort((a, b) =>
          (b.pop.stuck_count + b.pop.cry_count) - (a.pop.stuck_count + a.pop.cry_count)
        );
      default:
        return articlesWithData;
    }
  })();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-pulse">
          <span className="text-2xl">🔥</span>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            載入熱門排行中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {error}
        </p>
      </div>
    );
  }

  if (sortedArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-4">🦗</span>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          還沒有足夠的互動數據。
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          閱讀文章後按下表情符號，就能幫文章累積人氣！
        </p>
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
        {sortedArticles.map(({ slug, title, description, scene, difficulty, pop }, index) => (
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

              {/* Reaction stats */}
              <div className="flex-shrink-0 flex items-center gap-3 text-sm">
                {pop.rocket_count > 0 && (
                  <span title="發射成功">🚀 {pop.rocket_count}</span>
                )}
                {pop.like_count > 0 && (
                  <span title="有用">👍 {pop.like_count}</span>
                )}
                {pop.stuck_count > 0 && (
                  <span title="卡關了" style={{ color: 'var(--color-accent-stuck)' }}>
                    😵 {pop.stuck_count}
                  </span>
                )}
                {pop.cry_count > 0 && (
                  <span title="救命" style={{ color: 'var(--color-accent-cry)' }}>
                    😢 {pop.cry_count}
                  </span>
                )}
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-surface-lighter)',
                    color: 'var(--color-text-muted)',
                  }}
                  title="熱門分數"
                >
                  🔥 {pop.popularity_score}
                </span>
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
