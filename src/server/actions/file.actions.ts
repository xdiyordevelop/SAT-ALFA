"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { validateFile, generateStorageKey } from "@/lib/storage/file-validator";
import { getStorageAdapter } from "@/lib/storage/adapter";

export async function uploadMockTestAttachment(
 formData: FormData,
 mockTestId: string
) {
 try {
 const session = await getSession();
 if (!session) {
 return { error: "Unauthorized" };
 }

 const file = formData.get("file") as File;
 if (!file) {
 return { error: "No file provided" };
 }

 const validation = validateFile(file);
 if (!validation.valid) {
 return { error: validation.error };
 }

 const mockTest = await prisma.mockTest.findUnique({
 where: { id: mockTestId },
 });

 if (!mockTest) {
 return { error: "Mock test not found" };
 }

 let studentProfileId = session.userId;
 if (session.role === "STUDENT") {
 const profile = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 });
 if (!profile) {
 return { error: "Student profile not found" };
 }
 studentProfileId = profile.id;
 if (mockTest.studentId && mockTest.studentId !== profile.id) {
 return { error: "Unauthorized" };
 }
 }

 const buffer = await file.arrayBuffer();
 const storageKey = generateStorageKey(file.name, mockTest.studentId || studentProfileId);
 const adapter = getStorageAdapter();

 await adapter.upload(Buffer.from(buffer), storageKey);

 const attachment = await prisma.mockTestAttachment.create({
 data: {
 mockTestId,
 fileName: file.name,
 fileType: file.type,
 fileSize: file.size,
 storageKey,
 },
 });

 return {
 success: true,
 attachment: {
 id: attachment.id,
 fileName: attachment.fileName,
 fileSize: attachment.fileSize,
 url: adapter.getUrl(storageKey),
 },
 };
 } catch (error: any) {
 return { error: error.message || "Upload failed" };
 }
}

export async function deleteMockTestAttachment(attachmentId: string) {
 try {
 const session = await getSession();
 if (!session) {
 return { error: "Unauthorized" };
 }

 const attachment = await prisma.mockTestAttachment.findUnique({
 where: { id: attachmentId },
 include: { mockTest: true },
 });

 if (!attachment) {
 return { error: "Attachment not found" };
 }

 if (session.role === "STUDENT") {
 const profile = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 });
 if (!profile || (attachment.mockTest.studentId && attachment.mockTest.studentId !== profile.id)) {
 return { error: "Unauthorized" };
 }
 }

 const adapter = getStorageAdapter();
 await adapter.delete(attachment.storageKey);

 await prisma.mockTestAttachment.delete({
 where: { id: attachmentId },
 });

 return { success: true };
 } catch (error: any) {
 return { error: error.message || "Delete failed" };
 }
}
