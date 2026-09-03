"use client";

import React, { useMemo } from "react";
import { useTestContext } from "../context/TestContext";
import { useTestState } from "./hooks/useTestState";
import { Button } from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export function ModuleTransitionOverlay(): React.ReactElement {
  const {
    isTransitionActive,
    setTransitionActive,
    currentModule,
    resetRemainingTime,
    setBreakActive,
  } = useTestContext();

  const { getTestProgress, advanceToNextModule } = useTestState();
  const progress = getTestProgress();

  const handleContinue = () => {
    setTransitionActive(false);
    if (currentModule === 2) {
      setBreakActive(true); // Start the break screen between RW and Math
    } else {
      advanceToNextModule();
      resetRemainingTime((currentModule + 1) as any); // Reset timer for new module
      window.scrollTo(0, 0);
    }
  };

  if (!isTransitionActive) {
    return <></>;
  }

  const moduleName =
    currentModule <= 2
      ? `Reading & Writing Module ${currentModule}`
      : `Math Module ${currentModule - 2}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-md w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          End of {moduleName}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Review your progress before moving on.
        </p>

        {/* Progress Summary Box */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-lg p-5 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Answered Questions</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {progress.answered}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <AlertCircle className="w-5 h-5 text-slate-900 dark:text-yellow-500" />
              <span>Flagged for Review</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {progress.marked}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] font-bold">
                ?
              </div>
              <span>Unanswered</span>
            </div>
            <span className="font-bold text-red-600">
              {progress.total - progress.answered}
            </span>
          </div>
        </div>

        <div className="bg-yellow-950/20 border border-yellow-700/50 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              Once you leave this module, you <strong>cannot return</strong> to
              these questions. Please ensure you are ready to move on.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => setTransitionActive(false)}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            className="flex-1 bg-yellow-400 text-slate-950 hover:bg-[#EBFF00]"
          >
            Continue {currentModule === 2 ? "to Break" : "to Next Module"}
          </Button>
        </div>
      </div>
    </div>
  );
}
