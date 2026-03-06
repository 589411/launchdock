import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { EventStatus, EventType } from '../lib/supabase-types';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  duration_hours: number | null;
  location: string | null;
  max_capacity: number | null;
  status: EventStatus;
  priority_hours: number;
  event_type: EventType;
  price: number;
  meet_link: string | null;
  registration_count?: number;
}

interface Props {
  eventData: Event;
  compact?: boolean;
}

export default function EventCard({ eventData, compact = false }: Props) {
  const [regCount, setRegCount] = useState(eventData.registration_count ?? 0);
  const event = eventData;

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isFull = event.max_capacity ? regCount >= event.max_capacity : false;
  const spotsLeft = event.max_capacity ? event.max_capacity - regCount : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeRange = () => {
    const start = formatTime(event.event_date);
    if (!event.duration_hours) return start;
    const endDate = new Date(new Date(event.event_date).getTime() + event.duration_hours * 3600000);
    const end = endDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    return `${start}–${end}`;
  };

  const statusBadge = () => {
    if (event.status === 'cancelled') return { text: '已取消', cls: 'bg-red-500/20 text-red-400' };
    if (event.status === 'completed') return { text: '已結束', cls: 'bg-gray-500/20 text-gray-400' };
    if (isPast) return { text: '已結束', cls: 'bg-gray-500/20 text-gray-400' };
    if (isFull) return { text: '已額滿', cls: 'bg-yellow-500/20 text-yellow-400' };
    return { text: '報名中', cls: 'bg-green-500/20 text-green-400' };
  };

  const badge = statusBadge();

  const typeBadge = () => {
    switch (event.event_type) {
      case 'course': return { text: '🎓 主題課程', cls: 'bg-purple-500/20 text-purple-400' };
      case 'workshop': return { text: '🤝 實體工作坊', cls: 'bg-orange-500/20 text-orange-400' };
      default: return { text: '💻 線上小聚', cls: 'bg-blue-500/20 text-blue-400' };
    }
  };

  const tBadge = typeBadge();

  if (compact) {
    return (
      <a
        href={`/events#event-${event.id}`}
        className="block p-4 rounded-xl bg-surface-light hover:bg-surface-lighter border border-surface-lighter hover:border-brand/40 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎟️</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-brand-light transition-colors truncate">
              {event.title}
            </h3>
            <p className="text-text-muted text-xs mt-0.5">
              {formatDate(event.event_date)} {formatTimeRange()}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${badge.cls}`}>
            {badge.text}
          </span>
        </div>
      </a>
    );
  }

  return (
    <div
      id={`event-${event.id}`}
      className="p-6 rounded-2xl bg-surface-light border border-surface-lighter hover:border-brand/30 transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full ${tBadge.cls}`}>
            {tBadge.text}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full ${badge.cls}`}>
            {badge.text}
          </span>
          {event.price > 0 ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
              NT${event.price}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">
              免費
            </span>
          )}
        </div>
        {spotsLeft !== null && !isPast && event.status === 'published' && (
          <span className="text-xs text-text-muted">
            剩餘 {spotsLeft > 0 ? spotsLeft : 0} / {event.max_capacity} 名額
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold mb-2">{event.title}</h3>

      {event.description && (
        <p className="text-text-secondary text-sm mb-4 leading-relaxed line-clamp-3">
          {event.description}
        </p>
      )}

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>📅</span>
          <span>{formatDate(event.event_date)} {formatTimeRange()}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>👥</span>
          <span>{regCount} 人已報名{event.max_capacity ? ` / ${event.max_capacity} 名額` : ''}</span>
        </div>
      </div>

      {!isPast && event.status === 'published' && (
        <EventRegButton eventId={event.id} isFull={isFull} onRegister={() => setRegCount(c => c + 1)} meetLink={event.meet_link} price={event.price} />
      )}
    </div>
  );
}

// Inline registration button (uses auth)
function EventRegButton({ eventId, isFull, onRegister, meetLink, price }: { eventId: string; isFull: boolean; onRegister: () => void; meetLink: string | null; price: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'registered' | 'error'>('idle');
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;

    // Use onAuthStateChange instead of getSession() to avoid navigator.locks deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        const uid = session?.user?.id ?? null;
        setUserId(uid);
        if (uid) {
          // Check if already registered
          const { data } = await supabase
            .from('event_registrations')
            .select('id, status')
            .eq('event_id', eventId)
            .eq('user_id', uid)
            .single();
          if (!cancelled && data && data.status !== 'cancelled') {
            setState('registered');
          }
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [eventId]);

  const handleRegister = async () => {
    if (!userId) {
      // Save return destination and redirect to OAuth
      sessionStorage.setItem('auth-return-to', window.location.pathname);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return;
    }

    setState('loading');
    const { error } = await supabase
      .from('event_registrations')
      .insert({ event_id: eventId, user_id: userId });

    if (error) {
      if (error.code === '23505') {
        setState('registered');
      } else {
        setErrorMsg(error.message);
        setState('error');
      }
    } else {
      setState('registered');
      onRegister();
    }
  };

  const handleCancel = async () => {
    if (!userId) return;
    setState('loading');
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (!error) {
      setState('idle');
      // Note: not decrementing regCount to keep it simple — server is source of truth
    }
  };

  if (state === 'registered') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-green-400 font-medium">
            ✅ 已報名
          </span>
          <button
            onClick={handleCancel}
            className="text-xs text-text-muted hover:text-red-400 transition-colors underline"
          >
            取消報名
          </button>
        </div>
        {meetLink && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-text-muted mb-1">📹 會議連結（報名者專屬）</p>
            <a
              href={meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-light hover:underline break-all"
            >
              {meetLink}
            </a>
          </div>
        )}
        {price > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-text-muted mb-1">💳 付款資訊</p>
            <p className="text-sm text-text-secondary">請轉帳 NT${price} 至指定帳戶，並於下方備註轉帳末五碼。</p>
          </div>
        )}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div>
        <p className="text-red-400 text-sm mb-2">報名失敗：{errorMsg}</p>
        <button onClick={() => setState('idle')} className="text-xs text-text-muted underline">
          重試
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRegister}
      disabled={isFull || state === 'loading'}
      className="px-6 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
    >
      {state === 'loading' ? '處理中...' : !userId ? '🔑 登入並報名' : isFull ? '已額滿' : '🙋 立即報名'}
    </button>
  );
}
