// Shared email template for all LaunchDock notifications
// Used by all Edge Functions

export function emailTemplate({
  title,
  preheader,
  body,
  ctaText,
  ctaUrl,
  footerNote,
  unsubscribeUrl,
}: {
  title: string;
  preheader?: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
  unsubscribeUrl?: string;
}) {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0f172a; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; margin-bottom: 32px; }
    .header img { width: 48px; height: 48px; }
    .header h1 { font-size: 20px; margin: 12px 0 0; color: #f1f5f9; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .card h2 { font-size: 18px; margin: 0 0 16px; color: #f1f5f9; }
    .card p { font-size: 14px; line-height: 1.7; color: #94a3b8; margin: 0 0 16px; }
    .cta { display: inline-block; padding: 12px 28px; background: #e94560; color: #fff !important; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 8px 0; }
    .cta:hover { background: #d63851; }
    .info-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; margin: 8px 0; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; line-height: 1.8; }
    .footer a { color: #94a3b8; text-decoration: underline; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ''}
  <div class="container">
    <div class="header">
      <div style="font-size: 32px">🚀</div>
      <h1>藍鴨 LaunchDock</h1>
    </div>
    <div class="card">
      <h2>${title}</h2>
      ${body}
      ${ctaText && ctaUrl ? `<p style="text-align: center; margin-top: 24px"><a class="cta" href="${ctaUrl}">${ctaText}</a></p>` : ''}
    </div>
    <div class="footer">
      ${footerNote ? `<p>${footerNote}</p>` : ''}
      <p>
        © 藍鴨 LaunchDock · <a href="https://launchdock.app">launchdock.app</a>
      </p>
      ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}">取消訂閱此類通知</a></p>` : ''}
    </div>
  </div>
</body>
</html>`;
}
