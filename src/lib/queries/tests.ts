import { prisma } from "@/lib/db/prisma";

/**
 * Fetch all approved tests for a student that are locked in metrics.
 * These are the tests that should appear in dashboard metrics and charts.
 */
export async function getApprovedTestsForStudent(studentId: string) {
  if (!studentId) return [];

  const [mockTests, satAttempts] = await Promise.all([
    prisma.mockTest.findMany({
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
    }),
    prisma.studentTestAttempt.findMany({
      where: {
        studentId,
        completedAt: { not: null },
        scoringStatus: { not: "PENDING_REVIEW" },
      },
      orderBy: { completedAt: "desc" },
      include: {
        satTest: true,
      },
    }),
  ]);

  const normalizedAttempts = satAttempts.map((attempt) => ({
    id: attempt.id,
    studentId: attempt.studentId,
    testName: attempt.satTest?.name || "Digital SAT Mock Test",
    subject: "Digital SAT",
    description: attempt.satTest?.description || "Digital SAT Test Attempt",
    maxScore: 1600,
    duration: attempt.totalTimeMs ? Math.round(attempt.totalTimeMs / 60000) : 134,
    score: attempt.totalScore,
    totalScore: attempt.totalScore,
    mathScore: attempt.mathScore,
    englishScore: attempt.rwScore,
    answers: attempt.userAnswers ? JSON.stringify(attempt.userAnswers) : null,
    questions: "[]",
    notes: null,
    source: "STUDENT_UPLOADED" as const,
    createdById: null,
    status: "CONFIRMED" as const,
    approvedAt: attempt.completedAt,
    approvedBy: null,
    isLockedInMetrics: true,
    uploadedFileName: null,
    uploadedAt: null,
    performances: [],
    attachments: [],
    sms: [],
    createdAt: attempt.completedAt || attempt.createdAt,
    updatedAt: attempt.updatedAt,
  }));

  return [...mockTests, ...normalizedAttempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Fetch pending tests for a student (awaiting admin approval)
 */
export async function getPendingTestsForStudent(studentId: string) {
  if (!studentId) return [];

  const [mockTests, satAttempts] = await Promise.all([
    prisma.mockTest.findMany({
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
    }),
    prisma.studentTestAttempt.findMany({
      where: {
        studentId,
        scoringStatus: "PENDING_REVIEW",
      },
      orderBy: { createdAt: "desc" },
      include: {
        satTest: true,
      },
    }),
  ]);

  const normalizedAttempts = satAttempts.map((attempt) => ({
    id: attempt.id,
    studentId: attempt.studentId,
    testName: attempt.satTest?.name || "Digital SAT Mock Test",
    subject: "Digital SAT",
    description: attempt.satTest?.description || "Digital SAT Test Attempt",
    maxScore: 1600,
    duration: attempt.totalTimeMs ? Math.round(attempt.totalTimeMs / 60000) : 134,
    score: attempt.totalScore,
    totalScore: attempt.totalScore,
    mathScore: attempt.mathScore,
    englishScore: attempt.rwScore,
    answers: attempt.userAnswers ? JSON.stringify(attempt.userAnswers) : null,
    questions: "[]",
    notes: null,
    source: "STUDENT_UPLOADED" as const,
    createdById: null,
    status: "PENDING" as const,
    approvedAt: null,
    approvedBy: null,
    isLockedInMetrics: false,
    uploadedFileName: null,
    uploadedAt: null,
    performances: [],
    attachments: [],
    sms: [],
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  }));

  return [...mockTests, ...normalizedAttempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
  const [mockTests, satAttempts] = await Promise.all([
    prisma.mockTest.findMany({
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
    }),
    prisma.studentTestAttempt.findMany({
      where: {
        scoringStatus: "PENDING_REVIEW",
      },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            user: true,
            group: true,
          },
        },
        satTest: true,
      },
    }),
  ]);

  const normalizedAttempts = satAttempts.map((attempt) => ({
    id: attempt.id,
    studentId: attempt.studentId,
    testName: attempt.satTest?.name || "Digital SAT Mock Test",
    subject: "Digital SAT",
    description: attempt.satTest?.description || "Digital SAT Test Attempt",
    maxScore: 1600,
    duration: attempt.totalTimeMs ? Math.round(attempt.totalTimeMs / 60000) : 134,
    score: attempt.totalScore,
    totalScore: attempt.totalScore,
    mathScore: attempt.mathScore,
    englishScore: attempt.rwScore,
    status: "PENDING" as const,
    student: attempt.student,
    performances: [],
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  }));

  return [...mockTests, ...normalizedAttempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Fetch all approved student results across all students (Admin view)
 */
export async function getAllApprovedResults() {
  const [mockTests, satAttempts] = await Promise.all([
    prisma.mockTest.findMany({
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
    }),
    prisma.studentTestAttempt.findMany({
      where: {
        completedAt: { not: null },
        scoringStatus: { not: "PENDING_REVIEW" },
      },
      orderBy: { completedAt: "desc" },
      include: {
        student: {
          include: {
            user: true,
            group: true,
          },
        },
        satTest: true,
      },
    }),
  ]);

  const normalizedAttempts = satAttempts.map((attempt) => ({
    id: attempt.id,
    studentId: attempt.studentId,
    testName: attempt.satTest?.name || "Digital SAT Mock Test",
    subject: "Digital SAT",
    description: attempt.satTest?.description || "Digital SAT Test Attempt",
    maxScore: 1600,
    duration: attempt.totalTimeMs ? Math.round(attempt.totalTimeMs / 60000) : 134,
    score: attempt.totalScore,
    totalScore: attempt.totalScore,
    mathScore: attempt.mathScore,
    englishScore: attempt.rwScore,
    status: "CONFIRMED" as const,
    student: attempt.student,
    performances: [],
    createdAt: attempt.completedAt || attempt.createdAt,
    updatedAt: attempt.updatedAt,
  }));

  return [...mockTests, ...normalizedAttempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
  const [mockTestsCount, satAttemptsCount] = await Promise.all([
    prisma.mockTest.count({
      where: {
        status: "PENDING",
        studentId: { not: null },
      },
    }),
    prisma.studentTestAttempt.count({
      where: {
        scoringStatus: "PENDING_REVIEW",
      },
    }),
  ]);
  return mockTestsCount + satAttemptsCount;
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
