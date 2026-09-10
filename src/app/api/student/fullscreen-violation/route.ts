import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'STUDENT' || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const { testId, sessionId, reason } = await request.json();

    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
    }

    let finalCount = 1;
    let isDisqualified = false;

    // Find the student's active attempt first
    const attempt = await prisma.studentTestAttempt.findFirst({
      where: {
        studentId: profile.id,
        satTestId: testId,
        completedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Session is proctored ONLY if explicitly provided or recorded on the attempt
    const activeSessionId = sessionId || attempt?.proctorCode || null;
    const isProctored = Boolean(activeSessionId);

    // 1. Live Proctored Session Handling
    if (isProctored && activeSessionId) {
      const participant = await prisma.proctoredParticipant.findFirst({
        where: {
          sessionId: activeSessionId,
          studentId: profile.id,
        },
      });

      if (participant) {
        finalCount = participant.fullscreenExitCount + 1;
        isDisqualified = finalCount >= 5 || participant.status === 'DISQUALIFIED';

        await prisma.proctoredParticipant.update({
          where: { id: participant.id },
          data: {
            fullscreenExitCount: finalCount,
            status: isDisqualified ? 'DISQUALIFIED' : participant.status,
            ...(isDisqualified ? { score: 0, completedAt: new Date() } : {}),
            lastHeartbeat: new Date(),
          },
        });
      }

      if (attempt) {
        finalCount = Math.max(finalCount, attempt.fullscreenExitCount + 1);
        if (finalCount >= 5) {
          isDisqualified = true;
        }

        await prisma.studentTestAttempt.update({
          where: { id: attempt.id },
          data: {
            fullscreenExitCount: finalCount,
            ...(isDisqualified
              ? {
                  completedAt: new Date(),
                  totalScore: 0,
                  rwScore: 0,
                  mathScore: 0,
                  rwRaw: 0,
                  mathRaw: 0,
                  scoringStatus: 'PUBLISHED',
                }
              : {}),
          },
        });
      } else {
        if (finalCount >= 5) {
          isDisqualified = true;
        }
        await prisma.studentTestAttempt.create({
          data: {
            studentId: profile.id,
            satTestId: testId,
            startedAt: new Date(),
            userAnswers: {},
            fullscreenExitCount: finalCount,
            proctorCode: activeSessionId,
            ...(isDisqualified
              ? {
                  completedAt: new Date(),
                  totalScore: 0,
                  rwScore: 0,
                  mathScore: 0,
                  rwRaw: 0,
                  mathRaw: 0,
                  scoringStatus: 'PUBLISHED',
                }
              : {}),
          },
        });
      }
    } else {
      // 2. Self-Paced Practice Test Handling
      // Practice tests NEVER disqualify or zero out scores. Only track exit count.
      isDisqualified = false;
      if (attempt) {
        finalCount = attempt.fullscreenExitCount + 1;
        await prisma.studentTestAttempt.update({
          where: { id: attempt.id },
          data: {
            fullscreenExitCount: finalCount,
          },
        });
      } else {
        await prisma.studentTestAttempt.create({
          data: {
            studentId: profile.id,
            satTestId: testId,
            startedAt: new Date(),
            userAnswers: {},
            fullscreenExitCount: 1,
            proctorCode: null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: finalCount,
      disqualified: isDisqualified,
      isProctored,
      remaining: isProctored ? Math.max(0, 5 - finalCount) : null,
    });
  } catch (error) {
    console.error('Fullscreen violation POST error:', error);
    return NextResponse.json({ error: 'Failed to record violation' }, { status: 500 });
  }
}
