-- ============================================================
-- Migration 001: Auth, Members, Events, Email Logs
-- Run this AFTER the base schema.sql is already applied.
-- Prerequisites: Supabase Auth must be enabled in the dashboard.
-- ============================================================

-- ============================================================
-- 1. Member Profiles (linked to Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) <= 100),
  avatar_url TEXT,
  email TEXT NOT NULL CHECK (char_length(email) <= 320),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  member_since TIMESTAMPTZ DEFAULT now(),
  notification_preferences JSONB DEFAULT '{
    "event_confirmation": true,
    "event_reminder": true,
    "event_update": true,
    "new_article": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id),
  UNIQUE (email)
);

CREATE INDEX idx_member_profiles_user_id ON member_profiles(user_id);
CREATE INDEX idx_member_profiles_role ON member_profiles(role);

-- ============================================================
-- 2. Auto-create profile on new user signup (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.member_profiles (user_id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger: fires after INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 3. Events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  description TEXT CHECK (char_length(description) <= 5000),
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT CHECK (char_length(location) <= 500),
  max_capacity INT CHECK (max_capacity > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  priority_hours INT DEFAULT 0, -- hours of priority registration for members
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);

-- ============================================================
-- 4. Event Registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'waitlist', 'cancelled', 'attended')),
  registered_at TIMESTAMPTZ DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

-- ============================================================
-- 5. Email Logs (track sent notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  email_type TEXT NOT NULL CHECK (email_type IN (
    'registration_confirmation',
    'event_reminder',
    'event_update',
    'new_article'
  )),
  subject TEXT NOT NULL,
  event_id UUID REFERENCES events(id),
  article_slug TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  resend_id TEXT, -- Resend API message ID
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- ============================================================
-- 6. Helper: get registration count for an event
-- ============================================================
CREATE OR REPLACE FUNCTION get_event_registration_count(event_id_input UUID)
RETURNS INT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::int
  FROM event_registrations
  WHERE event_id = event_id_input
    AND status IN ('registered', 'attended');
$$;

-- ============================================================
-- 7. Helper: check if event is in priority period (members only)
-- ============================================================
CREATE OR REPLACE FUNCTION is_priority_period(event_id_input UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM events
    WHERE id = event_id_input
      AND priority_hours > 0
      AND created_at + (priority_hours || ' hours')::interval > now()
  );
$$;

-- ============================================================
-- 8. Updated timestamp trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER member_profiles_updated_at
  BEFORE UPDATE ON member_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- member_profiles: users can read/update their own; admins can read all
CREATE POLICY "member_profiles_select_own" ON member_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "member_profiles_select_public" ON member_profiles
  FOR SELECT USING (true)  -- allow reading display_name/avatar for badges
;

CREATE POLICY "member_profiles_update_own" ON member_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT role FROM member_profiles WHERE user_id = auth.uid())  -- can't self-promote
  );

-- events: anyone can read published events; admins can CRUD
CREATE POLICY "events_select_published" ON events
  FOR SELECT USING (status = 'published' OR status = 'completed');

CREATE POLICY "events_select_admin" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "events_insert_admin" ON events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "events_update_admin" ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "events_delete_admin" ON events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- event_registrations: users can read/insert/update their own; admins can read all
CREATE POLICY "event_registrations_select_own" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "event_registrations_select_admin" ON event_registrations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "event_registrations_insert" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_registrations_update_own" ON event_registrations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_registrations_update_admin" ON event_registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- email_logs: admins only
CREATE POLICY "email_logs_select_admin" ON email_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "email_logs_insert_service" ON email_logs
  FOR INSERT WITH CHECK (true);  -- Edge Functions use service_role key

-- ============================================================
-- 10. Add user_id to Q&A tables (for member badges)
-- ============================================================
ALTER TABLE qa_questions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE qa_answers   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_qa_questions_user_id ON qa_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_qa_answers_user_id   ON qa_answers(user_id);

-- ============================================================
-- Grant anon access for public event listing (no auth required to browse)
-- ============================================================
CREATE POLICY "events_select_anon" ON events
  FOR SELECT TO anon
  USING (status = 'published' OR status = 'completed');

-- Allow anon to read member display_name/avatar (for badges in Q&A)
CREATE POLICY "member_profiles_select_anon" ON member_profiles
  FOR SELECT TO anon
  USING (true);
