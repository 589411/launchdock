-- ============================================================
-- Migration 016: 課堂即時投票（class poll）
-- 用途：日晴生活 8/12（Day 3）、8/14（Day 4）課堂上，講師跑完 Colab 得到一個數字後，
--       立刻問全班「這個數字在你那行是多少？」→ 手機點選項 → 投影全班分布 →
--       挑極端值邀請分享。八題編號已印在學員講義上（Q3–Q10），不可更動。
--
-- 設計要點（正本：sunlit-retail-sim/wp9-colab/HANDOFF.md §五之三）：
--   1. **共用 `quiz_sessions`** —— 同一個場次、同一組代碼、同一個 QR。
--      不塞進 `quiz_responses`：那張表的 schema 硬綁 AI 能力測驗
--      （scores / primary_level / gap_dimension 都 NOT NULL），參數題沒有分數也沒有等級。
--   2. 全匿名，anon 只能 INSERT，不能 SELECT 任何作答。
--   3. **不開 UPDATE 權限**（開了 anon 就能改別人的票）。
--      同一人同一題重複投票 = 多插一列，由後台依 participant_id 取最新一筆。
--   4. `poll_active` 掛在場次上，記「現在投影的是哪一題」。
--      學員端**不輪詢**——即時是投影給全班看的，講師口頭喊「請重新整理」即可。
--      （學員端也輪詢的話，一堂課 75 萬次請求。）
--   5. `industry` 業態欄：跨業態對照是這八題的教學核心
--      （「選 1 樣的同學，購物籃分析對你是無效的」），沒有它就只剩一張長條圖。
-- ============================================================

-- ── 場次加「現在投影哪一題」 ──────────────────────────────────
-- 整題（題號 + 題目 + 選項）直接存 JSONB，讓講師能現場打字出新題，
-- 不必為了臨時想問的一句話改程式碼重新部署。
-- 形狀：{ "id": "q3", "text": "你的一張單通常有幾樣東西？", "options": ["1 樣", "2–3 樣", ...] }
ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS poll_active JSONB;

-- ── 投票 ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS poll_responses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  -- 瀏覽器 localStorage 產生的隨機 UUID，純粹用來去重，不對應任何真實身分
  participant_id TEXT NOT NULL CHECK (char_length(participant_id) BETWEEN 1 AND 64),
  -- 題號，如 "q3".."q10"；講師現場出的題為 "adhoc-<timestamp>"
  question_id TEXT NOT NULL CHECK (char_length(question_id) BETWEEN 1 AND 40),
  -- 選項在該題 options 陣列中的位置（0 起算）
  choice_index SMALLINT NOT NULL CHECK (choice_index BETWEEN 0 AND 19),
  -- 選項當下的文字，一起存起來：講師改了題目也不會讓歷史票變成無意義的數字
  choice_text TEXT NOT NULL CHECK (char_length(choice_text) BETWEEN 1 AND 120),
  -- 選填的一句話，講師可匿名念出來（降低分享門檻最有效的一招）
  note TEXT CHECK (note IS NULL OR char_length(note) <= 200),
  -- 業態，學員第一次進來選一次，之後每票都帶著
  industry TEXT CHECK (industry IS NULL OR char_length(industry) <= 40),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poll_responses_session
  ON poll_responses(session_id, question_id, submitted_at DESC);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

-- 投票：任何人都能投（限開放中的場次），但誰都不能讀，除了管理員。
-- is_quiz_session_open() 是 014 就有的 SECURITY DEFINER 函式，直接複用。
CREATE POLICY "poll_responses_insert_open_session" ON poll_responses
  FOR INSERT WITH CHECK (is_quiz_session_open(session_id));

CREATE POLICY "poll_responses_select_admin" ON poll_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "poll_responses_delete_admin" ON poll_responses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM member_profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ── 換代碼時一併告訴學員端「現在投影哪一題」 ──────────────────
-- 回傳欄位有變動，必須先 DROP（CREATE OR REPLACE 不能改 return type）。
-- 既有的 AI 能力測驗（CapabilityQuiz）只讀 id/title/phase，多一欄不影響。
DROP FUNCTION IF EXISTS resolve_quiz_session(TEXT);

CREATE FUNCTION resolve_quiz_session(p_code TEXT)
RETURNS TABLE (id UUID, title TEXT, phase TEXT, poll_active JSONB)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.title, s.phase, s.poll_active
  FROM quiz_sessions s
  WHERE upper(s.code) = upper(p_code)
    AND s.status = 'open'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION resolve_quiz_session(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION resolve_quiz_session(TEXT) TO anon, authenticated;
