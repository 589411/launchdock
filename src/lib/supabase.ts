import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let _client: SupabaseClient<Database> | null = null;

/**
 * Lazy-initialized Supabase client.
 * Only creates the client when actually used (avoids build-time errors).
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    if (!_client) {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }
      _client = createClient<Database>(supabaseUrl, supabaseAnonKey);
    }
    return (_client as any)[prop];
  },
});

/**
 * Check if Supabase is properly configured.
 * Falls back to localStorage when not configured.
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
