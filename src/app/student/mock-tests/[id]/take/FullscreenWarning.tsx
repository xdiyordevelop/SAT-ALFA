"use client";

import React from "react";
import { useTestContext } from "../context/TestContext";
import { useRequestFullscreen } from "./hooks/useFullscreenTracking";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, Maximize2 } from "lucide-react";

export function FullscreenWarning(): React.ReactElement {
  const { isFullscreenActive, testStatus, isPaused, setPaused } =
    useTestContext();
  const requestFullscreen = useRequestFullscreen();

  const handleResumeFullscreen = async () => {
    await requestFullscreen();
    setPaused(false);
  };

  // Only show if paused due to fullscreen violation during test
  if (isFullscreenActive || testStatus !== "testing" || !isPaused) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white dark:bg-[#131313] border-2 border-red-500 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-1">
              {" "}
              Test Paused{" "}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {" "}
              Fullscreen mode is required to continue testing.{" "}
            </p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-200">
            You have exited fullscreen mode. This is flagged for the proctor. To
            continue, you must return to fullscreen mode immediately.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">
            To Resume:
          </h3>
          <ol className="text-sm text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
            <li>Click the button below</li>
            <li>Approve fullscreen request if prompted</li>
            <li>Your test will continue</li>
          </ol>
        </div>

        {/* Resume Button */}
        <button
          onClick={handleResumeFullscreen}
          className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-yellow-400 text-slate-950 hover:bg-yellow-500 active:scale-95"
        >
          <Maximize2 className="w-5 h-5" /> Return to Fullscreen & Resume
        </button>

        {/* Footer */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Violation logged • Session ID recorded • Continue testing to proceed
        </p>
      </Card>
    </div>
  );
}
