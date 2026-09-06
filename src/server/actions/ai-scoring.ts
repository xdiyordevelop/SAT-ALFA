"use server";

import { prisma } from '@/lib/db/prisma';
import { sendTelegramMessage, buildResultsAnnouncementMessage } from '@/lib/telegram';
import { generateStructured } from '@/lib/ai/core';

export interface IrtScoringInput {
 userAnswers: Record<string, string>;
 rawScores: { rwRaw: number; mathRaw: number };
 studentContext?: {
 priorTests: number;
 averageScore: number;
 };
}

export interface ScoringResult {
 rwScore: number;
 mathScore: number;
 totalScore: number;
 confidence: number;
 explanation: string;
}

export async function processSessionScores(proctorCode: string) {
 try {
 const session = await prisma.proctoredSession.findUnique({
 where: { code: proctorCode },
 include: { participants: true, satTest: true },
 });

 if (!session) {
 return { success: false, error: 'Session not found' };
 }

    const attempts = await prisma.studentTestAttempt.findMany({
      where: {
        satTestId: session.satTestId,
        completedAt: { not: null },
        OR: [
          { proctorCode },
          { proctorCode: session.id },
          { studentId: { in: session.participants.map((p) => p.studentId) } },
        ],
      },
      include: { student: { include: { user: true } } },
    });

 if (attempts.length === 0) {
 return { success: false, error: 'No completed attempts found' };
 }

 await prisma.proctoredSession.update({
 where: { code: proctorCode },
 data: { scoringStatus: 'SCORED', scoringStartedAt: new Date(), scoredCount: attempts.length },
 });

 const scoredResults = [];
 for (const attempt of attempts) {
 try {
 const scoreResult = await scoreAttemptDeterministically(attempt);

 await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: { aiEstimatedScore: scoreResult as any, scoringStatus: 'PUBLISHED' },
 });

 await prisma.proctoredParticipant.update({
 where: { sessionId_studentId: { sessionId: session.id, studentId: attempt.studentId } },
 data: { score: scoreResult.totalScore, status: 'COMPLETED' },
 });

 await sendTelegramMessage(
 buildResultsAnnouncementMessage(
 `${attempt.student.user.username}`,
 session.satTest.name,
 scoreResult.totalScore,
 scoreResult.rwScore,
 scoreResult.mathScore
 )
 );

 scoredResults.push({ studentId: attempt.studentId, score: scoreResult.totalScore });
 } catch (error) {
 console.error(`Failed to score attempt ${attempt.id}:`, error);
 }
 }

 const publishTime = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
 await prisma.proctoredSession.update({
 where: { code: proctorCode },
 data: { scoredAt: new Date(), publishAfter: publishTime, scoringStatus: 'SCORED' },
 });

 return { success: true, scoredCount: scoredResults.length, results: scoredResults };
 } catch (error) {
 console.error('Process session scores error:', error);
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to process scores',
 };
 }
}

// Convert raw scores to scaled scores using a deterministic SAT table algorithm
function getScaledScore(raw: number, maxRaw: number, section: 'RW' | 'MATH'): number {
 if (raw <= 0) return 200;
 if (raw >= maxRaw) return 800;
 
 // Basic linear scaling approximation for missing true IRT maps
 // SAT maps are usually 200-800. 
 // RW: 54 questions, Math: 44 questions.
 const score = 200 + (raw / maxRaw) * 600;
 
 // Round to nearest 10
 return Math.round(score / 10) * 10;
}

async function scoreAttemptDeterministically(attempt: any): Promise<ScoringResult> {
 const rwRaw = attempt.rwRaw || 0;
 const mathRaw = attempt.mathRaw || 0;

 const rwScore = getScaledScore(rwRaw, 54, 'RW');
 const mathScore = getScaledScore(mathRaw, 44, 'MATH');
 const totalScore = rwScore + mathScore;

 // Let AI generate an educational explanation based on the determined scores
 let explanation = `Scored deterministically. Reading & Writing: ${rwScore}, Math: ${mathScore}. Total: ${totalScore}.`;
 
 try {
 const { parsed } = await generateStructured<{ narrative: string }>({
 userPrompt: `You are an expert SAT tutor. Write a 2-3 sentence encouraging, analytical summary of this student's performance. 
They scored ${rwScore}/800 on Reading/Writing (raw: ${rwRaw}/54) and ${mathScore}/800 on Math (raw: ${mathRaw}/44), for a total of ${totalScore}/1600.
Return ONLY valid JSON like this: {"narrative": "your narrative summary here"}`,
 temperature: 0.3,
 });
 if (parsed.narrative) explanation = parsed.narrative;
 } catch (err) {
 console.error('Failed to generate AI narrative explanation for score, using fallback', err);
 }

 return {
 rwScore,
 mathScore,
 totalScore,
 confidence: 1.0, // Fully deterministic
 explanation,
 };
}

export async function publishSessionResults(proctorCode: string) {
 try {
 const session = await prisma.proctoredSession.findUnique({ where: { code: proctorCode } });

 if (!session) {
 return { success: false, error: 'Session not found' };
 }

 await prisma.proctoredSession.update({
 where: { code: proctorCode },
 data: { publishedAt: new Date(), status: 'COMPLETED' },
 });

 return { success: true };
 } catch (error) {
 console.error('Publish session error:', error);
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to publish results',
 };
 }
}
