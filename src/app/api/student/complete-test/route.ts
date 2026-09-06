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
  const { testId, userId, answers: userAnswers, timeSpent, markedQuestions, timestamp, proctorCode: rawProctorCode } = body

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

  // Resolve proctor code if student is part of a proctored exam session
  let resolvedProctorCode: string | null = null
  if (rawProctorCode) {
    const sessionByCodeOrId = await prisma.proctoredSession.findFirst({
      where: {
        OR: [{ id: rawProctorCode }, { code: rawProctorCode }],
        satTestId: testId,
      },
    })
    if (sessionByCodeOrId) {
      resolvedProctorCode = sessionByCodeOrId.code
    } else {
      resolvedProctorCode = rawProctorCode
    }
  }

  if (!resolvedProctorCode) {
    const activeParticipant = await prisma.proctoredParticipant.findFirst({
      where: {
        studentId: studentProfile.id,
        session: {
          satTestId: testId,
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
      },
      include: { session: true },
      orderBy: { createdAt: 'desc' },
    })
    if (activeParticipant?.session) {
      resolvedProctorCode = activeParticipant.session.code
    }
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
      ...(resolvedProctorCode ? { proctorCode: resolvedProctorCode } : {}),
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
        proctorCode: resolvedProctorCode || attempt.proctorCode,
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
        proctorCode: resolvedProctorCode,
      },
    })
    finalAttemptId = created.id
  }

  try {
    // If student is part of an active or recent proctored session for this test, mark them completed
    if (resolvedProctorCode) {
      await prisma.proctoredParticipant.updateMany({
        where: {
          studentId: studentProfile.id,
          session: {
            OR: [{ code: resolvedProctorCode }, { id: resolvedProctorCode }],
          },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(timestamp || Date.now()),
          score: totalScore,
        },
      });
    } else {
      await prisma.proctoredParticipant.updateMany({
        where: {
          studentId: studentProfile.id,
          session: {
            satTestId: testId,
            status: "ACTIVE",
          },
          status: { in: ["TAKING", "WAITING", "PAUSED"] },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(timestamp || Date.now()),
          score: totalScore,
        },
      });
    }

    const test = await prisma.sATMockTest.findUnique({
      where: { id: testId },
      select: { name: true },
    });
    const { createNotification } = await import("@/server/actions/notification.actions");
    await createNotification(session.userId, {
      title: "Mock Test Completed!",
      message: `Your results for ${test?.name || "Mock Test"} are ready. Score: ${totalScore} (RW: ${rwScore}, Math: ${mathScore}).`,
      type: "RESULT",
      link: `/student/mock-tests/${testId}/results`,
    });
  } catch (notifErr) {
    console.error("Failed to update proctor status or send test result notification:", notifErr);
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

function parseNumeric(val: string): number | null {
  if (!val) return null;
  const s = val.trim();
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function areAnswersEquivalent(userAnswer: string, correctAnswer: string, isFillIn: boolean): boolean {
  if (!userAnswer || !correctAnswer) return false;

  const normalize = (s: string) => s.trim().toLowerCase();
  const userNorm = normalize(userAnswer);
  const correctNorm = normalize(correctAnswer);

  if (userNorm === correctNorm) return true;

  // Split multiple acceptable answers (e.g. "3/4, 0.75" or "3/4 or .75")
  const correctOptions = correctAnswer
    .split(/,|\bor\b/i)
    .map((opt) => opt.trim())
    .filter(Boolean);

  for (const opt of correctOptions) {
    if (normalize(opt) === userNorm) return true;
  }

  if (isFillIn) {
    const userVal = parseNumeric(userAnswer);
    if (userVal !== null) {
      for (const opt of correctOptions) {
        const correctVal = parseNumeric(opt);
        if (correctVal !== null && Math.abs(userVal - correctVal) < 0.002) {
          return true;
        }
      }
    }
  }

  return false;
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
