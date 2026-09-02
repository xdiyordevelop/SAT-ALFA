import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

interface RouteParams {
 params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return NextResponse.json(
 { error: "Unauthorized - Admin access required" },
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
 return NextResponse.json({
 id: satTest.id,
 name: satTest.name,
 description: satTest.description,
 status: satTest.status,
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
 if (!session || session.role !== "ADMIN") {
 return NextResponse.json(
 { error: "Unauthorized - Admin access required" },
 { status: 401 }
 );
 }

 const { id } = await params;
 const body = await request.json();
 const { name, description, status } = body;

 const updated = await prisma.sATMockTest.update({
 where: { id },
 data: {
 ...(name !== undefined && { name }),
 ...(description !== undefined && { description }),
 ...(status !== undefined && { status }),
 },
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
 if (!session || session.role !== "ADMIN") {
 return NextResponse.json(
 { error: "Unauthorized - Admin access required" },
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