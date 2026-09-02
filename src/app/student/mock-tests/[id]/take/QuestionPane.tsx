"use client";

import React, { useState, useEffect } from "react";
import { useTestState } from "./hooks/useTestState";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Bookmark, X } from "lucide-react";

interface QuestionPaneProps {
  question: any;
  moduleNumber: 1 | 2 | 3 | 4;
}

export function QuestionPane({
  question,
  moduleNumber,
}: QuestionPaneProps): React.ReactElement {
  const {
    selectAnswer,
    markForReview,
    getAnswerForQuestion,
    isQuestionMarked,
  } = useTestState();

  const selectedAnswer = getAnswerForQuestion(question.id);
  const isMarked = isQuestionMarked(question.id);

  // Track eliminated options locally per question
  const [eliminatedOptions, setEliminatedOptions] = useState<
    Record<string, boolean>
  >({});

  // Clear eliminated options when question changes
  useEffect(() => {
    setEliminatedOptions({});
  }, [question.id]);

  const handleSelectAnswer = (answer: string) => {
    selectAnswer(question.id, answer);
  };

  const handleToggleMark = () => {
    markForReview(question.id);
  };

  const handleFillInChange = (value: string) => {
    // Limit to 5 characters for fill-in
    const limited = value.slice(0, 5);
    selectAnswer(question.id, limited);
  };

  const toggleEliminate = (e: React.MouseEvent, key: string) => {
    e.stopPropagation(); // Prevent triggering the answer selection
    setEliminatedOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full pl-6 pt-4 space-y-6">
      {/* Top Bar: Question Number & Mark for Review */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-white font-bold px-3 py-1 rounded text-lg">
            {question.questionNumber}
          </div>
          {/* We don't render direction lines explicitly unless part of prompt, but can put placeholder */}
        </div>
        <button
          onClick={handleToggleMark}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors duration-200 ${
            isMarked
              ? "border-red-500/50 text-red-600 bg-red-50"
              : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-500"
          }`}
          title={isMarked ? "Unmark" : "Mark for Review"}
        >
          <Bookmark className={`w-4 h-4 ${isMarked ? "fill-current" : ""}`} />
          <span className="text-sm font-semibold">Mark for Review</span>
        </button>
      </div>

      {/* Question Prompt */}
      <MathRenderer
        text={question.prompt}
        className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-[17px]"
      />

      {/* Question Choices */}
      <div className="space-y-2.5 mt-4">
        {question.format === "mcq" && question.options ? (
          // Multiple Choice
          <div className="flex flex-col gap-3">
            {Object.entries(question.options).map(([key, value]) => {
              const isSelected = selectedAnswer === key;
              const isEliminated = eliminatedOptions[key] && !isSelected;
              return (
                <div key={key} className="flex items-stretch gap-2">
                  {/* The Option Button */}
                  <button
                    onClick={() => handleSelectAnswer(key)}
                    className={`flex-1 text-left p-4 rounded-xl border transition-all duration-200 relative group ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/5 shadow-[0_0_0_1px_rgba(59,130,246,1)]"
                        : isEliminated
                          ? "border-slate-200 dark:border-white/10 opacity-50 bg-transparent"
                          : "border-slate-200 dark:border-white/10 bg-transparent hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Circle Indicator */}
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold text-sm transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-500 text-slate-900 dark:text-white"
                            : isEliminated
                              ? "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                              : "border-slate-500 text-slate-600 dark:text-slate-400 group-hover:border-slate-400"
                        }`}
                      >
                        {key}
                      </div>
                      {/* Text */}
                      <MathRenderer
                        text={String(value)}
                        inline
                        className={`text-slate-700 dark:text-slate-300 flex-1 leading-relaxed ${
                          isEliminated
                            ? "line-through text-slate-500 dark:text-slate-400"
                            : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Strikethrough/Elimination Toggle Button */}
                  <button
                    onClick={(e) => toggleEliminate(e, key)}
                    className={`w-12 rounded-xl border flex items-center justify-center transition-colors ${
                      isEliminated
                        ? "bg-slate-100 dark:bg-[#1c1b1b] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                        : "bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-[#1c1b1b] hover:text-slate-500 dark:text-slate-400"
                    }`}
                    title="Eliminate choice"
                  >
                    <span className="font-bold text-xs line-through opacity-70">
                      ABC
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          // Fill-in-the-Blank
          <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl p-6 mt-4">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400">
                Student-Produced Response
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedAnswer || ""}
                  onChange={(e) => handleFillInChange(e.target.value)}
                  placeholder="Enter your answer"
                  maxLength={5}
                  className="w-full max-w-xs px-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 text-lg"
                />
                {selectedAnswer && (
                  <button
                    onClick={() => selectAnswer(question.id, "")}
                    className="p-3 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded-lg transition-colors"
                    title="Clear answer"
                  >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
