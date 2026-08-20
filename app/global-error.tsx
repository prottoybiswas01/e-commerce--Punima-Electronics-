"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            PE
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">Application Exception</h1>
            <p className="text-xs text-slate-400">
              The root layout encountered a critical error. Please reload the application.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white transition shadow-lg shadow-blue-600/30"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
