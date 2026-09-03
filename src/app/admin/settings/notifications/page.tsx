import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { NotificationsSettings } from "@/components/admin/settings/NotificationsSettings";

export default async function NotificationsSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <AdminLayout
      title="Notification Settings"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Settings" },
        { label: "Notifications" },
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
          <NotificationsSettings />
        </div>
      </div>
    </AdminLayout>
  );
}
