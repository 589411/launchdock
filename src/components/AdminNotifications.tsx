import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AdminGuard from './AdminGuard';
import type { EmailType } from '../lib/supabase-types';

interface EmailLog {
  id: string;
  recipient_email: string;
  email_type: EmailType;
  subject: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  status: string;
}

export default function AdminNotifications() {
  return (
    <AdminGuard>
      <AdminNotificationsContent />
    </AdminGuard>
  );
}

function AdminNotificationsContent() {
  const [tab, setTab] = useState<'send' | 'logs'>('send');
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Send form state
  const [sendType, setSendType] = useState<'event_update' | 'new_article'>('new_article');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [logsRes, eventsRes] = await Promise.all([
      supabase.from('email_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('events').select('id, title, event_date, status').order('event_date', { ascending: false }),
    ]);
    setLogs((logsRes.data as EmailLog[]) || []);
    setEvents((eventsRes.data as Event[]) || []);
    setLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('未登入');

      // Call Edge Function to send notification
      const payload: Record<string, string> = {
        type: sendType,
        subject: customSubject,
        message: customMessage,
      };

      if (sendType === 'event_update' && selectedEvent) {
        payload.event_id = selectedEvent;
      }
      if (sendType === 'new_article' && articleSlug) {
        payload.article_slug = articleSlug;
      }

      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        setSendResult({ ok: true, message: `成功發送 ${result.sent_count || 0} 封通知` });
        await loadData();
      } else {
        setSendResult({ ok: false, message: result.error || '發送失敗' });
      }
    } catch (err: any) {
      setSendResult({ ok: false, message: err.message || '發送失敗' });
    }
    setSending(false);
  }

  const emailTypeLabels: Record<string, string> = {
    registration_confirmation: '📩 報名確認',
    event_reminder: '⏰ 活動提醒',
    event_update: '📢 活動異動',
    new_article: '📘 新文章',
  };

  if (loading) return <p className="text-text-muted text-center py-8">載入中...</p>;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-light rounded-lg w-fit">
        <button
          onClick={() => setTab('send')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'send' ? 'bg-brand text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          📤 發送通知
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'logs' ? 'bg-brand text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          📋 發送記錄 ({logs.length})
        </button>
      </div>

      {tab === 'send' ? (
        <div className="max-w-xl">
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">通知類型</label>
              <select
                value={sendType}
                onChange={e => setSendType(e.target.value as 'event_update' | 'new_article')}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
              >
                <option value="new_article">📘 新文章通知</option>
                <option value="event_update">📢 活動異動通知</option>
              </select>
            </div>

            {sendType === 'event_update' && (
              <div>
                <label className="block text-sm font-medium mb-1">選擇活動</label>
                <select
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
                >
                  <option value="">請選擇...</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({new Date(ev.event_date).toLocaleDateString('zh-TW')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sendType === 'new_article' && (
              <div>
                <label className="block text-sm font-medium mb-1">文章 Slug</label>
                <input
                  type="text"
                  value={articleSlug}
                  onChange={e => setArticleSlug(e.target.value)}
                  placeholder="例：install-openclaw-macos"
                  className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">郵件主旨</label>
              <input
                type="text"
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                placeholder={sendType === 'new_article' ? '🦆 新教學上架：...' : '📢 活動異動通知：...'}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">附加訊息（選填）</label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none resize-y"
                placeholder="想附上的說明文字..."
              />
            </div>

            {sendResult && (
              <div className={`p-3 rounded-lg text-sm ${
                sendResult.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {sendResult.message}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {sending ? '發送中...' : '📤 發送通知'}
            </button>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-surface-lighter">
                <th className="pb-3 font-medium">類型</th>
                <th className="pb-3 font-medium">收件者</th>
                <th className="pb-3 font-medium">主旨</th>
                <th className="pb-3 font-medium">狀態</th>
                <th className="pb-3 font-medium">時間</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-surface-lighter/50">
                  <td className="py-2.5">{emailTypeLabels[log.email_type] || log.email_type}</td>
                  <td className="py-2.5 text-text-muted">{log.recipient_email}</td>
                  <td className="py-2.5 max-w-[200px] truncate">{log.subject}</td>
                  <td className="py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                      log.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {log.status === 'sent' ? '已發送' : log.status === 'failed' ? '失敗' : '退信'}
                    </span>
                  </td>
                  <td className="py-2.5 text-text-muted text-xs">
                    {new Date(log.created_at).toLocaleString('zh-TW')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-text-muted text-center py-8">尚無發送記錄</p>
          )}
        </div>
      )}
    </div>
  );
}
