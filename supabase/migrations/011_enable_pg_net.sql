-- ============================================================
-- Migration 011: Enable pg_net
-- Needed by the event_registrations confirmation webhook (012) to make an
-- async HTTP POST to the send-registration-confirmation edge function.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net;
