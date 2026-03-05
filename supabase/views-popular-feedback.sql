-- ============================================================
-- LaunchDock: Popular Articles & Feedback Monitoring Views
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- 1. 熱門文章排行（依 reaction 加權分數排序）
-- 🚀 = 3pt, 👍 = 2pt, 😵 = 1pt, 😢 = 1pt
-- ============================================================
CREATE OR REPLACE VIEW v_popular_articles AS
SELECT
  slug,
  COUNT(*) FILTER (WHERE reaction_type = 'rocket') AS rocket_count,
  COUNT(*) FILTER (WHERE reaction_type = 'like')   AS like_count,
  COUNT(*) FILTER (WHERE reaction_type = 'stuck')  AS stuck_count,
  COUNT(*) FILTER (WHERE reaction_type = 'cry')    AS cry_count,
  COUNT(*)                                          AS total_reactions,
  -- Weighted score: engagement-focused (positive > negative, but all count)
  (COUNT(*) FILTER (WHERE reaction_type = 'rocket') * 3 +
   COUNT(*) FILTER (WHERE reaction_type = 'like')   * 2 +
   COUNT(*) FILTER (WHERE reaction_type = 'stuck')  * 1 +
   COUNT(*) FILTER (WHERE reaction_type = 'cry')    * 1
  ) AS popularity_score
FROM article_reactions
GROUP BY slug
ORDER BY popularity_score DESC;

-- 2. 卡關/哭哭警報 — 文章層級
-- 顯示每篇文章的負面回饋比例
-- ============================================================
CREATE OR REPLACE VIEW v_article_distress AS
SELECT
  slug,
  COUNT(*) AS total_reactions,
  COUNT(*) FILTER (WHERE reaction_type = 'stuck')  AS stuck_count,
  COUNT(*) FILTER (WHERE reaction_type = 'cry')    AS cry_count,
  COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry')) AS distress_count,
  ROUND(
    COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry'))::numeric /
    NULLIF(COUNT(*), 0) * 100, 1
  ) AS distress_pct
FROM article_reactions
GROUP BY slug
HAVING COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry')) > 0
ORDER BY distress_pct DESC, distress_count DESC;

-- 3. 卡關/哭哭警報 — 段落層級（section）
-- 顯示哪些段落讓人卡關最多
-- ============================================================
CREATE OR REPLACE VIEW v_section_distress AS
SELECT
  slug,
  section_id,
  COUNT(*) AS total_reactions,
  COUNT(*) FILTER (WHERE reaction_type = 'stuck')  AS stuck_count,
  COUNT(*) FILTER (WHERE reaction_type = 'cry')    AS cry_count,
  COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry')) AS distress_count,
  ROUND(
    COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry'))::numeric /
    NULLIF(COUNT(*), 0) * 100, 1
  ) AS distress_pct
FROM section_reactions
GROUP BY slug, section_id
HAVING COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry')) > 0
ORDER BY distress_count DESC, distress_pct DESC;

-- 4. 最近 7 天的卡關趨勢（每日彙總）
-- ============================================================
CREATE OR REPLACE VIEW v_distress_trend_7d AS
SELECT
  slug,
  DATE(created_at) AS day,
  COUNT(*) FILTER (WHERE reaction_type = 'stuck')  AS stuck_count,
  COUNT(*) FILTER (WHERE reaction_type = 'cry')    AS cry_count,
  COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry')) AS distress_count
FROM article_reactions
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND reaction_type IN ('stuck', 'cry')
GROUP BY slug, DATE(created_at)
ORDER BY day DESC, distress_count DESC;

-- 5. 熱門文章排行（依瀏覽量排序，結合 reaction 加分）
-- ============================================================
CREATE OR REPLACE VIEW v_popular_by_views AS
SELECT
  pv.slug,
  pv.total_views,
  pv.unique_views,
  pv.views_7d,
  COALESCE(ar.total_reactions, 0) AS total_reactions,
  COALESCE(ar.popularity_score, 0) AS reaction_score,
  -- Combined score: views + reaction bonus
  (pv.total_views + COALESCE(ar.popularity_score, 0) * 5) AS combined_score
FROM (
  SELECT
    slug,
    COUNT(*) AS total_views,
    COUNT(DISTINCT fingerprint) AS unique_views,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS views_7d
  FROM article_page_views
  GROUP BY slug
) pv
LEFT JOIN v_popular_articles ar ON ar.slug = pv.slug
ORDER BY combined_score DESC;

-- 5. RPC: 取得熱門文章排行（供前端呼叫）
-- ============================================================
CREATE OR REPLACE FUNCTION get_popular_articles(limit_count INT DEFAULT 20)
RETURNS TABLE(
  slug TEXT,
  rocket_count BIGINT,
  like_count BIGINT,
  stuck_count BIGINT,
  cry_count BIGINT,
  total_reactions BIGINT,
  popularity_score BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    slug,
    COUNT(*) FILTER (WHERE reaction_type = 'rocket') AS rocket_count,
    COUNT(*) FILTER (WHERE reaction_type = 'like')   AS like_count,
    COUNT(*) FILTER (WHERE reaction_type = 'stuck')  AS stuck_count,
    COUNT(*) FILTER (WHERE reaction_type = 'cry')    AS cry_count,
    COUNT(*)                                          AS total_reactions,
    (COUNT(*) FILTER (WHERE reaction_type = 'rocket') * 3 +
     COUNT(*) FILTER (WHERE reaction_type = 'like')   * 2 +
     COUNT(*) FILTER (WHERE reaction_type = 'stuck')  * 1 +
     COUNT(*) FILTER (WHERE reaction_type = 'cry')    * 1
    ) AS popularity_score
  FROM article_reactions
  GROUP BY slug
  ORDER BY popularity_score DESC
  LIMIT limit_count;
$$;

-- 6. RPC: 取得卡關警報（供管理後台呼叫）
-- ============================================================
CREATE OR REPLACE FUNCTION get_distress_alerts(
  min_distress_count INT DEFAULT 2,
  min_distress_pct NUMERIC DEFAULT 30.0
)
RETURNS TABLE(
  slug TEXT,
  total_reactions BIGINT,
  stuck_count BIGINT,
  cry_count BIGINT,
  distress_count BIGINT,
  distress_pct NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    slug,
    COUNT(*) AS total_reactions,
    COUNT(*) FILTER (WHERE reaction_type = 'stuck')  AS stuck_count,
    COUNT(*) FILTER (WHERE reaction_type = 'cry')    AS cry_count,
    COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry')) AS distress_count,
    ROUND(
      COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry'))::numeric /
      NULLIF(COUNT(*), 0) * 100, 1
    ) AS distress_pct
  FROM article_reactions
  GROUP BY slug
  HAVING
    COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry')) >= min_distress_count
    OR ROUND(
      COUNT(*) FILTER (WHERE reaction_type IN ('stuck', 'cry'))::numeric /
      NULLIF(COUNT(*), 0) * 100, 1
    ) >= min_distress_pct
  ORDER BY distress_pct DESC, distress_count DESC;
$$;

-- 7. RPC: 取得段落層級卡關詳情
-- ============================================================
CREATE OR REPLACE FUNCTION get_section_distress(target_slug TEXT DEFAULT NULL)
RETURNS TABLE(
  slug TEXT,
  section_id TEXT,
  total_reactions BIGINT,
  stuck_count BIGINT,
  cry_count BIGINT,
  distress_count BIGINT,
  distress_pct NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    sr.slug,
    sr.section_id,
    COUNT(*) AS total_reactions,
    COUNT(*) FILTER (WHERE sr.reaction_type = 'stuck')  AS stuck_count,
    COUNT(*) FILTER (WHERE sr.reaction_type = 'cry')    AS cry_count,
    COUNT(*) FILTER (WHERE sr.reaction_type IN ('stuck', 'cry')) AS distress_count,
    ROUND(
      COUNT(*) FILTER (WHERE sr.reaction_type IN ('stuck', 'cry'))::numeric /
      NULLIF(COUNT(*), 0) * 100, 1
    ) AS distress_pct
  FROM section_reactions sr
  WHERE (target_slug IS NULL OR sr.slug = target_slug)
  GROUP BY sr.slug, sr.section_id
  HAVING COUNT(*) FILTER (WHERE sr.reaction_type IN ('stuck', 'cry')) > 0
  ORDER BY distress_count DESC;
$$;
