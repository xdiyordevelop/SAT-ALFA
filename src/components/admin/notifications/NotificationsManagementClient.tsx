"use client";

import React, { useState, useTransition } from "react";
import {
  Send,
  Bell,
  Users,
  GraduationCap,
  User,
  ShieldAlert,
  Sparkles,
  BookOpen,
  PenTool,
  CreditCard,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  History,
  Check,
  Search,
} from "lucide-react";
import {
  NotificationType,
  NotificationTargetType,
  sendManualNotification,
} from "@/server/actions/notification.actions";

interface NotificationsManagementClientProps {
  groups: Array<{
    id: string;
    name: string;
    studentCount: number;
  }>;
  students: Array<{
    id: string;
    userId: string | null;
    name: string;
    username: string;
    groupName: string;
  }>;
  initialHistory: Array<{
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
    recipient: {
      username: string;
      role: string;
      name: string;
    };
  }>;
}

const TEMPLATES = [
  {
    label: "📅 Class Schedule Update",
    type: "ANNOUNCEMENT" as NotificationType,
    title: "Class Schedule Change",
    message: "Dear students, please note that the upcoming class schedule has been updated. Please check your timetable and arrive on time.",
  },
  {
    label: "📝 New Mock Test Available",
    type: "MOCK_TEST" as NotificationType,
    title: "New SAT Mock Test Published",
    message: "A new SAT Mock Test has been added to the test bank. Take the test to evaluate your progress and identify areas for improvement.",
    link: "/student/mock-tests",
  },
  {
    label: "💳 Tuition Payment Reminder",
    type: "PAYMENT" as NotificationType,
    title: "Monthly Tuition Due Reminder",
    message: "Dear student, this is a friendly reminder regarding your monthly course fee. Please complete the payment to maintain active enrollment.",
    link: "/student/payments",
  },
  {
    label: "📖 New Reading Article",
    type: "ARTICLE" as NotificationType,
    title: "New Reading Article Available",
    message: "A new curated article has been published in the Reading Room. Practice your reading comprehension and expand your vocabulary!",
    link: "/student/articles",
  },
];

export function NotificationsManagementClient({
  groups,
  students,
  initialHistory,
}: NotificationsManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [targetType, setTargetType] = useState<NotificationTargetType>("ALL");
  const [targetId, setTargetId] = useState<string>("");
  const [notifType, setNotifType] = useState<NotificationType>("ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [history, setHistory] = useState(initialHistory);

  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setNotifType(tmpl.type);
    if (tmpl.link) setLink(tmpl.link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!title.trim() || !message.trim()) {
      setStatusMsg({
        type: "error",
        text: "Please provide both a title and message body.",
      });
      return;
    }

    if (targetType === "GROUP" && !targetId) {
      setStatusMsg({
        type: "error",
        text: "Please select a group.",
      });
      return;
    }

    if (targetType === "STUDENT" && !targetId) {
      setStatusMsg({
        type: "error",
        text: "Please select a student.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await sendManualNotification({
          targetType,
          targetId: targetId || undefined,
          title,
          message,
          type: notifType,
          link: link.trim() || undefined,
        });

        if (res.success) {
          setStatusMsg({
            type: "success",
            text: `Notification successfully dispatched to ${res.count} recipient(s).`,
          });
          setTitle("");
          setMessage("");
          setLink("");
        } else {
          setStatusMsg({
            type: "error",
            text: res.error || "Failed to dispatch notification.",
          });
        }
      } catch (err: any) {
        setStatusMsg({
          type: "error",
          text: err?.message || "Internal server error",
        });
      }
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.groupName.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredHistory = history.filter(
    (h) =>
      h.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      h.message.toLowerCase().includes(historySearch.toLowerCase()) ||
      h.recipient.name.toLowerCase().includes(historySearch.toLowerCase()) ||
      h.recipient.username.toLowerCase().includes(historySearch.toLowerCase())
  );

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "MOCK_TEST":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "RESULT":
        return "bg-[#EBFF00]/10 text-[#EBFF00] border-[#EBFF00]/20";
      case "LESSON":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "ARTICLE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "PAYMENT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "ATTENDANCE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#EBFF00]" />
            Notifications & Announcements Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch announcements, reminders, and targeted updates to students and staff members.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "compose"
                ? "bg-white dark:bg-[#1f1e1e] text-slate-900 dark:text-[#EBFF00] shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Notification</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-white dark:bg-[#1f1e1e] text-slate-900 dark:text-[#EBFF00] shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sent History ({history.length})</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-semibold">{statusMsg.text}</span>
        </div>
      )}

      {activeTab === "compose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  1. Target Audience
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType("ALL");
                      setTargetId("");
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      targetType === "ALL"
                        ? "bg-[#EBFF00]/10 border-[#EBFF00] text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Users className="w-4 h-4 text-[#EBFF00]" />
                      {targetType === "ALL" && <Check className="w-3.5 h-3.5 text-[#EBFF00]" />}
                    </div>
                    <span className="text-xs font-bold">All Students</span>
                    <span className="text-[10px] text-slate-500">Broadcast</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType("GROUP");
                      if (groups.length > 0 && !targetId) setTargetId(groups[0].id);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      targetType === "GROUP"
                        ? "bg-[#EBFF00]/10 border-[#EBFF00] text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      {targetType === "GROUP" && <Check className="w-3.5 h-3.5 text-[#EBFF00]" />}
                    </div>
                    <span className="text-xs font-bold">Specific Group</span>
                    <span className="text-[10px] text-slate-500">Class Cohort</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType("STUDENT");
                      if (students.length > 0 && !targetId) setTargetId(students[0].id);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      targetType === "STUDENT"
                        ? "bg-[#EBFF00]/10 border-[#EBFF00] text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <User className="w-4 h-4 text-purple-400" />
                      {targetType === "STUDENT" && <Check className="w-3.5 h-3.5 text-[#EBFF00]" />}
                    </div>
                    <span className="text-xs font-bold">Single Student</span>
                    <span className="text-[10px] text-slate-500">Direct Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType("STAFF");
                      setTargetId("");
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      targetType === "STAFF"
                        ? "bg-[#EBFF00]/10 border-[#EBFF00] text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      {targetType === "STAFF" && <Check className="w-3.5 h-3.5 text-[#EBFF00]" />}
                    </div>
                    <span className="text-xs font-bold">Staff Members</span>
                    <span className="text-[10px] text-slate-500">Teachers/Admins</span>
                  </button>
                </div>

                {/* Sub-selector for Group */}
                {targetType === "GROUP" && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Select Group:
                    </label>
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1c1b1b] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.studentCount} students)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub-selector for Student */}
                {targetType === "STUDENT" && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Select Student:
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Found: {filteredStudents.length}
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search student by name or username..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1c1b1b] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                      />
                    </div>

                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      size={4}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1c1b1b] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] custom-scrollbar"
                    >
                      {filteredStudents.map((s) => (
                        <option key={s.id} value={s.id} className="py-1.5">
                          {s.name} (@{s.username}) — {s.groupName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Notification Category / Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  2. Category & Notification Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { type: "ANNOUNCEMENT", label: "Announcement", icon: Sparkles },
                      { type: "LESSON", label: "Lesson / Topic", icon: BookOpen },
                      { type: "MOCK_TEST", label: "Mock Test", icon: PenTool },
                      { type: "PAYMENT", label: "Payment", icon: CreditCard },
                      { type: "ATTENDANCE", label: "Attendance", icon: Clock },
                      { type: "ARTICLE", label: "Article", icon: FileText },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    const active = notifType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setNotifType(item.type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          active
                            ? "bg-[#EBFF00] text-black border-[#EBFF00] shadow-sm"
                            : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Form */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Title *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Class schedule change for Saturday..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Message Body *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {message.length}/500
                    </span>
                  </div>
                  <textarea
                    required
                    maxLength={500}
                    rows={4}
                    placeholder="Enter detailed announcement or message content..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00] custom-scrollbar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Action Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="/student/mock-tests or https://..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-6 rounded-xl bg-[#EBFF00] hover:bg-[#d6e800] text-black font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Sending Notification...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Templates & Live Preview */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Templates */}
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#EBFF00]" />
                Quick Templates
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-3 rounded-xl text-left border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {tmpl.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {tmpl.message}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#EBFF00] shrink-0 ml-2">
                      Apply →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Preview (Student UI)
              </h3>
              <p className="text-[11px] text-slate-400">
                This is how the recipient will see this notification in their notification drawer:
              </p>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1c1b1b] flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${getTypeBadge(
                    notifType
                  )}`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {title || "Notification Title"}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {message || "The notification message content will appear here..."}
                  </p>
                  {link && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#EBFF00] pt-1">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-[#EBFF00] shrink-0 mt-1 shadow-[0_0_6px_#EBFF00]" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History & Logs View */
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Recently Dispatched Notifications
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, title, or username..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a1a] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Recipient</th>
                  <th className="py-3 px-3">Title & Content</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No sent notifications found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTypeBadge(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.recipient.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          @{item.recipient.username} ({item.recipient.role})
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 line-clamp-1 text-[11px]">
                          {item.message}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                        {new Date(item.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        {item.isRead ? (
                          <span className="text-emerald-400 font-bold text-[11px]">
                            Read
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">
                            Unread
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
