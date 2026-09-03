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
  
  // Format data for the chart (Performance Trajectory)
  const chartData = [...attempts]
    .reverse()
    .filter((a) => a.totalScore !== null)
    .map((attempt, idx) => ({
      name: `Mock ${idx + 1}`,
      Total: attempt.totalScore || 0,
      ReadingWriting: attempt.rwScore || 0,
      Math: attempt.mathScore || 0,
      date: new Date(attempt.startedAt).toLocaleDateString(),
    }));

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome, {studentName.split(" ")[0] || "Student"}.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Target Score: 1550 | <span className="text-slate-900 dark:text-[#EBFF00]">Average Score: {metrics.averageScore > 0 ? Math.round(metrics.averageScore) : '---'}</span>
          </p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Performance Overview (Chart) */}
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EBFF00]/5 dark:from-[#EBFF00]/[0.02] to-transparent pointer-events-none"></div>

          <div className="flex justify-between items-center mb-8 z-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Performance Trajectory</h3>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-[#EBFF00]">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-[#EBFF00]"></span> Total Score
            </span>
          </div>

          <div className="flex-1 w-full h-[350px] z-10">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mathGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EBFF00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EBFF00" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mathGradLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis domain={[400, 1600]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tw-colors-slate-900)",
                      borderColor: "var(--tw-colors-slate-800)",
                      borderRadius: "0.5rem",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    itemStyle={{ color: "#EBFF00", fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Total"
                    stroke="currentColor"
                    className="text-slate-900 dark:text-[#EBFF00]"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#mathGradLight)"
                    activeDot={{ r: 6, fill: "#EBFF00", stroke: "#131313", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                Not enough data. Complete at least one test.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 lg:p-8 shadow-sm">
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
