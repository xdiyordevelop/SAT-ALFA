import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import {
  Users,
  FolderGit2,
  Activity,
  Calendar,
  Target,
  CreditCard,
} from "lucide-react";
import {
  canManagePayments,
  isManager,
  canManageAcademics,
} from "@/lib/permissions/auth";
import { getProctoredSessionCohortAnalytics } from "@/server/actions/proctor-analytics";
import {
  RecentExamCohortSection,
  type RecentSessionSummary,
} from "@/components/admin/dashboard/RecentExamCohortSection";
import {
  CollectedRevenueCard,
  type MonthlyRevenueItem,
} from "@/components/admin/dashboard/CollectedRevenueCard";
import {
  ManagerOperationsSection,
  type RecentPaymentItem,
  type GroupBillingSummary,
} from "@/components/admin/dashboard/ManagerOperationsSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  const canSeeRevenue = canManagePayments(session);
  const managerUser = isManager(session);
  const academicUser = canManageAcademics(session);

  // Get dashboard statistics, recent exam sessions, and monthly payment aggregates concurrently
  const [
    studentCount,
    groupCount,
    monthlyPaymentsRaw,
    activeSessionCount,
    recentProctoredSessions,
    managerRecentPaymentsRaw,
    managerActiveGroupsRaw,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.group.count({ where: { status: "ACTIVE" } }).catch(() => prisma.group.count()),
    canSeeRevenue
      ? prisma.payment.groupBy({
          by: ["month"],
          _sum: { amountPaid: true },
          _count: { id: true },
          orderBy: { month: "desc" },
          take: 12,
        }).catch(() => [])
      : Promise.resolve([]),
    academicUser
      ? prisma.proctoredSession.count({ where: { status: "ACTIVE" } }).catch(() => 0)
      : Promise.resolve(0),
    academicUser
      ? prisma.proctoredSession.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          include: {
            satTest: {
              select: { id: true, name: true },
            },
            participants: {
              select: { id: true, status: true, score: true },
            },
            _count: {
              select: { participants: true },
            },
          },
        }).catch(() => [])
      : Promise.resolve([]),
    managerUser
      ? prisma.payment.findMany({
          where: { amountPaid: { gt: 0 } },
          orderBy: { paidAt: "desc" },
          take: 8,
          include: {
            student: {
              select: { firstName: true, lastName: true },
            },
            group: {
              select: { name: true },
            },
          },
        }).catch(() => [])
      : Promise.resolve([]),
    managerUser
      ? prisma.group.findMany({
          where: { status: "ACTIVE" },
          orderBy: { name: "asc" },
          take: 6,
          include: {
            _count: {
              select: { studentProfiles: true },
            },
          },
        }).catch(() => [])
      : Promise.resolve([]),
  ]);

  // Build clean list of recent months for Collected Revenue
  const now = new Date();
  const monthlyRevenueItems: MonthlyRevenueItem[] = [];
  const processedMonths = new Set<string>();

  // Generate current month and previous 5 months
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    processedMonths.add(monthKey);
    const match = monthlyPaymentsRaw.find((p) => p.month === monthKey);
    monthlyRevenueItems.push({
      monthKey,
      label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      shortLabel: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      amountPaid: match?._sum?.amountPaid || 0,
      transactionCount: match?._count?.id || 0,
    });
  }

  // Include any other months from DB
  for (const p of monthlyPaymentsRaw) {
    if (!processedMonths.has(p.month)) {
      processedMonths.add(p.month);
      const [y, m] = p.month.split("-");
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      monthlyRevenueItems.push({
        monthKey: p.month,
        label: !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : p.month,
        shortLabel: !isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : p.month,
        amountPaid: p._sum?.amountPaid || 0,
        transactionCount: p._count?.id || 0,
      });
    }
  }

  const allTimeRevenue = monthlyPaymentsRaw.reduce((acc, p) => acc + (p._sum?.amountPaid || 0), 0);
  const allTimeTransactions = monthlyPaymentsRaw.reduce((acc, p) => acc + (p._count?.id || 0), 0);

  // Map recent payments for Manager
  const managerRecentPayments: RecentPaymentItem[] = managerRecentPaymentsRaw.map((p) => ({
    id: p.id,
    studentName: `${p.student?.firstName || ""} ${p.student?.lastName || ""}`.trim() || "Unknown Student",
    groupName: p.group?.name || "General Group",
    month: p.month,
    amountPaid: p.amountPaid,
    status: p.status,
    paidAt: p.paidAt.toISOString(),
  }));

  // Map active groups for Manager
  const managerActiveGroups: GroupBillingSummary[] = managerActiveGroupsRaw.map((g) => ({
    id: g.id,
    name: g.name,
    monthlyFee: g.monthlyFee || 0,
    studentCount: g._count.studentProfiles,
  }));

  // Map recent sessions for the cohort analytics widget (Academics: Super Admin & Teacher)
  const recentSessionSummaries: RecentSessionSummary[] = academicUser
    ? recentProctoredSessions.map((s) => {
        const validScores = s.participants.map((p) => p.score).filter((sc): sc is number => typeof sc === "number" && sc > 0);
        const sessionAvg = validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : 0;
        const completedCount = s.participants.filter((p) => p.status === "COMPLETED" || p.score !== null).length;

        return {
          id: s.id,
          code: s.code,
          testId: s.satTest.id,
          testName: s.satTest.name,
          status: s.status as any,
          createdAt: s.createdAt.toISOString(),
          participantCount: s._count.participants,
          completedCount,
          avgScore: sessionAvg,
        };
      })
    : [];

  // Preload featured cohort analytics for the newest session if available
  let initialFeaturedCohort = null;
  if (academicUser && recentSessionSummaries.length > 0) {
    const featuredRes = await getProctoredSessionCohortAnalytics(recentSessionSummaries[0].id);
    if (featuredRes.success && featuredRes.data) {
      initialFeaturedCohort = featuredRes.data;
    }
  }

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      {/* Top Welcome & System Status Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-1 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {managerUser
                ? "Overview of student tuition, payments, attendance, and administrative operations"
                : "Overview of your SAT-ALFA platform, live test performance, and operations"}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canSeeRevenue ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 mb-8`}>
        {/* Total Students */}
        <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-white/20 transition-all group flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1B1B] border border-neutral-200/50 dark:border-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-[#EBFF00] group-hover:border-[#EBFF00]/30 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Active
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-neutral-900 dark:text-white block tracking-tight">
              {studentCount}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Students</span>
          </div>
        </div>

        {/* Active Groups */}
        <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-white/20 transition-all group flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1B1B] border border-neutral-200/50 dark:border-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-[#EBFF00] group-hover:border-[#EBFF00]/30 transition-colors">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Active
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-neutral-900 dark:text-white block tracking-tight">
              {groupCount}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Active Groups</span>
          </div>
        </div>

        {/* Collected Revenue (Monthly) - Visible to Super Admin, Admin & Manager */}
        {canSeeRevenue && (
          <CollectedRevenueCard
            monthlyItems={monthlyRevenueItems}
            allTimeRevenue={allTimeRevenue}
            allTimeTransactions={allTimeTransactions}
          />
        )}

        {/* Academics (Super Admin & Teacher): Active Live Sessions */}
        {academicUser && (
          <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-white/20 transition-all group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1B1B] border border-neutral-200/50 dark:border-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-[#EBFF00] group-hover:border-[#EBFF00]/30 transition-colors">
                <Target className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                activeSessionCount > 0
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400"
              }`}>
                {activeSessionCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                {activeSessionCount > 0 ? "Live" : "Idle"}
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-neutral-900 dark:text-white block tracking-tight">
                {activeSessionCount}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Active Live Sessions</span>
            </div>
          </div>
        )}

        {/* Manager Only: Total Recorded Transactions */}
        {managerUser && !academicUser && (
          <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-white/20 transition-all group flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1B1B] border border-neutral-200/50 dark:border-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-[#EBFF00] group-hover:border-[#EBFF00]/30 transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Recorded
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-neutral-900 dark:text-white block tracking-tight">
                {allTimeTransactions}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Recorded Payments</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Exam Cohorts OR Manager Operations & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2 Columns: Manager Operations for Manager, Exam Cohorts for Academics */}
        <div className="lg:col-span-2">
          {managerUser ? (
            <ManagerOperationsSection
              recentPayments={managerRecentPayments}
              activeGroups={managerActiveGroups}
            />
          ) : academicUser ? (
            <RecentExamCohortSection
              recentSessions={recentSessionSummaries}
              initialFeaturedCohort={initialFeaturedCohort}
            />
          ) : null}
        </div>

        {/* Right Sidebar - System Health & Shortcuts */}
        <div className="space-y-4">
          {/* System Status Card */}
          <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[#1C1B1B] border border-neutral-200/50 dark:border-white/5 flex items-center justify-center">
                <Activity className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">System & Services</h3>
            </div>
            <div className="space-y-3">
              {managerUser ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-white/5">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Database & Records</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-white/5">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Billing & Payments Hub</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">SMS Notification Service</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Operational
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-white/5">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Live Exam Telemetry</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-white/5">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Database & Analytics</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">AI Scoring Engine</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Operational
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-4">Quick Management</h3>
            <div className="space-y-2">
              {managerUser ? (
                <>
                  <Link
                    href="/admin/payments"
                    className="block px-4 py-2.5 bg-[#EBFF00] hover:bg-[#d4e600] text-black text-xs font-bold rounded-xl transition-colors shadow-sm text-center"
                  >
                    Record Student Payment
                  </Link>
                  <Link
                    href="/admin/attendance"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    Mark Attendance
                  </Link>
                  <Link
                    href="/admin/students/create"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    + Add Student
                  </Link>
                  <Link
                    href="/admin/groups/create"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    + Create Group
                  </Link>
                  <Link
                    href="/admin/sms-notifications"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    SMS Notifications
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/mock-tests/proctor"
                    className="block px-4 py-2.5 bg-[#EBFF00] hover:bg-[#d4e600] text-black text-xs font-bold rounded-xl transition-colors shadow-sm text-center"
                  >
                    Launch Exam Proctoring
                  </Link>
                  <Link
                    href="/admin/attendance"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    Mark Attendance
                  </Link>
                  <Link
                    href="/admin/students/create"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    + Add Student
                  </Link>
                  <Link
                    href="/admin/groups/create"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    + Create Group
                  </Link>
                  <Link
                    href="/admin/mock-tests/analytics"
                    className="block px-4 py-2.5 bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white border border-transparent dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 text-xs font-semibold rounded-xl transition-all"
                  >
                    All Mock Tests Analytics
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
