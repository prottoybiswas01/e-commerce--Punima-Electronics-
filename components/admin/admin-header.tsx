"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Shield,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { toast } from "sonner";

export function AdminHeader({
  adminUser,
  notifications = [],
}: {
  adminUser?: { name: string; email: string; role: string };
  notifications?: Array<{ id: string; title: string; message: string; isRead: boolean }>;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    toast.info("Logged out from admin panel");
    router.push("/admin/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile Sidebar Trigger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="text-slate-600">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-slate-950 border-r-0">
            <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Global Admin Search Bar */}
        <form onSubmit={handleGlobalSearch} className="relative w-full hidden sm:block">
          <input
            type="text"
            placeholder="Quick search Order #, Phone, SKU, Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
        </form>
      </div>

      {/* Right: Notification Center & Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Live Notification Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-600 rounded-full">
              <Bell className="h-5 w-5" />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex justify-between items-center px-2 py-1.5 border-b border-slate-100 mb-1">
              <span className="text-xs font-bold text-slate-900">Notifications & Alerts</span>
              <Link href="/admin/notifications" className="text-[11px] text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">No new notifications</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-50 text-xs hover:bg-slate-100 transition">
                    <div className="font-bold text-slate-800">{n.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Role Badge & Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                SA
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-bold text-slate-900 leading-tight">
                  {adminUser?.name || "Shop Owner"}
                </div>
                <div className="text-[10px] text-blue-600 font-semibold uppercase">
                  {adminUser?.role || "SUPER ADMIN"}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">
              <div>{adminUser?.name || "Shop Owner"}</div>
              <div className="text-[10px] text-slate-400 font-normal">{adminUser?.email || "owner@purnimaelectronics.com"}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer text-xs">
                Store Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/admin-users" className="cursor-pointer text-xs">
                Roles & Permissions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank" className="cursor-pointer text-xs flex items-center justify-between">
                Customer Store <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer text-xs flex items-center gap-2 font-semibold">
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
