import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string; questionId: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json(
        { error: "Unauthorized - Academic management access required" },
        { status: 401 },
      );
    }
const { id: satTestId, questionId } = await params; const body = await request.json(); const { prompt, passage, imageUrl, imagePosition, options, correctAnswer, difficulty, domain, skill, module: mod, format, questionNumber, explanation, } = body; const validModules = ["MODULE_1","MODULE_2","MODULE_3","MODULE_4"] as const; const validFormats = ["MCQ","FILL_IN"] as const; const validDifficulties = ["EASY","MEDIUM","HARD"] as const; const updated = await prisma.sATQuestion.update({ where: { id: questionId, }, data: { ...(prompt !== undefined && { prompt }), ...(passage !== undefined && { passage }), ...(imageUrl !== undefined && { imageUrl }), ...(imagePosition !== undefined && { imagePosition }), ...(options !== undefined && { options }), ...(correctAnswer !== undefined && { correctAnswer: String(correctAnswer) }), ...(difficulty && validDifficulties.includes(difficulty) && { difficulty }), ...(domain !== undefined && { domain }), ...(skill !== undefined && { skill }), ...(mod && validModules.includes(mod) && { module: mod }), ...(format && validFormats.includes(format) && { format }), ...(questionNumber !== undefined && { questionNumber: Number(questionNumber) }), ...(explanation !== undefined && { explanation }), }, }); return NextResponse.json({ success: true, data: updated, }); } catch (error) { const errorMsg = error instanceof Error ? error.message : String(error); console.error("[UPDATE_QUESTION_ERROR]", errorMsg); return NextResponse.json( { error:`Failed to update question: ${errorMsg}` }, { status: 500 } ); }
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json(
        { error: "Unauthorized - Academic management access required" },
        { status: 401 },
      );
    }
    const { questionId } = await params;
    await prisma.sATQuestion.delete({ where: { id: questionId } });
    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to delete question: ${errorMsg}` },
      { status: 500 },
    );
  }
}
