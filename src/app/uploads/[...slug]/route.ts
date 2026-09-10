import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const safePath = path.normalize(slug.join("/")).replace(/^(\.\.[\/\\])+/, "");
    const filePath = path.join(process.cwd(), "public", "uploads", safePath);

    // Security check: ensure path is inside public/uploads
    const baseDir = path.resolve(process.cwd(), "public", "uploads");
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(baseDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const fileStat = await stat(resolvedPath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = await readFile(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
