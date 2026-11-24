-- ============================================================
-- Migration 017: 藍鴨週報訂閱名單與寄送紀錄
-- ⚠️ 尚未套用到任何遠端專案。上線前須 Joseph 同意（見 docs/newsletter-subscribe.md）。
--
-- 設計要點：
--   1. list 欄位區分名單。目前公開訂閱只寫 'weekly'（藍鴨週報）。
--      'daily' 僅預留欄位，不得做成公開訂閱（每日 X 摘要是 Joseph 私人 Telegram）。
--   2. 同一信箱可存在不同 list；unique 是 (email_normalized, list)。
--   3. 兩張表都 ENABLE RLS，且「不建立任何 policy」＋撤銷 anon/authenticated 權限。
--      → 前端（anon key）完全碰不到名單與 token；所有讀寫只走 Edge Function（service role）。
--   4. 雙重確認：pending → confirmed；退訂 → unsubscribed；退訂後重訂回 pending。
--   5. token 由 Edge Function 以 32 bytes 隨機值（64 hex）產生，這裡只做長度檢查。
--   6. newsletter_sends 以 (subscriber_id, send_date) 唯一，避免同一天同一人重寄。
--   7. 不使用 member_profiles，也不從會員或活動報名自動加入。
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  email_normalized TEXT NOT NULL CHECK (char_length(email_normalized) BETWEEN 3 AND 254),
  list TEXT NOT NULL DEFAULT 'weekly'
    CHECK (list IN ('weekly', 'daily')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token TEXT NOT NULL UNIQUE CHECK (char_length(confirm_token) >= 32),
  unsubscribe_token TEXT NOT NULL UNIQUE CHECK (char_length(unsubscribe_token) >= 32),
  confirm_token_expires_at TIMESTAMPTZ,
  last_confirm_sent_at TIMESTAMPTZ,
  -- home / footer / subscribe_page / article
  source TEXT CHECK (source IS NULL OR char_length(source) <= 40),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email_normalized, list)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status_list
  ON newsletter_subscribers (list, status);

CREATE TABLE IF NOT EXISTS newsletter_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  send_date DATE NOT NULL,
  subject TEXT,
  provider_message_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('dry_run', 'sent', 'failed', 'skipped')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subscriber_id, send_date)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_date
  ON newsletter_sends (send_date);

CREATE OR REPLACE FUNCTION newsletter_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER trg_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION newsletter_set_updated_at();

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON newsletter_subscribers FROM anon, authenticated;
REVOKE ALL ON newsletter_sends FROM anon, authenticated;
