"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";
import { analyzeTestPerformance } from "@/lib/ai/analysis";
import { revalidatePath } from "next/cache";
import { sendTestResultNotification } from "@/server/actions/sms.actions";
import { createNotification } from "@/server/actions/notification.actions";

/**
 * Approve a pending mock test submission (Admin only)
 */
export async function approveMockTestAction(testId: string) {
 try {
 const session = await getSession();
 if (!session || !isStaff(session)) {
 return { error: "Unauthorized. Admin role required." };
 }

 const test = await prisma.mockTest.findUnique({
 where: { id: testId },
 include: {
 student: true,
 performances: {
 include: { topic: true },
 },
 },
 });

 if (!test) {
 return { error: "Mock test not found" };
 }

 // Parse or generate AI analysis if not already present
 let existingAnalysis: any = null;
 if (test.notes) {
 try {
 const parsed = JSON.parse(test.notes);
 if (parsed.analysis || parsed.overallInsight || parsed.summary) {
 existingAnalysis = parsed.analysis || parsed;
 }
 } catch {
 // notes was a string
 }
 }

 if (!existingAnalysis) {
 // Generate AI analysis
 existingAnalysis = await analyzeTestPerformance({
 testId: test.id,
 studentId: test.studentId || "",
 testName: test.testName,
 subject: test.subject,
 score: test.totalScore || test.score,
 maxScore: test.maxScore,
 mathScore: test.mathScore,
 englishScore: test.englishScore,
 totalScore: test.totalScore || test.score,
 mathTopics: test.performances
 .filter((p) => p.topic.subject.toLowerCase() === "math")
 .map((p) => ({ title: p.topic.title, percentCorrect: p.percentage })),
 englishTopics: test.performances
 .filter((p) => p.topic.subject.toLowerCase() !== "math")
 .map((p) => ({ title: p.topic.title, percentCorrect: p.percentage })),
 });
 }

 const updatedTest = await prisma.mockTest.update({
 where: { id: testId },
 data: {
 status: "CONFIRMED",
 approvedAt: new Date(),
 approvedBy: session.userId,
 isLockedInMetrics: true,
 notes: JSON.stringify({
 analysis: existingAnalysis,
 approvedAt: new Date().toISOString(),
 approvedBy: session.username,
 }),
 },
 });

  // Send In-App Notification to student
  if (test.student?.userId) {
    createNotification(test.student.userId, {
      title: "Mock Test Results Approved",
      message: `Your results for "${test.testName}" have been approved. Total Score: ${test.totalScore || test.score} / ${test.maxScore}.`,
      type: "RESULT",
      link: `/student/results/${testId}`,
    }).catch((err) => console.error("Test result notification error:", err));
  }

 // Send SMS notification to parent if enabled and not duplicate
 if (test.studentId) {
 try {
 const parentGuardian = await prisma.parentGuardian.findUnique({
 where: { studentId: test.studentId },
 });

 if (parentGuardian && parentGuardian.smsNotifyEnabled) {
 const existingSms = await prisma.smsNotification.findFirst({
 where: {
 mockTestId: testId,
 status: "SENT",
 },
 });

 if (!existingSms) {
 await sendTestResultNotification(testId);
 }
 }
 } catch (smsErr) {
 console.warn("Automated parent SMS error:", smsErr);
 }
 }

 revalidatePath("/admin/mock-tests");
 revalidatePath("/admin/mock-tests/results");
 revalidatePath("/admin/mock-tests/pending");
 revalidatePath(`/admin/mock-tests/results/${testId}`);
 revalidatePath(`/admin/mock-tests/pending/${testId}`);
 revalidatePath(`/admin/mock-tests/${testId}`);
 revalidatePath("/student/mock-tests");
 revalidatePath(`/student/mock-tests/results/${testId}`);
 revalidatePath("/student/dashboard");

 return {
 success: true,
 message: "Test approved successfully",
 test: updatedTest,
 };
 } catch (error) {
 console.error("Error approving test:", error);
 return {
 error: error instanceof Error ? error.message : "Failed to approve test",
 };
 }
}

/**
 * Reject a pending mock test submission (Admin only)
 */
export async function rejectMockTestAction(testId: string, reason: string) {
 try {
 const session = await getSession();
 if (!session || !isStaff(session)) {
 return { error: "Unauthorized. Admin role required." };
 }

 if (!reason || !reason.trim()) {
 return { error: "Please provide a rejection reason" };
 }

 const test = await prisma.mockTest.findUnique({
 where: { id: testId },
 });

 if (!test) {
 return { error: "Mock test not found" };
 }

 let existingData: any = {};
 if (test.notes) {
 try {
 existingData = JSON.parse(test.notes);
 } catch {
 existingData = { originalNotes: test.notes };
 }
 }

  const updatedTest = await prisma.mockTest.update({
    where: { id: testId },
    data: {
      status: "REJECTED",
      notes: JSON.stringify({
        ...existingData,
        rejectionReason: reason.trim(),
        rejectedAt: new Date().toISOString(),
        rejectedBy: session.username,
      }),
    },
  });

  if (test.studentId) {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: test.studentId },
      select: { userId: true },
    });
    if (studentProfile?.userId) {
      createNotification(studentProfile.userId, {
        title: "Mock Test Submission Rejected",
        message: `Your submission for "${test.testName}" was rejected. Reason: ${reason.trim()}.`,
        type: "MOCK_TEST",
        link: "/student/mock-tests",
      }).catch((err) => console.error("Test reject notification error:", err));
    }
  }

 revalidatePath("/admin/mock-tests");
 revalidatePath("/admin/mock-tests/results");
 revalidatePath("/admin/mock-tests/pending");
 revalidatePath(`/admin/mock-tests/results/${testId}`);
 revalidatePath(`/admin/mock-tests/pending/${testId}`);
 revalidatePath(`/admin/mock-tests/${testId}`);
 revalidatePath("/student/mock-tests");
 revalidatePath("/student/dashboard");

 return {
 success: true,
 message: "Test rejected successfully",
 test: updatedTest,
 };
 } catch (error) {
 console.error("Error rejecting test:", error);
 return {
 error: error instanceof Error ? error.message : "Failed to reject test",
 };
 }
}

/**
 * Submit an online mock test (Student only)
 */
export async function submitStudentMockTestAction(
 templateTestId: string,
 answers: number[],
 timeSpentSeconds: number
) {
 try {
 const session = await getSession();
 if (!session || session.role !== "STUDENT") {
 return { error: "Unauthorized. Student role required." };
 }

 const student = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 });

 if (!student) {
 return { error: "Student profile not found" };
 }

 const templateTest = await prisma.mockTest.findUnique({
 where: { id: templateTestId },
 });

 if (!templateTest) {
 return { error: "Test template not found" };
 }

 let questions: any[] = [];
 try {
 questions = JSON.parse(templateTest.questions);
 } catch {
 questions = [];
 }

 if (questions.length === 0) {
 return { error: "No questions found in this test" };
 }

 // Separate Math and Reading & Writing questions
 let mathCorrect = 0;
 let mathTotal = 0;
 let englishCorrect = 0;
 let englishTotal = 0;
 let totalCorrect = 0;

 const topicStats: Record<
 string,
 { total: number; correct: number; subject: string }
 > = {};

 questions.forEach((q, idx) => {
 const isCorrect = answers[idx] === q.correctAnswer;
 const isMath =
 q.section === "Math" ||
 templateTest.subject.toLowerCase() === "math" ||
 (!q.section && templateTest.subject.toLowerCase() !== "english");

 if (isMath) {
 mathTotal++;
 if (isCorrect) mathCorrect++;
 } else {
 englishTotal++;
 if (isCorrect) englishCorrect++;
 }

 if (isCorrect) {
 totalCorrect++;
 }

 const topicName = q.topic || (isMath ? "Math Topic" : "Reading & Writing Topic");
 const topicSubject = isMath ? "Math" : "English";

 if (!topicStats[topicName]) {
 topicStats[topicName] = { total: 0, correct: 0, subject: topicSubject };
 }
 topicStats[topicName].total++;
 if (isCorrect) {
 topicStats[topicName].correct++;
 }
 });

 // Calculate SAT Scaled Scores (200-800 per section, 400-1600 total)
 let mathScore = 0;
 let englishScore = 0;

 if (mathTotal > 0) {
 mathScore = Math.round(200 + (mathCorrect / mathTotal) * 600);
 } else {
 mathScore = 0; // Default baseline if not present
 }

 if (englishTotal > 0) {
 englishScore = Math.round(200 + (englishCorrect / englishTotal) * 600);
 } else {
 englishScore = 0; // Default baseline if not present
 }

 let totalScore = mathScore + englishScore;
 if (templateTest.subject.toLowerCase() === "math") {
 totalScore = mathScore;
 } else if (templateTest.subject.toLowerCase() === "english") {
 totalScore = englishScore;
 }

 // Create topic performances
 const mathTopicsList: { title: string; percentCorrect: number }[] = [];
 const englishTopicsList: { title: string; percentCorrect: number }[] = [];

 Object.entries(topicStats).forEach(([title, stats]) => {
 const pct = Math.round((stats.correct / stats.total) * 100);
 if (stats.subject === "Math") {
 mathTopicsList.push({ title, percentCorrect: pct });
 } else {
 englishTopicsList.push({ title, percentCorrect: pct });
 }
 });

 // Generate AI analysis
 const aiAnalysis = await analyzeTestPerformance({
 testId: "new-submission",
 studentId: student.id,
 testName: templateTest.testName,
 subject: templateTest.subject,
 questions,
 answers,
 score: totalScore,
 maxScore: 1600,
 mathScore,
 englishScore,
 totalScore,
 mathTopics: mathTopicsList,
 englishTopics: englishTopicsList,
 });

 // Create submission record in database with status PENDING
 const submission = await prisma.mockTest.create({
 data: {
 studentId: student.id,
 testName: `${templateTest.testName}`,
 subject: templateTest.subject,
 description: templateTest.description,
 maxScore: 1600,
 duration: templateTest.duration,
 score: totalScore,
 totalScore,
 mathScore,
 englishScore,
 answers: JSON.stringify(answers),
 questions: templateTest.questions,
 source: "ADMIN_ENTERED",
 status: "PENDING",
 isLockedInMetrics: false,
 notes: JSON.stringify({
 analysis: aiAnalysis,
 timeSpentSeconds,
 submittedAt: new Date().toISOString(),
 }),
 },
 });

 // Connect or create Topics & TopicPerformance records
 for (const [topicName, stats] of Object.entries(topicStats)) {
 try {
 const topic = await prisma.topic.upsert({
 where: {
 subject_title: {
 subject: stats.subject,
 title: topicName,
 },
 },
 update: {},
 create: {
 subject: stats.subject,
 title: topicName,
 },
 });

 await prisma.topicPerformance.create({
 data: {
 mockTestId: submission.id,
 topicId: topic.id,
 percentage: Math.round((stats.correct / stats.total) * 100),
 },
 });
 } catch (err) {
 console.warn(`Failed to link topic performance for ${topicName}:`, err);
 }
 }

 revalidatePath("/admin/mock-tests");
 revalidatePath("/admin/mock-tests/pending");
 revalidatePath("/student/mock-tests");
 revalidatePath("/student/dashboard");

 return {
 success: true,
 submissionId: submission.id,
 totalScore,
 mathScore,
 englishScore,
 status: "PENDING",
 message:
 "Mock test submitted successfully! It is now pending admin review before being unlocked in your dashboard.",
 };
 } catch (error) {
 console.error("Error submitting mock test:", error);
 return {
 error: error instanceof Error ? error.message : "Failed to submit test",
 };
 }
}
