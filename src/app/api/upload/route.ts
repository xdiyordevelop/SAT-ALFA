import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
 try {
 const session = await getSession();
 if (!session || !isStaff(session)) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const formData = await request.formData();
 const file = formData.get("file") as File | null;
 const type = formData.get("type") as string | null;

 if (!file || !type) {
 return NextResponse.json({ error: "File and type are required" }, { status: 400 });
 }

 const buffer = Buffer.from(await file.arrayBuffer());
 const fileExt = path.extname(file.name).toLowerCase();
 
 // Generate unique filename
 const uniqueId = crypto.randomBytes(8).toString('hex');
 const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
 const newFilename = `${uniqueId}-${safeName}`;

 let subDir = "";
 if (type === "pdf") {
 if (fileExt !== ".pdf") {
 return NextResponse.json({ error: "Only PDF files are allowed for books" }, { status: 400 });
 }
 subDir = "books";
 } else if (type === "video") {
 return NextResponse.json(
   { error: "Direct video upload is disabled to save server storage. Please use YouTube links instead." },
   { status: 400 }
 );
 } else if (type === "image") {
 if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fileExt)) {
 return NextResponse.json({ error: "Invalid image format. Allowed: jpg, png, webp, gif" }, { status: 400 });
 }
 subDir = "articles"; // Use 'articles' for now, can be generic 'images'
 } else {
 return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
 }

 const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
 await mkdir(uploadDir, { recursive: true });
 const filePath = path.join(uploadDir, newFilename);
 
 await writeFile(filePath, buffer);

 const fileUrl = `/uploads/${subDir}/${newFilename}`;

 return NextResponse.json({ url: fileUrl, name: file.name, size: file.size });
 } catch (error) {
 console.error("Upload error:", error);
 return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}
