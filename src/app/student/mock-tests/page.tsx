import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import { StudentMockTestsHub } from "./StudentMockTestsHub";

export default async function StudentMockTestsPage() {
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

  // 1. Fetch available published tests
  const availableTests = await prisma.sATMockTest.findMany({
    where: {
      status: { in: ["PUBLISHED", "published"] },
    },
    include: {
      questions: { select: { id: true } },
      studentAttempts: {
        where: { studentId: student.id },
        select: {
          id: true,
          totalScore: true,
          completedAt: true,
          mathScore: true,
          rwScore: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch completed attempts for the history tab
  const completedAttempts = await prisma.studentTestAttempt.findMany({
    where: {
      studentId: student.id,
      completedAt: { not: null },
    },
    include: {
      satTest: {
        select: { name: true },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  // Calculate highest score
  const highestScore =
    completedAttempts.length > 0
      ? Math.max(...completedAttempts.map((a) => a.totalScore || 0))
      : null;

  return (
    <StudentLayout
      title="Mock Tests"
      breadcrumbs={[{ label: "Talaba" }, { label: "Mock Imtihonlar" }]}
      userName={`${student.firstName} ${student.lastName}`}
      userEmail={session.username || ""}
    >
      <StudentMockTestsHub
        availableTests={availableTests}
        completedAttempts={completedAttempts}
        highestScore={highestScore}
      />
    </StudentLayout>
  );
}
