"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSessionSync } from "./hooks/useSessionSync";
import { SessionController } from "./components/SessionController";
import { ParticipantMatrix } from "./components/ParticipantMatrix";
import { SecurityAlertTracker } from "./components/SecurityAlertTracker";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Copy,
  Check,
  X,
  Users,
  Monitor,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { ProctoredParticipantData } from "@/app/admin/mock-tests/types/proctor";

interface ProctoredControlRoomProps {
  sessionId: string;
  initialSession: any;
  adminUsername: string;
}

export function ProctoredControlRoom({
  sessionId,
  initialSession,
  adminUsername,
}: ProctoredControlRoomProps) {
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const {
    session,
    isLoading,
    error,
    updateSessionStatus,
    disconnectParticipant,
    pauseParticipantTest,
    resumeParticipantTest,
    disqualifyParticipant,
    addTimeToParticipant,
    forceSubmitParticipant,
    clearParticipantWarnings,
  } = useSessionSync({ sessionId, pollInterval: 2000 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync browser fullscreen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle body overflow and escape key
  useEffect(() => {
    if (isProjectorOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProjectorOpen) {
        setIsProjectorOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProjectorOpen]);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  const handleOpenProjector = () => {
    setIsProjectorOpen(true);
    // Optionally enter true fullscreen on button click gesture
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Ignored if browser policy blocks gesture
      });
    }
  };

  if (isLoading && !session) {
    return (
      <div className="space-y-6">
        <Skeleton count={1} height="h-36" width="w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton count={1} height="h-96" width="w-full" />
          </div>
          <Skeleton count={1} height="h-96" width="w-full" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-bold text-lg">Error loading session</p>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          {error || "Session not found or failed to load."}
        </p>
      </div>
    );
  }

  // Transform participants for components while preserving all telemetry fields
  const participants: ProctoredParticipantData[] = (session.participants || []).map((p: any) => ({
    id: p.id,
    studentId: p.studentId,
    userName: p.userName || "Student",
    email: p.email || "",
    status: p.status,
    startedAt: p.startedAt,
    completedAt: p.completedAt,
    currentModule: p.currentModule,
    currentQuestionIndex: p.currentQuestionIndex,
    timeRemaining: p.timeRemaining,
    lastHeartbeat: p.lastHeartbeat,
    timeAdded: p.timeAdded || 0,
    fullscreenExitCount: p.fullscreenExitCount || 0,
    score: p.score,
  }));

  const handleCopyPin = () => {
    if (session?.code) {
      navigator.clipboard.writeText(session.code);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/student/mock-tests`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const activeParticipantsCount = participants.filter(
    (p) => p.status === "TAKING" || p.status === "WAITING" || p.status === "PAUSED",
  ).length;

  return (
    <div className="space-y-6">
      {/* Session Controller Header */}
      <SessionController
        session={{
          id: session.id,
          code: session.code,
          status: session.status as "ACTIVE" | "COMPLETED" | "REVOKED",
          createdAt: new Date(session.createdAt),
          participants,
          totalParticipants: session.totalParticipants,
          scoredCount: session.scoredCount,
        }}
        onUpdateStatus={updateSessionStatus}
        onOpenProjector={handleOpenProjector}
      />

      {/* Main Grid: Participant Matrix (2 cols) & Security Alert Tracker (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ParticipantMatrix
            participants={participants}
            sessionCode={session.code}
            onDisconnect={disconnectParticipant}
            onPause={pauseParticipantTest}
            onResume={resumeParticipantTest}
            onDisqualify={disqualifyParticipant}
            onAddTime={addTimeToParticipant}
            onForceSubmit={forceSubmitParticipant}
          />
        </div>

        <div>
          <SecurityAlertTracker
            participants={participants}
            onPauseParticipant={pauseParticipantTest}
            onResumeParticipant={resumeParticipantTest}
            onDisqualifyParticipant={disqualifyParticipant}
            onClearWarnings={clearParticipantWarnings}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live telemetry active (2s heartbeat sync)</span>
        </div>
        <div>
          Proctored by <span className="font-semibold text-slate-900 dark:text-white">{adminUsername}</span>
        </div>
        <div className="font-mono text-[11px]">
          Session: {sessionId.substring(0, 13)}...
        </div>
      </div>

      {/* Full-bleed React Portal for Projector Mode - completely outside layout containers & sidebar */}
      {mounted &&
        isProjectorOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#080808] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-y-auto select-none animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/30 flex items-center justify-center text-[#EBFF00]">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                    Classroom Projector Mode
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Front-of-room screen for students to enter the exam room
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <Users className="w-4 h-4 text-[#EBFF00]" />
                  <span className="text-sm font-bold text-white">
                    {activeParticipantsCount} Students Joined
                  </span>
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleBrowserFullscreen}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Toggle Full Display Screen"}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 text-[#EBFF00]" />
                      <span className="hidden md:inline">Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 text-[#EBFF00]" />
                      <span className="hidden md:inline">Full Display Screen</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsProjectorOpen(false)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white transition-colors"
                  title="Close Projector Mode (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Centerpiece: Huge Room PIN & Action */}
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-8 py-8">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#EBFF00] bg-[#EBFF00]/10 border border-[#EBFF00]/20 px-5 py-2 rounded-full shadow-[0_0_20px_rgba(235,255,0,0.15)]">
                  Live Exam Room PIN
                </span>
              </div>

              {/* Giant PIN Display */}
              <div
                onClick={handleCopyPin}
                className="cursor-pointer group relative px-10 sm:px-16 py-8 rounded-3xl bg-white/[0.03] border-2 border-[#EBFF00]/40 hover:border-[#EBFF00] transition-all hover:scale-[1.02] shadow-[0_0_90px_rgba(235,255,0,0.15)]"
              >
                <div className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-widest text-white selection:bg-[#EBFF00] selection:text-black">
                  {session.code}
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 group-hover:text-[#EBFF00] transition-colors">
                  {copiedPin ? (
                    <>
                      <Check className="w-4 h-4 text-[#EBFF00]" /> Copied PIN to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Click to Copy PIN
                    </>
                  )}
                </div>
              </div>

              {/* 3 Step Classroom Instructions */}
              <div className="max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left w-full">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-[11px] font-black text-[#EBFF00] mb-1 tracking-wider">
                    STEP 1
                  </div>
                  <div className="text-sm font-bold text-white">Student Portal</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Open SAT-ALFA & login with your student credentials
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-[11px] font-black text-[#EBFF00] mb-1 tracking-wider">
                    STEP 2
                  </div>
                  <div className="text-sm font-bold text-white">Join Live Exam</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Go to Mock Tests and click &quot;Join Live Exam&quot;
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-[11px] font-black text-[#EBFF00] mb-1 tracking-wider">
                    STEP 3
                  </div>
                  <div className="text-sm font-bold text-white">Enter PIN</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Enter code <span className="font-mono text-[#EBFF00] font-bold">{session.code}</span> to begin
                  </div>
                </div>
              </div>

              {/* Quick URL Copy */}
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-colors"
              >
                {copiedUrl ? (
                  <Check className="w-4 h-4 text-[#EBFF00]" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/student/mock-tests`
                    : "/student/mock-tests"}
                </span>
              </button>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400">
              <div>
                Room Status:{" "}
                <span className="text-emerald-400 font-bold uppercase tracking-wider">
                  {session.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Press{" "}
                  <kbd className="px-2 py-0.5 bg-white/10 rounded text-[11px] text-white font-mono">
                    ESC
                  </kbd>{" "}
                  to exit Projector Mode
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
