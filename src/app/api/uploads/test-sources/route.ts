import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isStaff(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = join(process.cwd(), "public", "uploads", "test-sources");
    await mkdir(uploadDir, { recursive: true });

    // Clean filename
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `src-${Date.now()}-${cleanName}`;
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/test-sources/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileType: file.type || "application/pdf",
      size: file.size,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[TEST_SOURCE_UPLOAD_ERROR]", errorMsg);
    return NextResponse.json(
      { error: `Source file upload failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
