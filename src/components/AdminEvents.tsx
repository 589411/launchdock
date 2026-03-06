import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getStoredSession } from '../lib/supabase';
import AdminGuard from './AdminGuard';
import type { EventStatus, EventType } from '../lib/supabase-types';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  max_capacity: number | null;
  status: EventStatus;
  priority_hours: number;
  event_type: EventType;
  price: number;
  meet_link: string | null;
  created_at: string;
  updated_at: string;
}

interface Registration {
  id: string;
  user_id: string;
  status: string;
  registered_at: string;
  profile?: { display_name: string; email: string; avatar_url: string | null };
}

export default function AdminEvents() {
  return (
    <AdminGuard>
      <AdminEventsContent />
    </AdminGuard>
  );
}

function AdminEventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      if (error) console.error('loadEvents error:', error);
      setEvents((data as Event[]) || []);
    } catch (err) {
      console.error('loadEvents failed:', err);
      setEvents([]);
    }
    setLoading(false);
  }

  async function loadRegistrations(eventId: string) {
    setRegLoading(true);
    setSelectedEvent(eventId);
    try {
      const { data } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: true });

      if (data && data.length > 0) {
        // Batch fetch all profiles in one query instead of N+1
        const userIds = data.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('member_profiles')
          .select('user_id, display_name, email, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(
          (profiles || []).map(p => [p.user_id, p])
        );

        const withProfiles = data.map(reg => ({
          ...reg,
          profile: profileMap.get(reg.user_id) || undefined,
        })) as Registration[];
        setRegistrations(withProfiles);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error('loadRegistrations failed:', err);
      setRegistrations([]);
    }
    setRegLoading(false);
  }

  async function updateEventStatus(eventId: string, status: EventStatus) {
    await supabase.from('events').update({ status }).eq('id', eventId);
    await loadEvents();
  }

  async function markAttended(regId: string) {
    await supabase
      .from('event_registrations')
      .update({ status: 'attended' })
      .eq('id', regId);
    if (selectedEvent) await loadRegistrations(selectedEvent);
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    published: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    completed: 'bg-blue-500/20 text-blue-400',
  };

  if (loading) return <p className="text-text-muted text-center py-8">載入活動資料中...</p>;

  if (events.length === 0 && !showForm) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted mb-4">目前還沒有活動，建立第一個活動吧！</p>
        <button
          onClick={() => { setEditingEvent(null); setShowForm(true); }}
          className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors"
        >
          ＋ 新增活動
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">活動列表</h2>
        <button
          onClick={() => { setEditingEvent(null); setShowForm(true); }}
          className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors"
        >
          ＋ 新增活動
        </button>
      </div>

      {showForm && (
        <EventForm
          event={editingEvent}
          onSave={() => { setShowForm(false); loadEvents(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="p-5 rounded-xl bg-surface-light border border-surface-lighter">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                  <h3 className="font-semibold">{event.title}</h3>
                </div>
                <p className="text-text-muted text-xs">
                  📅 {formatDate(event.event_date)}
                  {event.location && ` · 📍 ${event.location}`}
                  {event.max_capacity && ` · 👥 上限 ${event.max_capacity}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => loadRegistrations(event.id)}
                  className="text-xs px-3 py-1.5 border border-surface-lighter hover:border-brand/40 rounded-lg text-text-secondary hover:text-text-primary transition-all"
                >
                  👥 報名名單
                </button>
                <button
                  onClick={() => { setEditingEvent(event); setShowForm(true); }}
                  className="text-xs px-3 py-1.5 border border-surface-lighter hover:border-brand/40 rounded-lg text-text-secondary hover:text-text-primary transition-all"
                >
                  ✏️ 編輯
                </button>
                <select
                  value={event.status}
                  onChange={(e) => updateEventStatus(event.id, e.target.value as EventStatus)}
                  className="text-xs px-2 py-1.5 bg-surface border border-surface-lighter rounded-lg text-text-secondary"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已發布</option>
                  <option value="cancelled">已取消</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration list modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-surface-lighter w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-surface-lighter">
              <h3 className="font-bold">報名名單</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-text-muted hover:text-text-primary text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {regLoading ? (
                <p className="text-text-muted text-center py-4">載入中...</p>
              ) : registrations.length === 0 ? (
                <p className="text-text-muted text-center py-4">目前沒有人報名</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-muted border-b border-surface-lighter">
                      <th className="pb-2 font-medium">名稱</th>
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">狀態</th>
                      <th className="pb-2 font-medium">報名時間</th>
                      <th className="pb-2 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id} className="border-b border-surface-lighter/50">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            {reg.profile?.avatar_url ? (
                              <img src={reg.profile.avatar_url} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-brand/20" />
                            )}
                            {reg.profile?.display_name || '—'}
                          </div>
                        </td>
                        <td className="py-2.5 text-text-muted">{reg.profile?.email || '—'}</td>
                        <td className="py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            reg.status === 'attended' ? 'bg-green-500/20 text-green-400' :
                            reg.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {reg.status === 'registered' ? '已報名' :
                             reg.status === 'attended' ? '已出席' :
                             reg.status === 'cancelled' ? '已取消' :
                             reg.status === 'waitlist' ? '候補' : reg.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-text-muted text-xs">
                          {new Date(reg.registered_at).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="py-2.5">
                          {reg.status === 'registered' && (
                            <button
                              onClick={() => markAttended(reg.id)}
                              className="text-xs text-brand-light hover:underline"
                            >
                              標記出席
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Event creation/editing form
function EventForm({
  event,
  onSave,
  onCancel,
}: {
  event: Event | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [eventDate, setEventDate] = useState(
    event?.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : ''
  );
  const [location, setLocation] = useState(event?.location || '');
  const [maxCapacity, setMaxCapacity] = useState(event?.max_capacity?.toString() || '');
  const [priorityHours, setPriorityHours] = useState(event?.priority_hours?.toString() || '0');
  const [eventType, setEventType] = useState<EventType>(event?.event_type || 'meetup');
  const [price, setPrice] = useState(event?.price?.toString() || '0');
  const [meetLink, setMeetLink] = useState(event?.meet_link || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      setError('標題和日期為必填');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      event_date: new Date(eventDate).toISOString(),
      location: location.trim() || null,
      max_capacity: maxCapacity ? parseInt(maxCapacity) : null,
      priority_hours: parseInt(priorityHours) || 0,
      event_type: eventType,
      price: parseInt(price) || 0,
      meet_link: meetLink.trim() || null,
    };

    if (event) {
      const { error: err } = await supabase.from('events').update(payload).eq('id', event.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      // Use stored session to avoid getSession() deadlock
      const stored = getStoredSession();
      const { error: err } = await supabase.from('events').insert({
        ...payload,
        created_by: stored?.userId || null,
      });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    onSave();
  };

  return (
    <div className="mb-6 p-6 rounded-xl bg-surface-light border border-surface-lighter">
      <h3 className="font-bold mb-4">{event ? '編輯活動' : '新增活動'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">活動名稱 *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
            placeholder="例：第三場藍鴨小聚"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">說明</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none resize-y"
            placeholder="活動內容說明..."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">活動類型 *</label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value as EventType)}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
            >
              <option value="meetup">💻 線上小聚（免費）</option>
              <option value="course">🎓 主題課程（付費）</option>
              <option value="workshop">🤝 實體工作坊</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">費用（NT$）</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
              placeholder="0 = 免費"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Google Meet 連結</label>
          <input
            type="text"
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
          />
          <p className="text-text-muted text-xs mt-1">報名成功後才會顯示給已報名者</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">日期時間 *</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">地點</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
              placeholder="線上 / 台北市某某咖啡廳"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">人數上限</label>
            <input
              type="number"
              min="1"
              value={maxCapacity}
              onChange={e => setMaxCapacity(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
              placeholder="不填 = 無上限"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">會員優先報名時數</label>
            <input
              type="number"
              min="0"
              value={priorityHours}
              onChange={e => setPriorityHours(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-surface-lighter text-text-primary focus:border-brand focus:outline-none"
              placeholder="0 = 不限制"
            />
            <p className="text-text-muted text-xs mt-1">活動發布後前 N 小時僅會員可報名</p>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? '儲存中...' : event ? '更新活動' : '建立活動'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-surface-lighter hover:border-brand/40 text-text-secondary rounded-lg text-sm font-medium transition-all"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
