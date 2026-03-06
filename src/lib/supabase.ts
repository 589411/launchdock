import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let _client: SupabaseClient<Database> | null = null;
let _authClient: SupabaseClient<Database> | null = null;

/**
 * Read stored access token from Supabase's localStorage directly.
 * This is synchronous — never calls GoTrue, never acquires locks.
 */
function readStoredAccessToken(): string {
  try {
    if (typeof localStorage === 'undefined') return '';
    if (!supabaseUrl) return '';
    const ref = new URL(supabaseUrl).hostname.split('.')[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    const token = parsed?.access_token;
    if (!token) return '';
    // Don't send expired tokens — PostgREST falls back to anon role
    if (parsed?.expires_at && parsed.expires_at * 1000 < Date.now()) return '';
    return token;
  } catch {
    return '';
  }
}

/**
 * Main Supabase client for database/storage queries.
 * Uses `accessToken` option to bypass GoTrue's getSession() entirely,
 * preventing the navigator.locks deadlock that causes queries to hang forever.
 */
function getClient(): SupabaseClient<Database> {
  if (!_client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured');
    }

    _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      // This is the key fix: providing accessToken means _getAccessToken()
      // calls our function directly instead of auth.getSession() → deadlock.
      accessToken: async () => readStoredAccessToken(),
      global: {
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
        },
      },
    });
  }
  return _client;
}

/**
 * Separate auth-only client for signIn/signOut/onAuthStateChange.
 * This client manages sessions (refresh tokens, persistence).
 * It is NOT used for database queries — only for auth operations.
 */
function getAuthClient(): SupabaseClient<Database> {
  if (!_authClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase not configured');
    }

    _authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // No-op lock to prevent navigator.locks deadlock
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
      },
    });
  }
  return _authClient;
}

/**
 * Lazy-initialized Supabase client for database/storage/realtime.
 * Only creates the client when actually used (avoids build-time errors).
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    // Route auth operations to the auth-only client
    if (prop === 'auth') {
      return getAuthClient().auth;
    }
    // Everything else (from, rpc, storage, etc.) uses the data client
    return (getClient() as any)[prop];
  },
});

/**
 * Check if Supabase is properly configured.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// ============================================================
// Auth helpers — avoid supabase.auth.getSession() which can
// deadlock via navigator.locks during token refresh.
// ============================================================

/**
 * Read stored session from Supabase's localStorage directly.
 * This is synchronous and never deadlocks.
 */
export function getStoredSession(): { userId: string; accessToken: string } | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    if (!supabaseUrl) return null;
    const ref = new URL(supabaseUrl).hostname.split('.')[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const userId = parsed?.user?.id;
    const accessToken = parsed?.access_token;
    if (!userId || !accessToken) return null;
    if (parsed?.expires_at && parsed.expires_at * 1000 < Date.now()) return null;
    return { userId, accessToken };
  } catch {
    return null;
  }
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
