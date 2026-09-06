import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import Link from "next/link";
import { Plus, FileUp } from "lucide-react";
import { AdminArticlesTable } from "@/components/admin/articles/AdminArticlesTable";

export default async function AdminArticlesPage() {
  const session = await getSession();
  if (!session || session.role === "STUDENT") redirect("/login");

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[{ label: "Admin" }, { label: "Articles" }]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Curriculum Content Restricted"
          message="Managing educational articles and reading materials is restricted to Teachers and Administrators."
          requiredRole="Teacher or Admin"
        />
      </AdminLayout>
    );
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout
      title="Articles & Reading"
      breadcrumbs={[{ label: "Admin" }, { label: "Articles" }]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Articles & Reading Room
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage SAT reading passages, strategy guides, vocabulary, and science articles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles/create"
            className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write Article
          </Link>
          <Link
            href="/admin/articles/import"
            className="flex items-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs transition-colors shadow-sm"
          >
            <FileUp className="w-4 h-4" />
            Import from PDF
          </Link>
        </div>
      </div>

      <AdminArticlesTable articles={articles} />
    </AdminLayout>
  );
}

