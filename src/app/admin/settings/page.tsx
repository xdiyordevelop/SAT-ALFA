import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { AdminSettingsClient } from "@/components/admin/settings/AdminSettingsClient";
import { getDefaultSettings } from "@/server/actions/settings.actions";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    return (
      <AdminLayout
        title="Settings Restricted"
        breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="System Settings Restricted"
          message="Configuring center branding, features, and platform-wide settings is restricted to Super Administrators."
          requiredRole="Super Admin"
        />
      </AdminLayout>
    );
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab =
    resolvedParams.tab === "profile" ||
    resolvedParams.tab === "academic" ||
    resolvedParams.tab === "team"
      ? (resolvedParams.tab as any)
      : "credentials";

  const defaultSettings = await getDefaultSettings();

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
            System Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Configure root administrative credentials, education center branding, and platform examination rules.
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
            <AdminSettingsClient
              key={initialTab}
              currentUsername={session.username}
              userRole={session.role}
              defaultSettings={defaultSettings}
              initialTab={initialTab}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
