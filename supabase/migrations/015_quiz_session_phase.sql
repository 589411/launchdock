-- ============================================================
-- Migration 015: 班級測驗加「課前／課後」兩階段
-- 用途：同一場次、同一組代碼做兩次測驗，產出「這堂課把全班推進多少」的成效對照。
--
-- 設計要點：
--   1. **單一場次雙階段**，不是開兩場——現場只唸一次代碼，配對靠同一個匿名
--      participant_id（同一顆瀏覽器）。老師課後在後台把場次切到 'post'。
--   2. 作答的 phase **不由前端決定**（前端可竄改），改用 BEFORE INSERT trigger
--      直接抄當下場次的 phase，學員端連送都不用送。
--   3. `resolve_quiz_session` 多回傳 phase，讓學員端能顯示「課前測／課後測」。
-- ============================================================

ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'pre'
  CHECK (phase IN ('pre', 'post'));

ALTER TABLE quiz_responses
  ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'pre'
  CHECK (phase IN ('pre', 'post'));

CREATE INDEX IF NOT EXISTS idx_quiz_responses_session_phase
  ON quiz_responses(session_id, phase, participant_id, submitted_at DESC);

-- ── 作答落哪一階段，由伺服器決定 ────────────────────────────
CREATE OR REPLACE FUNCTION set_quiz_response_phase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT s.phase INTO NEW.phase FROM quiz_sessions s WHERE s.id = NEW.session_id;
  IF NEW.phase IS NULL THEN
    NEW.phase := 'pre';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION set_quiz_response_phase() FROM PUBLIC;

DROP TRIGGER IF EXISTS quiz_responses_set_phase ON quiz_responses;
CREATE TRIGGER quiz_responses_set_phase
  BEFORE INSERT ON quiz_responses
  FOR EACH ROW EXECUTE FUNCTION set_quiz_response_phase();

-- ── 換代碼時一併告訴前端現在是哪一階段 ──────────────────────
-- 回傳欄位有變動，必須先 DROP（CREATE OR REPLACE 不能改 return type）
DROP FUNCTION IF EXISTS resolve_quiz_session(TEXT);

CREATE FUNCTION resolve_quiz_session(p_code TEXT)
RETURNS TABLE (id UUID, title TEXT, phase TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.title, s.phase
  FROM quiz_sessions s
  WHERE upper(s.code) = upper(p_code)
    AND s.status = 'open'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION resolve_quiz_session(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION resolve_quiz_session(TEXT) TO anon, authenticated;
