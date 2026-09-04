"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Clock, Play, Pause, CheckCircle } from "lucide-react";
import type { SessionControllerProps } from "@/app/admin/mock-tests/types/proctor";

export function SessionController({
  session,
  onUpdateStatus,
}: SessionControllerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (
    newStatus: "ACTIVE" | "COMPLETED" | "REVOKED",
  ) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-600 bg-emerald-950/30";
      case "COMPLETED":
        return "text-[#EBFF00] dark:text-[#d9ff00] bg-yellow-950/30";
      case "REVOKED":
        return "text-red-600 bg-red-950/30";
      default:
        return "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1c1b1b]/30";
    }
  };

  return (
    <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Code */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a]/50 border border-[#EBFF00]/30 rounded-lg p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold mb-2">
            Session Code
          </p>
          <p className="text-5xl font-mono font-bold text-slate-900 dark:text-[#EBFF00] mb-4 tracking-widest">
            {session.code}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share this code with students
          </p>
        </div>

        {/* Status & Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold mb-2">
                Status
              </p>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${getStatusColor(session.status)}`}
              >
                {session.status === "ACTIVE" && <Play className="w-4 h-4" />}
                {session.status === "COMPLETED" && (
                  <CheckCircle className="w-4 h-4" />
                )}
                {session.status === "REVOKED" && <Pause className="w-4 h-4" />}
                {session.status}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-bold mb-2">
                Participants
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-[#EBFF00]">
                {session.participants.length}{" "}
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  joined
                </span>
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button
              onClick={() => handleStatusChange("ACTIVE")}
              disabled={isUpdating || session.status === "ACTIVE"}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" /> Start
            </Button>
            <Button
              onClick={() => handleStatusChange("COMPLETED")}
              disabled={isUpdating || session.status === "COMPLETED"}
              className="flex-1 bg-[#EBFF00] hover:bg-[#EBFF00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] disabled:opacity-50 text-slate-900 dark:text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Complete
            </Button>
            <Button
              onClick={() => handleStatusChange("REVOKED")}
              disabled={isUpdating}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Pause className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
            Taking Test
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-[#EBFF00]">
            {
              session.participants.filter((p: any) => p.status === "TAKING")
                .length
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
            Completed
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            {
              session.participants.filter((p: any) => p.status === "COMPLETED")
                .length
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
            Waiting
          </p>
          <p className="text-2xl font-bold text-slate-500 dark:text-slate-400">
            {
              session.participants.filter((p: any) => p.status === "WAITING")
                .length
            }
          </p>
        </div>
      </div>
    </Card>
  );
}
