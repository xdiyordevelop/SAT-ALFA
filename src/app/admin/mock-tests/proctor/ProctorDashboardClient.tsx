"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Clock,
  Pause,
  Play,
  StopCircle,
  ShieldAlert,
  CheckCircle,
  Copy,
  Users
} from "lucide-react";

type Participant = {
  id: string;
  sessionId: string;
  student: { firstName: string; lastName: string; group?: { name: string } };
  userName: string;
  status: "WAITING" | "TAKING" | "PAUSED" | "COMPLETED" | "DISQUALIFIED";
  currentModule: number | null;
  currentQuestionIndex: number | null;
  timeRemaining: number | null;
  fullscreenExitCount: number;
  lastHeartbeat: string | null;
  timeAdded: number;
};

type SessionInfo = {
  id: string;
  code: string;
  satTest: { name: string };
  _count: { participants: number };
};

export default function ProctorDashboardClient() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    participantId: string;
    action: string;
    title: string;
    message: string;
  }>({ isOpen: false, participantId: "", action: "", title: "", message: "" });

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/proctor/active-sessions");
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  const fetchParticipants = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch(
        `/api/admin/proctor/active-sessions?proctorSessionId=${selectedSessionId}`,
      );
      const data = await res.json();
      setParticipants(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      setLoading(true);
      fetchParticipants();
      const interval = setInterval(fetchParticipants, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [selectedSessionId]);

  const handleAction = async (
    participantId: string,
    action: string,
    timeToAdd?: number,
  ) => {
    setActionLoading(participantId);
    try {
      await fetch("/api/admin/proctor/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, action, timeToAdd }),
      });
      fetchParticipants(); // refresh immediately
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading && !selectedSessionId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#EBFF00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.id === selectedSessionId);
  const sessionPin = currentSession?.code || "----";

  const activeCount = participants.filter((p) => p.status === "TAKING").length;
  const pausedCount = participants.filter((p) => p.status === "PAUSED").length;
  const totalExits = participants.reduce((acc, p) => acc + p.fullscreenExitCount, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white">
      {/* Header & PIN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            Live Monitoring
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Monitor student test progress in real-time
          </p>
          {sessions.length > 0 && (
             <div className="mt-4">
                <select
                  className="bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-[#EBFF00] focus:border-[#EBFF00] block w-full max-w-sm p-2 transition-colors font-bold"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  <option value="" disabled>Select Session...</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.satTest.name} (Code: {s.code}) - {s._count.participants} students
                    </option>
                  ))}
                </select>
             </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">
            Session Code (PIN)
          </span>
          <div className="flex items-center gap-4 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 rounded-lg p-3">
            <span className="font-mono text-3xl font-black tracking-[0.2em] text-slate-900 dark:text-[#EBFF00]">
              {sessionPin}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(sessionPin)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#EBFF00] bg-white dark:bg-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#333] rounded transition-colors shadow-sm"
              title="Copy PIN code"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {participants.length === 0 && selectedSessionId ? (
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No participants yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Students need to enter the PIN code on their screen to join this test session.
          </p>
        </div>
      ) : selectedSessionId ? (
        <>
          {/* Metrics Bento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 dark:bg-[#EBFF00]/10 rounded-full blur-xl"></div>
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Students</span>
              <span className="text-3xl font-black text-slate-900 dark:text-[#EBFF00]">{activeCount}</span>
            </div>
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Alerts (Tab Exits)</span>
              <span className="text-3xl font-black text-yellow-600 dark:text-yellow-500">{totalExits}</span>
            </div>
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Paused</span>
              <span className="text-3xl font-black text-yellow-600 dark:text-yellow-500">{pausedCount}</span>
            </div>
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{participants.length}</span>
            </div>
          </div>

          {/* Live Feed Table Container */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl flex flex-col flex-1 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-[#1c1b1b]">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" /> Student Status
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-1.5 bg-white dark:bg-[#131313] rounded-md border border-slate-200 dark:border-white/5">
                  Auto-refresh <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#131313]">
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4">Student</th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4">Status</th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4">Module / Question</th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4 text-center">Time</th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4 text-center">Tab Exits</th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-slate-100 dark:divide-white/5">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors group">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-black text-slate-900 dark:text-[#EBFF00]">
                          {(p.student?.firstName || p.userName).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                           <span className="font-bold text-slate-900 dark:text-white block">{p.student?.firstName} {p.student?.lastName}</span>
                           <span className="text-[10px] text-slate-500">{p.userName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {p.status === "TAKING" && (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-[#EBFF00]/10 border border-emerald-200 dark:border-[#EBFF00]/20 text-emerald-700 dark:text-[#EBFF00] text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#EBFF00] animate-pulse"></span> In Progress
                          </span>
                        )}
                        {p.status === "PAUSED" && (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-500 text-[10px] font-black uppercase tracking-wider">
                            Paused
                          </span>
                        )}
                        {p.status === "COMPLETED" && (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-50 dark:bg-yellow-900/30 border border-blue-200 dark:border-blue-700/50 text-yellow-700 dark:text-[#EBFF00] text-[10px] font-black uppercase tracking-wider">
                            Completed
                          </span>
                        )}
                        {p.status === "WAITING" && (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                            Waiting
                          </span>
                        )}
                        {p.status === "DISQUALIFIED" && (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 text-rose-700 dark:text-yellow-500 text-[10px] font-black uppercase tracking-wider">
                            Disqualified
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                          M: <span className="text-slate-900 dark:text-[#EBFF00]">{p.currentModule || "-"}</span>
                          <span className="mx-1 opacity-30">|</span>
                          Q: <span className="text-slate-900 dark:text-[#EBFF00]">{p.currentQuestionIndex !== null ? p.currentQuestionIndex + 1 : "-"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {formatTime(p.timeRemaining)}
                        {p.timeAdded > 0 && (
                          <div className="text-[9px] text-emerald-600 dark:text-[#EBFF00] tracking-wider mt-0.5">
                            +{p.timeAdded / 60}m
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {p.fullscreenExitCount > 0 ? (
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-yellow-100 dark:bg-yellow-950/50 text-rose-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50 font-black text-xs shadow-sm">
                            {p.fullscreenExitCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {p.status === "TAKING" && (
                          <>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  participantId: p.id,
                                  action: "ADD_TIME",
                                  title: "Add Extra Time",
                                  message: "Add 5 minutes to this student's test time?",
                                })
                              }
                              disabled={actionLoading === p.id}
                              className="p-1.5 text-emerald-600 dark:text-[#EBFF00] bg-emerald-50 dark:bg-[#EBFF00]/10 hover:bg-emerald-100 dark:hover:bg-[#EBFF00]/20 rounded border border-emerald-200 dark:border-[#EBFF00]/20 transition-colors"
                              title="+5 Minutes"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(p.id, "PAUSE_TEST")}
                              disabled={actionLoading === p.id}
                              className="p-1.5 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded border border-yellow-200 dark:border-yellow-700/30 transition-colors"
                              title="Pause"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {p.status === "PAUSED" && (
                          <button
                            onClick={() => handleAction(p.id, "RESUME_TEST")}
                            disabled={actionLoading === p.id}
                            className="p-1.5 text-emerald-600 dark:text-[#EBFF00] bg-emerald-50 dark:bg-[#EBFF00]/10 hover:bg-emerald-100 dark:hover:bg-[#EBFF00]/20 rounded border border-emerald-200 dark:border-[#EBFF00]/20 transition-colors"
                            title="Resume"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {(p.status === "TAKING" || p.status === "PAUSED" || p.status === "WAITING") && (
                          <>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  participantId: p.id,
                                  action: "FORCE_SUBMIT",
                                  title: "Force Submit",
                                  message: "Submit this test now for this student?",
                                })
                              }
                              disabled={actionLoading === p.id}
                              className="p-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded border border-orange-200 dark:border-orange-700/30 transition-colors"
                              title="Force Submit"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  participantId: p.id,
                                  action: "DISQUALIFY",
                                  title: "Disqualify",
                                  message: "Disqualify this student from the test for rule violation?",
                                })
                              }
                              disabled={actionLoading === p.id}
                              className="p-1.5 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded border border-yellow-200 dark:border-yellow-900/40 transition-colors"
                              title="Disqualify"
                            >
                              <StopCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0a0a0a]/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-1 ${confirmModal.action === "DISQUALIFY" ? "bg-yellow-500" : "bg-yellow-500 dark:bg-[#EBFF00]"}`}></div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#1c1b1b] dark:text-white"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Cancel
              </Button>
              <Button
                className={
                  confirmModal.action === "DISQUALIFY"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-transparent"
                    : "bg-yellow-500 dark:bg-[#EBFF00] hover:bg-yellow-400 dark:hover:bg-white text-slate-950 border-transparent font-bold"
                }
                onClick={() =>
                  handleAction(
                    confirmModal.participantId,
                    confirmModal.action,
                    confirmModal.action === "ADD_TIME" ? 300 : undefined,
                  )
                }
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
