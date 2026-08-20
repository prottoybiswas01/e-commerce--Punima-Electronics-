"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  ArrowLeft,
  KeyRound,
  Lock,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "OTP code sent to your email!");
        setStep(2);
        setResendCooldown(60);
      } else {
        toast.error(data.message || "Failed to send reset code");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("A new 6-digit OTP code has been sent to your email!");
        setResendCooldown(60);
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err: any) {
      toast.error(err.message || "Error resending OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Set New Password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit OTP code sent to your email");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Password reset successfully! You can now log in.");
        setStep(3);
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/50 space-y-6">
        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <>
            <div className="space-y-1">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <KeyRound className="h-6 w-6 text-blue-600" />
                Forgot Password?
              </h1>
              <p className="text-xs text-slate-500">
                Enter your registered email address. We'll send a 6-digit OTP verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Registered Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-xs pl-9"
                    required
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow-md shadow-blue-600/20"
              >
                {isSubmitting ? "Sending 6-Digit OTP..." : "Send Verification OTP Code"}
              </Button>
            </form>
          </>
        )}

        {/* STEP 2: Enter OTP Code & Set New Password */}
        {step === 2 && (
          <>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change Email
              </button>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                Verify OTP Code
              </h1>
              <p className="text-xs text-slate-500">
                We sent a 6-digit code to <strong>{email}</strong>. Enter the OTP code and set your new password.
              </p>
            </div>

            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              {/* 6-Digit OTP Input */}
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-xs font-bold text-slate-900">
                  6-Digit OTP Code *
                </Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 584920"
                  className="h-12 text-center text-xl font-mono tracking-widest font-extrabold border-2 border-blue-200 focus:border-blue-600"
                  required
                />
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-slate-400">Valid for 10 minutes</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="font-bold text-blue-600 hover:underline disabled:text-slate-400 flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700">
                  New Password *
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 text-xs pl-9 pr-9"
                    required
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                  Confirm New Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 text-xs pl-9"
                    required
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || otp.length < 6}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow-md shadow-blue-600/20 mt-2"
              >
                {isSubmitting ? "Verifying & Updating..." : "Verify OTP & Reset Password"}
              </Button>
            </form>
          </>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Password Reset Successful! 🎉</h2>
            <p className="text-xs text-slate-500">
              Your account password has been successfully updated. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold mt-4"
            >
              Sign In to Your Account →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
