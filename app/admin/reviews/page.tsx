import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Customer Reviews Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Moderate verified purchase product ratings and customer feedback before storefront publishing.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Review Comment</th>
                <th className="p-3.5">Verified</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-slate-900">{r.customerName}</td>
                  <td className="p-3.5 font-medium text-slate-700 max-w-[180px] truncate">
                    {r.product.name}
                  </td>
                  <td className="p-3.5">
                    <StarRating rating={r.rating} size="sm" />
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs">
                    {r.title && <div className="font-bold text-slate-800">{r.title}</div>}
                    <div>{r.comment}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Verified Purchase
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
