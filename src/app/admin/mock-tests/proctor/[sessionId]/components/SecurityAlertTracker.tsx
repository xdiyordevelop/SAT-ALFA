"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import type {
  SecurityAlertTrackerProps,
  ProctoredParticipantData,
} from "@/app/admin/mock-tests/types/proctor";
import { AlertTriangle, Shield } from "lucide-react";

export function SecurityAlertTracker({
  participants,
}: SecurityAlertTrackerProps) {
  const violatingParticipants = participants.filter(
    (p: ProctoredParticipantData) => p.fullscreenExitCount > 0,
  );

  const totalViolations = violatingParticipants.reduce(
    (sum: number, p: ProctoredParticipantData) => sum + p.fullscreenExitCount,
    0,
  );

  const getSeverityLevel = (count: number): "low" | "medium" | "high" => {
    if (count >= 5) return "high";
    if (count >= 3) return "medium";
    return "low";
  };

  const getSeverityColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "border-red-600 bg-red-950/30";
      case "medium":
        return "border-[#EBFF00] bg-yellow-950/30";
      case "low":
        return "border-[#EBFF00] bg-yellow-950/30";
    }
  };

  const getSeverityTextColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-slate-900 dark:text-[#EBFF00]";
      case "low":
        return "text-slate-900 dark:text-[#EBFF00]";
    }
  };

  return (
    <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Security Alert Tracker
        </h2>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">
            Total Violations
          </p>
          <p
            className={`text-3xl font-bold ${totalViolations > 0 ? "text-red-600" : "text-emerald-600"}`}
          >
            {totalViolations}
          </p>
        </div>
      </div>

      {violatingParticipants.length === 0 ? (
        <div className="flex items-center justify-center py-12 bg-slate-50 dark:bg-[#0a0a0a]/50 border border-dashed border-emerald-700/30 rounded-lg">
          <div className="text-center">
            <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-emerald-600 font-bold">All Clear</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No security violations detected
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {violatingParticipants.map(
            (participant: ProctoredParticipantData) => {
              const severity = getSeverityLevel(
                participant.fullscreenExitCount,
              );
              return (
                <div
                  key={participant.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(severity)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white mb-1">
                        {participant.userName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {participant.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold ${getSeverityTextColor(severity)}`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {participant.fullscreenExitCount}
                        <span className="text-xs ml-1">exits</span>
                      </div>
                    </div>
                  </div>

                  {/* Severity indicator */}
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < participant.fullscreenExitCount
                            ? severity === "high"
                              ? "bg-red-500"
                              : severity === "medium"
                                ? "bg-[#EBFF00]"
                                : "bg-[#EBFF00]"
                            : "bg-slate-100 dark:bg-[#1c1b1b]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-3">
          Severity Levels
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#EBFF00] rounded-full" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              1-2 exits
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#EBFF00] rounded-full" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              3-4 exits
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              5+ exits
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
