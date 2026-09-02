"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface TimerDisplayProps {
  remainingTimeMs: number;
  isPaused: boolean;
  isWarning5min?: boolean;
  isWarning1min?: boolean;
}

export function TimerDisplay({
  remainingTimeMs,
  isPaused,
  isWarning5min = remainingTimeMs <= 5 * 60 * 1000,
  isWarning1min = remainingTimeMs <= 60 * 1000,
}: TimerDisplayProps): React.ReactElement {
  const [displayTime, setDisplayTime] = useState<string>("00:00");
  const [isFlashing, setIsFlashing] = useState(false);

  // Format milliseconds to MM:SS
  useEffect(() => {
    const totalSeconds = Math.max(0, Math.floor(remainingTimeMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setDisplayTime(
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    );
  }, [remainingTimeMs]);

  // Trigger flashing for 1-minute warning
  useEffect(() => {
    if (isWarning1min && !isPaused) {
      const flashInterval = setInterval(() => {
        setIsFlashing((prev) => !prev);
      }, 500);
      return () => clearInterval(flashInterval);
    }
    setIsFlashing(false);
  }, [isWarning1min, isPaused]);

  // Determine styling based on warning level
  const getTimerClasses = () => {
    if (isPaused) {
      return "text-slate-500 dark:text-slate-400";
    }
    if (isWarning1min) {
      return isFlashing
        ? "text-red-500 animate-pulse"
        : "text-slate-900 dark:text-yellow-500 animate-pulse";
    }
    if (isWarning5min) {
      return "text-slate-900 dark:text-yellow-500";
    }
    return "text-slate-900 dark:text-yellow-500";
  };

  const getContainerClasses = () => {
    if (isPaused) {
      return "bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10";
    }
    if (isWarning1min) {
      return `border-red-500 bg-red-950/20 ${isFlashing ? "shadow-lg shadow-red-500/50" : ""}`;
    }
    if (isWarning5min) {
      return "border-yellow-500 bg-yellow-950/20 shadow-md shadow-yellow-500/30";
    }
    return "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]";
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${getContainerClasses()}`}
    >
      {/* Icon */}
      {isWarning1min ? (
        <AlertCircle className={`w-5 h-5 ${getTimerClasses()}`} />
      ) : (
        <Clock className={`w-5 h-5 ${getTimerClasses()}`} />
      )}

      {/* Time Display */}
      <span className={`font-mono font-bold text-lg ${getTimerClasses()}`}>
        {displayTime}
      </span>

      {/* Paused Indicator */}
      {isPaused && (
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
          PAUSED
        </span>
      )}

      {/* Warning Label */}
      {isWarning1min && (
        <span className="text-xs font-bold text-red-600 ml-1">URGENT</span>
      )}
      {isWarning5min && !isWarning1min && (
        <span className="text-xs font-bold text-slate-900 dark:text-yellow-500 ml-1">
          5 MIN
        </span>
      )}
    </div>
  );
}
