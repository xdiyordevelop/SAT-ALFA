import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
 try {
 const session = await getSession()
 if (!session?.userId) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const body = await request.json()
 const { testId, userId, answers: userAnswers, timeSpent, markedQuestions, timestamp } = body

 if (!testId || !userAnswers) {
 return NextResponse.json(
 { success: false, error: 'Missing required fields' },
 { status: 400 }
 )
 }

 // Find the student profile
 const studentProfile = await prisma.studentProfile.findUnique({
 where: { userId: session.userId }
 })

 if (!studentProfile) {
 return NextResponse.json(
 { success: false, error: 'Student profile not found' },
 { status: 404 }
 )
 }

 // Find all real questions for this test from the database
 const dbQuestions = await prisma.sATQuestion.findMany({
 where: { satTestId: testId },
 })

 if (!dbQuestions || dbQuestions.length === 0) {
 return NextResponse.json(
 { success: false, error: 'No questions found for this test' },
 { status: 404 }
 )
 }

 // Calculate raw scores
 let rwRaw = 0
 let mathRaw = 0
 let rwTotal = 0
 let mathTotal = 0

 // Build review index
 const reviewIndex = dbQuestions.map((q) => {
 const isRW = q.module === 'MODULE_1' || q.module === 'MODULE_2'
 if (isRW) rwTotal++
 else mathTotal++

 const userAns = userAnswers[q.id] || ''
 const correctAns = q.correctAnswer
 
 const isCorrect = areAnswersEquivalent(userAns, correctAns, q.format === 'FILL_IN')

 if (isCorrect) {
 if (isRW) rwRaw++
 else mathRaw++
 }

 return {
 questionId: q.id,
 module: q.module,
 questionNumber: q.questionNumber,
 userAnswer: userAns,
 correctAnswer: correctAns,
 isCorrect,
 domain: q.domain,
 skill: q.skill,
 }
 })

 // Convert raw to scaled scores (Simple estimation for now)
 const rwScore = convertRawToScaled(rwRaw, rwTotal, 200, 800)
 const mathScore = convertRawToScaled(mathRaw, mathTotal, 200, 800)
 const totalScore = rwScore + mathScore

 // Find or create test attempt
 // In our take/page.tsx we didn't create an attempt on start, so we upsert or create here.
 const attempt = await prisma.studentTestAttempt.findFirst({
 where: {
 satTestId: testId,
 studentId: studentProfile.id,
 completedAt: null,
 },
 })

 let finalAttemptId
 if (attempt) {
 const updated = await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: {
 completedAt: new Date(timestamp || Date.now()),
 userAnswers: userAnswers,
 markedQuestions: markedQuestions || {},
 rwRaw,
 mathRaw,
 rwScore,
 mathScore,
 totalScore,
 scoringStatus: 'PUBLISHED',
 reviewIndex: reviewIndex,
 },
 })
 finalAttemptId = updated.id
 } else {
 const created = await prisma.studentTestAttempt.create({
 data: {
 satTestId: testId,
 studentId: studentProfile.id,
 startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Approximate if missing
 completedAt: new Date(timestamp || Date.now()),
 userAnswers: userAnswers,
 markedQuestions: markedQuestions || {},
 rwRaw,
 mathRaw,
 rwScore,
 mathScore,
 totalScore,
 scoringStatus: 'PUBLISHED',
 reviewIndex: reviewIndex,
 },
 })
 finalAttemptId = created.id
 }

 return NextResponse.json({
 success: true,
 attemptId: finalAttemptId,
 score: totalScore,
 scores: {
 rwScore,
 mathScore,
 totalScore,
 rwRaw,
 mathRaw,
 },
 })
 } catch (error) {
 console.error('Failed to complete test:', error)
 return NextResponse.json(
 {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to complete test',
 },
 { status: 500 }
 )
 }
}

function areAnswersEquivalent(userAnswer: string, correctAnswer: string, isFillIn: boolean): boolean {
 if (!userAnswer || !correctAnswer) return false

 const normalize = (s: string) => s.trim().toLowerCase()
 const userNorm = normalize(userAnswer)
 const correctNorm = normalize(correctAnswer)

 if (userNorm === correctNorm) return true

 if (isFillIn) {
 const userNum = parseFloat(userAnswer)
 const correctNum = parseFloat(correctAnswer)

 if (!isNaN(userNum) && !isNaN(correctNum)) {
 return Math.abs(userNum - correctNum) < 0.001
 }
 }

 return false
}

function convertRawToScaled(raw: number, total: number, minScaled: number, maxScaled: number): number {
 if (total === 0) return minScaled
 const percentage = raw / total
 
 // SAT curve is not strictly linear, but we approximate here.
 // E.g., max score 800 for 100%. 
 let scaled = minScaled + (percentage * (maxScaled - minScaled))
 // Round to nearest 10
 scaled = Math.round(scaled / 10) * 10
 
 return Math.min(Math.max(scaled, minScaled), maxScaled)
}
