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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <CreateTestButton />
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <Users className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Students
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-[#EBFF00] px-2 py-1 rounded text-[10px] font-bold border border-emerald-200 dark:border-[#EBFF00]/20">
              Active
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              {studentCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Total Profiles</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <FolderGit2 className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Groups
            </div>
            <span className="bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 dark:border-white/10">
              Active
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              {groupCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">In Progress</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <Award className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Average Score
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block flex items-baseline gap-1">
              {avgTotal > 0 ? avgTotal : "--"} <span className="text-sm font-semibold text-slate-400">/ 1600</span>
            </span>
            <span className="text-xs text-slate-500 font-medium block mt-1">
              M: {avgMath > 0 ? avgMath : "--"} | RW: {avgRW > 0 ? avgRW : "--"}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <DollarSign className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Revenue
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#EBFF00] block flex items-baseline gap-1">
              {totalRevenue.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-slate-500">UZS</span>
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1 block">Total Income</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <Target className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Proctoring
            </div>
            <span className="bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 px-2 py-1 rounded text-[10px] font-bold border border-rose-200 dark:border-rose-900/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Live
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              0
            </span>
            <span className="text-xs text-slate-500 font-medium">Active Sessions</span>
          </div>
        </div>
      </div>

      {/* Bento Grid layout for Analytics & Monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <LineChart className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">SAT Score Performance</h2>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-[#1c1b1b]/50 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden p-4">
            {chartData.length > 0 ? (
              <div className="w-full h-full min-h-[300px]">
                <ScoreAnalyticsChart data={chartData} />
              </div>
            ) : (
              <>
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 dark:from-[#EBFF00] to-transparent pointer-events-none"></div>
                <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 px-6 py-4 rounded-lg z-10 shadow-lg text-center">
                  <p className="font-bold text-sm text-slate-500 dark:text-slate-400">Analytics data will appear after students complete tests</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="space-y-4">
          {/* System Status Card */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">API</span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
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
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/students/create"
                className="block px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] text-slate-900 dark:text-white text-xs font-semibold rounded-lg transition-colors"
              >
                + Add Student
              </Link>
              <Link
                href="/admin/groups/create"
                className="block px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] text-slate-900 dark:text-white text-xs font-semibold rounded-lg transition-colors"
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
