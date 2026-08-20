"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
    division: string;
    district: string;
    upazila: string;
    addressLine: string;
    deliveryInstructions?: string | null;
    orderNotes?: string | null;
    subtotal: number;
    discountAmount: number;
    couponDiscount: number;
    couponCode?: string | null;
    deliveryCharge: number;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    courierProvider?: string | null;
    consignmentId?: string | null;
    trackingCode?: string | null;
    courierTrackingUrl?: string | null;
    createdAt: Date | string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      variantName?: string | null;
      sku: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      totalPrice: number;
    }>;
    timeline: Array<{
      id: string;
      status: string;
      title: string;
      description?: string | null;
      createdBy: string;
      createdAt: Date | string;
    }>;
  };
}

const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "COURIER_BOOKED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
];

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus);
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBookingShipment, setIsBookingShipment] = useState(false);

  // Calculate profit
  const totalCost = order.items.reduce((sum, i) => sum + i.costPrice * i.quantity, 0);
  const grossProfit = Math.max(0, order.subtotal - totalCost - order.couponDiscount);

  const handleStatusChange = async () => {
    if (currentStatus === order.orderStatus) {
      toast.info("Status unchanged");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus, note: statusNote }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      toast.success(`Order status updated to ${currentStatus}`);
      setStatusNote("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBookPathaoShipment = async () => {
    setIsBookingShipment(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/shipment`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Courier booking failed");
      }

      toast.success(`Pathao Shipment booked! Consignment: ${data.consignmentId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Pathao booking failed");
    } finally {
      setIsBookingShipment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <div className="text-xs text-slate-500 font-medium">Order Management</div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            #{order.orderNumber}
          </h1>
          <div className="text-xs text-slate-400 mt-0.5">
            Placed on {formatDateTime(order.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>

          {!order.consignmentId ? (
            <Button
              size="sm"
              disabled={isBookingShipment || order.orderStatus === "CANCELLED"}
              onClick={handleBookPathaoShipment}
              className="bg-blue-600 hover:bg-blue-700 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Truck className="h-4 w-4" />
              {isBookingShipment ? "Booking Pathao..." : "Create Pathao Shipment"}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                Pathao ID: <strong>{order.consignmentId}</strong>
              </span>
              {order.courierTrackingUrl && (
                <Button size="sm" variant="outline" className="h-8 text-xs font-bold" asChild>
                  <a href={order.courierTrackingUrl} target="_blank" rel="noreferrer">
                    Track on Pathao <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Status Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer, Items, Financials (Printable) */}
        <div id="printable-invoice" className="lg:col-span-2 space-y-6">
          {/* Customer & Shipping Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Customer & Delivery Details</span>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.orderStatus} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-slate-400 font-medium">Customer:</div>
                <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
                <div className="font-mono text-slate-700 font-semibold">{order.customerPhone}</div>
                {order.customerEmail && <div className="text-slate-500">{order.customerEmail}</div>}
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 font-medium">Delivery Destination:</div>
                <div className="font-medium text-slate-800">{order.addressLine}</div>
                <div className="text-slate-600">
                  {order.upazila}, {order.district}, {order.division}
                </div>
                {order.deliveryInstructions && (
                  <div className="text-amber-700 font-medium bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                    Note: {order.deliveryInstructions}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Ordered Products ({order.items.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-slate-500 text-[11px]">Variant: {item.variantName}</div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                      <td className="p-3 font-semibold text-slate-700">{formatPrice(item.unitPrice)}</td>
                      <td className="p-3 font-bold text-slate-900">{item.quantity}</td>
                      <td className="p-3 text-right font-extrabold text-slate-900">
                        {formatPrice(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
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
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryCharge === 0 ? "FREE" : formatPrice(order.deliveryCharge)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="text-sm font-bold">Total Amount</span>
                <span className="text-lg font-extrabold text-blue-600">{formatPrice(order.totalAmount)}</span>
              </div>

              {/* Admin Profit Insights */}
              <div className="pt-3 mt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500 space-y-1 no-print">
                <div className="flex justify-between">
                  <span>Item Cost Price:</span>
                  <span>{formatPrice(totalCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Gross Profit:</span>
                  <span>{formatPrice(grossProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Order Lifecycle Status Stepper & Internal Notes (no-print) */}
        <div className="space-y-6 no-print">
          {/* Status Updater Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" /> Update Order Status
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Next Status:</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Internal Status Note:</label>
                <input
                  type="text"
                  placeholder="e.g. Phone confirmed, parcel handed to rider"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <Button
                onClick={handleStatusChange}
                disabled={isUpdatingStatus || currentStatus === order.orderStatus}
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-xs h-9"
              >
                {isUpdatingStatus ? "Updating..." : "Save Status Transition"}
              </Button>
            </div>
          </div>

          {/* Activity Timeline Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Audit & Status Timeline
            </h3>

            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {order.timeline.map((event) => (
                <div key={event.id} className="relative pl-6">
                  <div className="absolute left-0.5 top-1 h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white" />
                  <div className="font-bold text-slate-900">{event.title}</div>
                  {event.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{event.description}</p>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {formatDateTime(event.createdAt)} • by {event.createdBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
