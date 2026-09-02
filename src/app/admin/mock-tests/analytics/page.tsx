export const dynamic = "force-dynamic";
export const revalidate = 0;
import React from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Users, Target, BookOpen, Calculator, BarChart2 } from "lucide-react";
import { PerformanceBenchmarks } from "./components/PerformanceBenchmarks";
import { AttemptHistoryTable } from "./components/AttemptHistoryTable";
import { AnalyticsFilters } from "./components/AnalyticsFilters";
import type {
  AnalyticsSummary,
  AttemptRecord,
  ScoreDistribution,
} from "@/app/admin/mock-tests/types/analytics";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    testId?: string;
    groupId?: string;
    timeRange?: string;
  }>;
}) {
  const session = await getSession();

  // Verify admin access
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const { testId, groupId, timeRange } = resolvedSearchParams;

  // Build where clause
  let whereClause: any = {
    completedAt: { not: null },
  };

  if (testId) {
    whereClause.satTestId = testId;
  }

  if (groupId) {
    whereClause.student = { groupId: groupId };
  }

  if (timeRange && timeRange !== "all") {
    const days = parseInt(timeRange);
    if (!isNaN(days)) {
      whereClause.completedAt = {
        ...whereClause.completedAt,
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      };
    }
  }

  // Fetch filter options
  const [tests, groups] = await Promise.all([
    prisma.sATMockTest.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.group.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Fetch all completed test attempts
  const attempts = await prisma.studentTestAttempt.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          groupId: true,
          group: { select: { name: true } },
        },
      },
      satTest: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 2000,
  });

  // Transform attempts for display
  const attemptRecords: AttemptRecord[] = attempts.map((a) => ({
    id: a.id,
    studentName: `${a.student.firstName} ${a.student.lastName}`,
    groupName: a.student.group?.name || "No Group",
    testName: a.satTest.name,
    completedAt: a.completedAt || new Date(),
    rwScore: a.rwScore,
    mathScore: a.mathScore,
    totalScore: a.totalScore,
    rwRaw: a.rwRaw,
    mathRaw: a.mathRaw,
  }));

  // Calculate analytics
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter((a) => a.completedAt).length;
  const avgTotalScore = attempts.length
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) /
          attempts.length,
      )
    : 0;
  const avgRWScore = attempts.length
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.rwScore || 0), 0) /
          attempts.length,
      )
    : 0;
  const avgMathScore = attempts.length
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.mathScore || 0), 0) /
          attempts.length,
      )
    : 0;

  // Score distribution
  const scoreRanges = [
    { range: "1400-1600", min: 1400, max: 1600 },
    { range: "1200-1399", min: 1200, max: 1399 },
    { range: "1000-1199", min: 1000, max: 1199 },
    { range: "800-999", min: 800, max: 999 },
    { range: "< 800", min: 0, max: 799 },
  ];

  const scoreDistribution: ScoreDistribution[] = scoreRanges.map((range) => {
    const count = attempts.filter(
      (a) =>
        a.totalScore !== null &&
        a.totalScore >= range.min &&
        a.totalScore <= range.max,
    ).length;
    return {
      range: range.range,
      count,
      percentage: attempts.length
        ? Math.round((count / attempts.length) * 100)
        : 0,
    };
  });

  // Completions over time (last 14 days or based on data)
  const completionsOverTimeMap = new Map<string, number>();
  attempts.forEach((a) => {
    if (a.completedAt) {
      const dateStr = a.completedAt.toISOString().split("T")[0];
      completionsOverTimeMap.set(
        dateStr,
        (completionsOverTimeMap.get(dateStr) || 0) + 1,
      );
    }
  });

  const completionsOverTime = Array.from(completionsOverTimeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  const performanceByDomain: any[] = [];

  const analytics: AnalyticsSummary = {
    totalAttempts,
    completedAttempts,
    avgTotalScore,
    avgRWScore,
    avgMathScore,
    completionRate: totalAttempts
      ? (completedAttempts / totalAttempts) * 100
      : 0,
    scoreDistribution,
    performanceByDomain,
    completionsOverTime,
  } as any;

  return (
    <div className="min-h-screen bg-white dark:bg-[#131313]">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-64">
        <Topbar
          title="Analytics Dashboard"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Mock Tests" },
            { label: "Analytics" },
          ]}
          userName={session.username}
          userRole={session.role}
        />

        <main className="pt-24 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="mb-6">
              <React.Suspense
                fallback={
                  <div className="h-20 bg-slate-100 dark:bg-[#1c1b1b] animate-pulse rounded-lg"></div>
                }
              >
                <AnalyticsFilters
                  tests={tests}
                  groups={groups}
                  currentTest={testId}
                  currentGroup={groupId}
                  currentTime={timeRange}
                />
              </React.Suspense>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-[#EBFF00]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Total Attempts
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalAttempts}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Avg Total Score
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {avgTotalScore}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Avg R&W
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {avgRWScore}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Avg Math
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {avgMathScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Benchmarks */}
            <PerformanceBenchmarks analytics={analytics} />

            {/* Attempt History Table */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Attempt History
              </h2>
              <AttemptHistoryTable attempts={attemptRecords} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
