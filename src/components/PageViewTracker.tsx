import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Props {
  slug: string;
}

/** Tracks a page view for the given article slug. Renders nothing. */
export default function PageViewTracker({ slug }: Props) {
  useEffect(() => {
    if (!slug) return;

    // Debounce: don't re-count if same slug visited within 30 min
    const key = `launchdock-pv-${slug}`;
    const last = localStorage.getItem(key);
    if (last && Date.now() - Number(last) < 30 * 60 * 1000) return;
    localStorage.setItem(key, String(Date.now()));

    // Increment local counter (offline fallback)
    const localKey = `launchdock-views-${slug}`;
    const count = Number(localStorage.getItem(localKey) || 0);
    localStorage.setItem(localKey, String(count + 1));

    if (!isSupabaseConfigured()) return;

    // Fire-and-forget insert
    let fp = localStorage.getItem('launchdock-fp') || '';
    if (!fp) {
      fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('launchdock-fp', fp);
    }

    supabase
      .from('article_page_views')
      .insert({ slug, fingerprint: fp, referrer: document.referrer || null })
      .then(({ error }) => {
        if (error) console.warn('[PageViewTracker] insert failed:', error.message);
      });
  }, [slug]);

  return null;
}
