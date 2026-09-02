import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcrypt";

export async function PATCH(request: Request) {
 try {
 const session = await getSession();

 if (!session || session.role !== "STUDENT") {
 return NextResponse.json(
 { error: "Unauthorized" },
 { status: 403 }
 );
 }

 const { currentPassword, newPassword } = await request.json();

 if (!currentPassword || !newPassword) {
 return NextResponse.json(
 { error: "Current password and new password are required" },
 { status: 400 }
 );
 }

 if (newPassword.length < 6) {
 return NextResponse.json(
 { error: "New password must be at least 6 characters" },
 { status: 400 }
 );
 }

 const user = await prisma.user.findUnique({
 where: { id: session.userId },
 });

 if (!user) {
 return NextResponse.json(
 { error: "User not found" },
 { status: 404 }
 );
 }

 // Verify current password
 const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
 if (!passwordMatch) {
 return NextResponse.json(
 { error: "Current password is incorrect" },
 { status: 400 }
 );
 }

 // Hash new password
 const hashedPassword = await bcrypt.hash(newPassword, 10);

 // Update password
 await prisma.user.update({
 where: { id: session.userId },
 data: { passwordHash: hashedPassword },
 });

 return NextResponse.json(
 {
 success: true,
 message: "Password changed successfully",
 },
 { status: 200 }
 );
 } catch (error) {
 console.error("Error changing password:", error);
 return NextResponse.json(
 {
 error: "Failed to change password",
 details: error instanceof Error ? error.message : "Unknown error",
 },
 { status: 500 }
 );
 }
}
