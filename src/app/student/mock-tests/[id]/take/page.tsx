import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { TestProvider } from "../context/TestContext";
import { TestEngine } from "./TestEngine";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TakeTestPage({ params }: PageProps) {
  const { id } = await params;
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

  return (
    <TestProvider
      testId={test.id}
      studentId={studentProfile.id}
      userId={session.userId}
      proctorCode={null}
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
        proctorCode={null}
      />
    </TestProvider>
  );
}
