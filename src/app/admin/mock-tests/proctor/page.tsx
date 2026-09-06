import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import ProctorDashboardClient from "./ProctorDashboardClient";

export default async function ProctorPage() {
  const session = await getSession();
  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Mock Tests" },
          { label: "Proctoring" },
        ]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Exam Proctoring Restricted"
          message="Live examination proctoring and test room administration are restricted to Teachers and Administrators."
          requiredRole="Teacher or Admin"
        />
      </AdminLayout>
    );
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
