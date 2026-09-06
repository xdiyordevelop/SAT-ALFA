"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { MathRenderer } from "@/components/ui/MathRenderer";
import {
  CheckCircle2,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ZoomIn,
  X,
  Lightbulb,
} from "lucide-react";

export function QuestionReviewPane({
  questions,
  reviewIndex,
}: {
  questions: any[];
  reviewIndex: any[];
}) {
  const [filterSection, setFilterSection] = useState<"ALL" | "RW" | "MATH">("ALL");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "CORRECT" | "INCORRECT" | "UNANSWERED"
  >("ALL");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Enrich review index with full question text and metadata
  const enrichedReviews = (reviewIndex || [])
    .map((r) => {
      const q = questions.find((q) => q.id === r.questionId);
      return { ...r, fullQuestion: q };
    })
    .filter((r) => r.fullQuestion); // Ensure question exists

  const filtered = enrichedReviews.filter((r) => {
    // Section filter
    const isRW =
      r.module === "MODULE_1" ||
      r.module === "MODULE_2" ||
      r.module === 1 ||
      r.module === 2;
    if (filterSection === "RW" && !isRW) return false;
    if (filterSection === "MATH" && isRW) return false;

    // Status filter
    if (filterStatus === "CORRECT" && !r.isCorrect) return false;
    if (filterStatus === "INCORRECT" && (r.isCorrect || !r.userAnswer))
      return false;
    if (filterStatus === "UNANSWERED" && r.userAnswer) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card className="p-4 bg-white dark:bg-[#131313] shadow-sm border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between print:hidden rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 text-slate-900 dark:text-[#EBFF00]" /> Filter by:
          </div>
          {/* Section Filter */}
          <div className="flex bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-xl border border-slate-200 dark:border-white/5">
            <button
              onClick={() => setFilterSection("ALL")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterSection === "ALL"
                  ? "bg-[#EBFF00] text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setFilterSection("RW")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterSection === "RW"
                  ? "bg-[#EBFF00] text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Reading & Writing
            </button>
            <button
              onClick={() => setFilterSection("MATH")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterSection === "MATH"
                  ? "bg-[#EBFF00] text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Math
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-xl border border-slate-200 dark:border-white/5 flex-wrap">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterStatus === "ALL"
                ? "bg-[#EBFF00] text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("INCORRECT")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterStatus === "INCORRECT"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-rose-500"
            }`}
          >
            ❌ Incorrect
          </button>
          <button
            onClick={() => setFilterStatus("CORRECT")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterStatus === "CORRECT"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-emerald-500"
            }`}
          >
            ✅ Correct
          </button>
          <button
            onClick={() => setFilterStatus("UNANSWERED")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterStatus === "UNANSWERED"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Omitted
          </button>
        </div>
      </Card>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center p-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#131313] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            No questions match your selected filters.
          </div>
        ) : (
          filtered.map((r) => {
            const isExpanded = expandedQ === r.questionId;
            const q = r.fullQuestion;
            const isRW =
              String(r.module).includes("1") || String(r.module).includes("2");
            const moduleName = isRW ? "Reading & Writing" : "Math";
            const moduleNumStr = String(r.module).replace("MODULE_", "");

            // Status border and badge
            const isOmitted = !r.userAnswer;
            const cardBorder = isOmitted
              ? "border-slate-200 dark:border-white/10"
              : r.isCorrect
                ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                : "border-rose-500/40 bg-rose-500/[0.02]";

            // Parse options if stored as string
            let parsedOptions: Record<string, string> | null = null;
            if (q.options) {
              parsedOptions =
                typeof q.options === "string" ? JSON.parse(q.options) : q.options;
            }

            return (
              <Card
                key={r.questionId}
                className={`overflow-hidden border-2 transition-all rounded-2xl bg-white dark:bg-[#131313] ${cardBorder} print:break-inside-avoid print:border-slate-300 dark:border-white/5 shadow-sm`}
              >
                {/* Header Row (Clickable) */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedQ(isExpanded ? null : r.questionId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-white shadow-inner border border-slate-200 dark:border-white/5 shrink-0">
                      {r.questionNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {moduleName} • Module {moduleNumStr}
                        </h3>
                        {q.difficulty && (
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {r.domain || "SAT Domain"} • {q.skill || "Core Skill"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isOmitted ? (
                      <span className="px-3 py-1 bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/5">
                        Omitted
                      </span>
                    ) : r.isCorrect ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs rounded-lg">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs rounded-lg">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}

                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-[#1c1b1b] text-slate-500 dark:text-slate-400 print:hidden">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Question Body */}
                <div
                  className={`p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0a0a0a]/50 space-y-6 ${
                    isExpanded ? "block" : "hidden print:block"
                  }`}
                >
                  {/* Stimulus Passage */}
                  {q.passage && (
                    <div className="p-5 rounded-xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                        Passage / Stimulus
                      </span>
                      <MathRenderer
                        text={q.passage}
                        className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-[15px]"
                      />
                    </div>
                  )}

                  {/* Stimulus Image (if any) */}
                  {q.imageUrl && (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] flex justify-center items-center p-3">
                      <img
                        src={q.imageUrl}
                        alt="Question figure"
                        className="max-h-[300px] w-auto max-w-full object-contain cursor-zoom-in"
                        loading="lazy"
                        onClick={() => setZoomedImage(q.imageUrl)}
                      />
                      <button
                        onClick={() => setZoomedImage(q.imageUrl)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Enlarge Figure</span>
                      </button>
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="p-5 rounded-xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Question Prompt
                    </span>
                    <MathRenderer
                      text={q.prompt}
                      className="prose prose-slate max-w-none text-slate-900 dark:text-white leading-relaxed text-[16px] font-medium"
                    />
                  </div>

                  {/* Multiple Choice Options List */}
                  {parsedOptions && Object.keys(parsedOptions).length > 0 ? (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Answer Choices
                      </span>
                      <div className="grid gap-3">
                        {Object.entries(parsedOptions).map(([key, val]) => {
                          const isUserSelected = r.userAnswer === key;
                          const isCorrectChoice =
                            r.correctAnswer === key ||
                            (r.correctAnswer &&
                              r.correctAnswer.toLowerCase() === key.toLowerCase());

                          let optionStyle =
                            "border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313]";
                          let badge = null;

                          if (isCorrectChoice && isUserSelected) {
                            optionStyle =
                              "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 ring-1 ring-emerald-500";
                            badge = (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                                Correct Answer (Your Choice)
                              </span>
                            );
                          } else if (isCorrectChoice) {
                            optionStyle =
                              "border-emerald-500/80 bg-emerald-500/5 dark:bg-emerald-950/20";
                            badge = (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                                Correct Answer
                              </span>
                            );
                          } else if (isUserSelected) {
                            optionStyle =
                              "border-rose-500 bg-rose-500/10 dark:bg-rose-950/20 ring-1 ring-rose-500";
                            badge = (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                                Your Incorrect Choice
                              </span>
                            );
                          }

                          return (
                            <div
                              key={key}
                              className={`p-4 rounded-xl border transition-all ${optionStyle} flex items-start justify-between gap-4`}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                                    isCorrectChoice
                                      ? "bg-emerald-500 text-white border-emerald-500"
                                      : isUserSelected
                                        ? "bg-rose-500 text-white border-rose-500"
                                        : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
                                  }`}
                                >
                                  {key}
                                </span>
                                <MathRenderer
                                  text={String(val)}
                                  inline
                                  className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed pt-0.5"
                                />
                              </div>
                              {badge && <div className="shrink-0">{badge}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Fill-in-the-Blank Response */
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Your Produced Response
                        </span>
                        <div
                          className={`text-xl font-mono font-bold ${
                            !r.userAnswer
                              ? "text-slate-400 italic"
                              : r.isCorrect
                                ? "text-emerald-500"
                                : "text-rose-500"
                          }`}
                        >
                          {r.userAnswer || "No Response"}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                          Correct Answer
                        </span>
                        <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {r.correctAnswer}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Explanation */}
                  {q.explanation && (
                    <div className="p-5 rounded-xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-slate-900 dark:text-[#EBFF00]" />
                        Explanation & Rationale
                      </h4>
                      <MathRenderer
                        text={q.explanation}
                        className="prose prose-slate max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed question figure"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg mt-6"
            />
          </div>
        </div>
      )}
    </div>
  );
}
