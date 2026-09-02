import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

interface SaveQuestionPayload {
 module?: string;
 format?: string;
 questionNumber?: number;
 prompt: string;
 passage?: string | null;
 imageUrl?: string | null;
 imagePosition?: string;
 options?: Record<string, string> | null;
 correctAnswer: string | null;
 answerSource?: string;
 requiresReview?: boolean;
 verificationStatus?: string;
 difficulty?: string;
 domain?: string;
 skill?: string;
 explanation?: string | null;
}

interface ImportPayload {
 testId?: string;
 testName: string;
 description?: string;
 questions: SaveQuestionPayload[];
}


export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json([], { status: 401 });
    
    const tests = await prisma.sATMockTest.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        name: true,
        questions: { select: { module: true } }
      }
    });
    
    const formatted = tests.map(t => ({
      id: t.id,
      name: t.name,
      modules: Array.from(new Set(t.questions.map(q => q.module)))
    }));
    
    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
 try {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 return NextResponse.json(
 { success: false, error: "Unauthorized - Admin access required" },
 { status: 401 }
 );
 }

 const body: ImportPayload = await request.json();
 const { testName, description, questions } = body;

 if (!testName || typeof testName !== "string" || !testName.trim()) {
 return NextResponse.json(
 { success: false, error: "Test name is required" },
 { status: 400 }
 );
 }

 if (!Array.isArray(questions) || questions.length === 0) {
 return NextResponse.json(
 { success: false, error: "At least one question is required" },
 { status: 400 }
 );
 }

 // Clean & normalize question records
 const validModules = ["MODULE_1", "MODULE_2", "MODULE_3", "MODULE_4"] as const;
 const validFormats = ["MCQ", "FILL_IN"] as const;
 const validDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

 const questionsToCreate = questions.map((q, index) => {
 const moduleKey = validModules.includes(q.module as any)
 ? (q.module as (typeof validModules)[number])
 : "MODULE_1";

 const formatKey = validFormats.includes(q.format as any)
 ? (q.format as (typeof validFormats)[number])
 : "MCQ";

 const difficultyKey = validDifficulties.includes(q.difficulty as any)
 ? (q.difficulty as (typeof validDifficulties)[number])
 : "MEDIUM";

 let optionsObj = q.options && typeof q.options === "object" ? q.options : {};
 if (formatKey === "MCQ" && Object.keys(optionsObj).length === 0) {
 optionsObj = { A: "Option A", B: "Option B", C: "Option C", D: "Option D" };
 }

 const isMissingAnswer = !q.correctAnswer || q.correctAnswer.trim() === "";

 return {
 module: moduleKey,
 format: formatKey,
 questionNumber: typeof q.questionNumber === "number" ? q.questionNumber : index + 1,
 prompt: q.prompt || `<p>Question ${index + 1}</p>`,
 passage: q.passage || null,
 imageUrl: q.imageUrl || null,
 imagePosition: q.imagePosition || "above",
 options: optionsObj,
 correctAnswer: isMissingAnswer ? "MISSING" : q.correctAnswer!.toString().trim(),
 difficulty: difficultyKey,
 domain: q.domain || "General",
 skill: q.skill || "General Skills",
 explanation: q.explanation || null,
 answerSource: isMissingAnswer ? "missing" : (q.answerSource || 'missing'),
 requiresReview: isMissingAnswer || (q.requiresReview ?? true),
 verificationStatus: q.verificationStatus || null,
 };
 });

 
    const existingTest = body.testId ? await prisma.sATMockTest.findUnique({ where: { id: body.testId } }) : null;

    let satTest;
    if (existingTest) {
      // First, delete any existing questions for this specific module to prevent duplicates
      await prisma.sATQuestion.deleteMany({
        where: {
          satTestId: existingTest.id,
          module: questionsToCreate[0].module // assume all uploaded are for the same module
        }
      });
      
      satTest = await prisma.sATMockTest.update({
        where: { id: existingTest.id },
        data: {
          questions: {
            create: questionsToCreate
          }
        },
        include: { questions: { select: { id: true, module: true, questionNumber: true } } }
      });
    } else {
      satTest = await prisma.sATMockTest.create({
        data: {
          name: testName.trim().substring(0, 255),
          description: description || `Imported on ${new Date().toLocaleDateString()}`,
          createdById: session.userId,
          status: "draft",
          questions: { create: questionsToCreate }
        },
        include: { questions: { select: { id: true, module: true, questionNumber: true } } }
      });
    }


 return NextResponse.json(
 {
 success: true,
 testId: satTest.id,
 testName: satTest.name,
 questionCount: satTest.questions.length,
 message: `Successfully imported ${satTest.questions.length} questions into draft test "${satTest.name}"`,
 },
 { status: 201 }
 );
 } catch (error) {
 const errorMsg = error instanceof Error ? error.message : String(error);
 console.error("[IMPORT_SAVER_ERROR]", errorMsg);
 return NextResponse.json(
 { success: false, error: `Failed to save mock test: ${errorMsg}` },
 { status: 500 }
 );
 }
}
