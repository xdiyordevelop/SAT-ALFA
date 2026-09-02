import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(request: Request) {
 try {
 const session = await getSession();

 if (!session || session.role !== "STUDENT") {
 return NextResponse.json(
 { error: "Unauthorized" },
 { status: 403 }
 );
 }

 const { phone } = await request.json();

 if (!phone || typeof phone !== "string" || !phone.trim()) {
 return NextResponse.json(
 { error: "Phone number is required" },
 { status: 400 }
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

 const updated = await prisma.studentProfile.update({
 where: { id: student.id },
 data: { phone: phone.trim() },
 });

 return NextResponse.json(
 {
 success: true,
 message: "Phone number updated successfully",
 student: updated,
 },
 { status: 200 }
 );
 } catch (error) {
 console.error("Error updating phone:", error);
 return NextResponse.json(
 {
 error: "Failed to update phone number",
 details: error instanceof Error ? error.message : "Unknown error",
 },
 { status: 500 }
 );
 }
}
