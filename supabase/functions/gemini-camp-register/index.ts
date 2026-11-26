// 藍鴨Gemini陪跑營：優惠碼檢查與報名
// POST { action: 'check', code }
//   → { valid, percent_off }（不回傳剩餘次數，避免被拿來試碼）
// POST { action: 'register', name, email, background, plan, answers, code?, consent: true, website? }
//   → { ok: true, plan, list_price, percent_off, final_price, email_sent }
//
// 部署：supabase functions deploy gemini-camp-register（前端以 anon key 呼叫）
// 價格與折扣只在這裡計算，前端送來的金額一律忽略。
// honeypot（website 有值）回 ok，不寫入、不寄信。

import { isResendConfigured, sendEmail } from '../_shared/resend.ts';
import { emailTemplate } from '../_shared/email-template.ts';
import { corsHeaders, isValidEmail, json, normalizeEmail, serviceClient } from '../_shared/newsletter.ts';

const PLANS: Record<string, { label: string; price: number }> = {
  basic: { label: '基本月（W1–W4）', price: 3000 },
  advanced: { label: '進階月（W5–W8）', price: 3000 },
  bundle: { label: '兩個月一起報（基本＋進階）', price: 5700 },
};

const BACKGROUNDS: Record<string, string> = {
  social_welfare: '社福團體工作人員',
  church: '教會工作人員',
  disability: '身障團體工作人員',
  fulltime_staff: '全職同工',
  corporate_admin: '企業行政人員',
  public_admin: '公部門或學校行政人員',
  other: '其他',
};

const CODE_RE = /^[A-Z0-9-]{4,40}$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'method_not_allowed' }, 405);

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return json(req, { error: 'bad_request' }, 400);

    const supabase = serviceClient();

    // ---------- 檢查優惠碼（不扣次數） ----------
    if (body.action === 'check') {
      const code = String(body.code ?? '').trim().toUpperCase();
      if (!CODE_RE.test(code)) return json(req, { valid: false });
      const { data } = await supabase
        .from('gemini_camp_coupons')
        .select('percent_off, max_uses, used_count, expires_at, active')
        .eq('code', code)
        .maybeSingle();
      const valid = Boolean(
        data && data.active && data.used_count < data.max_uses && new Date(data.expires_at) > new Date(),
      );
      return json(req, valid ? { valid: true, percent_off: data!.percent_off } : { valid: false });
    }

    // ---------- 報名 ----------
    if (body.action !== 'register') return json(req, { error: 'bad_action' }, 400);

    // honeypot：有填就假裝成功，不寫資料、不寄信
    if (String(body.website ?? '').trim()) return json(req, { ok: true });

    if (body.consent !== true) return json(req, { error: 'consent_required' }, 400);

    const name = String(body.name ?? '').trim();
    if (!name || name.length > 60) return json(req, { error: 'invalid_name' }, 400);

    const email = String(body.email ?? '').trim();
    if (!isValidEmail(email)) return json(req, { error: 'invalid_email' }, 400);

    const background = String(body.background ?? '');
    if (!(background in BACKGROUNDS)) return json(req, { error: 'invalid_background' }, 400);

    const plan = String(body.plan ?? '');
    if (!(plan in PLANS)) return json(req, { error: 'invalid_plan' }, 400);

    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
    if (JSON.stringify(answers).length > 4000) return json(req, { error: 'answers_too_long' }, 400);

    // 優惠碼：有填才檢查；無效就直接擋下，不寫入報名
    const rawCode = String(body.code ?? '').trim().toUpperCase();
    let percentOff = 0;
    let couponCode: string | null = null;
    if (rawCode) {
      if (!CODE_RE.test(rawCode)) return json(req, { error: 'coupon_invalid' }, 400);
      const { data: redeemed, error: redeemErr } = await supabase.rpc('redeem_gemini_camp_coupon', { p_code: rawCode });
      if (redeemErr) {
        console.error('redeem error', redeemErr);
        return json(req, { error: 'server_error' }, 500);
      }
      if (redeemed == null) return json(req, { error: 'coupon_invalid' }, 400);
      percentOff = Number(redeemed);
      couponCode = rawCode;
    }

    const listPrice = PLANS[plan].price;
    const finalPrice = Math.round((listPrice * (100 - percentOff)) / 100);

    const { error: insertErr } = await supabase.from('gemini_camp_registrations').insert({
      name,
      email,
      email_normalized: normalizeEmail(email),
      background,
      plan,
      answers,
      coupon_code: couponCode,
      percent_off: percentOff,
      list_price: listPrice,
      final_price: finalPrice,
      source: 'gemini_camp_register',
    });

    if (insertErr) {
      console.error('insert error', insertErr);
      if (couponCode) await supabase.rpc('release_gemini_camp_coupon', { p_code: couponCode });
      return json(req, { error: 'server_error' }, 500);
    }

    // 確認信（寄失敗不影響報名結果，回傳 email_sent 給前端）
    let emailSent = false;
    if (isResendConfigured()) {
      const priceLine = percentOff > 0
        ? `原價 NT$${listPrice.toLocaleString()}，套用優惠 ${100 - percentOff} 折後為 NT$${finalPrice.toLocaleString()}`
        : `費用 NT$${finalPrice.toLocaleString()}`;
      const html = emailTemplate({
        title: '✅ 報名資料已收到：藍鴨Gemini陪跑營',
        preheader: '我們已收到你的報名資料',
        body: `
          <p>嗨 ${name}！</p>
          <p>我們已收到你的報名資料，內容如下：</p>
          <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0; font-size: 14px;">方案：${PLANS[plan].label}</p>
            <p style="margin: 4px 0; font-size: 14px;">身份：${BACKGROUNDS[background]}</p>
            <p style="margin: 4px 0; font-size: 14px;">${priceLine}</p>
          </div>
          <p>課程正在依 Gemini 最新版本微調內容。開課日期與繳費方式，我們會再用 Email 與你確認，請留意信箱。</p>
        `,
        ctaText: '查看課程資訊',
        ctaUrl: 'https://launchdock.app/gemini-camp/',
        footerNote: '如有問題，請來信 contact@launchdock.app。',
      });
      const result = await sendEmail({
        to: email,
        subject: '✅ 報名資料已收到：藍鴨Gemini陪跑營',
        html,
      });
      emailSent = result.ok;
      if (!result.ok) console.error('send email failed', result.error);
    }

    return json(req, {
      ok: true,
      plan,
      list_price: listPrice,
      percent_off: percentOff,
      final_price: finalPrice,
      email_sent: emailSent,
    });
  } catch (err) {
    console.error('gemini-camp-register error', err);
    return json(req, { error: 'server_error' }, 500);
  }
});
