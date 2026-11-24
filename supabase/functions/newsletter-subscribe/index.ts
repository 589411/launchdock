// POST { email, source, consent: true, website?, turnstileToken? }
// → 寫入 pending（list=weekly）並以 Resend 寄確認信（雙重確認）。
// 部署：supabase functions deploy newsletter-subscribe（預設驗證 JWT；前端以 anon key 呼叫）
//
// 公開端只接受週報。忽略客戶端傳來的 list。
// honeypot（website 有值）回 pending，不寫入資料庫。
//
// 回傳 status：pending / already_pending / already_confirmed
// 錯誤：invalid_email / consent_required / email_not_configured / send_failed / forbidden / server_error

import { isResendConfigured, sendEmail } from '../_shared/resend.ts';
import {
  WEEKLY_LIST, confirmationEmail, corsHeaders, isValidEmail, json, newToken,
  normalizeEmail, serviceClient, siteUrl, verifyTurnstile,
} from '../_shared/newsletter.ts';

const THROTTLE_MS = 10 * 60 * 1000;
const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;
const SOURCES = new Set(['footer', 'subscribe_page', 'home', 'article']);

function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || null;
  return req.headers.get('cf-connecting-ip');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, 405);

  try {
    const body = await req.json().catch(() => null);
    if (!body || body.consent !== true) return json(req, { error: 'consent_required' }, 400);

    // honeypot：有填就假裝成功，不寫資料、不寄信
    const honeypot = String(body.website ?? body.company ?? '').trim();
    if (honeypot) return json(req, { status: 'pending' });

    const email = String(body.email ?? '').trim();
    if (!isValidEmail(email)) return json(req, { error: 'invalid_email' }, 400);
    const emailNorm = normalizeEmail(email);
    const source = SOURCES.has(body.source) ? body.source : 'unknown';

    const turnstileOk = await verifyTurnstile(body.turnstileToken ?? body['cf-turnstile-response'], clientIp(req));
    if (!turnstileOk) return json(req, { error: 'forbidden' }, 403);

    if (!isResendConfigured()) return json(req, { error: 'email_not_configured' }, 503);

    const db = serviceClient();
    const { data: existing, error: selErr } = await db
      .from('newsletter_subscribers')
      .select('id, status, last_confirm_sent_at')
      .eq('email_normalized', emailNorm)
      .eq('list', WEEKLY_LIST)
      .maybeSingle();
    if (selErr) throw selErr;

    if (existing?.status === 'confirmed') return json(req, { status: 'already_confirmed' });

    if (
      existing?.status === 'pending' && existing.last_confirm_sent_at &&
      Date.now() - new Date(existing.last_confirm_sent_at).getTime() < THROTTLE_MS
    ) {
      return json(req, { status: 'already_pending' });
    }

    const confirmToken = newToken();
    const expires = new Date(Date.now() + CONFIRM_TTL_MS).toISOString();

    if (!existing) {
      const { error } = await db.from('newsletter_subscribers').insert({
        email, email_normalized: emailNorm, list: WEEKLY_LIST, status: 'pending',
        confirm_token: confirmToken, unsubscribe_token: newToken(),
        confirm_token_expires_at: expires, source,
      });
      if (error) throw error;
    } else {
      const { error } = await db.from('newsletter_subscribers').update({
        status: 'pending', confirm_token: confirmToken, confirm_token_expires_at: expires,
        unsubscribed_at: null, confirmed_at: null, source,
      }).eq('id', existing.id).eq('list', WEEKLY_LIST);
      if (error) throw error;
    }

    const mail = confirmationEmail(`${siteUrl()}/subscribe/confirm/?t=${confirmToken}`);
    const sent = await sendEmail({
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: 'info@launchdock.app',
    });
    if (!sent.ok) {
      console.error('newsletter-subscribe send failed:', sent.error);
      return json(req, { error: 'send_failed' }, 502);
    }
    await db.from('newsletter_subscribers')
      .update({ last_confirm_sent_at: new Date().toISOString() })
      .eq('email_normalized', emailNorm)
      .eq('list', WEEKLY_LIST);

    return json(req, { status: 'pending' });
  } catch (err) {
    console.error('newsletter-subscribe error:', err instanceof Error ? err.message : 'unknown');
    return json(req, { error: 'server_error' }, 500);
  }
});
