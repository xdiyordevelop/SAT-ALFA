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

  // Resolve proctor code ONLY if student is part of an active proctored exam session
  let resolvedProctorCode: string | null = null;
  if (rawProctorCode) {
    const sessionByCodeOrId = await prisma.proctoredSession.findFirst({
      where: {
        OR: [{ id: rawProctorCode }, { code: rawProctorCode }],
        satTestId: testId,
        status: "ACTIVE",
      },
    });
    if (sessionByCodeOrId) {
      resolvedProctorCode = sessionByCodeOrId.code;
    }
  }

  // Find all real questions for this test from the database
  const dbQuestions = await prisma.sATQuestion.findMany({
    where: { satTestId: testId },
  });

  if (!dbQuestions || dbQuestions.length === 0) {
    return NextResponse.json(
      { success: false, error: "No questions found for this test" },
      { status: 404 },
    );
  }

  // Calculate raw scores
  let rwRaw = 0;
  let mathRaw = 0;
  let rwTotal = 0;
  let mathTotal = 0;

  // Build review index
  const reviewIndex = dbQuestions.map((q) => {
    const isRW = q.module === "MODULE_1" || q.module === "MODULE_2";
    if (isRW) rwTotal++;
    else mathTotal++;

    const userAns = userAnswers[q.id] || "";
    const correctAns = q.correctAnswer;

    const isCorrect = areAnswersEquivalent(
      userAns,
      correctAns,
      q.format === "FILL_IN",
    );

    if (isCorrect) {
      if (isRW) rwRaw++;
      else mathRaw++;
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
    };
  });

  // Disqualification ONLY applies to live proctored sessions.
  // Practice/self-paced tests NEVER disqualify or zero out student scores.
  let isDisqualified = false;
  if (resolvedProctorCode) {
    const participant = await prisma.proctoredParticipant.findFirst({
      where: {
        studentId: studentProfile.id,
        session: {
          code: resolvedProctorCode,
          satTestId: testId,
          status: "ACTIVE",
        },
      },
    });
    if (
      participant &&
      (participant.status === "DISQUALIFIED" ||
        participant.fullscreenExitCount >= 5)
    ) {
      isDisqualified = true;
    }
  }

  const attempt = await prisma.studentTestAttempt.findFirst({
    where: {
      satTestId: testId,
      studentId: studentProfile.id,
      completedAt: null,
      ...(resolvedProctorCode ? { proctorCode: resolvedProctorCode } : { proctorCode: null }),
    },
    orderBy: { createdAt: "desc" },
  });

  const activeAttempt =
    attempt ||
    (await prisma.studentTestAttempt.findFirst({
      where: {
        satTestId: testId,
        studentId: studentProfile.id,
        completedAt: null,
      },
      orderBy: { createdAt: "desc" },
    }));

  // If disqualified in a live proctored session, NO scores/points are awarded (0 points)
  let rwScore = 0;
  let mathScore = 0;
  let totalScore = 0;

  if (!isDisqualified) {
    rwScore = rwTotal > 0 ? convertRawToScaled(rwRaw, rwTotal, 200, 800) : 0;
    mathScore = mathTotal > 0 ? convertRawToScaled(mathRaw, mathTotal, 200, 800) : 0;

    if (rwTotal > 0 && mathTotal > 0) {
      totalScore = rwScore + mathScore;
    } else {
      totalScore = rwScore || mathScore;
    }
  } else {
    rwRaw = 0;
    mathRaw = 0;
  }

  let finalAttemptId;
  if (activeAttempt) {
    const updated = await prisma.studentTestAttempt.update({
      where: { id: activeAttempt.id },
      data: {
        completedAt: new Date(timestamp || Date.now()),
        userAnswers: userAnswers,
        markedQuestions: markedQuestions || {},
        rwRaw,
        mathRaw,
        rwScore,
        mathScore,
        totalScore,
        scoringStatus: "PUBLISHED",
        reviewIndex: reviewIndex,
        proctorCode: resolvedProctorCode || activeAttempt.proctorCode,
      },
    });
    finalAttemptId = updated.id;
  } else {
    const created = await prisma.studentTestAttempt.create({
      data: {
        satTestId: testId,
        studentId: studentProfile.id,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(timestamp || Date.now()),
        userAnswers: userAnswers,
        markedQuestions: markedQuestions || {},
        rwRaw,
        mathRaw,
        rwScore,
        mathScore,
        totalScore,
        scoringStatus: "PUBLISHED",
        reviewIndex: reviewIndex,
        proctorCode: resolvedProctorCode,
      },
    });
    finalAttemptId = created.id;
  }

  try {
    // If student is part of an active proctored session for this test
    if (resolvedProctorCode) {
      await prisma.proctoredParticipant.updateMany({
        where: {
          studentId: studentProfile.id,
          session: {
            code: resolvedProctorCode,
            status: "ACTIVE",
          },
        },
        data: {
          status: isDisqualified ? "DISQUALIFIED" : "COMPLETED",
          completedAt: new Date(timestamp || Date.now()),
          score: isDisqualified ? 0 : totalScore,
        },
      });
    }

    if (!isDisqualified) {
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
    }
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
