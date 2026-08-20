"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Tag,
  Sparkles,
  Image as ImageIcon,
  RotateCcw,
  Truck,
  BarChart3,
  MessageSquare,
  Bell,
  UserCheck,
  History,
  Settings,
  Store,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/promotions", label: "Promotions", icon: Sparkles },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/returns", label: "Returns & Refunds", icon: RotateCcw },
  { href: "/admin/courier", label: "Pathao Courier", icon: Truck },
  { href: "/admin/reports", label: "Reports & Profit", icon: BarChart3 },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/admin-users", label: "Admin & Roles", icon: UserCheck },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
];

export function AdminSidebar({
  onCloseMobile,
}: {
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Brand Top Bar */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            PE
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight">
              PURNIMA ADMIN
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Retail Management System
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Storefront Shortcut */}
      <div className="p-3 border-t border-slate-900">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
        >
          <span className="flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-400" />
            <span>View Storefront</span>
          </span>
          <span className="text-[10px] text-slate-500">↗</span>
        </Link>
      </div>
    </aside>
  );
}
