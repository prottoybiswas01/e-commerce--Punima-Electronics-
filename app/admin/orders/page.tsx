import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Package,
  Truck,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

export const revalidate = 0;

interface AdminOrdersPageProps {
  searchParams: {
    status?: string;
    search?: string;
    payment?: string;
    page?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status, search, payment, page = "1" } = searchParams;
  const pageSize = 15;
  const currentPage = parseInt(page, 10) || 1;

  const where: any = {};

  if (status && status !== "ALL") {
    where.orderStatus = status;
  }

  if (payment && payment !== "ALL") {
    where.paymentStatus = payment;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
      { consignmentId: { contains: search } },
    ];
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const statusTabs = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Courier Booked", value: "COURIER_BOOKED" },
    { label: "In Transit", value: "IN_TRANSIT" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Returned", value: "RETURNED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer orders, track fulfillment status, and book Pathao shipments.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border">
          Total: <strong>{totalCount}</strong> orders found
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/orders?status=${tab.value}${search ? `&search=${search}` : ""}`}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition border ${
              (status === tab.value || (!status && tab.value === "ALL"))
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form method="GET" action="/admin/orders" className="flex gap-2">
          <div className="relative flex-1">
            <Input
              name="search"
              defaultValue={search || ""}
              placeholder="Search by Order #, Customer Name, Phone, Consignment ID..."
              className="h-10 text-xs pl-9"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          </div>
          {status && <input type="hidden" name="status" value={status} />}
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-4">
            Search
          </Button>
          {search && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">Clear</Link>
            </Button>
          )}
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Order Reference</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Courier Info</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No orders matching your search or filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-extrabold font-mono text-blue-600 hover:underline block"
                      >
                        #{order.orderNumber}
                      </Link>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{order.customerPhone}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-[140px]">
                        {order.district}, {order.division}
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </td>
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fee: {formatPrice(order.deliveryCharge)}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <PaymentStatusBadge status={order.paymentStatus} />
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-3.5">
                      {order.consignmentId ? (
                        <div className="text-[11px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-mono font-bold inline-block">
                          {order.consignmentId}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs font-semibold" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          Manage →
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/orders?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
