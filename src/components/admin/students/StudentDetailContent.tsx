"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Edit,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface StudentDetailContentProps {
  student: any;
  user: any;
  payments: any[];
  approvedTests: any[];
  pendingTests: any[];
  metrics: any;
  attendance: any[];
}

export function StudentDetailContent({
  student,
  user,
  payments,
  approvedTests,
  pendingTests,
  metrics,
  attendance,
}: StudentDetailContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "dashboard", label: "Dashboard" },
    { id: "attendance", label: "Attendance" },
    { id: "payments", label: "Payments" },
    { id: "tests", label: "Test Results" },
  ];

  const handleApprove = async (testId: string) => {
    setApprovingId(testId);
    try {
      const response = await fetch(`/api/admin/mock-tests/${testId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to approve test");
      window.location.reload();
    } catch (error) {
      console.error("Error approving test:", error);
      setApprovingId(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Student Information"],
      ["First Name", student.firstName],
      ["Last Name", student.lastName],
      ["Email", user?.username],
      ["Phone", student.phone],
      ["Status", student.status],
      [
        "Enrollment Date",
        new Date(student.enrollmentDate).toLocaleDateString(),
      ],
      [],
      ["Test Results"],
      ["Test Name", "Score", "Date"],
      ...approvedTests.map((test) => [
        test.testName,
        `${test.totalScore || test.score}/1600`,
        new Date(test.createdAt).toLocaleDateString(),
      ]),
      [],
      ["Payments"],
      ["Month", "Amount Paid", "Date"],
      ...payments.map((p) => [
        p.month,
        p.amountPaid,
        new Date(p.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.firstName}_${student.lastName}_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-slate-900 dark:text-white font-bold text-2xl flex-shrink-0">
            {student.firstName.charAt(0).toUpperCase()}
            {student.lastName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {student.firstName} {student.lastName}
            </h1>
            <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-400 ">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user?.username}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{student.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined {new Date(student.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Latest Score
            </p>
            <TrendingUp className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white ">
            {metrics.latestScore !== null ? metrics.latestScore : "—"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            out of 1600
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Highest Score
            </p>
            <TrendingUp className="w-5 h-5 text-green-600 " />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white ">
            {metrics.highestScore !== null ? metrics.highestScore : "—"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            best performance
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Total Tests
            </p>
            <TrendingUp className="w-5 h-5 text-yellow-600 " />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white ">
            {metrics.totalTests}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            approved tests
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Pending Review
            </p>
            <AlertCircle className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white ">
            {pendingTests.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            awaiting approval
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[#131313] rounded-t-2xl border-t border-l border-r border-slate-200 dark:border-white/10 p-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors {
 activeTab === tab.id
 ? "text-slate-900 dark:text-yellow-500 border-b-2 border-yellow-600 "
 : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white "
 }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-[#131313] rounded-b-2xl border-b border-l border-r border-slate-200 dark:border-white/10 p-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    First Name
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white ">
                    {student.firstName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Last Name
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white ">
                    {student.lastName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Email
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white ">
                    {user?.username}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Phone
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white ">
                    {student.phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {pendingTests.length > 0 && (
              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-yellow-200 rounded-xl p-6">
                <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Pending Reviews ({pendingTests.length})
                </h4>
                <div className="space-y-3">
                  {pendingTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-[#131313] rounded-lg border border-yellow-200 "
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white ">
                          {test.testName}
                        </p>
                        <div className="flex gap-4 mt-1 text-sm">
                          {test.mathScore && (
                            <span>Math: {test.mathScore}</span>
                          )}
                          {test.englishScore && (
                            <span>English: {test.englishScore}</span>
                          )}
                          {test.totalScore && (
                            <span className="font-bold text-slate-900 dark:text-yellow-500">
                              Total: {test.totalScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/mock-tests/pending/${test.id}`}
                          className="px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-semibold hover:bg-slate-50 dark:bg-[#0a0a0a] "
                        >
                          Review
                        </Link>
                        <button
                          onClick={() => handleApprove(test.id)}
                          disabled={approvingId !== null}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-400 text-slate-900 dark:text-white rounded-lg font-medium text-xs shadow-sm"
                        >
                          {approvingId === test.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {approvedTests.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Approved Tests
                </h4>
                <div className="space-y-3">
                  {approvedTests.map((test) => (
                    <Link
                      key={test.id}
                      href={`/admin/mock-tests/results/${test.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors block"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white ">
                          {test.testName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-yellow-500 ">
                            {test.totalScore || test.score}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            / 1600
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-yellow-500 ">
                          View →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Attendance Records
            </h3>
            {attendance.length > 0 ? (
              <div className="space-y-3">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/10 "
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white ">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 ">
                        {record.note || "No notes"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold {
 record.status === "PRESENT"
 ? "bg-green-100 text-green-700 "
 : "bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300"
 }`}
                    >
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No attendance records
              </p>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Payment History
            </h3>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/10 "
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white ">
                        {payment.amountPaid?.toLocaleString() || 0} so'm
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        For {payment.month} -{" "}
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${payment.status === "PAID" ? "text-green-600 " : payment.status === "PARTIAL" ? "text-yellow-500" : "text-red-500"}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No payments recorded
              </p>
            )}
          </div>
        )}

        {activeTab === "tests" && (
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              Test Results
            </h3>
            {approvedTests.length > 0 ? (
              <div className="space-y-3">
                {approvedTests.map((test) => (
                  <Link
                    key={test.id}
                    href={`/admin/mock-tests/results/${test.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors block"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white ">
                        {test.testName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {test.subject} - {test.duration} minutes
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-yellow-500 ">
                          {test.totalScore || test.score}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          / 1600
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-yellow-500 ">
                        View Result →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No test results found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-[#0a0a0a]/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Edit Student Information
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Edit functionality will be implemented with a form. For now, you
              can manage student info from the students list page.
            </p>
            <button
              onClick={() => setShowEditModal(false)}
              className="w-full px-4 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
