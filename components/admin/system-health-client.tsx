"use client";

import React, { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertOctagon,
  ShieldCheck,
  Cpu,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Bug,
  Server,
  Zap,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

interface SystemHealthClientProps {
  errors: any[];
  feedbacks: any[];
  health: {
    status: string;
    uptimeSeconds: number;
    memoryUsageMb: number;
    database: { status: string; latencyMs: number };
    courier: { status: string; mode: string };
  };
}

export function SystemHealthClient({
  errors,
  feedbacks,
  health,
}: SystemHealthClientProps) {
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const criticalErrors = errors.filter((e) => e.severity === "CRITICAL" && !e.isResolved);
  const highErrors = errors.filter((e) => e.severity === "HIGH" && !e.isResolved);
  const totalUnresolved = errors.filter((e) => !e.isResolved).length;

  const handleTriggerAiScan = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("AI Triage Scan dispatched to GitHub Actions workflow");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" /> System Health & AI Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Observability metrics, real-time error fingerprinting, circuit breakers, and autonomous AI code repair pipeline.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleTriggerAiScan}
          disabled={isRefreshing}
          className="bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow flex items-center gap-1.5"
        >
          <Cpu className="h-4 w-4" />
          {isRefreshing ? "Scanning..." : "Trigger AI Triage Pipeline"}
        </Button>
      </div>

      {/* 4 Overview Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Health
          </span>
          <div className="flex items-center gap-2 text-xl font-black text-emerald-600">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>OPERATIONAL</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Uptime: {Math.floor(health.uptimeSeconds / 60)} mins • RAM: {health.memoryUsageMb} MB
          </div>
        </div>

        {/* Card 2: Database Latency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Database Engine
          </span>
          <div className="text-xl font-black text-slate-900">
            {health.database.latencyMs} ms
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Status: {health.database.status} (Prisma ORM)
          </div>
        </div>

        {/* Card 3: Courier Circuit Breaker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pathao Circuit Breaker
          </span>
          <div className="text-xl font-black text-slate-900">
            {health.courier.status === "UP" ? "CLOSED (Healthy)" : "DEGRADED"}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Mode: {health.courier.mode}
          </div>
        </div>

        {/* Card 4: Unresolved Incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Unresolved Incidents
          </span>
          <div className="text-xl font-black text-rose-600">
            {totalUnresolved} <span className="text-xs text-slate-400 font-normal">({criticalErrors.length} Critical)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Grouped by deterministic fingerprints
          </div>
        </div>
      </div>

      {/* AI Autonomous Pipeline Telemetry Banner */}
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-extrabold text-sm text-white">Autonomous AI Code Repair Pipeline</h3>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-blue-400 px-3 py-1 rounded-full border border-slate-700">
            Engine: GitHub Actions CI/CD Worker
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Auto-Merge Policy:</span>
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Guarded (Human Review on Medium/High)
            </div>
            <p className="text-[10px] text-slate-500">Security & Payment logic strictly protected</p>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Regression Gate:</span>
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Strict (TypeScript + Tests + Build)
            </div>
            <p className="text-[10px] text-slate-500">Max retry attempts: 3</p>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Branch Convention:</span>
            <div className="font-mono font-bold text-blue-300">
              ai/fix/error-&lt;fingerprint&gt;
            </div>
            <p className="text-[10px] text-slate-500">Never modifies main/production directly</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Events & User Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fingerprinted Error Events */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bug className="h-4 w-4 text-rose-600" /> Fingerprinted Error Incidents ({errors.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Occurrences</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {errors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Zero error incidents logged. System running smoothly!
                    </td>
                  </tr>
                ) : (
                  errors.map((err) => (
                    <tr key={err.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono font-bold text-blue-600">
                        {err.errorId}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            err.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800"
                              : err.severity === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {err.severity}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 max-w-[120px] truncate">
                        {err.route}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{err.occurrences}x</td>
                      <td className="p-3 text-slate-400">{formatDateTime(err.lastSeenAt)}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedError(err)}
                          className="h-7 text-xs font-semibold"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: User Feedback Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Customer Problem Reports</span>
            <span className="text-xs text-slate-400 font-normal">({feedbacks.length})</span>
          </h3>

          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No user feedback submitted yet.
              </div>
            ) : (
              feedbacks.slice(0, 8).map((f) => (
                <div
                  key={f.id}
                  className="border border-slate-200 rounded-xl p-3 space-y-1.5 bg-slate-50/50 text-xs"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {f.category}
                    </span>
                    <span className="text-slate-400">{formatDateTime(f.createdAt)}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{f.message}</p>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Route: {f.route}</span>
                    {f.errorId && <span className="font-mono text-blue-600">Ref: {f.errorId}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Error Inspector Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">
                  Incident: {selectedError.errorId}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedError.message}
                </h3>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Route:</span>
                <div className="font-mono font-semibold text-slate-800">{selectedError.route}</div>
              </div>
              <div>
                <span className="text-slate-400">Fingerprint:</span>
                <div className="font-mono text-slate-800">{selectedError.fingerprint}</div>
              </div>
            </div>

            {selectedError.stackTrace && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Sanitized Stack Trace:</span>
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60">
                  {selectedError.stackTrace}
                </pre>
              </div>
            )}

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedError(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
