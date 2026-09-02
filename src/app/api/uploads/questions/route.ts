import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const formData = await request.formData();
 const file = formData.get("file") as File;

 if (!file) {
 return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
 }

 const buffer = Buffer.from(await file.arrayBuffer());
 const uploadDir = join(process.cwd(), "public", "uploads", "questions");
 await mkdir(uploadDir, { recursive: true });

 const ext = file.name.split(".").pop() || "jpg";
 const filename = `q-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
 const filePath = join(uploadDir, filename);

 await writeFile(filePath, buffer);

 const publicUrl = `/uploads/questions/${filename}`;

 return NextResponse.json({
 success: true,
 url: publicUrl,
 });
 } catch (error) {
 const errorMsg = error instanceof Error ? error.message : String(error);
 return NextResponse.json(
 { error: `Upload failed: ${errorMsg}` },
 { status: 500 }
 );
 }
}
