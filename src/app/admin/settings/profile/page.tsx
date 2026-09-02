import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { ProfileSettings } from "@/components/admin/settings/ProfileSettings";

export default async function ProfileSettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-64">
        <Topbar
          title="Profile Settings"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Settings" },
            { label: "Profile" },
          ]}
        />

        <main className="pt-24 px-6 pb-12">
          <div className="max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <SettingsSidebar />
              </div>
              <div className="md:col-span-3">
                <ProfileSettings />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
