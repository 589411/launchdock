-- ============================================================
-- Migration 018: 藍鴨Gemini陪跑營 報名與優惠碼
-- ⚠️ 尚未套用到任何遠端專案。上線前須 Joseph 同意。
--
-- 設計要點：
--   1. 優惠碼每組獨立：各自的有效期限、可用次數（預設 5 次）、已用次數。
--   2. 折扣只在後端算，前端送的金額一律忽略。
--   3. 兩張表都 ENABLE RLS，且不建立任何 policy、撤銷 anon/authenticated 權限。
--      → 前端完全碰不到優惠碼與報名名單，只走 Edge Function（service role）。
--   4. 兌換優惠碼用單一 UPDATE 完成「檢查＋扣次數」，避免併發時超用。
--   5. 優惠碼本身不寫進 repo，由 Joseph 在 Supabase SQL Editor 新增（見 docs/gemini-camp-registration.md）。
-- ============================================================

CREATE TABLE IF NOT EXISTS gemini_camp_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code = upper(code) AND char_length(code) BETWEEN 4 AND 40),
  label TEXT NOT NULL CHECK (char_length(label) <= 60),
  -- 注意：存的是「折扣百分比」，不是折數。6 折 = 40，7 折 = 30，8 折 = 20，免費 = 100。
  percent_off INTEGER NOT NULL CHECK (percent_off BETWEEN 1 AND 100),
  max_uses INTEGER NOT NULL DEFAULT 5 CHECK (max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (used_count <= max_uses)
);

CREATE TABLE IF NOT EXISTS gemini_camp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  email_normalized TEXT NOT NULL CHECK (char_length(email_normalized) BETWEEN 3 AND 254),
  background TEXT NOT NULL CHECK (char_length(background) <= 40),
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'advanced', 'bundle')),
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  coupon_code TEXT CHECK (coupon_code IS NULL OR char_length(coupon_code) <= 40),
  percent_off INTEGER NOT NULL DEFAULT 0 CHECK (percent_off BETWEEN 0 AND 100),
  list_price INTEGER NOT NULL CHECK (list_price > 0),
  final_price INTEGER NOT NULL CHECK (final_price >= 0),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  source TEXT CHECK (source IS NULL OR char_length(source) <= 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gemini_camp_registrations_email
  ON gemini_camp_registrations (email_normalized);

ALTER TABLE gemini_camp_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE gemini_camp_registrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON gemini_camp_coupons FROM anon, authenticated;
REVOKE ALL ON gemini_camp_registrations FROM anon, authenticated;

-- 兌換：成功回傳折扣百分比，失敗（不存在／停用／過期／用完）回傳 NULL。
CREATE OR REPLACE FUNCTION redeem_gemini_camp_coupon(p_code TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_percent INTEGER;
BEGIN
  UPDATE gemini_camp_coupons
     SET used_count = used_count + 1
   WHERE code = upper(trim(p_code))
     AND active
     AND used_count < max_uses
     AND expires_at > now()
  RETURNING percent_off INTO v_percent;
  RETURN v_percent;
END;
$$;

-- 報名寫入失敗時歸還次數，避免白白燒掉優惠碼。
CREATE OR REPLACE FUNCTION release_gemini_camp_coupon(p_code TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE gemini_camp_coupons
     SET used_count = GREATEST(used_count - 1, 0)
   WHERE code = upper(trim(p_code));
$$;

REVOKE EXECUTE ON FUNCTION redeem_gemini_camp_coupon(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION release_gemini_camp_coupon(TEXT) FROM PUBLIC, anon, authenticated;
