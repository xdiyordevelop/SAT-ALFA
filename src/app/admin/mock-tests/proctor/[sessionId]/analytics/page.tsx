import React from "react";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import { getProctoredSessionCohortAnalytics } from "@/server/actions/proctor-analytics";
import { CohortAnalyticsView } from "../components/CohortAnalyticsView";
import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";

interface CohortAnalyticsPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function CohortAnalyticsPage({
  params,
}: CohortAnalyticsPageProps) {
  const session = await getSession();
  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[{ label: "Admin" }, { label: "Cohort Analytics" }]}
        userName={session.username || "Admin"}
        userEmail={session.username || "admin@satalfa.uz"}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Analytics Restricted"
          message="Group analytics and domain breakdowns are restricted to Teachers and Administrators."
          requiredRole="Teacher or Admin"
        />
      </AdminLayout>
    );
  }

  const { sessionId } = await params;
  const result = await getProctoredSessionCohortAnalytics(sessionId);

  if (!result.success || !result.data) {
    notFound();
  }

  const cohortData = result.data;

  return (
    <AdminLayout
      title="Cohort Analytics & Domain Breakdown"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Proctoring", href: "/admin/mock-tests/proctor" },
        {
          label: cohortData.session.testName,
          href: `/admin/mock-tests/proctor/${sessionId}`,
        },
        { label: "Cohort Analytics" },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap print:hidden">
        <Link
          href={`/admin/mock-tests/proctor/${sessionId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#EBFF00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Live Proctor Room
        </Link>

        <div className="flex items-center gap-2">
          {cohortData.session.status === "ACTIVE" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
              SESSION LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              COMPLETED
            </span>
          )}
        </div>
      </div>

      <CohortAnalyticsView initialData={cohortData} sessionId={sessionId} />
    </AdminLayout>
  );
}
