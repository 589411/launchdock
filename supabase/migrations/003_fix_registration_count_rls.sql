-- ============================================================
-- Migration 003: Fix registration count for anonymous/non-admin users
-- The original get_event_registration_count() runs under caller's
-- RLS context, so anon users get 0. Recreate as SECURITY DEFINER
-- so it can count registrations regardless of who calls it.
-- ============================================================

-- Drop and recreate with SECURITY DEFINER
DROP FUNCTION IF EXISTS get_event_registration_count(UUID);

CREATE OR REPLACE FUNCTION get_event_registration_count(event_id_input UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM event_registrations
  WHERE event_id = event_id_input
    AND status IN ('registered', 'attended');
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_event_registration_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_event_registration_count(UUID) TO authenticated;
