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
    include: {
      group: true,
    },
  });

  if (!student) {
    redirect("/login");
  }

  const rawPayments = await prisma.payment.findMany({
    where: { studentId: student.id },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          monthlyFee: true,
        },
      },
    },
    orderBy: [{ month: "desc" }, { createdAt: "desc" }],
  });

  const payments = rawPayments.map((p) => ({
    id: p.id,
    amountPaid: p.amountPaid,
    month: p.month,
    status: p.status,
    notes: p.notes ?? null,
    paidAt: (p.paidAt || p.createdAt).toISOString(),
    createdAt: p.createdAt.toISOString(),
    groupId: p.groupId,
    groupName: p.group?.name || student.group?.name || "Standard Group",
    groupMonthlyFee:
      p.group?.monthlyFee ?? student.group?.monthlyFee ?? student.monthlyFee ?? 0,
  }));

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  // Calculate current month financial status
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthlyFee =
    student.group?.monthlyFee ?? (student.monthlyFee ? Number(student.monthlyFee) : 0);

  const currentMonthPayment = payments.find((p) => p.month === currentMonth);
  const currentMonthPaid = currentMonthPayment ? currentMonthPayment.amountPaid : 0;
  const currentMonthDebt = Math.max(0, currentMonthlyFee - currentMonthPaid);

  let currentMonthStatus = "UNPAID";
  if (currentMonthlyFee === 0 || currentMonthPaid >= currentMonthlyFee) {
    currentMonthStatus = "PAID";
  } else if (currentMonthPaid > 0) {
    currentMonthStatus = "PARTIAL";
  }

  // Total lifetime paid
  const totalLifetimePaid = payments.reduce(
    (sum, p) => sum + (p.amountPaid || 0),
    0
  );

  return (
    <StudentLayout
      title="My Payments"
      breadcrumbs={[{ label: "Student" }, { label: "Payments" }]}
      userName={`${student.firstName} ${student.lastName}`}
      userEmail={user?.username}
    >
      <StudentPaymentsContent
        student={student}
        payments={payments}
        financialSummary={{
          currentMonth,
          currentMonthlyFee,
          currentMonthPaid,
          currentMonthDebt,
          currentMonthStatus,
          totalLifetimePaid,
        }}
      />
    </StudentLayout>
  );
}
