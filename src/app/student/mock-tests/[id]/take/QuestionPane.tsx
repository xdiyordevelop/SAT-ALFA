"use client";

import React, { useState, useEffect } from "react";
import { useTestState } from "./hooks/useTestState";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Bookmark, X } from "lucide-react";

import { useTestContext } from "../context/TestContext";

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
  const { fontSize } = useTestContext();

  const isLarge = fontSize === "large";

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
    // Limit to 7 characters for fill-in (allows negative decimals or fractions like -12/13)
    const limited = value.slice(0, 7);
    selectAnswer(question.id, limited);
  };

  const toggleEliminate = (e: React.MouseEvent, key: string) => {
    e.stopPropagation(); // Prevent triggering the answer selection
    setEliminatedOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full space-y-6 select-text">
      {/* Top Bar: Question Number & Mark for Review */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold px-3.5 py-1 rounded-md text-base min-w-[2.25rem] text-center shadow-sm">
            {question.questionNumber}
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleMark}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
            isMarked
              ? "border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 font-semibold shadow-sm"
              : "border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-zinc-500 bg-transparent"
          }`}
          title={isMarked ? "Unmark" : "Mark for Review"}
        >
          <Bookmark className={`w-4 h-4 ${isMarked ? "fill-current text-red-500" : ""}`} />
          <span className="text-[14px] font-semibold">Mark for Review</span>
        </button>
      </div>

      {/* Question Prompt - High Legibility Typography */}
      <div className="my-2">
        <MathRenderer
          text={question.prompt}
          className={`max-w-none text-slate-900 dark:text-slate-100 font-normal tracking-normal ${
            isLarge
              ? "text-[20.5px] lg:text-[21px] leading-[1.7] [&_p]:text-[20.5px] [&_p]:lg:text-[21px] [&_p]:leading-[1.7] [&_p]:mb-3"
              : "text-[18.5px] lg:text-[19px] leading-[1.65] [&_p]:text-[18.5px] [&_p]:lg:text-[19px] [&_p]:leading-[1.65] [&_p]:mb-3"
          }`}
        />
      </div>

      {/* Question Choices */}
      <div className="space-y-3 mt-4">
        {question.format === "mcq" && question.options ? (
          // Multiple Choice
          <div className="flex flex-col gap-3.5">
            {Object.entries(question.options).map(([key, value]) => {
              const isSelected = selectedAnswer === key;
              const isEliminated = eliminatedOptions[key] && !isSelected;
              return (
                <div key={key} className="flex items-stretch gap-2.5">
                  {/* The Option Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectAnswer(key)}
                    className={`flex-1 text-left p-4 sm:p-4.5 rounded-xl border-2 transition-all duration-150 relative group cursor-pointer ${
                      isSelected
                        ? "border-[#0070f3] dark:border-[#38bdf8] bg-blue-50/70 dark:bg-sky-950/30 ring-2 ring-[#0070f3]/20 dark:ring-[#38bdf8]/30 shadow-sm"
                        : isEliminated
                          ? "border-slate-200 dark:border-zinc-800 opacity-40 bg-slate-50 dark:bg-zinc-900/30"
                          : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-slate-400 dark:hover:border-zinc-500 hover:bg-slate-50/60 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Circle Indicator */}
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold text-[15px] transition-all ${
                          isSelected
                            ? "border-[#0070f3] dark:border-[#38bdf8] bg-[#0070f3] dark:bg-[#38bdf8] text-white dark:text-slate-950 shadow-sm"
                            : isEliminated
                              ? "border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500"
                              : "border-slate-400 dark:border-zinc-600 text-slate-700 dark:text-slate-300 group-hover:border-slate-600 dark:group-hover:border-zinc-400"
                        }`}
                      >
                        {key}
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <MathRenderer
                          text={String(value)}
                          inline
                          className={`leading-[1.6] font-normal text-slate-900 dark:text-slate-100 ${
                            isLarge
                              ? "text-[19.5px] lg:text-[20px]"
                              : "text-[17.5px] lg:text-[18px]"
                          } ${
                            isEliminated
                              ? "line-through text-slate-400 dark:text-zinc-500"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Strikethrough/Elimination Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleEliminate(e, key)}
                    className={`w-12 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                      isEliminated
                        ? "bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300"
                        : "bg-transparent border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300"
                    }`}
                    title="Eliminate choice"
                  >
                    <span className="font-bold text-xs tracking-wider line-through opacity-80">
                      ABC
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          // Fill-in-the-Blank
          <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-base font-bold text-slate-800 dark:text-slate-200">
                Student-Produced Response
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Fractions (e.g., 3/4) & decimals permitted
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={selectedAnswer || ""}
                onChange={(e) => handleFillInChange(e.target.value)}
                placeholder="Enter your answer"
                maxLength={7}
                className="w-full max-w-sm px-5 py-3.5 bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:border-[#0070f3] dark:focus:border-[#38bdf8] focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-xl font-mono font-bold tracking-wider shadow-sm"
              />
              {selectedAnswer && (
                <button
                  type="button"
                  onClick={() => selectAnswer(question.id, "")}
                  className="p-3.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400 cursor-pointer"
                  title="Clear answer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
