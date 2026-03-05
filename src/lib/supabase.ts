import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js';
import type { Database } from './supabase-types';
import type { MemberRole } from './supabase-types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let _client: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (!_client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured');
    }
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

/**
 * Lazy-initialized Supabase client.
 * Only creates the client when actually used (avoids build-time errors).
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});

/**
 * Check if Supabase is properly configured.
 * Falls back to localStorage when not configured.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// ============================================================
// Auth helpers
// ============================================================

/** Get current session via onAuthStateChange (getSession() may hang) */
export function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        subscription.unsubscribe();
        resolve(session);
      }
    );
    // Timeout fallback
    setTimeout(() => {
      subscription.unsubscribe();
      resolve(null);
    }, 5000);
  });
}

/** Get current user (null if not logged in) */
export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/** Sign in with Google OAuth via PKCE (works in static sites) */
export async function signInWithGoogle(redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
}

/** Sign out */
export async function signOut() {
  return supabase.auth.signOut();
}

/** Get member profile for the current user */
export async function getMemberProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  return data;
}

/** Check if current user has admin role */
export async function isAdmin(): Promise<boolean> {
  const profile = await getMemberProfile();
  return profile?.role === 'admin';
}

/** Get member profile by user_id (for badges in Q&A) */
export async function getMemberProfileByUserId(userId: string) {
  const { data } = await supabase
    .from('member_profiles')
    .select('display_name, avatar_url, role')
    .eq('user_id', userId)
    .single();
  return data;
}
