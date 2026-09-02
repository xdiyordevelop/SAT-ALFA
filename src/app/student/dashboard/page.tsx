import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  StudentDashboardView,
  PublishedTestItem,
  AttemptHistoryItem,
} from "@/components/student/StudentDashboardView";

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // 1. Fetch student profile and user details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  const studentEmail = user?.username || `${session.username}@student.alfa`;
  const studentName = student
    ? `${student.firstName} ${student.lastName}`.trim() || session.username
    : session.username;

  // 2. Fetch standalone published SAT mock tests for practice
  const publishedSatTests = await prisma.sATMockTest.findMany({
    where: { status: "published" },
    include: {
      questions: {
        select: {
          id: true,
          module: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const publishedTests: PublishedTestItem[] = publishedSatTests.map((t) => {
    let rw = 0,
      math = 0;
    for (const q of t.questions) {
      if (q.module === "MODULE_1" || q.module === "MODULE_2") rw++;
      else if (q.module === "MODULE_3" || q.module === "MODULE_4") math++;
    }
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      questionCount: t.questions.length,
      moduleCounts: { rw, math },
    };
  });

  // 3. Fetch student's previous test attempts (both SAT testing system & legacy)
  const studentId = student?.id || session.userId;
  const attemptsData = await prisma.studentTestAttempt.findMany({
    where: { studentId: studentId },
    include: {
      satTest: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  const attempts: AttemptHistoryItem[] = attemptsData.map((a) => ({
    id: a.id,
    testId: a.satTestId,
    testName: a.satTest.name,
    startedAt: a.startedAt.toISOString(),
    completedAt: a.completedAt ? a.completedAt.toISOString() : null,
    totalScore: a.totalScore,
    rwScore: a.rwScore,
    mathScore: a.mathScore,
  }));

  // Calculate metrics
  const scoredAttempts = attempts.filter(
    (a) => a.totalScore !== null && a.totalScore !== undefined,
  );
  const highestScore =
    scoredAttempts.length > 0
      ? Math.max(...scoredAttempts.map((a) => a.totalScore || 0))
      : 0;

  const averageScore =
    scoredAttempts.length > 0
      ? scoredAttempts.reduce((acc, a) => acc + (a.totalScore || 0), 0) /
        scoredAttempts.length
      : 0;

  const rwAvg =
    scoredAttempts.length > 0
      ? Math.round(
          scoredAttempts.reduce((acc, a) => acc + (a.rwScore || 0), 0) /
            scoredAttempts.length,
        )
      : 0;

  const mathAvg =
    scoredAttempts.length > 0
      ? Math.round(
          scoredAttempts.reduce((acc, a) => acc + (a.mathScore || 0), 0) /
            scoredAttempts.length,
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
      <Sidebar
        username={session.username || "Student"}
        role={session.role || "STUDENT"}
      />

      <div className="lg:ml-64 flex-1 min-w-0 w-full lg:w-[calc(100%-16rem)]">
        <Topbar
          title="Student Dashboard"
          breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
          userName={studentName}
          userEmail={studentEmail}
          userRole={session.role}
        />

        <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
          <StudentDashboardView
            studentName={studentName}
            studentEmail={studentEmail}
            publishedTests={publishedTests}
            attempts={attempts}
            metrics={{
              testsTaken: attempts.length,
              highestScore,
              averageScore,
              mathAvg,
              rwAvg,
            }}
          />
        </main>
      </div>
    </div>
  );
}
