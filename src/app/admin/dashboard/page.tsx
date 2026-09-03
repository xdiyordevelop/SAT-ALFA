import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import {
  Users,
  FolderGit2,
  Award,
  DollarSign,
  Activity,
  ClipboardList,
  Calendar,
  CheckCircle,
  Eye,
  LineChart,
  Target
} from "lucide-react";
import ScoreAnalyticsChart from "./ScoreAnalyticsChart";
import { CreateTestButton } from "@/components/admin/CreateTestButton";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Get dashboard statistics
  const [
    studentCount,
    groupCount,
    totalRevenueData,
    recentActivity,
    pendingLessons,
    recentScores,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.group.count({ where: { status: "ACTIVE" } }).catch(() => prisma.group.count()),
    prisma.payment.aggregate({ _sum: { amountPaid: true } }).catch(() => ({ _sum: { amountPaid: 0 } })),
    prisma.mockTest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { status: "CONFIRMED" },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    }).catch(() => []),
    Promise.resolve([]),
    prisma.mockTest.findMany({
      where: { status: "CONFIRMED" },
      select: { score: true, totalScore: true, mathScore: true, englishScore: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 50,
    }).catch(() => []),
  ]);

  const totalRevenue = totalRevenueData._sum.amountPaid || 0;

  // Chart mapping
  const chartData = recentScores.map((score: any, idx: number) => ({
    month: `Test ${idx + 1}`,
    score: score.totalScore || score.score || 0,
    math: score.mathScore || 0,
    readingWriting: score.englishScore || 0,
  }));

  const avgTotal = chartData.length > 0 ? Math.round(chartData.reduce((acc: number, curr: any) => acc + curr.score, 0) / chartData.length) : 0;
  const avgMath = chartData.length > 0 ? Math.round(chartData.reduce((acc: number, curr: any) => acc + curr.math, 0) / chartData.length) : 0;
  const avgRW = chartData.length > 0 ? Math.round(chartData.reduce((acc: number, curr: any) => acc + curr.readingWriting, 0) / chartData.length) : 0;

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole="ADMIN"
    >
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="heading-2 text-slate-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="subtitle text-slate-600 dark:text-slate-400">
              Overview of your SAT-ALFA platform
            </p>
          </div>
          <CreateTestButton />
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded text-[10px] font-semibold">
              Active
            </span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              {studentCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Students</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-[10px] font-semibold">
              Active
            </span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              {groupCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Groups</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              {avgTotal > 0 ? avgTotal : "--"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Score (M: {avgMath > 0 ? avgMath : "--"} | RW: {avgRW > 0 ? avgRW : "--"})</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block">
              {(totalRevenue / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Revenue (UZS)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors">
              <Target className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Live
            </span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              0
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Sessions</span>
          </div>
        </div>
      </div>

      {/* Bento Grid layout for Analytics & Monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="heading-4 text-slate-900 dark:text-white">
              SAT Score Performance
            </h2>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden p-4">
            {chartData.length > 0 ? (
              <div className="w-full h-full min-h-[300px]">
                <ScoreAnalyticsChart data={chartData} />
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-lg z-10 shadow-sm text-center">
                <p className="font-medium text-sm text-slate-500 dark:text-slate-400">Analytics data will appear after students complete tests</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="space-y-4">
          {/* System Status Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">API</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Database</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Storage</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/students/create"
                className="block px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-lg transition-colors"
              >
                + Add Student
              </Link>
              <Link
                href="/admin/groups/create"
                className="block px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-lg transition-colors"
              >
                + Create Group
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
