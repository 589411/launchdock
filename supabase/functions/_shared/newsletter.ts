// 藍鴨週報 Edge Functions 共用：CORS、token、Supabase service client、確認信範本。
// 公開訂閱只處理 list = 'weekly'。daily 不得從這些函式寫入。

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const WEEKLY_LIST = 'weekly' as const;

export function siteUrl(): string {
  return (Deno.env.get('PUBLIC_SITE_URL') || 'https://launchdock.app').replace(/\/+$/, '');
}

export function serviceClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
}

/** 32 bytes 隨機值 → 64 hex */
export function newToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export const TOKEN_RE = /^[0-9a-f]{64}$/;

const ALLOWED_ORIGINS = new Set([
  'https://launchdock.app',
  'https://www.launchdock.app',
]);

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const h: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    Vary: 'Origin',
  };
  if (isAllowedOrigin(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(req) },
  });
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(e: string): boolean {
  return e.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(e);
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 週報確認信（雙重確認）html + text。 */
export function confirmationEmail(confirmUrl: string) {
  const subject = '請確認訂閱藍鴨週報';
  const text = [
    '嗨，',
    '',
    '你（或有人用這個信箱）在藍鴨 LaunchDock 申請訂閱「藍鴨週報」。',
    '每期會寄標題與 2–3 句摘要，並附上網站全文連結。這不是每日 X 摘要。',
    '',
    '請點下面的連結完成確認（48 小時內有效）：',
    confirmUrl,
    '',
    '如果不是你申請的，直接忽略這封信即可，不會有任何後續。',
    '',
    '藍鴨 LaunchDock',
    'https://launchdock.app',
  ].join('\n');
  const html = `<!doctype html><html lang="zh-Hant"><body style="margin:0;background:#edf1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC','PingFang TC','Microsoft JhengHei',Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">點一下確認，就會開始收到藍鴨週報。</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" style="max-width:600px;background:#ffffff;" cellpadding="0" cellspacing="0">
<tr><td style="background:#0f3460;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700;">藍鴨週報</td></tr>
<tr><td style="padding:28px;color:#0f3460;font-size:16px;line-height:1.7;">
<p style="margin:0 0 12px;">嗨，</p>
<p style="margin:0 0 12px;">你（或有人用這個信箱）申請訂閱藍鴨 LaunchDock 的「藍鴨週報」。每期會寄標題與 2–3 句摘要，並附上網站全文連結。這不是每日 X 摘要。</p>
<p style="margin:0 0 20px;">請點下方按鈕完成確認（48 小時內有效）：</p>
<p style="margin:0 0 24px;"><a href="${esc(confirmUrl)}" style="display:inline-block;background:#1a4a8a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:8px;">確認訂閱</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#57606a;">按鈕無法點擊時，請複製此連結到瀏覽器：<br><span style="word-break:break-all;">${esc(confirmUrl)}</span></p>
<p style="margin:16px 0 0;font-size:13px;color:#57606a;">如果不是你申請的，直接忽略這封信即可，不會有任何後續。</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, html, text };
}

/** Turnstile siteverify。未設定 TURNSTILE_SECRET 時略過（本機預覽）。上線應設定。 */
export async function verifyTurnstile(token: unknown, remoteip: string | null): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET') || '';
  if (!secret) return true;
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false;
  const expectedAction = 'newsletter_subscribe';
  const expectedHostnames = new Set(
    (Deno.env.get('TURNSTILE_HOSTNAMES') ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
  );
  if (expectedHostnames.size === 0) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteip) body.set('remoteip', remoteip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body,
    });
    if (!r.ok) return false;
    const result = await r.json();
    return Boolean(
      result?.success &&
      result.action === expectedAction &&
      expectedHostnames.has(result.hostname),
    );
  } catch {
    return false;
  }
}
