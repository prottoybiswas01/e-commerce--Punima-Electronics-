export function generateOrderInvoiceEmailHtml(order: any, appUrl: string = "https://purnimaelectronics.com"): string {
  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">
          <strong>${item.productName}</strong>
          ${item.variantName ? `<br><span style="font-size: 11px; color: #64748b;">Variant: ${item.variantName}</span>` : ""}
          <br><span style="font-size: 10px; color: #94a3b8; font-family: monospace;">SKU: ${item.sku}</span>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #475569; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b; text-align: right; font-weight: 600;">
          ৳${item.unitPrice.toLocaleString("en-BD")}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #0f172a; text-align: right; font-weight: 700;">
          ৳${item.totalPrice.toLocaleString("en-BD")}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${order.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
                      Purnima Electronics
                    </h1>
                    <span style="color: #94a3b8; font-size: 11px;">Invoice & Official Purchase Receipt</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #22c55e; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">
                      Order Received
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Confirmation Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                Thank you for your order, ${order.customerName}! 📦
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 20px; color: #64748b;">
                We have received your order <strong>#${order.orderNumber}</strong>. We are packing your items and preparing them for delivery via Pathao Courier.
              </p>

              <!-- Order & Shipping Summary Grid -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;" width="50%" valign="top">
                    <strong style="font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Delivery Details:</strong>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${order.customerName}</div>
                    <div style="font-size: 12px; color: #334155; margin-top: 2px;">Phone: ${order.customerPhone}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                      ${order.addressLine}, ${order.upazila}, ${order.district}
                    </div>
                  </td>
                  <td style="padding: 16px; border-left: 1px solid #e2e8f0;" width="50%" valign="top">
                    <strong style="font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Payment & Delivery:</strong>
                    <div style="font-size: 12px; color: #334155;"><strong>Payment Method:</strong> ${order.paymentMethod}</div>
                    <div style="font-size: 12px; color: #334155; margin-top: 2px;"><strong>Payment Status:</strong> ${order.paymentStatus}</div>
                    <div style="font-size: 12px; color: #334155; margin-top: 2px;"><strong>Courier:</strong> ${order.courierProvider || "Pathao Courier"}</div>
                  </td>
                </tr>
              </table>

              <!-- Order Items Table -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 8px; text-align: left; font-size: 11px; color: #475569; font-weight: 700; border-radius: 6px 0 0 6px;">Item</th>
                    <th style="padding: 8px; text-align: center; font-size: 11px; color: #475569; font-weight: 700;">Qty</th>
                    <th style="padding: 8px; text-align: right; font-size: 11px; color: #475569; font-weight: 700;">Unit Price</th>
                    <th style="padding: 8px; text-align: right; font-size: 11px; color: #475569; font-weight: 700; border-radius: 0 6px 6px 0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td width="60%"></td>
                  <td width="40%">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Subtotal:</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1e293b;">৳${order.subtotal.toLocaleString("en-BD")}</td>
                      </tr>
                      ${
                        order.couponDiscount > 0
                          ? `
                      <tr>
                        <td style="padding: 4px 0; color: #16a34a;">Coupon Discount:</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #16a34a;">-৳${order.couponDiscount.toLocaleString("en-BD")}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Delivery Charge:</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1e293b;">৳${order.deliveryCharge.toLocaleString("en-BD")}</td>
                      </tr>
                      <tr style="border-top: 2px solid #0f172a;">
                        <td style="padding: 8px 0; font-size: 15px; font-weight: 800; color: #0f172a;">Total Payable:</td>
                        <td style="padding: 8px 0; text-align: right; font-size: 16px; font-weight: 800; color: #2563eb;">৳${order.totalAmount.toLocaleString("en-BD")}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Track Order CTA -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/track-order?orderNumber=${order.orderNumber}&phone=${order.customerPhone}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: 700; border-radius: 8px;">
                      Track Your Order Online →
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
