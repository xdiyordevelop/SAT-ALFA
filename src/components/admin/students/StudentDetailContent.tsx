"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Edit,
  Download,
  TrendingUp,
  Award,
  BookOpen,
  Calculator,
  BarChart3,
  Clock,
  ArrowRight,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { updateStudent, deleteStudent, changePassword } from "@/server/actions/student.actions";

interface StudentDetailContentProps {
  student: any;
  user: any;
  groups?: any[];
  payments: any[];
  approvedTests: any[];
  pendingTests?: any[];
  metrics: any;
  attendance: any[];
  canManagePayments?: boolean;
}

export function StudentDetailContent({
  student,
  user,
  groups = [],
  payments,
  approvedTests,
  metrics,
  attendance,
  canManagePayments = true,
}: StudentDetailContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit state
  const [editForm, setEditForm] = useState({
    firstName: student.firstName || "",
    lastName: student.lastName || "",
    username: user?.username || "",
    phone: student.phone || "",
    password: "",
    groupId: student.groupId || "",
    status: student.status || "ACTIVE",
    parentName: student.parent?.fullName || "",
    parentPhone: student.parent?.phone || "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Quick Reset Password state
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [showResetPassInput, setShowResetPassInput] = useState(false);
  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [resetPassError, setResetPassError] = useState("");
  const [resetPassSuccess, setResetPassSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGeneratePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setNewResetPassword(`sat${randomDigits}!`);
    setShowResetPassInput(true);
    setCopied(false);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPassError("");
    setResetPassSuccess("");

    if (!newResetPassword || newResetPassword.trim().length < 6) {
      setResetPassError("Password must be at least 6 characters long.");
      return;
    }

    setResetPassLoading(true);
    try {
      const res = await changePassword(student.id, newResetPassword.trim());
      setResetPassSuccess(res?.message || "Password updated successfully!");
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(newResetPassword.trim());
        setCopied(true);
      }
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setResetPassError(err.message || "Failed to reset password.");
    } finally {
      setResetPassLoading(false);
    }
  };

  // Auto-open edit modal if ?edit=true in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "true") {
        setShowEditModal(true);
      }
    }
  }, []);

  const resetEditForm = () => {
    setEditForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      username: user?.username || "",
      phone: student.phone || "",
      password: "",
      groupId: student.groupId || "",
      status: student.status || "ACTIVE",
      parentName: student.parent?.fullName || "",
      parentPhone: student.parent?.phone || "",
    });
    setEditError("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
        throw new Error("First name and Last name are required");
      }
      if (!editForm.username.trim()) {
        throw new Error("Username is required");
      }
      if (!editForm.phone.trim()) {
        throw new Error("Phone number is required");
      }
      if (editForm.password && editForm.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      await updateStudent(student.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        username: editForm.username.trim(),
        phone: editForm.phone.trim(),
        password: editForm.password || undefined,
        groupId: editForm.groupId || null,
        status: editForm.status,
        parentName: editForm.parentName?.trim() || undefined,
        parentPhone: editForm.parentPhone?.trim() || undefined,
      });

      setShowEditModal(false);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message || "Failed to update student");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteStudent(student.id);
      setShowDeleteModal(false);
      router.push("/admin/students");
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete student");
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "dashboard", label: "Dashboard" },
    { id: "tests", label: "Test Results" },
    { id: "attendance", label: "Attendance" },
    ...(canManagePayments ? [{ id: "payments", label: "Payments" }] : []),
  ];

  const mathScores = approvedTests
    .map((t) => t.mathScore)
    .filter((s): s is number => typeof s === "number" && s > 0);
  const avgMath = mathScores.length
    ? Math.round(mathScores.reduce((a, b) => a + b, 0) / mathScores.length)
    : null;

  const rwScores = approvedTests
    .map((t) => t.englishScore)
    .filter((s): s is number => typeof s === "number" && s > 0);
  const avgRw = rwScores.length
    ? Math.round(rwScores.reduce((a, b) => a + b, 0) / rwScores.length)
    : null;

  const scoreTrend = metrics.scoreTrend || [];
  const scoreImprovement =
    scoreTrend.length >= 2
      ? scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score
      : null;

  const handleExport = () => {
    const formatCell = (val: any) =>
      `"${String(val ?? "").replace(/"/g, '""')}"`;

    const formatUZS = (num: number) => num.toLocaleString() + " UZS";

    const totalPaidSum = payments.reduce(
      (sum: number, p: any) => sum + (p.amountPaid || 0),
      0
    );

    const rows: (string | number)[][] = [
      ["============================================================"],
      ["STUDENT COMPREHENSIVE REPORT"],
      ["Generated At", new Date().toLocaleString()],
      ["============================================================"],
      [],
      ["--- 1. PERSONAL INFORMATION ---"],
      ["Student ID", student.id],
      ["Full Name", `${student.firstName} ${student.lastName}`],
      ["Username / Login", user?.username || "—"],
      ["Phone Number", student.phone || "—"],
      ["Account Status", student.status],
      ["Assigned Group", student.group?.name || "None"],
      [
        "Enrollment Date",
        student.enrollmentDate
          ? new Date(student.enrollmentDate).toLocaleDateString()
          : "—",
      ],
      ["Registered Date", new Date(student.createdAt).toLocaleDateString()],
      [],
      ["--- 2. PARENT / GUARDIAN CONTACT ---"],
      ["Parent Full Name", student.parent?.fullName || "—"],
      ["Parent Phone", student.parent?.phone || "—"],
      [],
      ["--- 3. PERFORMANCE & ACADEMIC SUMMARY ---"],
      ["Total Completed Tests", metrics.totalTests || approvedTests.length],
      [
        "Latest SAT Score",
        metrics.latestScore !== null ? `${metrics.latestScore}/1600` : "—",
      ],
      [
        "Highest SAT Score",
        metrics.highestScore !== null ? `${metrics.highestScore}/1600` : "—",
      ],
      [
        "Average SAT Score",
        metrics.averageScore !== null ? `${metrics.averageScore}/1600` : "—",
      ],
      ["Math Average", avgMath !== null ? `${avgMath}/800` : "—"],
      ["Reading & Writing Average", avgRw !== null ? `${avgRw}/800` : "—"],
      [
        "Score Improvement",
        scoreImprovement !== null
          ? `${scoreImprovement > 0 ? "+" : ""}${scoreImprovement} pts`
          : "—",
      ],
      ["Total Payments Made", formatUZS(totalPaidSum)],
      ["Total Attendance Records", attendance.length],
      [],
      ["--- 4. TEST RESULTS HISTORY ---"],
      [
        "#",
        "Test Name",
        "Total Score (/1600)",
        "Math Score (/800)",
        "Reading & Writing (/800)",
        "Completion Date",
      ],
      ...approvedTests.map((test, index) => [
        index + 1,
        test.testName || "Mock Test",
        test.totalScore || test.score || "—",
        test.mathScore != null ? test.mathScore : "—",
        test.englishScore != null ? test.englishScore : "—",
        new Date(test.createdAt).toLocaleDateString(),
      ]),
      ...(canManagePayments
        ? [
            [],
            ["--- 5. PAYMENT HISTORY ---"],
            ["#", "Billing Month", "Amount Paid", "Date Recorded", "Notes"],
            ...payments.map((p, index) => [
              index + 1,
              p.month,
              formatUZS(p.amountPaid || 0),
              new Date(p.createdAt).toLocaleDateString(),
              p.notes || "—",
            ]),
          ]
        : []),
      [],
      ["--- 6. ATTENDANCE LOG ---"],
      ["#", "Date", "Status", "Notes"],
      ...attendance.map((a, index) => [
        index + 1,
        new Date(a.date).toLocaleDateString(),
        a.status,
        a.note || "—",
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map(formatCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.firstName}_${student.lastName}_full_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-slate-700 dark:text-[#EBFF00] hover:text-slate-950 dark:hover:text-[#d9ff00] mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#EBFF00] text-slate-950 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg shadow-[#EBFF00]/10">
            {student.firstName.charAt(0).toUpperCase()}
            {student.lastName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {student.firstName} {student.lastName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider ${
                  student.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : student.status === "BLOCKED"
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                }`}
              >
                {student.status}
              </span>
              {student.group && (
                <span className="px-2.5 py-0.5 bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/20 rounded-md text-xs font-bold">
                  {student.group.name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>@{user?.username}</span>
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

          <div className="flex flex-wrap items-center gap-3">
            {canManagePayments && (
              <>
                <button
                  onClick={() => {
                    setNewResetPassword("");
                    setResetPassError("");
                    setResetPassSuccess("");
                    setCopied(false);
                    setShowResetPasswordModal(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    resetEditForm();
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Student
                </button>
                <button
                  onClick={() => {
                    setDeleteError("");
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors flex items-center gap-2"
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
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Latest Score
            </p>
            <TrendingUp className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {metrics.latestScore !== null ? metrics.latestScore : "—"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            out of 1600
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Highest Score
            </p>
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {metrics.highestScore !== null ? metrics.highestScore : "—"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            best performance
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Score
            </p>
            <BarChart3 className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {metrics.averageScore !== null ? metrics.averageScore : "—"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            overall average
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Tests
            </p>
            <TrendingUp className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {metrics.totalTests}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            completed tests
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
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "text-slate-950 dark:text-[#EBFF00] border-b-2 border-[#EBFF00] font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    First Name
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student.firstName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Last Name
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student.lastName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Login (Username / Email)
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white font-mono">
                      {user?.username ? `@${user.username}` : "—"}
                    </p>
                  </div>
                  {canManagePayments && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewResetPassword("");
                        setResetPassError("");
                        setResetPassSuccess("");
                        setCopied(false);
                        setShowResetPasswordModal(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 border border-amber-500/30"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Phone
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student.phone || "—"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Assigned Group
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student.group?.name || "No group assigned"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Account Status
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student.status}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Parent / Guardian
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student.parent?.fullName || "—"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-4 border border-slate-200/60 dark:border-white/5">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Parent Phone
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {student.parent?.phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Section Breakdown Cards */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                SAT Section Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Math Section Card */}
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          Math Section
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Algebra, Advanced Math, Problem-Solving, Geometry
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-[#EBFF00]">
                      {metrics.latestMathScore !== null ? metrics.latestMathScore : "—"}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> / 800</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Score Progress</span>
                      <span>{metrics.latestMathScore ? `${Math.round((metrics.latestMathScore / 800) * 100)}%` : "0%"}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#EBFF00] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((metrics.latestMathScore || 0) / 800) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
                    <span>Average Math Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {avgMath !== null ? `${avgMath} / 800` : "—"}
                    </span>
                  </div>
                </div>

                {/* Reading & Writing Section Card */}
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          Reading & Writing (R&W)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Information & Ideas, Craft & Structure, Expression
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-[#EBFF00]">
                      {metrics.latestEnglishScore !== null ? metrics.latestEnglishScore : "—"}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> / 800</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Score Progress</span>
                      <span>{metrics.latestEnglishScore ? `${Math.round((metrics.latestEnglishScore / 800) * 100)}%` : "0%"}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#EBFF00] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((metrics.latestEnglishScore || 0) / 800) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
                    <span>Average R&W Score</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {avgRw !== null ? `${avgRw} / 800` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Progression & Trend */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Score Progression & Growth
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Chronological score timeline across all completed mock tests
                  </p>
                </div>
                {scoreImprovement !== null && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      scoreImprovement >= 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-[#EBFF00] border border-emerald-500/20 dark:border-[#EBFF00]/30"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {scoreImprovement >= 0 ? `+${scoreImprovement}` : scoreImprovement} pts total improvement
                  </span>
                )}
              </div>

              {scoreTrend.length > 0 ? (
                <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
                  {scoreTrend.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] flex items-center justify-center text-xs font-bold shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {item.testName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          {item.mathScore > 0 && (
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1c1b1b]">
                              Math: <strong className="text-slate-900 dark:text-white">{item.mathScore}</strong>
                            </span>
                          )}
                          {item.englishScore > 0 && (
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1c1b1b]">
                              R&W: <strong className="text-slate-900 dark:text-white">{item.englishScore}</strong>
                            </span>
                          )}
                        </div>

                        <div className="text-right min-w-[90px]">
                          <p className="text-lg font-bold text-slate-900 dark:text-[#EBFF00]">
                            {item.score}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            / 1600
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10">
                  No score history available yet.
                </p>
              )}
            </div>

            {/* Link to Test Results tab */}
            {approvedTests.length > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab("tests")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#EBFF00] hover:underline"
                >
                  View full test history and answers review ({approvedTests.length} tests) →
                </button>
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === "PRESENT"
                          ? "bg-green-100 text-green-700"
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
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/10"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {payment.amountPaid?.toLocaleString() || 0} UZS
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        For {payment.month} -{" "}
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`font-semibold ${
                        payment.status === "PAID"
                          ? "text-green-600"
                          : payment.status === "PARTIAL"
                          ? "text-slate-900 dark:text-[#EBFF00]"
                          : "text-red-500"
                      }`}
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
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Completed Mock Tests
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Full records of Digital SAT tests taken with question-by-question review
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1c1b1b] font-semibold text-slate-700 dark:text-slate-300">
                {approvedTests.length} {approvedTests.length === 1 ? "test" : "tests"}
              </span>
            </div>

            {approvedTests.length > 0 ? (
              <div className="space-y-3">
                {approvedTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:border-[#EBFF00]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00]">
                          {test.subject || "Digital SAT"}
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white text-base">
                          {test.testName}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {test.duration || 134} minutes
                        </span>
                        {test.mathScore != null && (
                          <>
                            <span>•</span>
                            <span>Math: <strong className="text-slate-700 dark:text-slate-300">{test.mathScore}/800</strong></span>
                          </>
                        )}
                        {test.englishScore != null && (
                          <>
                            <span>•</span>
                            <span>R&W: <strong className="text-slate-700 dark:text-slate-300">{test.englishScore}/800</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-5 justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-[#EBFF00]">
                          {test.totalScore || test.score}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          / 1600
                        </p>
                      </div>

                      <Link
                        href={`/admin/mock-tests/results/${test.id}`}
                        className="px-4 py-2 rounded-lg bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        View Result
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-white/10">
                No test results recorded for this student yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 max-w-2xl w-full shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Edit Student Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Update personal information, credentials, group, and parent contacts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {editError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Personal Information */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleEditChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Account & Login */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Account & Login
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Username / Email *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleEditChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        New Password (optional)
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Leave empty to keep current password"
                        value={editForm.password}
                        onChange={handleEditChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Only enter a password if you want to reset this student's login password (minimum 6 characters).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group & Status */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Academic & Status
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Assigned Group
                      </label>
                      <select
                        name="groupId"
                        value={editForm.groupId}
                        onChange={handleEditChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      >
                        <option value="">No Group (Unassigned)</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Account Status
                      </label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Parent / Guardian Information */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Parent / Guardian (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Parent Full Name
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        value={editForm.parentName}
                        onChange={handleEditChange}
                        placeholder="e.g. Otaboyev Anvar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Parent Phone
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        value={editForm.parentPhone}
                        onChange={handleEditChange}
                        placeholder="+998901234567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 flex gap-3 shrink-0 bg-slate-50/50 dark:bg-[#0f0f0f]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-bold transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-slide-up text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Delete Student Account?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900 dark:text-white">
                {student.firstName} {student.lastName}
              </strong>{" "}
              ({user?.username ? `@${user.username}` : "student"})? This will remove all their test attempts, payments, attendance records, and login credentials. This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleteLoading ? "Deleting..." : "Yes, Delete Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Reset Student Password
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {student.firstName} {student.lastName} (@{user?.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {resetPassError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetPassError}</span>
                </div>
              )}

              {resetPassSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{resetPassSuccess}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New Password (min 6 chars) *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs font-bold text-[#EBFF00] hover:underline"
                  >
                    + Auto-generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassInput ? "text" : "password"}
                    value={newResetPassword}
                    onChange={(e) => {
                      setNewResetPassword(e.target.value);
                      setCopied(false);
                    }}
                    placeholder="Enter new password"
                    required
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#EBFF00] focus:ring-1 focus:ring-[#EBFF00] text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassInput(!showResetPassInput)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showResetPassInput ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {copied && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Password copied to clipboard! You can send it to the student.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  disabled={resetPassLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPassLoading || !newResetPassword}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  {resetPassLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{resetPassLoading ? "Resetting..." : "Save & Copy"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
