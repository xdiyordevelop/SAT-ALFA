import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ResultsDashboard } from "./ResultsDashboard";
import { AIAnalysisLoader } from "./AIAnalysisLoader";
import { repairAndScoreAttempt } from "@/lib/sat/scoring";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function ResultsPage({
  params,
  searchParams,
}: ResultsPageProps) {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  // Get student profile
  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!student) {
    redirect("/login");
  }

  const { id: testId } = await params;
  const { attemptId } = await searchParams;

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

  // Auto-repair missing or zero scores
  attempt = await repairAndScoreAttempt(attempt, questions);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] print:bg-white print:dark:bg-white text-slate-900 dark:text-white print:text-black print:dark:text-black">
      <div className="max-w-6xl mx-auto px-4 py-8 print:p-0 print:m-0 print:max-w-none">
        <ResultsDashboard
          attempt={attempt}
          questions={questions}
          student={student}
        />
      </div>
    </div>
  );
}
