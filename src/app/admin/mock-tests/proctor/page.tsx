import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import ProctorDashboardClient from "./ProctorDashboardClient";

export default async function ProctorPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Live Proctoring"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Proctoring" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <ProctorDashboardClient />
    </AdminLayout>
  );
}
