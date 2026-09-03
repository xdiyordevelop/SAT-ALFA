import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AttendanceMarkingForm } from "@/components/admin/attendance/AttendanceMarkingForm";

export default async function MarkAttendancePage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Mark Attendance"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Attendance", href: "/admin/attendance" },
        { label: "Mark" },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      <div className="mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
          Mark Student Attendance
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Record attendance for your selected group
        </p>
      </div>

      <AttendanceMarkingForm />
    </AdminLayout>
  );
}
