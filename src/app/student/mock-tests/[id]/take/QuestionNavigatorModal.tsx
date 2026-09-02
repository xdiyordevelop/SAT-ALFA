"use client";

import React, { useMemo } from "react";
import { useTestContext } from "../context/TestContext";
import { useTestState } from "./hooks/useTestState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Flag, X } from "lucide-react";

export function QuestionNavigatorModal(): React.ReactElement {
  const {
    isNavigatorOpen,
    setNavigatorOpen,
    realQuestions,
    currentModule,
    currentQuestionIndex,
    setCurrentQuestionIndex,
  } = useTestContext();

  const { getAnswerForQuestion, isQuestionMarked } = useTestState();

  const moduleQuestions = useMemo(
    () => realQuestions.filter((q: any) => q.module === currentModule),
    [currentModule, realQuestions],
  );

  const getQuestionStatus = (index: number) => {
    const question = moduleQuestions[index];
    if (!question) return "empty";
    const hasAnswer = !!getAnswerForQuestion(question.id);
    const isMarked = isQuestionMarked(question.id);
    if (isMarked) return "marked";
    if (hasAnswer) return "answered";
    return "unanswered";
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setNavigatorOpen(false);
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (isActive) {
      return "border-yellow-400 bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/50 ring-2 ring-yellow-400/50";
    }
    switch (status) {
      case "marked":
        return "border-yellow-400 bg-yellow-400/20 text-slate-900 dark:text-yellow-500";
      case "answered":
        return "border-slate-600 bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300";
      case "unanswered":
        return "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-slate-400 hover:border-slate-400";
      default:
        return "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]";
    }
  };

  return (
    <Modal
      isOpen={isNavigatorOpen}
      onClose={() => setNavigatorOpen(false)}
      title={`Questions - Module ${currentModule}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]" />
            <span className="text-slate-500 dark:text-slate-400">
              Unanswered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border-2 border-slate-600 bg-slate-100 dark:bg-[#1c1b1b]" />
            <span className="text-slate-500 dark:text-slate-400">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border-2 border-yellow-400 bg-yellow-400/20 flex items-center justify-center">
              <Flag className="w-4 h-4 text-slate-900 dark:text-yellow-500" />
            </div>
            <span className="text-slate-500 dark:text-slate-400">
              Marked for Review
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border-2 border-yellow-400 bg-yellow-400 text-slate-950 font-bold text-xs" />
            <span className="text-slate-500 dark:text-slate-400">Current</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="grid grid-cols-8 gap-2">
          {moduleQuestions.map((question, index) => {
            const status = getQuestionStatus(index);
            const isActive = index === currentQuestionIndex;
            const isMarked = isQuestionMarked(question.id);
            return (
              <button
                key={question.id}
                onClick={() => handleQuestionSelect(index)}
                className={`relative w-10 h-10 rounded-lg border-2 font-bold transition-all duration-200 flex items-center justify-center ${getStatusColor(
                  status,
                  isActive,
                )}`}
                title={`Question ${question.questionNumber}${isMarked ? " (marked)" : ""}`}
              >
                {question.questionNumber}
                {/* Marked Flag Icon */}
                {isMarked && !isActive && (
                  <Flag className="absolute -top-1 -right-1 w-3 h-3 text-slate-900 dark:text-yellow-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {moduleQuestions.filter((q) => getAnswerForQuestion(q.id)).length}{" "}
            of {moduleQuestions.length} answered
          </div>
          <Button variant="secondary" onClick={() => setNavigatorOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
