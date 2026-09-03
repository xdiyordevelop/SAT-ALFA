import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import { StudentAttendanceContent } from "@/components/student/StudentAttendanceContent";

export default async function StudentAttendancePage() {
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

  const rawAttendance = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { date: "desc" },
  });

  const attendance = rawAttendance.map((a) => ({
    id: a.id,
    date: a.date.toISOString(),
    status: a.status,
    note: a.note ?? undefined,
  }));

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return (
    <StudentLayout
      title="My Attendance"
      breadcrumbs={[{ label: "Student" }, { label: "Attendance" }]}
      userName={`${student.firstName} ${student.lastName}`}
      userEmail={user?.username}
    >
      <StudentAttendanceContent attendance={attendance} />
    </StudentLayout>
  );
}
