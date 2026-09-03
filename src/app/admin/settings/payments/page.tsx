import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";

export default async function PaymentsSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <AdminLayout
      title="Payment Settings"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Settings" },
        { label: "Payments" },
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
    </AdminLayout>
  );
}
