"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isStaff, canManagePayments } from "@/lib/permissions/auth";
import bcryptjs from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createStudent(data: {
 firstName: string;
 lastName: string;
 username: string;
 password: string;
 phone: string;
 groupId?: string;
 status: string;
 parentName?: string;
 parentPhone?: string;
 parentRelationship?: string;
}) {
 const session = await getSession();

 if (!session || !canManagePayments(session)) {
 throw new Error("Unauthorized: Only Administrators and Managers can register students");
 }

 // Normalize username
 const normalizedUsername = data.username.trim().toLowerCase();

 // Check if username exists
 const existingUser = await prisma.user.findUnique({
 where: { username: normalizedUsername },
 });

 if (existingUser) {
 throw new Error("Username already exists");
 }

 // If groupId provided, verify group exists
 if (data.groupId) {
 const groupExists = await prisma.group.findUnique({
 where: { id: data.groupId },
 });
 if (!groupExists) {
 throw new Error("Group not found");
 }
 }

 // Hash password
 const passwordHash = await bcryptjs.hash(data.password, 10);

 // Create user
 const user = await prisma.user.create({
 data: {
 username: normalizedUsername,
 passwordHash,
 role: "STUDENT",
 },
 });

 // Create student profile
 const studentProfile = await prisma.studentProfile.create({
 data: {
 userId: user.id,
 firstName: data.firstName,
 lastName: data.lastName,
 phone: data.phone,
 groupId: data.groupId || null,
 status: (data.status as any) || "ACTIVE",
 },
 });

 // Create parent/guardian if provided
 if (data.parentName && data.parentPhone) {
 await prisma.parentGuardian.create({
 data: {
 studentId: studentProfile.id,
 fullName: data.parentName,
 phone: data.parentPhone,
 },
 });
 }

 return {
 studentId: studentProfile.id,
 userId: user.id,
 username: normalizedUsername,
 firstName: data.firstName,
 lastName: data.lastName,
 };
}

export async function updateStudent(
  studentId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    groupId?: string | null;
    status?: string;
    username?: string;
    password?: string;
    parentName?: string;
    parentPhone?: string;
  }
) {
  const session = await getSession();

  if (!session || !canManagePayments(session)) {
    throw new Error("Unauthorized: Only Administrators and Managers can update student records");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true, parent: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Update username if changed
  if (data.username) {
    const normalizedUsername = data.username.trim().toLowerCase();
    if (normalizedUsername !== student.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: normalizedUsername },
      });
      if (existingUser && existingUser.id !== student.userId) {
        throw new Error("Username already taken by another account");
      }
      await prisma.user.update({
        where: { id: student.userId },
        data: { username: normalizedUsername },
      });
    }
  }

  // Update password if provided
  if (data.password && data.password.trim().length > 0) {
    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    const passwordHash = await bcryptjs.hash(data.password, 10);
    await prisma.user.update({
      where: { id: student.userId },
      data: { passwordHash },
    });
  }

  // Check group if provided
  let targetGroupId: string | null = null;
  if (data.groupId && data.groupId !== "none" && data.groupId !== "") {
    const groupExists = await prisma.group.findUnique({
      where: { id: data.groupId },
    });
    if (!groupExists) {
      throw new Error("Selected group not found");
    }
    targetGroupId = data.groupId;
  }

  // Update student profile
  const studentUpdateData: any = {};
  if (data.firstName !== undefined) studentUpdateData.firstName = data.firstName;
  if (data.lastName !== undefined) studentUpdateData.lastName = data.lastName;
  if (data.phone !== undefined) studentUpdateData.phone = data.phone;
  if (data.status !== undefined) studentUpdateData.status = data.status;
  if (data.groupId !== undefined) studentUpdateData.groupId = targetGroupId;

  const updatedStudent = await prisma.studentProfile.update({
    where: { id: studentId },
    data: studentUpdateData,
  });

  // Handle parent/guardian
  if (data.parentName !== undefined || data.parentPhone !== undefined) {
    const pName = data.parentName?.trim() || "";
    const pPhone = data.parentPhone?.trim() || "";

    if (pName || pPhone) {
      await prisma.parentGuardian.upsert({
        where: { studentId },
        create: {
          studentId,
          fullName: pName,
          phone: pPhone,
        },
        update: {
          fullName: pName,
          phone: pPhone,
        },
      });
    } else if (student.parent) {
      await prisma.parentGuardian.delete({
        where: { studentId },
      });
    }
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/groups");
  return { success: true, student: updatedStudent };
}

export async function deleteStudent(studentId: string) {
  const session = await getSession();

  if (!session || !canManagePayments(session)) {
    throw new Error("Unauthorized: Only Administrators and Managers can delete students");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, userId: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Delete student and user account in a transaction
  await prisma.$transaction([
    prisma.studentProfile.delete({ where: { id: studentId } }),
    prisma.user.delete({ where: { id: student.userId } }),
  ]);

  revalidatePath("/admin/students");
  revalidatePath("/admin/groups");
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function changePassword(studentId: string, newPassword: string) {
  const session = await getSession();

  if (!session || !canManagePayments(session)) {
    throw new Error("Unauthorized: Only Administrators and Managers can reset student passwords");
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const passwordHash = await bcryptjs.hash(newPassword.trim(), 10);

  await prisma.user.update({
    where: { id: student.userId },
    data: { passwordHash },
  });

  return {
    success: true,
    message: `Password updated successfully for @${student.user.username}.`,
    username: student.user.username,
  };
}

export async function deactivateStudent(studentId: string) {
  const session = await getSession();

  if (!session || !canManagePayments(session)) {
    throw new Error("Unauthorized: Only Administrators and Managers can deactivate students");
  }

  return await prisma.studentProfile.update({
    where: { id: studentId },
    data: { status: "INACTIVE" },
  });
}

export async function activateStudent(studentId: string) {
  const session = await getSession();

  if (!session || !canManagePayments(session)) {
    throw new Error("Unauthorized: Only Administrators and Managers can activate students");
  }

  return await prisma.studentProfile.update({
    where: { id: studentId },
    data: { status: "ACTIVE" },
  });
}
