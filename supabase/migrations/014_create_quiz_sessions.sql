-- ============================================================
-- Migration 014: 團體班即時測驗（quiz sessions）
-- 用途：開一場課，學員（線上＋實體）用同一組代碼作答，
--       老師在 /admin/quiz-live 看全班程度分佈，當場調整課程內容。
--
-- 設計要點：
--   1. 全匿名——不存姓名/email/user_id，只有瀏覽器產的隨機 participant_id。
--   2. anon 只能 INSERT 作答，不能 SELECT 任何作答（避免被撈原始資料）。
--   3. 場次代碼不可列舉——用 SECURITY DEFINER 函式以 code 換 id，
--      anon 對 quiz_sessions 完全沒有 SELECT 權限。
--   4. 重複作答不覆蓋（免開 UPDATE 權限），由後台依 participant_id 取最新一筆。
-- ============================================================

-- ── 場次 ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_code ON quiz_sessions(code);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_at ON quiz_sessions(created_at DESC);

-- ── 作答 ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_responses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  -- 瀏覽器 localStorage 產生的隨機 UUID，純粹用來去重，不對應任何真實身分
  participant_id TEXT NOT NULL,
  -- { questionId: 選項 index }
  answers JSONB NOT NULL,
  -- { chat: 0.66, documents: 0.33, ... }（各維度得分比例）
  scores JSONB NOT NULL,
  -- 連續解鎖的最高階（1..4）
  primary_level SMALLINT NOT NULL CHECK (primary_level BETWEEN 1 AND 4),
  -- 由低到高第一個未解鎖的維度；NULL = 四維全解鎖
  gap_dimension TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_session
  ON quiz_responses(session_id, participant_id, submitted_at DESC);

-- ── 以代碼換場次（SECURITY DEFINER：讓 anon 不必有 SELECT 權限） ──
CREATE OR REPLACE FUNCTION resolve_quiz_session(p_code TEXT)
RETURNS TABLE (id UUID, title TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.title
  FROM quiz_sessions s
  WHERE upper(s.code) = upper(p_code)
    AND s.status = 'open'
  LIMIT 1;
$$;

-- SECURITY DEFINER 函式預設 grant 給 PUBLIC，先收回再明確授權
REVOKE ALL ON FUNCTION resolve_quiz_session(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION resolve_quiz_session(TEXT) TO anon, authenticated;

-- ── 檢查場次是否開放（給 INSERT policy 用） ─────────────────────
-- 直接在 policy 裡查 quiz_sessions 會被該表的 RLS 擋掉（anon 無 SELECT 權限），
-- 所以包成 SECURITY DEFINER 函式。
CREATE OR REPLACE FUNCTION is_quiz_session_open(p_session UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE id = p_session AND status = 'open'
  );
$$;

REVOKE ALL ON FUNCTION is_quiz_session_open(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_quiz_session_open(UUID) TO anon, authenticated;

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- 場次：只有管理員看得到 / 管得到（anon 一律走 resolve_quiz_session）
CREATE POLICY "quiz_sessions_select_admin" ON quiz_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "quiz_sessions_insert_admin" ON quiz_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "quiz_sessions_update_admin" ON quiz_sessions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "quiz_sessions_delete_admin" ON quiz_sessions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 作答：任何人都能交（限開放中的場次），但誰都不能讀，除了管理員
CREATE POLICY "quiz_responses_insert_open_session" ON quiz_responses
  FOR INSERT WITH CHECK (is_quiz_session_open(session_id));

CREATE POLICY "quiz_responses_select_admin" ON quiz_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "quiz_responses_delete_admin" ON quiz_responses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
