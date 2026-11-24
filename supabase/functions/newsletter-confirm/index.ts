// GET ?t=TOKEN 或 POST { token } → pending → confirmed（僅 weekly 列）
// 部署：supabase functions deploy newsletter-confirm（前端確認頁以 anon key 呼叫）

import { WEEKLY_LIST, corsHeaders, json, serviceClient, TOKEN_RE } from '../_shared/newsletter.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'GET' && req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, 405);

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get('t') ?? url.searchParams.get('token') ?? '';
    if (!token && req.method === 'POST') {
      const body = await req.json().catch(() => null);
      token = String(body?.t ?? body?.token ?? '');
    }
    if (!TOKEN_RE.test(token)) return json(req, { error: 'invalid_token' }, 400);

    const db = serviceClient();
    const { data: row, error } = await db
      .from('newsletter_subscribers')
      .select('id, status, list, confirm_token_expires_at')
      .eq('confirm_token', token)
      .maybeSingle();
    if (error) throw error;
    if (!row || row.list !== WEEKLY_LIST || row.status === 'unsubscribed') {
      return json(req, { error: 'invalid_token' }, 404);
    }
    if (row.status === 'confirmed') return json(req, { status: 'already_confirmed' });

    if (!row.confirm_token_expires_at || new Date(row.confirm_token_expires_at).getTime() < Date.now()) {
      return json(req, { error: 'expired' }, 410);
    }

    const { error: upErr } = await db.from('newsletter_subscribers').update({
      status: 'confirmed', confirmed_at: new Date().toISOString(),
    }).eq('id', row.id).eq('status', 'pending').eq('list', WEEKLY_LIST);
    if (upErr) throw upErr;
    return json(req, { status: 'confirmed' });
  } catch (err) {
    console.error('newsletter-confirm error:', err instanceof Error ? err.message : 'unknown');
    return json(req, { error: 'server_error' }, 500);
  }
});
