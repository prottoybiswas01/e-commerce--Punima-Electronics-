import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { generateWelcomeEmailHtml } from "./templates/welcome-email";
import { generateOrderInvoiceEmailHtml } from "./templates/order-invoice-email";
import { generateNewProductEmailHtml } from "./templates/new-product-email";
import { generatePasswordResetOtpEmailHtml } from "./templates/password-reset-otp-email";

const resendApiKey = process.env.RESEND_API_KEY || "";
export const resend = new Resend(resendApiKey);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Purnima Electronics <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://purnimaelectronics.com";

/**
 * 1. Send Welcome / Onboarding Email to newly registered customers
 */
export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  if (!to || !to.includes("@")) return { success: false, message: "Invalid email" };

  try {
    const html = generateWelcomeEmailHtml(name, APP_URL);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎉 Welcome to Purnima Electronics, ${name || "Customer"}! (10% Discount Inside)`,
      html,
    });

    if (error) {
      console.error("[Resend Welcome Email Error]", error);
      return { success: false, error };
    }

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
      to,
      subject: `📦 Order Confirmation & Invoice #${order.orderNumber} - Purnima Electronics`,
      html,
    });

    if (error) {
      console.error("[Resend Order Invoice Error]", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend Order Invoice Exception]", err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Broadcast New Product Marketing Announcement to registered customer database
 */
export async function broadcastNewProductEmail({ product }: { product: any }) {
  try {
    // Fetch all registered customer emails
    const customers = await prisma.customer.findMany({
      where: {
        email: { not: null },
        isBlocked: false,
      },
      select: { email: true, name: true },
      take: 100, // Safe batch limit per product launch
    });

    const validEmails = customers
      .map((c) => c.email?.trim())
      .filter((e): e is string => Boolean(e && e.includes("@")));

    if (validEmails.length === 0) {
      return { success: true, message: "No customer emails to broadcast" };
    }

    const html = generateNewProductEmailHtml(product, APP_URL);

    // Send emails in parallel or batches
    const sendPromises = validEmails.map((email) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `🔥 New Arrival: ${product.name} at Purnima Electronics`,
        html,
      })
    );

    const results = await Promise.allSettled(sendPromises);
    return { success: true, count: validEmails.length, results };
  } catch (err: any) {
    console.error("[Resend Broadcast Exception]", err);
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
      to,
      subject: `🔑 Your Password Reset Code: ${otp} - Purnima Electronics`,
      html,
    });

    if (error) {
      console.error("[Resend OTP Email Error]", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Resend OTP Email Exception]", err);
    return { success: false, error: err.message };
  }
}
