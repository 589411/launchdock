import { useState, useEffect, type FormEvent } from 'react';

// 藍鴨週報訂閱表單（不是每日 X 摘要）
// - 只用 PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY 呼叫 newsletter-subscribe
// - 雙重確認：送出後只是「已收到」，要到信箱點確認信才算訂閱
// - honeypot 欄位 website；若設定 PUBLIC_TURNSTILE_SITE_KEY 則顯示 Turnstile
// - 僅 DEV：URL 帶 ?state=success|duplicate|error 可直接顯示該狀態

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';
type Source = 'footer' | 'subscribe_page' | 'home' | 'article';

interface Props {
  source: Source;
  variant?: 'full' | 'compact';
  lang?: 'zh-tw' | 'en';
}

const COPY = {
  'zh-tw': {
    emailLabel: 'Email',
    placeholder: 'you@example.com',
    consent:
      '我同意收到藍鴨週報（約每週一封：標題、摘要與網站全文連結）。送出後會寄確認信，點擊後才算訂閱。可隨時退訂。這不是每日新聞摘要。',
    consentShort: '我同意收到藍鴨週報（標題、摘要與全文連結），點確認信後才算訂閱，可隨時退訂。',
    submit: '訂閱週報',
    loading: '送出中⋯',
    needConsent: '請先勾選同意文字。',
    success: '已收到！請到信箱點開確認信完成訂閱（沒看到請檢查垃圾信件匣）。',
    duplicate: '這個信箱已經訂閱，或已在等候確認——請檢查信箱（含垃圾信件匣）。',
    error: '送出失敗：請檢查 Email 格式，或稍後再試。',
    retry: '重新填寫',
  },
  en: {
    emailLabel: 'Email',
    placeholder: 'you@example.com',
    consent:
      'I agree to receive the Blue Duck weekly newsletter (usually one issue a week: a headline, a short summary, and a link to the full article). We’ll email a confirmation link — the subscription starts only after you click it. Unsubscribe anytime. This is not a daily news digest.',
    consentShort: 'I agree to receive the weekly newsletter (Mandarin). Confirm by email; unsubscribe anytime.',
    submit: 'Subscribe',
    loading: 'Sending…',
    needConsent: 'Please tick the consent box first.',
    success: 'Got it! Check your inbox and click the confirmation email to finish (look in spam too).',
    duplicate: 'This address is already subscribed or waiting for confirmation — check your inbox (and spam).',
    error: 'Something went wrong. Check the email format or try again later.',
    retry: 'Try again',
  },
} as const;

const FN_URL = import.meta.env.PUBLIC_SUPABASE_URL
  ? `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/newsletter-subscribe`
  : '';
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
const TURNSTILE_SITEKEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '';

export default function NewsletterSignup({ source, variant = 'full', lang = 'zh-tw' }: Props) {
  const t = COPY[lang];
  const compact = variant === 'compact';
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [consentWarn, setConsentWarn] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const q = new URLSearchParams(window.location.search);
    const s = q.get('state');
    const only = q.get('source');
    if ((s === 'success' || s === 'duplicate' || s === 'error') && (!only || only === source)) {
      setStatus(s);
    }
  }, [source]);

  useEffect(() => {
    if (!TURNSTILE_SITEKEY || status !== 'idle') return;
    if (document.querySelector('script[data-nl-turnstile]')) return;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.dataset.nlTurnstile = '1';
    document.head.appendChild(s);
  }, [status]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    if (!consent) {
      setConsentWarn(true);
      return;
    }
    setConsentWarn(false);
    if (!FN_URL || !ANON) {
      setStatus('error');
      return;
    }
    const form = e.currentTarget as HTMLFormElement;
    const turnstileInput = form.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
    const turnstileToken = turnstileInput?.value || '';
    if (TURNSTILE_SITEKEY && !turnstileToken) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({
          email: email.trim(),
          source,
          consent: true,
          website,
          turnstileToken,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.status === 'pending') setStatus('success');
      else if (res.ok && (data?.status === 'already_pending' || data?.status === 'already_confirmed'))
        setStatus('duplicate');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success' || status === 'duplicate') {
    const ok = status === 'success';
    return (
      <div
        role="status"
        className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
          ok ? 'border-[#1a4a8a]/40 bg-[#1a4a8a]/10 text-text-primary' : 'border-accent2-light/60 bg-accent2/10 text-text-primary'
        }`}
      >
        <span aria-hidden="true">{ok ? '✅ ' : 'ℹ️ '}</span>
        {ok ? t.success : t.duplicate}
      </div>
    );
  }

  const id = `nl-${source}-${variant}`;
  return (
    <form onSubmit={onSubmit} noValidate={false} className={`relative ${compact ? 'w-full max-w-md mx-auto' : 'w-full'}`}>
      <label htmlFor={`${id}-email`} className="sr-only">
        {t.emailLabel}
      </label>
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          id={`${id}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 min-w-0 rounded-lg border border-surface-lighter bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#1a4a8a]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-[#0f3460] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a4a8a] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? t.loading : t.submit}
        </button>
      </div>
      {/* honeypot：螢幕外，不用 display:none，避免部分機器人跳過 */}
      <div aria-hidden="true" className="absolute w-px h-px overflow-hidden -left-[9999px]">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      {TURNSTILE_SITEKEY && (
        <div
          className="cf-turnstile mt-3"
          data-sitekey={TURNSTILE_SITEKEY}
          data-action="newsletter_subscribe"
        />
      )}
      <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setConsentWarn(false);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f3460]"
        />
        <span>{compact ? t.consentShort : t.consent}</span>
      </label>
      {consentWarn && (
        <p role="alert" className="mt-2 text-xs text-[#0f3460]">
          {t.needConsent}
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="mt-3 rounded-lg border border-[#0f3460]/40 bg-[#0f3460]/10 px-3 py-2 text-xs text-text-primary">
          ⚠️ {t.error}{' '}
          <button type="button" className="underline underline-offset-2" onClick={() => setStatus('idle')}>
            {t.retry}
          </button>
        </p>
      )}
    </form>
  );
}
