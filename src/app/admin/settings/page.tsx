import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";

export default async function AdminSettingsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Settings"
      breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure your education center
          </p>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="md:col-span-1">
            <SettingsSidebar />
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <GeneralSettings />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
