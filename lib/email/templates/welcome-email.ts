export function generateWelcomeEmailHtml(name: string, appUrl: string = "https://purnimaelectronics.com"): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Purnima Electronics</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Purnima Electronics
              </h1>
              <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 12px; font-weight: 500;">
                Authentic Networking, TV Box, CCTV & ISP Hardware in Bangladesh
              </p>
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="padding: 36px 32px 20px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Welcome to Purnima Electronics, ${name || "Valued Customer"}! 🎉
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Thank you for joining Purnima Electronics. You now have full access to authentic WiFi Routers, Android Smart TV Boxes, Fiber Optical ONUs, CCTV Cameras, and Dish line accessories with official warranty and fast nationwide delivery.
              </p>

              <!-- Promo Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px dashed #3b82f6; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Exclusive Welcome Gift</span>
                    <div style="font-size: 20px; font-weight: 800; color: #1e3a8a; letter-spacing: 2px; font-family: monospace;">WELCOME10</div>
                    <span style="font-size: 12px; color: #3b82f6; display: block; margin-top: 4px;">Use code at checkout to get 10% Discount on your first order!</span>
                  </td>
                </tr>
              </table>

              <!-- Featured Categories -->
              <h3 style="margin: 24px 0 14px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                Explore Our Hardware Categories:
              </h3>
              
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td width="48%" style="padding: 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <strong style="font-size: 13px; color: #0f172a; display: block;">📶 WiFi Routers & Mesh</strong>
                    <span style="font-size: 11px; color: #64748b;">TP-Link, Tenda, Mercusys</span>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding: 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <strong style="font-size: 13px; color: #0f172a; display: block;">📺 Android Smart TV Box</strong>
                    <span style="font-size: 11px; color: #64748b;">4K Ultra HD Streaming Box</span>
                  </td>
                </tr>
                <tr><td height="10" colspan="3"></td></tr>
                <tr>
                  <td width="48%" style="padding: 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <strong style="font-size: 13px; color: #0f172a; display: block;">⚡ Fiber Optical ONU</strong>
                    <span style="font-size: 11px; color: #64748b;">XPON / EPON Gigabit Devices</span>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding: 10px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <strong style="font-size: 13px; color: #0f172a; display: block;">📹 CCTV & Security</strong>
                    <span style="font-size: 11px; color: #64748b;">Hikvision, Dahua, Ezviz</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/shop" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                      Start Shopping Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Need help or technical advice?
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b;">
                Helpline: +880 1712-345678 | Email: support@purnimaelectronics.com
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                © ${new Date().getFullYear()} Purnima Electronics. Multiplan Center, Dhaka, Bangladesh. All rights reserved.
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
