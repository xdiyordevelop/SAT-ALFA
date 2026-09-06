"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getAttendanceHistory,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from "@/server/actions/attendance.actions";
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Download,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Check,
  X,
  RotateCcw,
  CheckSquare,
} from "lucide-react";
import { AttendanceMarkingWorkspace } from "@/components/admin/attendance/AttendanceMarkingWorkspace";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface AttendanceClientProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
  initialTab?: "mark" | "history";
}

export function AttendanceClient({
  userRole = "ADMIN",
  userName = "Admin",
  userEmail = "admin@satalfa.uz",
  initialTab = "history",
}: AttendanceClientProps) {
  const getLocalDateStr = (d: Date = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [activeTab, setActiveTab] = useState<"mark" | "history">(
    initialTab || "history"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "mark" || tabParam === "history") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const [date, setDate] = useState(() => getLocalDateStr());
  const todayStr = useMemo(() => getLocalDateStr(), []);
  const isToday = date === todayStr;
  const isFutureDate = date > todayStr;

  const [selectedGroupId, setSelectedGroupId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [data, setData] = useState<{
    records: any[];
    groups: any[];
    stats: {
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      percentage: number;
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<{
    id: string;
    studentName: string;
    groupName: string;
    date: string;
    status: AttendanceStatus;
    note: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceHistory({
        date,
        groupId: selectedGroupId,
        status: statusFilter,
        search: searchQuery,
      });
      setData(res);
    } catch (e) {
      console.error("Failed to load attendance history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date, selectedGroupId, statusFilter]);

  // Handle live search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Date Navigation Handlers (pure UTC calendar day shifting prevents any timezone offset bugs)
  const handlePrevDay = () => {
    const [y, m, d] = date.split("-").map(Number);
    const prev = new Date(Date.UTC(y, m - 1, d - 1));
    setDate(prev.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const [y, m, d] = date.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    setDate(next.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setDate(getLocalDateStr());
  };

  // Quick inline status toggle
  const handleQuickStatusChange = (recordId: string, newStatus: AttendanceStatus) => {
    startTransition(async () => {
      await updateAttendanceRecord(recordId, newStatus);
      await loadData();
    });
  };

  // Save Modal Edit
  const handleSaveEdit = () => {
    if (!editingRecord) return;
    startTransition(async () => {
      await updateAttendanceRecord(
        editingRecord.id,
        editingRecord.status,
        editingRecord.note
      );
      setEditingRecord(null);
      await loadData();
    });
  };

  // Delete Record
  const handleDeleteRecord = (recordId: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) return;
    startTransition(async () => {
      await deleteAttendanceRecord(recordId);
      await loadData();
    });
  };

  const statusBadges: Record<
    AttendanceStatus,
    { label: string; badge: string; icon: any }
  > = {
    PRESENT: {
      label: "Present",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      icon: CheckCircle2,
    },
    ABSENT: {
      label: "Absent",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
      icon: XCircle,
    },
    LATE: {
      label: "Late",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      icon: Clock,
    },
    EXCUSED: {
      label: "Excused",
      badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
      icon: AlertCircle,
    },
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr || dateStr === "ALL") return "All Recorded Dates";
    const [y, m, d] = dateStr.split("-").map(Number);
    const obj = new Date(y, m - 1, d, 12, 0, 0);
    return obj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stats = data?.stats || {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
  };

  return (
    <AdminLayout
      title="Attendance Records"
      breadcrumbs={[{ label: "Admin" }, { label: "Attendance" }]}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
    >
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {activeTab === "mark" ? "Take Attendance" : "Attendance Records & History"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {activeTab === "mark"
              ? "Mark daily presence, track student check-ins, and record absence notes."
              : "Review past attendance, inspect presence by group, and export reports."}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("mark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === "mark"
                ? "bg-[#EBFF00] text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Take Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === "history"
                ? "bg-[#EBFF00] text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>History & Analytics</span>
          </button>
        </div>
      </div>

      {activeTab === "mark" ? (
        <AttendanceMarkingWorkspace
          onAttendanceSaved={loadData}
          initialGroupId={selectedGroupId !== "ALL" ? selectedGroupId : undefined}
          initialDate={date}
        />
      ) : (
        <>
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Daily Log & Filtering
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Navigate dates and filter by class to see presence records.
              </p>
            </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Navigator Bar */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 shadow-sm">
            <button
              type="button"
              onClick={handlePrevDay}
              className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c1b1b] text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors"
              title="Previous Day"
            >
              ←
            </button>
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-[#EBFF00]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-semibold text-sm outline-none cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={handleNextDay}
              className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1c1b1b] text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors"
              title="Next Day"
            >
              →
            </button>
            {isToday ? (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Today
              </span>
            ) : (
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-200 dark:hover:bg-[#252525] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                title={`Jump back to Today (${todayStr})`}
              >
                Go to Today
              </button>
            )}
          </div>

          {/* Mark Attendance Button */}
          <button
            type="button"
            onClick={() => setActiveTab("mark")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-2xl text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>

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
                    href={`/api/admin/attendance/export?date=${date}&groupId=${selectedGroupId}&scope=date`}
                    onClick={() => setShowExportMenu(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors group"
                  >
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#EBFF00] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Selected Date Report
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {date} attendance sheet (CSV)
                      </p>
                    </div>
                  </a>

                  <a
                    href={`/api/admin/attendance/export?month=${date.slice(0, 7)}&groupId=${selectedGroupId}&scope=month`}
                    onClick={() => setShowExportMenu(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors group"
                  >
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#EBFF00] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Monthly Group Report
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {date.slice(0, 7)} monthly records (CSV)
                      </p>
                    </div>
                  </a>

                  <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                  <a
                    href={`/api/admin/attendance/export?scope=all`}
                    onClick={() => setShowExportMenu(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors group"
                  >
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#EBFF00] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        All-Time History Ledger
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Full historical attendance export
                      </p>
                    </div>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Warning if Future Date is Selected */}
      {isFutureDate && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-bold">
                Upcoming / Future Date Selected ({formatDateDisplay(date)})
              </p>
              <p className="text-xs opacity-90">
                This date has not arrived yet! Attendance cannot be recorded or modified ahead of time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors whitespace-nowrap"
          >
            Switch to Today ({todayStr})
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {/* Attendance Rate */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Attendance Rate
            </span>
            <Users className="w-4 h-4 text-slate-400 dark:text-[#EBFF00]" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.percentage}%
          </p>
          <div className="w-full bg-slate-100 dark:bg-[#1c1b1b] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#EBFF00] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.percentage)}%` }}
            />
          </div>
        </div>

        {/* Present */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Present
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.present}
          </p>
          <p className="text-xs text-slate-400 mt-1">Students attended</p>
        </div>

        {/* Absent */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Absent
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.absent}
          </p>
          <p className="text-xs text-slate-400 mt-1">Unexcused missed</p>
        </div>

        {/* Late */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Late
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.late}
          </p>
          <p className="text-xs text-slate-400 mt-1">Delayed arrival</p>
        </div>

        {/* Excused */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Excused
            </span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {stats.excused}
          </p>
          <p className="text-xs text-slate-400 mt-1">Valid reason</p>
        </div>
      </div>

      {/* Group Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedGroupId("ALL")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            selectedGroupId === "ALL"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-[#131313] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
          }`}
        >
          <span>All Groups</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              selectedGroupId === "ALL"
                ? "bg-white/20 dark:bg-black/10"
                : "bg-slate-100 dark:bg-[#1c1b1b]"
            }`}
          >
            {data?.groups?.length || 0}
          </span>
        </button>

        {data?.groups?.map((grp: any) => (
          <button
            key={grp.id}
            type="button"
            onClick={() => setSelectedGroupId(grp.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedGroupId === grp.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-[#131313] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
            }`}
          >
            <span>{grp.name}</span>
          </button>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#EBFF00] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-1 w-full md:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "All Statuses" },
            { id: "PRESENT", label: "Present" },
            { id: "ABSENT", label: "Absent" },
            { id: "LATE", label: "Late" },
            { id: "EXCUSED", label: "Excused" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {formatDateDisplay(date)}
              </h2>
              {isToday ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Today
                </span>
              ) : isFutureDate ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Future Date (Not Arrived Yet)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                  Past Date
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Showing {data?.records?.length || 0} attendance entries
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#EBFF00]" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        {loading && !data ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#EBFF00]" />
            <p className="text-sm font-medium text-slate-400">
              Loading attendance records...
            </p>
          </div>
        ) : data?.records && data.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Group</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Note</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.records.map((r: any) => {
                  const badgeConfig =
                    statusBadges[r.status as AttendanceStatus] ||
                    statusBadges.PRESENT;
                  const StatusIcon = badgeConfig.icon;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#1a1a1a]/50 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                            {r.student?.firstName?.[0]}
                            {r.student?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {r.student?.firstName} {r.student?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {r.student?.phone || r.student?.user?.username || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Group Name */}
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          {r.group?.name || "No Group"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {new Date(r.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </td>

                      {/* Status with Quick Toggle Menu */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeConfig.badge}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{badgeConfig.label}</span>
                          </span>

                          {/* Quick 1-click status switchers */}
                          <div className="flex items-center gap-1 ml-2 opacity-60 hover:opacity-100 transition-opacity">
                            {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as AttendanceStatus[]).map(
                              (s) =>
                                s !== r.status && (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleQuickStatusChange(r.id, s)}
                                    title={`Change to ${s.toLowerCase()}`}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                                  >
                                    {s[0]}
                                  </button>
                                )
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="py-4 px-6">
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {r.note || <span className="italic text-slate-400">—</span>}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingRecord({
                                id: r.id,
                                studentName: `${r.student?.firstName} ${r.student?.lastName}`,
                                groupName: r.group?.name || "",
                                date: new Date(r.date).toISOString().slice(0, 10),
                                status: r.status,
                                note: r.note || "",
                              })
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Edit Note & Status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            {isFutureDate ? (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  This Date Has Not Arrived Yet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  {formatDateDisplay(date)} is in the future. Attendance cannot be recorded ahead of time.
                </p>
                <button
                  type="button"
                  onClick={handleToday}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-2xl text-sm font-bold shadow-sm transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Switch to Today ({todayStr})</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  No Attendance Records Found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  There is no recorded attendance for {formatDateDisplay(date)}.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("mark")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-2xl text-sm font-bold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mark Attendance ({isToday ? "Today" : date})</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )}

      {/* Edit Attendance Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Attendance
                </h3>
                <p className="text-xs text-slate-400">
                  {editingRecord.studentName} ({editingRecord.groupName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as AttendanceStatus[]).map(
                    (s) => {
                      const cfg = statusBadges[s];
                      const isSelected = editingRecord.status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setEditingRecord({ ...editingRecord, status: s })
                          }
                          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            isSelected
                              ? "border-[#EBFF00] bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00]"
                              : "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <cfg.icon className="w-4 h-4" />
                          <span>{cfg.label}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Note / Reason Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Note / Reason
                </label>
                <textarea
                  rows={3}
                  value={editingRecord.note}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, note: e.target.value })
                  }
                  placeholder="e.g. Sick leave, arrived 15 mins late..."
                  className="w-full p-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#EBFF00] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-2xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
