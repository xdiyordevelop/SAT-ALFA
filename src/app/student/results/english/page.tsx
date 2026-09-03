import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { StudentLayout } from "@/components/student/StudentLayout";
import { TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react";
import Link from "next/link";

export default async function EnglishResultsPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!student) {
    redirect("/login");
  }

  const englishTests = await prisma.mockTest.findMany({
    where: {
      studentId: student.id,
      testName: { contains: "English" },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const avgScore =
    englishTests.length > 0
      ? Math.round(
          englishTests.reduce((sum: number, t) => sum + (t.score || 0), 0) /
            englishTests.length,
        )
      : 0;

  const highestScore =
    englishTests.length > 0
      ? Math.max(...englishTests.map((t) => t.score || 0))
      : 0;

  const lowestScore =
    englishTests.length > 0
      ? Math.min(...englishTests.map((t) => t.score || 0))
      : 0;

  const trendPercentage =
    englishTests.length > 1
      ? Math.round(
          (((englishTests[0].score || 0) -
            (englishTests[englishTests.length - 1].score || 0)) /
            (englishTests[englishTests.length - 1].score || 1)) *
            100,
        )
      : 0;

  const isTrendingUp = trendPercentage > 0;

  return (
    <StudentLayout
      title="English Results"
      breadcrumbs={[
        { label: "Student" },
        { label: "Results" },
        { label: "English" },
      ]}
    >
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          English Test Results
        </h1>
        <p className="text-slate-600 dark:text-slate-400 ">
          Track your SAT English/Reading & Writing section performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Average Score
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {avgScore}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 ">
                From {englishTests.length} tests
              </p>
            </div>

            <div
              className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up"
              style={{ animation: "slideUp 0.5s ease-out 100ms backwards" }}
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Highest Score
              </p>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {highestScore}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 ">
                Best performance
              </p>
            </div>

            <div
              className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up"
              style={{ animation: "slideUp 0.5s ease-out 200ms backwards" }}
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Lowest Score
              </p>
              <p className="text-3xl font-bold text-red-600 mb-2">
                {lowestScore}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 ">
                Needs improvement
              </p>
            </div>

            <div
              className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up"
              style={{ animation: "slideUp 0.5s ease-out 300ms backwards" }}
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Trend
              </p>
              <div className="flex items-center gap-2 mb-2">
                {isTrendingUp ? (
                  <TrendingUp className="w-6 h-6 text-green-600 " />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 " />
                )}
                <p
                  className={`text-2xl font-bold {
 isTrendingUp
 ? "text-green-600 "
 : "text-red-600 "
 }`}
                >
                  {Math.abs(trendPercentage)}%
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 ">
                {isTrendingUp ? "Improving" : "Declining"}
              </p>
            </div>
          </div>

          {/* Test History */}
          <div
            className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 animate-slide-up"
            style={{ animation: "slideUp 0.5s ease-out 400ms backwards" }}
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Test History
            </h2>

            {englishTests.length > 0 ? (
              <div className="space-y-3">
                {englishTests.map((test, index) => {
                  const percentage = Math.round(
                    ((test.score || 0) / test.maxScore) * 100,
                  );
                  const getScoreColor = (pct: number) => {
                    if (pct >= 80) return "bg-green-100 text-green-700 ";
                    if (pct >= 60)
                      return "bg-[#EBFF00]/10 dark:bg-[#EBFF00]/50/30 text-[#d9ff00] ";
                    return "bg-red-100 text-red-700 ";
                  };

                  return (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                      style={{
                        animation: `slideUp 0.3s ease-out {
 500 + index * 50
 }ms backwards`,
                      }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white ">
                          {test.testName}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400 ">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(test.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-violet-600 ">
                          {test.score || 0}/{test.maxScore}
                        </p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold {getScoreColor(
 percentage
 )}`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  No English test results yet
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                  Take an English mock test to see your results here
                </p>
                <Link
                  href="/student/mock-tests"
                  className="inline-block mt-4 px-6 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-lg font-medium transition-colors"
                >
                  Take a Test
                </Link>
              </div>
            )}
          </div>

          {/* Switch to Math */}
          <div
            className="mt-8 text-center animate-slide-up"
            style={{ animation: "slideUp 0.5s ease-out 500ms backwards" }}
          >
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Want to view your Math results?
            </p>
            <Link
              href="/student/results/math"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              View Math Results
            </Link>
          </div>
        </StudentLayout>
      );
    }
