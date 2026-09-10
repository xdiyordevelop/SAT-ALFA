import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { canManageAcademics } from "@/lib/permissions/auth";
import {
  AdminMockTestsRoom,
  AdminSATTest,
} from "@/components/admin/mock-tests/AdminMockTestsRoom";

export default async function AdminMockTestsPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (!canManageAcademics(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[{ label: "Admin" }, { label: "Test Bank" }]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Test Bank Restricted"
          message="Managing mock tests, test questions, and exam blueprints is restricted to Teachers and Administrators."
          requiredRole="Teacher or Admin"
        />
      </AdminLayout>
    );
  }

  // Fetch all SAT Mock Tests with questions and active sessions
  const satTests = await prisma.sATMockTest.findMany({
    include: {
      questions: {
        select: {
          id: true,
          module: true,
        },
      },
      proctorSessions: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedTests: AdminSATTest[] = satTests.map((t) => {
    let m1 = 0,
      m2 = 0,
      m3 = 0,
      m4 = 0;
    for (const q of t.questions) {
      if (q.module === "MODULE_1") m1++;
      else if (q.module === "MODULE_2") m2++;
      else if (q.module === "MODULE_3") m3++;
      else if (q.module === "MODULE_4") m4++;
    }

    return {
      id: t.id,
      name: t.name,
      description: t.description,
      status: t.status,
      sourceFileUrl: t.sourceFileUrl,
      sourceFileName: t.sourceFileName,
      questionCount: t.questions.length,
      activeSessionsCount: t.proctorSessions.length,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      modulesSummary: { m1, m2, m3, m4 },
    };
  });

  return (
    <AdminLayout
      title="Test Bank"
      breadcrumbs={[{ label: "Admin" }, { label: "Test Bank" }]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            SAT Mock{" "}
            <span className="text-slate-900 dark:text-[#EBFF00]">
              Tests Room
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Manage, proctor live examination sessions, and publish digital SAT tests
          </p>
        </div>
      </div>

      <AdminMockTestsRoom tests={formattedTests} />
    </AdminLayout>
  );
}
