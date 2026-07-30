-- ============================================================
-- Migration 013: Restore get_event_registration_count to SECURITY DEFINER
-- Migration 006 (security hardening) flipped this read-only fn to INVOKER.
-- But it's meant to return the PUBLIC total registration count for an event
-- (shown on the event card as "N 人已報名"). Under INVOKER it runs with the
-- caller's RLS, so anon/other users only see their own registrations and the
-- count reads 0 — breaking the card. It returns only an integer count (no row
-- data), so DEFINER is safe here; search_path stays pinned.
-- (Advisor will flag anon-executable SECURITY DEFINER — by-design, same as
--  increment_helpful.)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_event_registration_count(event_id_input uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::int
  FROM event_registrations
  WHERE event_id = event_id_input
    AND status IN ('registered', 'attended');
$function$;
