import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Package,
  MapPin,
  Clock,
  ExternalLink,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0;

export default async function AccountPage() {
  // Fetch sample customer orders
  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 max-w-5xl space-y-8">
      {/* Profile Top Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            MH
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Mahmudul Hasan
            </h1>
            <p className="text-xs text-slate-500">
              01711223344 • mahmud@example.com
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                Verified Retail Customer
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/track-order">
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Track Shipments
            </Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/shop">Browse Store</Link>
          </Button>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" /> My Orders ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
            <p className="text-xs text-slate-500 mt-1">Your order history will show up here once you make a purchase.</p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Order Reference:</span>{" "}
                    <strong className="text-slate-900 font-mono text-sm">#{order.orderNumber}</strong>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Placed on {formatDateTime(order.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.orderStatus} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                {/* Items in order */}
                <div className="divide-y divide-slate-100 text-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        {item.variantName && <div className="text-slate-500 text-[11px]">Variant: {item.variantName}</div>}
                        <div className="text-slate-400 text-[11px]">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-slate-900">
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500">Delivery Address:</span>{" "}
                    <span className="text-slate-800 font-medium">{order.addressLine}, {order.district}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px]">Total Payable: </span>
                      <strong className="text-sm font-extrabold text-blue-600">
                        {formatPrice(order.totalAmount)}
                      </strong>
                    </div>

                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" asChild>
                      <Link href={`/track-order?search=${order.orderNumber}`}>
                        Track Order <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
