import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let fullName = session.username;
  let phone = "";
  let roleTitle: string = session.role;

  try {
    if (session.role === "STUDENT") {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: session.userId },
        select: { firstName: true, lastName: true, phone: true },
      });
      if (student) {
        fullName = `${student.firstName} ${student.lastName}`.trim() || session.username;
        phone = student.phone || "";
      }
    } else {
      const staff = await prisma.staffProfile.findUnique({
        where: { userId: session.userId },
        select: { fullName: true, roleTitle: true, phone: true },
      });
      if (staff) {
        fullName = staff.fullName || session.username;
        roleTitle = staff.roleTitle || session.role;
        phone = staff.phone || "";
      }
    }
  } catch {
    // Fallback to basic session if DB is unreachable
  }

  return NextResponse.json({
    ...session,
    fullName,
    phone,
    roleTitle,
    email: phone ? phone : `${session.username}@student.alfa`,
  });
}
