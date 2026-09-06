"use client";

import React, { useState } from "react";
import {
  Play,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Maximize2,
  Users,
  ShieldAlert,
  Clock,
  Radio,
  XCircle,
  Loader2,
} from "lucide-react";
import type { SessionControllerProps } from "@/app/admin/mock-tests/types/proctor";

export function SessionController({
  session,
  onUpdateStatus,
  onOpenProjector,
}: SessionControllerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmModal, setConfirmModal] = useState<"COMPLETED" | "REVOKED" | null>(null);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "COMPLETED" | "REVOKED") => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(newStatus);
      setConfirmModal(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const takingCount = session.participants.filter((p) => p.status === "TAKING").length;
  const pausedCount = session.participants.filter((p) => p.status === "PAUSED").length;
  const completedCount = session.participants.filter((p) => p.status === "COMPLETED").length;
  const alertsCount = session.participants.filter((p) => p.fullscreenExitCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Card */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Session Access Code & Projector (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#181818] dark:to-[#0f0f0f] border border-slate-200 dark:border-[#EBFF00]/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Classroom Access PIN
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBFF00]/20 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30">
                <Radio className="w-3 h-3 animate-pulse" /> Live
              </span>
            </div>

            <div className="flex items-baseline gap-4 my-2">
              <p className="text-4xl sm:text-5xl font-mono font-black tracking-[0.2em] text-slate-900 dark:text-[#EBFF00]">
                {session.code}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#202020] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">PIN Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy PIN</span>
                  </>
                )}
              </button>

              {onOpenProjector && (
                <button
                  type="button"
                  onClick={onOpenProjector}
                  className="py-2 px-3 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  title="Open Projector Mode for Classroom Display"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Projector Mode</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Status & Master Lifecycle Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Examination Status
                </p>
                <div className="flex items-center gap-2">
                  {session.status === "ACTIVE" && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Session In Progress
                    </span>
                  )}
                  {session.status === "COMPLETED" && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-xs bg-[#EBFF00]/10 border border-[#EBFF00]/30 text-slate-900 dark:text-[#EBFF00]">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Exam Concluded
                    </span>
                  )}
                  {session.status === "REVOKED" && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-xs bg-rose-500/10 border border-rose-500/30 text-rose-500">
                      <XCircle className="w-4 h-4" />
                      Cancelled / Revoked
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Connected Students
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                  <Users className="w-5 h-5 text-slate-400" />
                  {session.participants.length}
                </p>
              </div>
            </div>

            {/* Lifecycle Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-200 dark:border-white/10">
              {session.status !== "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange("ACTIVE")}
                  disabled={isUpdating}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Resume Session
                </button>
              )}

              {session.status === "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => setConfirmModal("COMPLETED")}
                  disabled={isUpdating}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(235,255,0,0.2)]"
                >
                  <CheckCircle className="w-4 h-4" />
                  Conclude Exam Session
                </button>
              )}

              {session.status !== "REVOKED" && (
                <button
                  type="button"
                  onClick={() => setConfirmModal("REVOKED")}
                  disabled={isUpdating}
                  className="py-3 px-4 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Cancel Room
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Stats Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
          <div className="bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center text-slate-950 dark:text-[#EBFF00]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Taking Exam
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {takingCount}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Paused
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {pausedCount}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Completed
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {completedCount}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-white/5 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Security Alerts
              </p>
              <p className="text-xl font-black text-rose-500">
                {alertsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Session Status Update */}
      {confirmModal && (
        <div
          onClick={() => setConfirmModal(null)}
          className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-xl ${
                  confirmModal === "COMPLETED"
                    ? "bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30"
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                }`}
              >
                {confirmModal === "COMPLETED" ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {confirmModal === "COMPLETED" ? "Conclude Exam Session?" : "Cancel Exam Room?"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {confirmModal === "COMPLETED"
                    ? "This will finalize the exam for all participants and lock submissions."
                    : "This will immediately revoke access for all participating students."}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {confirmModal === "COMPLETED"
                ? `Currently ${takingCount} student(s) are in active testing. All student attempts will be finalized.`
                : "Are you sure you want to cancel this session? This action cannot be undone."}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(confirmModal)}
                disabled={isUpdating}
                className={`py-2.5 px-5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                  confirmModal === "COMPLETED"
                    ? "bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 shadow-md"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                }`}
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {confirmModal === "COMPLETED" ? "Confirm Conclusion" : "Confirm Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
