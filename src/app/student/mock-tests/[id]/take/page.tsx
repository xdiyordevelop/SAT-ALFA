import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { TestProvider } from "../context/TestContext";
import { TestEngine } from "./TestEngine";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ proctorSessionId?: string; proctorCode?: string; code?: string; retake?: string }>;
}

export default async function TakeTestPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const proctorParam = sParams.proctorSessionId || sParams.proctorCode || sParams.code || null;
  const isRetake = sParams.retake === "true";
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // Fetch the real test and its actual questions from the database
  const test = await prisma.sATMockTest.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: [{ module: "asc" }, { questionNumber: "asc" }],
      },
    },
  });

  if (!test) {
    redirect("/student/mock-tests");
  }

  // Find student profile using userId
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
    include: { user: true },
  });

  if (!studentProfile) {
    redirect("/login");
  }

  // Transform Prisma questions to match TestEngine expectations
  const questions = test.questions.map((q) => ({
    id: q.id,
    module:
      q.module === "MODULE_1"
        ? 1
        : q.module === "MODULE_2"
          ? 2
          : q.module === "MODULE_3"
            ? 3
            : 4,
    questionNumber: q.questionNumber,
    format: q.format === "MCQ" ? "mcq" : "fill-in",
    prompt: q.prompt,
    passage: q.passage,
    imageUrl: q.imageUrl,
    imagePosition: q.imagePosition,
    options: q.options
      ? typeof q.options === "string"
        ? JSON.parse(q.options)
        : q.options
      : undefined,
    correctAnswer: q.correctAnswer,
    domain: q.domain,
    skill: q.skill,
    difficulty: q.difficulty.toLowerCase(),
  }));

  // Resolve proctor session ONLY if proctorParam is provided in URL
  const effectiveProctorParam = proctorParam;
  let resolvedSessionId: string | null = null;
  let initialExitCount = 0;

  if (effectiveProctorParam) {
    const proctorSession = await prisma.proctoredSession.findFirst({
      where: {
        OR: [
          { id: effectiveProctorParam },
          { code: effectiveProctorParam },
        ],
        satTestId: test.id,
        status: "ACTIVE",
      },
    });

    if (proctorSession) {
      resolvedSessionId = proctorSession.id;

      const existingParticipant = await prisma.proctoredParticipant.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: proctorSession.id,
            studentId: studentProfile.id,
          },
        },
      });

      if (existingParticipant) {
        if (
          existingParticipant.status === "DISQUALIFIED" ||
          existingParticipant.fullscreenExitCount >= 5
        ) {
          redirect("/student/mock-tests?error=disqualified");
        }
        if (existingParticipant.status === "COMPLETED") {
          redirect("/student/mock-tests?error=already_completed");
        }

        initialExitCount = existingParticipant.fullscreenExitCount;

        await prisma.proctoredParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            status: "TAKING",
            lastHeartbeat: new Date(),
          },
        });
      } else {
        await prisma.proctoredParticipant.create({
          data: {
            sessionId: proctorSession.id,
            studentId: studentProfile.id,
            userName: `${studentProfile.firstName} ${studentProfile.lastName}`.trim() || session.username,
            email: studentProfile.user?.username || `${session.username}@student.alfa`,
            status: "TAKING",
            startedAt: new Date(),
            lastHeartbeat: new Date(),
          },
        });
      }
    }
  }

  // Check attempt status (proctored or self-paced)
  const existingAttempt = await prisma.studentTestAttempt.findFirst({
    where: {
      studentId: studentProfile.id,
      satTestId: test.id,
      ...(resolvedSessionId ? { proctorCode: resolvedSessionId } : { proctorCode: null }),
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingAttempt) {
    // Only live proctored sessions lock out for exit violations
    if (resolvedSessionId && existingAttempt.fullscreenExitCount >= 5) {
      redirect("/student/mock-tests?error=disqualified");
    }
    if (!isRetake && existingAttempt.completedAt) {
      redirect(`/student/mock-tests/${test.id}/results`);
    }
    if (!isRetake && !existingAttempt.completedAt) {
      initialExitCount = existingAttempt.fullscreenExitCount || 0;
    }
  }

  return (
    <TestProvider
      testId={test.id}
      studentId={studentProfile.id}
      userId={session.userId}
      proctorCode={resolvedSessionId}
      isRetake={isRetake}
      initialFullscreenExitCount={isRetake ? 0 : initialExitCount}
      totalQuestions={questions.length}
      questionsPerModule={{
        1: questions.filter((q) => q.module === 1).length,
        2: questions.filter((q) => q.module === 2).length,
        3: questions.filter((q) => q.module === 3).length,
        4: questions.filter((q) => q.module === 4).length,
      }}
      realQuestions={questions}
    >
      <TestEngine
        testId={test.id}
        studentId={studentProfile.id}
        userId={session.userId}
        studentName={`${studentProfile.firstName} ${studentProfile.lastName}`}
        testName={test.name}
        proctorCode={resolvedSessionId}
      />
    </TestProvider>
  );
}
