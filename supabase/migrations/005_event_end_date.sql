-- ============================================================
-- Migration 005: Replace event_end_date with duration_hours
-- Simpler approach: store start time + duration instead of
-- separate end time. Duration in hours (e.g. 1, 1.5, 2).
-- ============================================================

-- Remove event_end_date if it was already added
ALTER TABLE events DROP COLUMN IF EXISTS event_end_date;

-- Add duration_hours (nullable — omit = not specified)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(4,1)
    CHECK (duration_hours > 0 AND duration_hours <= 24);
