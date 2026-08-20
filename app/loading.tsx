import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="relative h-12 w-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">Purnima Electronics</p>
          <p className="text-xs text-slate-400">Loading catalog and store data...</p>
        </div>
      </div>
    </div>
  );
}
