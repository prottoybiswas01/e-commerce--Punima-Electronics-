import React from "react";
import prisma from "@/lib/prisma";
import { Sparkles, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Flash Sales & Promotional Campaigns
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage live flash sales, countdown deals, and festival promotional banners.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-900">
          <Sparkles className="h-6 w-6 text-rose-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Flash Sale Engine (Active)</h4>
            <p className="text-xs text-rose-700">
              Homepage live timer currently highlights products with active discounts of 5% or higher.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Tip: Set product discount percentage or compare-at prices in Product Management to feature them in the flash sale section.
        </div>
      </div>
    </div>
  );
}
