"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error Boundary Caught]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">Admin Action Error</h2>
        <p className="text-xs text-slate-500">
          An error occurred in the backoffice management system. Check your database connection or try again.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 font-bold text-xs h-9"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retry
          </Button>
          <Button asChild variant="outline" className="flex-1 text-xs font-bold h-9">
            <Link href="/admin">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
