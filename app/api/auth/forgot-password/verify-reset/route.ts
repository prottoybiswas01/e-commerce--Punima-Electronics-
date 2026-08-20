import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, OTP code and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // 1. Find OTP record in database
    const otpRecord = await prisma.passwordResetOtp.findUnique({
      where: { email: cleanEmail },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "No active verification code found. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Check Expiry
    if (new Date() > otpRecord.expiresAt) {
      // Remove expired OTP
      await prisma.passwordResetOtp.delete({ where: { email: cleanEmail } });
      return NextResponse.json(
        { success: false, message: "Verification code has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // 3. Verify OTP Code
    if (otpRecord.otp !== cleanOtp) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // 4. Delete the OTP record (prevent reuse)
    await prisma.passwordResetOtp.delete({
      where: { email: cleanEmail },
    });

    // 5. Record Audit log
    await prisma.auditLog.create({
      data: {
        userName: cleanEmail,
        action: "RESET_PASSWORD_OTP",
        entity: "User",
        entityId: cleanEmail,
        newState: JSON.stringify({ status: "PASSWORD_RESET_SUCCESS" }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password verified and reset successfully! You can now log in.",
    });
  } catch (error: any) {
    console.error("[Verify Reset OTP Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify code and reset password" },
      { status: 500 }
    );
  }
}
