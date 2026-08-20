export function generateNewProductEmailHtml(product: any, appUrl: string = "https://purnimaelectronics.com"): string {
  const imgUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Arrival: ${product.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
              <span style="background-color: #f59e0b; color: #000000; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; letter-spacing: 1px; display: inline-block; margin-bottom: 8px;">
                ⭐ NEW ARRIVAL ALERT
              </span>
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
                Purnima Electronics
              </h1>
            </td>
          </tr>

          <!-- Product Feature Card -->
          <tr>
            <td style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="${imgUrl}" alt="${product.name}" style="max-width: 100%; height: 260px; object-fit: contain; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px;" />
              </div>

              <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 26px;">
                ${product.name}
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 22px; color: #475569;">
                ${product.shortDescription || product.description?.slice(0, 180) + "..."}
              </p>

              <!-- Price Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Special Launch Price:</span>
                    <div style="font-size: 24px; font-weight: 900; color: #15803d; margin-top: 4px;">
                      ৳${Number(product.price).toLocaleString("en-BD")}
                      ${
                        product.originalPrice
                          ? `<span style="font-size: 14px; color: #94a3b8; text-decoration: line-through; margin-left: 8px; font-weight: 500;">৳${Number(product.originalPrice).toLocaleString("en-BD")}</span>`
                          : ""
                      }
                    </div>
                  </td>
                  <td align="right" style="padding: 16px 20px;">
                    <span style="background-color: #16a34a; color: #ffffff; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 8px;">
                      In Stock (${product.stock} units)
                    </span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/product/${product.slug}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 14px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25);">
                      Order Now & Get Official Warranty →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b;">
                Purnima Electronics | Cash on Delivery across all 64 districts in Bangladesh
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                You received this email because you are a registered customer at Purnima Electronics.
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
