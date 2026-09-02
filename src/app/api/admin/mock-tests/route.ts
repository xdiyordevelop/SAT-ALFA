import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
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

 if (!session || session.role !== "ADMIN") {
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

 // Serialize questions to JSON
 const questionsData = JSON.stringify(questions);

 // Create mock test template
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
 });

 return NextResponse.json(
 {
 message: "Mock test created successfully",
 id: mockTest.id,
 data: mockTest,
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
