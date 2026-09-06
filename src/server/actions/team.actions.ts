"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageTeam } from "@/lib/permissions/auth";
import { hashPassword } from "@/lib/utils/helpers";
import { revalidatePath } from "next/cache";

export type StaffRole = "SUPER_ADMIN" | "TEACHER" | "MANAGER";

export interface TeamMemberItem {
  id: string;
  username: string;
  role: string;
  fullName: string;
  phone: string | null;
  roleTitle: string | null;
  createdAt: Date;
}

export async function getTeamMembers(): Promise<TeamMemberItem[]> {
  const session = await getSession();
  if (!session || !canManageTeam(session)) {
    throw new Error("Unauthorized: Super Admin access required");
  }

  const staffUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ["SUPER_ADMIN", "ADMIN", "TEACHER", "MANAGER"],
      },
    },
    include: {
      staff: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return staffUsers.map((user) => ({
    id: user.id,
    username: user.username,
    role: user.role === "ADMIN" ? "SUPER_ADMIN" : user.role,
    fullName: user.staff?.fullName || user.username,
    phone: user.staff?.phone || null,
    roleTitle: user.staff?.roleTitle || null,
    createdAt: user.createdAt,
  }));
}

export async function createTeamMember(data: {
  fullName: string;
  username: string;
  password: string;
  role: StaffRole;
  phone?: string;
  roleTitle?: string;
}) {
  const session = await getSession();
  if (!session || !canManageTeam(session)) {
    return { success: false, error: "Unauthorized: Super Admin access required" };
  }

  const fullName = data.fullName.trim();
  const username = data.username.trim().toLowerCase();
  const password = data.password.trim();

  if (!fullName) {
    return { success: false, error: "Full Name is required" };
  }
  if (!username || username.length < 3) {
    return { success: false, error: "Username or email must be at least 3 characters long" };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long" };
  }
  if (!["SUPER_ADMIN", "TEACHER", "MANAGER"].includes(data.role)) {
    return { success: false, error: "Invalid role specified" };
  }

  // Check unique username or email
  const existing = await prisma.user.findUnique({
    where: { username },
  });
  if (existing) {
    return { success: false, error: "This username or email is already taken. Please choose another." };
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: data.role,
      staff: {
        create: {
          fullName,
          phone: data.phone?.trim() || null,
          roleTitle: data.roleTitle?.trim() || null,
        },
      },
    },
    include: { staff: true },
  });

  revalidatePath("/admin/settings/team");
  return {
    success: true,
    member: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      fullName: newUser.staff?.fullName || newUser.username,
      phone: newUser.staff?.phone || null,
      roleTitle: newUser.staff?.roleTitle || null,
      createdAt: newUser.createdAt,
    },
  };
}

export async function updateTeamMember(
  id: string,
  data: {
    fullName?: string;
    role?: StaffRole;
    phone?: string;
    roleTitle?: string;
    password?: string;
  }
) {
  const session = await getSession();
  if (!session || !canManageTeam(session)) {
    return { success: false, error: "Unauthorized: Super Admin access required" };
  }

  const target = await prisma.user.findUnique({
    where: { id },
    include: { staff: true },
  });
  if (!target) {
    return { success: false, error: "Staff member not found" };
  }

  // Prevent demoting the last super admin
  if (data.role && data.role !== "SUPER_ADMIN" && (target.role === "SUPER_ADMIN" || target.role === "ADMIN")) {
    const superAdminCount = await prisma.user.count({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
    });
    if (superAdminCount <= 1) {
      return { success: false, error: "Cannot change the role of the only remaining Super Admin" };
    }
  }

  const updateData: {
    role?: StaffRole;
    passwordHash?: string;
  } = {};

  if (data.role) {
    updateData.role = data.role;
  }
  if (data.password && data.password.trim().length >= 6) {
    updateData.passwordHash = await hashPassword(data.password.trim());
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(updateData).length > 0) {
      await tx.user.update({
        where: { id },
        data: updateData,
      });
    }

    await tx.staffProfile.upsert({
      where: { userId: id },
      update: {
        ...(data.fullName !== undefined && { fullName: data.fullName.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() || null }),
        ...(data.roleTitle !== undefined && { roleTitle: data.roleTitle.trim() || null }),
      },
      create: {
        userId: id,
        fullName: data.fullName?.trim() || target.username,
        phone: data.phone?.trim() || null,
        roleTitle: data.roleTitle?.trim() || null,
      },
    });
  });

  revalidatePath("/admin/settings/team");
  return { success: true };
}

export async function deleteTeamMember(id: string) {
  const session = await getSession();
  if (!session || !canManageTeam(session)) {
    return { success: false, error: "Unauthorized: Super Admin access required" };
  }

  if (id === session.userId) {
    return { success: false, error: "You cannot delete your own account" };
  }

  const target = await prisma.user.findUnique({
    where: { id },
  });
  if (!target) {
    return { success: false, error: "Staff member not found" };
  }

  if (target.role === "SUPER_ADMIN" || target.role === "ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
    });
    if (superAdminCount <= 1) {
      return { success: false, error: "Cannot delete the only remaining Super Admin account" };
    }
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/settings/team");
  return { success: true };
}
