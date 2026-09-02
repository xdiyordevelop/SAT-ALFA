import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
 try {
 const session = await getSession();

 if (!session || session.role !== "STUDENT") {
 return NextResponse.json(
 { message: "Unauthorized" },
 { status: 401 }
 );
 }

 const student = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 });

 if (!student) {
 return NextResponse.json(
 { message: "Student profile not found" },
 { status: 404 }
 );
 }

 // Get all confirmed mock tests (available for students to take)
 const tests = await prisma.mockTest.findMany({
 where: {
 status: "CONFIRMED",
 },
 orderBy: { createdAt: "desc" },
 take: 50,
 });

 return NextResponse.json(
 { data: tests },
 { status: 200 }
 );
 } catch (error) {
 console.error("Error fetching mock tests:", error);
 return NextResponse.json(
 { message: "Failed to fetch mock tests" },
 { status: 500 }
 );
 }
}
