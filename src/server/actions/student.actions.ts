"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import bcryptjs from "bcryptjs";

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

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
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

export async function updateStudent(studentId: string, data: Partial<{
 firstName: string;
 lastName: string;
 phone: string;
 groupId: string;
 status: string;
 }>) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
 }

 const updateData: any = { ...data };
 if (data.status) {
 updateData.status = data.status;
 }
 if (data.groupId === undefined) {
 delete updateData.groupId;
 }

 return await prisma.studentProfile.update({
 where: { id: studentId },
 data: updateData,
 });
}

export async function changePassword(studentId: string, newPassword: string) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
 }

 const student = await prisma.studentProfile.findUnique({
 where: { id: studentId },
 include: { user: true },
 });

 if (!student) {
 throw new Error("Student not found");
 }

 const passwordHash = await bcryptjs.hash(newPassword, 10);

 await prisma.user.update({
 where: { id: student.userId },
 data: { passwordHash },
 });
}

export async function deactivateStudent(studentId: string) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
 }

 return await prisma.studentProfile.update({
 where: { id: studentId },
 data: { status: "INACTIVE" },
 });
}

export async function activateStudent(studentId: string) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
 }

 return await prisma.studentProfile.update({
 where: { id: studentId },
 data: { status: "ACTIVE" },
 });
}
