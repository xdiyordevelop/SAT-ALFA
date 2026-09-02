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
}

export function TestFooter({
  currentQuestionNumber,
  totalQuestionsInModule,
  canGoPrevious,
  canGoNext,
  isLastQuestionOfModule = false,
  isLastQuestionOfTest = false,
}: TestFooterProps): React.ReactElement {
  const { setNavigatorOpen, setTransitionActive, testId, userId, studentId } =
    useTestContext();
  const { goToNextQuestion, goToPreviousQuestion } = useTestState();
  const completeTest = useTestCompletion(userId, testId);
  const [studentName, setStudentName] = useState<string>("Student");

  useEffect(() => {
    // Try to get name from API or localStorage in a real implementation
    // For now, keep it simple
    setStudentName("SAT Student");
  }, []);

  const handleNextClick = () => {
    if (isLastQuestionOfTest) {
      if (
        confirm(
          "Are you sure you want to submit your test? You cannot return after submitting.",
        )
      ) {
        completeTest();
      }
    } else if (isLastQuestionOfModule) {
      // Show module transition overlay
      setTransitionActive(true);
    } else {
      goToNextQuestion();
    }
  };

  return (
    <footer className="sticky bottom-0 z-40 bg-white dark:bg-[#131313] border-t border-slate-200 dark:border-white/10 h-16 flex items-center shrink-0">
      <div className="w-full px-6 flex items-center justify-between">
        {/* Left: Student Name */}
        <div className="flex-1 flex items-center min-w-0">
          <div className="text-slate-600 dark:text-slate-400 font-medium text-sm truncate pr-4">
            {studentName}
          </div>
        </div>

        {/* Center: Question Navigator (Black Pill) */}
        <div className="flex-shrink-0 flex justify-center">
          <button
            onClick={() => setNavigatorOpen(true)}
            className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-slate-500 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors shadow-sm"
            title="Open question navigator"
          >
            <span className="text-sm font-semibold tracking-wide">
              Question {currentQuestionNumber} of {totalQuestionsInModule}
            </span>
            <div className="bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded">
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
            className="bg-transparent border-transparent hover:bg-slate-100 dark:bg-[#1c1b1b] text-blue-600 disabled:text-slate-600 dark:text-slate-400 disabled:bg-transparent font-semibold px-4"
          >
            Back
          </Button>
          <Button
            variant={isLastQuestionOfModule ? "primary" : "secondary"}
            onClick={handleNextClick}
            disabled={!canGoNext}
            className={`font-semibold px-6 rounded-full transition-colors ${
              isLastQuestionOfModule
                ? "bg-blue-600 text-white hover:bg-blue-500 border-none shadow-md"
                : "bg-blue-600 text-white hover:bg-blue-500 border-none shadow-md"
            }`}
          >
            {isLastQuestionOfTest
              ? "Submit"
              : isLastQuestionOfModule
                ? "Next"
                : "Next"}
          </Button>
        </div>
      </div>
    </footer>
  );
}
