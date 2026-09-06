import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { TestProvider } from "../context/TestContext";
import { TestEngine } from "./TestEngine";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ proctorSessionId?: string; proctorCode?: string; code?: string }>;
}

export default async function TakeTestPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = searchParams ? await searchParams : {};
  const proctorParam = sParams.proctorSessionId || sParams.proctorCode || sParams.code || null;
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

  // Resolve proctor session if provided
  let resolvedSessionId: string | null = null;
  if (proctorParam) {
    const proctorSession = await prisma.proctoredSession.findFirst({
      where: {
        OR: [
          { id: proctorParam },
          { code: proctorParam },
        ],
        satTestId: test.id,
        status: "ACTIVE",
      },
    });

    if (proctorSession) {
      resolvedSessionId = proctorSession.id;
      // Register or update participant to TAKING
      await prisma.proctoredParticipant.upsert({
        where: {
          sessionId_studentId: {
            sessionId: proctorSession.id,
            studentId: studentProfile.id,
          },
        },
        update: {
          status: "TAKING",
          startedAt: new Date(),
          lastHeartbeat: new Date(),
        },
        create: {
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

  return (
    <TestProvider
      testId={test.id}
      studentId={studentProfile.id}
      userId={session.userId}
      proctorCode={resolvedSessionId}
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
        proctorCode={resolvedSessionId}
      />
    </TestProvider>
  );
}
