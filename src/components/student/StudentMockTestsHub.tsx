"use client";

import Link from "next/link";
import { Play, CheckCircle, Clock, Timer, BarChart2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { verifyProctoredCodeAction } from "@/server/actions/proctor-actions";
import { Radio, X, KeyRound, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { PinCodeInput } from "@/components/ui/PinCodeInput";

interface AvailableTest {
  id: string;
  name: string;
  questions: any[];
  studentAttempts: {
    id: string;
    totalScore: number | null;
    completedAt: Date | null;
  }[];
}

interface CompletedAttempt {
  id: string;
  totalScore: number | null;
  completedAt: Date | null;
  satTest: { name: string };
}

interface StudentMockTestsHubProps {
  availableTests: AvailableTest[];
  completedAttempts: CompletedAttempt[];
  highestScore: number | null;
}

export function StudentMockTestsHub({
  availableTests,
  completedAttempts,
  highestScore,
}: StudentMockTestsHubProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "TODO" | "COMPLETED">("ALL");

  // Join Live Exam modal state
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

  const completedSet = new Set(
    completedAttempts.map((a) => a.satTest.name)
  );

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Mock Examinations
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Select a practice test to benchmark and boost your SAT score.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setIsPinModalOpen(true);
              setPin("");
              setPinError(null);
            }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-black text-sm shadow-[0_0_15px_rgba(235,255,0,0.25)] transition-all active:scale-[0.98]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
            </span>
            Join Live Exam
          </button>

          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg p-1 flex">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === "ALL" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("TODO")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === "TODO" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"}`}
            >
              To Do
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === "COMPLETED" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"}`}
            >
              Completed
            </button>
          </div>
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Render Available Tests (Not Started / In Progress) */}
        {availableTests
          .filter(t => filter === "ALL" || filter === "TODO" || (filter === "COMPLETED" && t.studentAttempts.some(a => a.completedAt)))
          .map((test) => {
            
          const attempt = test.studentAttempts[0];
          const isCompleted = attempt?.completedAt != null;
          const isInProgress = attempt && !attempt.completedAt;
          
          if (filter === "TODO" && isCompleted) return null;
          if (filter === "COMPLETED" && !isCompleted) return null;

          if (isCompleted) {
            // Completed Card
            return (
              <div key={test.id} className="bg-slate-50 dark:bg-[#131313]/50 border border-slate-200 dark:border-white/5 rounded-xl p-6 flex flex-col opacity-90 hover:opacity-100 transition-opacity shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-emerald-100 dark:bg-[#1c1b1b] border border-emerald-200 dark:border-white/10 text-emerald-700 dark:text-slate-400 font-bold uppercase tracking-wider px-3 py-1 rounded text-[10px]">Completed</span>
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-slate-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{test.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                  <span>Score: <span className="font-bold text-slate-900 dark:text-white">{attempt.totalScore || '-'}</span></span>
                  <span>•</span>
                  <span>{new Date(attempt.completedAt!).toLocaleDateString("en-US")}</span>
                </div>
                <div className="mt-auto">
                  <Link href={`/student/results/${attempt.id}`} className="w-full bg-transparent border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-lg hover:border-slate-400 hover:bg-slate-100 dark:hover:border-white/30 dark:hover:bg-[#1c1b1b] transition-all flex items-center justify-center gap-2">
                    <BarChart2 className="w-4 h-4" /> View Results
                  </Link>
                </div>
              </div>
            );
          } else if (isInProgress) {
            // In Progress Card
             return (
              <div key={test.id} className="bg-white dark:bg-[#131313] border border-[#EBFF00] dark:border-[#EBFF00] rounded-xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(235,255,0,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00] dark:bg-[#EBFF00] opacity-10 blur-[40px]"></div>
                <div className="flex justify-between items-start mb-6 z-10">
                  <span className="bg-yellow-50 dark:bg-[#EBFF00]/10 border border-yellow-200 dark:border-[#EBFF00]/20 text-[#d9ff00] dark:text-[#EBFF00] font-bold uppercase tracking-wider px-3 py-1 rounded text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EBFF00] dark:bg-[#EBFF00] animate-pulse"></span> In Progress
                  </span>
                  <Timer className="w-5 h-5 text-yellow-600 dark:text-[#EBFF00]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 z-10">{test.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium z-10">
                  <span>In progress...</span>
                  <span>•</span>
                  <span>{test.questions.length} Questions</span>
                </div>
                <div className="mt-auto z-10">
                   <Link href={`/student/mock-tests/${test.id}/take`} className="w-full bg-transparent border-2 border-[#EBFF00] dark:border-[#EBFF00] text-[#d9ff00] dark:text-[#EBFF00] font-bold py-3 px-4 rounded-lg hover:bg-yellow-50 dark:hover:bg-[#EBFF00] dark:hover:text-black transition-all flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Resume Test
                  </Link>
                </div>
              </div>
            );
          } else {
            // Not Started Card
            return (
              <div key={test.id} className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col hover:border-slate-300 dark:hover:border-[#EBFF00] transition-colors group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00] dark:bg-[#EBFF00] opacity-5 blur-[40px] group-hover:opacity-10 transition-opacity"></div>
                <div className="flex justify-between items-start mb-6 z-10">
                  <span className="bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider px-3 py-1 rounded text-[10px]">Not Started</span>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 z-10">{test.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium z-10">
                  <span>2h 14m</span>
                  <span>•</span>
                  <span>{test.questions.length} Questions</span>
                </div>
                <div className="mt-auto z-10">
                   <Link href={`/student/mock-tests/${test.id}/take`} className="w-full bg-[#EBFF00] dark:bg-[#EBFF00] text-slate-950 font-bold py-3 px-4 rounded-lg hover:bg-[#d9ff00] dark:hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(235,255,0,0.1)]">
                    <Play className="w-4 h-4" /> Start Test
                  </Link>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
