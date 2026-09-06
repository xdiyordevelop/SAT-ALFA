"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  BookOpen,
  PenTool,
  CreditCard,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  Inbox,
  Search,
} from "lucide-react";
import {
  StudentNotificationItem,
  NotificationType,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/server/actions/notification.actions";

interface StudentNotificationsClientProps {
  initialNotifications: StudentNotificationItem[];
  initialUnreadCount: number;
}

function formatTimeAgo(date: Date | string): string {
  const now = Date.now();
  const diff = Math.floor((now - new Date(date).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case "MOCK_TEST":
      return {
        icon: PenTool,
        bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        label: "Mock Test",
      };
    case "RESULT":
      return {
        icon: CheckCircle2,
        bg: "bg-[#EBFF00]/10 text-[#EBFF00] border-[#EBFF00]/20",
        label: "Score Result",
      };
    case "LESSON":
      return {
        icon: BookOpen,
        bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        label: "Lesson",
      };
    case "ARTICLE":
      return {
        icon: FileText,
        bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "Article",
      };
    case "PAYMENT":
      return {
        icon: CreditCard,
        bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Payment",
      };
    case "ATTENDANCE":
      return {
        icon: Clock,
        bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Attendance",
      };
    default:
      return {
        icon: Sparkles,
        bg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "Announcement",
      };
  }
}

export function StudentNotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: StudentNotificationsClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    startTransition(async () => {
      await markAllNotificationsAsRead();
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = notifications.find((n) => n.id === id);
    if (item && !item.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    startTransition(async () => {
      await deleteNotification(id);
    });
  };

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));

    startTransition(async () => {
      await clearAllNotifications(true);
    });
  };

  const handleItemClick = (notif: StudentNotificationItem) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Filtering
  const filteredList = notifications.filter((n) => {
    // Filter by type or unread
    if (selectedFilter === "UNREAD" && n.isRead) return false;
    if (selectedFilter !== "ALL" && selectedFilter !== "UNREAD" && n.type !== selectedFilter) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      return matchTitle || matchMsg;
    }

    return true;
  });

  const filterTabs = [
    { key: "ALL", label: "All" },
    { key: "UNREAD", label: `Unread (${unreadCount})` },
    { key: "MOCK_TEST", label: "Mock Tests" },
    { key: "RESULT", label: "Results" },
    { key: "LESSON", label: "Lessons" },
    { key: "PAYMENT", label: "Payments" },
    { key: "ATTENDANCE", label: "Attendance" },
    { key: "ANNOUNCEMENT", label: "Announcements" },
    { key: "ARTICLE", label: "Articles" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center text-[#EBFF00]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EBFF00] text-black shadow-sm">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Updates on lessons, tuition payments, attendance records, and mock test scores.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-bold transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#EBFF00]" />
              <span>Mark all as read</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearRead}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-rose-400 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedFilter === tab.key
                  ? "bg-[#EBFF00] text-black shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              No notifications found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              You will receive updates about your classes, mock test scores, and announcements here.
            </p>
          </div>
        ) : (
          filteredList.map((notif) => {
            const visuals = getNotificationVisuals(notif.type);
            const Icon = visuals.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 relative ${
                  !notif.isRead
                    ? "bg-white dark:bg-[#151515] border-[#EBFF00]/40 shadow-sm"
                    : "bg-white/80 dark:bg-[#111] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                {/* Category Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${visuals.bg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${visuals.bg}`}
                      >
                        {visuals.label}
                      </span>
                      <h3
                        className={`text-sm ${
                          !notif.isRead
                            ? "font-black text-slate-900 dark:text-white"
                            : "font-semibold text-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {notif.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </span>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(notif.id, e)}
                        title="Delete notification"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EBFF00] hover:underline">
                        <span>View details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EBFF00] shrink-0 mt-2 shadow-[0_0_8px_#EBFF00]" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
