import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import { ProctoredControlRoom } from "./ProctoredControlRoom";
import { ProctorSessionWorkspace } from "./components/ProctorSessionWorkspace";
import { getProctoredSessionCohortAnalytics } from "@/server/actions/proctor-analytics";
import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";

interface ProctoredControlPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ProctoredControlPage({
  params,
}: ProctoredControlPageProps) {
  const session = await getSession(); // Verify staff access
  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[{ label: "Admin" }, { label: "Proctor Control" }]}
        userName={session.username || "Admin"}
        userEmail={session.username || "admin@satalfa.uz"}
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

  const { sessionId } = await params;
  const proctoredSession = await prisma.proctoredSession.findUnique({
    where: { id: sessionId },
    include: {
      participants: {
        orderBy: { createdAt: "asc" },
      },
      satTest: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!proctoredSession) {
    return (
      <AdminLayout
        title="Proctor Control"
        breadcrumbs={[{ label: "Admin" }, { label: "Proctor Control" }]}
        userName={session.username || "Admin"}
        userEmail={session.username || "admin@satalfa.uz"}
        userRole={session.role}
      >
        <div className="text-center py-16">
          <p className="text-red-600 dark:text-red-400 text-lg font-bold">
            Session Not Found
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            The requested proctored exam session could not be found or has expired.
          </p>
          <Link
            href="/admin/mock-tests/proctor"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proctor Hub
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Proctor Control Room"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Proctoring", href: "/admin/mock-tests/proctor" },
        { label: proctoredSession.satTest.name },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      {/* Back link & Room Header */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/admin/mock-tests/proctor"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#EBFF00] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Proctor Sessions
          </Link>

          {/* Session Status Pill */}
          <div className="flex items-center gap-2">
            {proctoredSession.status === "ACTIVE" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                SESSION LIVE
              </span>
            ) : proctoredSession.status === "COMPLETED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                COMPLETED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
                CANCELLED
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#EBFF00] tracking-tight">
            {proctoredSession.satTest.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Session started{" "}
            {new Date(proctoredSession.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* Proctor Workspace with Live Monitor & Cohort Analytics Tabs */}
      <SessionWorkspaceWrapper
        sessionId={sessionId}
        initialSession={proctoredSession as any}
        adminUsername={session.username}
      />
    </AdminLayout>
  );
}

async function SessionWorkspaceWrapper({
  sessionId,
  initialSession,
  adminUsername,
}: {
  sessionId: string;
  initialSession: any;
  adminUsername: string;
}) {
  const cohortResult = await getProctoredSessionCohortAnalytics(sessionId);
  return (
    <ProctorSessionWorkspace
      sessionId={sessionId}
      initialSession={initialSession}
      adminUsername={adminUsername}
      cohortData={cohortResult.success && cohortResult.data ? cohortResult.data : null}
    />
  );
}
