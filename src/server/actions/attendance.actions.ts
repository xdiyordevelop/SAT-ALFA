"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export async function markAttendance(
 studentId: string,
 groupId: string,
 date: Date,
 status: AttendanceStatus,
 note?: string
) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
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

 if (existingAttendance) {
 // Update existing
 return await prisma.attendance.update({
 where: { id: existingAttendance.id },
 data: {
 status,
 note: note || null,
 recordedBy: session.userId,
 updatedAt: new Date(),
 },
 });
 }

 // Create new
 return await prisma.attendance.create({
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

 if (!session || session.role !== "ADMIN") {
 throw new Error("Unauthorized");
 }

 const results = [];

 for (const record of records) {
 // Verify student belongs to this group
 const student = await prisma.studentProfile.findUnique({
 where: { id: record.studentId }
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

 if (existingAttendance) {
 results.push(
 await prisma.attendance.update({
 where: { id: existingAttendance.id },
 data: {
 status: record.status,
 note: record.note || null,
 recordedBy: session.userId,
 updatedAt: new Date(),
 },
 })
 );
 } else {
 results.push(
 await prisma.attendance.create({
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
 })
 );
 }
 }

 return results;
}

export async function getGroupStudents(groupId: string) {
 const session = await getSession();

 if (!session || session.role !== "ADMIN") {
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

 if (!session || session.role !== "ADMIN") {
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
