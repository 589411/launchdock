-- ============================================================
-- Migration 012: Registration-confirmation webhook
-- On every event_registrations INSERT, async-POST the row to the
-- send-registration-confirmation edge function (which emails the registrant
-- their confirmation + Meet link via Resend). Wrapped in an exception guard so
-- a notification hiccup can never block/fail the registration itself.
-- ============================================================

CREATE OR REPLACE FUNCTION public.on_event_registration_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://lxudxtpfenotkpgmhomq.supabase.co/functions/v1/send-registration-confirmation',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
  EXCEPTION WHEN OTHERS THEN
    -- never block a registration just because the notification enqueue failed
    NULL;
  END;
  RETURN NEW;
END;
$$;

-- Trigger functions run via the trigger, not the REST API — revoke EXECUTE.
REVOKE EXECUTE ON FUNCTION public.on_event_registration_notify() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS event_registration_confirmation ON event_registrations;
CREATE TRIGGER event_registration_confirmation
  AFTER INSERT ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.on_event_registration_notify();
