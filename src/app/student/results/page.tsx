import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  Trophy,
  TrendingUp,
  BookOpen,
  Calculator,
  ClipboardList,
  ArrowRight,
  Clock,
  Target,
  ChevronRight,
  Star,
} from "lucide-react";

// ─── helpers ───────────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(ms: number | null): string {
  if (!ms) return "—";
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function scoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.85) return "text-emerald-600";
  if (pct >= 0.65) return "text-blue-600";
  if (pct >= 0.45) return "text-slate-900 dark:text-yellow-500";
  return "text-red-600";
}

function scoreBg(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.85)
    return "bg-emerald-500/15 border-emerald-500/30 text-emerald-500";
  if (pct >= 0.65) return "bg-blue-500/15 border-blue-500/30 text-blue-300";
  if (pct >= 0.45)
    return "bg-[#EBFF00]/15 border-yellow-500/30 text-yellow-500";
  return "bg-red-500/15 border-red-500/30 text-red-300";
}

// ─── page ──────────────────────────────────────────────────────────────────

export default async function StudentResultsHubPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!student) redirect("/student/dashboard");

  const studentEmail = user?.username || `${session.username}@student.alfa`;
  const studentName = student
    ? `${student.firstName} ${student.lastName}`.trim() || session.username
    : session.username;

  const attempts = await prisma.studentTestAttempt.findMany({
    where: {
      studentId: student.id,
      completedAt: { not: null },
    },
    orderBy: { createdAt: "desc" },
    include: {
      satTest: { select: { id: true, name: true } },
    },
  });

  // ── aggregate metrics ────────────────────────────────────────────────────
  const totalScores = attempts
    .map((a) => a.totalScore)
    .filter(Boolean) as number[];
  const rwScores = attempts.map((a) => a.rwScore).filter(Boolean) as number[];
  const mathScores = attempts
    .map((a) => a.mathScore)
    .filter(Boolean) as number[];

  const overallAvg = avg(totalScores);
  const rwAvg = avg(rwScores);
  const mathAvg = avg(mathScores);
  const highestScore = totalScores.length ? Math.max(...totalScores) : null;
  const highestAttempt = highestScore
    ? attempts.find((a) => a.totalScore === highestScore)
    : null;

  const count = attempts.length;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <StudentLayout
      title="Results Hub"
      breadcrumbs={[{ label: "Student" }, { label: "Results" }]}
      userName={studentName}
      userEmail={studentEmail}
    >
      <div className="space-y-8">
            {/* ── Header ── */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Test Results & Analytics
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Your complete SAT performance history and progress overview.
              </p>
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2">
              <div className="col-span-2 lg:col-span-1 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  <Trophy className="w-3.5 h-3.5 text-slate-900 dark:text-yellow-500" />
                  SAT Average
                </div>
                {count > 0 ? (
                  <>
                    <p
                      className={`text-4xl font-bold ${scoreColor(overallAvg, 1600)}`}
                    >
                      {overallAvg}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      out of 1600
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                    —
                  </p>
                )}
              </div>

              <div className="col-span-2 lg:col-span-1 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  Best Score
                </div>
                {highestScore ? (
                  <>
                    <p className="text-4xl font-bold text-yellow-400">
                      {highestScore}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {highestAttempt?.completedAt
                        ? fmtDate(highestAttempt.completedAt)
                        : ""}
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                    —
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  R&amp;W Avg
                </div>
                {rwAvg > 0 ? (
                  <>
                    <p
                      className={`text-3xl font-bold ${scoreColor(rwAvg, 800)}`}
                    >
                      {rwAvg}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      out of 800
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                    —
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  Math Avg
                </div>
                {mathAvg > 0 ? (
                  <>
                    <p
                      className={`text-3xl font-bold ${scoreColor(mathAvg, 800)}`}
                    >
                      {mathAvg}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      out of 800
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                    —
                  </p>
                )}
              </div>
            </div>

            {/* Summary strip */}
            <div className="flex items-center gap-4 px-5 py-3 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-500 dark:text-slate-400">
              <ClipboardList className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {count}
                </span>{" "}
                {count === 1 ? "test" : "tests"} completed
              </span>
              {count > 0 && overallAvg > 0 && (
                <>
                  <span className="text-slate-700 dark:text-slate-300">•</span>
                  <span>
                    Average score:{" "}
                    <span
                      className={`font-semibold ${scoreColor(overallAvg, 1600)}`}
                    >
                      {overallAvg}/1600
                    </span>
                  </span>
                </>
              )}
            </div>

            {/* ── Test History Table ── */}
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Test History
              </h2>

              {count === 0 ? (
                <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-[#1c1b1b] rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-semibold text-lg">
                      No tests completed yet
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                      Take a full mock test to see your score analysis and
                      detailed breakdown here.
                    </p>
                  </div>
                  <Link
                    href="/student/mock-tests"
                    className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors"
                  >
                    Take a Practice Test
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto pb-4">
                  <div className="space-y-3 min-w-[600px]">
                    {attempts.map((attempt, idx) => {
                      const total = attempt.totalScore;
                      const rw = attempt.rwScore;
                      const math = attempt.mathScore;

                      const reviewIndex = (attempt.reviewIndex as any[]) || [];
                      const correct = reviewIndex.filter(
                        (r) => r?.isCorrect,
                      ).length;
                      const totalQ = reviewIndex.length;
                      const accuracy =
                        totalQ > 0
                          ? Math.round((correct / totalQ) * 100)
                          : null;

                      const detailUrl = `/student/mock-tests/${attempt.satTestId}/results?attemptId=${attempt.id}`;

                      return (
                        <div
                          key={attempt.id}
                          className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 hover:border-slate-400 rounded-2xl p-5 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                  #{idx + 1}
                                </span>
                                <h3 className="text-slate-900 dark:text-white font-semibold truncate">
                                  {attempt.satTest.name}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {attempt.completedAt
                                    ? `${fmtDate(attempt.completedAt)} at ${fmtTime(attempt.completedAt)}`
                                    : "—"}
                                </span>
                                {attempt.totalTimeMs && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {fmtDuration(attempt.totalTimeMs)}
                                  </span>
                                )}
                                {accuracy !== null && (
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {accuracy}% accuracy
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {total ? (
                                <span
                                  className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${scoreBg(total, 1600)}`}
                                >
                                  {total} / 1600
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
                                  No score
                                </span>
                              )}

                              {rw && (
                                <span className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold">
                                  R&amp;W: {rw}
                                </span>
                              )}
                              {math && (
                                <span className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold">
                                  Math: {math}
                                </span>
                              )}
                            </div>

                            <Link
                              href={detailUrl}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white text-sm font-medium transition-colors shrink-0 whitespace-nowrap"
                            >
                              View Analysis
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {count > 0 && (
              <div className="text-center pt-2">
                <Link
                  href="/student/mock-tests"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white text-sm font-medium transition-colors"
                >
                  Take Another Practice Test
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
      </div>
    </StudentLayout>
  );
}
