import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getFingerprint,
  validateContent,
  checkRateLimit,
  formatRetryTime,
} from '../lib/content-security';

const SLUG = '_homepage';

interface Reply {
  id: string;
  text: string;
  timestamp: string;
  helpful: number;
  isMine?: boolean;
}

interface Topic {
  id: string;
  title: string;
  timestamp: string;
  replies: Reply[];
  isMine?: boolean;
}

export default function HomeDiscussion() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem('launchdock-discussion');
        if (stored) setTopics(JSON.parse(stored));
      } catch {}
      setLoading(false);
      return;
    }

    try {
      const fp = getFingerprint();

      const { data: qData, error: qErr } = await supabase
        .from('qa_questions')
        .select('*')
        .eq('slug', SLUG)
        .eq('status', 'visible')
        .order('created_at', { ascending: false })
        .limit(30);

      if (qErr) throw qErr;

      const ids = (qData || []).map(q => q.id);
      let repliesMap: Record<string, Reply[]> = {};

      if (ids.length > 0) {
        const { data: aData, error: aErr } = await supabase
          .from('qa_answers')
          .select('*')
          .in('question_id', ids)
          .eq('status', 'visible')
          .order('created_at', { ascending: true });

        if (aErr) throw aErr;

        for (const a of aData || []) {
          if (!repliesMap[a.question_id]) repliesMap[a.question_id] = [];
          repliesMap[a.question_id].push({
            id: a.id,
            text: a.answer,
            timestamp: a.created_at,
            helpful: a.helpful_count,
            isMine: a.fingerprint === fp,
          });
        }
      }

      setTopics(
        (qData || []).map(q => ({
          id: q.id,
          title: q.question,
          timestamp: q.created_at,
          replies: repliesMap[q.id] || [],
          isMine: q.fingerprint === fp,
        }))
      );
    } catch (err: any) {
      console.error('Failed to load discussion:', err);
      setError('載入討論區失敗');
      try {
        const stored = localStorage.getItem('launchdock-discussion');
        if (stored) setTopics(JSON.parse(stored));
      } catch {}
    }

    setLoading(false);
  }

  async function handlePost() {
    if (!newTopic.trim() || submitting) return;

    const validation = validateContent(newTopic, 500);
    if (!validation.ok) {
      setError(validation.reason || '內容驗證失敗');
      return;
    }

    const rateCheck = checkRateLimit('question');
    if (!rateCheck.allowed) {
      setError(`發言太頻繁，請等 ${formatRetryTime(rateCheck.retryAfterMs!)} 後再試`);
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const t: Topic = {
        id: Date.now().toString(),
        title: validation.sanitized,
        timestamp: new Date().toISOString(),
        replies: [],
        isMine: true,
      };
      const updated = [t, ...topics];
      setTopics(updated);
      localStorage.setItem('launchdock-discussion', JSON.stringify(updated));
      setNewTopic('');
      setShowForm(false);
      setSubmitting(false);
      return;
    }

    try {
      const fp = getFingerprint();
      const { data, error: err } = await supabase
        .from('qa_questions')
        .insert({
          slug: SLUG,
          section_id: '',
          section_title: '首頁討論',
          question: validation.sanitized,
          fingerprint: fp,
        })
        .select()
        .single();

      if (err) throw err;

      setTopics(prev => [
        {
          id: data.id,
          title: data.question,
          timestamp: data.created_at,
          replies: [],
          isMine: true,
        },
        ...prev,
      ]);
      setNewTopic('');
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to post topic:', err);
      setError('送出失敗，請稍後再試');
    }

    setSubmitting(false);
  }

  async function handleReply(topicId: string) {
    if (!newReply.trim() || submitting) return;

    const validation = validateContent(newReply, 1000);
    if (!validation.ok) {
      setError(validation.reason || '內容驗證失敗');
      return;
    }

    const rateCheck = checkRateLimit('answer');
    if (!rateCheck.allowed) {
      setError(`回覆太頻繁，請等 ${formatRetryTime(rateCheck.retryAfterMs!)} 後再試`);
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const r: Reply = {
        id: Date.now().toString(),
        text: validation.sanitized,
        timestamp: new Date().toISOString(),
        helpful: 0,
        isMine: true,
      };
      const updated = topics.map(t =>
        t.id === topicId ? { ...t, replies: [...t.replies, r] } : t
      );
      setTopics(updated);
      localStorage.setItem('launchdock-discussion', JSON.stringify(updated));
      setNewReply('');
      setReplyingId(null);
      setSubmitting(false);
      return;
    }

    try {
      const fp = getFingerprint();
      const { data, error: err } = await supabase
        .from('qa_answers')
        .insert({
          question_id: topicId,
          answer: validation.sanitized,
          fingerprint: fp,
        })
        .select()
        .single();

      if (err) throw err;

      setTopics(prev =>
        prev.map(t =>
          t.id === topicId
            ? {
                ...t,
                replies: [
                  ...t.replies,
                  {
                    id: data.id,
                    text: data.answer,
                    timestamp: data.created_at,
                    helpful: 0,
                    isMine: true,
                  },
                ],
              }
            : t
        )
      );
      setNewReply('');
      setReplyingId(null);
    } catch (err: any) {
      console.error('Failed to post reply:', err);
      setError('送出失敗，請稍後再試');
    }

    setSubmitting(false);
  }

  async function handleHelpful(replyId: string, topicId: string) {
    if (!isSupabaseConfigured()) return;

    try {
      const { data } = await supabase.rpc('increment_helpful', {
        _answer_id: replyId,
        _fingerprint: getFingerprint(),
      });

      if (data !== null) {
        setTopics(prev =>
          prev.map(t =>
            t.id === topicId
              ? {
                  ...t,
                  replies: t.replies.map(r =>
                    r.id === replyId ? { ...r, helpful: data } : r
                  ),
                }
              : t
          )
        );
      }
    } catch {}
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return '剛剛';
    if (min < 60) return `${min} 分鐘前`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} 小時前`;
    const day = Math.floor(hr / 24);
    return `${day} 天前`;
  }

  return (
    <div className="home-discussion">
      <div className="home-discussion__header">
        <div>
          <h2 className="home-discussion__title">💬 社群討論</h2>
          <p className="home-discussion__subtitle">
            卡關了嗎？分享你的經驗、問問題、幫助其他人。
          </p>
        </div>
        <button
          className="home-discussion__new-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '取消' : '✍️ 發起討論'}
        </button>
      </div>

      {error && (
        <div className="home-discussion__error">{error}</div>
      )}

      {showForm && (
        <div className="home-discussion__form">
          <textarea
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            placeholder="聊聊你遇到的問題，或分享你的學習心得…"
            maxLength={500}
            rows={3}
          />
          <div className="home-discussion__form-footer">
            <span className="home-discussion__char-count">
              {newTopic.length}/500
            </span>
            <button
              onClick={handlePost}
              disabled={!newTopic.trim() || submitting}
              className="home-discussion__submit-btn"
            >
              {submitting ? '送出中…' : '送出'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="home-discussion__loading">載入中…</div>
      ) : topics.length === 0 ? (
        <div className="home-discussion__empty">
          <p>還沒有人開話題，成為第一個發言的人吧！ 🎉</p>
        </div>
      ) : (
        <div className="home-discussion__list">
          {topics.map(topic => (
            <div key={topic.id} className="home-discussion__topic">
              <div
                className="home-discussion__topic-header"
                onClick={() => setExpandedId(expandedId === topic.id ? null : topic.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="home-discussion__topic-main">
                  <p className="home-discussion__topic-text">{topic.title}</p>
                  <div className="home-discussion__topic-meta">
                    <span>{timeAgo(topic.timestamp)}</span>
                    {topic.isMine && <span className="home-discussion__mine">我的</span>}
                    {topic.replies.length > 0 && (
                      <span className="home-discussion__reply-count">
                        💬 {topic.replies.length}
                      </span>
                    )}
                  </div>
                </div>
                <span className="home-discussion__expand">
                  {expandedId === topic.id ? '▾' : '▸'}
                </span>
              </div>

              {expandedId === topic.id && (
                <div className="home-discussion__replies">
                  {topic.replies.length === 0 && (
                    <p className="home-discussion__no-replies">還沒有人回覆</p>
                  )}
                  {topic.replies.map(reply => (
                    <div key={reply.id} className="home-discussion__reply">
                      <p>{reply.text}</p>
                      <div className="home-discussion__reply-meta">
                        <span>{timeAgo(reply.timestamp)}</span>
                        {reply.isMine && <span className="home-discussion__mine">我的</span>}
                        <button
                          className="home-discussion__helpful-btn"
                          onClick={() => handleHelpful(reply.id, topic.id)}
                          title="有幫助"
                        >
                          👍 {reply.helpful > 0 ? reply.helpful : ''}
                        </button>
                      </div>
                    </div>
                  ))}

                  {replyingId === topic.id ? (
                    <div className="home-discussion__reply-form">
                      <textarea
                        value={newReply}
                        onChange={e => setNewReply(e.target.value)}
                        placeholder="寫下你的回覆…"
                        maxLength={1000}
                        rows={2}
                      />
                      <div className="home-discussion__form-footer">
                        <button
                          className="home-discussion__cancel-btn"
                          onClick={() => { setReplyingId(null); setNewReply(''); }}
                        >
                          取消
                        </button>
                        <button
                          className="home-discussion__submit-btn"
                          onClick={() => handleReply(topic.id)}
                          disabled={!newReply.trim() || submitting}
                        >
                          {submitting ? '送出中…' : '回覆'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="home-discussion__reply-btn"
                      onClick={() => { setReplyingId(topic.id); setNewReply(''); }}
                    >
                      ✍️ 回覆這則討論
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
