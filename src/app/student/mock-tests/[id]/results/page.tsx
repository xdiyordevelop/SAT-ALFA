import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ResultsDashboard } from "./ResultsDashboard";
import { AIAnalysisLoader } from "./AIAnalysisLoader";

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { attemptId?: string };
}) {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/auth/login");
  }

  // Get student profile
  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!student) {
    redirect("/student/dashboard");
  }

  const { id: testId } = params;
  const { attemptId } = searchParams;

  // Fetch attempt
  let attempt;
  if (attemptId) {
    attempt = await prisma.studentTestAttempt.findUnique({
      where: {
        id: attemptId,
        studentId: student.id,
        satTestId: testId,
      },
      include: {
        satTest: true,
      },
    });
  } else {
    attempt = await prisma.studentTestAttempt.findFirst({
      where: {
        studentId: student.id,
        satTestId: testId,
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
      include: {
        satTest: true,
      },
    });
  }
  if (!attempt) {
    notFound();
  }

  // Fetch all questions for this test to build full review
  const questions = await prisma.sATQuestion.findMany({
    where: { satTestId: testId },
    orderBy: [{ module: "asc" }, { questionNumber: "asc" }],
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] print:bg-white dark:bg-[#131313] text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 print:py-0 print:px-0">
        <ResultsDashboard
          attempt={attempt}
          questions={questions}
          student={student}
        />
      </div>
    </div>
  );
}
