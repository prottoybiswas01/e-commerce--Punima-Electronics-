import React from "react";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { History, Shield, Activity, UserCheck } from "lucide-react";

export const revalidate = 0;

function formatStateDiff(jsonStr: string | null) {
  if (!jsonStr) return <span className="text-slate-400">—</span>;

  try {
    const obj = JSON.parse(jsonStr);
    if (typeof obj !== "object" || obj === null) {
      return <span>{String(jsonStr)}</span>;
    }

    const entries = Object.entries(obj).slice(0, 4);
    return (
      <div className="flex flex-wrap gap-1 max-w-sm">
        {entries.map(([key, val]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200"
          >
            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
            <strong className="text-slate-900 font-bold">{String(val)}</strong>
          </span>
        ))}
      </div>
    );
  } catch (e) {
    return <span className="text-slate-700 font-medium">{jsonStr}</span>;
  }
}

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
                <th className="p-3.5">Action Performed</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Details & State Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 text-slate-400 font-mono whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                          {log.userName.slice(0, 1).toUpperCase()}
                        </span>
                        <span>{log.userName}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200 font-mono text-[10px]">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {log.entity}
                      {log.entityId && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          #{log.entityId.slice(0, 10)}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">{formatStateDiff(log.newState || log.previousState)}</td>
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
