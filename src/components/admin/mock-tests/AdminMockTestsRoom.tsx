"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Plus,
  Play,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Radio,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  startProctorSessionAction,
  togglePublishSatTestAction,
} from "@/server/actions/proctor-actions";

export interface AdminSATTest {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  questionCount: number;
  activeSessionsCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  modulesSummary: {
    m1: number;
    m2: number;
    m3: number;
    m4: number;
  };
}

interface AdminMockTestsRoomProps {
  tests: AdminSATTest[];
}

export function AdminMockTestsRoom({
  tests: initialTests,
}: AdminMockTestsRoomProps) {
  const router = useRouter();
  const [tests, setTests] = useState<AdminSATTest[]>(initialTests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [loadingAction, setLoadingAction] = useState<{
    [id: string]: string | null;
  }>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter tests
  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.description &&
        test.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "published"
          ? test.status.toLowerCase() === "published"
          : test.status.toLowerCase() === "draft";

    return matchesSearch && matchesStatus;
  });

  // 1. Action: Start Live Proctor Session
  const handleStartProctorSession = async (testId: string) => {
    setLoadingAction((prev) => ({ ...prev, [testId]: "proctor" }));
    try {
      const result = await startProctorSessionAction(testId);
      if (result.success && result.sessionId) {
        router.push(`/admin/mock-tests/proctor/${result.sessionId}`);
      } else {
        alert(result.error || "Failed to start proctor session");
      }
    } catch (err: any) {
      alert(err.message || "Error starting proctor session");
    } finally {
      setLoadingAction((prev) => ({ ...prev, [testId]: null }));
    }
  };

  // 2. Action: Toggle Publish Status
  const handleTogglePublish = async (testId: string) => {
    setLoadingAction((prev) => ({ ...prev, [testId]: "toggle" }));
    try {
      const result = await togglePublishSatTestAction(testId);
      if (result.success && result.newStatus) {
        setTests((prev) =>
          prev.map((t) =>
            t.id === testId ? { ...t, status: result.newStatus! } : t,
          ),
        );
      } else {
        alert(result.error || "Failed to update test status");
      }
    } catch (err: any) {
      alert(err.message || "Error updating status");
    } finally {
      setLoadingAction((prev) => ({ ...prev, [testId]: null }));
    }
  };

  // 3. Action: Delete Test
  const handleDeleteTest = async (testId: string) => {
    setLoadingAction((prev) => ({ ...prev, [testId]: "delete" }));
    try {
      const response = await fetch(`/api/admin/mock-tests/${testId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete test");

      setTests((prev) => prev.filter((t) => t.id !== testId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete test");
    } finally {
      setLoadingAction((prev) => ({ ...prev, [testId]: null }));
    }
  };

  const totalPublished = tests.filter(
    (t) => t.status.toLowerCase() === "published",
  ).length;
  const totalDraft = tests.filter(
    (t) => t.status.toLowerCase() === "draft",
  ).length;
  const totalQuestions = tests.reduce((acc, t) => acc + t.questionCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Mock Tests
            </span>
            <span className="p-2 rounded-xl bg-yellow-400/10 text-slate-900 dark:text-yellow-500">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {tests.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Available in test bank
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Published Tests
            </span>
            <span className="p-2 rounded-xl bg-emerald-400/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {totalPublished}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active for students
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Drafts (In Review)
            </span>
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-[#1c1b1b] text-slate-500 dark:text-slate-400">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300 mt-2">
            {totalDraft}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hidden from students
          </div>
        </div>

        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-yellow-500">
              Total Questions
            </span>
            <span className="p-2 rounded-xl bg-yellow-400/10 text-slate-900 dark:text-yellow-500">
              <Layers className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-yellow-500 mt-2">
            {totalQuestions}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across all modules
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Import Button */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search mock tests by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap {
 statusFilter === 'all'
 ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
 : 'bg-white dark:bg-[#131313] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
 }`}
          >
            All ({tests.length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap {
 statusFilter === 'published'
 ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
 : 'bg-white dark:bg-[#131313] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
 }`}
          >
            Published ({totalPublished})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap {
 statusFilter === 'draft'
 ? 'bg-slate-700 text-slate-900 dark:text-white'
 : 'bg-white dark:bg-[#131313] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
 }`}
          >
            Drafts ({totalDraft})
          </button>
        </div>

        {/* Primary CTA: Create Mock Test */}
        <div className="w-full md:w-auto">
          <Link
            href="/admin/mock-tests/create"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-yellow-400/15 hover:shadow-yellow-400/30 transition-all text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Mock Test
          </Link>
        </div>
      </div>

      {/* Mock Tests Room List */}
      {filteredTests.length === 0 ? (
        <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-12 text-center rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-4 text-slate-900 dark:text-yellow-500">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Mock Tests Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            {searchQuery || statusFilter !== "all"
              ? "No tests match your active filter criteria. Try resetting your search."
              : "Upload a PDF exam to extract questions and build your first SAT mock test."}
          </p>
          <Link
            href="/admin/mock-tests/import"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Import New Test Now
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => {
            const isPublished = test.status.toLowerCase() === "published";
            const isActionBusy =
              loadingAction[test.id] !== null &&
              loadingAction[test.id] !== undefined;

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 hover:border-slate-200 dark:border-white/10/80 rounded-2xl p-5 transition-all shadow-md hover:shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 group"
              >
                {/* Left Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-900 dark:text-yellow-500 transition-colors truncate">
                      {test.name}
                    </h3>

                    {/* Toggle Status Pill */}
                    <button
                      onClick={() => handleTogglePublish(test.id)}
                      disabled={isActionBusy}
                      title="Click to toggle between Draft and Published"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border {
 isPublished
 ? 'bg-emerald-950/80 text-emerald-500 border-emerald-700/50 hover:bg-emerald-900/80'
 : 'bg-slate-100 dark:bg-[#1c1b1b] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-[#1c1b1b]'
 }`}
                    >
                      {loadingAction[test.id] === "toggle" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full {
 isPublished ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-yellow-500'
 }`}
                        />
                      )}
                      {isPublished ? "PUBLISHED" : "DRAFT"}
                    </button>

                    {test.activeSessionsCount > 0 && (
                      <span className="inline-flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 text-slate-900 dark:text-yellow-500 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        <Radio className="w-3 h-3 animate-pulse" />
                        {test.activeSessionsCount} Live Session
                      </span>
                    )}
                  </div>

                  {test.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 line-clamp-1">
                      {test.description}
                    </p>
                  )}

                  {/* Modules & Question Count Badges */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#131313] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                      <Layers className="w-3.5 h-3.5 text-slate-900 dark:text-yellow-500" />
                      {test.questionCount} Questions
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      •
                    </span>
                    <span>
                      RW: {test.modulesSummary.m1 + test.modulesSummary.m2} Qs |
                      Math: {test.modulesSummary.m3 + test.modulesSummary.m4} Qs
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      •
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Created: {new Date(test.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-wrap">
                  {/* Button 1: Edit Test */}
                  <Link
                    href={`/admin/mock-tests/${test.id}/edit`}
                    className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-[#1c1b1b]/90 hover:bg-slate-750 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all hover:border-yellow-400/40"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-900 dark:text-yellow-500" />
                    Edit Test
                  </Link>

                  {/* Button 2: Start Proctor Session */}
                  <button
                    onClick={() => handleStartProctorSession(test.id)}
                    disabled={isActionBusy}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-yellow-400/10 hover:shadow-yellow-400/25 transition-all disabled:opacity-50"
                  >
                    {loadingAction[test.id] === "proctor" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Radio className="w-3.5 h-3.5 fill-slate-950" />
                    )}
                    Start Live Proctor
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirmId(test.id)}
                    disabled={isActionBusy}
                    title="Delete Test"
                    className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0a0a] backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/50 border border-rose-800/40 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Mock Test?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete this test and all
                its questions? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white font-semibold flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteTest(deleteConfirmId)}
                className="bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-bold flex-1 rounded-xl"
              >
                Delete Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
