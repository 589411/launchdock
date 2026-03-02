import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────
interface SearchItem {
  slug: string;
  title: string;
  description: string;
  scene: string;
  difficulty: string;
  tags: string[];
  contentType: string;
  estimatedMinutes: number;
}

interface Props {
  /** If true, the modal is open */
  open: boolean;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────

const SCENE_ICONS: Record<string, string> = {
  '認識 OpenClaw': '🧭',
  '環境準備': '🔑',
  '安裝與部署': '💻',
  '基礎使用': '🚀',
  '核心功能': '🧩',
  '整合與自動化': '⚡',
  '知識與進階': '📚',
  '鴨編觀點': '🦆',
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  tutorial: '教學',
  guide: '指南',
  reference: '參考',
  troubleshoot: '疑難排解',
};

/**
 * Simple scoring-based search: matches against title, description, tags, scene.
 * Supports multiple space-separated keywords (AND logic).
 */
function searchArticles(items: SearchItem[], query: string): SearchItem[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];

  const keywords = raw.split(/\s+/).filter(Boolean);

  const scored = items
    .map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const tagsLower = item.tags.map((t) => t.toLowerCase());
      const sceneLower = item.scene.toLowerCase();
      const typeLower = (CONTENT_TYPE_LABELS[item.contentType] || item.contentType).toLowerCase();

      for (const kw of keywords) {
        let kwScore = 0;

        // Title match (highest weight)
        if (titleLower.includes(kw)) kwScore += 10;
        // Tag exact match
        if (tagsLower.some((t) => t === kw)) kwScore += 8;
        // Tag partial match
        else if (tagsLower.some((t) => t.includes(kw))) kwScore += 5;
        // Scene match
        if (sceneLower.includes(kw)) kwScore += 4;
        // Content type match
        if (typeLower.includes(kw)) kwScore += 4;
        // Description match
        if (descLower.includes(kw)) kwScore += 2;

        if (kwScore === 0) return { item, score: 0 }; // AND logic — must match all keywords
        score += kwScore;
      }

      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.item);
}

// ── Component ──────────────────────────────────────────

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load search index once when modal opens
  useEffect(() => {
    if (!open) return;
    if (index.length > 0) {
      // Already loaded
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    setLoading(true);
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchItem[]) => {
        setIndex(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIdx(0);
    }
  }, [open]);

  // Search results
  const results = useMemo(() => searchArticles(index, query), [index, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [results]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIdx]) {
        e.preventDefault();
        window.location.href = `/articles/${results[selectedIdx].slug}`;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [results, selectedIdx, onClose],
  );

  if (!open) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="搜尋文章"
      >
        {/* Search input */}
        <div className="search-modal-input-wrap">
          <svg
            className="search-modal-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="搜尋文章標題、標籤、場景…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="search-modal-kbd">ESC</kbd>
        </div>

        {/* Results */}
        <div className="search-modal-results" ref={listRef}>
          {loading && (
            <div className="search-modal-empty">載入中…</div>
          )}

          {!loading && query.trim() === '' && (
            <div className="search-modal-empty">
              <span className="search-modal-empty-icon">🔍</span>
              <span>輸入關鍵字搜尋文章</span>
              <span className="search-modal-hint">
                試試「安裝」、「API」、「Telegram」…
              </span>
            </div>
          )}

          {!loading && query.trim() !== '' && results.length === 0 && (
            <div className="search-modal-empty">
              <span className="search-modal-empty-icon">😢</span>
              <span>找不到符合「{query}」的文章</span>
              <span className="search-modal-hint">
                換個關鍵字試試看？
              </span>
            </div>
          )}

          {results.map((item, i) => (
            <a
              key={item.slug}
              href={`/articles/${item.slug}`}
              data-idx={i}
              className={`search-modal-result ${i === selectedIdx ? 'selected' : ''}`}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <div className="search-modal-result-main">
                <div className="search-modal-result-title">
                  {item.title}
                </div>
                <div className="search-modal-result-desc">
                  {item.description}
                </div>
              </div>
              <div className="search-modal-result-meta">
                <span className="search-modal-tag scene">
                  {SCENE_ICONS[item.scene] || '📄'} {item.scene}
                </span>
                <span
                  className={`search-modal-tag difficulty ${
                    item.difficulty === '入門'
                      ? 'beginner'
                      : item.difficulty === '中級'
                        ? 'intermediate'
                        : 'advanced'
                  }`}
                >
                  {item.difficulty}
                </span>
                <span className="search-modal-tag time">
                  ⏱ {item.estimatedMinutes} 分鐘
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="search-modal-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> 選擇</span>
          <span><kbd>↵</kbd> 開啟</span>
          <span><kbd>ESC</kbd> 關閉</span>
        </div>
      </div>
    </div>
  );
}
