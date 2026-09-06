import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
 try {
 const session = await getSession();

 if (!session || !canManageAcademics(session)) {
 return NextResponse.json(
 { message: "Unauthorized" },
 { status: 401 }
 );
 }

 const body = await request.json();
 const { title, description, subject, bookTitle, bookPdfPath, videoPath, groupIds } = body;

 if (!title) {
 return NextResponse.json(
 { message: "Topic title is required" },
 { status: 400 }
 );
 }

 // Determine orderIndex (optional)
 const topicCount = await prisma.topic.count({ where: { subject } });

 const topic = await prisma.topic.create({
 data: {
 title,
 description: description || "",
 subject: subject || "MATH",
 bookTitle,
 bookPdfPath,
 videoPath,
 orderIndex: topicCount,
 },
 });

 if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
 const groupProgress = await Promise.all(
 groupIds.map(async (groupId) => {
 // get the current max order for this group
 const maxOrderRes = await prisma.groupTopicProgress.findFirst({
 where: { groupId },
 orderBy: { order: 'desc' },
 select: { order: true }
 });
 const maxOrder = maxOrderRes?.order ?? -1;

 return prisma.groupTopicProgress.create({
 data: {
 groupId,
 topicId: topic.id,
 order: maxOrder + 1
 }
 });
 })
 );
 }

 return NextResponse.json(
 {
 message: "Topic created successfully",
 data: topic,
 },
 { status: 201 }
 );
 } catch (error) {
 console.error("Error creating topic:", error);
 return NextResponse.json(
 { message: "Failed to create topic" },
 { status: 500 }
 );
 }
}
