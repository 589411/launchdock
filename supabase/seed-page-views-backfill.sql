-- ============================================================
-- Backfill: article_page_views
-- Based on Cloudflare analytics (Feb 4 – Mar 6, 2026)
-- 1.91k unique visitors, 40.18k requests → ~3,400 article views
--
-- Traffic pattern: exponential growth toward Mar 6
-- Fingerprint pool: ~1,900 unique visitors (matching CF data)
-- ============================================================

-- Safety: only run if table is nearly empty (< 50 rows)
DO $$
BEGIN
  IF (SELECT count(*) FROM article_page_views) >= 50 THEN
    RAISE EXCEPTION 'article_page_views already has >= 50 rows, skipping backfill';
  END IF;
END $$;

INSERT INTO article_page_views (slug, fingerprint, referrer, created_at)
SELECT
  a.slug,
  -- Pool of ~1,900 unique fingerprints so COUNT(DISTINCT fingerprint) is realistic
  'bf-' || md5((floor(random() * 1900) + 1)::text || 'launchdock-seed'),
  -- Referrer distribution: ~40% Google, ~60% direct/other
  CASE floor(random() * 10)::int
    WHEN 0 THEN 'https://www.google.com/'
    WHEN 1 THEN 'https://www.google.com/'
    WHEN 2 THEN 'https://www.google.com.tw/'
    WHEN 3 THEN 'https://www.google.com.tw/'
    ELSE NULL
  END,
  -- Timestamps weighted toward recent dates (matches CF growth curve)
  -- random()^0.4 biases toward 1.0 → more views near Mar 6
  '2026-02-04 00:00:00+08'::timestamptz
    + ((random() ^ 0.4) * 30.0) * interval '1 day'
    + (random() * interval '23 hours 59 minutes')
FROM (
  VALUES
    -- Tier 1: Entry points (highest traffic)
    ('why-openclaw',              320),
    ('install-openclaw',          260),
    ('llm-guide',                 230),
    ('ai-api-key-guide',          200),
    ('google-api-key-guide',      190),

    -- Tier 2: Core install / setup
    ('install-openclaw-macos',    170),
    ('openclaw-first-run',        160),
    ('install-openclaw-windows',  140),
    ('windows-wsl-guide',         130),
    ('deploy-openclaw-cloud',     125),

    -- Tier 3: Getting started
    ('token-economics',           115),
    ('openclaw-first-skill',      110),
    ('openclaw-model-config',     100),
    ('prompt-engineering',         95),
    ('openclaw-skill',             85),
    ('cli-guide',                  80),

    -- Tier 4: Core features
    ('openclaw-agent',             75),
    ('mcp-protocol',               70),
    ('why-not-windows-openclaw',   65),
    ('ai-tech-evolution',          60),
    ('openclaw-soul',              55),
    ('ollama-openclaw',            55),
    ('telegram-integration',       50),

    -- Tier 5: Knowledge & advanced
    ('rag-explained',              45),
    ('ai-speed-and-opportunity',   45),
    ('ai-agent-memory-guide',      40),
    ('cot-and-reasoning',          35),
    ('pkm-system',                 30),
    ('multi-agent-swarm',          28),
    ('media-guide',                20)
) AS a(slug, cnt),
LATERAL generate_series(1, a.cnt) AS gs(n);
