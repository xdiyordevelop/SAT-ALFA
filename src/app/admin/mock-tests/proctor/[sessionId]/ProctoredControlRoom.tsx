"use client";

import React from "react";
import { useSessionSync } from "./hooks/useSessionSync";
import { SessionController } from "./components/SessionController";
import { ParticipantMatrix } from "./components/ParticipantMatrix";
import { SecurityAlertTracker } from "./components/SecurityAlertTracker";
import { Skeleton } from "@/components/ui/Skeleton";

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
  const {
    session,
    isLoading,
    error,
    updateSessionStatus,
    disconnectParticipant,
    pauseParticipantTest,
  } = useSessionSync({ sessionId, pollInterval: 2000 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton count={1} height="h-32" width="w-full" />
        <Skeleton count={1} height="h-64" width="w-full" />
        <Skeleton count={1} height="h-48" width="w-full" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-6">
        <p className="text-red-600 font-bold">Error loading session</p>
        <p className="text-red-700 text-sm mt-2">
          {error || "Session not found"}
        </p>
      </div>
    );
  }

  // Transform participants for components
  const participants = session.participants.map((p: any) => ({
    id: p.id,
    studentId: p.studentId,
    userName: p.userName,
    email: p.email,
    status: p.status as "WAITING" | "TAKING" | "COMPLETED",
    startedAt: p.startedAt,
    completedAt: p.completedAt,
    currentModule: p.currentModule,
    fullscreenExitCount: p.fullscreenExitCount || 0,
    score: p.score,
  }));

  return (
    <div className="space-y-6">
      {/* Session Controller */}
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
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participant Matrix (spans 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <ParticipantMatrix
            participants={participants}
            sessionCode={session.code}
            onDisconnect={disconnectParticipant}
            onPause={pauseParticipantTest}
          />
        </div>

        {/* Security Alert Tracker (sidebar) */}
        <SecurityAlertTracker
          participants={participants}
          onFlagViolation={async () => {}}
        />
      </div>

      {/* Footer Info */}
      <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-4 border-t border-slate-200 dark:border-white/10">
        <p>
          Live updates every 2 seconds • Proctored by {adminUsername} • Session
          ID:{""} {sessionId.substring(0, 8)}...
        </p>
      </div>
    </div>
  );
}
