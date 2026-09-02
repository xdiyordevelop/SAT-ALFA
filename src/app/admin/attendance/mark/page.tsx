import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AttendanceMarkingForm } from "@/components/admin/attendance/AttendanceMarkingForm";

export default async function MarkAttendancePage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-64">
        <Topbar
          title="Mark Attendance"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Attendance", href: "/admin/attendance" },
            { label: "Mark" },
          ]}
        />

        <main className="pt-24 px-6 pb-12">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Mark Student Attendance
            </h1>
            <p className="text-slate-600 dark:text-slate-400 ">
              Record attendance for your selected group
            </p>
          </div>

          <AttendanceMarkingForm />
        </main>
      </div>
    </div>
  );
}
