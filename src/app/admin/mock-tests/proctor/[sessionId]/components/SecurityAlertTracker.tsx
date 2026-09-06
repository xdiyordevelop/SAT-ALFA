"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import type {
  SecurityAlertTrackerProps,
  ProctoredParticipantData,
} from "@/app/admin/mock-tests/types/proctor";
import {
  AlertTriangle,
  Shield,
  Pause,
  Play,
  Ban,
  RotateCcw,
  AlertOctagon,
  Loader2,
} from "lucide-react";

export function SecurityAlertTracker({
  participants,
  onPauseParticipant,
  onResumeParticipant,
  onDisqualifyParticipant,
  onClearWarnings,
}: SecurityAlertTrackerProps) {
  const [loadingParticipantId, setLoadingParticipantId] = useState<string | null>(null);
  const [confirmDisqualifyId, setConfirmDisqualifyId] = useState<string | null>(null);

  const violatingParticipants = participants.filter(
    (p: ProctoredParticipantData) => p.fullscreenExitCount > 0,
  );

  const totalViolations = violatingParticipants.reduce(
    (sum: number, p: ProctoredParticipantData) => sum + p.fullscreenExitCount,
    0,
  );

  const getSeverity = (count: number): "low" | "medium" | "high" => {
    if (count >= 5) return "high";
    if (count >= 3) return "medium";
    return "low";
  };

  const handleAction = async (
    participantId: string,
    action: () => Promise<void> | undefined,
  ) => {
    try {
      setLoadingParticipantId(participantId);
      await action?.();
    } finally {
      setLoadingParticipantId(null);
    }
  };

  return (
    <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Security Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fullscreen & tab switch monitoring
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Violations
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              totalViolations > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {totalViolations}
          </div>
        </div>
      </div>

      {/* Body */}
      {violatingParticipants.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-black/30 border border-dashed border-emerald-500/30 rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            All Clear
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            No tab switches or fullscreen exits detected across all active participants.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
          {violatingParticipants.map((p: ProctoredParticipantData) => {
            const severity = getSeverity(p.fullscreenExitCount);
            const isLoading = loadingParticipantId === p.id;
            const isConfirmingDisqualify = confirmDisqualifyId === p.id;

            return (
              <div
                key={p.id}
                className={`rounded-xl p-4 border transition-all ${
                  severity === "high"
                    ? "bg-red-500/5 border-red-500/30 dark:bg-red-500/10 dark:border-red-500/40"
                    : severity === "medium"
                    ? "bg-amber-500/5 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/30"
                    : "bg-yellow-500/5 border-yellow-500/20 dark:bg-yellow-500/10 dark:border-yellow-500/20"
                }`}
              >
                {/* Participant Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {p.userName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {p.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 text-xs font-black rounded-full flex items-center gap-1 ${
                        severity === "high"
                          ? "bg-red-500/20 text-red-600 dark:text-red-400"
                          : severity === "medium"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : "bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                      }`}
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      {p.fullscreenExitCount} {p.fullscreenExitCount === 1 ? "exit" : "exits"}
                    </span>
                  </div>
                </div>

                {/* Severity Meter (5 ticks) */}
                <div className="mt-3 flex gap-1 items-center">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i < p.fullscreenExitCount;
                    return (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          filled
                            ? severity === "high"
                              ? "bg-red-500"
                              : severity === "medium"
                              ? "bg-amber-500"
                              : "bg-yellow-400"
                            : "bg-slate-200 dark:bg-white/10"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Status + Quick Actions */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Status:{" "}
                    <span
                      className={`uppercase font-bold ${
                        p.status === "PAUSED"
                          ? "text-amber-600 dark:text-amber-400"
                          : p.status === "DISQUALIFIED"
                          ? "text-red-600 dark:text-red-400"
                          : p.status === "COMPLETED"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Actions */}
                  {p.status !== "DISQUALIFIED" && p.status !== "COMPLETED" && (
                    <div className="flex items-center gap-1.5">
                      {p.status === "PAUSED" ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            handleAction(p.id, () =>
                              onResumeParticipant?.(p.id),
                            )
                          }
                          className="px-2 py-1 text-xs font-semibold rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                          title="Resume Student's Exam"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          Resume
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            handleAction(p.id, () =>
                              onPauseParticipant?.(p.id),
                            )
                          }
                          className="px-2 py-1 text-xs font-semibold rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 transition-colors"
                          title="Pause Student's Exam"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Pause className="w-3 h-3" />
                          )}
                          Pause
                        </button>
                      )}

                      {/* Disqualify or Confirm */}
                      {isConfirmingDisqualify ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                              handleAction(p.id, async () => {
                                await onDisqualifyParticipant?.(p.id);
                                setConfirmDisqualifyId(null);
                              });
                            }}
                            className="px-2 py-1 text-xs font-bold rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDisqualifyId(null)}
                            className="px-1.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setConfirmDisqualifyId(p.id)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1 transition-colors"
                          title="Disqualify Student"
                        >
                          <Ban className="w-3 h-3" />
                          Disqualify
                        </button>
                      )}

                      {/* Reset / Dismiss warnings */}
                      {onClearWarnings && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            handleAction(p.id, () => onClearWarnings(p.id))
                          }
                          className="p-1 text-xs rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
                          title="Clear violations for student (Dismiss alert)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-2">
          Severity Thresholds
        </p>
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full flex-shrink-0" />
            <span>1-2 (Minor)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full flex-shrink-0" />
            <span>3-4 (Warning)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
            <span>5+ (Critical)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
