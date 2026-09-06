"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  PenTool,
  BookOpen,
  FileText,
  CreditCard,
  Clock,
  Sparkles,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  Inbox,
  Loader2,
} from "lucide-react";
import {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  StudentNotificationItem,
  NotificationType,
} from "@/server/actions/notification.actions";

function formatTimeAgo(date: Date | string): string {
  const now = Date.now();
  const diff = Math.floor((now - new Date(date).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "MOCK_TEST":
      return {
        icon: PenTool,
        bg: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      };
    case "RESULT":
      return {
        icon: CheckCircle2,
        bg: "bg-[#EBFF00]/10 text-[#EBFF00] border border-[#EBFF00]/20",
      };
    case "LESSON":
      return {
        icon: BookOpen,
        bg: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
      };
    case "ARTICLE":
      return {
        icon: FileText,
        bg: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
      };
    case "PAYMENT":
      return {
        icon: CreditCard,
        bg: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      };
    case "ATTENDANCE":
      return {
        icon: Clock,
        bg: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      };
    default:
      return {
        icon: Sparkles,
        bg: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
      };
  }
}

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const res = await getStudentNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    }
  };

  const handleItemClick = async (notif: StudentNotificationItem) => {
    if (!notif.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationAsRead(notif.id).catch(console.error);
    }

    setIsOpen(false);

    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);

    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Open notifications"
        className={`p-2 rounded-xl border transition-all relative flex-shrink-0 ${
          isOpen
            ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border-slate-300 dark:border-white/20"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border-transparent"
        }`}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#131313] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 px-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-[#EBFF00]/15 text-[#EBFF00] border border-[#EBFF00]/25 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#EBFF00] flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[26rem] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              <div className="p-8 flex items-center justify-center text-slate-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#EBFF00]" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                  You&apos;ll be notified about mock tests, new lessons, and scores here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const { icon: Icon, bg } = getNotificationIcon(notif.type);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer flex items-start gap-3 relative ${
                      !notif.isRead
                        ? "bg-[#EBFF00]/[0.03] dark:bg-[#EBFF00]/[0.02]"
                        : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs truncate ${!notif.isRead ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EBFF00] hover:underline pt-0.5">
                          <span>View details</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[#EBFF00] shrink-0 mt-1.5 shadow-[0_0_6px_#EBFF00]" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(
                  pathname?.startsWith("/student")
                    ? "/student/notifications"
                    : "/admin/notifications"
                );
              }}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-[#EBFF00] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View all notifications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
