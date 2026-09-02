import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return new NextResponse("Unauthorized", { status: 401 });
 }

 const students = await prisma.studentProfile.findMany({
 include: {
 user: true,
 group: true,
 },
 orderBy: { createdAt: "desc" },
 });

 const headers = [
 "Student ID",
 "First Name",
 "Last Name",
 "Email",
 "Phone Number",
 "Registered Groups",
 "Enrollment Date",
 "Status",
 ];

 const rows = students.map((s) => [
 s.id,
 s.firstName,
 s.lastName,
 s.user?.username || "",
 s.phone || "",
 s.group?.name || "None",
 s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : "",
 s.status,
 ]);

 const csvContent = [headers, ...rows]
 .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
 .join("\n");

 return new NextResponse(csvContent, {
 headers: {
 "Content-Type": "text/csv",
 "Content-Disposition": 'attachment; filename="students_export.csv"',
 },
 });
 } catch (error) {
 console.error("Export error:", error);
 return new NextResponse("Failed to export data", { status: 500 });
 }
}
