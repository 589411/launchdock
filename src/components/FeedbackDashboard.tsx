import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================================
// Types
// ============================================================
interface ArticleDistress {
  slug: string;
  total_reactions: number;
  stuck_count: number;
  cry_count: number;
  distress_count: number;
  distress_pct: number;
}

interface SectionDistress {
  slug: string;
  section_id: string;
  total_reactions: number;
  stuck_count: number;
  cry_count: number;
  distress_count: number;
  distress_pct: number;
}

interface RecentQuestion {
  id: string;
  slug: string;
  section_id: string | null;
  section_title: string | null;
  question: string;
  created_at: string;
}

type TabKey = 'overview' | 'sections' | 'questions';

// ============================================================
// Helper: severity color
// ============================================================
function severityColor(pct: number): string {
  if (pct >= 60) return '#ef4444'; // red
  if (pct >= 40) return '#f59e0b'; // amber
  if (pct >= 20) return '#eab308'; // yellow
  return '#22c55e'; // green
}

function severityLabel(pct: number): string {
  if (pct >= 60) return '🔴 嚴重';
  if (pct >= 40) return '🟠 警告';
  if (pct >= 20) return '🟡 注意';
  return '🟢 正常';
}

// ============================================================
// Component
// ============================================================
export default function FeedbackDashboard() {
  const [tab, setTab] = useState<TabKey>('overview');
  const [articleDistress, setArticleDistress] = useState<ArticleDistress[]>([]);
  const [sectionDistress, setSectionDistress] = useState<SectionDistress[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase 尚未設定。請在 .env 中配置 PUBLIC_SUPABASE_URL 和 PUBLIC_SUPABASE_ANON_KEY。');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [articleRes, sectionRes, questionsRes] = await Promise.all([
        // Article-level distress
        supabase
          .from('article_reactions')
          .select('slug, reaction_type'),
        // Section-level distress
        supabase
          .from('section_reactions')
          .select('slug, section_id, reaction_type'),
        // Recent stuck/cry questions
        supabase
          .from('qa_questions')
          .select('id, slug, section_id, section_title, question, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      // Process article distress
      if (articleRes.data) {
        const map = new Map<string, ArticleDistress>();
        for (const row of articleRes.data as { slug: string; reaction_type: string }[]) {
          if (!map.has(row.slug)) {
            map.set(row.slug, {
              slug: row.slug,
              total_reactions: 0,
              stuck_count: 0,
              cry_count: 0,
              distress_count: 0,
              distress_pct: 0,
            });
          }
          const entry = map.get(row.slug)!;
          entry.total_reactions++;
          if (row.reaction_type === 'stuck') { entry.stuck_count++; entry.distress_count++; }
          if (row.reaction_type === 'cry') { entry.cry_count++; entry.distress_count++; }
        }
        for (const entry of map.values()) {
          entry.distress_pct = entry.total_reactions > 0
            ? Math.round(entry.distress_count / entry.total_reactions * 1000) / 10
            : 0;
        }
        setArticleDistress(
          Array.from(map.values())
            .filter(a => a.distress_count > 0)
            .sort((a, b) => b.distress_pct - a.distress_pct || b.distress_count - a.distress_count)
        );
      }

      // Process section distress
      if (sectionRes.data) {
        const map = new Map<string, SectionDistress>();
        for (const row of sectionRes.data as { slug: string; section_id: string; reaction_type: string }[]) {
          const key = `${row.slug}::${row.section_id}`;
          if (!map.has(key)) {
            map.set(key, {
              slug: row.slug,
              section_id: row.section_id,
              total_reactions: 0,
              stuck_count: 0,
              cry_count: 0,
              distress_count: 0,
              distress_pct: 0,
            });
          }
          const entry = map.get(key)!;
          entry.total_reactions++;
          if (row.reaction_type === 'stuck') { entry.stuck_count++; entry.distress_count++; }
          if (row.reaction_type === 'cry') { entry.cry_count++; entry.distress_count++; }
        }
        for (const entry of map.values()) {
          entry.distress_pct = entry.total_reactions > 0
            ? Math.round(entry.distress_count / entry.total_reactions * 1000) / 10
            : 0;
        }
        setSectionDistress(
          Array.from(map.values())
            .filter(s => s.distress_count > 0)
            .sort((a, b) => b.distress_count - a.distress_count || b.distress_pct - a.distress_pct)
        );
      }

      // Questions
      if (questionsRes.data) {
        setRecentQuestions(questionsRes.data as RecentQuestion[]);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('載入失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Summary stats
  const totalDistressArticles = articleDistress.length;
  const criticalArticles = articleDistress.filter(a => a.distress_pct >= 40).length;
  const totalStuck = articleDistress.reduce((s, a) => s + a.stuck_count, 0);
  const totalCry = articleDistress.reduce((s, a) => s + a.cry_count, 0);

  const TABS: { key: TabKey; label: string; badge?: number }[] = [
    { key: 'overview', label: '📊 總覽', badge: criticalArticles > 0 ? criticalArticles : undefined },
    { key: 'sections', label: '📍 段落詳情', badge: sectionDistress.length > 0 ? sectionDistress.length : undefined },
    { key: 'questions', label: '💬 卡關提問', badge: recentQuestions.length > 0 ? recentQuestions.length : undefined },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            📡 回饋監控儀表板
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            最後更新：{lastRefresh.toLocaleString('zh-TW')}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: 'var(--color-brand)',
            color: 'white',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '載入中...' : '🔄 重新整理'}
        </button>
      </div>

      {error && (
        <div
          className="p-4 rounded-lg mb-6 text-sm"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon="📄" label="有回饋的文章" value={totalDistressArticles} />
        <SummaryCard icon="🔴" label="需要注意" value={criticalArticles} highlight={criticalArticles > 0} />
        <SummaryCard icon="😵" label="總卡關數" value={totalStuck} />
        <SummaryCard icon="😢" label="總哭哭數" value={totalCry} />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 rounded-lg text-sm transition-all relative"
            style={{
              backgroundColor: tab === key ? 'var(--color-brand)' : 'var(--color-surface-light)',
              color: tab === key ? 'white' : 'var(--color-text-secondary)',
              border: `1px solid ${tab === key ? 'var(--color-brand)' : 'var(--color-surface-lighter)'}`,
            }}
          >
            {label}
            {badge !== undefined && badge > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                style={{ backgroundColor: '#ef4444', color: 'white' }}
              >
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <span className="text-3xl">📡</span>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              正在掃描回饋數據...
            </p>
          </div>
        </div>
      ) : (
        <>
          {tab === 'overview' && (
            <OverviewTab
              articles={articleDistress}
              expandedSlug={expandedSlug}
              onToggle={(slug) => setExpandedSlug(expandedSlug === slug ? null : slug)}
              sectionDistress={sectionDistress}
            />
          )}
          {tab === 'sections' && (
            <SectionsTab sections={sectionDistress} />
          )}
          {tab === 'questions' && (
            <QuestionsTab questions={recentQuestions} />
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function SummaryCard({ icon, label, value, highlight }: {
  icon: string; label: string; value: number; highlight?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-lg text-center"
      style={{
        backgroundColor: highlight ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-light)',
        border: `1px solid ${highlight ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-surface-lighter)'}`,
      }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div
        className="text-2xl font-bold"
        style={{ color: highlight ? '#ef4444' : 'var(--color-text-primary)' }}
      >
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>
    </div>
  );
}

function OverviewTab({ articles, expandedSlug, onToggle, sectionDistress }: {
  articles: ArticleDistress[];
  expandedSlug: string | null;
  onToggle: (slug: string) => void;
  sectionDistress: SectionDistress[];
}) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-4">🎉</span>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          目前沒有卡關/哭哭回饋——太棒了！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => {
        const isExpanded = expandedSlug === article.slug;
        const relatedSections = sectionDistress.filter(s => s.slug === article.slug);

        return (
          <div
            key={article.slug}
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface-light)',
              border: `1px solid ${article.distress_pct >= 40 ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-surface-lighter)'}`,
            }}
          >
            <button
              onClick={() => onToggle(article.slug)}
              className="w-full p-4 text-left flex items-center gap-4"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {/* Severity indicator */}
              <div
                className="w-2 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: severityColor(article.distress_pct) }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs" style={{ color: severityColor(article.distress_pct) }}>
                    {severityLabel(article.distress_pct)}
                  </span>
                  <h3
                    className="font-medium truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {article.slug}
                  </h3>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>總互動 {article.total_reactions}</span>
                  <span>😵 {article.stuck_count}</span>
                  <span>😢 {article.cry_count}</span>
                  <span style={{ color: severityColor(article.distress_pct) }}>
                    卡關率 {article.distress_pct}%
                  </span>
                </div>
              </div>

              {/* Distress bar */}
              <div className="flex-shrink-0 w-24">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-surface-lighter)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(article.distress_pct, 100)}%`,
                      backgroundColor: severityColor(article.distress_pct),
                    }}
                  />
                </div>
              </div>

              <span style={{ color: 'var(--color-text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {/* Expanded section detail */}
            {isExpanded && relatedSections.length > 0 && (
              <div className="px-4 pb-4 pt-0">
                <div className="border-t pt-3" style={{ borderColor: 'var(--color-surface-lighter)' }}>
                  <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    段落層級卡關分布
                  </h4>
                  <div className="space-y-2">
                    {relatedSections.map((s) => (
                      <div key={s.section_id} className="flex items-center gap-3 text-sm">
                        <span className="truncate flex-1" style={{ color: 'var(--color-text-muted)' }}>
                          #{s.section_id}
                        </span>
                        <span>😵 {s.stuck_count}</span>
                        <span>😢 {s.cry_count}</span>
                        <span className="text-xs" style={{ color: severityColor(s.distress_pct) }}>
                          {s.distress_pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isExpanded && relatedSections.length === 0 && (
              <div className="px-4 pb-4">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  暫無段落層級的回饋數據
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionsTab({ sections }: { sections: SectionDistress[] }) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-4">🎯</span>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          目前沒有段落層級的卡關回饋
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-surface-lighter)' }}>
            <th className="text-left p-3" style={{ color: 'var(--color-text-muted)' }}>文章</th>
            <th className="text-left p-3" style={{ color: 'var(--color-text-muted)' }}>段落</th>
            <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>😵</th>
            <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>😢</th>
            <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>卡關率</th>
            <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>嚴重度</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s, i) => (
            <tr
              key={`${s.slug}-${s.section_id}`}
              style={{ borderBottom: '1px solid var(--color-surface-lighter)' }}
            >
              <td className="p-3">
                <a
                  href={`/articles/${s.slug}`}
                  style={{ color: 'var(--color-brand-light)' }}
                  className="hover:underline"
                >
                  {s.slug}
                </a>
              </td>
              <td className="p-3">
                <a
                  href={`/articles/${s.slug}#${s.section_id}`}
                  style={{ color: 'var(--color-text-secondary)' }}
                  className="hover:underline"
                >
                  #{s.section_id}
                </a>
              </td>
              <td className="text-center p-3">{s.stuck_count}</td>
              <td className="text-center p-3">{s.cry_count}</td>
              <td className="text-center p-3" style={{ color: severityColor(s.distress_pct) }}>
                {s.distress_pct}%
              </td>
              <td className="text-center p-3 text-xs">
                {severityLabel(s.distress_pct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuestionsTab({ questions }: { questions: RecentQuestion[] }) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-4">💬</span>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          目前沒有卡關提問
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <div
          key={q.id}
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--color-surface-light)',
            border: '1px solid var(--color-surface-lighter)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 text-xs flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                <a
                  href={`/articles/${q.slug}`}
                  style={{ color: 'var(--color-brand-light)' }}
                  className="hover:underline"
                >
                  {q.slug}
                </a>
                {q.section_title && (
                  <span>→ {q.section_title}</span>
                )}
                <span>
                  {new Date(q.created_at).toLocaleDateString('zh-TW')}
                </span>
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }}>{q.question}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
