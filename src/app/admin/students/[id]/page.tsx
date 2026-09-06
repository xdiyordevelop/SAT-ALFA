import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { canManagePayments } from "@/lib/permissions/auth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StudentDetailContent } from "@/components/admin/students/StudentDetailContent";
import {
  calculateDashboardMetrics,
  getApprovedTestsForStudent,
  getPendingTestsForStudent,
} from "@/lib/queries/tests";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const session = await getSession();
  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  const canManageBilling = canManagePayments(session);

  const { id } = await params;
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      group: true,
      parent: true,
    },
  });
  if (!student) {
    notFound();
  }

  const user = await prisma.user.findUnique({ where: { id: student.userId } });
  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
  });

  const payments = canManageBilling
    ? await prisma.payment.findMany({
        where: { studentId: id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const approvedTests = await getApprovedTestsForStudent(id);
  const pendingTests = await getPendingTestsForStudent(id);
  const metrics = await calculateDashboardMetrics(id);
  const attendance = await prisma.attendance.findMany({
    where: { studentId: id },
    orderBy: { date: "desc" },
  });

  return (
    <AdminLayout
      title="Student Details"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Students", href: "/admin/students" },
        { label: `${student.firstName} ${student.lastName}` },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <StudentDetailContent
        student={student}
        user={user}
        groups={groups}
        payments={payments}
        approvedTests={approvedTests}
        pendingTests={pendingTests}
        metrics={metrics}
        attendance={attendance}
        canManagePayments={canManageBilling}
      />
    </AdminLayout>
  );
}
