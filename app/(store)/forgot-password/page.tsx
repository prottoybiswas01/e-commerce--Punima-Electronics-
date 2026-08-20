"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const success = await resetPassword(email);
    setIsSubmitting(false);

    if (success) {
      setIsSent(true);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/50 space-y-6">
        {isSent ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Check Your Email</h2>
            <p className="text-xs text-slate-500">
              We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
            </p>
            <Button asChild className="w-full bg-slate-900 text-xs font-bold mt-2">
              <Link href="/login">Return to Sign In</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Reset Your Password
              </h1>
              <p className="text-xs text-slate-500">
                Enter your registered account email and we'll send you a secure link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address
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
                {isSubmitting ? "Sending Reset Link..." : "Send Password Reset Link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
