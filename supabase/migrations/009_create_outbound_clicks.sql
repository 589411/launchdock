-- ============================================================
-- Migration 009: Create outbound_clicks table
-- Tracks clicks from the main site out to the ecosystem tool apps
-- (lab.launchdock.app / masters.launchdock.app) so we can measure
-- how much traffic each on-site entry point funnels to the subdomains.
-- Purely additive; same anon-insert pattern as 004 (article_page_views).
-- ============================================================

CREATE TABLE IF NOT EXISTS outbound_clicks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  target TEXT NOT NULL,       -- 'lab' | 'masters'
  placement TEXT,             -- 'home-card' | 'header' | 'header-mobile' | 'footer'
  fingerprint TEXT,
  referrer TEXT,
  path TEXT,                  -- page the click happened on
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outbound_clicks_target ON outbound_clicks(target);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_created_at ON outbound_clicks(created_at);

ALTER TABLE outbound_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for the admin funnel dashboard)
CREATE POLICY "outbound_clicks_select" ON outbound_clicks
  FOR SELECT USING (true);

-- Anyone can insert (anonymous click tracking, same as page views)
CREATE POLICY "outbound_clicks_insert" ON outbound_clicks
  FOR INSERT WITH CHECK (true);
