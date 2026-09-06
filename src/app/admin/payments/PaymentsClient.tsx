"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getPaymentsData,
  recordStudentPayment,
} from "@/server/actions/payment.actions";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import {
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Search,
  X,
  Loader2,
  Calendar,
  Download,
  ChevronDown,
} from "lucide-react";

interface PaymentsClientProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function PaymentsClient({
  userRole = "ADMIN",
  userName = "Admin",
  userEmail = "admin@satalfa.uz",
}: PaymentsClientProps) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Navigation & Filtering
  const [selectedGroupId, setSelectedGroupId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Payment Recording Modal
  const [paymentModal, setPaymentModal] = useState<{
    studentId: string;
    studentName: string;
    username?: string;
    groupId: string;
    groupName: string;
    fee: number;
    amountPaid: number;
    debt: number;
    amountInput: string;
    notes: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [month]);

  const loadData = async () => {
    setLoading(true);
    setIsUnauthorized(false);
    try {
      const result = await getPaymentsData(month);
      setData(result);
    } catch (e: any) {
      console.error("Failed to load payments data:", e);
      if (
        e?.message?.toLowerCase().includes("unauthorized") ||
        e?.message?.toLowerCase().includes("permission")
      ) {
        setIsUnauthorized(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatUZS = (num: number) => {
    return num.toLocaleString() + " UZS";
  };

  const formatMonthLabel = (m: string) => {
    const [year, mo] = m.split("-");
    const date = new Date(parseInt(year), parseInt(mo) - 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  // Extract all students with their group info
  const allStudents = useMemo(() => {
    if (!data?.groups) return [];
    return data.groups.flatMap((g: any) =>
      g.students.map((s: any) => ({
        ...s,
        groupId: g.id,
        groupName: g.name,
      }))
    );
  }, [data]);

  // Filter students based on selected group, search query, and status
  const filteredStudents = useMemo(() => {
    let list = selectedGroupId === "ALL"
      ? allStudents
      : allStudents.filter((s: any) => s.groupId === selectedGroupId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s: any) =>
          s.name.toLowerCase().includes(q) ||
          (s.username && s.username.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      list = list.filter((s: any) => s.status === statusFilter);
    }

    return list;
  }, [allStudents, selectedGroupId, searchQuery, statusFilter]);

  // Open Payment Modal
  const openPaymentModal = (student: any) => {
    setPaymentModal({
      studentId: student.id,
      studentName: student.name,
      username: student.username,
      groupId: student.groupId,
      groupName: student.groupName,
      fee: student.fee,
      amountPaid: student.amountPaid,
      debt: student.debt,
      amountInput: student.amountPaid > 0 ? student.amountPaid.toLocaleString() : student.fee.toLocaleString(),
      notes: student.notes || "",
    });
  };

  const handleSaveModalPayment = () => {
    if (!paymentModal) return;
    const amountPaid = parseInt(paymentModal.amountInput.replace(/[^0-9]/g, "")) || 0;

    startTransition(async () => {
      await recordStudentPayment({
        studentId: paymentModal.studentId,
        groupId: paymentModal.groupId,
        month,
        amountPaid,
        notes: paymentModal.notes,
      });
      await loadData();
      setPaymentModal(null);
    });
  };

  // Quick 1-click Full Pay
  const handleQuickPayFull = (student: any) => {
    startTransition(async () => {
      await recordStudentPayment({
        studentId: student.id,
        groupId: student.groupId,
        month,
        amountPaid: student.fee,
        notes: student.notes,
      });
      await loadData();
    });
  };

  // Quick month navigation
  const handlePrevMonth = () => {
    const [year, mo] = month.split("-").map(Number);
    const prev = new Date(year, mo - 2, 1);
    setMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const [year, mo] = month.split("-").map(Number);
    const next = new Date(year, mo, 1);
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  };

  // Group stats calculation
  const totalStudentsCount = allStudents.length;
  const collectionPercentage =
    data?.totalExpected > 0
      ? Math.round((data.totalCollected / data.totalExpected) * 100)
      : 0;

  if (isUnauthorized) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[{ label: "Admin" }, { label: "Payments" }]}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
      >
        <AccessDeniedView
          title="Finance & Payments Restricted"
          message="Financial records, student tuition balances, and payment processing are restricted to Super Administrators and Managers."
          requiredRole="Super Admin or Manager"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Payments & Billing"
      breadcrumbs={[{ label: "Admin" }, { label: "Payments" }]}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1.5">
            Billing & Payments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitor group billing, track outstanding debts, and record student payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector Bar */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c1b1b] text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors"
              title="Previous Month"
            >
              ←
            </button>
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-[#EBFF00]" />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-semibold text-sm outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={handleNextMonth}
              className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c1b1b] text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors"
              title="Next Month"
            >
              →
            </button>
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500 dark:text-[#EBFF00]" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-30 p-2 animate-slide-up">
                  <a
                    href={`/api/admin/payments/export?month=${month}&scope=month`}
                    onClick={() => setShowExportMenu(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors group"
                  >
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#EBFF00] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Current Month Report
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatMonthLabel(month)} billing sheet (CSV)
                      </p>
                    </div>
                  </a>

                  <a
                    href="/api/admin/payments/export?scope=all"
                    onClick={() => setShowExportMenu(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors group"
                  >
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#EBFF00] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        All-Time History Ledger
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Complete payment transactions (CSV)
                      </p>
                    </div>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-28">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#EBFF00] border-t-transparent animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Loading payments data...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Expected Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatUZS(data?.totalExpected || 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#EBFF00]/10 flex items-center justify-center text-slate-950 dark:text-[#EBFF00] border border-[#EBFF00]/20">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total for {formatMonthLabel(month)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Collected Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600">
                    {formatUZS(data?.totalCollected || 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, collectionPercentage)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  {collectionPercentage}%
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Outstanding Debt
                  </p>
                  <h3 className="text-2xl font-bold text-red-500">
                    {formatUZS(data?.totalDebt || 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remaining unpaid balance
              </p>
            </div>
          </div>

          {/* Group Tabs Selection Bar */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-3 mb-6 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {/* All Groups Pill */}
              <button
                onClick={() => setSelectedGroupId("ALL")}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  selectedGroupId === "ALL"
                    ? "bg-[#EBFF00] text-slate-950 shadow-md shadow-[#EBFF00]/15"
                    : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Groups</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedGroupId === "ALL"
                      ? "bg-slate-950 text-white"
                      : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {totalStudentsCount}
                </span>
              </button>

              {/* Individual Group Pills */}
              {data?.groups.map((group: any) => {
                const isSelected = selectedGroupId === group.id;
                const groupDebt = group.students.reduce(
                  (sum: number, s: any) => sum + s.debt,
                  0
                );

                return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                      isSelected
                        ? "bg-[#EBFF00] text-slate-950 border-[#EBFF00] shadow-md shadow-[#EBFF00]/15"
                        : "bg-slate-100/80 dark:bg-[#1c1b1b] border-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <span>{group.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isSelected
                          ? "bg-slate-950 text-white"
                          : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {group.students.length}
                    </span>
                    {groupDebt > 0 && (
                      <span
                        className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                        title={`Debt: ${formatUZS(groupDebt)}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Filter and Tools Bar */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name or username..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Status:
              </span>
              {[
                { id: "ALL", label: "All" },
                { id: "PAID", label: "Paid" },
                { id: "PARTIAL", label: "Partial" },
                { id: "UNPAID", label: "Unpaid" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    statusFilter === filter.id
                      ? "bg-[#EBFF00] text-slate-950 font-bold"
                      : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Students Payments Table */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  {selectedGroupId === "ALL"
                    ? "All Enrolled Students"
                    : data?.groups.find((g: any) => g.id === selectedGroupId)?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Showing {filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No students found
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No students match your filter criteria or no students are enrolled in this group yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-[#0a0a0a]">
                      <th className="py-4 px-6">Student</th>
                      {selectedGroupId === "ALL" && (
                        <th className="py-4 px-6">Group</th>
                      )}
                      <th className="py-4 px-6">Monthly Fee</th>
                      <th className="py-4 px-6">Paid</th>
                      <th className="py-4 px-6">Debt</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
                    {filteredStudents.map((student: any) => (
                      <tr
                        key={`${student.groupId}_${student.id}`}
                        className="hover:bg-slate-50/70 dark:hover:bg-[#1a1a1a]/50 transition-colors"
                      >
                        {/* Student Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#EBFF00] text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                              {student.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {student.name}
                              </p>
                              {student.username && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  @{student.username}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Group (if viewing all) */}
                        {selectedGroupId === "ALL" && (
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                              {student.groupName}
                            </span>
                          </td>
                        )}

                        {/* Fee */}
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">
                          {formatUZS(student.fee)}
                        </td>

                        {/* Amount Paid with Mini Progress */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatUZS(student.amountPaid)}
                            </span>
                            {student.fee > 0 && (
                              <div className="w-24 bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    student.amountPaid >= student.fee
                                      ? "bg-emerald-500"
                                      : student.amountPaid > 0
                                      ? "bg-[#EBFF00]"
                                      : "bg-transparent"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(
                                        (student.amountPaid / student.fee) * 100
                                      )
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Debt */}
                        <td className="py-4 px-6">
                          {student.debt > 0 ? (
                            <span className="font-bold text-red-500">
                              {formatUZS(student.debt)}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">
                              No Debt
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 text-center">
                          {student.status === "PAID" && (
                            <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md text-[11px] font-bold tracking-wider">
                              PAID
                            </span>
                          )}
                          {student.status === "PARTIAL" && (
                            <span className="inline-block px-2.5 py-1 bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/20 rounded-md text-[11px] font-bold tracking-wider">
                              PARTIAL
                            </span>
                          )}
                          {student.status === "UNPAID" && (
                            <span className="inline-block px-2.5 py-1 bg-red-500/10 text-red-600 border border-red-500/20 rounded-md text-[11px] font-bold tracking-wider">
                              UNPAID
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student.debt > 0 && (
                              <button
                                onClick={() => handleQuickPayFull(student)}
                                disabled={isPending}
                                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Mark as fully paid"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Full Pay</span>
                              </button>
                            )}

                            <button
                              onClick={() => openPaymentModal(student)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 rounded-lg transition-colors shadow-sm"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Record Payment</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payment Recording Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Record Student Payment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <strong className="text-slate-900 dark:text-white">
                    {paymentModal.studentName}
                  </strong>{" "}
                  • {paymentModal.groupName} • {formatMonthLabel(month)}
                </p>
              </div>
              <button
                onClick={() => setPaymentModal(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Billing Overview Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Monthly Fee
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatUZS(paymentModal.fee)}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Amount Paid
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {formatUZS(paymentModal.amountPaid)}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl p-3 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Remaining Debt
                </p>
                <p className="text-sm font-bold text-red-500">
                  {formatUZS(paymentModal.debt)}
                </p>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Quick Presets:
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentModal({
                      ...paymentModal,
                      amountInput: paymentModal.fee.toLocaleString(),
                    })
                  }
                  className="px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1c1b1b] text-slate-800 dark:text-slate-200 hover:bg-[#EBFF00] hover:text-slate-950 transition-colors"
                >
                  100% (Full)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentModal({
                      ...paymentModal,
                      amountInput: Math.floor(paymentModal.fee / 2).toLocaleString(),
                    })
                  }
                  className="px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1c1b1b] text-slate-800 dark:text-slate-200 hover:bg-[#EBFF00] hover:text-slate-950 transition-colors"
                >
                  50% (Half)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentModal({
                      ...paymentModal,
                      amountInput: (
                        paymentModal.amountPaid + paymentModal.debt
                      ).toLocaleString(),
                    })
                  }
                  className="px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1c1b1b] text-slate-800 dark:text-slate-200 hover:bg-[#EBFF00] hover:text-slate-950 transition-colors"
                >
                  Pay Debt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentModal({
                      ...paymentModal,
                      amountInput: "0",
                    })
                  }
                  className="px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1c1b1b] text-slate-800 dark:text-slate-200 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Clear (0)
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Payment Amount (UZS) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentModal.amountInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setPaymentModal({
                      ...paymentModal,
                      amountInput: raw ? parseInt(raw).toLocaleString() : "",
                    });
                  }}
                  placeholder="0"
                  autoFocus
                  className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  UZS
                </span>
              </div>
            </div>

            {/* Notes Input */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Notes / Payment Method (optional)
              </label>
              <input
                type="text"
                value={paymentModal.notes}
                onChange={(e) =>
                  setPaymentModal({
                    ...paymentModal,
                    notes: e.target.value,
                  })
                }
                placeholder="e.g. Paid in cash, Card transfer, Click, Payme..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] transition-all"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalPayment}
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
