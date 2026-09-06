import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminMockTestsView } from "@/components/admin/mock-tests/AdminMockTestsView";

export default async function AdminMockTestResultsPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  const [mockTests, satAttempts] = await Promise.all([
    prisma.mockTest.findMany({
      include: {
        student: {
          include: {
            user: true,
            group: true,
          },
        },
        performances: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.studentTestAttempt.findMany({
      where: {
        completedAt: { not: null },
      },
      include: {
        student: {
          include: {
            user: true,
            group: true,
          },
        },
        satTest: {
          select: { id: true, name: true },
        },
      },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const normalizedAttempts = satAttempts.map((a) => ({
    id: a.id,
    studentId: a.studentId,
    testName: a.satTest?.name || "Digital SAT Mock Test",
    subject: "Digital SAT",
    status: "CONFIRMED",
    totalScore: a.totalScore,
    score: a.totalScore,
    mathScore: a.mathScore,
    englishScore: a.rwScore,
    student: a.student,
    performances: [],
    createdAt: a.completedAt || a.createdAt,
  }));

  const allTests = [...normalizedAttempts, ...mockTests];

  return (
    <AdminLayout
      title="Student Results"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests", href: "/admin/mock-tests" },
        { label: "Results" },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      <AdminMockTestsView allTests={allTests} initialTab="results" />
    </AdminLayout>
  );
}
