"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  UserX,
  CheckCircle,
  PlusCircle,
  ShieldAlert,
  Wifi,
  WifiOff,
  MoreVertical,
  Check,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import type {
  ProctoredParticipantData,
  ParticipantMatrixProps,
} from "@/app/admin/mock-tests/types/proctor";

export function ParticipantMatrix({
  participants,
  sessionCode,
  onDisconnect,
  onPause,
  onResume,
  onDisqualify,
  onAddTime,
  onForceSubmit,
}: ParticipantMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TAKING" | "PAUSED" | "ALERTS" | "COMPLETED">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modals state
  const [extraTimeModal, setExtraTimeModal] = useState<ProctoredParticipantData | null>(null);
  const [disqualifyModal, setDisqualifyModal] = useState<ProctoredParticipantData | null>(null);
  const [disconnectModal, setDisconnectModal] = useState<ProctoredParticipantData | null>(null);
  const [forceSubmitModal, setForceSubmitModal] = useState<ProctoredParticipantData | null>(null);

  // Filtered list
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // Search
      const matchesSearch =
        p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Status
      if (statusFilter === "TAKING") return p.status === "TAKING";
      if (statusFilter === "PAUSED") return p.status === "PAUSED";
      if (statusFilter === "COMPLETED") return p.status === "COMPLETED";
      if (statusFilter === "ALERTS") return p.fullscreenExitCount > 0;
      return true;
    });
  }, [participants, searchQuery, statusFilter]);

  const takingCount = participants.filter((p) => p.status === "TAKING").length;
  const pausedCount = participants.filter((p) => p.status === "PAUSED").length;
  const alertsCount = participants.filter((p) => p.fullscreenExitCount > 0).length;
  const completedCount = participants.filter((p) => p.status === "COMPLETED").length;

  const handleAction = async (actionFn: () => Promise<void>, participantId: string) => {
    setBusyId(participantId);
    try {
      await actionFn();
    } finally {
      setBusyId(null);
    }
  };

  const formatRemainingTime = (seconds?: number | null) => {
    if (seconds == null || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getHeartbeatStatus = (lastHeartbeat?: Date | string | null) => {
    if (!lastHeartbeat) return "offline";
    const diff = (Date.now() - new Date(lastHeartbeat).getTime()) / 1000;
    if (diff <= 25) return "online";
    if (diff <= 60) return "idle";
    return "offline";
  };

  return (
    <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            Live Exam Matrix
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              {participants.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time candidate telemetry, heartbeat, and proctoring controls
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#EBFF00] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            statusFilter === "ALL"
              ? "bg-slate-900 dark:bg-[#EBFF00] text-white dark:text-slate-950 shadow-sm"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          All ({participants.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("TAKING")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            statusFilter === "TAKING"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          Active ({takingCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("PAUSED")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            statusFilter === "PAUSED"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          Paused ({pausedCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("ALERTS")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            statusFilter === "ALERTS"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          Alerts ({alertsCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("COMPLETED")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
            statusFilter === "COMPLETED"
              ? "bg-[#EBFF00] text-slate-950 font-black shadow-sm"
              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-[#0f0f0f] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {participants.length === 0
              ? "No students have joined this session yet."
              : "No candidates matching the selected filter."}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            Students can enter room code <span className="font-mono font-bold text-slate-900 dark:text-[#EBFF00]">{sessionCode}</span> to join.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredParticipants.map((p) => {
            const hb = getHeartbeatStatus(p.lastHeartbeat);
            const remaining = formatRemainingTime(p.timeRemaining);

            return (
              <div
                key={p.id}
                className={`border rounded-2xl p-4 transition-all duration-150 ${
                  p.status === "TAKING"
                    ? "bg-white dark:bg-[#181818] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                    : p.status === "PAUSED"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/30"
                    : p.status === "DISQUALIFIED"
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30"
                    : "bg-slate-50/50 dark:bg-[#161616] border-slate-200 dark:border-white/5"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Avatar & Candidate Information */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-[#202020] flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10">
                        {p.userName.slice(0, 2).toUpperCase()}
                      </div>
                      {/* Heartbeat Status Dot */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#181818] ${
                          hb === "online"
                            ? "bg-emerald-500 animate-pulse"
                            : hb === "idle"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                        title={`Connection: ${hb.toUpperCase()}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {p.userName}
                        </p>
                        {/* Status Badge */}
                        {p.status === "TAKING" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Testing
                          </span>
                        )}
                        {p.status === "PAUSED" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Paused
                          </span>
                        )}
                        {p.status === "DISQUALIFIED" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/30">
                            Disqualified
                          </span>
                        )}
                        {p.status === "COMPLETED" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#EBFF00]/15 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {p.email}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Progress Telemetry */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
                    {/* Current Module */}
                    {p.currentModule != null && (
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300">
                        Module {p.currentModule}
                      </div>
                    )}

                    {/* Question Telemetry */}
                    {p.currentQuestionIndex != null && p.status === "TAKING" && (
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-slate-600 dark:text-slate-400">
                        Q{p.currentQuestionIndex + 1}
                      </div>
                    )}

                    {/* Timer Remaining */}
                    {remaining && p.status === "TAKING" && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-white">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {remaining}
                      </div>
                    )}

                    {/* Extra Time Badge */}
                    {Boolean(p.timeAdded && p.timeAdded > 0) && (
                      <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-500 text-[11px] font-bold">
                        +{Math.round((p.timeAdded || 0) / 60)}m Extra
                      </div>
                    )}

                    {/* Final Score (if completed) */}
                    {p.status === "COMPLETED" && (
                      <div className="px-3 py-1 rounded-lg bg-[#EBFF00]/15 border border-[#EBFF00]/30 font-black text-slate-900 dark:text-[#EBFF00]">
                        Score: {p.score ? `${p.score}/1600` : "Calculated"}
                      </div>
                    )}

                    {/* Fullscreen Exit Warnings */}
                    {p.fullscreenExitCount > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold text-xs">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{p.fullscreenExitCount} Exit{p.fullscreenExitCount > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {/* Active Testing Actions */}
                    {p.status === "TAKING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(() => onPause(p.id), p.id)}
                          disabled={busyId === p.id}
                          className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold text-xs flex items-center gap-1.5 transition-all"
                          title="Pause student's test"
                        >
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </button>

                        {onAddTime && (
                          <button
                            type="button"
                            onClick={() => setExtraTimeModal(p)}
                            disabled={busyId === p.id}
                            className="py-1.5 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/25 font-bold text-xs flex items-center gap-1 transition-all"
                            title="Grant extra time"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> +Time
                          </button>
                        )}
                      </>
                    )}

                    {/* Paused State Actions - RESUME FIX! */}
                    {p.status === "PAUSED" && onResume && (
                      <button
                        type="button"
                        onClick={() => handleAction(() => onResume(p.id), p.id)}
                        disabled={busyId === p.id}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        title="Resume student examination"
                      >
                        <Play className="w-3.5 h-3.5" /> Resume Test
                      </button>
                    )}

                    {/* Force Submit Action */}
                    {(p.status === "TAKING" || p.status === "PAUSED") && onForceSubmit && (
                      <button
                        type="button"
                        onClick={() => setForceSubmitModal(p)}
                        disabled={busyId === p.id}
                        className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Force submit student test"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit
                      </button>
                    )}

                    {/* Disqualify Action */}
                    {(p.status === "TAKING" || p.status === "PAUSED") && onDisqualify && (
                      <button
                        type="button"
                        onClick={() => setDisqualifyModal(p)}
                        disabled={busyId === p.id}
                        className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Disqualify student for malpractice"
                      >
                        <UserX className="w-3.5 h-3.5" /> Disqualify
                      </button>
                    )}

                    {/* Waiting/Disconnect Action */}
                    {p.status === "WAITING" && (
                      <button
                        type="button"
                        onClick={() => setDisconnectModal(p)}
                        disabled={busyId === p.id}
                        className="py-1.5 px-2.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Remove candidate from waiting room"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grant Extra Time Modal */}
      {extraTimeModal && onAddTime && (
        <div
          onClick={() => setExtraTimeModal(null)}
          className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-white"
          >
            <h3 className="text-lg font-black tracking-tight mb-1">
              Grant Extra Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Add accommodations time for candidate <span className="font-bold text-slate-900 dark:text-white">{extraTimeModal.userName}</span>.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={async () => {
                    await handleAction(() => onAddTime(extraTimeModal.id, mins * 60), extraTimeModal.id);
                    setExtraTimeModal(null);
                  }}
                  className="py-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#EBFF00] hover:bg-slate-50 dark:hover:bg-white/5 text-center transition-all group"
                >
                  <p className="text-2xl font-black text-slate-900 dark:text-[#EBFF00] group-hover:scale-105 transition-transform">
                    +{mins}m
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">
                    Minutes
                  </p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setExtraTimeModal(null)}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Disqualify Confirmation Modal */}
      {disqualifyModal && onDisqualify && (
        <div
          onClick={() => setDisqualifyModal(null)}
          className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#181818] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-white"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-rose-500 mb-1">
              Disqualify Student?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to disqualify <span className="font-bold text-slate-900 dark:text-white">{disqualifyModal.userName}</span>? Their exam session will be terminated immediately and marked as disqualified for proctor audit logs.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDisqualifyModal(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleAction(() => onDisqualify(disqualifyModal.id), disqualifyModal.id);
                  setDisqualifyModal(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md"
              >
                Confirm Disqualification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Submit Confirmation Modal */}
      {forceSubmitModal && onForceSubmit && (
        <div
          onClick={() => setForceSubmitModal(null)}
          className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-white"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-1">
              Force Submit Candidate?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              This will automatically submit and score whatever answers <span className="font-bold text-slate-900 dark:text-white">{forceSubmitModal.userName}</span> has entered so far.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setForceSubmitModal(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleAction(() => onForceSubmit(forceSubmitModal.id), forceSubmitModal.id);
                  setForceSubmitModal(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-black text-xs transition-all shadow-md"
              >
                Force Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect/Remove Confirmation Modal */}
      {disconnectModal && onDisconnect && (
        <div
          onClick={() => setDisconnectModal(null)}
          className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-900 dark:text-white"
          >
            <h3 className="text-lg font-black tracking-tight mb-1">
              Remove Candidate?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-900 dark:text-white">{disconnectModal.userName}</span> from this session?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDisconnectModal(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleAction(() => onDisconnect(disconnectModal.id), disconnectModal.id);
                  setDisconnectModal(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
