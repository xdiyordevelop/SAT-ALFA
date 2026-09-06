"use client";

import Link from "next/link";
import { BookOpen, Clock, History, Layers, BrainCircuit } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { PerformanceBreakdown } from "@/app/student/results/[id]/components/PerformanceBreakdown";

export interface PublishedTestItem {
  id: string;
  name: string;
  description: string | null;
  questionCount: number;
  moduleCounts: {
    rw: number;
    math: number;
  };
}

export interface ReviewQuestion {
  questionId: string;
  module: number;
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  domain?: string;
  skill?: string;
}

export interface AttemptHistoryItem {
  id: string;
  testId: string;
  testName: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  rwScore: number | null;
  mathScore: number | null;
  reviewIndex?: any[] | null;
}

function normalizeReviewQuestion(q: any): ReviewQuestion {
  // Normalize module from "MODULE_1" to 1, "MODULE_2" to 2, etc.
  let moduleNum = q.module;
  if (typeof q.module === 'string') {
    const match = q.module.match(/MODULE_(\d)/);
    moduleNum = match ? parseInt(match[1]) : 1;
  }

  return {
    questionId: q.questionId,
    module: moduleNum,
    questionNumber: q.questionNumber,
    userAnswer: q.userAnswer,
    correctAnswer: q.correctAnswer,
    isCorrect: q.isCorrect,
    domain: q.domain,
    skill: q.skill,
  };
}

function aggregateReviewIndex(attempts: AttemptHistoryItem[]): ReviewQuestion[] {
  // Aggregate all reviewIndex data from completed attempts
  const allQuestions: ReviewQuestion[] = [];

  attempts.forEach((attempt) => {
    if (attempt.completedAt && attempt.reviewIndex && Array.isArray(attempt.reviewIndex)) {
      const normalized = attempt.reviewIndex.map(normalizeReviewQuestion);
      allQuestions.push(...normalized);
    }
  });

  return allQuestions;
}

interface StudentDashboardViewProps {
  studentName: string;
  studentEmail: string;
  publishedTests: PublishedTestItem[];
  attempts: AttemptHistoryItem[];
  metrics: {
    testsTaken: number;
    highestScore: number;
    averageScore: number;
    mathAvg: number;
    rwAvg: number;
  };
}

export function StudentDashboardView({
  studentName,
  studentEmail,
  publishedTests,
  attempts,
  metrics,
}: StudentDashboardViewProps) {

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome, {studentName.split(" ")[0] || "Student"}.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Target Score: 1550 | <span className="text-slate-900 dark:text-[#EBFF00]">Average Score: {metrics.averageScore > 0 ? Math.round(metrics.averageScore) : '---'}</span>
          </p>
        </div>
        <Link
          href="/student/mock-tests/proctor/join"
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-black text-sm shadow-[0_0_15px_rgba(235,255,0,0.25)] transition-all active:scale-[0.98] whitespace-nowrap"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
          </span>
          Join Live Exam
        </Link>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="col-span-1 md:col-span-2 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="w-6 h-6 text-slate-900 dark:text-[#EBFF00]" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Topic Performance</h3>
          </div>

          {attempts.length > 0 && attempts.some(a => a.completedAt && a.reviewIndex) ? (
            <PerformanceBreakdown
              reviewIndex={aggregateReviewIndex(attempts)}
            />
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p className="text-sm">Complete a test to see your topic performance breakdown.</p>
            </div>
          )}
        </div>

        {/* Recent Results History */}
        {attempts.length > 0 && (
          <div className="col-span-1">
             <div className="flex items-center gap-3 mb-6">
              <History className="w-6 h-6 text-slate-900 dark:text-[#EBFF00]" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Results</h3>
            </div>
            <div className="space-y-3">
              {attempts.slice(0, 5).map((attempt) => (
                <div
                  key={attempt.id}
                  className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                      {attempt.testName}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(attempt.startedAt).toLocaleDateString()} | {new Date(attempt.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 justify-between sm:justify-end w-full sm:w-auto">
                    {attempt.totalScore ? (
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900 dark:text-[#EBFF00] drop-shadow-sm">
                          {attempt.totalScore}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                          RW: {attempt.rwScore || 0} <span className="opacity-50">•</span> MATH: {attempt.mathScore || 0}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#EBFF00] bg-slate-100 dark:bg-[#EBFF00]/10 px-3 py-1.5 rounded-md border border-slate-200 dark:border-[#EBFF00]/20">
                        In Progress
                      </span>
                    )}

                    <Link
                      href={`/student/results/${attempt.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-black bg-slate-100 dark:bg-[#2a2a2a] hover:bg-slate-200 dark:hover:bg-white px-4 py-2 rounded-lg transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
