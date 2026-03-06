// supabase/functions/send-notification/index.ts
// Admin-triggered notification sender
// Handles: event_update, new_article
// Called from AdminNotifications.tsx

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail } from '../_shared/resend.ts';
import { emailTemplate } from '../_shared/email-template.ts';

Deno.serve(async (req) => {
  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify the caller is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from('member_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
    }

    const body = await req.json();
    const { type, subject, message, event_id, article_slug } = body;

    if (!type || !subject) {
      return new Response(JSON.stringify({ error: 'Missing type or subject' }), { status: 400 });
    }

    // Determine notification preference key
    const prefKey = type === 'new_article' ? 'new_article' : 'event_update';

    // Get all members with this notification enabled
    const { data: members } = await supabase
      .from('member_profiles')
      .select('user_id, display_name, email, notification_preferences');

    if (!members?.length) {
      return new Response(JSON.stringify({ ok: true, sent_count: 0, message: 'No members' }));
    }

    // For event_update: only notify registered users
    let targetMembers = members;
    if (type === 'event_update' && event_id) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('user_id')
        .eq('event_id', event_id)
        .in('status', ['registered', 'attended']);

      if (registrations) {
        const regUserIds = new Set(registrations.map(r => r.user_id));
        targetMembers = members.filter(m => regUserIds.has(m.user_id));
      }
    }

    // Filter by notification preference
    targetMembers = targetMembers.filter(m => {
      const prefs = m.notification_preferences as Record<string, boolean>;
      return prefs?.[prefKey] !== false; // default opt-in
    });

    let sentCount = 0;

    // Build email content
    let emailBody = '';
    if (type === 'new_article' && article_slug) {
      emailBody = `
        <p>藍鴨有新教學文章上架了！</p>
        ${message ? `<p>${message}</p>` : ''}
      `;
    } else if (type === 'event_update') {
      let eventInfo = '';
      if (event_id) {
        const { data: event } = await supabase
          .from('events')
          .select('title, event_date, location, status')
          .eq('id', event_id)
          .single();

        if (event) {
          const dateStr = new Date(event.event_date).toLocaleDateString('zh-TW', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
          });
          eventInfo = `
            <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0; font-size: 16px; color: #f1f5f9; font-weight: 600;">${event.title}</p>
              <p style="margin: 4px 0; font-size: 13px;">📅 ${dateStr}</p>
              ${event.location ? `<p style="margin: 4px 0; font-size: 13px;">📍 ${event.location}</p>` : ''}
              ${event.status === 'cancelled' ? '<p style="margin: 4px 0; font-size: 13px; color: #f87171;">⚠️ 此活動已取消</p>' : ''}
            </div>
          `;
        }
      }
      emailBody = `
        <p>你報名的活動有異動：</p>
        ${eventInfo}
        ${message ? `<p>${message}</p>` : ''}
      `;
    }

    for (const member of targetMembers) {
      const html = emailTemplate({
        title: subject,
        preheader: subject,
        body: `<p>嗨 ${member.display_name}！</p>${emailBody}`,
        ctaText: type === 'new_article' ? '閱讀新文章' : '查看活動',
        ctaUrl: type === 'new_article' && article_slug
          ? `https://launchdock.app/articles/${article_slug}`
          : 'https://launchdock.app/events',
      });

      const result = await sendEmail({
        to: member.email,
        subject: `${subject} — 藍鴨 LaunchDock`,
        html,
      });

      await supabase.from('email_logs').insert({
        recipient_email: member.email,
        recipient_user_id: member.user_id,
        email_type: type as 'event_update' | 'new_article',
        subject,
        event_id: event_id || null,
        article_slug: article_slug || null,
        status: result.ok ? 'sent' : 'failed',
        resend_id: result.resendId || null,
        error_message: result.error || null,
      });

      if (result.ok) sentCount++;
    }

    return new Response(JSON.stringify({ ok: true, sent_count: sentCount }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
