import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import ProctorDashboardClient from "./ProctorDashboardClient";

export default async function ProctorPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <Sidebar username={session.username} role={session.role} />
      <div className="flex flex-col min-h-screen">
        <Topbar
          title="Jonli Nazorat"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Mock Imtihonlar" },
            { label: "Jonli Nazorat" },
          ]}
          userName={session.username}
          userEmail={session.username || ""}
          userRole={session.role}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col w-full">
          <ProctorDashboardClient />
        </main>
      </div>
    </div>
  );
}
