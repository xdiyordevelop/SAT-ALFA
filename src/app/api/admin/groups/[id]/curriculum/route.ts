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
    const rawTopicIds = body.topicIds || (body.topicId ? [body.topicId] : []);
    
    if (!Array.isArray(rawTopicIds) || rawTopicIds.length === 0) {
      return NextResponse.json(
        { error: "At least one Topic ID is required" },
        { status: 400 },
      );
    }

    // Check existing progress to avoid duplicate key conflicts
    const existing = await prisma.groupTopicProgress.findMany({
      where: { groupId },
      select: { topicId: true },
    });
    const existingSet = new Set(existing.map((e) => e.topicId));
    
    // Preserve selection order, filtering out any already added
    const toAdd = rawTopicIds.filter((tId: string) => !existingSet.has(tId));
    if (toAdd.length === 0) {
      return NextResponse.json(
        { error: "Selected topics are already added to this roadmap" },
        { status: 400 },
      );
    }

    const maxOrderRes = await prisma.groupTopicProgress.findFirst({
      where: { groupId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const startOrder = (maxOrderRes?.order ?? -1) + 1;

    // Create in batch transaction preserving exact selection order
    const createdProgress = await prisma.$transaction(
      toAdd.map((tId: string, idx: number) =>
        prisma.groupTopicProgress.create({
          data: {
            groupId,
            topicId: tId,
            order: startOrder + idx,
          },
          include: { topic: true },
        }),
      ),
    );

    // If caller passed single topicId, return single object for backward compatibility
    if (body.topicId && !body.topicIds) {
      return NextResponse.json(createdProgress[0]);
    }

    return NextResponse.json(createdProgress);
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
