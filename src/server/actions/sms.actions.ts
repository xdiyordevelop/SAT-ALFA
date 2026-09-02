"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getSmsProvider, formatTestResultMessage, formatProgressUpdateMessage } from "@/lib/sms/provider";

export async function sendTestResultNotification(mockTestId: string) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return { error: "Unauthorized" };
 }

 const mockTest = await prisma.mockTest.findUnique({
 where: { id: mockTestId },
 include: {
 student: {
 include: { parent: true },
 },
 },
 });

 if (!mockTest || !mockTest.student || !mockTest.student.parent) {
 return { error: "Student or parent not found" };
 }

 if (!mockTest.score) {
 return { error: "Test has no score" };
 }

 const message = formatTestResultMessage(
 `${mockTest.student.firstName} ${mockTest.student.lastName}`,
 mockTest.testName,
 mockTest.score,
 mockTest.maxScore
 );

 const provider = getSmsProvider();
 const result = await provider.send({
 phoneNumber: mockTest.student.parent.phone,
 message,
 studentName: `${mockTest.student.firstName} ${mockTest.student.lastName}`,
 testName: mockTest.testName,
 score: mockTest.score,
 maxScore: mockTest.maxScore,
 });

 // Store SMS notification record
 const smsNotification = await prisma.smsNotification.create({
 data: {
 parentGuardianId: mockTest.student.parent.id,
 studentId: mockTest.student.id,
 mockTestId,
 message,
 status: result.success ? "SENT" : "FAILED",
 provider: process.env.SMS_PROVIDER || "mock",
 providerMessageId: result.messageId,
 errorMessage: result.error,
 sentAt: result.success ? new Date() : null,
 },
 });

 return {
 success: true,
 notification: smsNotification,
 };
 } catch (error: any) {
 console.error("SMS error:", error);
 return { error: error.message || "Failed to send SMS" };
 }
}

export async function sendProgressUpdateNotification(studentId: string) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return { error: "Unauthorized" };
 }

 const student = await prisma.studentProfile.findUnique({
 where: { id: studentId },
 include: { parent: true, mockTests: true, monthlyResults: true },
 });

 if (!student || !student.parent) {
 return { error: "Student or parent not found" };
 }

 // Calculate average score and improvement
 const testScores = student.mockTests
 .filter((t) => t.score !== null)
 .map((t) => (t.score || 0) / t.maxScore);

 if (testScores.length === 0) {
 return { error: "No test results available" };
 }

 const averageScore = (testScores.reduce((a, b) => a + b) / testScores.length) * 100;

 // Calculate improvement (simple: compare last 2 tests)
 let improvement = 0;
 if (testScores.length >= 2) {
 const lastScore = testScores[testScores.length - 1] * 100;
 const prevScore = testScores[testScores.length - 2] * 100;
 improvement = lastScore - prevScore;
 }

 const message = formatProgressUpdateMessage(
 `${student.firstName} ${student.lastName}`,
 averageScore,
 improvement
 );

 const provider = getSmsProvider();
 const result = await provider.send({
 phoneNumber: student.parent.phone,
 message,
 studentName: `${student.firstName} ${student.lastName}`,
 });

 const smsNotification = await prisma.smsNotification.create({
 data: {
 parentGuardianId: student.parent.id,
 studentId,
 message,
 status: result.success ? "SENT" : "FAILED",
 provider: process.env.SMS_PROVIDER || "mock",
 providerMessageId: result.messageId,
 errorMessage: result.error,
 sentAt: result.success ? new Date() : null,
 },
 });

 return {
 success: true,
 notification: smsNotification,
 stats: {
 averageScore: averageScore.toFixed(1),
 improvement: improvement.toFixed(1),
 },
 };
 } catch (error: any) {
 console.error("SMS error:", error);
 return { error: error.message || "Failed to send SMS" };
 }
}

export async function getSmsNotifications(limit: number = 50) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return { error: "Unauthorized" };
 }

 const notifications = await prisma.smsNotification.findMany({
 include: {
 parentGuardian: true,
 student: true,
 mockTest: true,
 },
 orderBy: { createdAt: "desc" },
 take: limit,
 });

 return {
 success: true,
 notifications,
 total: await prisma.smsNotification.count(),
 };
 } catch (error: any) {
 return { error: error.message || "Failed to fetch notifications" };
 }
}
