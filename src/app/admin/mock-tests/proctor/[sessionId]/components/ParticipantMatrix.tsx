"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  ProctoredParticipantData,
  ParticipantMatrixProps,
} from "@/app/admin/mock-tests/types/proctor";
import { AlertCircle, Zap, CheckCircle, Clock } from "lucide-react";

export function ParticipantMatrix({
  participants,
  sessionCode,
  onDisconnect,
  onPause,
}: ParticipantMatrixProps) {
  const [actioningParticipantId, setActioningParticipantId] = useState<
    string | null
  >(null);

  const handleDisconnect = async (participantId: string) => {
    setActioningParticipantId(participantId);
    try {
      await onDisconnect(participantId);
    } finally {
      setActioningParticipantId(null);
    }
  };

  const handlePause = async (participantId: string) => {
    setActioningParticipantId(participantId);
    try {
      await onPause(participantId);
    } finally {
      setActioningParticipantId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "WAITING":
        return <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
      case "TAKING":
        return (
          <Zap className="w-4 h-4 text-slate-900 dark:text-[#EBFF00] animate-pulse" />
        );
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-slate-100 dark:bg-[#1c1b1b] border-slate-600";
      case "TAKING":
        return "bg-yellow-950/40 border-[#EBFF00]/50";
      case "COMPLETED":
        return "bg-emerald-950/40 border-emerald-600/50";
      default:
        return "bg-slate-100 dark:bg-[#1c1b1b] border-slate-600";
    }
  };

  return (
    <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-[#EBFF00] mb-4">
        Live Participants ({participants.length})
      </h2>
      {participants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No participants joined yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Share code {sessionCode} with students
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {participants.map((participant: ProctoredParticipantData) => (
            <div
              key={participant.id}
              className={`border rounded-lg p-3 transition-all ${getStatusBg(participant.status)}`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Name & Email */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(participant.status)}
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {participant.userName}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {participant.email}
                  </p>
                </div>

                {/* Middle: Module & Question (if taking) */}
                {participant.status === "TAKING" && (
                  <div className="mx-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">
                      Module
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-[#EBFF00]">
                      {participant.currentModule || "—"}
                    </p>
                  </div>
                )}

                {/* Middle: Score (if completed) */}
                {participant.status === "COMPLETED" && (
                  <div className="mx-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">
                      Score
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {participant.score
                        ? `${participant.score}/1600`
                        : "Scoring..."}
                    </p>
                  </div>
                )}

                {/* Right: Violations & Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {participant.fullscreenExitCount > 0 && (
                    <div className="flex items-center gap-1 bg-red-950/50 border border-red-700/50 rounded px-2 py-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-red-600">
                        {participant.fullscreenExitCount}
                      </span>
                    </div>
                  )}
                  {participant.status === "TAKING" && (
                    <>
                      <Button
                        onClick={() => handlePause(participant.id)}
                        disabled={actioningParticipantId === participant.id}
                        className="text-xs px-2 py-1 bg-[#EBFF00] hover:bg-[#d9ff00]"
                      >
                        Pause
                      </Button>
                      <Button
                        onClick={() => handleDisconnect(participant.id)}
                        disabled={actioningParticipantId === participant.id}
                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700"
                      >
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
