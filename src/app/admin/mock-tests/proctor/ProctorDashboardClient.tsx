"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Clock,
  Pause,
  Play,
  StopCircle,
  ShieldAlert,
  CheckCircle,
  Copy,
  Users,
  Plus,
  ExternalLink,
  AlertCircle,
  Loader2,
  Check,
  BarChart3,
} from "lucide-react";
import {
  getProctorAvailableTestsAction,
  startProctorSessionAction,
  endProctorSessionAction,
} from "@/server/actions/proctor-actions";

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
  score?: number | null;
};

type SessionInfo = {
  id: string;
  code: string;
  satTest: { name: string };
  _count: { participants: number };
};

type AvailableTestItem = {
  id: string;
  name: string;
  status: string;
  questionCount: number;
};

export default function ProctorDashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [completedSessions, setCompletedSessions] = useState<SessionInfo[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Launch Session Modal State
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [availableTests, setAvailableTests] = useState<AvailableTestItem[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [isFetchingTests, setIsFetchingTests] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  // End Session Modal State
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    participantId: string;
    action: string;
    title: string;
    message: string;
  }>({ isOpen: false, participantId: "", action: "", title: "", message: "" });

  const fetchSessions = async () => {
    try {
      const [res, compRes] = await Promise.all([
        fetch("/api/admin/proctor/active-sessions"),
        fetch("/api/admin/proctor/active-sessions?status=COMPLETED"),
      ]);
      const data = await res.json();
      const compData = await compRes.json();
      if (Array.isArray(data)) {
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId((prev) => {
            const exists = data.some((s: SessionInfo) => s.id === prev);
            return exists ? prev : data[0].id;
          });
        } else {
          setSelectedSessionId("");
          setParticipants([]);
        }
      }
      if (Array.isArray(compData)) {
        setCompletedSessions(compData);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!selectedSessionId) return;
    try {
      const res = await fetch(
        `/api/admin/proctor/active-sessions?proctorSessionId=${selectedSessionId}`,
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setParticipants(data);
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSessions();
  }, []);

  const isAnyModalOpen = isLaunchModalOpen || isEndSessionModalOpen || confirmModal.isOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLaunchModalOpen) setIsLaunchModalOpen(false);
        if (isEndSessionModalOpen) setIsEndSessionModalOpen(false);
        if (confirmModal.isOpen) setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAnyModalOpen, isLaunchModalOpen, isEndSessionModalOpen, confirmModal.isOpen]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchParticipants();
      const interval = setInterval(fetchParticipants, 4000); // Poll every 4s
      return () => clearInterval(interval);
    }
  }, [selectedSessionId]);

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLaunchModal = async () => {
    setIsLaunchModalOpen(true);
    setLaunchError(null);
    setIsFetchingTests(true);
    try {
      const res = await getProctorAvailableTestsAction();
      if (res.success && res.tests) {
        setAvailableTests(res.tests);
        if (res.tests.length > 0) {
          setSelectedTestId(res.tests[0].id);
        }
      } else {
        setLaunchError(res.error || "Failed to load tests.");
      }
    } catch (err) {
      setLaunchError("Failed to fetch tests. Please check network.");
    } finally {
      setIsFetchingTests(false);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId) return;
    setIsStartingSession(true);
    setLaunchError(null);

    try {
      const res = await startProctorSessionAction(selectedTestId);
      if (res.success && res.sessionId) {
        setIsLaunchModalOpen(false);
        await fetchSessions();
        setSelectedSessionId(res.sessionId);
      } else {
        setLaunchError(res.error || "Failed to start proctor session.");
      }
    } catch (err) {
      setLaunchError("An unexpected error occurred while launching session.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedSessionId) return;
    setIsEndingSession(true);
    try {
      const res = await endProctorSessionAction(selectedSessionId);
      if (res.success) {
        setIsEndSessionModalOpen(false);
        await fetchSessions();
      } else {
        alert(res.error || "Failed to end session.");
      }
    } catch (err) {
      alert("An unexpected error occurred while ending session.");
    } finally {
      setIsEndingSession(false);
    }
  };

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

  if (loading && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-9 h-9 border-4 border-[#EBFF00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Loading proctored sessions...
        </p>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.id === selectedSessionId);
  const sessionPin = currentSession?.code || "------";

  const activeCount = participants.filter((p) => p.status === "TAKING").length;
  const pausedCount = participants.filter((p) => p.status === "PAUSED").length;
  const totalExits = participants.reduce((acc, p) => acc + p.fullscreenExitCount, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white">
      {/* Top Header & Session Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-2xl font-black tracking-tight">Live Proctoring Room</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Manage live mock examinations, track student tab exits, and enforce test security.
          </p>

          {sessions.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                className="bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-[#EBFF00] focus:border-[#EBFF00] p-2.5 transition-colors font-bold min-w-[280px]"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.satTest.name} (PIN: {s.code}) • {s._count.participants} students
                  </option>
                ))}
              </select>

              <button
                onClick={openLaunchModal}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
              >
                <Plus className="w-4 h-4" /> New Session
              </button>

              {selectedSessionId && (
                <>
                  <Link
                    href={`/admin/mock-tests/proctor/${selectedSessionId}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-200 dark:hover:bg-[#252424] text-sm font-bold text-slate-700 dark:text-slate-200 transition-all"
                    title="Open Dedicated Control Room"
                  >
                    <ExternalLink className="w-4 h-4" /> Control Room
                  </Link>

                  <Link
                    href={`/admin/mock-tests/proctor/${selectedSessionId}/analytics`}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/30 hover:bg-[#EBFF00]/20 text-sm font-bold text-slate-900 dark:text-[#EBFF00] transition-all"
                    title="Cohort Analytics & Domain Breakdown"
                  >
                    <BarChart3 className="w-4 h-4 text-[#EBFF00]" /> Cohort Analytics
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {sessions.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">
                Classroom Exam PIN
              </span>
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 shadow-inner">
                <span className="font-mono text-3xl font-black tracking-[0.25em] text-slate-900 dark:text-[#EBFF00]">
                  {sessionPin}
                </span>
                <button
                  onClick={() => handleCopyPin(sessionPin)}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#EBFF00] bg-white dark:bg-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#333] rounded-lg transition-colors shadow-sm"
                  title="Copy 6-digit PIN"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsEndSessionModalOpen(true)}
              className="px-3.5 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold text-xs transition-all tracking-wider uppercase flex items-center gap-2 mt-auto"
            >
              <StopCircle className="w-4 h-4" /> End Session
            </button>
          </div>
        ) : (
          <button
            onClick={openLaunchModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(235,255,0,0.3)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Launch Exam Session
          </button>
        )}
      </div>

      {/* No Sessions Empty State */}
      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-12 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-[#EBFF00]/10 border border-[#EBFF00]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(235,255,0,0.15)]">
            <ShieldAlert className="w-10 h-10 text-[#EBFF00]" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
            No Active Examination Sessions
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium leading-relaxed">
            There are currently no active proctored rooms. Launch a new exam session to generate a 6-digit access PIN and monitor students in real-time.
          </p>
          <button
            onClick={openLaunchModal}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-black text-base shadow-[0_0_20px_rgba(235,255,0,0.3)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Launch New Exam Session
          </button>
        </div>
      ) : participants.length === 0 && selectedSessionId ? (
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Waiting for Students to Join
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4 font-medium">
            Have students click <strong className="text-slate-900 dark:text-[#EBFF00]">"Join Live Exam"</strong> on their dashboard and enter PIN:
          </p>
          <div className="inline-block font-mono text-3xl font-black tracking-[0.25em] text-slate-900 dark:text-[#EBFF00] bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 px-6 py-3 rounded-xl">
            {sessionPin}
          </div>
        </div>
      ) : selectedSessionId ? (
        <>
          {/* Metrics Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Students
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-[#EBFF00]">
                {activeCount}
              </span>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Security Alerts (Tab Exits)
              </span>
              <span
                className={`text-3xl font-black ${totalExits > 0 ? "text-rose-500" : "text-slate-900 dark:text-white"}`}
              >
                {totalExits}
              </span>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Paused Exams
              </span>
              <span className="text-3xl font-black text-amber-500">
                {pausedCount}
              </span>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Participants
              </span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {participants.length}
              </span>
            </div>
          </div>

          {/* Live Feed Table Container */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col flex-1 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-[#1c1b1b]">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" /> Student Live Status
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-1.5 bg-white dark:bg-[#131313] rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                  Auto-sync <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#131313]">
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4">
                      Student
                    </th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4">
                      Status
                    </th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4">
                      Module / Question
                    </th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4 text-center">
                      Time Left
                    </th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4 text-center">
                      Tab Exits
                    </th>
                    <th className="font-bold text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 p-4 text-right">
                      Proctor Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium divide-y divide-slate-100 dark:divide-white/5">
                  {participants.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors group"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-black text-slate-900 dark:text-[#EBFF00]">
                          {(p.student?.firstName || p.userName).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {p.student?.firstName} {p.student?.lastName}
                          </span>
                          <span className="text-[10px] text-slate-500">{p.userName}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {p.status === "TAKING" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-[#EBFF00]/10 border border-emerald-200 dark:border-[#EBFF00]/20 text-emerald-700 dark:text-[#EBFF00] text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#EBFF00] animate-pulse"></span> Taking Test
                          </span>
                        )}
                        {p.status === "PAUSED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                            Paused
                          </span>
                        )}
                        {p.status === "COMPLETED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle className="w-3 h-3" /> Completed {p.score ? `(${p.score})` : ""}
                          </span>
                        )}
                        {p.status === "WAITING" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                            Waiting
                          </span>
                        )}
                        {p.status === "DISQUALIFIED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider">
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
                            +{p.timeAdded / 60}m extra
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {p.fullscreenExitCount > 0 ? (
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/30 font-black text-xs shadow-sm">
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
                                  message: "Add 5 minutes to this student's remaining test time?",
                                })
                              }
                              disabled={actionLoading === p.id}
                              className="p-2 text-emerald-600 dark:text-[#EBFF00] bg-emerald-50 dark:bg-[#EBFF00]/10 hover:bg-emerald-100 dark:hover:bg-[#EBFF00]/20 rounded-lg border border-emerald-200 dark:border-[#EBFF00]/20 transition-colors"
                              title="+5 Minutes"
                            >
                              <Clock className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleAction(p.id, "PAUSE_TEST")}
                              disabled={actionLoading === p.id}
                              className="p-2 text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white rounded-lg border border-amber-500/20 transition-colors"
                              title="Pause Test"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {p.status === "PAUSED" && (
                          <button
                            onClick={() => handleAction(p.id, "RESUME_TEST")}
                            disabled={actionLoading === p.id}
                            className="p-2 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white rounded-lg border border-emerald-500/20 transition-colors"
                            title="Resume Test"
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
                                  title: "Force Submit Test",
                                  message: "Immediately submit and grade this test for the student?",
                                })
                              }
                              disabled={actionLoading === p.id}
                              className="p-2 text-[#d9ff00] dark:text-[#EBFF00] bg-[#EBFF00]/10 hover:bg-[#EBFF00] hover:text-black rounded-lg border border-[#EBFF00]/20 transition-colors"
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
                                  title: "Disqualify Student",
                                  message: "Disqualify this student from the exam due to proctoring violation? Their test will be closed.",
                                })
                              }
                              disabled={actionLoading === p.id}
                              className="p-2 text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/20 transition-colors"
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

      {/* Completed Sessions & Cohort Reports Section */}
      {completedSessions.length > 0 && (
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#EBFF00]" />
                Completed Exam Sessions & Cohort Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Past proctored examination sessions with comprehensive group analytics and domain breakdowns
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {completedSessions.length} completed sessions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedSessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 flex flex-col justify-between gap-3 hover:border-[#EBFF00]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      PIN: {s.code}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {s.satTest.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {s._count?.participants || 0} students enrolled
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
                  <Link
                    href={`/admin/mock-tests/proctor/${s.id}`}
                    className="flex-1 text-center py-2 px-3 rounded-lg bg-[#EBFF00] hover:bg-[#d4e600] text-black text-xs font-black transition-all flex items-center justify-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    View Cohort Analytics
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Launch Exam Session Modal */}
      {mounted &&
        isLaunchModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto select-none">
            {/* Soft Translucent Backdrop with negative bleed */}
            <div
              className="fixed -inset-12 min-h-[120dvh] min-w-[120dvw] bg-slate-900/30 dark:bg-black/80 backdrop-blur-sm dark:backdrop-blur-md transition-all animate-in fade-in duration-200"
              onClick={() => setIsLaunchModalOpen(false)}
            />

            <div
              className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black tracking-tight mb-1 text-slate-900 dark:text-white">
                Launch New Exam Session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Generate a live 6-digit access PIN and start real-time proctoring for a mock test.
              </p>

              {isFetchingTests ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-slate-900 dark:text-[#EBFF00] animate-spin" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading tests...</p>
                </div>
              ) : availableTests.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm mb-6">
                  No mock tests with questions found. Please create or import questions in Mock Tests first.
                </div>
              ) : (
                <form onSubmit={handleStartSession} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Select Mock Test
                    </label>
                    <select
                      value={selectedTestId}
                      onChange={(e) => setSelectedTestId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/15 focus:border-slate-900 dark:focus:border-[#EBFF00] rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-colors"
                    >
                      {availableTests.map((t) => (
                        <option
                          key={t.id}
                          value={t.id}
                          className="bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-white"
                        >
                          {t.name} ({t.questionCount} questions)
                        </option>
                      ))}
                    </select>
                  </div>

                  {launchError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{launchError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLaunchModalOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isStartingSession || !selectedTestId}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] disabled:opacity-40 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(235,255,0,0.25)]"
                    >
                      {isStartingSession ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Starting...
                        </>
                      ) : (
                        "Start Session Room"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* End Session Modal */}
      {mounted &&
        isEndSessionModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto select-none">
            <div
              className="fixed -inset-12 min-h-[120dvh] min-w-[120dvw] bg-slate-900/30 dark:bg-black/80 backdrop-blur-sm dark:backdrop-blur-md transition-all animate-in fade-in duration-200"
              onClick={() => setIsEndSessionModalOpen(false)}
            />
            <div
              className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/15 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black tracking-tight mb-2 text-rose-600 dark:text-rose-400">
                End Exam Session?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Are you sure you want to end this session? All active students will have their tests marked completed and the 6-digit PIN will be expired.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEndSessionModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEndSession}
                  disabled={isEndingSession}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20"
                >
                  {isEndingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Ending...
                    </>
                  ) : (
                    "End Exam Now"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Participant Action Confirmation Modal */}
      {mounted &&
        confirmModal.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto select-none">
            <div
              className="fixed -inset-12 min-h-[120dvh] min-w-[120dvw] bg-slate-900/30 dark:bg-black/80 backdrop-blur-sm dark:backdrop-blur-md transition-all animate-in fade-in duration-200"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
            <div
              className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/15 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative z-10 overflow-hidden text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  confirmModal.action === "DISQUALIFY"
                    ? "bg-rose-500"
                    : "bg-[#EBFF00]"
                }`}
              />
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">
                {confirmModal.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 font-medium leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all"
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                >
                  Cancel
                </button>
                <button
                  className={`py-2.5 px-5 rounded-xl font-black text-sm transition-all ${
                    confirmModal.action === "DISQUALIFY"
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
                      : "bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 shadow-[0_0_15px_rgba(235,255,0,0.25)]"
                  }`}
                  onClick={() =>
                    handleAction(
                      confirmModal.participantId,
                      confirmModal.action,
                      confirmModal.action === "ADD_TIME" ? 300 : undefined,
                    )
                  }
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
