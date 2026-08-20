"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportProblemModal } from "@/components/ui/report-problem-modal";
import { PackageX, RotateCcw, ArrowLeft, MessageSquareWarning } from "lucide-react";

export default function ProductPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/monitoring/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        route: typeof window !== "undefined" ? window.location.pathname : "/product",
        component: "ProductDetailsPage",
        severity: "HIGH",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errorId) setErrorId(data.errorId);
      })
      .catch(() => {});
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <PackageX className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-900">Product Unavailable</h2>
        <p className="text-xs text-slate-500">
          We were unable to load the specifications for this product. You can try refreshing or browse other items in our shop.
        </p>

        {errorId && (
          <div className="bg-slate-50 p-2.5 rounded-xl border text-[11px] text-slate-600 font-mono flex justify-between items-center">
            <span>Reference ID:</span>
            <strong className="text-blue-600">{errorId}</strong>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-xs h-10"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Try Again
          </Button>
          <Button asChild variant="outline" className="flex-1 text-xs font-bold h-10">
            <Link href="/shop">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Shop
            </Link>
          </Button>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto"
          >
            <MessageSquareWarning className="h-3.5 w-3.5" /> Report this product issue
          </button>
        </div>
      </div>

      <ReportProblemModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        errorId={errorId}
      />
    </div>
  );
}
