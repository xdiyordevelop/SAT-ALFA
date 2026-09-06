import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { canManageAcademics, isStaff } from "@/lib/permissions/auth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { ArticleImportClient } from "./ArticleImportClient";

export default async function ImportArticlePage() {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Articles", href: "/admin/articles" },
          { label: "Import" },
        ]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Curriculum Content Restricted"
          message="Importing educational articles and reading materials is restricted to Teachers and Administrators."
          requiredRole="Teacher or Admin"
        />
      </AdminLayout>
    );
  }

  return (
    <ArticleImportClient
      userRole={session.role}
      userName={session.username}
      userEmail={session.username || "admin@satalfa.uz"}
    />
  );
}
