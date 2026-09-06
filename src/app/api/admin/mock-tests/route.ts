import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { NextRequest, NextResponse } from "next/server";

interface Question {
 id: string;
 text: string;
 options: string[];
 correctAnswer: number;
 explanation: string;
}

export async function POST(request: NextRequest) {
 try {
 const session = await getSession();

 if (!session || !canManageAcademics(session)) {
 return NextResponse.json(
 { message: "Unauthorized" },
 { status: 401 }
 );
 }

 const body = await request.json();
 const {
 testName,
 description,
 subject,
 maxScore,
 duration,
 questions,
 } = body;

 // Validation
 if (!testName || !questions || questions.length === 0) {
 return NextResponse.json(
 { message: "Test name and questions are required" },
 { status: 400 }
 );
 }

  // 1. Create the official Digital SAT Mock Test
  const satMockTest = await prisma.sATMockTest.create({
    data: {
      name: testName,
      description: description || "",
      createdById: session.userId,
      status: "published",
    },
  });

  // 2. Create questions linked to the Digital SAT Mock Test
  const isMath = (subject || "").toLowerCase().includes("math");
  const moduleType = isMath ? "MODULE_3" : "MODULE_1";
  const optionKeys = ["A", "B", "C", "D"] as const;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const optionsObj: Record<string, string> = {};
    (q.options || []).forEach((optText: string, idx: number) => {
      const key = optionKeys[idx] || `OPT_${idx + 1}`;
      optionsObj[key] = optText;
    });

    const correctLetter = typeof q.correctAnswer === "number"
      ? (optionKeys[q.correctAnswer] || "A")
      : String(q.correctAnswer || "A");

    await prisma.sATQuestion.create({
      data: {
        satTestId: satMockTest.id,
        module: moduleType as any,
        format: "MCQ",
        questionNumber: i + 1,
        prompt: q.text,
        passage: null,
        options: optionsObj,
        correctAnswer: correctLetter,
        explanation: q.explanation || null,
        domain: isMath ? "Math" : "Reading and Writing",
        skill: isMath ? "General Math" : "General Reading",
        difficulty: "MEDIUM",
        answerSource: "admin",
        requiresReview: false,
        verificationStatus: "verified",
      },
    });
  }

  // 3. Also preserve legacy MockTest record for backward compatibility
  const questionsData = JSON.stringify(questions);
  const mockTest = await prisma.mockTest.create({
    data: {
      testName,
      description: description || "",
      subject: subject || "Math",
      maxScore: maxScore || 1600,
      duration: duration || 60,
      questions: questionsData,
      status: "CONFIRMED",
      score: 0,
      createdById: session.userId,
    },
  }).catch(() => null);

 return NextResponse.json(
 {
 message: "Mock test created successfully",
 id: satMockTest.id,
 data: satMockTest,
 },
 { status: 201 }
 );
 } catch (error) {
 console.error("Error creating mock test:", error);
 return NextResponse.json(
 { message: "Failed to create mock test" },
 { status: 500 }
 );
 }
}
