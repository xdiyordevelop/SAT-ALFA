"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Trophy,
  PenTool,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Edit2,
  ChevronRight,
  KeyRound,
  FileCheck2,
  ArrowRight,
  Check,
} from "lucide-react";

interface StudentStats {
  totalTestsTaken: number;
  bestScore: number | null;
  latestScore: number | null;
  attendancePercentage: number | null;
  totalAttendanceDays: number;
  presentDays: number;
}

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  enrollmentDate: string;
  status: string;
  monthlyFee?: number;
  paid?: number;
  debt?: number;
  createdAt: string;
  stats?: StudentStats;
}

interface UserData {
  username: string;
  createdAt?: string;
}

interface Group {
  id: string;
  name: string;
  course?: string;
  subject?: string;
  teacher?: string;
  classroom?: string;
  schedule?: string;
}

interface StudentProfileContentProps {
  student: StudentProfile;
  user: UserData | null;
  group: Group | null;
}

export function StudentProfileContent({
  student,
  user,
  group,
}: StudentProfileContentProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "contact" | "security" | "billing">("overview");

  // Phone edit state
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(student.phone || "");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Message alert
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const stats = student.stats || {
    totalTestsTaken: 0,
    bestScore: null,
    latestScore: null,
    attendancePercentage: null,
    totalAttendanceDays: 0,
    presentDays: 0,
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) {
      setMessage({ type: "error", text: "Phone number cannot be empty." });
      return;
    }

    setPhoneLoading(true);
    try {
      const response = await fetch("/api/student/profile/phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update phone number");
      }

      student.phone = newPhone.trim();
      setMessage({
        type: "success",
        text: "Phone number updated successfully!",
      });
      setEditingPhone(false);
      setTimeout(() => setMessage(null), 3500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error updating phone number.",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/student/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setMessage({
        type: "success",
        text: "Password changed successfully! Keep your new credentials safe.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(null), 3500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error changing password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase() || "S";

  return (
    <div className="space-y-8 pb-12">
      {/* Toast / Message Notification */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 shadow-lg ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <p className="text-sm font-semibold flex-1">{message.text}</p>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#141414] to-slate-950 border-2 border-slate-200/20 dark:border-white/10 hover:border-[#EBFF00]/40 p-6 sm:p-8 relative overflow-hidden shadow-2xl transition-all">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EBFF00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 sm:gap-8">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-700 ring-4 ring-[#EBFF00]/40 flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-2xl tracking-wider select-none">
                <span className="text-[#EBFF00] drop-shadow-[0_2px_10px_rgba(235,255,0,0.3)]">
                  {initials}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-slate-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {student.status || "ACTIVE"}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBFF00]/15 border border-[#EBFF00]/30 text-[#EBFF00] text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> SAT Candidate
                </span>
                {group && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                    <GraduationCap className="w-3.5 h-3.5" /> {group.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                {student.firstName} {student.lastName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-slate-400">@{user?.username}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(student.enrollmentDate).toLocaleDateString()}
                </span>
              </p>

              {/* Quick Contact Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-[#EBFF00]" />
                  {student.phone || "No phone provided"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {user?.username}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stat Cards in Hero */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm min-w-[130px] sm:min-w-[150px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5 text-[#EBFF00]" />
                Best Score
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {stats.bestScore ? (
                  <span className="text-[#EBFF00]">{stats.bestScore}</span>
                ) : (
                  <span className="text-slate-500 text-base">No Tests</span>
                )}
                <span className="text-xs font-medium text-slate-400 ml-1">/ 1600</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm min-w-[130px] sm:min-w-[150px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <PenTool className="w-3.5 h-3.5 text-blue-400" />
                Tests Taken
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {stats.totalTestsTaken}
                <span className="text-xs font-medium text-slate-400 ml-1">completed</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm min-w-[130px] sm:min-w-[150px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Attendance
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {stats.attendancePercentage !== null ? (
                  <span className="text-emerald-400">{stats.attendancePercentage}%</span>
                ) : (
                  <span className="text-slate-500 text-base">100%</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm min-w-[130px] sm:min-w-[150px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                Tuition
              </div>
              <div className="text-base sm:text-lg font-black text-white truncate">
                {(student.debt ?? 0) > 0 ? (
                  <span className="text-amber-400 font-bold">Due</span>
                ) : (
                  <span className="text-emerald-400 font-bold">Settled</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-white/10">
        {[
          { id: "overview", label: "Overview & Academics", icon: User },
          { id: "contact", label: "Contact Details", icon: Phone },
          { id: "security", label: "Password & Security", icon: Lock },
          { id: "billing", label: "Tuition & Attendance", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-900 dark:bg-[#EBFF00] text-white dark:text-slate-950 shadow-md"
                  : "bg-white dark:bg-[#131313] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#EBFF00]" />
                  Personal Information
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-semibold">
                  Official Record
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    First Name
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {student.firstName}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Last Name
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {student.lastName}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Username / Login ID
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {user?.username}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Phone Number
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {student.phone || "Not specified"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Enrolled Since
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(student.enrollmentDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Enrollment Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {student.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Cohort & Group Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  Assigned Cohort & Class
                </h3>
                {group && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                    {group.name}
                  </span>
                )}
              </div>

              {group ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Course Curriculum
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {group.course || "Digital SAT Preparation"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Lead Instructor
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {group.teacher || "SAT Faculty Member"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Classroom
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {group.classroom || "Main SAT Testing Hall"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Class Schedule
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {group.schedule || "Scheduled by Academic Center"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No cohort assigned yet. Please contact your administrator.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & SAT Portal Jumpers (1 Col) */}
          <div className="space-y-4">
            {/* SAT Testing Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#181818] border border-white/10 text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#EBFF00]" />
                <h4 className="font-bold text-sm text-white">Digital SAT Readiness</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take standardized mock tests replicating the College Board Bluebook adaptive testing environment.
              </p>

              <div className="space-y-2 pt-1">
                <Link
                  href="/student/mock-tests"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-black text-xs flex items-center justify-between transition-all"
                >
                  <span>Go to Mock Tests Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/student/results"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-between transition-all"
                >
                  <span>Review Test History & Scores</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </Link>
              </div>
            </div>

            {/* Quick Security & Contact Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Account Security
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ensure your credentials are up to date and your contact information is verified.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-[#EBFF00]" />
                    Change Account Password
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT INFORMATION TAB */}
      {activeTab === "contact" && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#EBFF00]" />
                Primary Contact Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This number is used for urgent testing notifications, SMS score alerts, and live proctor communications.
              </p>
            </div>

            {/* Phone Form */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {student.phone || "Not configured"}
                  </div>
                </div>
                {!editingPhone && (
                  <button
                    type="button"
                    onClick={() => setEditingPhone(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-[#EBFF00] text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {editingPhone && (
                <form onSubmit={handleUpdatePhone} className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      New Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#181818] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#EBFF00] transition-colors"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={phoneLoading}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-[#EBFF00] hover:bg-slate-800 dark:hover:bg-[#d9ff00] text-white dark:text-slate-950 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {phoneLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhone(false);
                        setNewPhone(student.phone || "");
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Email / Username Info */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Registered Username
              </span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                {user?.username}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                Your username is unique to your SAT-ALFA account and cannot be changed by yourself. Please contact academic staff for username updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECURITY TAB */}
      {activeTab === "security" && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#EBFF00]" />
                Change Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a secure password of at least 6 characters to safeguard your exam progress and test data.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#181818] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#EBFF00] pr-11 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#181818] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#EBFF00] pr-11 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#181818] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#EBFF00] transition-colors"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-[#EBFF00] hover:bg-slate-800 dark:hover:bg-[#d9ff00] text-white dark:text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {passwordLoading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>

            {/* Security Guidelines */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Password & Live Exam Tips:
              </span>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                <li>Never share your account credentials or live test session PINs with others.</li>
                <li>Ensure you are logged in only from your active personal testing device.</li>
                <li>If you notice unauthorized test attempts, update your password immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. BILLING & ATTENDANCE TAB */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tuition Financial Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Tuition & Fees Breakdown
              </h3>
              <Link
                href="/student/payments"
                className="text-xs font-bold text-blue-600 dark:text-[#EBFF00] hover:underline flex items-center gap-1"
              >
                <span>Receipts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Monthly Tuition Rate:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {(student.monthlyFee ?? 0).toLocaleString()} UZS
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Amount Paid:
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {(student.paid ?? 0).toLocaleString()} UZS
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Outstanding Balance:
                </span>
                <span className={`text-sm font-bold ${(student.debt ?? 0) > 0 ? "text-amber-500" : "text-slate-900 dark:text-white"}`}>
                  {(student.debt ?? 0).toLocaleString()} UZS
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/student/payments"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                View Detailed Payments History
              </Link>
            </div>
          </div>

          {/* Attendance Breakdown Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Classroom Attendance
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                {stats.attendancePercentage !== null ? `${stats.attendancePercentage}% Rate` : "100% Rate"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Recorded Sessions:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {stats.totalAttendanceDays} days
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Attended / Present Days:
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.presentDays} days
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Absences:
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {Math.max(0, stats.totalAttendanceDays - stats.presentDays)} days
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
              Regular attendance is required to maintain mock testing eligibility. Consult your mentor if you have unavoidable absences.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
