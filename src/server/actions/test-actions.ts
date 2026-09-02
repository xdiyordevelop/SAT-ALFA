'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateRawScores, convertToScaledScore } from '@/lib/scoring'

export async function saveTestProgress(
 satTestId: string,
 answers: Record<string, string>,
 markedQuestions: Record<string, boolean>,
 currentModule: number,
 currentQuestion: number,
 remainingTimeMs: number
) {
 const session = await getSession()
 if (!session?.userId) {
 return { success: false, error: 'Unauthorized' }
 }

 try {
 const student = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 })

 if (!student) {
 return { success: false, error: 'Student profile not found' }
 }

 // Find or create test attempt
 const attempt = await prisma.studentTestAttempt.findFirst({
 where: {
 studentId: student.id,
 satTestId,
 completedAt: null, // Only update in-progress attempts
 },
 })

 if (!attempt) {
 return { success: false, error: 'Test attempt not found' }
 }

 // Update attempt with current progress
 await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: {
 userAnswers: answers,
 markedQuestions,
 updatedAt: new Date(),
 },
 })

 return {
 success: true,
 attemptId: attempt.id,
 timestamp: new Date().toISOString(),
 }
 } catch (error) {
 console.error('Save test progress error:', error)
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to save progress',
 }
 }
}

export async function finishTest(satTestId: string) {
 const session = await getSession()
 if (!session?.userId) {
 return { success: false, error: 'Unauthorized' }
 }

 try {
 const student = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 })

 if (!student) {
 return { success: false, error: 'Student profile not found' }
 }

 // Find in-progress attempt
 const attempt = await prisma.studentTestAttempt.findFirst({
 where: {
 studentId: student.id,
 satTestId,
 completedAt: null,
 },
 include: {
 satTest: {
 include: {
 questions: true,
 },
 },
 },
 })

 if (!attempt) {
 return { success: false, error: 'Test attempt not found' }
 }

 // Calculate scores
 const { rwRaw, mathRaw } = calculateRawScores(
 attempt.userAnswers as Record<string, string>,
 attempt.satTest.questions.map((q) => ({
 id: q.id,
 module: parseInt(q.module.replace('MODULE_', ''), 10),
 correctAnswer: q.correctAnswer,
 fillInAnswer: q.correctAnswer,
 }))
 )

 const { rwScore, mathScore, totalScore } = convertToScaledScore(rwRaw, mathRaw)

 // Update attempt with final scores
 const updatedAttempt = await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: {
 completedAt: new Date(),
 rwRaw,
 mathRaw,
 rwScore,
 mathScore,
 totalScore,
 },
 })

 return {
 success: true,
 attemptId: updatedAttempt.id,
 scores: {
 totalScore,
 rwScore,
 mathScore,
 rwRaw,
 mathRaw,
 },
 }
 } catch (error) {
 console.error('Finish test error:', error)
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to finish test',
 }
 }
}

export async function resumeTestAttempt(satTestId: string) {
 const session = await getSession()
 if (!session?.userId) {
 return { success: false, error: 'Unauthorized' }
 }

 try {
 const student = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 })

 if (!student) {
 return { success: false, error: 'Student profile not found' }
 }

 // Find in-progress attempt
 const attempt = await prisma.studentTestAttempt.findFirst({
 where: {
 studentId: student.id,
 satTestId,
 completedAt: null,
 },
 })

 if (!attempt) {
 return { success: false, error: 'No in-progress test found' }
 }

 return {
 success: true,
 attemptId: attempt.id,
 userAnswers: attempt.userAnswers,
 markedQuestions: attempt.markedQuestions,
 }
 } catch (error) {
 console.error('Resume test error:', error)
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to resume test',
 }
 }
}
