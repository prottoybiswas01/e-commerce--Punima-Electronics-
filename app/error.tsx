"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Store Error Boundary Caught]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-900">Something Went Wrong</h2>
        <p className="text-xs text-slate-500">
          We encountered an unexpected error while processing this request. Our technical team has been notified.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-xs h-10"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Try Again
          </Button>
          <Button asChild variant="outline" className="flex-1 text-xs font-bold h-10">
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-1.5" /> Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
