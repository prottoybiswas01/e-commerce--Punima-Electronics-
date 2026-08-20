"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export interface CustomerData {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  addresses?: any[];
  orders?: any[];
  reviews?: any[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  customer: CustomerData | null;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (
    email: string,
    pass: string,
    name: string,
    phone: string
  ) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileDetails: (name: string, phone: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync DB profile when Firebase user changes
  const fetchDbProfile = async (fbUser: FirebaseUser) => {
    try {
      const res = await fetch(
        `/api/user/profile?email=${encodeURIComponent(fbUser.email || "")}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomer(data.customer);
          return;
        }
      }

      // If user doesn't exist yet in DB, sync/create it
      const syncRes = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split("@")[0],
          phone: fbUser.phoneNumber || "01700000000",
        }),
      });

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.customer) {
          setCustomer(syncData.customer);
        }
      }
    } catch (e) {
      console.error("[Auth Profile Fetch Error]", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser && fbUser.email) {
        await fetchDbProfile(fbUser);
      } else {
        setCustomer(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user && user.email) {
      await fetchDbProfile(user);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchDbProfile(userCred.user);
      toast.success("Welcome back!");
      return true;
    } catch (error: any) {
      let msg = "Failed to sign in";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        msg = "Invalid email address or password.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again in a few minutes.";
      }
      toast.error(msg);
      return false;
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    phone: string
  ): Promise<boolean> => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateFirebaseProfile(userCred.user, { displayName: name });

      // Sync to database
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: userCred.user.uid,
          email: userCred.user.email,
          name,
          phone,
        }),
      });

      await fetchDbProfile(userCred.user);
      toast.success("Account created successfully!");
      return true;
    } catch (error: any) {
      let msg = "Failed to register";
      if (error.code === "auth/email-already-in-use") {
        msg = "An account already exists with this email address.";
      } else if (error.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      toast.error(msg);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      await fetchDbProfile(userCred.user);
      toast.success("Signed in with Google!");
      return true;
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google authentication failed. Please use email & password.");
      }
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("Password reset link sent to your email!");
      return true;
    } catch (error: any) {
      let msg = "Failed to send password reset email";
      if (error.code === "auth/user-not-found") {
        msg = "No account found with this email address.";
      }
      toast.error(msg);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCustomer(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Error signing out");
    }
  };

  const updateProfileDetails = async (name: string, phone: string): Promise<boolean> => {
    if (!user?.email) return false;
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name,
          phone,
        }),
      });

      if (res.ok) {
        if (auth.currentUser) {
          await updateFirebaseProfile(auth.currentUser, { displayName: name });
        }
        await fetchDbProfile(user);
        toast.success("Profile updated successfully");
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to update profile");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
        refreshProfile,
        updateProfileDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
