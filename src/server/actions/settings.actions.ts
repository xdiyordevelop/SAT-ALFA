"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession, setSession } from "@/lib/auth/session";
import { isSuperAdmin } from "@/lib/permissions/auth";
import bcryptjs from "bcryptjs";

// Store settings in a simple JSON format
const DEFAULT_SETTINGS = {
 general: {
 centerName: "SAT ALFA Education Center",
 logo: null,
 phone: "+998 (99) 123-45-67",
 email: "info@satalfa.uz",
 address: "Tashkent, Uzbekistan",
 website: "www.satalfa.uz",
 telegramSupport: "@satalfa_support",
 currency: "UZS",
 timezone: "Asia/Tashkent",
 },
 academic: {
  satTargetScore: 1200,
  mockFullscreenExitLimit: 5,
  defaultMonthlyFee: 500000,
  lateThresholdMinutes: 15,
 },
 attendance: {
 lateThreshold: 15,
 enableLateStatus: true,
 enableExcusedStatus: true,
 defaultStatus: "PRESENT",
 },
 payment: {
 defaultMonthlyFee: 500000,
 gracePeriod: 0,
 currency: "UZS",
 },
 notifications: {
 smsEnabled: true,
 parentNotificationsEnabled: true,
 attendanceNotificationsEnabled: true,
 paymentRemindersEnabled: true,
 testResultNotificationsEnabled: true,
 },
};

export async function updateGeneralSettings(data: {
 centerName: string;
 phone: string;
 email: string;
 address: string;
 website: string;
 telegramSupport?: string;
 currency: string;
 timezone: string;
}) {
 const session = await getSession();

 if (!session || !isSuperAdmin(session)) {
 throw new Error("Unauthorized");
 }

 // Store settings - in production this would be in a settings table
 return data;
}

export async function updateAcademicSettings(data: {
  satTargetScore: number;
  mockFullscreenExitLimit: number;
  defaultMonthlyFee: number;
  lateThresholdMinutes: number;
}) {
  const session = await getSession();

  if (!session || !isSuperAdmin(session)) {
    throw new Error("Unauthorized");
  }

  return data;
}

export async function updateAttendanceSettings(data: {
 lateThreshold: number;
 enableLateStatus: boolean;
 enableExcusedStatus: boolean;
 defaultStatus: string;
}) {
 const session = await getSession();

 if (!session || !isSuperAdmin(session)) {
 throw new Error("Unauthorized");
 }

 return data;
}

export async function updatePaymentSettings(data: {
 defaultMonthlyFee: number;
 gracePeriod: number;
 currency: string;
}) {
 const session = await getSession();

 if (!session || !isSuperAdmin(session)) {
 throw new Error("Unauthorized");
 }

 return data;
}

export async function updateNotificationSettings(data: {
 smsEnabled: boolean;
 parentNotificationsEnabled: boolean;
 attendanceNotificationsEnabled: boolean;
 paymentRemindersEnabled: boolean;
 testResultNotificationsEnabled: boolean;
}) {
 const session = await getSession();

 if (!session || !isSuperAdmin(session)) {
 throw new Error("Unauthorized");
 }

 return data;
}

export async function updateUserProfile(userId: string, data: {
 currentPassword?: string;
 newPassword?: string;
 phone?: string;
}) {
 const session = await getSession();

 if (!session) {
 throw new Error("Unauthorized");
 }

 const user = await prisma.user.findUnique({
 where: { id: userId },
 });

 if (!user) {
 throw new Error("User not found");
 }

 if (data.currentPassword && data.newPassword) {
 const passwordMatch = await bcryptjs.compare(
 data.currentPassword,
 user.passwordHash
 );

 if (!passwordMatch) {
 throw new Error("Current password is incorrect");
 }

 if (data.newPassword.length < 6) {
 throw new Error("New password must be at least 6 characters");
 }

 const passwordHash = await bcryptjs.hash(data.newPassword, 10);

 await prisma.user.update({
 where: { id: userId },
 data: { passwordHash },
 });
 }

 if (data.phone) {
 const student = await prisma.studentProfile.findUnique({
 where: { userId },
 });

 if (student) {
 await prisma.studentProfile.update({
 where: { id: student.id },
 data: { phone: data.phone },
 });
 }
 }

 return { success: true };
}

export async function getDefaultSettings() {
 return DEFAULT_SETTINGS;
}

export async function updateSuperAdminCredentialsAction(data: {
  currentPassword: string;
  newUsername?: string;
  newPassword?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Authentication required." };
  }
  if (!isSuperAdmin(session)) {
    return {
      success: false,
      error: "Only Super Administrators can modify master credentials.",
    };
  }

  if (!data.currentPassword) {
    return {
      success: false,
      error: "Current password is required to verify identity.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return { success: false, error: "User account not found." };
  }

  const isCurrentPasswordValid = await bcryptjs.compare(
    data.currentPassword,
    user.passwordHash,
  );
  if (!isCurrentPasswordValid) {
    return {
      success: false,
      error: "The current password you entered is incorrect.",
    };
  }

  let normalizedNewUsername = data.newUsername?.trim().toLowerCase();
  let usernameChanged = false;

  if (
    normalizedNewUsername &&
    normalizedNewUsername !== user.username.toLowerCase()
  ) {
    if (normalizedNewUsername.length < 3) {
      return {
        success: false,
        error: "Username must be at least 3 characters long.",
      };
    }
    // Check if taken
    const existing = await prisma.user.findUnique({
      where: { username: normalizedNewUsername },
    });
    if (existing && existing.id !== user.id) {
      return {
        success: false,
        error: "This username is already taken by another account.",
      };
    }
    usernameChanged = true;
  } else {
    normalizedNewUsername = user.username;
  }

  let newPasswordHash = user.passwordHash;
  let passwordChanged = false;

  if (data.newPassword && data.newPassword.trim()) {
    if (data.newPassword.length < 8) {
      return {
        success: false,
        error:
          "New password must be at least 8 characters long for Super Admin accounts.",
      };
    }
    newPasswordHash = await bcryptjs.hash(data.newPassword, 10);
    passwordChanged = true;
  }

  if (!usernameChanged && !passwordChanged) {
    return {
      success: false,
      error:
        "No changes detected. Please specify a new username or new password.",
    };
  }

  // Update in database
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      username: normalizedNewUsername,
      passwordHash: newPasswordHash,
    },
  });

  // Refresh active JWT session cookie
  await setSession({
    userId: updatedUser.id,
    username: updatedUser.username,
    role: updatedUser.role as any,
  });

  return {
    success: true,
    newUsername: updatedUser.username,
    usernameChanged,
    passwordChanged,
    message: "Super Admin credentials updated successfully.",
  };
}
