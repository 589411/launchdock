import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import EventCard from './EventCard';
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
  compact?: boolean; // for homepage — show only next upcoming event
}

export default function EventList({ compact = false }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['published', 'completed'])
        .order('event_date', { ascending: true });

      if (error) {
        console.error('EventList query error:', error);
      }

      if (data) {
        // Use SECURITY DEFINER RPC to get accurate counts (bypasses RLS)
        const eventsWithCounts = await Promise.all(
          data.map(async (event) => {
            const { data: count } = await supabase
              .rpc('get_event_registration_count', { event_id_input: event.id });

            return { ...event, registration_count: count ?? 0 } as Event;
          })
        );
        setEvents(eventsWithCounts);
      }
    } catch (err) {
      console.error('EventList loadEvents failed:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted text-sm">載入活動中...</p>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted text-sm">活動功能尚未啟用</p>
      </div>
    );
  }

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now && e.status === 'published');
  const past = events.filter(e => new Date(e.event_date) < now || e.status === 'completed');

  // Compact mode: show only the next upcoming event
  if (compact) {
    const next = upcoming[0];
    if (!next) return null;
    return <EventCard eventData={next} compact />;
  }

  const displayed = tab === 'upcoming' ? upcoming : past.reverse();

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-light rounded-lg w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'upcoming'
              ? 'bg-brand text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          即將舉辦 ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'past'
              ? 'bg-brand text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          過往活動 ({past.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-12 bg-surface-light rounded-2xl border border-surface-lighter">
          <span className="text-3xl block mb-3">
            {tab === 'upcoming' ? <img src="/icons/duck-happy.png" alt="" className="duck-icon" style={{width:'48px',height:'48px',objectFit:'contain',display:'inline-block'}} /> : '📭'}
          </span>
          <p className="text-text-secondary">
            {tab === 'upcoming'
              ? '目前沒有即將舉辦的活動，敬請期待！'
              : '還沒有過往活動記錄'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {displayed.map(event => (
            <EventCard key={event.id} eventData={event} />
          ))}
        </div>
      )}
    </div>
  );
}
