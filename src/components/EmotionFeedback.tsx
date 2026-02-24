import { useState, useEffect } from 'react';

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

  // Load reactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`launchdock-reactions-${slug}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setReactions(data.counts || { rocket: 0, like: 0, stuck: 0, cry: 0 });
      } catch {}
    }
    const userVote = localStorage.getItem(`launchdock-vote-${slug}`);
    if (userVote) {
      setUserReaction(userVote);
    }
  }, [slug]);

  const handleReaction = (key: string) => {
    if (userReaction) return; // Already voted

    const newReactions = { ...reactions, [key]: reactions[key as keyof Reactions] + 1 };
    setReactions(newReactions);
    setUserReaction(key);

    // Save to localStorage
    localStorage.setItem(`launchdock-reactions-${slug}`, JSON.stringify({ counts: newReactions }));
    localStorage.setItem(`launchdock-vote-${slug}`, key);

    // Show stuck input if clicked stuck or cry
    if (key === 'stuck' || key === 'cry') {
      setShowStuckInput(true);
    }
  };

  const handleStuckSubmit = () => {
    if (stuckNote.trim()) {
      // Save stuck note to localStorage (will be synced to GitHub Discussion later)
      const notes = JSON.parse(localStorage.getItem(`launchdock-stuck-notes-${slug}`) || '[]');
      notes.push({ note: stuckNote, timestamp: new Date().toISOString() });
      localStorage.setItem(`launchdock-stuck-notes-${slug}`, JSON.stringify(notes));
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
            disabled={!!userReaction}
            className={`
              flex flex-col items-center gap-1 px-5 py-3 rounded-xl
              border transition-all duration-200
              ${userReaction === key
                ? 'border-brand bg-brand/20 scale-105'
                : userReaction
                  ? 'border-transparent opacity-50 cursor-default'
                  : `border-transparent ${color} cursor-pointer`
              }
            `}
            style={{
              backgroundColor: !userReaction ? 'var(--color-surface-light)' : undefined,
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
          感謝你的回饋！如果卡關了，歡迎到討論區發問 💬
        </p>
      )}
    </div>
  );
}
