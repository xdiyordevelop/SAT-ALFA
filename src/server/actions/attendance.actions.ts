"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";
import { createNotification } from "@/server/actions/notification.actions";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export async function markAttendance(
 studentId: string,
 groupId: string,
 date: Date,
 status: AttendanceStatus,
 note?: string
) {
 const session = await getSession();

 if (!session || !isStaff(session)) {
 throw new Error("Unauthorized");
 }

 // Prevent marking attendance for future dates
 const todayEnd = new Date();
 todayEnd.setHours(23, 59, 59, 999);
 if (date > todayEnd) {
   throw new Error("Cannot mark attendance for a future date. This date has not arrived yet.");
 }

 // Verify student belongs to this group
 const student = await prisma.studentProfile.findUnique({
 where: { id: studentId }
 });
 
 if (!student || student.groupId !== groupId) {
 throw new Error("Student does not belong to this group");
 }

 // Check if attendance already exists
 const existingAttendance = await prisma.attendance.findFirst({
 where: {
 studentId,
 groupId,
 date: {
 gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
 lt: new Date(
 date.getFullYear(),
 date.getMonth(),
 date.getDate() + 1
 ),
 },
 },
 });

  let result;
  if (existingAttendance) {
    // Update existing
    result = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        status,
        note: note || null,
        recordedBy: session.userId,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new
    result = await prisma.attendance.create({
      data: {
        studentId,
        groupId,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        status,
        note: note || null,
        recordedBy: session.userId,
      },
    });
  }

  if (student.userId && (status === "ABSENT" || status === "LATE")) {
    const dateFormatted = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const statusText =
      status === "ABSENT"
        ? "Marked as Absent"
        : "Marked as Late";
    createNotification(student.userId, {
      title: "Attendance Alert",
      message: `${dateFormatted} - Attendance recorded: ${statusText}.`,
      type: "ATTENDANCE",
      link: "/student/dashboard",
    }).catch((err) => console.error("Attendance notification error:", err));
  }

  return result;
}

export async function bulkMarkAttendance(
  records: Array<{
    studentId: string;
    groupId: string;
    date: Date;
    status: AttendanceStatus;
    note?: string;
  }>
) {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    throw new Error("Unauthorized");
  }

  // Prevent marking attendance for future dates
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  for (const record of records) {
    if (record.date > todayEnd) {
      throw new Error(
        "Cannot mark attendance for a future date. This date has not arrived yet."
      );
    }
  }

  const results = [];

  for (const record of records) {
    // Verify student belongs to this group
    const student = await prisma.studentProfile.findUnique({
      where: { id: record.studentId },
    });

    if (!student || student.groupId !== record.groupId) {
      continue; // Skip invalid records
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: record.studentId,
        groupId: record.groupId,
        date: {
          gte: new Date(
            record.date.getFullYear(),
            record.date.getMonth(),
            record.date.getDate()
          ),
          lt: new Date(
            record.date.getFullYear(),
            record.date.getMonth(),
            record.date.getDate() + 1
          ),
        },
      },
    });

    let savedRecord;
    if (existingAttendance) {
      savedRecord = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: record.status,
          note: record.note || null,
          recordedBy: session.userId,
          updatedAt: new Date(),
        },
      });
    } else {
      savedRecord = await prisma.attendance.create({
        data: {
          studentId: record.studentId,
          groupId: record.groupId,
          date: new Date(
            record.date.getFullYear(),
            record.date.getMonth(),
            record.date.getDate()
          ),
          status: record.status,
          note: record.note || null,
          recordedBy: session.userId,
        },
      });
    }
    results.push(savedRecord);

    if (
      student.userId &&
      (record.status === "ABSENT" || record.status === "LATE")
    ) {
      const dateFormatted = new Date(record.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const statusText =
        record.status === "ABSENT"
          ? "Marked as Absent"
          : "Marked as Late";
      createNotification(student.userId, {
        title: "Attendance Alert",
        message: `${dateFormatted} - Attendance recorded: ${statusText}.`,
        type: "ATTENDANCE",
        link: "/student/dashboard",
      }).catch((err) => console.error("Bulk attendance notif error:", err));
    }
  }

  return results;
}

export async function getGroupStudents(groupId: string) {
 const session = await getSession();

 if (!session || !isStaff(session)) {
 throw new Error("Unauthorized");
 }

 return await prisma.studentProfile.findMany({
 where: {
 groupId,
 status: "ACTIVE",
 },
 select: {
 id: true,
 firstName: true,
 lastName: true,
 phone: true,
 enrollmentDate: true,
 },
 orderBy: { firstName: "asc" },
 });
}

export async function getAttendanceForDate(groupId: string, date: Date) {
 const session = await getSession();

 if (!session || !isStaff(session)) {
 throw new Error("Unauthorized");
 }

 const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
 const endDate = new Date(
 date.getFullYear(),
 date.getMonth(),
 date.getDate() + 1
 );

 return await prisma.attendance.findMany({
 where: {
 groupId,
 date: {
 gte: startDate,
 lt: endDate,
 },
 },
 });
}

export async function getAttendanceHistory(filters: {
  date?: string; // YYYY-MM-DD or empty
  groupId?: string;
  status?: string;
  search?: string;
}) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    throw new Error("Unauthorized");
  }

  const whereClause: any = {};

  // Date filter
  if (filters.date && filters.date !== "ALL") {
    const [year, month, day] = filters.date.split("-").map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0);
    const endDate = new Date(year, month - 1, day + 1, 0, 0, 0);
    whereClause.date = {
      gte: startDate,
      lt: endDate,
    };
  }

  // Group filter
  if (filters.groupId && filters.groupId !== "ALL") {
    whereClause.groupId = filters.groupId;
  }

  // Status filter
  if (filters.status && filters.status !== "ALL") {
    whereClause.status = filters.status as AttendanceStatus;
  }

  // Search filter (name or phone)
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    whereClause.student = {
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
        { user: { username: { contains: term, mode: "insensitive" } } },
      ],
    };
  }

  const [records, groups] = await Promise.all([
    prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: { select: { username: true } },
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 200,
    }),
    prisma.group.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Compute stats on the fetched records
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const excused = records.filter((r) => r.status === "EXCUSED").length;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return {
    records,
    groups,
    stats: {
      total,
      present,
      absent,
      late,
      excused,
      percentage,
    },
  };
}

export async function updateAttendanceRecord(
  attendanceId: string,
  status: AttendanceStatus,
  note?: string
) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    throw new Error("Unauthorized");
  }

  return await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      status,
      note: note !== undefined ? note : undefined,
      recordedBy: session.userId,
      updatedAt: new Date(),
    },
  });
}

export async function deleteAttendanceRecord(attendanceId: string) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    throw new Error("Unauthorized");
  }

  return await prisma.attendance.delete({
    where: { id: attendanceId },
  });
}
