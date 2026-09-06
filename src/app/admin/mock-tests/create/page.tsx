import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import CreateMockTestClient from "./CreateMockTestClient";

export default async function CreateMockTestPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Mock Test Authoring Restricted"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Mock Tests", href: "/admin/mock-tests" },
          { label: "Create" },
        ]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Exam Creation Restricted"
          message="Creating new mock tests and configuring exam sections is restricted to Teachers and Super Administrators."
          requiredRole="Super Admin or Teacher"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Create Mock Test"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Create" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <CreateMockTestClient />
    </AdminLayout>
  );
}
