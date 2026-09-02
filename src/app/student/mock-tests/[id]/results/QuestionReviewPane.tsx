"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  CheckCircle2,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

export function QuestionReviewPane({
  questions,
  reviewIndex,
}: {
  questions: any[];
  reviewIndex: any[];
}) {
  const [filterSection, setFilterSection] = useState<"ALL" | "RW" | "MATH">(
    "ALL",
  );
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "CORRECT" | "INCORRECT" | "UNANSWERED"
  >("ALL");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  // Enrich review index with full question text
  const enrichedReviews = reviewIndex
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
      {/* Filters */}
      <Card className="p-4 bg-white dark:bg-[#131313] shadow-sm border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-4 items-center print:hidden">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Filter className="w-4 h-4" /> Filters:
        </div>
        <div className="flex bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-lg">
          <button
            onClick={() => setFilterSection("ALL")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterSection === "ALL" ? "bg-white dark:bg-[#131313] shadow text-blue-600" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"}`}
          >
            All Sections
          </button>
          <button
            onClick={() => setFilterSection("RW")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterSection === "RW" ? "bg-white dark:bg-[#131313] shadow text-blue-600" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"}`}
          >
            Reading & Writing
          </button>
          <button
            onClick={() => setFilterSection("MATH")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterSection === "MATH" ? "bg-white dark:bg-[#131313] shadow text-blue-600" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"}`}
          >
            Math
          </button>
        </div>
        <div className="flex bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-lg flex-wrap">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === "ALL" ? "bg-white dark:bg-[#131313] shadow text-blue-600" : "text-slate-600 dark:text-slate-400"}`}
          >
            All Status
          </button>
          <button
            onClick={() => setFilterStatus("INCORRECT")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === "INCORRECT" ? "bg-white dark:bg-[#131313] shadow text-red-600" : "text-slate-600 dark:text-slate-400"}`}
          >
            ❌ Incorrect
          </button>
          <button
            onClick={() => setFilterStatus("CORRECT")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === "CORRECT" ? "bg-white dark:bg-[#131313] shadow text-emerald-600" : "text-slate-600 dark:text-slate-400"}`}
          >
            ✅ Correct
          </button>
          <button
            onClick={() => setFilterStatus("UNANSWERED")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === "UNANSWERED" ? "bg-white dark:bg-[#131313] shadow text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
          >
            Omitted
          </button>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center p-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#131313] rounded-xl border border-dashed border-slate-300 dark:border-white/5">
            No questions match your selected filters.
          </div>
        ) : (
          filtered.map((r) => {
            const isExpanded = expandedQ === r.questionId;
            const isRW =
              String(r.module).includes("1") || String(r.module).includes("2");
            const moduleName = isRW ? "Reading & Writing" : "Math";
            const statusColor = !r.userAnswer
              ? "bg-slate-100 dark:bg-[#1c1b1b] border-slate-300 dark:border-white/5"
              : r.isCorrect
                ? "bg-emerald-50 border-emerald-200"
                : "bg-rose-50 border-rose-200";

            return (
              <Card
                key={r.questionId}
                className={`overflow-hidden border-2 transition-colors ${statusColor} print:break-inside-avoid print:border-slate-300 dark:border-white/5 print:bg-white dark:bg-[#131313]`}
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:bg-[#0a0a0a]/5 transition-colors"
                  onClick={() => setExpandedQ(isExpanded ? null : r.questionId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-white dark:bg-[#131313] shadow-sm border border-slate-200 dark:border-white/10">
                      {r.questionNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        {moduleName} • Module{" "}
                        {String(r.module).replace("MODULE_", "")}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
                        {r.domain || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!r.userAnswer ? (
                      <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-full">
                        Omitted
                      </span>
                    ) : r.isCorrect ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600 font-bold text-sm">
                        <XCircle className="w-5 h-5" /> Incorrect
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400 print:hidden" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400 print:hidden" />
                    )}
                  </div>
                </div>
                <div className={`p-6 border-t border-black/5 bg-white dark:bg-[#131313] space-y-6 ${isExpanded ? "block" : "hidden print:block"}`}>
                  {/* Stimulus */}
                    {r.fullQuestion.passage && (
                      <div
                        className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0a0a0a] p-4 rounded-lg border border-slate-100"
                        dangerouslySetInnerHTML={{
                          __html: r.fullQuestion.passage,
                        }}
                      />
                    )}
                    {/* Prompt */}
                    <div
                      className="font-medium text-slate-900 dark:text-white prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: r.fullQuestion.prompt,
                      }}
                    />
                    {/* Answers Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                          Your Answer
                        </div>
                        <div
                          className={`font-bold text-lg ${!r.userAnswer ? "text-slate-500 dark:text-slate-400" : r.isCorrect ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {r.userAnswer || "No Answer Provided"}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border-2 border-emerald-200 bg-emerald-50">
                        <div className="text-xs font-bold text-emerald-700 uppercase mb-2">
                          Correct Answer
                        </div>
                        <div className="font-bold text-lg text-emerald-700">
                          {r.correctAnswer}
                        </div>
                      </div>
                    </div>
                    {/* Explanation */}
                    {r.fullQuestion.explanation && (
                      <div className="mt-4">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-blue-500" />{" "}
                          Explanation
                        </h4>
                        <div
                          className="prose prose-sm max-w-none text-slate-600 dark:text-slate-400 bg-blue-50/50 p-4 rounded-lg border border-blue-100"
                          dangerouslySetInnerHTML={{
                            __html: r.fullQuestion.explanation,
                          }}
                        />
                      </div>
                    )}
                  </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
