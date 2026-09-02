import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { SecuritySettings } from "@/components/admin/settings/SecuritySettings";

export default async function SecuritySettingsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-64">
        <Topbar
          title="Security Settings"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Settings" },
            { label: "Security" },
          ]}
        />

        <main className="pt-24 px-6 pb-12">
          <div className="max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <SettingsSidebar />
              </div>
              <div className="md:col-span-3">
                <SecuritySettings />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
