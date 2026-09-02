import { prisma } from "@/lib/db/prisma";

/**
 * Fetch all approved tests for a student that are locked in metrics.
 * These are the tests that should appear in dashboard metrics and charts.
 */
export async function getApprovedTestsForStudent(studentId: string) {
 if (!studentId) return [];
 return prisma.mockTest.findMany({
 where: {
 studentId,
 status: "CONFIRMED",
 
 },
 orderBy: { createdAt: "desc" },
 include: {
 performances: {
 include: {
 topic: true,
 },
 },
 },
 });
}

/**
 * Fetch pending tests for a student (awaiting admin approval)
 */
export async function getPendingTestsForStudent(studentId: string) {
 if (!studentId) return [];
 return prisma.mockTest.findMany({
 where: {
 studentId,
 status: "PENDING",
 },
 orderBy: { createdAt: "desc" },
 include: {
 performances: {
 include: {
 topic: true,
 },
 },
 },
 });
}

/**
 * Fetch rejected tests for a student
 */
export async function getRejectedTestsForStudent(studentId: string) {
 if (!studentId) return [];
 return prisma.mockTest.findMany({
 where: {
 studentId,
 status: "REJECTED",
 },
 orderBy: { createdAt: "desc" },
 include: {
 performances: {
 include: {
 topic: true,
 },
 },
 },
 });
}

/**
 * Fetch available mock test templates that students can take.
 * These are created by Admin and have no studentId assigned yet, with status CONFIRMED.
 */
export async function getAvailableMockTests() {
 return prisma.mockTest.findMany({
 where: {
 studentId: null,
 status: "CONFIRMED",
 },
 orderBy: { createdAt: "desc" },
 });
}

/**
 * Fetch all pending tests across all students (Admin view)
 */
export async function getAllPendingTests() {
 return prisma.mockTest.findMany({
 where: {
 status: "PENDING",
 studentId: { not: null },
 },
 orderBy: { createdAt: "desc" },
 include: {
 student: {
 include: {
 user: true,
 group: true,
 },
 },
 performances: {
 include: {
 topic: true,
 },
 },
 },
 });
}

/**
 * Fetch all approved student results across all students (Admin view)
 */
export async function getAllApprovedResults() {
 return prisma.mockTest.findMany({
 where: {
 status: "CONFIRMED",
 studentId: { not: null },
 },
 orderBy: { createdAt: "desc" },
 include: {
 student: {
 include: {
 user: true,
 group: true,
 },
 },
 performances: {
 include: {
 topic: true,
 },
 },
 },
 });
}

/**
 * Fetch a single mock test or submission by ID with full relations
 */
export async function getMockTestById(id: string) {
 return prisma.mockTest.findUnique({
 where: { id },
 include: {
 student: {
 include: {
 user: true,
 group: true,
 },
 },
 performances: {
 include: {
 topic: true,
 },
 },
 attachments: true,
 },
 });
}

/**
 * Get the count of pending tests for dashboard stat card
 */
export async function getPendingTestsCount() {
 return prisma.mockTest.count({
 where: {
 status: "PENDING",
 studentId: { not: null },
 },
 });
}

/**
 * Calculate dashboard metrics strictly from approved tests
 */
export async function calculateDashboardMetrics(studentId: string) {
 const approvedTests = await getApprovedTestsForStudent(studentId);

 if (approvedTests.length === 0) {
 return {
 latestScore: null,
 latestMathScore: null,
 latestEnglishScore: null,
 highestScore: null,
 lowestScore: null,
 averageScore: null,
 totalTests: 0,
 scoreTrend: [],
 tests: [],
 };
 }

 const scores = approvedTests.map((t) => t.totalScore || t.score || 0);
 const latestTest = approvedTests[0];
 const latestScore = latestTest?.totalScore || latestTest?.score || null;
 const latestMathScore = latestTest?.mathScore || null;
 const latestEnglishScore = latestTest?.englishScore || null;
 const highestScore = Math.max(...scores);
 const lowestScore = Math.min(...scores);
 const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

 // Chronological score trend (oldest to newest)
 const scoreTrend = [...approvedTests]
 .reverse()
 .map((t) => ({
 date: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
 score: t.totalScore || t.score || 0,
 mathScore: t.mathScore || 0,
 englishScore: t.englishScore || 0,
 testName: t.testName,
 }));

 return {
 latestScore,
 latestMathScore,
 latestEnglishScore,
 highestScore,
 lowestScore,
 averageScore,
 totalTests: approvedTests.length,
 scoreTrend,
 tests: approvedTests,
 };
}
