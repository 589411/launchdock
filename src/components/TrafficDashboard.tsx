import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================================
// Outbound-click funnel dashboard (main site → Lab / Masters)
// Reads the outbound_clicks table (migration 009) and aggregates
// client-side, same approach as FeedbackDashboard.
// ============================================================

interface ClickRow {
  target: string;      // 'lab' | 'masters'
  placement: string;   // 'home-card' | 'header' | 'header-mobile' | 'footer'
  created_at: string;
}

const PLACEMENT_LABEL: Record<string, string> = {
  'home-card': '🏠 首頁入口區塊',
  'header': '🧰 Header 下拉',
  'header-mobile': '📱 Header 手機選單',
  'footer': '📄 Footer 頁尾',
};

function placementLabel(p: string): string {
  return PLACEMENT_LABEL[p] || p;
}

export default function TrafficDashboard() {
  const [rows, setRows] = useState<ClickRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const { data, error: qErr } = await supabase
        .from('outbound_clicks')
        .select('target, placement, created_at')
        .order('created_at', { ascending: false })
        .limit(10000);
      if (qErr) throw qErr;
      setRows((data as ClickRow[]) || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Traffic dashboard load error:', err);
      setError('載入失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Aggregate
  const total = rows.length;
  const labCount = rows.filter(r => r.target === 'lab').length;
  const mastersCount = rows.filter(r => r.target === 'masters').length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7d = rows.filter(r => new Date(r.created_at).getTime() >= sevenDaysAgo).length;

  // By placement × target
  const placementMap = new Map<string, { lab: number; masters: number; total: number }>();
  for (const r of rows) {
    if (!placementMap.has(r.placement)) placementMap.set(r.placement, { lab: 0, masters: 0, total: 0 });
    const e = placementMap.get(r.placement)!;
    if (r.target === 'lab') e.lab++;
    else if (r.target === 'masters') e.masters++;
    e.total++;
  }
  const byPlacement = Array.from(placementMap.entries())
    .map(([placement, v]) => ({ placement, ...v }))
    .sort((a, b) => b.total - a.total);

  const topPlacement = byPlacement[0]?.placement;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            🧭 導流監控儀表板
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            主站 → 工具站（Lab / Masters）點擊 · 最後更新：{lastRefresh.toLocaleString('zh-TW')}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: 'var(--color-brand)', color: 'white', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '載入中...' : '🔄 重新整理'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg mb-6 text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon="👆" label="總點擊" value={total} />
        <SummaryCard icon="🧪" label="→ 實驗室" value={labCount} />
        <SummaryCard icon="🎓" label="→ 大師團" value={mastersCount} />
        <SummaryCard icon="🗓️" label="近 7 天" value={last7d} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <span className="text-3xl">🧭</span>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>正在讀取導流數據...</p>
          </div>
        </div>
      ) : total === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-4">🕳️</span>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            還沒有任何外連點擊——部署上線後，讀者點主站上的 Lab / 大師團連結就會開始累積。
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            各入口位置成效（哪個位置最會導流）
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-surface-lighter)' }}>
                  <th className="text-left p-3" style={{ color: 'var(--color-text-muted)' }}>入口位置</th>
                  <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>🧪 實驗室</th>
                  <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>🎓 大師團</th>
                  <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>合計</th>
                  <th className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>佔比</th>
                </tr>
              </thead>
              <tbody>
                {byPlacement.map((p) => (
                  <tr key={p.placement} style={{ borderBottom: '1px solid var(--color-surface-lighter)' }}>
                    <td className="p-3" style={{ color: 'var(--color-text-primary)' }}>
                      {placementLabel(p.placement)}
                      {p.placement === topPlacement && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--color-brand-light)' }}>👑 最有效</span>
                      )}
                    </td>
                    <td className="text-center p-3">{p.lab}</td>
                    <td className="text-center p-3">{p.masters}</td>
                    <td className="text-center p-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{p.total}</td>
                    <td className="text-center p-3" style={{ color: 'var(--color-text-muted)' }}>
                      {total > 0 ? Math.round(p.total / total * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div
      className="p-4 rounded-lg text-center"
      style={{ backgroundColor: 'var(--color-surface-light)', border: '1px solid var(--color-surface-lighter)' }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  );
}
