-- ============================================================
-- Migration 010: Create saved_prompts table
-- Backs the "系統提示詞組合器" (prompt builder) save/manage feature.
-- Members (Google login via existing Supabase auth) can save the prompt
-- they assembled, then list / rename / delete / load it back to edit.
--
-- Reuses the existing auth stack (auth.users + member_profiles) — NO Firebase.
-- RLS: strictly owner-only (auth.uid() = user_id), same shape as the rest
-- of the app. A BEFORE INSERT trigger caps each member at 20 saved prompts
-- (Joseph 2026-07-29) — enforced server-side so the client cannot bypass it.
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body TEXT NOT NULL CHECK (char_length(body) <= 10000),
  -- Reload-into-editor state: { who, use, pains:[], roles:[], prefs:[], tune }
  selections JSONB NOT NULL DEFAULT '{}'::jsonb,
  platform TEXT CHECK (platform IS NULL OR platform IN ('claude', 'chatgpt', 'gemini', 'grok')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_prompts_user_id ON saved_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_created_at ON saved_prompts(created_at);

-- ------------------------------------------------------------
-- Row Level Security: owner-only for every operation
-- ------------------------------------------------------------
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_prompts_select_own" ON saved_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_prompts_insert_own" ON saved_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_prompts_update_own" ON saved_prompts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_prompts_delete_own" ON saved_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Keep updated_at fresh (reuse existing helper from migration 001,
-- search_path already pinned in migration 006)
-- ------------------------------------------------------------
CREATE TRIGGER saved_prompts_updated_at
  BEFORE UPDATE ON saved_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- Cap: max 20 saved prompts per member (Joseph 2026-07-29).
-- Enforced in the database so it holds regardless of client.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_saved_prompts_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.saved_prompts WHERE user_id = NEW.user_id) >= 20 THEN
    RAISE EXCEPTION 'saved_prompts limit reached (max 20 per member)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER saved_prompts_enforce_limit
  BEFORE INSERT ON saved_prompts
  FOR EACH ROW EXECUTE FUNCTION enforce_saved_prompts_limit();

-- Trigger functions are invoked by the trigger, not via the REST API. Revoke
-- EXECUTE so it can't be called as an RPC (keeps the 006 hardening posture;
-- clears the anon/authenticated SECURITY DEFINER advisor WARN).
REVOKE EXECUTE ON FUNCTION public.enforce_saved_prompts_limit() FROM anon, authenticated, public;

-- Everything else denied by default (no policy = no access).
