"use client";

import React, { useEffect, useState } from "react";
import { useTestContext } from "../context/TestContext";
import { useTestState } from "./hooks/useTestState";
import { useTestCompletion } from "./hooks/useTestCompletion";
import { Button } from "@/components/ui/Button";
import { Grid3X3 } from "lucide-react";

interface TestFooterProps {
  currentQuestionNumber: number;
  totalQuestionsInModule: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastQuestionOfModule?: boolean;
  isLastQuestionOfTest?: boolean;
  studentName?: string;
}

export function TestFooter({
  currentQuestionNumber,
  totalQuestionsInModule,
  canGoPrevious,
  canGoNext,
  isLastQuestionOfModule = false,
  isLastQuestionOfTest = false,
  studentName = "SAT Student",
}: TestFooterProps): React.ReactElement {
  const { setNavigatorOpen, setTransitionActive, testId, userId } =
    useTestContext();
  const { goToNextQuestion, goToPreviousQuestion } = useTestState();
  const completeTest = useTestCompletion(userId, testId);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleNextClick = () => {
    if (isLastQuestionOfTest) {
      setShowSubmitModal(true);
    } else if (isLastQuestionOfModule) {
      // Show module transition overlay
      setTransitionActive(true);
    } else {
      goToNextQuestion();
    }
  };

  return (
    <>
      <footer className="sticky bottom-0 z-40 bg-white dark:bg-[#131313] border-t border-slate-200 dark:border-white/10 h-16 flex items-center shrink-0">
        <div className="w-full px-6 flex items-center justify-between">
          {/* Left: Student Name */}
          <div className="flex-1 flex items-center min-w-0">
            <div className="text-slate-700 dark:text-slate-300 font-semibold text-sm truncate pr-4">
              {studentName}
            </div>
          </div>

          {/* Center: Question Navigator (Black Pill) */}
          <div className="flex-shrink-0 flex justify-center">
            <button
              onClick={() => setNavigatorOpen(true)}
              className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-[#EBFF00]/50 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] transition-all shadow-sm"
              title="Open question navigator"
            >
              <span className="text-sm font-semibold tracking-wide">
                Question {currentQuestionNumber} of {totalQuestionsInModule}
              </span>
              <div className="bg-slate-200 dark:bg-[#1c1b1b] p-1 rounded">
                <Grid3X3 className="w-4 h-4 text-slate-900 dark:text-white" />
              </div>
            </button>
          </div>

          {/* Right: Navigation Buttons */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={goToPreviousQuestion}
              disabled={!canGoPrevious}
              className="bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:bg-transparent font-bold px-4"
            >
              Back
            </Button>
            <button
              onClick={handleNextClick}
              disabled={!canGoNext}
              className={`font-bold px-6 py-2.5 rounded-full transition-all text-sm ${
                isLastQuestionOfTest
                  ? "bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 shadow-[0_0_15px_rgba(235,255,0,0.25)]"
                  : isLastQuestionOfModule
                    ? "bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 shadow-[0_0_15px_rgba(235,255,0,0.25)]"
                    : "bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950"
              }`}
            >
              {isLastQuestionOfTest
                ? "Submit Exam"
                : isLastQuestionOfModule
                  ? "Next Module"
                  : "Next"}
            </button>
          </div>
        </div>
      </footer>

      {/* Bluebook Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-[#EBFF00]/15 flex items-center justify-center mb-4">
              <Grid3X3 className="w-6 h-6 text-slate-900 dark:text-[#EBFF00]" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Ready to Submit Your Exam?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Once you confirm submission, your answers will be finalized and evaluated. You will not be able to return to this exam or modify any responses.
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Return to Review
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  completeTest();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-black text-sm transition-all shadow-[0_0_15px_rgba(235,255,0,0.3)]"
              >
                Yes, Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
