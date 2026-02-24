import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getFingerprint,
  validateContent,
  checkRateLimit,
  formatRetryTime,
} from '../lib/content-security';

interface SectionReaction {
  like: number;
  stuck: number;
  cry: number;
}

interface Props {
  slug: string;
  stuckOptions?: Record<string, string[]>;
}

const REACTIONS = [
  { key: 'like' as const, emoji: '👍', label: '看懂了' },
  { key: 'stuck' as const, emoji: '😵', label: '卡關了' },
  { key: 'cry' as const, emoji: '😢', label: '看不懂' },
];

function SectionBar({
  sectionId,
  slug,
  onStuck,
}: {
  sectionId: string;
  slug: string;
  onStuck: (sectionId: string, sectionTitle: string) => void;
}) {
  const storageKey = `launchdock-section-${slug}-${sectionId}`;
  const voteKey = `launchdock-section-vote-${slug}-${sectionId}`;

  const [counts, setCounts] = useState<SectionReaction>({ like: 0, stuck: 0, cry: 0 });
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showBar, setShowBar] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openBar = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setShowBar(true);
  }, []);

  const closeBar = useCallback(() => {
    hideTimer.current = setTimeout(() => setShowBar(false), 200);
  }, []);

  useEffect(() => {
    loadCounts();
  }, []);

  async function loadCounts() {
    // Check local vote first
    const localVote = localStorage.getItem(voteKey);
    if (localVote) setUserVote(localVote);

    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setCounts(JSON.parse(stored));
      } catch {}
      return;
    }

    try {
      const { data, error } = await supabase
        .from('section_reactions')
        .select('reaction_type')
        .eq('slug', slug)
        .eq('section_id', sectionId);

      if (error) throw error;

      const newCounts: SectionReaction = { like: 0, stuck: 0, cry: 0 };
      for (const row of data || []) {
        if (row.reaction_type in newCounts) {
          newCounts[row.reaction_type as keyof SectionReaction]++;
        }
      }
      setCounts(newCounts);
    } catch {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setCounts(JSON.parse(stored));
      } catch {}
    }
  }

  const handleReaction = async (key: string) => {
    if (userVote === key) return; // Same vote, do nothing

    const rateCheck = checkRateLimit('reaction');
    if (!rateCheck.allowed) return;

    // Optimistic update: decrement old vote, increment new
    const newCounts = { ...counts };
    if (userVote) {
      newCounts[userVote as keyof SectionReaction] = Math.max(0, newCounts[userVote as keyof SectionReaction] - 1);
    }
    newCounts[key as keyof SectionReaction]++;
    setCounts(newCounts);
    setUserVote(key);
    localStorage.setItem(storageKey, JSON.stringify(newCounts));
    localStorage.setItem(voteKey, key);

    if (isSupabaseConfigured()) {
      try {
        const fp = getFingerprint();
        // Upsert: UNIQUE(slug, section_id, fingerprint) replaces old reaction
        await supabase.from('section_reactions').upsert({
          slug,
          section_id: sectionId,
          reaction_type: key as 'like' | 'stuck' | 'cry',
          fingerprint: fp,
        }, { onConflict: 'slug,section_id,fingerprint' });
      } catch (err) {
        console.error('Failed to save section reaction:', err);
      }
    }

    if (key === 'stuck' || key === 'cry') {
      const heading = document.getElementById(sectionId);
      const title = heading?.textContent || sectionId;
      onStuck(sectionId, title);
    }
  };

  const total = counts.like + counts.stuck + counts.cry;

  return (
    <div
      className="section-reactions"
      onMouseEnter={openBar}
      onMouseLeave={closeBar}
    >
      <div
        className="section-reactions-trigger"
        onClick={() => setShowBar(!showBar)}
        style={{ opacity: showBar || userVote ? 1 : undefined }}
      >
        {userVote ? (
          <span className="text-sm">
            {REACTIONS.find(r => r.key === userVote)?.emoji}
          </span>
        ) : total > 0 ? (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {total}
          </span>
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>+</span>
        )}
      </div>

      {showBar && (
        <div className="section-reactions-bar">
          {REACTIONS.map(({ key, emoji, label }) => (
            <button
              key={key}
              onClick={() => handleReaction(key)}
              className={`section-reaction-btn ${userVote === key ? 'active' : ''}`}
              title={label}
            >
              <span>{emoji}</span>
              {counts[key] > 0 && (
                <span className="section-reaction-count">{counts[key]}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SectionReactions({ slug, stuckOptions = {} }: Props) {
  const [sections, setSections] = useState<{ id: string; el: Element }[]>([]);
  const [stuckPrompt, setStuckPrompt] = useState<{ sectionId: string; sectionTitle: string } | null>(null);
  const [stuckNote, setStuckNote] = useState('');
  const [stuckSubmitted, setStuckSubmitted] = useState(false);
  const [stuckError, setStuckError] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    const prose = document.querySelector('.prose');
    if (!prose) return;

    const headings = prose.querySelectorAll('h2');
    const sectionData: { id: string; el: Element }[] = [];

    headings.forEach((h2, index) => {
      if (!h2.id) {
        h2.id = `section-${index}`;
      }

      let container = h2.querySelector('.section-reactions-portal');
      if (!container) {
        container = document.createElement('div');
        container.className = 'section-reactions-portal';
        h2.style.position = 'relative';
        h2.appendChild(container);
      }

      sectionData.push({ id: h2.id, el: container });
    });

    setSections(sectionData);
  }, []);

  const handleStuck = (sectionId: string, sectionTitle: string) => {
    setStuckPrompt({ sectionId, sectionTitle });
    setStuckSubmitted(false);
    setStuckNote('');
    setStuckError(null);
    setShowCustomInput(false);
  };

  // Find matching stuckOptions for current section title (fuzzy: check if any key is substring of title)
  const getOptionsForSection = (sectionTitle: string): string[] => {
    for (const [key, options] of Object.entries(stuckOptions)) {
      if (sectionTitle.includes(key) || key.includes(sectionTitle.replace(/[？?！!。，、]/g, '').trim())) {
        return options;
      }
    }
    return [];
  };

  const handleStuckSubmit = async () => {
    if (!stuckPrompt) return;

    if (stuckNote.trim()) {
      // Validate content
      const validation = validateContent(stuckNote, 500);
      if (!validation.ok) {
        setStuckError(validation.reason || '內容驗證失敗');
        return;
      }

      const rateCheck = checkRateLimit('question');
      if (!rateCheck.allowed) {
        setStuckError(`提問太頻繁，請等 ${formatRetryTime(rateCheck.retryAfterMs!)} 後再試`);
        return;
      }

      if (isSupabaseConfigured()) {
        try {
          const fp = getFingerprint();
          await supabase.from('qa_questions').insert({
            slug,
            section_id: stuckPrompt.sectionId,
            section_title: stuckPrompt.sectionTitle,
            question: validation.sanitized,
            fingerprint: fp,
          });
        } catch (err) {
          console.error('Failed to save stuck question:', err);
        }
      } else {
        // localStorage fallback
        const qaKey = `launchdock-qa-${slug}`;
        const questions = JSON.parse(localStorage.getItem(qaKey) || '[]');
        questions.push({
          id: Date.now().toString(),
          sectionId: stuckPrompt.sectionId,
          sectionTitle: stuckPrompt.sectionTitle,
          question: validation.sanitized,
          timestamp: new Date().toISOString(),
          answers: [],
        });
        localStorage.setItem(qaKey, JSON.stringify(questions));
      }
    }

    setStuckSubmitted(true);
    setTimeout(() => {
      setStuckPrompt(null);
      setStuckSubmitted(false);
    }, 2000);
  };

  return (
    <>
      {sections.map(({ id, el }) =>
        createPortal(
          <SectionBar
            key={id}
            sectionId={id}
            slug={slug}
            onStuck={handleStuck}
          />,
          el
        )
      )}

      {stuckPrompt && (
        <div className="stuck-prompt-overlay" onClick={() => setStuckPrompt(null)}>
          <div className="stuck-prompt-dialog" onClick={(e) => e.stopPropagation()}>
            {!stuckSubmitted ? (
              <>
                <h4>
                  😵 卡在「{stuckPrompt.sectionTitle}」？
                </h4>
                <p>選一個最接近的問題，或自己描述：</p>
                {stuckError && (
                  <p style={{ color: 'var(--color-accent-stuck)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    ⚠️ {stuckError}
                  </p>
                )}
                {/* Pre-defined stuck options as chips */}
                {(() => {
                  const options = getOptionsForSection(stuckPrompt.sectionTitle);
                  if (options.length === 0) return null;
                  return (
                    <div className="stuck-chips">
                      {options.map((opt, i) => (
                        <button
                          key={i}
                          className={`stuck-chip ${stuckNote === opt && !showCustomInput ? 'active' : ''}`}
                          onClick={() => { setStuckNote(opt); setShowCustomInput(false); }}
                        >
                          {opt}
                        </button>
                      ))}
                      <button
                        className={`stuck-chip stuck-chip-custom ${showCustomInput ? 'active' : ''}`}
                        onClick={() => { setStuckNote(''); setShowCustomInput(true); }}
                      >
                        ✏️ 其他問題
                      </button>
                    </div>
                  );
                })()}
                {/* Custom input: always show if no predefined options, or when user clicks 'other' */}
                {(showCustomInput || getOptionsForSection(stuckPrompt.sectionTitle).length === 0) && (
                  <textarea
                    value={stuckNote}
                    onChange={(e) => setStuckNote(e.target.value)}
                    placeholder="例：步驟 3 的 API Key 設定看不懂，錯誤訊息是..."
                    rows={3}
                    maxLength={500}
                  />
                )}
                <div className="stuck-prompt-actions">
                  <button
                    className="stuck-prompt-skip"
                    onClick={() => setStuckPrompt(null)}
                  >
                    跳過
                  </button>
                  <button
                    className="stuck-prompt-submit"
                    onClick={handleStuckSubmit}
                    disabled={!stuckNote.trim()}
                  >
                    送出問題
                  </button>
                </div>
              </>
            ) : (
              <p className="stuck-prompt-thanks">✅ 已記錄！會顯示在下方的問答區</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
