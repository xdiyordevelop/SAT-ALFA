"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
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
 currency: "UZS",
 timezone: "Asia/Tashkent",
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
 currency: string;
 timezone: string;
}) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
 }

 // Store settings - in production this would be in a settings table
 return data;
}

export async function updateAttendanceSettings(data: {
 lateThreshold: number;
 enableLateStatus: boolean;
 enableExcusedStatus: boolean;
 defaultStatus: string;
}) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
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

 if (!session || session.role !== "ADMIN") {
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

 if (!session || session.role !== "ADMIN") {
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
