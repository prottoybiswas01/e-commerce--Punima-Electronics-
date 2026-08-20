import React from "react";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { RotateCcw, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { orderNumber: true, customerName: true, customerPhone: true } },
      orderItem: { select: { productName: true, sku: true, unitPrice: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Returns & Refund Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Process 7-day replacement claims, inspect product conditions, and manage inventory restocks.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product Claimed</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5">Return Status</th>
                <th className="p-3.5">Refund Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No active return requests.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-600">
                      #{r.order.orderNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{r.order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{r.order.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{r.orderItem.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {r.orderItem.sku}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{r.reason}</td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {r.condition}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {r.refundStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
