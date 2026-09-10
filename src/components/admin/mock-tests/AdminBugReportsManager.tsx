"use client";

import React, { useState, useEffect } from "react";
import {
  Bug,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Check,
  Loader2,
  Maximize2,
  X,
  FileCheck,
  FileText,
  HardDrive,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Database,
} from "lucide-react";

interface BugReportItem {
  id: string;
  studentId: string;
  student?: {
    firstName: string;
    lastName: string;
    user?: { username: string };
  };
  satTestId: string | null;
  testName?: string;
  sourceFileUrl?: string | null;
  sourceFileName?: string | null;
  questionId: string | null;
  question?: {
    id: string;
    module: string;
    questionNumber: number;
    prompt: string;
    correctAnswer: string;
    imageUrl?: string | null;
  } | null;
  issueType: string;
  message: string;
  screenshot: string | null;
  status: string;
  priority: string | null;
  aiAnalysis: string | null;
  suggestedFix: string | null;
  fixPayload: any | null;
  createdAt: string;
}

export function AdminBugReportsManager() {
  const [reports, setReports] = useState<BugReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Storage & Cleanup State
  const [storageMetrics, setStorageMetrics] = useState<{
    totalFiles: number;
    totalBytes: number;
    totalFormatted: string;
    cleanableCount: number;
    cleanableBytes: number;
    cleanableFormatted: string;
    totalReports?: number;
    openReportsCount?: number;
    resolvedReportsCount?: number;
  } | null>(null);
  const [deleteDbRecords, setDeleteDbRecords] = useState(true);
  const [cleaningStorage, setCleaningStorage] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{
    message: string;
    freedFormatted: string;
  } | null>(null);

  const fetchStorageMetrics = async () => {
    try {
      const res = await fetch("/api/admin/bug-reports/storage");
      const data = await res.json();
      if (!data.error) {
        setStorageMetrics(data);
      }
    } catch (e) {
      console.error("Failed to load storage metrics:", e);
    }
  };

  const handleExecuteCleanup = async () => {
    setCleaningStorage(true);
    try {
      const res = await fetch("/api/admin/bug-reports/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteDatabaseRecords: deleteDbRecords }),
      });
      const data = await res.json();
      if (data.success) {
        setCleanupResult({
          message: data.message,
          freedFormatted: data.freedFormatted,
        });
        setShowCleanupModal(false);
        await Promise.all([fetchReports(), fetchStorageMetrics()]);
        setTimeout(() => setCleanupResult(null), 7000);
      } else {
        alert(data.error || "Failed to cleanup storage");
      }
    } catch (e) {
      console.error("Cleanup error:", e);
      alert("Error occurred during cleanup");
    } finally {
      setCleaningStorage(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bug-reports");
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error("Failed to load bug reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStorageMetrics();
  }, []);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setActionLoadingId(reportId);
    try {
      const res = await fetch("/api/admin/bug-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: newStatus }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApplyFix = async (reportId: string) => {
    if (
      !confirm(
        "Are you sure you want to apply the AI-suggested fix directly to this question in the database?"
      )
    )
      return;

    setActionLoadingId(reportId);
    try {
      const res = await fetch("/api/admin/bug-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, applyFix: true }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
        );
      }
    } catch (err) {
      console.error("Failed to apply AI fix:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const testName = (r.testName || "").toLowerCase();
      const msg = (r.message || "").toLowerCase();
      const student = `${r.student?.firstName || ""} ${r.student?.lastName || ""} ${r.student?.user?.username || ""}`.toLowerCase();
      return testName.includes(q) || msg.includes(q) || student.includes(q);
    }
    return true;
  });

  const totalCount = reports.length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Reports
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/30 flex items-center justify-center text-slate-900 dark:text-[#EBFF00]">
            <Bug className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Review
            </p>
            <h3 className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
              {openCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              AI / Resolved
            </p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {resolvedCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Storage & Cache
              </p>
              {storageMetrics && (storageMetrics.cleanableCount > 0 || (storageMetrics.resolvedReportsCount || 0) > 0) && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Cleanable
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {storageMetrics ? storageMetrics.totalFormatted : "..."}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
              {storageMetrics ? `${storageMetrics.totalFiles} files • ${storageMetrics.resolvedReportsCount || 0} resolved in DB` : "Checking storage..."}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Success cleanup result notification */}
      {cleanupResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-bold">{cleanupResult.message}</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                Freed {cleanupResult.freedFormatted} of server storage. All test questions, explanations, and answer keys are fully preserved.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCleanupResult(null)}
            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test, student, or issue description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#EBFF00]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold">
            {(["ALL", "open", "resolved"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-white dark:bg-[#252525] text-slate-900 dark:text-white shadow-sm font-black"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {st === "ALL" ? "All" : st === "open" ? "Open" : "Resolved"}
              </button>
            ))}
          </div>

          {/* Storage & Cleanup Button */}
          <button
            onClick={() => setShowCleanupModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer border border-transparent dark:border-white/20"
            title="Manage storage and clean resolved screenshots & history safely"
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-400 dark:text-purple-600" />
            <span>Storage & Cleanup</span>
            {storageMetrics &&
              (storageMetrics.cleanableCount > 0 ||
                (storageMetrics.resolvedReportsCount || 0) > 0) && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white leading-none">
                  {storageMetrics.cleanableCount > 0
                    ? storageMetrics.cleanableCount
                    : storageMetrics.resolvedReportsCount}
                </span>
              )}
          </button>

          <button
            onClick={() => {
              fetchReports();
              fetchStorageMetrics();
            }}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-[#EBFF00]" />
          <p className="text-sm font-bold">Loading bug reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-20 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#131313]/50 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/40 mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No bug reports found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No issues have been reported matching your current filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isResolved = report.status === "resolved";
            const isLoadingThis = actionLoadingId === report.id;

            return (
              <div
                key={report.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#131313] border transition-all ${
                  isResolved
                    ? "border-slate-200 dark:border-white/5 opacity-85"
                    : "border-slate-300 dark:border-[#EBFF00]/25 shadow-md"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Left: Screenshot preview */}
                  {report.screenshot ? (
                    <div className="shrink-0 w-full sm:w-52 relative group">
                      <img
                        src={report.screenshot}
                        alt="Bug Screenshot"
                        className="w-full h-36 rounded-xl object-contain border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1c1b1b] cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setZoomedImage(report.screenshot)}
                      />
                      <button
                        onClick={() => setZoomedImage(report.screenshot)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" /> Enlarge
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0 w-full sm:w-52 h-36 rounded-xl border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center text-xs text-slate-400 font-semibold">
                      No Screenshot
                    </div>
                  )}

                  {/* Middle: Details & Feedback */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isResolved
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {isResolved ? "Resolved" : "Open"}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300">
                          {report.issueType}
                        </span>
                        {report.priority && (
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              report.priority === "HIGH"
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            Priority: {report.priority}
                          </span>
                        )}
                        {report.fixPayload?.source_verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            Ground-Truth Verified ({report.fixPayload.source_reference || "Source PDF"})
                          </span>
                        )}
                        {report.fixPayload?.autoFixed && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBFF00]/20 text-slate-950 dark:text-[#EBFF00] border border-[#EBFF00]/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Auto-Fixed
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(report.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Test and Question info */}
                    <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>{report.testName}</span>
                      {report.sourceFileUrl && (
                        <a
                          href={report.sourceFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20"
                        >
                          <FileText className="w-3 h-3" />
                          Source PDF ({report.sourceFileName || "Document"})
                        </a>
                      )}
                      {report.question && (
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          ({report.question.module} • Question #{report.question.questionNumber})
                        </span>
                      )}
                      <span className="text-xs font-normal text-slate-400">
                        • Student:{" "}
                        <strong className="text-slate-700 dark:text-slate-200">
                          {report.student?.firstName} {report.student?.lastName}
                        </strong>{" "}
                        (@{report.student?.user?.username})
                      </span>
                    </div>

                    {/* Student message */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200">
                      <span className="font-bold block text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wider text-[10px]">
                        Student Feedback:
                      </span>
                      {report.message}
                    </div>

                    {/* AI Analysis and Recommendation */}
                    {report.aiAnalysis && (
                      <div className="p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          <span>Gemini AI Analysis:</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {report.aiAnalysis}
                        </p>
                        {report.fixPayload?.discrepancies?.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                            <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Source Discrepancies Corrected:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                              {report.fixPayload.discrepancies.map((d: string, idx: number) => (
                                <li key={idx}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {report.suggestedFix && (
                          <div className="pt-1.5 border-t border-purple-500/15 font-mono text-[11px] text-purple-800 dark:text-purple-200">
                            💡 Recommendation: {report.suggestedFix}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10 pt-3 lg:pt-0 lg:pl-4">
                    {report.fixPayload && !isResolved && (
                      <button
                        onClick={() => handleApplyFix(report.id)}
                        disabled={isLoadingThis}
                        className="px-4 py-2 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        title="Apply the AI-verified fix directly to database"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply AI Fix
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleUpdateStatus(report.id, isResolved ? "open" : "resolved")
                      }
                      disabled={isLoadingThis}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isResolved
                          ? "bg-slate-100 dark:bg-[#1e1e1e] text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90"
                      }`}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isResolved ? (
                        <>Reopen</>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Mark Resolved
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarged Screenshot Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomedImage}
            alt="Enlarged Bug Screenshot"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Safe Storage Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              onClick={() => !cleaningStorage && setShowCleanupModal(false)}
              disabled={cleaningStorage}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Storage & Screenshot Cleanup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage disk space from student bug report attachments
                </p>
              </div>
            </div>

            {/* Zero Question Loss Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 mb-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-black text-[13px] text-emerald-700 dark:text-emerald-300">
                    Zero Question Loss Guarantee (Savollar 100% Xavfsiz)
                  </p>
                  <p className="text-emerald-700/90 dark:text-emerald-300/90">
                    Tozalash tugmasi bazadagi <strong>hech qanday SAT savoli, to'g'ri javob, tushuntirish yoki testlarni O'CHIRMAYDI</strong>. Fixed bo'lgan savollar test bankida to'liq saqlanib qoladi. Faqat eskirgan bug hisobotlari va diskdagi rasmlar tozalanadi.
                  </p>
                </div>
              </div>
            </div>

            {/* Database history purge option */}
            <div className="mb-4">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-[#1f1f1f] border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-[#252525] transition-colors">
                <input
                  type="checkbox"
                  checked={deleteDbRecords}
                  onChange={(e) => setDeleteDbRecords(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Purge resolved bug records from database (Tarixni ham tozalash)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {storageMetrics?.resolvedReportsCount || 0} tickets
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Hal qilingan buglar yozuvlarini ham bazadan o'chiradi va ma'lumotlar bazasi xotirasini bo'shatadi. Ochiq (hal qilinmagan) shikoyatlar saqlanadi.
                  </p>
                </div>
              </label>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1c1c1c] border border-slate-200/80 dark:border-white/5 text-xs mb-5">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Disk Screenshots Usage:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {storageMetrics?.totalFormatted || "0 B"} ({storageMetrics?.totalFiles || 0} files)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Open Bug Reports:</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />{" "}
                  {storageMetrics?.openReportsCount ?? 1} Preserved & Protected
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Cleanable Disk Space:</span>
                <span className="font-bold text-rose-500 dark:text-rose-400">
                  {storageMetrics?.cleanableFormatted || "0 B"} ({storageMetrics?.cleanableCount || 0} files)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Cleanable Database History:</span>
                <span className="font-black text-rose-500 dark:text-rose-400">
                  {deleteDbRecords
                    ? `${storageMetrics?.resolvedReportsCount || 0} resolved tickets`
                    : "Skip DB (keep history)"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCleanupModal(false)}
                disabled={cleaningStorage}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              {(storageMetrics?.cleanableCount || 0) > 0 ||
              (deleteDbRecords && (storageMetrics?.resolvedReportsCount || 0) > 0) ? (
                <button
                  type="button"
                  onClick={handleExecuteCleanup}
                  disabled={cleaningStorage}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {cleaningStorage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cleaning storage...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {deleteDbRecords && (storageMetrics?.resolvedReportsCount || 0) > 0
                        ? `Purge ${storageMetrics?.resolvedReportsCount} Records & Files Safely`
                        : `Clean ${storageMetrics?.cleanableFormatted || "Storage"} Safely`}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCleanupModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Storage Already Clean
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
