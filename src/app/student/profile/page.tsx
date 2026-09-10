import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import { StudentProfileContent } from "@/components/student/StudentProfileContent";

export default async function StudentProfilePage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
    include: {
      group: true,
      testAttempts: {
        where: { completedAt: { not: null } },
        select: {
          id: true,
          totalScore: true,
          rwScore: true,
          mathScore: true,
          completedAt: true,
        },
        orderBy: { completedAt: "desc" },
      },
      attendance: {
        select: {
          id: true,
          status: true,
          date: true,
        },
      },
    },
  });

  if (!student) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  // Calculate academic stats
  const completedAttempts = student.testAttempts || [];
  const validScores = completedAttempts
    .map((a) => a.totalScore)
    .filter((s): s is number => s !== null && s !== undefined);
  const bestScore = validScores.length > 0 ? Math.max(...validScores) : null;
  const latestScore = validScores.length > 0 ? validScores[0] : null;

  const totalAttendance = student.attendance?.length || 0;
  const presentAttendance = student.attendance?.filter((a) => a.status === "PRESENT").length || 0;
  const attendancePercentage =
    totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : null;

  const serializedStudent = {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    phone: student.phone,
    enrollmentDate: student.enrollmentDate.toISOString(),
    status: student.status,
    monthlyFee: student.monthlyFee,
    paid: student.paid,
    debt: student.debt,
    createdAt: student.createdAt.toISOString(),
    stats: {
      totalTestsTaken: completedAttempts.length,
      bestScore,
      latestScore,
      attendancePercentage,
      totalAttendanceDays: totalAttendance,
      presentDays: presentAttendance,
    },
  };

  const serializedGroup = student.group
    ? {
        id: student.group.id,
        name: student.group.name,
        course: student.group.course ?? undefined,
        subject: student.group.subject ?? undefined,
        teacher: student.group.teacher ?? undefined,
        classroom: student.group.classroom ?? undefined,
        schedule: student.group.schedule ?? undefined,
      }
    : null;

  return (
    <StudentLayout
      title="My Profile"
      breadcrumbs={[{ label: "Student", href: "/student/dashboard" }, { label: "Profile" }]}
      userName={`${student.firstName} ${student.lastName}`}
      userEmail={user?.username}
    >
      <StudentProfileContent
        student={serializedStudent}
        user={user ? { username: user.username, createdAt: user.createdAt.toISOString() } : null}
        group={serializedGroup}
      />
    </StudentLayout>
  );
}
