import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Bell, AlertTriangle, ShoppingBag, Truck } from "lucide-react";

export const revalidate = 0;

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Alerts & Notifications
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time order notices, inventory restock alerts, and courier status events.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No system notifications recorded.
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="py-3.5 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
