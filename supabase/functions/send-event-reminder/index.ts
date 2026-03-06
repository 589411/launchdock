// supabase/functions/send-event-reminder/index.ts
// Triggered by pg_cron or manual invocation
// Sends reminders to all registered users for events happening in 3 days or 1 day

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail } from '../_shared/resend.ts';
import { emailTemplate } from '../_shared/email-template.ts';

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find events happening in 1 day or 3 days
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Events in ~1 day (24h ± 12h window)
    const { data: events } = await supabase
      .from('events')
      .select('id, title, event_date, location')
      .eq('status', 'published')
      .gte('event_date', now.toISOString())
      .lte('event_date', threeDaysLater.toISOString());

    if (!events?.length) {
      return new Response(JSON.stringify({ message: 'No upcoming events to remind', sent_count: 0 }));
    }

    let sentCount = 0;

    for (const event of events) {
      const eventDate = new Date(event.event_date);
      const hoursUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Only send at ~72h (3 days) or ~24h (1 day) windows
      const isThreeDayReminder = hoursUntil >= 60 && hoursUntil <= 84;
      const isOneDayReminder = hoursUntil >= 12 && hoursUntil <= 36;

      if (!isThreeDayReminder && !isOneDayReminder) continue;

      const reminderType = isOneDayReminder ? '明天' : '3 天後';

      // Get all registered users for this event
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('user_id')
        .eq('event_id', event.id)
        .in('status', ['registered']);

      if (!registrations?.length) continue;

      const userIds = registrations.map(r => r.user_id);

      // Get profiles with event_reminder enabled
      const { data: profiles } = await supabase
        .from('member_profiles')
        .select('user_id, display_name, email, notification_preferences')
        .in('user_id', userIds);

      if (!profiles) continue;

      const dateStr = eventDate.toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
      });
      const timeStr = eventDate.toLocaleTimeString('zh-TW', {
        hour: '2-digit', minute: '2-digit',
      });

      for (const profile of profiles) {
        // Check notification preference
        const prefs = profile.notification_preferences as Record<string, boolean>;
        if (prefs && prefs.event_reminder === false) continue;

        // Check if we already sent a reminder for this event+type+user
        const { count } = await supabase
          .from('email_logs')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_user_id', profile.user_id)
          .eq('event_id', event.id)
          .eq('email_type', 'event_reminder')
          .gte('created_at', new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString());

        if (count && count > 0) continue; // Already sent recently

        const html = emailTemplate({
          title: `⏰ 活動提醒：${reminderType}就是 ${event.title}！`,
          preheader: `${event.title} 將在${reminderType}舉行`,
          body: `
            <p>嗨 ${profile.display_name}！</p>
            <p>提醒你，你報名的活動就在<strong>${reminderType}</strong>：</p>
            <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0; font-size: 16px; color: #f1f5f9; font-weight: 600;">${event.title}</p>
              <p style="margin: 4px 0; font-size: 13px;">📅 ${dateStr} ${timeStr}</p>
              ${event.location ? `<p style="margin: 4px 0; font-size: 13px;">📍 ${event.location}</p>` : ''}
            </div>
            <p>期待見到你！🦆</p>
          `,
          ctaText: '查看活動',
          ctaUrl: 'https://launchdock.app/events',
        });

        const result = await sendEmail({
          to: profile.email,
          subject: `⏰ ${reminderType}活動提醒：${event.title} — 藍鴨 LaunchDock`,
          html,
        });

        await supabase.from('email_logs').insert({
          recipient_email: profile.email,
          recipient_user_id: profile.user_id,
          email_type: 'event_reminder',
          subject: `⏰ ${reminderType}活動提醒：${event.title}`,
          event_id: event.id,
          status: result.ok ? 'sent' : 'failed',
          resend_id: result.resendId || null,
          error_message: result.error || null,
        });

        if (result.ok) sentCount++;
      }
    }

    return new Response(JSON.stringify({ ok: true, sent_count: sentCount }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
