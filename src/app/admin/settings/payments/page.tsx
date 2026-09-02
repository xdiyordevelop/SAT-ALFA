import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";

export default async function PaymentsSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar username={session.username} role={session.role} />
      <div className="lg:ml-64">
        <Topbar
          title="Payment Settings"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Settings" },
            { label: "Payments" },
          ]}
        />
        <main className="pt-24 px-6 pb-12">
          <div className="max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <SettingsSidebar />
              </div>
              <div className="md:col-span-3">
                <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                    Payment Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                        Default Monthly Fee
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white ">
                        500,000 UZS
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                        Currency
                      </p>
                      <p className="text-lg text-slate-900 dark:text-white ">
                        UZS
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 ">
                        Grace Period
                      </p>
                      <p className="text-lg text-slate-900 dark:text-white ">
                        0 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
