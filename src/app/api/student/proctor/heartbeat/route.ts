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

    const { sessionId, currentModule, currentQuestionIndex, timeRemaining, tabSwitch } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      lastHeartbeat: new Date(),
    };

    if (currentModule !== undefined) updateData.currentModule = currentModule;
    if (currentQuestionIndex !== undefined) updateData.currentQuestionIndex = currentQuestionIndex;
    if (timeRemaining !== undefined) updateData.timeRemaining = timeRemaining;

    if (tabSwitch) {
      updateData.fullscreenExitCount = { increment: 1 };
    }

    let participant = await prisma.proctoredParticipant.update({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: profile.id,
        },
      },
      data: updateData,
    });

    // Check automatic 5-tab switch disqualification
    let isDisqualified = participant.status === 'DISQUALIFIED' || participant.fullscreenExitCount >= 5;

    if (participant.fullscreenExitCount >= 5 && participant.status !== 'DISQUALIFIED') {
      participant = await prisma.proctoredParticipant.update({
        where: { id: participant.id },
        data: { status: 'DISQUALIFIED', score: 0 },
      });
      isDisqualified = true;

      // Close open attempt if exists with 0 score
      const attempt = await prisma.studentTestAttempt.findFirst({
        where: {
          studentId: profile.id,
          proctorCode: sessionId,
          completedAt: null,
        },
      });

      if (attempt) {
        await prisma.studentTestAttempt.update({
          where: { id: attempt.id },
          data: {
            completedAt: new Date(),
            fullscreenExitCount: participant.fullscreenExitCount,
            totalScore: 0,
            rwScore: 0,
            mathScore: 0,
            rwRaw: 0,
            mathRaw: 0,
            scoringStatus: 'PUBLISHED',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: participant.status,
      exitCount: participant.fullscreenExitCount,
      disqualified: isDisqualified,
      timeAdded: participant.timeAdded,
    });
  } catch (error) {
    console.error('Proctor heartbeat POST error:', error);
    return NextResponse.json({ error: 'Failed to record heartbeat' }, { status: 500 });
  }
}
