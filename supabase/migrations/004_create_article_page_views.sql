-- ============================================================
-- Migration 004: Create article_page_views table
-- Required by PopularArticles / PopularArticlesHome / PageViewTracker
-- ============================================================

CREATE TABLE IF NOT EXISTS article_page_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL,
  fingerprint TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_page_views_slug ON article_page_views(slug);
CREATE INDEX IF NOT EXISTS idx_article_page_views_created_at ON article_page_views(created_at);

ALTER TABLE article_page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for popular article ranking)
CREATE POLICY "article_page_views_select" ON article_page_views
  FOR SELECT USING (true);

-- Anyone can insert (page view tracking)
CREATE POLICY "article_page_views_insert" ON article_page_views
  FOR INSERT WITH CHECK (true);
