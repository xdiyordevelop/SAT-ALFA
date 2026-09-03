"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Eye,
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface AdminMockTestsViewProps {
  allTests: any[];
  initialTab?: "results" | "templates";
}

export function AdminMockTestsView({
  allTests,
  initialTab = "results",
}: AdminMockTestsViewProps) {
  const [activeTab, setActiveTab] = useState<"results" | "templates">(
    initialTab,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");

  // Partition tests
  const approvedResults = allTests.filter(
    (t) => t.studentId && t.status === "CONFIRMED",
  );

  const testTemplates = allTests.filter((t) => !t.studentId);

  // Overall Statistics
  const totalSubmissions = approvedResults.length;
  const approvedScores = approvedResults
    .map((t) => t.totalScore || t.score || 0)
    .filter((s) => s > 0);
  const averageSatScore =
    approvedScores.length > 0
      ? Math.round(
          approvedScores.reduce((a, b) => a + b, 0) / approvedScores.length,
        )
      : 0;

  // Filter list based on search and subject
  const filterList = (list: any[]) => {
    return list.filter((test) => {
      const studentName =
        `${test.student?.firstName || ""} {test.student?.lastName || ""}`.toLowerCase();
      const username = (test.student?.user?.username || "").toLowerCase();
      const testName = (test.testName || "").toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        studentName.includes(q) ||
        username.includes(q) ||
        testName.includes(q);

      const matchesSubject =
        subjectFilter === "ALL" ||
        test.subject?.toUpperCase() === subjectFilter ||
        (subjectFilter === "MATH" &&
          test.subject?.toLowerCase().includes("math")) ||
        (subjectFilter === "ENGLISH" &&
          (test.subject?.toLowerCase().includes("english") ||
            test.subject?.toLowerCase().includes("reading")));

      return matchesSearch && matchesSubject;
    });
  };

  const filteredApproved = filterList(approvedResults);
  const filteredTemplates = filterList(testTemplates);

  return (
    <div className="space-y-8">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Mock Tests Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 ">
            Review student mock test submissions, approve scores, and manage SAT
            practice tests.
          </p>
        </div>
        <Link
          href="/admin/mock-tests/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-yellow-600 hover:bg-yellow-700 text-slate-900 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Create Practice Test
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Approved Results */}
        <div
          onClick={() => setActiveTab("results")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer {
 activeTab === "results"
 ? "border-yellow-600 bg-white dark:bg-[#131313] shadow-md ring-2 ring-yellow-500/20"
 : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:border-neutral-300 "
 }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Student Results
            </span>
            <div className="p-2 rounded-xl bg-green-100 text-green-600 ">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {approvedResults.length}
          </p>
          <p className="text-xs text-green-600 font-medium">
            Approved & visible to students
          </p>
        </div>

        {/* Average SAT Score */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Avg. SAT Score
            </span>
            <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-slate-900 dark:text-yellow-500 ">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-yellow-500 mb-1">
            {averageSatScore || "—"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 ">
            From {approvedResults.length} approved tests
          </p>
        </div>

        {/* Test Templates */}
        <div
          onClick={() => setActiveTab("templates")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer {
 activeTab === "templates"
 ? "border-yellow-600 bg-white dark:bg-[#131313] shadow-md ring-2 ring-yellow-500/20"
 : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:border-neutral-300 "
 }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Test Templates
            </span>
            <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-slate-900 dark:text-yellow-500 ">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {testTemplates.length}
          </p>
          <p className="text-xs text-slate-900 dark:text-yellow-500 font-medium">
            Available practice tests
          </p>
        </div>
      </div>

      {/* Tabs & Search / Filter Controls */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 {
 activeTab === "templates"
 ? "bg-white dark:bg-[#131313] text-slate-900 dark:text-white shadow-sm"
 : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-[#1c1b1b] "
 }`}
            >
              <Brain className="w-4 h-4" />
              Practice Tests ({testTemplates.length})
            </button>
          </div>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, username, or test title..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white placeholder-neutral-400 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition-all"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition-all"
          >
            <option value="ALL">All Subjects</option>
            <option value="COMBINED">Combined SAT</option>
            <option value="MATH">Math</option>
            <option value="ENGLISH">Reading & Writing</option>
          </select>
        </div>
      </div>

      {/* TAB 1: STUDENT RESULTS (APPROVED) */}
      {activeTab === "results" && (
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          {filteredApproved.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Mock Test</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total Score</th>
                    <th className="px-6 py-4">Math</th>
                    <th className="px-6 py-4">Reading & Writing</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {filteredApproved.map((test) => {
                    const score = test.totalScore || test.score || 0;
                    return (
                      <tr
                        key={test.id}
                        className="hover:bg-slate-50 dark:bg-[#0a0a0a]/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white ">
                              {test.student?.firstName} {test.student?.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 ">
                              @{test.student?.user?.username || "student"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200 ">
                            {test.testName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 ">
                            {test.source === "STUDENT_UPLOADED"
                              ? "Bluebook Report"
                              : "Online Test"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-slate-900 dark:text-yellow-500 text-base">
                            {score}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {" "}
                            / 1600
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 ">
                          {test.mathScore || "—"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 ">
                          {test.englishScore || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 ">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/mock-tests/results/${test.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] hover:bg-yellow-100 dark:bg-yellow-900/30 text-slate-900 dark:text-yellow-500 font-medium text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Result
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1c1b1b] flex items-center justify-center mx-auto mb-4 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                No Approved Results Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                {searchQuery
                  ? "No approved test results match your search query."
                  : "Approved student test submissions will appear here once reviewed."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEST TEMPLATES */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                let questionsCount = 0;
                try {
                  questionsCount = JSON.parse(template.questions).length;
                } catch {
                  questionsCount = 0;
                }

                return (
                  <div
                    key={template.id}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] space-y-4 hover:border-yellow-300 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 uppercase tracking-wider">
                          {template.subject}
                        </span>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-2">
                          {template.testName}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {template.description ||
                        "Practice SAT test with timed questions and AI score evaluation."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs text-slate-500 dark:text-slate-400 ">
                      <div>
                        Questions:{" "}
                        <strong className="text-slate-800 dark:text-slate-200 ">
                          {questionsCount}
                        </strong>
                      </div>
                      <div>
                        Duration:{" "}
                        <strong className="text-slate-800 dark:text-slate-200 ">
                          {template.duration} min
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/admin/mock-tests/${template.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1c1b1b] hover:bg-neutral-200 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Template Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 p-6 bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 ">
              <Brain className="w-12 h-12 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                No Test Templates Created Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Create full-length SAT practice tests that students can take
                online.
              </p>
              <Link
                href="/admin/mock-tests/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-slate-900 rounded-xl text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Practice Test
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
