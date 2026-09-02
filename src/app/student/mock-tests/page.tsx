import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-72 flex flex-col min-h-screen">
        <Topbar
          title="Mock Tests"
          breadcrumbs={[{ label: "Talaba" }, { label: "Mock Imtihonlar" }]}
          userName={`${student.firstName} ${student.lastName}`}
          userEmail={session.username || ""}
          userRole={session.role}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <StudentMockTestsHub
            availableTests={availableTests}
            completedAttempts={completedAttempts}
            highestScore={highestScore}
          />
        </main>
      </div>
    </div>
  );
}
