// supabase/functions/send-registration-confirmation/index.ts
// Triggered by Database Webhook on event_registrations INSERT
// Sends a confirmation email to the newly registered user

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail } from '../_shared/resend.ts';
import { emailTemplate } from '../_shared/email-template.ts';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { record } = payload; // Database webhook payload

    if (!record?.event_id || !record?.user_id) {
      return new Response(JSON.stringify({ error: 'Missing event_id or user_id' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch event details
    const { data: event } = await supabase
      .from('events')
      .select('title, event_date, location, description')
      .eq('id', record.event_id)
      .single();

    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('member_profiles')
      .select('display_name, email')
      .eq('user_id', record.user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), { status: 404 });
    }

    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toLocaleDateString('zh-TW', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    });
    const timeStr = eventDate.toLocaleTimeString('zh-TW', {
      hour: '2-digit', minute: '2-digit',
    });

    const html = emailTemplate({
      title: `✅ 報名成功：${event.title}`,
      preheader: `你已成功報名 ${event.title}`,
      body: `
        <p>嗨 ${profile.display_name}！</p>
        <p>你已成功報名以下活動：</p>
        <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 16px; color: #f1f5f9; font-weight: 600;">${event.title}</p>
          <p style="margin: 4px 0; font-size: 13px;">📅 ${dateStr} ${timeStr}</p>
          ${event.location ? `<p style="margin: 4px 0; font-size: 13px;">📍 ${event.location}</p>` : ''}
        </div>
        <p>活動前我們會再用 Email 提醒你，記得關注收件匣！</p>
      `,
      ctaText: '查看活動詳情',
      ctaUrl: 'https://launchdock.app/events',
      footerNote: '如需取消報名，請前往活動頁面操作。',
    });

    const result = await sendEmail({
      to: profile.email,
      subject: `✅ 報名成功：${event.title} — 藍鴨 LaunchDock`,
      html,
    });

    // Log the email
    await supabase.from('email_logs').insert({
      recipient_email: profile.email,
      recipient_user_id: record.user_id,
      email_type: 'registration_confirmation',
      subject: `✅ 報名成功：${event.title}`,
      event_id: record.event_id,
      status: result.ok ? 'sent' : 'failed',
      resend_id: result.resendId || null,
      error_message: result.error || null,
    });

    return new Response(JSON.stringify({ ok: result.ok }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
