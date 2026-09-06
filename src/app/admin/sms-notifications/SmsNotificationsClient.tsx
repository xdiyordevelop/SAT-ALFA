"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import {
  sendTestResultNotification,
  sendProgressUpdateNotification,
  getSmsNotifications,
} from "@/server/actions/sms.actions";

interface SmsNotification {
  id: string;
  message: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  parentGuardian: { fullName: string; phone: string };
  student: { firstName: string; lastName: string };
  mockTest: { testName: string } | null;
}

interface SmsNotificationsClientProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function SmsNotificationsClient({
  userRole = "ADMIN",
  userName = "Admin",
  userEmail = "admin@satalfa.uz",
}: SmsNotificationsClientProps) {
  const [notifications, setNotifications] = useState<SmsNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const result = await getSmsNotifications();
      if (result.error) {
        setError(result.error);
      } else {
        const notifications = (result.notifications || []).map((n: any) => ({
          ...n,
          sentAt: n.sentAt instanceof Date ? n.sentAt.toISOString() : n.sentAt,
          createdAt:
            n.createdAt instanceof Date
              ? n.createdAt.toISOString()
              : n.createdAt,
        }));
        setNotifications(notifications);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestResultNotification = async (mockTestId: string) => {
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const result = await sendTestResultNotification(mockTestId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("SMS notification sent successfully!");
        setTimeout(() => fetchNotifications(), 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send notification",
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendProgressNotification = async (studentId: string) => {
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const result = await sendProgressUpdateNotification(studentId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(
          `SMS sent! Average: {result.stats?.averageScore}%, Improvement: +{result.stats?.improvement}%`,
        );
        setTimeout(() => fetchNotifications(), 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send notification",
      );
    } finally {
      setSending(false);
    }
  };

  const sentCount = notifications.filter((n) => n.status === "SENT").length;
  const failedCount = notifications.filter((n) => n.status === "FAILED").length;
  const pendingCount = notifications.filter(
    (n) => n.status === "PENDING",
  ).length;

  return (
    <AdminLayout
      title="SMS Notifications"
      breadcrumbs={[{ label: "Admin" }, { label: "SMS Notifications" }]}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
    >
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Parent Notifications
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Send SMS updates to parents about student progress
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sent
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {sentCount}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                    {pendingCount}
                  </p>
                </div>
                <MessageSquare className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Failed
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {failedCount}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/10 ">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                      Parent
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 ">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-600 dark:text-slate-400 "
                      >
                        Loading notifications...
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-600 dark:text-slate-400 "
                      >
                        No notifications yet
                      </td>
                    </tr>
                  ) : (
                    notifications.map((notification) => (
                      <tr
                        key={notification.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white ">
                              {notification.parentGuardian.fullName}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 ">
                              {notification.parentGuardian.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900 dark:text-white ">
                            {notification.student.firstName}{" "}
                            {notification.student.lastName}
                          </p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {notification.message}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold {
 notification.status === "SENT"
 ? "bg-green-100 text-green-700 "
 : notification.status === "FAILED"
 ? "bg-red-100 text-red-700 "
 : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 "
 }`}
                          >
                            {notification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 ">
                          {notification.sentAt
                            ? new Date(notification.sentAt).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </AdminLayout>
  );
}
