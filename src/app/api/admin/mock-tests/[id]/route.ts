import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics, isStaff } from "@/lib/permissions/auth";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

interface RouteParams {
 params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
 try {
 const session = await getSession();
 if (!session || !isStaff(session)) {
 return NextResponse.json(
 { error: "Unauthorized - Staff access required" },
 { status: 401 }
 );
 }

 const { id } = await params;
 if (!id) {
 return NextResponse.json(
 { error: "Test ID is required" },
 { status: 400 }
 );
 }

 // Try finding in SATMockTest
 const satTest = await prisma.sATMockTest.findUnique({
 where: { id },
 include: {
 questions: {
 orderBy: [{ module: "asc" }, { questionNumber: "asc" }],
 },
 },
 });

 if (satTest) {
    // Compile moduleSourceFiles with fallbacks from questions
    const moduleSourceFiles: Record<string, { url: string; fileName?: string | null; fileType?: string | null; updatedAt?: string }> = {
      ...((satTest.moduleSourceFiles as Record<string, any>) || {})
    };

    // Auto-detect from questions if any question has sourceFileUrl but moduleSourceFiles lacks it
    for (const q of satTest.questions) {
      if (q.module && q.sourceFileUrl && !moduleSourceFiles[q.module]) {
        moduleSourceFiles[q.module] = {
          url: q.sourceFileUrl,
          fileName: q.sourceFileName || `${q.module} Source PDF`,
          fileType: "application/pdf",
        };
      }
    }

    return NextResponse.json({
      id: satTest.id,
      name: satTest.name,
      description: satTest.description,
      status: satTest.status,
      sourceFileUrl: satTest.sourceFileUrl,
      sourceFileName: satTest.sourceFileName,
      sourceFileType: satTest.sourceFileType,
      moduleSourceFiles,
      createdAt: satTest.createdAt,
      updatedAt: satTest.updatedAt,
      questions: satTest.questions.map((q) => ({
        id: q.id,
        module: q.module,
        format: q.format,
        questionNumber: q.questionNumber,
        prompt: q.prompt,
        passage: q.passage,
        imageUrl: q.imageUrl,
        imagePosition: q.imagePosition,
        options: q.options || {},
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        domain: q.domain,
        skill: q.skill,
        explanation: q.explanation,
        sourceFileUrl: q.sourceFileUrl,
        sourceFileName: q.sourceFileName,
      })),
    });
  }

 // Fallback: Check legacy MockTest if applicable
 const legacyTest = await prisma.mockTest.findUnique({
 where: { id },
 include: {
 performances: {
 include: { topic: true },
 },
 },
 });

 if (legacyTest) {
 let parsedQuestions = [];
 try {
 parsedQuestions = JSON.parse(legacyTest.questions || "[]");
 } catch {
 parsedQuestions = [];
 }
 return NextResponse.json({
 id: legacyTest.id,
 name: legacyTest.testName,
 description: legacyTest.description,
 status: legacyTest.status,
 createdAt: legacyTest.createdAt,
 updatedAt: legacyTest.updatedAt,
 questions: parsedQuestions,
 });
 }

 return NextResponse.json(
 { error: "Test not found" },
 { status: 404 }
 );
 } catch (error) {
 const errorMsg = error instanceof Error ? error.message : String(error);
 console.error("[GET_MOCK_TEST_BY_ID_ERROR]", errorMsg);
 return NextResponse.json(
 { error: `Failed to fetch test: ${errorMsg}` },
 { status: 500 }
 );
 }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
 try {
 const session = await getSession();
 if (!session || !canManageAcademics(session)) {
 return NextResponse.json(
 { error: "Unauthorized - Curriculum permissions required" },
 { status: 401 }
 );
 }

  const { id } = await params;
  const body = await request.json();
  const { name, description, status, sourceFileUrl, sourceFileName, sourceFileType, moduleSourceFiles, targetModule } = body;

  let finalModuleSourceFiles = moduleSourceFiles;

  // If updating a specific target module's source file
  if (targetModule && sourceFileUrl !== undefined) {
    const existing = await prisma.sATMockTest.findUnique({
      where: { id },
      select: { moduleSourceFiles: true },
    });
    const currentMap = { ...(((existing?.moduleSourceFiles as any) || {})) };
    if (sourceFileUrl === null) {
      delete currentMap[targetModule];
    } else {
      currentMap[targetModule] = {
        url: sourceFileUrl,
        fileName: sourceFileName || null,
        fileType: sourceFileType || "application/pdf",
        updatedAt: new Date().toISOString(),
      };
    }
    finalModuleSourceFiles = currentMap;

    // Also update questions in that module
    await prisma.sATQuestion.updateMany({
      where: { satTestId: id, module: targetModule },
      data: {
        sourceFileUrl: sourceFileUrl || null,
        sourceFileName: sourceFileName || null,
      },
    });
  }

  const updateData: any = {
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(status !== undefined && { status }),
    ...(finalModuleSourceFiles !== undefined && { moduleSourceFiles: finalModuleSourceFiles }),
  };

  // If no targetModule is specified, update global sourceFileUrl
  if (!targetModule) {
    if (sourceFileUrl !== undefined) updateData.sourceFileUrl = sourceFileUrl;
    if (sourceFileName !== undefined) updateData.sourceFileName = sourceFileName;
    if (sourceFileType !== undefined) updateData.sourceFileType = sourceFileType;
  }

  const updated = await prisma.sATMockTest.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    data: updated,
  });
 } catch (error) {
 const errorMsg = error instanceof Error ? error.message : String(error);
 return NextResponse.json(
 { error: `Failed to update test: ${errorMsg}` },
 { status: 500 }
 );
 }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
 try {
 const session = await getSession();
 if (!session || !canManageAcademics(session)) {
 return NextResponse.json(
 { error: "Unauthorized - Curriculum permissions required" },
 { status: 401 }
 );
 }

 const { id } = await params;
 await prisma.sATMockTest.delete({
 where: { id },
 });

 return NextResponse.json({
 success: true,
 message: "Test deleted successfully",
 });
 } catch (error) {
 const errorMsg = error instanceof Error ? error.message : String(error);
 return NextResponse.json(
 { error: `Failed to delete test: ${errorMsg}` },
 { status: 500 }
 );
 }
}