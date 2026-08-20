import React from "react";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Users, Phone, Mail, ShoppingBag } from "lucide-react";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { totalSpent: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Customer Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View customer directory, lifetime order history, contact details, and purchase value.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Phone Number</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Lifetime Spent</th>
                <th className="p-3.5">Customer Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                      {c.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-slate-700">{c.phone}</td>
                  <td className="p-3.5 text-slate-500">{c.email || "—"}</td>
                  <td className="p-3.5 font-bold text-slate-900">{c.totalOrders || c._count.orders}</td>
                  <td className="p-3.5 font-extrabold text-blue-600">{formatPrice(c.totalSpent)}</td>
                  <td className="p-3.5 text-slate-400">{formatDateTime(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
