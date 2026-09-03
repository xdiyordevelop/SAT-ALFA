export const dynamic = "force-dynamic";
export const revalidate = 0;
import React from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
    <AdminLayout
      title="Analytics Dashboard"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Analytics" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      {/* Filters */}
      <div className="mb-6 animate-fade-in">
        <React.Suspense
          fallback={
            <div className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-[10px] font-semibold">
              Tests
            </span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              {totalAttempts}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Attempts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              {avgTotalScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Total Score</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              {avgRWScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Reading & Writing</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
              <Calculator className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              {avgMathScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Math</span>
          </div>
        </div>
      </div>

      {/* Performance Benchmarks */}
      {attempts.length > 0 ? (
        <PerformanceBenchmarks analytics={analytics} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 mb-8 text-center">
          <BarChart2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white mb-1">No data available</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Try adjusting your filters or wait for test attempts to be completed.
          </p>
        </div>
      )}

      {/* Attempt History Table */}
      {attempts.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Attempt History
          </h2>
          <AttemptHistoryTable attempts={attemptRecords} />
        </div>
      )}
    </AdminLayout>
  );
}
