export function welcomeEmailHtml(params: {
  name:         string
  profileUrl:   string
  directoryUrl: string
  quarter?:     string
  location?:    string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Guneku Fondom</title>
</head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#0C0C14;border:1px solid rgba(242,169,11,0.15);max-width:600px;width:100%;">

          <tr>
            <td style="background:linear-gradient(135deg,#8B1E2D,#0C0C14);padding:40px 40px 30px;text-align:center;border-bottom:3px solid #f2a90b;">
              <div style="font-size:11px;color:#f2a90b;letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">
                GUNEKU FONDOM · OFFICIAL
              </div>
              <h1 style="margin:0;color:#F5F2E9;font-size:32px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                BONGOB, ${params.name.split(' ')[0]}!
              </h1>
              <p style="color:rgba(245,242,233,0.5);font-size:14px;margin:12px 0 0;letter-spacing:1px;">
                You are now part of the Guneku Indigenes Directory
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <p style="color:rgba(245,242,233,0.75);font-size:16px;line-height:1.8;margin:0 0 24px;">
                Welcome to the official digital home of Guneku Fondom.
                Your profile is now live in the directory of Guneku sons and daughters worldwide.
              </p>

              ${params.quarter ? `
              <div style="background:rgba(242,169,11,0.06);border-left:3px solid #f2a90b;padding:16px 20px;margin:0 0 24px;">
                <div style="color:rgba(245,242,233,0.4);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">YOUR HERITAGE</div>
                <div style="color:#F5F2E9;font-size:15px;">
                  ${params.quarter} Quarter${params.location ? ' · ' + params.location : ''}
                </div>
              </div>
              ` : ''}

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="${params.profileUrl}"
                       style="display:block;background:#f2a90b;color:#0F0F0F;text-decoration:none;text-align:center;padding:14px 24px;font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                      VIEW MY PROFILE
                    </a>
                  </td>
                  <td style="padding-left:8px;">
                    <a href="${params.directoryUrl}"
                       style="display:block;border:1px solid rgba(245,242,233,0.2);color:#F5F2E9;text-decoration:none;text-align:center;padding:14px 24px;font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                      EXPLORE DIRECTORY
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:rgba(245,242,233,0.35);font-size:14px;line-height:1.7;margin:0;">
                You can update your profile at any time. Invite other Guneku sons and daughters
                to join — every profile strengthens our community.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:rgba(139,30,45,0.15);border-top:1px solid rgba(139,30,45,0.3);padding:24px 40px;text-align:center;">
              <p style="color:#f2a90b;font-style:italic;font-size:14px;margin:0;line-height:1.7;">
                &ldquo;We carry Guneku in our hearts wherever we are in the world. But Guneku must grow.&rdquo;
              </p>
              <p style="color:rgba(245,242,233,0.25);font-size:12px;margin:8px 0 0;letter-spacing:2px;text-transform:uppercase;">
                &mdash; HRH Dr. Fomuki Walters Ticha IX
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color:rgba(245,242,233,0.2);font-size:12px;margin:0;line-height:1.6;">
                      Guneku Fondom &middot; Mbengwi &middot; Momo Division &middot; Northwest Cameroon<br/>
                      <a href="https://guneku.org" style="color:#f2a90b;text-decoration:none;">guneku.org</a>
                    </p>
                  </td>
                  <td align="right">
                    <p style="color:rgba(245,242,233,0.1);font-size:11px;margin:0;">
                      Built by <a href="https://maxpromo.digital" style="color:rgba(245,242,233,0.2);text-decoration:none;">MaxPromo Digital</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function contactFormEmailHtml(params: {
  senderName:  string
  senderEmail: string
  subject:     string
  message:     string
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

          <tr>
            <td style="background:#0F0F0F;padding:24px 32px;border-bottom:3px solid #f2a90b;">
              <div style="font-size:10px;color:#f2a90b;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">GUNEKU FONDOM</div>
              <h2 style="margin:0;color:#F5F2E9;font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                New Contact Message
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  { label: 'From',    value: params.senderName  },
                  { label: 'Email',   value: params.senderEmail },
                  { label: 'Subject', value: params.subject     },
                ].map(f => `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;width:100px;vertical-align:top;">
                      <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;">${f.label}</span>
                    </td>
                    <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f0f0f0;font-size:15px;color:#333;">
                      ${f.value}
                    </td>
                  </tr>
                `).join('')}
              </table>

              <div style="margin-top:24px;background:#f9f9f9;border-left:3px solid #f2a90b;padding:16px 20px;">
                <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Message</div>
                <p style="margin:0;font-size:15px;color:#333;line-height:1.8;">
                  ${params.message.replace(/\n/g, '<br/>')}
                </p>
              </div>

              <div style="margin-top:24px;">
                <a href="mailto:${params.senderEmail}"
                   style="display:inline-block;background:#f2a90b;color:#0F0F0F;text-decoration:none;padding:12px 24px;font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                  REPLY TO ${params.senderName.split(' ')[0].toUpperCase()}
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#aaa;">Sent via guneku.org contact form</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function newIndigeneAlertHtml(params: {
  name:       string
  profession: string
  location:   string
  quarter:    string
  profileUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#0C0C14;border:1px solid rgba(242,169,11,0.2);max-width:600px;width:100%;">
          <tr>
            <td style="padding:32px;border-bottom:2px solid #f2a90b;">
              <div style="font-size:10px;color:#f2a90b;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">INDIGENES DIRECTORY</div>
              <h2 style="margin:0;color:#F5F2E9;font-size:22px;font-weight:700;text-transform:uppercase;">
                New Indigene Joined
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${[
                { label: 'Name',       value: params.name       },
                { label: 'Profession', value: params.profession  },
                { label: 'Location',   value: params.location    },
                { label: 'Quarter',    value: params.quarter     },
              ].filter(f => f.value && f.value !== 'Not specified').map(f => `
                <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <span style="font-size:11px;color:rgba(245,242,233,0.3);text-transform:uppercase;letter-spacing:2px;">${f.label}</span><br/>
                  <span style="font-size:15px;color:#F5F2E9;">${f.value}</span>
                </div>
              `).join('')}
              <div style="margin-top:24px;">
                <a href="${params.profileUrl}"
                   style="display:inline-block;background:#f2a90b;color:#0F0F0F;text-decoration:none;padding:12px 24px;font-weight:700;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                  VIEW PROFILE
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
