import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      subject,
      bookTitle,
      bookPdfPath,
      videoPath,
      groupIds,
    } = body;
    if (!title) {
      return NextResponse.json(
        { message: "Topic title is required" },
        { status: 400 },
      );
    }
    const topic = await prisma.topic.update({
      where: { id },
      data: {
        title,
        description: description || "",
        subject: subject || "MATH",
        bookTitle,
        bookPdfPath,
        videoPath,
      },
    });

    // Update group relations
    await prisma.groupTopicProgress.deleteMany({ where: { topicId: id } });
    if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
      await Promise.all(
        groupIds.map(async (groupId) => {
          const maxOrderRes = await prisma.groupTopicProgress.findFirst({
            where: { groupId },
            orderBy: { order: "desc" },
            select: { order: true },
          });
          const maxOrder = maxOrderRes?.order ?? -1;
          return prisma.groupTopicProgress.create({
            data: { groupId, topicId: topic.id, order: maxOrder + 1 },
          });
        }),
      );
    }
    return NextResponse.json(
      { message: "Topic updated successfully", data: topic },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { message: "Failed to update topic" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.topic.delete({ where: { id } });
    return NextResponse.json(
      { message: "Topic deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { message: "Failed to delete topic" },
      { status: 500 },
    );
  }
}
