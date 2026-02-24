-- LaunchDock Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- 1. Article-level reactions (🚀👍😵😢)
CREATE TABLE IF NOT EXISTS article_reactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('rocket', 'like', 'stuck', 'cry')),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- One reaction per fingerprint per article
  UNIQUE (slug, fingerprint)
);

CREATE INDEX idx_article_reactions_slug ON article_reactions(slug);

-- 2. Section-level reactions (👍😵😢 per h2)
CREATE TABLE IF NOT EXISTS section_reactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL,
  section_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'stuck', 'cry')),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- One reaction per fingerprint per section
  UNIQUE (slug, section_id, fingerprint)
);

CREATE INDEX idx_section_reactions_slug_section ON section_reactions(slug, section_id);

-- 3. Q&A Questions
CREATE TABLE IF NOT EXISTS qa_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  section_id TEXT,
  section_title TEXT,
  question TEXT NOT NULL CHECK (char_length(question) <= 1000),
  fingerprint TEXT NOT NULL,
  status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qa_questions_slug ON qa_questions(slug);
CREATE INDEX idx_qa_questions_status ON qa_questions(status);

-- 4. Q&A Answers
CREATE TABLE IF NOT EXISTS qa_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (char_length(answer) <= 2000),
  fingerprint TEXT NOT NULL,
  helpful_count INT DEFAULT 0,
  status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qa_answers_question ON qa_answers(question_id);
CREATE INDEX idx_qa_answers_status ON qa_answers(status);

-- 5. Helpful votes (prevents double-voting)
CREATE TABLE IF NOT EXISTS qa_helpful_votes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES qa_answers(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (answer_id, fingerprint)
);

-- ============================================================
-- RPC: Atomic helpful vote increment
-- ============================================================
CREATE OR REPLACE FUNCTION increment_helpful(
  answer_id_input UUID,
  fingerprint_input TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  -- Try to insert the vote (fails if already voted due to UNIQUE constraint)
  INSERT INTO qa_helpful_votes (answer_id, fingerprint)
  VALUES (answer_id_input, fingerprint_input);

  -- Increment the denormalized count
  UPDATE qa_answers
  SET helpful_count = helpful_count + 1
  WHERE id = answer_id_input
  RETURNING helpful_count INTO new_count;

  RETURN new_count;
EXCEPTION
  WHEN unique_violation THEN
    -- Already voted — just return current count
    SELECT helpful_count INTO new_count
    FROM qa_answers
    WHERE id = answer_id_input;
    RETURN new_count;
END;
$$;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_helpful_votes ENABLE ROW LEVEL SECURITY;

-- article_reactions: anyone can read, anyone can insert (one per fp+slug)
CREATE POLICY "article_reactions_select" ON article_reactions
  FOR SELECT USING (true);
CREATE POLICY "article_reactions_insert" ON article_reactions
  FOR INSERT WITH CHECK (true);

-- section_reactions: anyone can read, anyone can insert (one per fp+slug+section)
CREATE POLICY "section_reactions_select" ON section_reactions
  FOR SELECT USING (true);
CREATE POLICY "section_reactions_insert" ON section_reactions
  FOR INSERT WITH CHECK (true);

-- qa_questions: anyone can read visible, anyone can insert
CREATE POLICY "qa_questions_select" ON qa_questions
  FOR SELECT USING (status = 'visible');
CREATE POLICY "qa_questions_insert" ON qa_questions
  FOR INSERT WITH CHECK (
    status IS NULL OR status = 'visible'
  );

-- qa_answers: anyone can read visible, anyone can insert
CREATE POLICY "qa_answers_select" ON qa_answers
  FOR SELECT USING (status = 'visible');
CREATE POLICY "qa_answers_insert" ON qa_answers
  FOR INSERT WITH CHECK (
    status IS NULL OR status = 'visible'
  );

-- qa_helpful_votes: anyone can read/insert (UNIQUE constraint prevents dupes)
CREATE POLICY "qa_helpful_votes_select" ON qa_helpful_votes
  FOR SELECT USING (true);
CREATE POLICY "qa_helpful_votes_insert" ON qa_helpful_votes
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- Rate limiting via database (optional, belt-and-suspenders)
-- These functions can be called in RLS policies for extra protection.
-- ============================================================

-- Helper: count recent actions by fingerprint
CREATE OR REPLACE FUNCTION recent_action_count(
  table_name TEXT,
  fp TEXT,
  window_minutes INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cnt INT;
BEGIN
  EXECUTE format(
    'SELECT count(*)::int FROM %I WHERE fingerprint = $1 AND created_at > now() - interval ''%s minutes''',
    table_name, window_minutes
  ) INTO cnt USING fp;
  RETURN cnt;
END;
$$;

-- ============================================================
-- Admin: manually hide/flag content
-- ============================================================
-- Usage: UPDATE qa_questions SET status = 'hidden' WHERE id = '...';
-- Usage: UPDATE qa_answers SET status = 'flagged' WHERE id = '...';
