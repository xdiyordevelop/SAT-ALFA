import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { CheckCircle } from "lucide-react";

export default async function SystemSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <AdminLayout
      title="System Settings"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Settings" },
        { label: "System" },
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
              System Information
            </h3>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-lg">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Application Version
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white ">
                  1.0.0
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Database Status
                  </p>
                  <p className="text-slate-900 dark:text-white ">
                    PostgreSQL Connected
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600 " />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-lg">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Next.js Version
                </p>
                <p className="text-slate-900 dark:text-white ">16.3.0</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-lg">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Environment
                </p>
                <p className="text-slate-900 dark:text-white ">
                  Development
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-lg">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Last Updated
                </p>
                <p className="text-slate-900 dark:text-white ">
                  August 15, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
