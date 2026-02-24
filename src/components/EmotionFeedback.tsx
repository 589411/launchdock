import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getFingerprint,
  validateContent,
  checkRateLimit,
  formatRetryTime,
} from '../lib/content-security';

interface Reactions {
  rocket: number;
  like: number;
  stuck: number;
  cry: number;
}

interface Props {
  slug: string;
}

const REACTIONS = [
  { key: 'rocket' as const, emoji: '🚀', label: '發射成功！', color: 'hover:bg-amber-500/20 active:bg-amber-500/30' },
  { key: 'like' as const, emoji: '👍', label: '有用', color: 'hover:bg-blue-500/20 active:bg-blue-500/30' },
  { key: 'stuck' as const, emoji: '😵', label: '卡關了', color: 'hover:bg-red-500/20 active:bg-red-500/30' },
  { key: 'cry' as const, emoji: '😢', label: '救命', color: 'hover:bg-purple-500/20 active:bg-purple-500/30' },
];

export default function EmotionFeedback({ slug }: Props) {
  const [reactions, setReactions] = useState<Reactions>({ rocket: 0, like: 0, stuck: 0, cry: 0 });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [stuckNote, setStuckNote] = useState('');
  const [showStuckInput, setShowStuckInput] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stuckError, setStuckError] = useState<string | null>(null);

  useEffect(() => {
    loadReactions();
  }, [slug]);

  async function loadReactions() {
    // Check local vote first
    const userVote = localStorage.getItem(`launchdock-vote-${slug}`);
    if (userVote) setUserReaction(userVote);

    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(`launchdock-reactions-${slug}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setReactions(data.counts || { rocket: 0, like: 0, stuck: 0, cry: 0 });
        } catch {}
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('article_reactions')
        .select('reaction_type')
        .eq('slug', slug);

      if (error) throw error;

      const counts: Reactions = { rocket: 0, like: 0, stuck: 0, cry: 0 };
      for (const row of data || []) {
        if (row.reaction_type in counts) {
          counts[row.reaction_type as keyof Reactions]++;
        }
      }
      setReactions(counts);
    } catch {
      // Fallback to localStorage
      const stored = localStorage.getItem(`launchdock-reactions-${slug}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setReactions(data.counts || { rocket: 0, like: 0, stuck: 0, cry: 0 });
        } catch {}
      }
    }
  }

  const handleReaction = async (key: string) => {
    if (userReaction === key) return; // Same vote, do nothing

    const rateCheck = checkRateLimit('reaction');
    if (!rateCheck.allowed) return;

    // Optimistic update: decrement old, increment new
    const newReactions = { ...reactions };
    if (userReaction) {
      newReactions[userReaction as keyof Reactions] = Math.max(0, newReactions[userReaction as keyof Reactions] - 1);
    }
    newReactions[key as keyof Reactions]++;
    setReactions(newReactions);
    setUserReaction(key);

    localStorage.setItem(`launchdock-reactions-${slug}`, JSON.stringify({ counts: newReactions }));
    localStorage.setItem(`launchdock-vote-${slug}`, key);

    if (isSupabaseConfigured()) {
      try {
        const fp = getFingerprint();
        // Upsert: UNIQUE(slug, fingerprint) replaces old reaction
        await supabase.from('article_reactions').upsert({
          slug,
          reaction_type: key as 'rocket' | 'like' | 'stuck' | 'cry',
          fingerprint: fp,
        }, { onConflict: 'slug,fingerprint' });
      } catch (err) {
        console.error('Failed to save article reaction:', err);
      }
    }

    if (key === 'stuck' || key === 'cry') {
      setShowStuckInput(true);
      setStuckError(null);
    }
  };

  const handleStuckSubmit = async () => {
    if (stuckNote.trim()) {
      const validation = validateContent(stuckNote, 300);
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
            section_id: null,
            section_title: null,
            question: validation.sanitized,
            fingerprint: fp,
          });
        } catch (err) {
          console.error('Failed to save stuck note:', err);
        }
      } else {
        const notes = JSON.parse(localStorage.getItem(`launchdock-stuck-notes-${slug}`) || '[]');
        notes.push({ note: validation.sanitized, timestamp: new Date().toISOString() });
        localStorage.setItem(`launchdock-stuck-notes-${slug}`, JSON.stringify(notes));
      }
    }
    setShowStuckInput(false);
    setSubmitted(true);
  };

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        這篇文章對你有幫助嗎？
      </h3>

      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {REACTIONS.map(({ key, emoji, label, color }) => (
          <button
            key={key}
            onClick={() => handleReaction(key)}
            className={`
              flex flex-col items-center gap-1 px-5 py-3 rounded-xl
              border transition-all duration-200 cursor-pointer
              ${userReaction === key
                ? 'border-brand bg-brand/20 scale-105'
                : `border-transparent ${color}`
              }
            `}
            style={{
              backgroundColor: userReaction !== key ? 'var(--color-surface-light)' : undefined,
              borderColor: userReaction === key ? 'var(--color-brand)' : undefined,
            }}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {reactions[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Stuck input */}
      {showStuckInput && !submitted && (
        <div className="max-w-md mx-auto mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-light)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            卡在哪一步？（選填，幫助我們改進文章）
          </p>
          {stuckError && (
            <p className="text-xs mb-2" style={{ color: 'var(--color-accent-stuck)' }}>
              ⚠️ {stuckError}
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={stuckNote}
              onChange={(e) => setStuckNote(e.target.value)}
              placeholder="例：API Key 申請步驟 3 看不懂..."
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-surface-lighter)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleStuckSubmit()}
            />
            <button
              onClick={handleStuckSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--color-brand)' }}
            >
              送出
            </button>
          </div>
          <button
            onClick={() => { setShowStuckInput(false); setSubmitted(true); }}
            className="mt-2 text-xs transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            跳過
          </button>
        </div>
      )}

      {/* Thank you message */}
      {userReaction && !showStuckInput && (
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          感謝你的回饋！🙏
        </p>
      )}
      {submitted && (
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          感謝你的回饋！卡關的話可以在下方問答區提問 💬
        </p>
      )}
    </div>
  );
}
