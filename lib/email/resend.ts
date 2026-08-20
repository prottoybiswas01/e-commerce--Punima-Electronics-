import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { generateWelcomeEmailHtml } from "./templates/welcome-email";
import { generateOrderInvoiceEmailHtml } from "./templates/order-invoice-email";
import { generateNewProductEmailHtml, generateNewProductEmailText } from "./templates/new-product-email";
import { generatePasswordResetOtpEmailHtml } from "./templates/password-reset-otp-email";

// Initialize Resend Client with environment variable
const resendApiKey = process.env.RESEND_API_KEY || "";
export const resend = new Resend(resendApiKey);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Purnima Electronics <support@punima.kodl.uk>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://punima.kodl.uk";

/**
 * 1. Send Welcome / Onboarding Email to newly registered customers
 */
export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  if (!to || !to.includes("@")) return { success: false, message: "Invalid email" };

  try {
    const html = generateWelcomeEmailHtml(name, APP_URL);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to.trim()],
      replyTo: "support@punima.kodl.uk",
      subject: `🎉 Welcome to Purnima Electronics, ${name || "Customer"}! (10% Discount Inside)`,
      html,
      tags: [
        { name: "category", value: "welcome_onboarding" },
        { name: "recipient", value: name ? name.slice(0, 30) : "customer" },
      ],
    });

    if (error) {
      console.error("[Resend Welcome Email Error]", error);
      return { success: false, error };
    }

    console.log(`[Resend Welcome Email Sent] To: ${to}, ID: ${data?.id}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Welcome Email Exception]", err);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Automated Order Confirmation & Official Digital Invoice
 */
export async function sendOrderInvoiceEmail({
  to,
  order,
}: {
  to: string;
  order: any;
}) {
  if (!to || !to.includes("@")) return { success: false, message: "Invalid email" };

  try {
    const html = generateOrderInvoiceEmailHtml(order, APP_URL);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to.trim()],
      replyTo: "support@punima.kodl.uk",
      subject: `📦 Order Confirmation & Invoice #${order.orderNumber} - Purnima Electronics`,
      html,
      tags: [
        { name: "category", value: "order_invoice" },
        { name: "order_number", value: String(order.orderNumber) },
      ],
    });

    if (error) {
      console.error("[Resend Order Invoice Error]", error);
      return { success: false, error };
    }

    console.log(`[Resend Order Invoice Sent] To: ${to}, ID: ${data?.id}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Order Invoice Exception]", err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Broadcast New Product Marketing Announcement to all registered users and customers
 */
export async function broadcastNewProductEmail({
  product,
  targetEmail,
}: {
  product: any;
  targetEmail?: string;
}) {
  try {
    const allEmails = new Set<string>();

    if (targetEmail && targetEmail.includes("@")) {
      allEmails.add(targetEmail.trim().toLowerCase());
    } else {
      // Fetch from both User and Customer database collections
      const [users, customers] = await Promise.all([
        prisma.user.findMany({ select: { email: true } }),
        prisma.customer.findMany({
          where: { isBlocked: false },
          select: { email: true },
        }),
      ]);

      users.forEach((u) => u.email && allEmails.add(u.email.trim().toLowerCase()));
      customers.forEach((c) => c.email && allEmails.add(c.email.trim().toLowerCase()));
    }

    const validEmails = Array.from(allEmails).filter((e) => e.includes("@"));

    if (validEmails.length === 0) {
      console.warn("[Resend Broadcast] No recipient emails found in database.");
      return { success: false, message: "No registered customer emails found to send." };
    }

    const html = generateNewProductEmailHtml(product, APP_URL);
    const text = generateNewProductEmailText(product, APP_URL);
    console.log(`[Resend Broadcast] Sending new product email for "${product.name}" to ${validEmails.length} recipients:`, validEmails);

    // Fast parallel dispatch using Promise.allSettled
    const sendPromises = validEmails.map(async (email) => {
      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        replyTo: "support@punima.kodl.uk",
        headers: {
          "List-Unsubscribe": `<mailto:support@punima.kodl.uk?subject=unsubscribe>`,
        },
        subject: `New Arrival: ${product.name} at Purnima Electronics`,
        html,
        text,
        tags: [
          { name: "category", value: "marketing_new_product" },
          { name: "product_sku", value: product.sku || "product" },
        ],
      });
      return { email, ...response };
    });

    const settledResults = await Promise.allSettled(sendPromises);
    const sentResults: any[] = [];
    const errors: any[] = [];

    settledResults.forEach((res) => {
      if (res.status === "fulfilled") {
        if (res.value.error) {
          errors.push({ email: res.value.email, error: res.value.error });
        } else {
          sentResults.push({ email: res.value.email, id: res.value.data?.id });
        }
      } else {
        errors.push({ error: res.reason });
      }
    });

    console.log(`[Resend Broadcast Complete] Sent: ${sentResults.length}, Errors: ${errors.length}`);

    return {
      success: sentResults.length > 0,
      sentCount: sentResults.length,
      failedCount: errors.length,
      sentResults,
      errors,
    };
  } catch (err: any) {
    console.error("[Resend Broadcast Fatal Exception]", err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Send 6-Digit Password Reset OTP Verification Email
 */
export async function sendPasswordResetOtpEmail({
  to,
  otp,
  name,
}: {
  to: string;
  otp: string;
  name?: string;
}) {
  if (!to || !to.includes("@")) return { success: false, message: "Invalid email" };

  try {
    const html = generatePasswordResetOtpEmailHtml(otp, name);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to.trim()],
      replyTo: "support@punima.kodl.uk",
      subject: `🔑 Your Password Reset Code: ${otp} - Purnima Electronics`,
      html,
      text: `Your Purnima Electronics password reset verification code is: ${otp}. Valid for 10 minutes.`,
      tags: [
        { name: "category", value: "auth_otp_verification" },
      ],
    });

    if (error) {
      console.error("[Resend OTP Email Error]", error);
      return { success: false, error };
    }

    console.log(`[Resend OTP Email Sent] To: ${to}, ID: ${data?.id}`);
    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend OTP Email Exception]", err);
    return { success: false, error: err.message };
  }
}
