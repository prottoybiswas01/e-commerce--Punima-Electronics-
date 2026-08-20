import React from "react";
import Link from "next/link";
import { getDashboardAnalytics } from "@/lib/services/analytics.service";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { StatsCard } from "@/components/admin/stats-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusBadge, PaymentStatusBadge, StockStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  PackageCheck,
  Truck,
  RotateCcw,
  XCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Plus,
  Zap,
} from "lucide-react";

export const revalidate = 0;

interface AdminDashboardProps {
  searchParams: {
    range?: string;
  };
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardProps) {
  const range = searchParams.range || "30d";
  const data = await getDashboardAnalytics(range);

  const rangeButtons = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "This Month", value: "this_month" },
    { label: "This Year", value: "this_year" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Business Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time performance analytics, revenue ledger, inventory alerts and order fulfillment.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
          {rangeButtons.map((btn) => (
            <Link
              key={btn.value}
              href={`/admin?range=${btn.value}`}
              className={`px-3 py-1.5 rounded-lg transition ${
                range === btn.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {btn.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Top 4 Primary Revenue & Sales Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Range Revenue"
          value={formatPrice(data.metrics.rangeRevenue)}
          subtitle="Gross sales in selected period"
          icon={DollarSign}
          variant="blue"
          trend={{ value: "14.2%", isPositive: true }}
        />
        <StatsCard
          title="Today's Sales"
          value={formatPrice(data.metrics.todayRevenue)}
          subtitle={`${data.metrics.todayOrderCount} orders received today`}
          icon={TrendingUp}
          variant="emerald"
        />
        <StatsCard
          title="Estimated Gross Profit"
          value={formatPrice(data.metrics.grossProfit)}
          subtitle="Selling price minus product cost"
          icon={Zap}
          variant="purple"
        />
        <StatsCard
          title="Total Orders"
          value={data.metrics.totalOrders}
          subtitle={`${data.metrics.pendingOrders} awaiting confirmation`}
          icon={ShoppingBag}
          variant="amber"
        />
      </div>

      {/* Secondary Status Pipeline Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-amber-600 uppercase">Pending</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{data.metrics.pendingOrders}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Needs action</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-blue-600 uppercase">Processing</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{data.metrics.processingOrders}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Being packed</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-600 uppercase">Delivered</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{data.metrics.deliveredOrders}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Completed</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-rose-600 uppercase">Low Stock</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{data.metrics.lowStockCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Reorder alert</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-red-600 uppercase">Cancelled</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{data.metrics.cancelledOrders}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Restocked</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-indigo-600 uppercase">Customers</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{data.metrics.totalCustomers}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Registered</div>
        </div>
      </div>

      {/* Main Chart & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Sales & Profit Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Blue = Revenue, Green = Estimated Gross Profit
              </p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Detailed Report <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <RevenueChart data={data.chartData} />
        </div>

        {/* Top Selling Products & Quick Actions (1 Col) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base pb-2 border-b border-slate-100">
              Top Selling Products
            </h3>
            <div className="divide-y divide-slate-100 mt-2 text-xs">
              {data.topSellingItems.map((item, idx) => (
                <div key={item.productId} className="py-2.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-slate-100 font-bold text-[10px] flex items-center justify-center text-slate-600">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1 max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatPrice(item.totalRevenue)}</div>
                    <div className="text-[10px] text-slate-400">{item.soldQuantity} sold</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-xs" asChild>
              <Link href="/admin/products/new">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New Product
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="w-full font-bold text-xs" asChild>
              <Link href="/admin/courier">
                <Truck className="h-3.5 w-3.5 mr-1" /> Pathao Courier Dispatch
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Orders Table & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Orders</h3>
              <p className="text-xs text-slate-400">Latest transactions requiring fulfillment</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs font-bold" asChild>
              <Link href="/admin/orders">View All Orders</Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Order Status</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-bold font-mono text-blue-600">
                      <Link href={`/admin/orders/${order.id}`}>#{order.orderNumber}</Link>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-3.5">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="p-3.5 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 font-semibold" asChild>
                        <Link href={`/admin/orders/${order.id}`}>Details →</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-rose-600">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </h3>
            <Link href="/admin/inventory" className="text-xs text-blue-600 font-semibold hover:underline">
              Inventory Ledger
            </Link>
          </div>

          <div className="space-y-3">
            {data.lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">All products have healthy inventory!</div>
            ) : (
              data.lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs line-clamp-1 max-w-[150px]">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                  </div>
                  <StockStatusBadge stock={p.stock} lowThreshold={p.lowStockThreshold} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
