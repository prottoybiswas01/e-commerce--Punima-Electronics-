"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCheck,
  Shield,
  Key,
  Users,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    permission: { key: string; name: string; category: string };
  }>;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: Role;
  isActive: boolean;
  createdAt: Date | string;
}

interface AdminUserManagerProps {
  initialAdminUsers: AdminUser[];
  roles: Role[];
}

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

  return dictionary[key] || key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
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
        bg: "bg-amber-100 text-amber-800 border-amber-200",
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

export function AdminUserManager({ initialAdminUsers, roles }: AdminUserManagerProps) {
  const router = useRouter();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: roles[0]?.id || "",
  });

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      roleId: roles[1]?.id || roles[0]?.id || "",
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      roleId: admin.roleId,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.roleId) {
      toast.error("All fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Admin role assigned to ${formData.name}!`);
        setIsCreateOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to create admin user");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/admin-users/${selectedAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: formData.roleId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Admin role updated successfully!");
        setIsEditOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/admin-users/${selectedAdmin.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Admin account removed successfully!");
        setIsDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete admin");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
            Role-Based Access Control (RBAC) & Team
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign Moderator, Manager, or Staff roles to personnel and manage administrative permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow gap-1.5">
            <Plus className="h-4 w-4" /> Assign New Admin Role
          </Button>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configured Admin Accounts</h3>
            <p className="text-[11px] text-slate-500">Personnel with backoffice login access</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            {adminUsers.length} Users Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Admin User</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Added Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No admin accounts configured.
                  </td>
                </tr>
              ) : (
                adminUsers.map((admin) => {
                  const roleTheme = getRoleIconColor(admin.role?.name || "Staff");
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
                            <div className="text-[10px] text-slate-400 font-mono">ID: {admin.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">{admin.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-[11px] border ${roleTheme.bg}`}
                        >
                          <Shield className={`h-3 w-3 ${roleTheme.icon}`} />
                          {admin.role?.name || "Unassigned"}
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
                      <td className="p-3.5 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(admin)}
                          className="h-8 px-2.5 text-xs text-slate-700 hover:text-blue-600 gap-1"
                        >
                          <Edit2 className="h-3 w-3" /> Change Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDelete(admin)}
                          className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center border font-bold text-sm ${roleTheme.bg}`}
                      >
                        <Shield className={`h-4 w-4 ${roleTheme.icon}`} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {r.permissions.length} capabilities assigned
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleTheme.badge}`}>
                      Role
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {r.description || "System standard operational role"}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-50">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Authorized Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {r.permissions.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                      ) : (
                        r.permissions.map((p) => {
                          const badgeStyle = getPermissionBadgeStyle(p.permission.key);
                          const humanLabel = formatPermissionLabel(p.permission.key);

                          return (
                            <span
                              key={p.permission.key}
                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border transition-colors ${badgeStyle}`}
                              title={`System Key: ${p.permission.key}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                              {humanLabel}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Assign Admin Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Shakib Al Hasan"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Email Address *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. manager@purnimaelectronics.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Assign System Role *</Label>
              <select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border text-xs bg-white"
                required
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.description || `${r.permissions.length} permissions`})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Assigning..." : "Assign Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Role for {selectedAdmin?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Select New Role</Label>
              <select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border text-xs bg-white"
                required
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Remove Admin Access?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to revoke backoffice access for <strong>{selectedAdmin?.name}</strong> ({selectedAdmin?.email})?
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Removing..." : "Revoke Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
