"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Download,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QuestionReviewPane } from "./QuestionReviewPane";
import { AIAnalysisLoader } from "./AIAnalysisLoader";

export function ResultsDashboard({ attempt, questions, student }: any) {
  const router = useRouter();
  const totalScore = attempt.totalScore || 400;
  const rwScore = attempt.rwScore || 200;
  const mathScore = attempt.mathScore || 200;

  // Metrics
  const reviewIndex = attempt.reviewIndex || [];
  const correctCount = reviewIndex.filter((r: any) => r.isCorrect).length;
  const totalCount = questions.length;
  const unansweredCount = reviewIndex.filter((r: any) => !r.userAnswer).length;
  const incorrectCount = totalCount - correctCount - unansweredCount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Button
          variant="secondary"
          onClick={() => router.push("/student/mock-tests")}
          className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              router.push(`/student/mock-tests/${attempt.satTestId}/take`)
            }
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Retake Test
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white"
          >
            <Download className="w-4 h-4 mr-2" /> Download Score Report
          </Button>
        </div>
      </div>

      {/* Hero Score Card */}
      <Card className="p-8 bg-white dark:bg-[#131313] shadow-lg border-t-8 border-t-blue-600 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              SAT Score Report
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Test:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {attempt.satTest.title}
              </span>
              <br />
              Student:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {student.firstName} {student.lastName}
              </span>
              <br />
              Date: {new Date(attempt.completedAt).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-6 justify-center md:justify-start">
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Total Score
                </div>
                <div className="text-5xl font-black text-blue-700">
                  {totalScore}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  400-1600 Scale
                </div>
              </div>
              <div className="h-16 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  R&W
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  {rwScore}
                </div>
              </div>
              <div className="h-12 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Math
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  {mathScore}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full bg-slate-50 dark:bg-[#0a0a0a] p-6 rounded-xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-4 text-center">
              Performance Overview
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {correctCount}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                  Correct
                </div>
              </div>
              <div>
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {incorrectCount}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                  Incorrect
                </div>
              </div>
              <div>
                <HelpCircle className="w-8 h-8 text-slate-500 dark:text-slate-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {unansweredCount}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                  Omitted
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Diagnostic Report */}
      <AIAnalysisLoader attemptId={attempt.id} reviewIndex={reviewIndex} />

      {/* Detailed Review Module */}
      <div className="pt-8 print:break-before-page">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
          Question-by-Question Review
        </h2>
        <QuestionReviewPane questions={questions} reviewIndex={reviewIndex} />
      </div>
    </div>
  );
}
