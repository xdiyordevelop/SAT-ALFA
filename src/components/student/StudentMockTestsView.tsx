"use client";

import { useState } from "react";
import {
  Play,
  CheckCircle2,
  Clock,
  Brain,
  Upload,
  XCircle,
  Award,
  Sparkles,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function StudentMockTestsView({
  availableTests,
  submissions,
  userId,
}: {
  availableTests: any[];
  submissions: any[];
  userId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"available" | "completed">(
    "available",
  );

  const completedTests = submissions.filter(
    (s) => s.status === "COMPLETED" || s.status === "APPROVED",
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Tests */}
        <div
          onClick={() => setActiveTab("available")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "available"
              ? "border-yellow-500 bg-white dark:bg-[#131313] shadow-md ring-2 ring-yellow-500/20"
              : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Available Tests
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {availableTests.length}
          </p>
          <p className="text-xs text-slate-500 font-medium">Ready to start</p>
        </div>

        {/* Completed Tests */}
        <div
          onClick={() => setActiveTab("completed")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "completed"
              ? "border-green-600 bg-white dark:bg-[#131313] shadow-md ring-2 ring-green-500/20"
              : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Completed Tests
            </span>
            <div className="p-2 rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {completedTests.length}
          </p>
          <p className="text-xs text-green-600 font-medium">
            Unlocked in your dashboard
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === "available"
              ? "bg-yellow-100 text-slate-900 dark:text-yellow-700 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-[#1c1b1b]"
          }`}
        >
          <Brain className="w-4 h-4" />
          Available Tests ({availableTests.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTab === "completed"
              ? "bg-green-100 text-green-700 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-[#1c1b1b]"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed Tests ({completedTests.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE TESTS */}
      {activeTab === "available" && (
        <div className="space-y-6">
          {availableTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTests.map((test) => {
                let questionsCount = 0;
                try {
                  questionsCount = JSON.parse(test.questions).length;
                } catch {
                  questionsCount = 0;
                }

                return (
                  <div
                    key={test.id}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] space-y-4 hover:border-yellow-300 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 uppercase tracking-wider">
                          {test.subject}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {test.testName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                        {test.description ||
                          "Timed practice SAT exam. Questions include full AI diagnostic analysis upon submission."}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" />
                          {questionsCount} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {test.duration} Minutes
                        </span>
                      </div>

                      <Link
                        href={`/student/mock-tests/${test.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-xl font-medium text-sm transition-colors shadow-sm"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Start Test
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 p-6 bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10">
              <Brain className="w-12 h-12 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                No Practice Tests Currently Available
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Check back later for new tests.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED TESTS */}
      {activeTab === "completed" && (
        <div className="space-y-6">
          {completedTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTests.map((test) => {
                const score = test.totalScore || test.score || 0;

                return (
                  <div
                    key={test.id}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] space-y-4 shadow-sm hover:border-yellow-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          Completed
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {test.testName}
                      </h3>

                      <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] text-center">
                        <div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block">
                            Total
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-yellow-500 text-lg">
                            {score}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block">
                            Math
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {test.mathScore || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block">
                            R & W
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {test.englishScore || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/student/mock-tests/results/${test.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-xl font-medium text-sm transition-colors shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Full AI Analysis
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 p-6 bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10">
              <Award className="w-12 h-12 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                No Completed Tests Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Complete a practice test to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
