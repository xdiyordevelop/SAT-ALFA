import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const groups = await prisma.group.findMany({
 orderBy: { name: "asc" },
 select: {
 id: true,
 name: true,
 course: true,
 subject: true,
 },
 });

 return NextResponse.json(groups);
}
