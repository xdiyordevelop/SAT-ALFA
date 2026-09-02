import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getApprovedTestsForStudent } from "@/lib/queries/tests";

export async function GET(request: Request) {
 try {
 const session = await getSession();

 if (!session || session.role !== "STUDENT") {
 return NextResponse.json(
 { error: "Unauthorized. Only students can access their test history." },
 { status: 403 }
 );
 }

 const student = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 });

 if (!student) {
 return NextResponse.json(
 { error: "Student profile not found" },
 { status: 404 }
 );
 }

 const approvedTests = await getApprovedTestsForStudent(student.id);

 return NextResponse.json(
 {
 success: true,
 count: approvedTests.length,
 tests: approvedTests,
 },
 { status: 200 }
 );
 } catch (error) {
 console.error("Error fetching test history:", error);
 return NextResponse.json(
 {
 error: "Failed to fetch test history",
 details: error instanceof Error ? error.message : "Unknown error",
 },
 { status: 500 }
 );
 }
}
