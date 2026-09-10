import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const testId = searchParams.get("testId");

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.status = status;
    }
    if (testId) {
      whereClause.satTestId = testId;
    }

    const reports = await prisma.bugReport.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Attach test and question details for richer display
    const testIds = [...new Set(reports.map((r) => r.satTestId).filter(Boolean))] as string[];
    const questionIds = [...new Set(reports.map((r) => r.questionId).filter(Boolean))] as string[];

    const [tests, questions] = await Promise.all([
      testIds.length > 0
        ? prisma.sATMockTest.findMany({
            where: { id: { in: testIds } },
            select: {
              id: true,
              name: true,
              sourceFileUrl: true,
              sourceFileName: true,
              moduleSourceFiles: true,
            },
          })
        : [],
      questionIds.length > 0
        ? prisma.sATQuestion.findMany({
            where: { id: { in: questionIds } },
            select: {
              id: true,
              module: true,
              questionNumber: true,
              prompt: true,
              options: true,
              correctAnswer: true,
              imageUrl: true,
              sourceFileUrl: true,
              sourceFileName: true,
            },
          })
        : [],
    ]);

    const testMap = new Map(tests.map((t) => [t.id, t]));
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const enrichedReports = reports.map((r) => {
      const test = r.satTestId ? testMap.get(r.satTestId) : null;
      const question = r.questionId ? questionMap.get(r.questionId) || null : null;

      // Module-specific PDF resolution:
      // 1. Question's own sourceFileUrl (exact file this question was created from)
      // 2. Test's per-module source file (test.moduleSourceFiles[question.module])
      // 3. Test-level sourceFileUrl (single-file tests fallback)
      const moduleFiles = (test?.moduleSourceFiles as any) || {};
      const qMod = question?.module;
      const modSource = qMod ? moduleFiles[qMod] : null;

      const resolvedSourceFileUrl =
        question?.sourceFileUrl ||
        modSource?.url ||
        test?.sourceFileUrl ||
        null;

      const resolvedSourceFileName =
        question?.sourceFileName ||
        modSource?.fileName ||
        test?.sourceFileName ||
        null;

      return {
        ...r,
        testName: test?.name || (r.satTestId ? "Unknown Test" : "Platform"),
        sourceFileUrl: resolvedSourceFileUrl,
        sourceFileName: resolvedSourceFileName,
        question,
      };
    });

    return NextResponse.json({ reports: enrichedReports });
  } catch (error: any) {
    console.error("[AdminBugReports] GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bug reports" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, status, applyFix } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    const existingReport = await prisma.bugReport.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Bug report not found" }, { status: 404 });
    }

    // If admin requested to manually apply the AI fix payload
    if (applyFix && existingReport.questionId && existingReport.fixPayload) {
      const payload: any = existingReport.fixPayload;
      const updateData: any = {};

      if (payload.updatedQuestion) {
        const uq = payload.updatedQuestion;
        if (uq.correctAnswer) updateData.correctAnswer = uq.correctAnswer;
        if (uq.prompt) updateData.prompt = uq.prompt;
        if (uq.passage !== undefined) updateData.passage = uq.passage;
        if (uq.imageUrl !== undefined) updateData.imageUrl = uq.imageUrl;
        if (uq.options) updateData.options = uq.options;
      } else {
        if (payload.correctAnswer) updateData.correctAnswer = payload.correctAnswer;
        if (payload.prompt) updateData.prompt = payload.prompt;
        if (payload.passage !== undefined) updateData.passage = payload.passage;
        if (payload.imageUrl !== undefined) updateData.imageUrl = payload.imageUrl;
        if (payload.options) updateData.options = payload.options;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.sATQuestion.update({
          where: { id: existingReport.questionId },
          data: updateData,
        });
      }
    }

    const updated = await prisma.bugReport.update({
      where: { id: reportId },
      data: {
        ...(status ? { status } : applyFix ? { status: "resolved" } : {}),
      },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    console.error("[AdminBugReports] PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update bug report" }, { status: 500 });
  }
}
