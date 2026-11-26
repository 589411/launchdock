import { useState, type FormEvent } from 'react';
import {
  GEMINI_ADMIN_TASKS,
  GEMINI_BACKGROUNDS,
  GEMINI_PLANS,
  type GeminiPlanKey,
} from '../data/gemini-camp-register';

type Lang = 'zh-tw' | 'en';

const FN_URL = import.meta.env.PUBLIC_SUPABASE_URL
  ? `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/gemini-camp-register`
  : '';
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

const COPY = {
  'zh-tw': {
    nameLabel: '姓名',
    emailLabel: '電子信箱',
    planLabel: '報名方案',
    backgroundLabel: '你的身份',
    roleLabel: '目前職稱或工作內容（選填）',
    tasksLabel: '你最想先交給 AI 處理的行政事務（可複選）',
    couponLabel: '優惠碼（選填）',
    couponApply: '套用',
    couponChecking: '檢查中…',
    couponValid: (p: number) => `已套用，${p === 100 ? '免費' : `${(100 - p) / 10} 折`}`,
    couponInvalid: '優惠碼無效或已過期',
    consentLabel: '我同意藍鴨為了安排開課與寄送相關通知，蒐集並使用上述資料。',
    submit: '送出報名',
    submitting: '送出中…',
    priceLine: (list: number, pct: number, final: number) =>
      pct > 0
        ? `原價 NT$${list.toLocaleString()}，折後 NT$${final.toLocaleString()}`
        : `NT$${list.toLocaleString()}`,
    successTitle: '報名資料已收到',
    successBody: (email: boolean) =>
      email
        ? '我們已寄出確認信到你的信箱。開課日期與繳費方式，會再用 Email 與你確認。'
        : '我們已收到你的報名資料。開課日期與繳費方式，會再用 Email 與你確認。',
    errors: {
      invalid_name: '請填寫姓名',
      invalid_email: '請填寫正確的電子信箱',
      invalid_background: '請選擇你的身份',
      invalid_plan: '請選擇報名方案',
      coupon_invalid: '優惠碼無效或已過期',
      consent_required: '請勾選同意條款',
      answers_too_long: '填寫內容過長，請精簡後再送出',
      server_error: '送出時發生問題，請稍後再試，或來信 contact@launchdock.app',
      network: '網路連線有問題，請稍後再試',
    } as Record<string, string>,
    planNote: '進階不必先上基本，但建議先上。',
    bgName: (value: string) => GEMINI_BACKGROUNDS.find((b) => b.value === value)?.zh ?? value,
    planName: (key: GeminiPlanKey) => GEMINI_PLANS[key].zh,
  },
  en: {
    nameLabel: 'Name',
    emailLabel: 'Email',
    planLabel: 'Plan',
    backgroundLabel: 'Your background',
    roleLabel: 'Current role or work (optional)',
    tasksLabel: 'Which admin tasks would you most like to hand to AI first? (choose any)',
    couponLabel: 'Discount code (optional)',
    couponApply: 'Apply',
    couponChecking: 'Checking…',
    couponValid: (p: number) => `Applied: ${p === 100 ? 'free' : `${100 - p}% off`}`,
    couponInvalid: 'This code is invalid or has expired',
    consentLabel: 'I agree that Blue Duck may collect and use the information above to schedule the course and send related notices.',
    submit: 'Submit registration',
    submitting: 'Submitting…',
    priceLine: (list: number, pct: number, final: number) =>
      pct > 0
        ? `List price NT$${list.toLocaleString()}, after discount NT$${final.toLocaleString()}`
        : `NT$${list.toLocaleString()}`,
    successTitle: 'Registration received',
    successBody: (email: boolean) =>
      email
        ? 'We have sent a confirmation email to you. We will confirm the start date and payment method by email.'
        : 'We have received your registration. We will confirm the start date and payment method by email.',
    errors: {
      invalid_name: 'Please enter your name',
      invalid_email: 'Please enter a valid email address',
      invalid_background: 'Please choose your background',
      invalid_plan: 'Please choose a plan',
      coupon_invalid: 'This code is invalid or has expired',
      consent_required: 'Please agree to the notice',
      answers_too_long: 'Your answers are too long. Please shorten them and try again.',
      server_error: 'Something went wrong. Please try again later, or email contact@launchdock.app',
      network: 'Network problem. Please try again later.',
    } as Record<string, string>,
    planNote: 'You do not need to take Basic first, but we recommend it.',
    bgName: (value: string) => GEMINI_BACKGROUNDS.find((b) => b.value === value)?.en ?? value,
    planName: (key: GeminiPlanKey) => GEMINI_PLANS[key].en,
  },
} as const;

export default function GeminiCampRegisterForm({ lang = 'zh-tw' }: { lang?: Lang }) {
  const t = COPY[lang];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<GeminiPlanKey>('bundle');
  const [background, setBackground] = useState('');
  const [role, setRole] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [couponState, setCouponState] = useState<{ status: 'idle' | 'checking' | 'valid' | 'invalid'; percent?: number }>({ status: 'idle' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ emailSent: boolean } | null>(null);

  const listPrice = GEMINI_PLANS[plan].price;
  const percent = couponState.status === 'valid' ? couponState.percent ?? 0 : 0;
  const finalPrice = Math.round((listPrice * (100 - percent)) / 100);

  async function applyCoupon() {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setCouponState({ status: 'checking' });
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ action: 'check', code: c }),
      });
      const data = await res.json();
      if (data.valid) setCouponState({ status: 'valid', percent: data.percent_off });
      else setCouponState({ status: 'invalid' });
    } catch {
      setCouponState({ status: 'invalid' });
    }
  }

  function toggleTask(value: string) {
    setTasks((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!name.trim()) return setMessage(t.errors.invalid_name);
    if (!email.trim()) return setMessage(t.errors.invalid_email);
    if (!background) return setMessage(t.errors.invalid_background);
    if (!consent) return setMessage(t.errors.consent_required);

    setStatus('loading');
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({
          action: 'register',
          name: name.trim(),
          email: email.trim(),
          background,
          plan,
          answers: { role: role.trim(), tasks },
          code: couponState.status === 'valid' ? code.trim().toUpperCase() : '',
          consent: true,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(t.errors[data.error as string] ?? t.errors.server_error);
        return;
      }
      setResult({ emailSent: Boolean(data.email_sent) });
      setStatus('done');
    } catch {
      setStatus('error');
      setMessage(t.errors.network);
    }
  }

  if (status === 'done' && result) {
    return (
      <div className="gcr-success" role="status">
        <h2>{t.successTitle}</h2>
        <p>{t.successBody(result.emailSent)}</p>
      </div>
    );
  }

  return (
    <form className="gcr-form" onSubmit={onSubmit} noValidate>
      <div className="gcr-field">
        <label htmlFor="gcr-name">{t.nameLabel}</label>
        <input id="gcr-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} required />
      </div>

      <div className="gcr-field">
        <label htmlFor="gcr-email">{t.emailLabel}</label>
        <input id="gcr-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} required />
      </div>

      <fieldset className="gcr-field">
        <legend>{t.backgroundLabel}</legend>
        <div className="gcr-options">
          {GEMINI_BACKGROUNDS.map((b) => (
            <label key={b.value} className="gcr-option">
              <input type="radio" name="gcr-background" value={b.value} checked={background === b.value} onChange={() => setBackground(b.value)} />
              <span>{lang === 'en' ? b.en : b.zh}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="gcr-field">
        <label htmlFor="gcr-role">{t.roleLabel}</label>
        <input id="gcr-role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={80} />
      </div>

      <fieldset className="gcr-field">
        <legend>{t.tasksLabel}</legend>
        <div className="gcr-options">
          {GEMINI_ADMIN_TASKS.map((task) => (
            <label key={task.value} className="gcr-option">
              <input type="checkbox" checked={tasks.includes(task.value)} onChange={() => toggleTask(task.value)} />
              <span>{lang === 'en' ? task.en : task.zh}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="gcr-field">
        <legend>{t.planLabel}</legend>
        <div className="gcr-options">
          {(Object.keys(GEMINI_PLANS) as GeminiPlanKey[]).map((key) => (
            <label key={key} className="gcr-option">
              <input type="radio" name="gcr-plan" value={key} checked={plan === key} onChange={() => setPlan(key)} />
              <span>{lang === 'en' ? GEMINI_PLANS[key].en : GEMINI_PLANS[key].zh}（NT$ {GEMINI_PLANS[key].price.toLocaleString()}）</span>
            </label>
          ))}
        </div>
        <p className="gcr-hint">{t.planNote}</p>
      </fieldset>

      <div className="gcr-field">
        <label htmlFor="gcr-code">{t.couponLabel}</label>
        <div className="gcr-coupon-row">
          <input
            id="gcr-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCouponState({ status: 'idle' });
            }}
            maxLength={40}
            autoCapitalize="characters"
          />
          <button type="button" className="gcr-btn-secondary" onClick={applyCoupon} disabled={!code.trim() || couponState.status === 'checking'}>
            {couponState.status === 'checking' ? t.couponChecking : t.couponApply}
          </button>
        </div>
        {couponState.status === 'valid' && <p className="gcr-ok">{t.couponValid(couponState.percent ?? 0)}</p>}
        {couponState.status === 'invalid' && <p className="gcr-error">{t.couponInvalid}</p>}
      </div>

      <div className="gcr-total">{t.priceLine(listPrice, percent, finalPrice)}</div>

      {/* honeypot：一般使用者看不到，機器人會填 */}
      <div className="gcr-hp" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <label className="gcr-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{t.consentLabel}</span>
      </label>

      {message && <p className="gcr-error" role="alert">{message}</p>}

      <button type="submit" className="gcr-btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? t.submitting : t.submit}
      </button>
    </form>
  );
}
