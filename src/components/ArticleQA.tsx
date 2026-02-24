import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getFingerprint,
  validateContent,
  checkRateLimit,
  formatRetryTime,
} from '../lib/content-security';

interface Answer {
  id: string;
  text: string;
  timestamp: string;
  helpful: number;
  isMine?: boolean;
}

interface Question {
  id: string;
  sectionId: string;
  sectionTitle: string;
  question: string;
  timestamp: string;
  answers: Answer[];
  isMine?: boolean;
}

interface Props {
  slug: string;
}

export default function ArticleQA({ slug }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [filterSection, setFilterSection] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Data fetching ----
  useEffect(() => {
    loadQuestions();
  }, [slug]);

  async function loadQuestions() {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem(`launchdock-qa-${slug}`);
        if (stored) setQuestions(JSON.parse(stored));
      } catch {}
      setLoading(false);
      return;
    }

    try {
      const fp = getFingerprint();

      const { data: qData, error: qErr } = await supabase
        .from('qa_questions')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'visible')
        .order('created_at', { ascending: true });

      if (qErr) throw qErr;

      const questionIds = (qData || []).map(q => q.id);
      let answersMap: Record<string, Answer[]> = {};

      if (questionIds.length > 0) {
        const { data: aData, error: aErr } = await supabase
          .from('qa_answers')
          .select('*')
          .in('question_id', questionIds)
          .eq('status', 'visible')
          .order('created_at', { ascending: true });

        if (aErr) throw aErr;

        for (const a of aData || []) {
          if (!answersMap[a.question_id]) answersMap[a.question_id] = [];
          answersMap[a.question_id].push({
            id: a.id,
            text: a.answer,
            timestamp: a.created_at,
            helpful: a.helpful_count,
            isMine: a.fingerprint === fp,
          });
        }
      }

      setQuestions(
        (qData || []).map(q => ({
          id: q.id,
          sectionId: q.section_id,
          sectionTitle: q.section_title,
          question: q.question,
          timestamp: q.created_at,
          answers: answersMap[q.id] || [],
          isMine: q.fingerprint === fp,
        }))
      );
    } catch (err: any) {
      console.error('Failed to load Q&A:', err);
      setError('載入問答區失敗，使用離線模式');
      try {
        const stored = localStorage.getItem(`launchdock-qa-${slug}`);
        if (stored) setQuestions(JSON.parse(stored));
      } catch {}
    }

    setLoading(false);
  }

  // ---- Ask question ----
  async function handleAskQuestion() {
    if (!newQuestion.trim() || submitting) return;

    const validation = validateContent(newQuestion, 1000);
    if (!validation.ok) {
      setError(validation.reason || '內容驗證失敗');
      return;
    }

    const rateCheck = checkRateLimit('question');
    if (!rateCheck.allowed) {
      setError(`提問太頻繁，請等 ${formatRetryTime(rateCheck.retryAfterMs!)} 後再試`);
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const q: Question = {
        id: Date.now().toString(),
        sectionId: '',
        sectionTitle: '一般問題',
        question: validation.sanitized,
        timestamp: new Date().toISOString(),
        answers: [],
        isMine: true,
      };
      const updated = [...questions, q];
      setQuestions(updated);
      localStorage.setItem(`launchdock-qa-${slug}`, JSON.stringify(updated));
      setNewQuestion('');
      setShowForm(false);
      setSubmitting(false);
      return;
    }

    try {
      const fp = getFingerprint();
      const { data, error: err } = await supabase
        .from('qa_questions')
        .insert({
          slug,
          section_id: '',
          section_title: '一般問題',
          question: validation.sanitized,
          fingerprint: fp,
        })
        .select()
        .single();

      if (err) throw err;

      setQuestions(prev => [
        ...prev,
        {
          id: data.id,
          sectionId: data.section_id,
          sectionTitle: data.section_title,
          question: data.question,
          timestamp: data.created_at,
          answers: [],
          isMine: true,
        },
      ]);
      setNewQuestion('');
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to post question:', err);
      setError('送出失敗，請稍後再試');
    }

    setSubmitting(false);
  }

  // ---- Submit answer ----
  async function handleAnswer(questionId: string) {
    if (!newAnswer.trim() || submitting) return;

    const validation = validateContent(newAnswer, 2000);
    if (!validation.ok) {
      setError(validation.reason || '內容驗證失敗');
      return;
    }

    const rateCheck = checkRateLimit('answer');
    if (!rateCheck.allowed) {
      setError(`回答太頻繁，請等 ${formatRetryTime(rateCheck.retryAfterMs!)} 後再試`);
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      const updated = questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: [...q.answers, {
              id: Date.now().toString(),
              text: validation.sanitized,
              timestamp: new Date().toISOString(),
              helpful: 0,
              isMine: true,
            }],
          };
        }
        return q;
      });
      setQuestions(updated);
      localStorage.setItem(`launchdock-qa-${slug}`, JSON.stringify(updated));
      setNewAnswer('');
      setAnsweringId(null);
      setSubmitting(false);
      return;
    }

    try {
      const fp = getFingerprint();
      const { data, error: err } = await supabase
        .from('qa_answers')
        .insert({
          question_id: questionId,
          answer: validation.sanitized,
          fingerprint: fp,
        })
        .select()
        .single();

      if (err) throw err;

      setQuestions(prev =>
        prev.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              answers: [...q.answers, {
                id: data.id,
                text: data.answer,
                timestamp: data.created_at,
                helpful: 0,
                isMine: true,
              }],
            };
          }
          return q;
        })
      );
      setNewAnswer('');
      setAnsweringId(null);
    } catch (err: any) {
      console.error('Failed to post answer:', err);
      setError('送出失敗，請稍後再試');
    }

    setSubmitting(false);
  }

  // ---- Helpful vote ----
  async function handleHelpful(questionId: string, answerId: string) {
    const localKey = `ld-helpful-${answerId}`;
    if (localStorage.getItem(localKey)) return;

    const rateCheck = checkRateLimit('helpful');
    if (!rateCheck.allowed) return;

    // Optimistic update
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers.map(a =>
              a.id === answerId ? { ...a, helpful: a.helpful + 1 } : a
            ),
          };
        }
        return q;
      })
    );
    localStorage.setItem(localKey, '1');

    if (isSupabaseConfigured()) {
      try {
        const fp = getFingerprint();
        await supabase.rpc('increment_helpful', {
          answer_id_input: answerId,
          fingerprint_input: fp,
        });
      } catch (err) {
        console.error('Failed to record helpful vote:', err);
      }
    }
  }

  // ---- Helpers ----
  const sections = [...new Set(questions.map(q => q.sectionTitle))].filter(Boolean);
  const filteredQuestions = filterSection
    ? questions.filter(q => q.sectionTitle === filterSection)
    : questions;

  function formatTime(ts: string): string {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`;
    return d.toLocaleDateString('zh-TW');
  }

  // ---- Render ----
  return (
    <div className="article-qa">
      <div className="qa-header">
        <h3>💬 問答區</h3>
        <p>卡關了？直接在這裡問，其他讀者和作者都能幫忙解答。</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="qa-error" role="alert">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="qa-error-close">✕</button>
        </div>
      )}

      {/* Section filter */}
      {sections.length > 1 && (
        <div className="qa-filters">
          <button
            className={`qa-filter-btn ${!filterSection ? 'active' : ''}`}
            onClick={() => setFilterSection(null)}
          >
            全部 ({questions.length})
          </button>
          {sections.map(section => {
            const count = questions.filter(q => q.sectionTitle === section).length;
            return (
              <button
                key={section}
                className={`qa-filter-btn ${filterSection === section ? 'active' : ''}`}
                onClick={() => setFilterSection(section === filterSection ? null : section)}
              >
                {section} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="qa-empty">
          <p>載入中...</p>
        </div>
      )}

      {/* Questions list */}
      {!loading && filteredQuestions.length > 0 && (
        <div className="qa-list">
          {filteredQuestions.map(q => (
            <div key={q.id} className="qa-item">
              <div className="qa-question">
                <div className="qa-question-header">
                  {q.sectionTitle && q.sectionTitle !== '一般問題' && (
                    <span className="qa-section-tag">📌 {q.sectionTitle}</span>
                  )}
                  {q.isMine && <span className="qa-mine-tag">我的提問</span>}
                  <span className="qa-time">{formatTime(q.timestamp)}</span>
                </div>
                <p className="qa-question-text">{q.question}</p>

                {/* Answers */}
                {q.answers.length > 0 && (
                  <div className="qa-answers">
                    {q.answers.map(a => (
                      <div key={a.id} className="qa-answer">
                        <p>{a.text}</p>
                        <div className="qa-answer-footer">
                          <span className="qa-time">{formatTime(a.timestamp)}</span>
                          {a.isMine && <span className="qa-mine-tag">我的回答</span>}
                          <button
                            className="qa-helpful-btn"
                            onClick={() => handleHelpful(q.id, a.id)}
                          >
                            👍 有幫助 {a.helpful > 0 && `(${a.helpful})`}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer input */}
                {answeringId === q.id ? (
                  <div className="qa-answer-form">
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="分享你的解決方法..."
                      rows={2}
                      maxLength={2000}
                    />
                    <div className="qa-char-count">{newAnswer.length}/2000</div>
                    <div className="qa-answer-actions">
                      <button
                        className="qa-cancel-btn"
                        onClick={() => { setAnsweringId(null); setNewAnswer(''); }}
                      >
                        取消
                      </button>
                      <button
                        className="qa-submit-btn"
                        onClick={() => handleAnswer(q.id)}
                        disabled={submitting || !newAnswer.trim()}
                      >
                        {submitting ? '送出中...' : '回答'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="qa-reply-btn"
                    onClick={() => setAnsweringId(q.id)}
                  >
                    💡 我知道答案
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredQuestions.length === 0 && (
        <div className="qa-empty">
          <p>🎉 目前沒有問題，太棒了！</p>
          <p>如果你在學習過程中卡住了，可以在上方段落點「😵 卡關了」，或在下方直接提問。</p>
        </div>
      )}

      {/* Ask question form */}
      {showForm ? (
        <div className="qa-ask-form">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="描述你的問題、卡在哪、看到什麼錯誤訊息..."
            rows={3}
            maxLength={1000}
            autoFocus
          />
          <div className="qa-char-count">{newQuestion.length}/1000</div>
          <div className="qa-ask-actions">
            <button
              className="qa-cancel-btn"
              onClick={() => { setShowForm(false); setNewQuestion(''); }}
            >
              取消
            </button>
            <button
              className="qa-submit-btn"
              onClick={handleAskQuestion}
              disabled={submitting || !newQuestion.trim()}
            >
              {submitting ? '送出中...' : '送出問題'}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="qa-ask-btn"
          onClick={() => setShowForm(true)}
        >
          ✋ 我有問題想問
        </button>
      )}
    </div>
  );
}
