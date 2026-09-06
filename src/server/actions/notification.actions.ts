"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";
import { revalidatePath } from "next/cache";

export type NotificationType =
  | "MOCK_TEST"
  | "RESULT"
  | "LESSON"
  | "ARTICLE"
  | "PAYMENT"
  | "ATTENDANCE"
  | "ANNOUNCEMENT";

export interface StudentNotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export async function getStudentNotifications(): Promise<{
  notifications: StudentNotificationItem[];
  unreadCount: number;
}> {
  const session = await getSession();
  if (!session || !session.userId) {
    return { notifications: [], unreadCount: 0 };
  }

  if (!prisma.notification) {
    return { notifications: [], unreadCount: 0 };
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({
      where: { userId: session.userId, isRead: false },
    }),
  ]);

  return {
    notifications: notifications as StudentNotificationItem[],
    unreadCount,
  };
}

export async function getUserNotifications(options?: {
  type?: string;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{
  notifications: StudentNotificationItem[];
  totalCount: number;
  unreadCount: number;
}> {
  const session = await getSession();
  if (!session || !session.userId) {
    return { notifications: [], totalCount: 0, unreadCount: 0 };
  }

  if (!prisma.notification) {
    return { notifications: [], totalCount: 0, unreadCount: 0 };
  }

  const whereClause: any = {
    userId: session.userId,
  };

  if (options?.type && options.type !== "ALL") {
    whereClause.type = options.type as NotificationType;
  }

  if (typeof options?.isRead === "boolean") {
    whereClause.isRead = options.isRead;
  }

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const [notifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({
      where: whereClause,
    }),
    prisma.notification.count({
      where: { userId: session.userId, isRead: false },
    }),
  ]);

  return {
    notifications: notifications as StudentNotificationItem[],
    totalCount,
    unreadCount,
  };
}

export async function markNotificationAsRead(id: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  if (!prisma.notification) return { success: false };

  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { isRead: true },
  });

  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  if (!prisma.notification) return { success: false };

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/student/notifications");
  return { success: true };
}

export async function deleteNotification(id: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  if (!prisma.notification) return { success: false };

  await prisma.notification.deleteMany({
    where: { id, userId: session.userId },
  });

  revalidatePath("/student/notifications");
  return { success: true };
}

export async function clearAllNotifications(onlyRead: boolean = false) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  if (!prisma.notification) return { success: false };

  const where: any = { userId: session.userId };
  if (onlyRead) {
    where.isRead = true;
  }

  await prisma.notification.deleteMany({
    where,
  });

  revalidatePath("/student/notifications");
  return { success: true };
}

export async function createNotification(
  userId: string,
  data: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  }
) {
  if (!prisma.notification) return null;
  return await prisma.notification.create({
    data: {
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link || null,
    },
  });
}

export async function createGroupNotification(
  groupId: string,
  data: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  }
) {
  if (!prisma.notification) return { count: 0 };
  const students = await prisma.studentProfile.findMany({
    where: { groupId },
    select: { userId: true },
  });

  if (students.length === 0) return { count: 0 };

  const notificationsData = students
    .filter((s) => s.userId)
    .map((s) => ({
      userId: s.userId!,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link || null,
    }));

  if (notificationsData.length === 0) return { count: 0 };

  const result = await prisma.notification.createMany({
    data: notificationsData,
  });

  return { count: result.count };
}

export async function createBroadcastNotification(data: {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}) {
  if (!prisma.notification) return { count: 0 };
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true },
  });

  if (users.length === 0) return { count: 0 };

  const notificationsData = users.map((u) => ({
    userId: u.id,
    title: data.title,
    message: data.message,
    type: data.type,
    link: data.link || null,
  }));

  const result = await prisma.notification.createMany({
    data: notificationsData,
  });

  return { count: result.count };
}

export type NotificationTargetType = "ALL" | "GROUP" | "STUDENT" | "STAFF";

export async function sendManualNotification(payload: {
  targetType: NotificationTargetType;
  targetId?: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    throw new Error("Unauthorized");
  }

  if (!payload.title?.trim() || !payload.message?.trim()) {
    throw new Error("Title and message are required");
  }

  const cleanTitle = payload.title.trim();
  const cleanMessage = payload.message.trim();
  const cleanLink = payload.link?.trim() || null;

  let recipientUserIds: string[] = [];

  if (payload.targetType === "ALL") {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });
    recipientUserIds = students.map((s) => s.id);
  } else if (payload.targetType === "GROUP") {
    if (!payload.targetId) {
      throw new Error("Group ID is required for group notifications");
    }
    const profiles = await prisma.studentProfile.findMany({
      where: { groupId: payload.targetId },
      select: { userId: true },
    });
    recipientUserIds = profiles.map((p) => p.userId).filter((id): id is string => !!id);
  } else if (payload.targetType === "STUDENT") {
    if (!payload.targetId) {
      throw new Error("Student ID is required");
    }
    // targetId can be either StudentProfile.id or User.id
    const user = await prisma.user.findUnique({
      where: { id: payload.targetId },
      select: { id: true },
    });
    if (user) {
      recipientUserIds = [user.id];
    } else {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: payload.targetId },
        select: { userId: true },
      });
      if (profile?.userId) {
        recipientUserIds = [profile.userId];
      }
    }
  } else if (payload.targetType === "STAFF") {
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN", "TEACHER", "MANAGER"] },
      },
      select: { id: true },
    });
    recipientUserIds = staffUsers.map((u) => u.id);
  }

  if (recipientUserIds.length === 0) {
    return { success: false, count: 0, error: "No recipients found for this target." };
  }

  // Deduplicate user IDs
  const uniqueUserIds = Array.from(new Set(recipientUserIds));

  const records = uniqueUserIds.map((userId) => ({
    userId,
    title: cleanTitle,
    message: cleanMessage,
    type: payload.type || "ANNOUNCEMENT",
    link: cleanLink,
  }));

  const result = await prisma.notification.createMany({
    data: records,
  });

  revalidatePath("/admin/notifications");
  revalidatePath("/student/notifications");

  return { success: true, count: result.count };
}

export async function getNotificationTargetOptions() {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    throw new Error("Unauthorized");
  }

  const [groups, students] = await Promise.all([
    prisma.group.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        _count: {
          select: { studentProfiles: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.studentProfile.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userId: true,
        group: {
          select: { name: true },
        },
        user: {
          select: { username: true },
        },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  return {
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      studentCount: g._count.studentProfiles,
    })),
    students: students.map((s) => ({
      id: s.id,
      userId: s.userId,
      name: `${s.firstName} ${s.lastName}`,
      username: s.user?.username || "",
      groupName: s.group?.name || "No group",
    })),
  };
}

export async function getRecentNotificationsHistory() {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    throw new Error("Unauthorized");
  }

  const recent = await prisma.notification.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true,
          student: {
            select: { firstName: true, lastName: true },
          },
          staff: {
            select: { fullName: true },
          },
        },
      },
    },
  });

  return recent.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt,
    recipient: {
      username: n.user.username,
      role: n.user.role,
      name: n.user.student
        ? `${n.user.student.firstName} ${n.user.student.lastName}`
        : n.user.staff?.fullName || n.user.username,
    },
  }));
}
