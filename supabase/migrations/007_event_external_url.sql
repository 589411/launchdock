-- ============================================================
-- Migration 007: External registration URL for events
-- Lets an event route its registration button to an external
-- form (e.g. Google Form) instead of the native on-site flow.
-- When external_url is set, EventCard renders a link-out button
-- and skips the Google-login → event_registrations → Resend path.
-- Null = native registration (unchanged default behaviour).
-- ============================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS external_url TEXT
    CHECK (external_url IS NULL OR char_length(external_url) <= 1000);
