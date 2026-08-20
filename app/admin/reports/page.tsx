import React from "react";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, DollarSign, TrendingUp, Zap } from "lucide-react";

export const revalidate = 0;

export default async function AdminReportsPage() {
  const [orders, orderItems, products] = await Promise.all([
    prisma.order.findMany({
      where: { isCancelled: false },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.orderItem.findMany({
      include: { product: true, order: true },
    }),
    prisma.product.findMany({
      where: { isArchived: false },
      orderBy: { stock: "asc" },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCost = orderItems.reduce((sum, i) => sum + (i.costPrice || i.unitPrice * 0.75) * i.quantity, 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + o.couponDiscount + o.discountAmount, 0);
  const grossProfit = Math.max(0, totalRevenue - totalCost);
  const estimatedNetProfit = Math.max(0, grossProfit - totalDiscounts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profit margin analysis, product cost breakdown, and operational ledger.
          </p>
        </div>
      </div>

      {/* Top 3 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Gross Revenue
          </span>
          <div className="text-2xl font-black text-slate-900">{formatPrice(totalRevenue)}</div>
          <div className="text-[11px] text-slate-400">Total {orders.length} non-cancelled orders</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Gross Profit
          </span>
          <div className="text-2xl font-black text-emerald-600">{formatPrice(grossProfit)}</div>
          <div className="text-[11px] text-slate-400">Revenue minus product procurement cost</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Net Profit
          </span>
          <div className="text-2xl font-black text-blue-600">{formatPrice(estimatedNetProfit)}</div>
          <div className="text-[11px] text-slate-400">After coupon vouchers deduction</div>
        </div>
      </div>

      {/* Item-by-item Profitability Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <h3 className="font-bold text-slate-900 text-sm">Product-Wise Profitability Ledger</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Cost Price</th>
                <th className="p-3">Unit Margin</th>
                <th className="p-3">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const margin = p.price - p.costPrice;
                const marginPct = p.price > 0 ? Math.round((margin / p.price) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                    <td className="p-3 font-semibold text-slate-800">{formatPrice(p.price)}</td>
                    <td className="p-3 text-slate-500">{formatPrice(p.costPrice)}</td>
                    <td className="p-3 font-extrabold text-emerald-600">{formatPrice(margin)}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {marginPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
