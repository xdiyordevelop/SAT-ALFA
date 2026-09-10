import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics, isStaff } from "@/lib/permissions/auth";
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
 sourceFileUrl?: string | null;
 sourceFileName?: string | null;
}

interface ImportPayload {
  testId?: string;
  testName: string;
  description?: string;
  sourceFileUrl?: string | null;
  sourceFileName?: string | null;
  sourceFileType?: string | null;
  questions: SaveQuestionPayload[];
}


export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isStaff(session)) return NextResponse.json([], { status: 401 });
    
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

 if (!session || !canManageAcademics(session)) {
 return NextResponse.json(
 { success: false, error: "Unauthorized - Academic management access required" },
 { status: 401 }
 );
 }

  const body: ImportPayload = await request.json();
  const { testName, description, questions, sourceFileUrl, sourceFileName, sourceFileType } = body;

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
 sourceFileUrl: q.sourceFileUrl || sourceFileUrl || null,
 sourceFileName: q.sourceFileName || sourceFileName || null,
 answerSource: isMissingAnswer ? "missing" : (q.answerSource || 'missing'),
 requiresReview: isMissingAnswer || (q.requiresReview ?? true),
 verificationStatus: q.verificationStatus || null,
 };
 });

 
    let existingTest = body.testId ? await prisma.sATMockTest.findUnique({ where: { id: body.testId } }) : null;

    // Safety fallback: if testId wasn't passed, check if a test with this exact name already exists
    if (!existingTest && testName) {
      const match = await prisma.sATMockTest.findFirst({
        where: { name: { equals: testName.trim(), mode: "insensitive" } },
        orderBy: { updatedAt: "desc" },
      });
      const modulesInUpload = new Set(questionsToCreate.map((q) => q.module));
      // If found and we are updating 1 or 2 modules, attach to the existing test
      if (match && modulesInUpload.size <= 2) {
        existingTest = match;
      }
    }

    let satTest: any;
    if (existingTest) {
      // Delete existing questions only for the modules included in this upload
      const modulesToReplace = Array.from(new Set(questionsToCreate.map(q => q.module)));
      await prisma.sATQuestion.deleteMany({
        where: {
          satTestId: existingTest.id,
          module: { in: modulesToReplace }
        }
      });
      
      // Update per-module source file mapping
      const currentModuleFiles = ((existingTest.moduleSourceFiles as any) || {});
      const updatedModuleFiles = { ...currentModuleFiles };

      if (sourceFileUrl) {
        for (const mod of modulesToReplace) {
          updatedModuleFiles[mod] = {
            url: sourceFileUrl,
            fileName: sourceFileName || null,
            fileType: sourceFileType || "application/pdf",
            updatedAt: new Date().toISOString(),
          };
        }
      }

      const updateData: any = {
        questions: {
          create: questionsToCreate
        },
        moduleSourceFiles: updatedModuleFiles,
      };

      // If uploading all modules or no fallback source file exists yet, update top-level sourceFileUrl as fallback
      if (sourceFileUrl && (!existingTest.sourceFileUrl || modulesToReplace.length >= 4)) {
        updateData.sourceFileUrl = sourceFileUrl;
        updateData.sourceFileName = sourceFileName || null;
        updateData.sourceFileType = sourceFileType || "application/pdf";
      }

      satTest = await prisma.sATMockTest.update({
        where: { id: existingTest.id },
        data: updateData,
        include: { questions: { select: { id: true, module: true, questionNumber: true } } }
      });
    } else {
      const modulesToCreate = Array.from(new Set(questionsToCreate.map(q => q.module)));
      const initialModuleFiles: Record<string, any> = {};
      if (sourceFileUrl) {
        for (const mod of modulesToCreate) {
          initialModuleFiles[mod] = {
            url: sourceFileUrl,
            fileName: sourceFileName || null,
            fileType: sourceFileType || "application/pdf",
            createdAt: new Date().toISOString(),
          };
        }
      }

      satTest = await prisma.sATMockTest.create({
        data: {
          name: testName.trim().substring(0, 255),
          description: description || `Imported on ${new Date().toLocaleDateString()}`,
          createdById: session.userId,
          status: "draft",
          sourceFileUrl: sourceFileUrl || null,
          sourceFileName: sourceFileName || null,
          sourceFileType: sourceFileType || (sourceFileUrl ? "application/pdf" : null),
          moduleSourceFiles: Object.keys(initialModuleFiles).length > 0 ? initialModuleFiles : undefined,
          questions: { create: questionsToCreate }
        },
        include: { questions: { select: { id: true, module: true, questionNumber: true } } }
      });
    }

    // Tally module counts across the entire test
    const moduleCounts: Record<string, number> = {
      MODULE_1: 0,
      MODULE_2: 0,
      MODULE_3: 0,
      MODULE_4: 0,
    };
    for (const q of satTest.questions) {
      moduleCounts[q.module] = (moduleCounts[q.module] || 0) + 1;
    }

    return NextResponse.json(
      {
        success: true,
        testId: satTest.id,
        testName: satTest.name,
        questionCount: satTest.questions.length,
        modules: moduleCounts,
        message: `Successfully saved ${questionsToCreate.length} questions into "${satTest.name}". Test now has ${satTest.questions.length} total questions.`,
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
