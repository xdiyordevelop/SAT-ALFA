import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";

export default async function AttendanceSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <AdminLayout
      title="Attendance Settings"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Settings" },
        { label: "Attendance" },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SettingsSidebar />
        </div>
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Attendance Configuration
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Late Threshold: 15 minutes
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Enable LATE Status: Yes
            </p>
            <p className="text-slate-600 dark:text-slate-400 ">
              Enable EXCUSED Status: Yes
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
