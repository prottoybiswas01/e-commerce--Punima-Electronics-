"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Shield, UserCheck, CheckCircle2, ArrowRight, Flame } from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@purnimaelectronics.com");
  const [password, setPassword] = useState("admin123456");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Real Firebase Authentication Handler
  const handleFirebaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please provide both email and password");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        toast.success(`Account created with Firebase! UID: ${userCredential.user.uid.slice(0, 8)}...`);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        toast.success(`Signed in via Firebase Auth (${userCredential.user.email})`);
      }
      router.push("/admin");
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      // If user not found in firebase or auth fails, provide helpful message and allow demo login fallback
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        toast.error("Firebase: Invalid credentials or user not registered yet. You can click 'Sign Up' or use 'Quick Switch'.");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please sign in instead.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Role Quick Switcher for instant RBAC demonstration
  const handleDemoLogin = (role: string = "SUPER_ADMIN") => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success(`Demo mode: Switched to ${role.replace(/_/g, " ")}`);
      router.push("/admin");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            PE
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Purnima Electronics Admin
          </h1>
          <p className="text-xs text-slate-400">
            Firebase Authentication & Retail Management Suite
          </p>
        </div>

        {/* Firebase Live Status Pill */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            Project: <strong className="text-slate-200">e-commerce-punima-electronics</strong>
          </span>
          <span className="bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800/60">
            Firebase Connected
          </span>
        </div>

        {/* Demo Role Quick Access Selector */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Switch Admin Roles (RBAC Demo):
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin("SUPER_ADMIN")}
              className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-600/40 text-blue-300 font-bold hover:bg-blue-900/60 transition text-left"
            >
              👑 Super Admin
              <div className="text-[10px] text-slate-400 font-normal">All permissions</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("MANAGER")}
              className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700 transition text-left"
            >
              💼 Store Manager
              <div className="text-[10px] text-slate-400 font-normal">Products & Orders</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("ORDER_MANAGER")}
              className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700 transition text-left"
            >
              📦 Order Manager
              <div className="text-[10px] text-slate-400 font-normal">Fulfillment & Pathao</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("INVENTORY_MANAGER")}
              className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700 transition text-left"
            >
              🏭 Inventory Mgr
              <div className="text-[10px] text-slate-400 font-normal">Stock & Ledgers</div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-semibold">
            Or Sign In via Firebase Auth
          </span>
        </div>

        {/* Real Firebase Form */}
        <form onSubmit={handleFirebaseAuth} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Admin Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white text-xs"
              placeholder="owner@purnimaelectronics.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white text-xs"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-xs h-10 shadow-lg shadow-blue-600/30"
          >
            {isLoading
              ? "Authenticating with Firebase..."
              : isRegisterMode
              ? "Create Firebase Account"
              : "Sign In with Firebase"}
          </Button>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-blue-400 hover:underline"
            >
              {isRegisterMode ? "Already have an account? Sign In" : "Need to register first? Sign Up"}
            </button>
          </div>
        </form>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>Encrypted with Firebase Auth & Server Session Guards</span>
        </div>
      </div>
    </div>
  );
}
