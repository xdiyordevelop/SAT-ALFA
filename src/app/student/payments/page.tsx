import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import { StudentPaymentsContent } from "@/components/student/StudentPaymentsContent";

export default async function StudentPaymentsPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!student) {
    redirect("/login");
  }

  const rawPayments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  const payments = rawPayments.map((p) => ({
    id: p.id,
    amountPaid: p.amountPaid,
    month: p.month,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    notes: p.notes ?? undefined,
  }));

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return (
    <StudentLayout
      title="My Payments"
      breadcrumbs={[{ label: "Student" }, { label: "Payments" }]}
      userName={`${student.firstName} ${student.lastName}`}
      userEmail={user?.username}
    >
      <StudentPaymentsContent student={student} payments={payments} />
    </StudentLayout>
  );
}
