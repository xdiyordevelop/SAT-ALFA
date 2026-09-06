import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createGroupNotification } from "@/server/actions/notification.actions";

// Add a topic to a group's roadmap
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: groupId } = await params;
    const body = await request.json();
    const { topicId } = body;
    if (!topicId) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 },
      );
    }
    const maxOrderRes = await prisma.groupTopicProgress.findFirst({
      where: { groupId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const maxOrder = maxOrderRes?.order ?? -1;
    const progress = await prisma.groupTopicProgress.create({
      data: { groupId, topicId, order: maxOrder + 1 },
      include: { topic: true },
    });
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error adding topic to group:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Update approval status of a topic for a group
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !canManageAcademics(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: groupId } = await params;
    const body = await request.json();
    const { progressId, isApproved } = body;
    if (!progressId || typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const updated = await prisma.groupTopicProgress.update({
      where: { id: progressId },
      data: {
        isApproved,
        approvedAt: isApproved ? new Date() : null,
      },
      include: {
        topic: { select: { title: true } },
      },
    });

    if (isApproved && updated.topic) {
      createGroupNotification(groupId, {
        title: "New Lesson Unlocked",
        message: `The lesson "${updated.topic.title}" is now unlocked for your group. You can now access the lesson materials.`,
        type: "LESSON",
        link: `/student/topics/${updated.topicId}`,
      }).catch((err) => console.error("Curriculum notification error:", err));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating topic progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
