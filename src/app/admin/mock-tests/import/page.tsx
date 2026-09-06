import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestImporterContent } from "./content";

export default async function AdminTestImporterPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Import Tests Restricted"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Mock Tests", href: "/admin/mock-tests" },
          { label: "Import" },
        ]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Exam Import Restricted"
          message="Importing test question banks and answer keys is restricted to Teachers and Super Administrators."
          requiredRole="Super Admin or Teacher"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Import SAT Tests"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Import" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="max-w-6xl">
        <Link
          href="/admin/mock-tests/create"
          className="inline-flex items-center gap-2 text-slate-900 dark:text-[#EBFF00] hover:text-[#d9ff00] font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Test Creation Hub
        </Link>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                AI SAT Mock Test Importer
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Automatically extract questions, passages, math formulas, and visual diagrams from SAT test PDFs with interactive verification.
              </p>
            </div>

            <TestImporterContent />
      </div>
    </AdminLayout>
  );
}
