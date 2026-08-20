import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { UserCheck, Shield, Key } from "lucide-react";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const [roles, adminUsers] = await Promise.all([
    prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    }),
    prisma.adminUser.findMany({
      include: { role: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Role-Based Access Control (RBAC)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system roles, staff permissions, and administrator access levels.
        </p>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Configured Admin Accounts</h3>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
            <tr>
              <th className="p-3.5">Admin Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adminUsers.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50/60">
                <td className="p-3.5 font-bold text-slate-900">{admin.name}</td>
                <td className="p-3.5 text-slate-600">{admin.email}</td>
                <td className="p-3.5">
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {admin.role.name}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    Active
                  </span>
                </td>
                <td className="p-3.5 text-slate-400">{formatDateTime(admin.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles & Permissions Matrix */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">System Role Permission Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                </div>
                <Shield className="h-5 w-5 text-blue-600 shrink-0" />
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Permissions ({r.permissions.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {r.permissions.map((rp) => (
                    <span
                      key={rp.id}
                      className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded"
                    >
                      {rp.permission.key}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
