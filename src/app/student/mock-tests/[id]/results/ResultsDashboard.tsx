"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Download,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  BarChart2,
  BookOpen,
  Calculator,
  Eye,
  FileText,
  Printer,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QuestionReviewPane } from "./QuestionReviewPane";
import { AIAnalysisLoader } from "./AIAnalysisLoader";
import { OfficialScoreReport } from "./OfficialScoreReport";

export function ResultsDashboard({ attempt, questions, student }: any) {
  const router = useRouter();
  const [showReportPreview, setShowReportPreview] = useState(false);
  const isDisqualified = attempt.totalScore === 0 && Boolean(attempt.fullscreenExitCount >= 5);
  const totalScore = attempt.totalScore !== null && attempt.totalScore !== undefined ? attempt.totalScore : (isDisqualified ? 0 : 400);
  const rwScore = attempt.rwScore !== null && attempt.rwScore !== undefined ? attempt.rwScore : (isDisqualified ? 0 : 200);
  const mathScore = attempt.mathScore !== null && attempt.mathScore !== undefined ? attempt.mathScore : (isDisqualified ? 0 : 200);

  // Metrics
  const reviewIndex = attempt.reviewIndex || [];
  const correctCount = reviewIndex.filter((r: any) => r.isCorrect).length;
  const totalCount = questions.length || reviewIndex.length || 98;
  const unansweredCount = reviewIndex.filter((r: any) => !r.userAnswer).length;
  const incorrectCount = Math.max(0, totalCount - correctCount - unansweredCount);

  // Compute Domain Performance
  const domainBreakdown = useMemo(() => {
    const stats: Record<
      string,
      { correct: number; total: number; isRW: boolean }
    > = {};

    reviewIndex.forEach((r: any) => {
      const isRW =
        String(r.module).includes("1") ||
        String(r.module).includes("2") ||
        r.module === 1 ||
        r.module === 2;
      const d = r.domain || (isRW ? "Reading & Writing" : "Math");

      if (!stats[d]) {
        stats[d] = { correct: 0, total: 0, isRW };
      }
      stats[d].total++;
      if (r.isCorrect) {
        stats[d].correct++;
      }
    });

    return Object.entries(stats).map(([domain, data]) => ({
      domain,
      correct: data.correct,
      total: data.total,
      isRW: data.isRW,
      percent: Math.round((data.correct / Math.max(1, data.total)) * 100),
    }));
  }, [reviewIndex]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Button
          variant="secondary"
          onClick={() => router.push("/student/mock-tests")}
          className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests Hub
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              try {
                const uId = student?.userId || attempt?.studentId;
                if (uId) {
                  localStorage.removeItem(`inProgressTest_${uId}_${attempt.satTestId}`);
                  localStorage.removeItem(`completedTest_${uId}_${attempt.satTestId}`);
                }
              } catch {}
              router.push(`/student/mock-tests/${attempt.satTestId}/take?retake=true`);
            }}
            className="border-slate-200 dark:border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Retake Test
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowReportPreview(true)}
            className="border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white"
          >
            <Eye className="w-4 h-4 mr-2 text-[#EBFF00]" /> Preview Score Report
          </Button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(235,255,0,0.25)] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Score Report (PDF)
          </button>
        </div>
      </div>

      {/* Screen Interactive Dashboard Elements */}
      <div className="space-y-8 print:hidden">
        {/* Hero Score Card */}
        <Card className="p-8 bg-white dark:bg-[#131313] shadow-xl border border-slate-200 dark:border-white/10 border-t-4 border-t-[#EBFF00] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EBFF00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-8 relative z-10">
          {/* Left: Identification & Scores */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EBFF00]/15 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30 rounded-lg text-xs font-bold tracking-wider uppercase mb-3">
                <Award className="w-3.5 h-3.5" /> Official Practice Score Report
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {attempt.satTest?.name || "Digital SAT Mock Test"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Student:{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {student.firstName} {student.lastName}
                </span>{" "}
                • Completed on:{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(attempt.completedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>

            {/* Scores Bar */}
            <div className="flex flex-wrap items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
              <div className="text-center sm:text-left pr-4 border-r border-slate-200 dark:border-white/10">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Total Score
                </div>
                <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-[#EBFF00] tracking-tight">
                  {totalScore}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mt-1">
                  400 – 1600 Scale
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Reading & Writing
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {rwScore}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    200 – 800
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200 dark:border-white/10" />

                <div className="text-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                    Math
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {mathScore}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    200 – 800
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Accuracy Breakdown */}
          <div className="w-full lg:w-80 bg-slate-50 dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-slate-900 dark:text-[#EBFF00]" />
              Accuracy Overview
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center my-auto">
              <div className="p-3 rounded-xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {correctCount}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Correct
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/5">
                <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {incorrectCount}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Incorrect
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/5">
                <HelpCircle className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {unansweredCount}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Omitted
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 text-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Total Accuracy:{" "}
                <span className="text-slate-900 dark:text-[#EBFF00]">
                  {Math.round((correctCount / Math.max(1, totalCount)) * 100)}%
                </span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Domain Mastery Breakdown */}
      {domainBreakdown.length > 0 && (
        <Card className="p-6 bg-white dark:bg-[#131313] shadow-md border border-slate-200 dark:border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Content Domain Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Performance across Reading & Writing and Math skill areas
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {domainBreakdown.map((item) => (
              <div
                key={item.domain}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 space-y-2"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.domain}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {item.correct} / {item.total} ({item.percent}%)
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.percent >= 80
                        ? "bg-emerald-500"
                        : item.percent >= 50
                          ? "bg-[#EBFF00]"
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Diagnostic Report */}
      <AIAnalysisLoader attemptId={attempt.id} reviewIndex={reviewIndex} />

      {/* Detailed Question Review Module */}
      <div className="pt-4 space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Question-by-Question Review
        </h2>
        <QuestionReviewPane questions={questions} reviewIndex={reviewIndex} />
      </div>
    </div>

    {/* Printable Official 1-Page Score Report (College Board Standard) */}
    <div className="hidden print:block">
      <OfficialScoreReport
        attempt={attempt}
        questions={questions}
        student={student}
      />
    </div>

    {/* On-screen Official Report Preview Modal */}
    {showReportPreview && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in print:hidden">
        <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 sticky top-0 bg-slate-900 z-20">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#EBFF00]" />
              <h3 className="text-base font-bold text-white">
                Official SAT® Score Report Preview
              </h3>
              <span className="hidden sm:inline-block text-[11px] bg-[#EBFF00]/20 text-[#EBFF00] font-bold px-2 py-0.5 rounded border border-[#EBFF00]/30">
                College Board Standard • 1-Page A4
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
              <button
                onClick={() => setShowReportPreview(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto py-2">
            <OfficialScoreReport
              attempt={attempt}
              questions={questions}
              student={student}
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
}
