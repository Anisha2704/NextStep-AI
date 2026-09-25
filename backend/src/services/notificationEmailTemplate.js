const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export const renderNotificationEmail = ({ name, title, message, actionUrl, preferencesUrl }) => {
  const safeName = escapeHtml(name || 'there');
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeActionUrl = escapeHtml(actionUrl);
  const safePreferencesUrl = escapeHtml(preferencesUrl);

  const text = [
    `Hi ${name || 'there'},`,
    '',
    title,
    '',
    message,
    '',
    `Open NextStep AI: ${actionUrl}`,
    '',
    `Manage email preferences: ${preferencesUrl}`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f2fa;font-family:Arial,Helvetica,sans-serif;color:#29243a;-webkit-text-size-adjust:100%;">
    <div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${safeMessage}&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f2fa;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e8e4f0;border-radius:16px;overflow:hidden;">
          <tr><td style="height:6px;background-color:#6d28d9;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:28px 36px 18px;">
            <p style="margin:0;color:#6d28d9;font-size:18px;line-height:26px;font-weight:700;">NextStep AI</p>
          </td></tr>
          <tr><td style="padding:8px 36px 0;">
            <p style="margin:0 0 12px;color:#514b61;font-size:15px;line-height:24px;">Hi ${safeName},</p>
            <h1 style="margin:0 0 14px;color:#29243a;font-size:25px;line-height:33px;font-weight:700;">${safeTitle}</h1>
            <p style="margin:0;color:#514b61;font-size:16px;line-height:26px;">${safeMessage}</p>
          </td></tr>
          <tr><td align="left" style="padding:28px 36px 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
              <td align="center" bgcolor="#6d28d9" style="border-radius:8px;">
                <a href="${safeActionUrl}" style="display:inline-block;padding:13px 22px;border:1px solid #6d28d9;border-radius:8px;color:#ffffff;font-size:15px;line-height:20px;font-weight:700;text-decoration:none;">Open NextStep AI</a>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:20px 36px 24px;border-top:1px solid #eeeaf4;">
            <p style="margin:0 0 8px;color:#706a7c;font-size:12px;line-height:19px;">You received this account notification because email updates are enabled for your NextStep AI account.</p>
            <p style="margin:0;color:#706a7c;font-size:12px;line-height:19px;"><a href="${safePreferencesUrl}" style="color:#5b21b6;text-decoration:underline;">Manage email preferences</a></p>
          </td></tr>
        </table>
        <p style="margin:16px 0 0;color:#817b8c;font-size:11px;line-height:17px;">NextStep AI · Career planning and learning progress</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { html, text };
};
