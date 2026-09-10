"use client";

import React from "react";
import { useTestContext } from "../context/TestContext";
import { Loader2, CheckCircle2, Sparkles, X } from "lucide-react";

export function AutoFixNotificationBanner(): React.ReactElement | null {
  const { autoFixNotification, clearAutoFixNotification } = useTestContext();

  if (!autoFixNotification) return null;

  const isFixing = autoFixNotification.type === "fixing";

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border ${
          isFixing
            ? "bg-slate-900/90 dark:bg-[#151515]/95 border-amber-500/50 text-amber-300 shadow-amber-500/10"
            : "bg-emerald-950/90 dark:bg-[#0d1f14]/95 border-emerald-500/60 text-emerald-200 shadow-emerald-500/20"
        }`}
      >
        <div className="shrink-0">
          {isFixing ? (
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 text-xs sm:text-sm font-medium pr-2">
          {autoFixNotification.message}
        </div>

        <button
          onClick={clearAutoFixNotification}
          className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
