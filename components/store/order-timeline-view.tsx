import React from "react";
import { formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  XCircle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/ui/status-badge";

const ORDER_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "COURIER_BOOKED", label: "Courier Booked", icon: Truck },
  { key: "IN_TRANSIT", label: "In Transit (Pathao)", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: MapPin },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

export function OrderTimelineView({
  order,
}: {
  order: {
    orderNumber: string;
    orderStatus: string;
    consignmentId?: string | null;
    courierTrackingUrl?: string | null;
    createdAt: Date | string;
    timeline?: Array<{
      status: string;
      title: string;
      description?: string | null;
      createdAt: Date | string;
    }>;
  };
}) {
  const currentStatus = order.orderStatus;
  const isCancelled = currentStatus === "CANCELLED";
  const isReturned = currentStatus === "RETURNED" || currentStatus === "RETURN_REQUESTED";

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
        <div>
          <div className="text-xs text-slate-500 font-medium">Order Reference</div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900">
            #{order.orderNumber}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Placed on {formatDateTime(order.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={currentStatus} />
          {order.consignmentId && (
            <div className="text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span>Pathao ID: <strong>{order.consignmentId}</strong></span>
              {order.courierTrackingUrl && (
                <a
                  href={order.courierTrackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar / Stepper (if not cancelled) */}
      {!isCancelled && !isReturned && (
        <div className="py-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[580px] relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />

            {ORDER_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const stepIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
              const isCompleted = idx <= stepIndex;
              const isCurrent = idx === stepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-white border-2 border-slate-300 text-slate-400"
                    } ${isCurrent ? "animate-pulse" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium text-center ${
                      isCompleted ? "text-blue-600 font-bold" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled / Return State Banner */}
      {isCancelled && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <div className="font-bold text-sm">Order Cancelled</div>
            <div className="text-xs text-red-700">This order has been cancelled and inventory was returned to stock.</div>
          </div>
        </div>
      )}

      {/* Detailed Activity Timeline Log */}
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-bold text-slate-900 mb-4">Detailed Status History</h4>
        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {(order.timeline || []).map((event, idx) => (
            <div key={idx} className="flex gap-4 relative pl-8">
              <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
              <div>
                <div className="text-sm font-bold text-slate-900">{event.title}</div>
                {event.description && (
                  <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                )}
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatDateTime(event.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
