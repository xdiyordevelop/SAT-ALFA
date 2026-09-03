"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface ReviewQuestion {
  questionId: string;
  module: number;
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  domain?: string;
  skill?: string;
}

interface ReviewGridProps {
  reviewIndex: ReviewQuestion[];
}

export function ReviewGrid({
  reviewIndex,
}: ReviewGridProps): React.ReactElement {
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] =
    useState<ReviewQuestion | null>(null);

  // Group by module
  const groupedByModule = reviewIndex.reduce(
    (acc, q) => {
      if (!acc[q.module]) {
        acc[q.module] = [];
      }
      acc[q.module].push(q);
      return acc;
    },
    {} as Record<number, ReviewQuestion[]>,
  );

  const getModuleLabel = (module: number): string => {
    const labels: Record<number, string> = {
      1: "Reading & Writing 1",
      2: "Reading & Writing 2",
      3: "Math 1",
      4: "Math 2",
    };
    return labels[module] || `Module ${module}`;
  };

  const getStatusIcon = (question: ReviewQuestion) => {
    if (!question.userAnswer) {
      return (
        <HelpCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      );
    }
    if (question.isCorrect) {
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (question: ReviewQuestion): string => {
    if (!question.userAnswer) {
      return "bg-slate-100 dark:bg-[#1c1b1b] border-slate-200 dark:border-white/10 hover:border-slate-400";
    }
    if (question.isCorrect) {
      return "bg-emerald-950/50 border-emerald-700/50 hover:border-emerald-600";
    }
    return "bg-red-950/50 border-red-700/50 hover:border-red-600";
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedByModule)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([moduleNum, questions]) => (
          <div key={moduleNum}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#EBFF00] mb-4">
              {getModuleLabel(parseInt(moduleNum))}
            </h3>
            {/* 8-column grid */}
            <div className="grid grid-cols-8 gap-2">
              {questions.map((question) => (
                <button
                  key={question.questionId}
                  onClick={() => setSelectedQuestion(question)}
                  onMouseEnter={() => setHoveredQuestion(question.questionId)}
                  onMouseLeave={() => setHoveredQuestion(null)}
                  className={`relative w-full aspect-square rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${getStatusColor(
                    question,
                  )}`}
                  title={`Q${question.questionNumber}: ${question.domain || question.skill || "General"}`}
                >
                  {/* Question Number */}
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {question.questionNumber}
                  </span>
                  {/* Hover tooltip */}
                  {hoveredQuestion === question.questionId && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap z-10">
                      {question.domain || question.skill || "General"}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

      {/* Detail Modal */}
      {selectedQuestion && (
        <Card className="bg-white dark:bg-[#131313] border-yellow-600/30 p-6 mt-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Question {selectedQuestion.questionNumber}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getModuleLabel(selectedQuestion.module)} •{""}{" "}
                {selectedQuestion.domain || selectedQuestion.skill || "General"}
              </p>
            </div>
            <button
              onClick={() => setSelectedQuestion(null)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            {/* User Answer */}
            <div className="bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-2">
                Your Answer
              </p>
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedQuestion)}
                <p className="text-lg font-mono text-slate-700 dark:text-slate-300">
                  {selectedQuestion.userAnswer || "(Not answered)"}
                </p>
              </div>
            </div>
            {/* Correct Answer (if wrong) */}
            {!selectedQuestion.isCorrect && (
              <div className="bg-emerald-950/30 border border-emerald-700/50 rounded p-4">
                <p className="text-xs text-emerald-500 uppercase font-bold mb-2">
                  Correct Answer
                </p>
                <p className="text-lg font-mono text-emerald-700">
                  {selectedQuestion.correctAnswer}
                </p>
              </div>
            )}
            {/* Status Badge */}
            {selectedQuestion.isCorrect && (
              <div className="bg-emerald-950/30 border border-emerald-700/50 rounded p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Correct!</span>
              </div>
            )}
            {!selectedQuestion.isCorrect && selectedQuestion.userAnswer && (
              <div className="bg-red-950/30 border border-red-700/50 rounded p-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-bold">Incorrect</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Legend:
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Correct
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Incorrect
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Not Answered
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
