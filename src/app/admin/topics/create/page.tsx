import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import CreateTopicClient from "./CreateTopicClient";

export default async function CreateTopicPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Curriculum Restricted"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Topics", href: "/admin/topics" },
          { label: "Create" },
        ]}
        userName={session.username}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Curriculum Authoring Restricted"
          message="Creating syllabus topics and course materials is restricted to Teachers and Super Administrators."
          requiredRole="Super Admin or Teacher"
        />
      </AdminLayout>
    );
  }

  return (
    <CreateTopicClient
      username={session.username}
      role={session.role}
    />
  );
}
