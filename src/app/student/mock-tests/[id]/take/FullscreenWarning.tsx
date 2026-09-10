"use client";

import React from "react";
import { useTestContext } from "../context/TestContext";
import { useRequestFullscreen } from "./hooks/useFullscreenTracking";
import { AlertTriangle, LogOut, Maximize2, ShieldAlert, ShieldX } from "lucide-react";

export function FullscreenWarning(): React.ReactElement {
  const {
    testStatus,
    isPaused,
    setPaused,
    setFullscreenActive,
    fullscreenExitCount,
    securityAlert,
    setSecurityAlert,
    proctorCode,
    isBreakActive,
    isTransitionActive,
  } = useTestContext();
  const requestFullscreen = useRequestFullscreen();

  const handleResumeFullscreen = async () => {
    try {
      await requestFullscreen();
    } catch (e) {
      console.warn("Could not enter fullscreen:", e);
    }
    setSecurityAlert(null);
    setFullscreenActive(true);
    setPaused(false);
  };

  // Never show fullscreen warning during breaks or module transitions
  if (isBreakActive || isTransitionActive) {
    return <></>;
  }

  const isProctored = Boolean(proctorCode);
  const count = securityAlert?.exitCount ?? fullscreenExitCount ?? 0;
  // Disqualification ONLY applies to Live Proctored Exams
  const isDisqualified = isProctored && (count >= 5 || securityAlert?.isDisqualified === true);
  const remainingWarnings = Math.max(0, 5 - count);

  // If not in testing state and not disqualified, don't show
  if (testStatus !== "testing" && !isDisqualified) {
    return <></>;
  }

  // Show modal whenever securityAlert is open, or disqualified, or paused
  const isOpen = Boolean(securityAlert?.isOpen || isDisqualified || isPaused);
  if (!isOpen) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`max-w-lg w-full bg-white dark:bg-[#121212] border-2 ${
          isDisqualified
            ? "border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.35)]"
            : isProctored && count >= 3
            ? "border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.25)]"
            : "border-amber-500/80 shadow-2xl"
        } rounded-3xl p-7 sm:p-8 space-y-6 relative overflow-hidden`}
      >
        {/* Ambient Glow */}
        <div
          className={`absolute top-0 right-0 w-40 h-40 ${
            isDisqualified ? "bg-red-500/15" : "bg-amber-500/15"
          } blur-[50px] pointer-events-none`}
        />

        {/* Header */}
        <div className="flex items-start gap-4 relative z-10">
          <div
            className={`p-3.5 ${
              isDisqualified
                ? "bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400"
                : isProctored && count >= 3
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
            } rounded-2xl flex-shrink-0`}
          >
            {isDisqualified ? (
              <ShieldX className="w-9 h-9 animate-bounce" />
            ) : isProctored ? (
              <ShieldAlert className="w-9 h-9 animate-pulse" />
            ) : (
              <AlertTriangle className="w-9 h-9 animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {isDisqualified
                ? "Exam Session Disqualified"
                : isProctored
                ? count >= 4
                  ? "Final Warning: Exit Detected"
                  : `Security Alert: Exit #${count}`
                : "Notice: Fullscreen Recommended"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isDisqualified
                ? "Security violation limit reached (5 of 5) • Live exam locked"
                : isProctored
                ? "Live exam security active • Tab switch or window exit logged"
                : "Practice Mode • Fullscreen recommended for authentic testing"}
            </p>
          </div>
        </div>

        {/* 5-Step Violation Progress Bar for Live Proctored Exams */}
        {isProctored ? (
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <span>Security Violations</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                  isDisqualified
                    ? "bg-red-600 text-white"
                    : count >= 3
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                {Math.min(count, 5)} / 5
              </span>
            </div>

            {/* 5 visual blocks */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((step) => {
                const isFilled = step <= count;
                const isCurrent = step === count;
                return (
                  <div
                    key={step}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isFilled
                        ? step === 5
                          ? "bg-red-600"
                          : "bg-amber-500"
                        : "bg-slate-200 dark:bg-zinc-800"
                    } ${isCurrent ? "ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-[#121212]" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl">
            <span>Practice Session</span>
            <span className="font-bold">Exit #{count}</span>
          </div>
        )}

        {/* Warning Details Card */}
        <div
          className={`p-4 rounded-2xl border relative z-10 ${
            isDisqualified
              ? "bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200"
              : isProctored && count >= 4
              ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
              : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
          }`}
        >
          {isDisqualified ? (
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="font-bold">
                Maximum allowed limit of 5 tab switches or window exits reached!
              </p>
              <p className="text-xs opacity-90">
                In accordance with examination proctoring regulations, your live exam session has been disqualified with 0 points. Re-entering this live exam session is restricted.
              </p>
            </div>
          ) : isProctored ? (
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="font-bold">
                Tab switch or window exit detected!
              </p>
              <p className="text-xs opacity-90">
                You have <strong className="underline font-black">{remainingWarnings} warning{remainingWarnings === 1 ? "" : "s"}</strong> remaining before your live examination session is automatically disqualified.
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="font-bold">
                You switched tabs or exited fullscreen mode.
              </p>
              <p className="text-xs opacity-90">
                To best replicate the actual Digital SAT testing conditions, please stay focused in fullscreen mode until your test is complete. Click below to resume.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!isDisqualified && (
          <div className="bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-2 relative z-10 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Exam Rules:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Remain on this test screen until your section or test is complete.</li>
              <li>Do not open other applications, tabs, or devtools.</li>
              <li>Click the button below to resume fullscreen testing.</li>
            </ul>
          </div>
        )}

        {/* Action Button */}
        <div className="relative z-10 pt-2">
          {isDisqualified ? (
            <button
              onClick={() => {
                window.location.href = "/student/mock-tests?error=disqualified";
              }}
              className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-red-600 hover:bg-red-700 text-white shadow-lg active:scale-[0.98] cursor-pointer text-base"
            >
              <LogOut className="w-5 h-5" /> Leave Exam Session
            </button>
          ) : (
            <button
              onClick={handleResumeFullscreen}
              className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 shadow-[0_0_30px_rgba(235,255,0,0.35)] active:scale-[0.98] cursor-pointer text-base"
            >
              <Maximize2 className="w-5 h-5" /> Return to Fullscreen & Resume
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium relative z-10">
          {isProctored
            ? "Live Exam Security Active • Timestamp and irregular exits logged"
            : "Practice Mode • Fullscreen recommended for focus"}
        </p>
      </div>
    </div>
  );
}


