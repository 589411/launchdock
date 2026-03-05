import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { MemberRole } from '../lib/supabase-types';

interface Profile {
  display_name: string;
  avatar_url: string | null;
  role: MemberRole;
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let resolved = false;

    const fetchProfile = async (user: User) => {
      const { data } = await supabase
        .from('member_profiles')
        .select('display_name, avatar_url, role')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setProfile(data as Profile);
      } else {
        const meta = user.user_metadata;
        setProfile({
          display_name: meta?.full_name || meta?.name || user.email?.split('@')[0] || '',
          avatar_url: meta?.avatar_url || meta?.picture || null,
          role: 'member',
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          return;
        }

        // For INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED:
        // Only update if session has a user (ignore null-session refreshes)
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        }

        if (!resolved) {
          resolved = true;
          setLoading(false);
        }
      }
    );

    // Fallback timeout in case INITIAL_SESSION never fires
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = () => setMenuOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpen]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setMenuOpen(false);
  };

  if (loading) return null;

  if (!isSupabaseConfigured()) return null;

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary border border-surface-lighter hover:border-brand/40 rounded-lg transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        登入
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-lighter transition-colors"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand/30 flex items-center justify-center text-xs font-bold text-brand-light">
            {(profile?.display_name || user.email || '?')[0].toUpperCase()}
          </div>
        )}
        <span className="text-sm text-text-secondary hidden sm:inline max-w-[100px] truncate">
          {profile?.display_name || user.email?.split('@')[0]}
        </span>
        {profile?.role === 'admin' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand/20 text-brand-light font-medium">
            Admin
          </span>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-surface-lighter rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-lighter">
            <p className="text-sm font-medium text-text-primary truncate">
              {profile?.display_name}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
            {profile?.role === 'admin' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand/20 text-brand-light font-medium mt-1 inline-block">
                管理員
              </span>
            )}
          </div>
          <div className="py-1">
            <a
              href="/events"
              className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors"
            >
              🎟️ 我的活動
            </a>
            {profile?.role === 'admin' && (
              <>
                <a
                  href="/admin/events"
                  className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors"
                >
                  ⚙️ 活動管理
                </a>
                <a
                  href="/admin/members"
                  className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors"
                >
                  👥 會員管理
                </a>
                <a
                  href="/admin/notifications"
                  className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors"
                >
                  📧 通知管理
                </a>
                <a
                  href="/admin/feedback"
                  className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-lighter transition-colors"
                >
                  📊 回饋監控
                </a>
              </>
            )}
          </div>
          <div className="border-t border-surface-lighter py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-lighter transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
