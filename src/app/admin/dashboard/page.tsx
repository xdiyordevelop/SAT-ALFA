import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
  const avgRW = chartData.length > 0 ? Math.round(chartData.reduce((acc: number, curr: any) => acc + curr.english, 0) / chartData.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      <Sidebar username={session.username || "Admin"} role="ADMIN" />

      <div className="flex-1 min-w-0 w-full">
        <Topbar
          title="Boshqaruv Paneli"
          breadcrumbs={[{ label: "Admin" }, { label: "Boshqaruv Paneli" }]}
          userName={session.username || "Admin"}
          userEmail={session.username || "admin@satalfa.uz"}
          userRole="ADMIN"
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Boshqaruv Paneli
            </h1>
            <CreateTestButton />
          </div>

          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <Users className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Talabalar
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-[#EBFF00] px-2 py-1 rounded text-[10px] font-bold border border-emerald-200 dark:border-[#EBFF00]/20">
                  Faol
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">
                  {studentCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">Jami profillar</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <FolderGit2 className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Guruhlar
                </div>
                <span className="bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 dark:border-white/10">
                  Aktiv
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">
                  {groupCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">Jarayonda</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#EBFF00]/50 transition-colors group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <Award className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> O'rtacha Ball
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
                  <DollarSign className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-[#EBFF00]" /> Tushumlar
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#EBFF00] block flex items-baseline gap-1">
                  {totalRevenue.toLocaleString()} <span className="text-[10px] sm:text-xs font-bold text-slate-500">UZS</span>
                </span>
                <span className="text-xs text-slate-500 font-medium mt-1 block">Umumiy yig'im</span>
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
                <span className="text-xs text-slate-500 font-medium">Faol jarayonlar</span>
              </div>
            </div>
            
          </div>

          {/* Bento Grid layout for Analytics & Monitors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <LineChart className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">SAT Natijalar Dinamikasi</h2>
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
                      <p className="font-bold text-sm text-slate-500 dark:text-slate-400">Analitika talabalar test topshirgach shakllanadi</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column Monitor & Tasks */}
            <div className="flex flex-col gap-6">
              
              {/* System Monitor */}
              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Tizim Holati</h2>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 p-3 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ma'lumotlar bazasi</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" /> Ulangan
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 p-3 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">API va Auth</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" /> Ishlamoqda
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 p-3 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Faol topshiruvchilar</span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" /> 0 Onlayn
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Topics */}
              <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Kutilayotgan Mavzular</h2>
                  </div>
                  <span className="bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded border border-slate-200 dark:border-white/10 font-bold">
                    {pendingLessons.length} Vazifa
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {pendingLessons.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Barcha darslar tasdiqlangan.
                    </div>
                  ) : (
                    pendingLessons.map((lesson: any) => (
                      <div key={lesson.id} className="bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 p-3.5 rounded-lg flex justify-between items-center hover:border-slate-400 dark:hover:border-[#EBFF00]/50 transition-colors group">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{lesson.group.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{lesson.topic.title}</p>
                        </div>
                        <button className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-[#EBFF00] font-bold text-xs rounded transition-colors">
                          Confirm
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Recent Submissions Table */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Oxirgi tasdiqlangan testlar</h2>
                </div>
                <Link
                  href="/admin/mock-tests/proctor"
                  className="text-[11px] font-bold text-slate-900 dark:text-[#EBFF00] hover:underline uppercase tracking-wider"
                >
                  Barchasini ko'rish
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-1/4">O'quvchi</th>
                      <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-1/4">Test Nomi</th>
                      <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Math</th>
                      <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">R&W</th>
                      <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Umumiy</th>
                      <th className="pb-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                          Oxirgi tasdiqlangan testlar topilmadi.
                        </td>
                      </tr>
                    ) : (
                      recentActivity.map((test: any) => (
                        <tr key={test.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors">
                          <td className="py-4 font-bold text-slate-900 dark:text-white">
                            {test.student?.firstName} {test.student?.lastName}
                          </td>
                          <td className="py-4 text-slate-600 dark:text-slate-400 font-medium">
                            {test.testName}
                          </td>
                          <td className="py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {test.mathScore || "-"}
                          </td>
                          <td className="py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {test.englishScore || "-"}
                          </td>
                          <td className="py-4 text-center">
                             <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-yellow-100 dark:bg-[#EBFF00]/10 text-yellow-800 dark:text-[#EBFF00] border border-yellow-200 dark:border-[#EBFF00]/20 text-[11px] font-black tracking-widest">
                              {test.totalScore || test.score || "-"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                             <Link
                                href={`/admin/mock-tests/results/${test.id}`}
                                className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-black bg-slate-100 dark:bg-[#2a2a2a] hover:bg-slate-200 dark:hover:bg-white px-3 py-1.5 rounded transition-all uppercase tracking-wider"
                              >
                                Ko'rish
                              </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
          </div>

        </main>
      </div>
    </div>
  );
}
