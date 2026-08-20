import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { History, Shield } from "lucide-react";

export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Admin Audit & Activity Logs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trail recording administrative actions, state changes, and timestamps.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User / Admin</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Entity ID</th>
                <th className="p-3.5">State Change Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 text-slate-400 font-mono">{formatDateTime(log.createdAt)}</td>
                    <td className="p-3.5 font-bold text-slate-900">{log.userName}</td>
                    <td className="p-3.5 font-mono font-bold text-blue-600">{log.action}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">{log.entity}</td>
                    <td className="p-3.5 font-mono text-slate-400">{log.entityId || "—"}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                      {log.newState || log.previousState || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
