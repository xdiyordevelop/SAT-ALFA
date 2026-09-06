import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import { ArticleEditor } from "@/components/admin/articles/ArticleEditor";

export default async function CreateArticlePage() {
  const session = await getSession();
  if (!session || session.role === "STUDENT") redirect("/login");

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Articles Restricted"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Articles", href: "/admin/articles" },
          { label: "New Article" },
        ]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Article Publishing Restricted"
          message="Creating and publishing educational articles is restricted to Teachers and Super Administrators."
          requiredRole="Super Admin or Teacher"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Write Article"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Articles", href: "/admin/articles" },
        { label: "New Article" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <ArticleEditor
        initialData={{
          title: "",
          slug: "",
          category: "STRATEGY",
          summary: "",
          content: "",
          coverImage: "",
          readTimeMin: 5,
          vocabulary: [],
          published: false,
        }}
      />
    </AdminLayout>
  );
}

