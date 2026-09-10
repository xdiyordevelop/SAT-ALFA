import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import { AdminBugReportsManager } from "@/components/admin/mock-tests/AdminBugReportsManager";

export default async function AdminBugReportsPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[{ label: "Admin" }, { label: "Bug Reports" }]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Access Restricted"
          message="Viewing bug reports and AI corrections is restricted to Teachers and Administrators."
          requiredRole="Teacher or Admin"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Question Bug Reports & AI Insights"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Test Bank", href: "/admin/mock-tests" },
        { label: "Bug Reports & AI" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Question Bug Reports & AI Auto-Fix
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student-reported issues during mock exams, inspect screen captures, verify Gemini AI verdicts, and manage automated question fixes.
          </p>
        </div>

        <AdminBugReportsManager />
      </div>
    </AdminLayout>
  );
}
