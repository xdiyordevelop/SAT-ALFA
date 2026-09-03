"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  History,
  PlayCircle,
  Trophy,
  CheckCircle2,
  Clock,
  Hash,
  BarChart3,
  Upload,
  Video,
} from "lucide-react";

interface StudentMockTestsHubProps {
  availableTests: any[];
  completedAttempts: any[];
  highestScore: number | null;
}

export function StudentMockTestsHub({
  availableTests,
  completedAttempts,
  highestScore,
}: StudentMockTestsHubProps) {
  // MUST default to 'available' tab!
  const [activeTab, setActiveTab] = useState<"available" | "history">(
    "available",
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Fast Access */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            SAT Mock Tests Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            Practice with published full-length digital SAT tests or join a
            scheduled live proctored session.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/student/mock-tests/proctor/join"
            className="px-5 py-2.5 bg-[#EBFF00]/10 hover:bg-[#EBFF00]/20 border border-yellow-500/20 text-slate-900 dark:text-yellow-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Video className="w-5 h-5" />
            Join Live Session with PIN
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Available Tests
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {availableTests.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tests Completed
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedAttempts.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-[#EBFF00]/10 transition-colors" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#EBFF00]/10 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-slate-900 dark:text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Highest SAT Score
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {highestScore ? `${highestScore} / 1600` : "--"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "available"
              ? "border-yellow-500 text-slate-900 dark:text-yellow-500"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Available Practice Tests
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "history"
              ? "border-yellow-500 text-slate-900 dark:text-yellow-500"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          My Test History & Results
        </button>
      </div>

      {/* Tab Content */}
      <div>
        <div key={activeTab}>
          {activeTab === "available" && (
            <div className="space-y-6">
              {availableTests.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 border-dashed rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No Active Tests Available
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    There are currently no mock tests published by instructors
                    yet. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableTests.map((test) => {
                    const attempts = test.studentAttempts || [];
                    const completedAttempt = attempts.find(
                      (a: any) => a.totalScore !== null,
                    );

                    return (
                      <div
                        key={test.id}
                        className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col h-full hover:border-yellow-500/50 transition-all duration-300 relative overflow-hidden group shadow-lg shadow-black/20"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                        <div className="mb-4 relative z-10">
                          <span className="inline-flex px-2 py-1 bg-[#EBFF00]/10 text-slate-900 dark:text-yellow-500 border border-yellow-500/20 rounded-md text-[10px] font-bold tracking-wider uppercase mb-3">
                            Digital SAT Full Test
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {test.name}
                          </h3>
                        </div>

                        <div className="space-y-3 flex-1 mb-6 relative z-10">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                            <Hash className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>
                              <strong className="text-slate-900 dark:text-white">
                                {test.questions?.length || 0}
                              </strong>{" "}
                              Questions
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>134 mins</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            {completedAttempt ? (
                              <span className="text-emerald-600 font-medium">
                                Last Score: {completedAttempt.totalScore}
                              </span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400">
                                Not Started
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-white/10">
                          <Link
                            href={`/student/mock-tests/${test.id}/take`}
                            className="w-full py-3 px-4 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          >
                            <PlayCircle className="w-5 h-5" />
                            Start Test
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              {completedAttempts.length === 0 ? (
                <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 border-dashed rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-[#0a0a0a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    No Test History
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You haven't completed any mock tests yet. Take a test from
                    the Available Tests tab to see your results here.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-[#0a0a0a]">
                          <th className="py-4 px-6">Test Name</th>
                          <th className="py-4 px-6">Completed Date</th>
                          <th className="py-4 px-6">Math Score</th>
                          <th className="py-4 px-6">R&W Score</th>
                          <th className="py-4 px-6">Total Score</th>
                          <th className="py-4 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-800/50">
                        {completedAttempts.map((attempt) => (
                          <tr
                            key={attempt.id}
                            className="hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                          >
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                              {attempt.test?.name || "Unknown Test"}
                            </td>
                            <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                              {new Date(
                                attempt.completedAt,
                              ).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                              {attempt.mathScore || 0}
                            </td>
                            <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                              {attempt.rwScore || 0}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex px-3 py-1 bg-[#EBFF00]/10 text-slate-900 dark:text-yellow-500 font-bold rounded-lg border border-yellow-500/20">
                                {attempt.totalScore || 0}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link
                                href={`/student/mock-tests/results/${attempt.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors border border-slate-200 dark:border-white/10 hover:border-slate-400"
                              >
                                <BarChart3 className="w-4 h-4 text-slate-900 dark:text-yellow-500" />
                                View Full Analysis
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
