"use client";

import { useState } from "react";
import { Check, Loader } from "lucide-react";

export function NotificationsSettings() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    smsEnabled: true,
    parentNotificationsEnabled: true,
    attendanceNotificationsEnabled: true,
    paymentRemindersEnabled: true,
    testResultNotificationsEnabled: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 animate-slide-up">
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-3">
          <Check className="w-5 h-5" />
          Settings saved successfully
        </div>
      )}

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
        Notification Preferences
      </h3>

      <div className="space-y-4 mb-8">
        {[
          {
            key: "smsEnabled",
            label: "SMS Notifications",
            desc: "Send SMS notifications to parents",
          },
          {
            key: "parentNotificationsEnabled",
            label: "Parent Notifications",
            desc: "Notify parents about student updates",
          },
          {
            key: "attendanceNotificationsEnabled",
            label: "Attendance Notifications",
            desc: "Alert about attendance changes",
          },
          {
            key: "paymentRemindersEnabled",
            label: "Payment Reminders",
            desc: "Remind about pending payments",
          },
          {
            key: "testResultNotificationsEnabled",
            label: "Test Result Notifications",
            desc: "Notify when test results are ready",
          },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-lg"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-white ">
                {label}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 ">
                {desc}
              </p>
            </div>
            <button
              onClick={() => handleToggle(key as keyof typeof settings)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors {
 settings[key as keyof typeof settings]
 ? 'bg-green-100 text-green-700 '
 : 'bg-neutral-200 text-slate-600 dark:text-slate-400 '
 }`}
            >
              {settings[key as keyof typeof settings] ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-white/10 ">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-[#EBFF00] hover:bg-[#d9ff00] disabled:opacity-50 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ml-auto"
        >
          {loading && <Loader className="w-5 h-5 animate-spin" />}
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
