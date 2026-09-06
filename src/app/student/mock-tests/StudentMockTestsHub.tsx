"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  History,
  PlayCircle,
  Trophy,
  CheckCircle2,
  Clock,
  Hash,
  BarChart3,
  Upload,
  Video,
  KeyRound,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { PinCodeInput } from "@/components/ui/PinCodeInput";
import { verifyProctoredCodeAction } from "@/server/actions/proctor-actions";

interface StudentMockTestsHubProps {
  availableTests: any[];
  completedAttempts: any[];
  highestScore: number | null;
}

export function StudentMockTestsHub({
  availableTests,
  completedAttempts,
  highestScore,
}: StudentMockTestsHubProps) {
  const router = useRouter();
  // MUST default to 'available' tab!
  const [activeTab, setActiveTab] = useState<"available" | "history">(
    "available",
  );

  // Join Live Exam Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isPinModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsPinModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isPinModalOpen]);

  const handleJoinExam = async (e?: React.FormEvent, customPin?: string) => {
    if (e) e.preventDefault();
    const pinToUse = customPin || pin;
    const cleanPin = pinToUse.trim().replace(/[^0-9]/g, "");
    if (cleanPin.length !== 6) {
      setPinError("Please enter a valid 6-digit numeric exam code.");
      return;
    }

    setIsVerifying(true);
    setPinError(null);

    try {
      const res = await verifyProctoredCodeAction(cleanPin);
      if (res.success && res.satTestId && res.sessionId) {
        setIsPinModalOpen(false);
        router.push(
          `/student/mock-tests/${res.satTestId}/take?proctorSessionId=${res.sessionId}&code=${cleanPin}`
        );
      } else {
        setPinError(res.error || "Failed to join live exam. Please verify the code.");
      }
    } catch (err) {
      setPinError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Fast Access */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            SAT Mock Tests Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            Practice with published full-length digital SAT tests or join a
            scheduled live proctored session.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setIsPinModalOpen(true);
              setPin("");
              setPinError(null);
            }}
            className="px-5 py-2.5 bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(235,255,0,0.25)] active:scale-[0.98]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
            </span>
            Join Live Session with PIN
          </button>
        </div>
      </div>

      {/* Enter Exam PIN Modal via Portal */}
      {isMounted && isPinModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          {/* Full-bleed Backdrop with negative margins and 120dvh to eliminate any edge falloff or bottom gaps */}
          <div
            onClick={() => setIsPinModalOpen(false)}
            className="fixed -inset-12 min-h-[120dvh] min-w-[120dvw] w-[calc(100%+96px)] h-[calc(100%+96px)] bg-slate-900/40 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gradient-to-b dark:from-[#181818] dark:to-[#0f0f0f] border border-slate-200 dark:border-white/15 rounded-3xl p-7 sm:p-9 max-w-lg w-full shadow-2xl dark:shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative text-slate-900 dark:text-white overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-150"
          >
            {/* Ambient Background Glow Orbs (dark mode only) */}
            <div className="hidden dark:block absolute -top-24 -right-24 w-52 h-52 rounded-full bg-[#EBFF00]/10 blur-3xl pointer-events-none" />
            <div className="hidden dark:block absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Top Bar: Live Status & Close */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#EBFF00]/10 border border-slate-200 dark:border-[#EBFF00]/25 text-slate-800 dark:text-[#EBFF00] text-xs font-black uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-[#EBFF00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-[#EBFF00]"></span>
                </span>
                Live Proctor Session
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Header Content */}
            <div className="text-center mb-7 relative z-10">
              <div className="inline-flex p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#EBFF00] mb-3 shadow-inner">
                <KeyRound className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Enter Session PIN
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Type the 6-digit access code displayed on the classroom screen or provided by your proctor.
              </p>
            </div>

            {/* Segmented PIN Input Form */}
            <form onSubmit={handleJoinExam} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <PinCodeInput
                  value={pin}
                  onChange={(val) => {
                    setPin(val);
                    if (pinError) setPinError(null);
                  }}
                  onComplete={(completedPin) => {
                    handleJoinExam(undefined, completedPin);
                  }}
                  hasError={Boolean(pinError)}
                  disabled={isVerifying}
                />
                <div className="flex justify-between items-center px-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>Numeric digits only</span>
                  {pin.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPin("");
                        setPinError(null);
                      }}
                      className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {pinError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="py-3.5 px-5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || pin.length !== 6}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(235,255,0,0.25)] active:scale-[0.98]"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                    </>
                  ) : (
                    "Enter Exam Room"
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Synchronized live exam & anti-cheat enabled</span>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Top Metric Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#EBFF00]/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Available Tests
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {availableTests.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#EBFF00]/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tests Completed
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedAttempts.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#EBFF00]/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-[#EBFF00]/10 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#EBFF00]/10 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-slate-900 dark:text-[#EBFF00]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Highest SAT Score
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {highestScore ? `${highestScore} / 1600` : "--"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "available"
              ? "border-[#EBFF00] text-slate-900 dark:text-[#EBFF00]"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Available Practice Tests
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "history"
              ? "border-[#EBFF00] text-slate-900 dark:text-[#EBFF00]"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          My Test History & Results
        </button>
      </div>

      {/* Tab Content */}
      <div>
        <div key={activeTab}>
          {activeTab === "available" && (
            <div className="space-y-6">
              {availableTests.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 border-dashed rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No Active Tests Available
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    There are currently no mock tests published by instructors
                    yet. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableTests.map((test) => {
                    const attempts = test.studentAttempts || [];
                    const completedAttempt = attempts.find(
                      (a: any) => a.totalScore !== null,
                    );

                    return (
                      <div
                        key={test.id}
                        className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col h-full hover:border-[#EBFF00]/50 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-black/20"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                        <div className="mb-4 relative z-10">
                          <span className="inline-flex px-2 py-1 bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/20 rounded-md text-[10px] font-bold tracking-wider uppercase mb-3">
                            Digital SAT Full Test
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {test.name}
                          </h3>
                        </div>

                        <div className="space-y-3 flex-1 mb-6 relative z-10">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                            <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>
                              <strong className="text-slate-900 dark:text-white">
                                {test.questions?.length || 0}
                              </strong>{" "}
                              Questions
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>134 mins</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            {completedAttempt ? (
                              <span className="text-emerald-600 font-medium">
                                Last Score: {completedAttempt.totalScore}
                              </span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400">
                                Not Started
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-white/10">
                          <Link
                            href={`/student/mock-tests/${test.id}/take`}
                            className="w-full py-3 px-4 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          >
                            <PlayCircle className="w-5 h-5" />
                            Start Test
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              {completedAttempts.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 border-dashed rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No Test History
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You haven't completed any mock tests yet. Take a test from
                    the Available Tests tab to see your results here.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-[#0a0a0a]">
                          <th className="py-4 px-6">Test Name</th>
                          <th className="py-4 px-6">Completed Date</th>
                          <th className="py-4 px-6">Math Score</th>
                          <th className="py-4 px-6">R&W Score</th>
                          <th className="py-4 px-6">Total Score</th>
                          <th className="py-4 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-800/50">
                        {completedAttempts.map((attempt) => (
                          <tr
                            key={attempt.id}
                            className="hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                          >
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                              {attempt.satTest?.name || attempt.test?.name || "Digital SAT Practice Test"}
                            </td>
                            <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                              {new Date(
                                attempt.completedAt,
                              ).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                              {attempt.mathScore || 0}
                            </td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                              {attempt.rwScore || 0}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex px-3 py-1 bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] font-bold rounded-lg border border-[#EBFF00]/20">
                                {attempt.totalScore || 0}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link
                                href={`/student/mock-tests/${attempt.satTestId || attempt.testId}/results?attemptId=${attempt.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-lg font-medium transition-colors border border-slate-200 dark:border-white/10 hover:border-slate-400"
                              >
                                <BarChart3 className="w-4 h-4 text-slate-900 dark:text-[#EBFF00]" />
                                View Full Analysis
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
