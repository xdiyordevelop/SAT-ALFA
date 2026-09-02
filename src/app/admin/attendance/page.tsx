import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Calendar, Users, TrendingUp, Clock, AlertCircle } from "lucide-react";

export default async function AttendancePage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Get today's attendance stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendance = await prisma.attendance.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const stats = {
    present: todayAttendance.filter((a) => a.status === "PRESENT").length,
    absent: todayAttendance.filter((a) => a.status === "ABSENT").length,
    late: todayAttendance.filter((a) => a.status === "LATE").length,
    excused: todayAttendance.filter((a) => a.status === "EXCUSED").length,
    total: todayAttendance.length,
  };

  const percentage =
    stats.total > 0
      ? Math.round(((stats.present + stats.late) / stats.total) * 100)
      : 0;

  // Get recent attendance records
  const recentAttendance = await prisma.attendance.findMany({
    take: 10,
    orderBy: { date: "desc" },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      group: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-64">
        <Topbar
          title="Attendance"
          breadcrumbs={[{ label: "Admin" }, { label: "Attendance" }]}
        />

        <main className="pt-24 px-6 pb-12">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Attendance Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 ">
              Track and manage student attendance records
            </p>
          </div>

          {/* Action Button */}
          <div className="mb-6 animate-slide-up">
            <Link
              href="/admin/attendance/mark"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-slate-900 rounded-lg font-medium transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Mark Attendance
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                  Attendance %
                </p>
                <TrendingUp className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white ">
                {percentage}%
              </p>
            </div>

            <div
              className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up"
              style={{ animation: "slideUp 0.5s ease-out 100ms backwards" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                  Present
                </p>
                <Users className="w-5 h-5 text-green-600 " />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white ">
                {stats.present}
              </p>
            </div>

            <div
              className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up"
              style={{ animation: "slideUp 0.5s ease-out 200ms backwards" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                  Absent
                </p>
                <AlertCircle className="w-5 h-5 text-red-600 " />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white ">
                {stats.absent}
              </p>
            </div>

            <div
              className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up"
              style={{ animation: "slideUp 0.5s ease-out 300ms backwards" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                  Late
                </p>
                <Clock className="w-5 h-5 text-slate-900 dark:text-yellow-500 " />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white ">
                {stats.late}
              </p>
            </div>

            <div
              className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-slide-up"
              style={{ animation: "slideUp 0.5s ease-out 400ms backwards" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                  Excused
                </p>
                <Users className="w-5 h-5 text-blue-600 " />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white ">
                {stats.excused}
              </p>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 ">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
                Recent Attendance Records
              </h3>
            </div>

            {recentAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] ">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                        Group
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white ">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map((record, index) => {
                      const statusColors = {
                        PRESENT: "bg-green-100 text-green-700 ",
                        ABSENT: "bg-red-100 text-red-700 ",
                        LATE: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 ",
                        EXCUSED: "bg-blue-100 text-blue-700 ",
                      };

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-colors"
                          style={{
                            animation: `slideUp 0.3s ease-out {100 + index * 30}ms backwards`,
                          }}
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900 dark:text-white ">
                              {record.student.firstName}{" "}
                              {record.student.lastName}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-600 dark:text-slate-400 ">
                              {record.group?.name || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-600 dark:text-slate-400 ">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold {
 statusColors[record.status as keyof typeof statusColors]
 }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-slate-500 dark:text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  No attendance records yet
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
