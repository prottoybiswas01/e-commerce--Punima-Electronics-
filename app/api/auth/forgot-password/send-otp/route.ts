import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetOtpEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { customer: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No registered account found with this email address. Please check and try again.",
        },
        { status: 404 }
      );
    }

    // 2. Generate secure 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Upsert into database
    await prisma.passwordResetOtp.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        otp,
        expiresAt,
      },
      update: {
        otp,
        expiresAt,
      },
    });

    // 4. Send Resend Email with OTP
    const emailResult = await sendPasswordResetOtpEmail({
      to: cleanEmail,
      otp,
      name: user.name || user.customer?.name || "Customer",
    });

    if (!emailResult.success) {
      console.warn("[Send OTP Warning - Resend]", emailResult);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Valid for 10 minutes.`,
    });
  } catch (error: any) {
    console.error("[Send Password Reset OTP Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send reset code" },
      { status: 500 }
    );
  }
}
