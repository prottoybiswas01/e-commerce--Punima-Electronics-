export function generatePasswordResetOtpEmailHtml(otp: string, name?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="560" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
                Purnima Electronics
              </h1>
              <span style="color: #94a3b8; font-size: 11px;">Account Security & Verification</span>
            </td>
          </tr>

          <!-- OTP Card -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                Password Reset Verification Code 🔒
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 22px; color: #475569;">
                Hello ${name || "Customer"}, we received a request to reset your password. Use the 6-digit verification code below to complete your password reset:
              </p>

              <!-- OTP Code Display -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
                      Your 6-Digit OTP Code
                    </span>
                    <div style="font-size: 36px; font-weight: 900; color: #1d4ed8; letter-spacing: 8px; font-family: monospace;">
                      ${otp}
                    </div>
                    <span style="font-size: 12px; color: #60a5fa; display: block; margin-top: 8px;">
                      Valid for 10 minutes only
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 20px; color: #64748b;">
                ⚠️ <strong>Security Warning:</strong> Never share this OTP code with anyone, including Purnima Electronics staff. If you did not request a password reset, please ignore this email or change your account password.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                Purnima Electronics | Support: +880 1712-345678 | Email: support@purnimaelectronics.com
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                Shop #12, Level 3, Multiplan Center, Elephant Road, Dhaka, Bangladesh.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
