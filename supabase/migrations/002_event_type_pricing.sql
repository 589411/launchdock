-- ============================================================
-- Migration 002: Event type, pricing, and Google Meet link
-- Adds support for meetup / course / workshop event types,
-- pricing for paid events, and meet link visibility control.
-- ============================================================

-- Events: add type, price, meet link
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'meetup'
    CHECK (event_type IN ('meetup', 'course', 'workshop')),
  ADD COLUMN IF NOT EXISTS price INT NOT NULL DEFAULT 0
    CHECK (price >= 0),
  ADD COLUMN IF NOT EXISTS meet_link TEXT
    CHECK (char_length(meet_link) <= 500);

CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- Registrations: payment tracking for paid events
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (payment_status IN ('not_required', 'pending', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_note TEXT
    CHECK (char_length(payment_note) <= 500);
