import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  const { id } = await params;
  const student = await prisma.studentProfile.findUnique({ where: { id } });
  if (!student) {
    notFound();
  }
  const user = await prisma.user.findUnique({ where: { id: student.userId } });
  const payments = await prisma.payment.findMany({
    where: { studentId: id },
    orderBy: { createdAt: "desc" },
  }); // Fetch approved tests for metrics (same as student dashboard);
  const approvedTests = await getApprovedTestsForStudent(id); // Fetch pending tests for review section
  const pendingTests = await getPendingTestsForStudent(id); // Calculate metrics from approved tests
  const metrics = await calculateDashboardMetrics(id);
  const attendance = await prisma.attendance.findMany({
    where: { studentId: id },
    orderBy: { date: "desc" },
  });
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      {" "}
      <Sidebar username={session.username} role={session.role} />{" "}
      <div className="lg:ml-64">
        {" "}
        <Topbar
          title="Student Details"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Students", href: "/admin/students" },
            { label: `${student.firstName} ${student.lastName}` },
          ]}
        />{" "}
        <main className="pt-24 px-6 pb-12">
          {" "}
          <StudentDetailContent
            student={student}
            user={user}
            payments={payments}
            approvedTests={approvedTests}
            pendingTests={pendingTests}
            metrics={metrics}
            attendance={attendance}
          />{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
