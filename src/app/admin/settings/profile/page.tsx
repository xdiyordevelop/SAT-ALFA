import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { ProfileSettings } from "@/components/admin/settings/ProfileSettings";

export default async function ProfileSettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Profile Settings"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Settings" },
        { label: "Profile" },
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
          <ProfileSettings />
        </div>
      </div>
    </AdminLayout>
  );
}
