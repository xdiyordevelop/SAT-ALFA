"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { analyzeTestPerformance } from "@/lib/ai/analysis";

export async function triggerTestAnalysis(mockTestId: string) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return { error: "Unauthorized" };
 }

 const mockTest = await prisma.mockTest.findUnique({
 where: { id: mockTestId },
 include: { student: true },
 });

 if (!mockTest || !mockTest.student) {
 return { error: "Mock test not found" };
 }

 if (mockTest.status !== "PENDING") {
 return { error: "Test must be in PENDING status for analysis" };
 }

 let questions = [];
 try {
 questions = JSON.parse(mockTest.questions);
 } catch (e) {
 return { error: "Invalid test questions format" };
 }

 const analysis = await analyzeTestPerformance({
 testId: mockTestId,
 studentId: mockTest.studentId || "",
 testName: mockTest.testName,
 subject: mockTest.subject,
 questions,
 answers: mockTest.answers ? JSON.parse(mockTest.answers) : [],
 score: mockTest.score || 0,
 maxScore: mockTest.maxScore,
 });

 // Store analysis results
 const updatedTest = await prisma.mockTest.update({
 where: { id: mockTestId },
 data: {
 status: "AI_PROPOSED",
 notes: JSON.stringify(analysis),
 },
 });

 return {
 success: true,
 analysis,
 test: updatedTest,
 };
 } catch (error: any) {
 console.error("Analysis error:", error);
 return { error: error.message || "Analysis failed" };
 }
}

export async function approveTestAnalysis(mockTestId: string) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return { error: "Unauthorized" };
 }

 const mockTest = await prisma.mockTest.findUnique({
 where: { id: mockTestId },
 });

 if (!mockTest) {
 return { error: "Mock test not found" };
 }

 if (mockTest.status !== "AI_PROPOSED") {
 return { error: "Test must be in AI_PROPOSED status" };
 }

 const updated = await prisma.mockTest.update({
 where: { id: mockTestId },
 data: {
 status: "CONFIRMED",
 },
 });

 return {
 success: true,
 test: updated,
 };
 } catch (error: any) {
 return { error: error.message || "Approval failed" };
 }
}

export async function rejectTestAnalysis(mockTestId: string, reason: string) {
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return { error: "Unauthorized" };
 }

 const mockTest = await prisma.mockTest.findUnique({
 where: { id: mockTestId },
 });

 if (!mockTest) {
 return { error: "Mock test not found" };
 }

 const updated = await prisma.mockTest.update({
 where: { id: mockTestId },
 data: {
 status: "REJECTED",
 notes: JSON.stringify({
 rejectionReason: reason,
 rejectedAt: new Date(),
 }),
 },
 });

 return {
 success: true,
 test: updated,
 };
 } catch (error: any) {
 return { error: error.message || "Rejection failed" };
 }
}
