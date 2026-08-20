import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminCourierPage() {
  const shipments = await prisma.courierShipment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { orderNumber: true, customerName: true, customerPhone: true, addressLine: true, orderStatus: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pathao Courier Integration Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor consignment tracking, delivery milestones, Cash on Delivery collection, and rider dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Pathao API Connected (Sandbox/Live)</span>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Consignment ID</th>
                <th className="p-3.5">Order Reference</th>
                <th className="p-3.5">Recipient Details</th>
                <th className="p-3.5">COD Amount</th>
                <th className="p-3.5">Weight</th>
                <th className="p-3.5">Courier Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No shipments dispatched yet. Go to Order Details to create a Pathao shipment.
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5">
                      <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {s.consignmentId}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDateTime(s.createdAt)}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      <Link href={`/admin/orders/${s.orderId}`} className="hover:text-blue-600">
                        #{s.merchantOrderId}
                      </Link>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{s.order.customerName}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{s.order.customerPhone}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-[150px]">
                        {s.order.addressLine}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{formatPrice(s.codAmount)}</td>
                    <td className="p-3.5 text-slate-600 font-semibold">{s.weight} kg</td>
                    <td className="p-3.5">
                      <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {s.trackingUrl && (
                        <Button size="sm" variant="outline" className="h-7 text-xs font-bold" asChild>
                          <a href={s.trackingUrl} target="_blank" rel="noreferrer">
                            Track <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </Button>
                      )}
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
