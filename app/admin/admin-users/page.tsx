import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import {
  UserCheck,
  Shield,
  Key,
  ShieldAlert,
  Lock,
  CheckCircle2,
  Users,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";

export const revalidate = 0;

function formatPermissionLabel(key: string): string {
  const dictionary: Record<string, string> = {
    view_orders: "View Orders",
    update_orders: "Update Orders",
    cancel_orders: "Cancel Orders",
    create_shipment: "Create Shipment",
    process_refunds: "Process Refunds",
    view_products: "View Products",
    create_products: "Create Products",
    edit_products: "Edit Products",
    delete_products: "Delete Products",
    manage_categories: "Manage Categories",
    view_inventory: "View Inventory",
    manage_inventory: "Manage Stock & Restock",
    manage_coupons: "Manage Coupons",
    manage_banners: "Manage Banners",
    manage_promotions: "Manage Promotions",
    view_customers: "View Customers",
    manage_customers: "Manage Customers",
    manage_reviews: "Moderate Reviews",
    manage_returns: "Manage Returns",
    view_reports: "View Sales Reports",
    view_audit_logs: "View Audit Logs",
    manage_settings: "Manage Store Settings",
    manage_admins: "Manage Admins & Roles",
  };

  if (dictionary[key]) {
    return dictionary[key];
  }

  // Fallback title-cased converter
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getPermissionBadgeStyle(key: string): string {
  if (key.startsWith("delete_") || key.startsWith("cancel_")) {
    return "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100";
  }
  if (key.startsWith("view_")) {
    return "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100";
  }
  if (key.startsWith("create_") || key.startsWith("manage_inventory")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100";
  }
  if (key.includes("settings") || key.includes("admin")) {
    return "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100";
  }
  return "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100";
}

function getRoleIconColor(name: string) {
  switch (name.toLowerCase()) {
    case "super admin":
      return {
        bg: "bg-purple-100 text-purple-700 border-purple-200",
        icon: "text-purple-600",
        badge: "bg-purple-600 text-white",
      };
    case "admin":
      return {
        bg: "bg-blue-100 text-blue-700 border-blue-200",
        icon: "text-blue-600",
        badge: "bg-blue-600 text-white",
      };
    case "manager":
      return {
        bg: "bg-indigo-100 text-indigo-700 border-indigo-200",
        icon: "text-indigo-600",
        badge: "bg-indigo-600 text-white",
      };
    case "order manager":
      return {
        bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: "text-emerald-600",
        badge: "bg-emerald-600 text-white",
      };
    case "inventory manager":
      return {
        bg: "bg-amber-100 text-amber-700 border-amber-200",
        icon: "text-amber-600",
        badge: "bg-amber-600 text-white",
      };
    default:
      return {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
        icon: "text-slate-600",
        badge: "bg-slate-700 text-white",
      };
  }
}

export default async function AdminUsersPage() {
  const [roles, adminUsers] = await Promise.all([
    prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.adminUser.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
            Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage system roles, staff permissions, and administrator access levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            {roles.length} System Roles Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Users className="h-3.5 w-3.5 text-blue-600" />
            {adminUsers.length} Admin Accounts
          </span>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configured Admin Accounts</h3>
            <p className="text-[11px] text-slate-500">Personnel with backoffice login access</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Admin User</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No admin accounts configured.
                  </td>
                </tr>
              ) : (
                adminUsers.map((admin) => {
                  const roleTheme = getRoleIconColor(admin.role.name);
                  const initials = admin.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{admin.name}</div>
                            <div className="text-[10px] text-slate-400">ID: {admin.id.slice(0, 10)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">{admin.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-[11px] border ${roleTheme.bg}`}
                        >
                          <Shield className={`h-3 w-3 ${roleTheme.icon}`} />
                          {admin.role.name}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-medium">
                        {formatDateTime(admin.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles & Permissions Matrix */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            System Role Permission Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Granular capability mapping assigned to each business role in the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => {
            const roleTheme = getRoleIconColor(r.name);

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
                        {r.isSystem && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {r.description || "Operational management role"}
                      </p>
                    </div>
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${roleTheme.bg}`}
                    >
                      <Shield className={`h-4 w-4 ${roleTheme.icon}`} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Assigned Capabilities
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        {r.permissions.length} Permissions
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {r.permissions.map((rp) => {
                        const badgeStyle = getPermissionBadgeStyle(rp.permission.key);
                        const label = formatPermissionLabel(rp.permission.key);

                        return (
                          <span
                            key={rp.id}
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${badgeStyle}`}
                          >
                            <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
