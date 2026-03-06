// Shared Resend email sending utility

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'LaunchDock <noreply@launchdock.app>';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  resendId?: string;
  error?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (response.ok) {
    const data = await response.json();
    return { ok: true, resendId: data.id };
  } else {
    const error = await response.text();
    return { ok: false, error };
  }
}
