"use client";

import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note?: string;
}

interface StudentAttendanceContentProps {
  attendance: AttendanceRecord[];
}

export function StudentAttendanceContent({
  attendance,
}: StudentAttendanceContentProps) {
  // Calculate stats
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;
  const excused = attendance.filter((a) => a.status === "EXCUSED").length;
  const total = attendance.length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  // Group by month for monthly breakdown
  const monthlyData: { [key: string]: { present: number; total: number } } = {};
  attendance.forEach((record) => {
    const date = new Date(record.date);
    const month = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    if (!monthlyData[month]) {
      monthlyData[month] = { present: 0, total: 0 };
    }
    monthlyData[month].total++;
    if (record.status === "PRESENT") {
      monthlyData[month].present++;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-700 ";
      case "ABSENT":
        return "bg-red-100 text-red-700 ";
      case "LATE":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 ";
      case "EXCUSED":
        return "bg-blue-100 text-blue-700 ";
      default:
        return "bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 ";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle2 className="w-4 h-4" />;
      case "ABSENT":
        return <XCircle className="w-4 h-4" />;
      case "LATE":
        return <Clock className="w-4 h-4" />;
      case "EXCUSED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Attendance
        </h1>
        <p className="text-slate-600 dark:text-slate-400 ">
          Track your class attendance and performance
        </p>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Attendance Rate
            </p>
            <CheckCircle2 className="w-4 h-4 text-green-600 " />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white ">
            {attendanceRate}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            of total sessions
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Present
            </p>
            <CheckCircle2 className="w-4 h-4 text-green-600 " />
          </div>
          <p className="text-3xl font-bold text-green-600 ">{present}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            sessions attended
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Late
            </p>
            <Clock className="w-4 h-4 text-slate-900 dark:text-yellow-500 " />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-yellow-500 ">
            {late}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            times late
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Excused
            </p>
            <AlertCircle className="w-4 h-4 text-blue-600 " />
          </div>
          <p className="text-3xl font-bold text-blue-600 ">{excused}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            excused absences
          </p>
        </div>

        <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
              Absent
            </p>
            <XCircle className="w-4 h-4 text-red-600 " />
          </div>
          <p className="text-3xl font-bold text-red-600 ">{absent}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            unexcused absences
          </p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {Object.keys(monthlyData).length > 0 && (
        <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Monthly Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(monthlyData).map(([month, data]) => {
              const rate = Math.round((data.present / data.total) * 100);
              return (
                <div key={month} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white ">
                        {month}
                      </p>
                      <span className="text-sm text-slate-600 dark:text-slate-400 ">
                        {data.present}/{data.total}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 w-12 text-right">
                    {rate}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Attendance Records
        </h3>
        {attendance.length > 0 ? (
          <div className="space-y-3">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`p-2 rounded-lg ${getStatusColor(record.status)}`}
                  >
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white ">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {record.note && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {record.note}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold {getStatusColor(
 record.status
 )}`}
                >
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-slate-500 dark:text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 ">
              No attendance records yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
