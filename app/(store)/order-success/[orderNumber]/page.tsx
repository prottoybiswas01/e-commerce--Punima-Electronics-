import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Printer,
  ShieldCheck,
  ArrowRight,
  Package,
  MapPin,
  Phone,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/status-badge";

export const revalidate = 0;

interface OrderSuccessProps {
  params: {
    orderNumber: string;
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: true,
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
      {/* Success Top Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center space-y-4">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            We have received your order and our team is preparing it for shipment with Pathao Courier.
          </p>
        </div>

        {/* Order Reference Badge */}
        <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold">
          <span className="text-slate-500">Order Number:</span>
          <span className="font-extrabold text-blue-600 font-mono text-base">
            #{order.orderNumber}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 font-semibold flex items-center gap-1.5"
            asChild
          >
            <Link href={`/track-order?search=${order.orderNumber}`}>
              <ShieldCheck className="h-4 w-4" /> Track Order Status
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="font-semibold flex items-center gap-1.5"
            asChild
          >
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>

      {/* Itemized Order Summary Box (Printable) */}
      <div id="printable-invoice" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mt-6 space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Invoice Details</h3>
            <p className="text-xs text-slate-400">Date: {formatDateTime(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.orderStatus} />
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-blue-600" /> Recipient Details:
            </div>
            <div className="text-slate-700 font-semibold">{order.customerName}</div>
            <div className="text-slate-600 flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-slate-400" /> {order.customerPhone}
            </div>
            {order.customerEmail && <div className="text-slate-500">{order.customerEmail}</div>}
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-rose-600" /> Delivery Address:
            </div>
            <div className="text-slate-700">{order.addressLine}</div>
            <div className="text-slate-600">
              {order.upazila}, {order.district}, {order.division}
            </div>
            <div className="text-slate-500 font-medium mt-1">Payment: <strong>{order.paymentMethod}</strong></div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Items Ordered</h4>
          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  {item.variantName && <div className="text-slate-500">Variant: {item.variantName}</div>}
                  <div className="text-[11px] text-slate-400 font-mono">SKU: {item.sku} × {item.quantity}</div>
                </div>
                <div className="font-extrabold text-slate-900 text-right">
                  {formatPrice(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-slate-200 pt-4 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
          </div>
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-{formatPrice(order.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-slate-900">
              {order.deliveryCharge === 0 ? "FREE" : formatPrice(order.deliveryCharge)}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Payable</span>
            <span className="text-lg font-extrabold text-blue-600">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
