//
// ⚠️ 必須用 --no-verify-jwt 部署（信箱服務商做 RFC 8058 one-click 時不會帶 Authorization）：
//   supabase functions deploy newsletter-unsubscribe --no-verify-jwt
//
// 郵件 header 的 List-Unsubscribe 放這支 function 的 HTTPS URL（帶 ?t=TOKEN）。
//
// GET  ?t=TOKEN  → 302 到 {PUBLIC_SITE_URL}/unsubscribe/?t=TOKEN（人工確認頁，不直接退訂）
// POST           → 退訂。冪等：已退訂也回成功。

import { WEEKLY_LIST, corsHeaders, json, serviceClient, siteUrl, TOKEN_RE } from '../_shared/newsletter.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });

  const url = new URL(req.url);
  let token = url.searchParams.get('t') ?? url.searchParams.get('token') ?? '';

  if (req.method === 'GET') {
    const loc = TOKEN_RE.test(token) ? `${siteUrl()}/unsubscribe/?t=${token}` : `${siteUrl()}/unsubscribe/`;
    return new Response(null, { status: 302, headers: { Location: loc } });
  }
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, 405);

  try {
    if (!token) {
      const ct = req.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const body = await req.json().catch(() => null);
        token = String(body?.t ?? body?.token ?? '');
      } else {
        const form = new URLSearchParams(await req.text().catch(() => ''));
        token = form.get('t') ?? form.get('token') ?? '';
      }
    }
    if (!TOKEN_RE.test(token)) return json(req, { error: 'invalid_token' }, 400);

    const db = serviceClient();
    const { data: row, error } = await db
      .from('newsletter_subscribers')
      .select('id, status, list')
      .eq('unsubscribe_token', token)
      .maybeSingle();
    if (error) throw error;
    if (!row || row.list !== WEEKLY_LIST) return json(req, { error: 'invalid_token' }, 404);

    if (row.status !== 'unsubscribed') {
      const { error: upErr } = await db.from('newsletter_subscribers').update({
        status: 'unsubscribed', unsubscribed_at: new Date().toISOString(),
      }).eq('id', row.id).eq('list', WEEKLY_LIST);
      if (upErr) throw upErr;
    }
    return json(req, { status: 'unsubscribed' });
  } catch (err) {
    console.error('newsletter-unsubscribe error:', err instanceof Error ? err.message : 'unknown');
    return json(req, { error: 'server_error' }, 500);
  }
});
