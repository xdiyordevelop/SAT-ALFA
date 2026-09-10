"use client";

import React, { useEffect, useState } from "react";
import { useTestContext } from "../context/TestContext";
import { useRequestFullscreen } from "./hooks/useFullscreenTracking";
import { Card } from "@/components/ui/Card";
import { AlertCircle, Play } from "lucide-react";

const BREAK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export function BreakScreen(): React.ReactElement {
  const {
    isBreakActive,
    setBreakActive,
    setCurrentModule,
    setPaused,
    resetRemainingTime,
  } = useTestContext();

  const [remainingMs, setRemainingMs] = useState(BREAK_DURATION_MS);
  const [isBreakOver, setIsBreakOver] = useState(false);

  // Initialize break timer
  useEffect(() => {
    if (!isBreakActive) {
      setRemainingMs(BREAK_DURATION_MS);
      setIsBreakOver(false);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, BREAK_DURATION_MS - elapsed);
      setRemainingMs(remaining);
      if (remaining === 0) {
        setIsBreakOver(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isBreakActive]);

  const requestFullscreen = useRequestFullscreen();

  const handleResumeTest = async () => {
    // Re-enter fullscreen when resuming testing
    try {
      await requestFullscreen();
    } catch (e) {}

    // Move to next module (Math)
    setCurrentModule(3);
    resetRemainingTime(3);
    setBreakActive(false);
    setPaused(false);
  };

  if (!isBreakActive) {
    return <></>;
  }

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white dark:bg-[#131313] border border-[#EBFF00]/30 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-slate-900 dark:text-[#EBFF00] flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Take a Break
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You have completed Reading and Writing. Get ready for Math.
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl p-6 text-center space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Break Time Remaining
          </p>
          <p className="text-5xl font-mono font-black text-slate-900 dark:text-[#EBFF00]">
            {timeDisplay}
          </p>
          {isBreakOver && (
            <p className="text-sm text-emerald-500 font-medium animate-pulse">
              Break time is over. Ready to continue?
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
            During Your Break:
          </h3>
          <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
            <li>✓ Use the restroom</li>
            <li>✓ Get water or a snack</li>
            <li>✓ Stretch and relax</li>
            <li>✗ Do not discuss the test</li>
            <li>✗ Do not access study materials</li>
          </ul>
        </div>

        {/* Resume Button */}
        <button
          onClick={handleResumeTest}
          className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(235,255,0,0.25)]"
        >
          <Play className="w-5 h-5 fill-current" /> Resume Testing / Skip Break →
        </button>

        {/* Footer */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Do not close this window. Your test will continue automatically after
          the break.
        </p>
      </Card>
    </div>
  );
}
