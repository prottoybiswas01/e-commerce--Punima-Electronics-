import React from "react";
import { getAdminSession } from "@/lib/auth/session";
import { getRecentNotifications } from "@/lib/services/notification.service";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const notifications = await getRecentNotifications(6);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          adminUser={{
            name: session?.name || "Shop Owner",
            email: session?.email || "owner@purnimaelectronics.com",
            role: session?.role || "SUPER_ADMIN",
          }}
          notifications={notifications}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
