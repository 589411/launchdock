import { useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured, getStoredSession } from '../lib/supabase';

interface Props {
  children: ReactNode;
}

export default function AdminGuard({ children }: Props) {
  const [state, setState] = useState<'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'>('loading');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState('unauthorized');
      return;
    }

    const session = getStoredSession();
    if (!session) {
      setState('unauthenticated');
      return;
    }

    // Direct fetch to Supabase REST API — bypasses JS client entirely
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    fetch(
      `${supabaseUrl}/rest/v1/member_profiles?select=role&user_id=eq.${session.userId}`,
      {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }
    )
      .then(res => res.json())
      .then((rows: any[]) => {
        setState(rows?.[0]?.role === 'admin' ? 'authorized' : 'unauthorized');
      })
      .catch(() => {
        setState('unauthorized');
      });
  }, []);

  if (state === 'loading') {
    return (
      <div className="text-center py-24">
        <span className="text-3xl block mb-3">🔐</span>
        <p className="text-text-secondary">驗證權限中...</p>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return (
      <div className="text-center py-24">
        <span className="text-3xl block mb-3">🔒</span>
        <p className="text-lg font-semibold mb-2">需要登入</p>
        <p className="text-text-secondary text-sm mb-6">請先登入管理員帳號。</p>
        <button
          onClick={async () => {
            sessionStorage.setItem('auth-return-to', window.location.pathname);
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
          }}
          className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-medium transition-colors"
        >
          用 Google 登入
        </button>
      </div>
    );
  }

  if (state === 'unauthorized') {
    return (
      <div className="text-center py-24">
        <span className="text-3xl block mb-3">🚫</span>
        <p className="text-lg font-semibold mb-2">沒有權限</p>
        <p className="text-text-secondary text-sm mb-6">此頁面僅限管理員存取。</p>
        <a
          href="/"
          className="px-6 py-2.5 border border-surface-lighter hover:border-brand/40 text-text-secondary hover:text-text-primary rounded-lg font-medium transition-all inline-block"
        >
          回到首頁
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
