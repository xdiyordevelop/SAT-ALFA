'use server'

import { prisma } from '@/lib/db/prisma'
import { getSession } from '@/lib/auth/session'
import { isStaff, canManageAcademics } from '@/lib/permissions/auth'
import { revalidatePath } from 'next/cache'

/**
 * Start a new live proctored session for a test (Staff only)
 */
export async function startProctorSessionAction(satTestId: string) {
  try {
    const session = await getSession()
    if (!session || !canManageAcademics(session)) {
      return { success: false, error: 'Unauthorized. Academic access required.' }
    }

    if (!satTestId) {
      return { success: false, error: 'Test ID is required.' }
    }

    // Verify test exists
    const satTest = await prisma.sATMockTest.findUnique({
      where: { id: satTestId },
      include: { questions: true },
    })

    if (!satTest) {
      return { success: false, error: 'SAT Mock Test not found.' }
    }

    // Generate unique 6-digit code
    let code = ''
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      code = Math.floor(100000 + Math.random() * 900000).toString()
      const existing = await prisma.proctoredSession.findUnique({
        where: { code },
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      code = `${Date.now()}`.slice(-6)
    }

    // Create session in database
    const proctoredSession = await prisma.proctoredSession.create({
      data: {
        code,
        satTestId: satTest.id,
        createdById: session.userId,
        status: 'ACTIVE',
        scoringStatus: 'PENDING_REVIEW',
        publishAfter: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      },
    })

    revalidatePath('/admin/mock-tests')
    revalidatePath('/admin/mock-tests/proctor')
    return {
      success: true,
      sessionId: proctoredSession.id,
      code: proctoredSession.code,
      testName: satTest.name,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[START_PROCTOR_SESSION_ERROR]', errorMsg)
    return { success: false, error: `Failed to create session: ${errorMsg}` }
  }
}

/**
 * End an active proctored session (Staff only)
 */
export async function endProctorSessionAction(sessionId: string) {
  try {
    const session = await getSession()
    if (!session || !canManageAcademics(session)) {
      return { success: false, error: 'Unauthorized. Academic access required.' }
    }

    const proctoredSession = await prisma.proctoredSession.findUnique({
      where: { id: sessionId },
    })

    if (!proctoredSession) {
      return { success: false, error: 'Session not found.' }
    }

    await prisma.proctoredSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
      },
    })

    // Mark remaining active participants as completed
    await prisma.proctoredParticipant.updateMany({
      where: {
        sessionId,
        status: { in: ['TAKING', 'WAITING', 'PAUSED'] },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    revalidatePath('/admin/mock-tests/proctor')
    revalidatePath(`/admin/mock-tests/proctor/${sessionId}`)

    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Failed to end session: ${errorMsg}` }
  }
}

/**
 * Fetch list of tests available to start a proctored session
 */
export async function getProctorAvailableTestsAction() {
  try {
    const session = await getSession()
    if (!session || !canManageAcademics(session)) {
      return { success: false, tests: [], error: 'Unauthorized.' }
    }

    const tests = await prisma.sATMockTest.findMany({
      where: {
        questions: { some: {} },
      },
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      tests: tests.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        questionCount: t._count.questions,
      })),
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { success: false, tests: [], error: errorMsg }
  }
}

/**
 * Toggle publish status of an SATMockTest (draft <-> published)
 */
export async function togglePublishSatTestAction(satTestId: string) {
  try {
    const session = await getSession()
    if (!session || !canManageAcademics(session)) {
      return { success: false, error: 'Unauthorized. Academic management access required.' }
    }

    const test = await prisma.sATMockTest.findUnique({
      where: { id: satTestId },
      select: { id: true, status: true },
    })

    if (!test) {
      return { success: false, error: 'Test not found.' }
    }

    const newStatus = test.status.toLowerCase() === 'published' ? 'draft' : 'published'

    const updated = await prisma.sATMockTest.update({
      where: { id: satTestId },
      data: { status: newStatus },
    })

    revalidatePath('/admin/mock-tests')
    revalidatePath('/student/dashboard')

    return {
      success: true,
      newStatus: updated.status,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Failed to toggle status: ${errorMsg}` }
  }
}

/**
 * Student verifies a 6-digit proctored examination code and joins session
 */
export async function verifyProctoredCodeAction(codeRaw: string) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Please log in to join an examination session.' }
    }

    const code = codeRaw.replace(/[^0-9]/g, '').trim()
    if (code.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit numeric exam code.' }
    }

    // Find active session
    const proctoredSession = await prisma.proctoredSession.findUnique({
      where: { code },
      include: {
        satTest: {
          include: {
            questions: {
              select: { id: true, module: true },
            },
          },
        },
      },
    })

    if (!proctoredSession) {
      return { success: false, error: 'No active session found with this code. Please check with your instructor.' }
    }

    if (proctoredSession.status !== 'ACTIVE') {
      return { success: false, error: `This examination session is currently ${proctoredSession.status.toLowerCase()}.` }
    }

    // Check or register student profile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
      include: { user: true },
    })

    if (!studentProfile) {
      if (session.role === 'ADMIN' || session.role === 'TEACHER' || session.role === 'SUPER_ADMIN') {
        studentProfile = await prisma.studentProfile.create({
          data: {
            userId: session.userId,
            firstName: session.username,
            lastName: '(Staff Preview)',
            phone: '000000000',
            status: 'ACTIVE',
          },
          include: { user: true },
        })
      } else {
        return { success: false, error: 'Student profile not found. Please contact support.' }
      }
    }

    const studentId = studentProfile.id
    const userName = `${studentProfile.firstName} ${studentProfile.lastName}`.trim() || session.username
    const email = studentProfile.user?.username || `${session.username}@student.alfa`

    // Register / update participant
    const existingParticipant = await prisma.proctoredParticipant.findFirst({
      where: {
        sessionId: proctoredSession.id,
        studentId: studentId,
      },
    })

    if (!existingParticipant) {
      await prisma.proctoredParticipant.create({
        data: {
          sessionId: proctoredSession.id,
          studentId: studentId,
          userName: userName,
          email: email,
          status: 'WAITING',
          currentModule: 1,
        },
      })

      await prisma.proctoredSession.update({
        where: { id: proctoredSession.id },
        data: { totalParticipants: { increment: 1 } },
      })
    } else if (
      existingParticipant.status === 'DISQUALIFIED' ||
      existingParticipant.fullscreenExitCount >= 5
    ) {
      return {
        success: false,
        error: 'You have been disqualified from this live exam session due to 5 exit violations.',
      }
    } else if (existingParticipant.status === 'COMPLETED') {
      return {
        success: false,
        error: 'You have already submitted and completed this exam session.',
      }
    }

    return {
      success: true,
      sessionId: proctoredSession.id,
      satTestId: proctoredSession.satTestId,
      code: proctoredSession.code,
      testName: proctoredSession.satTest.name,
      questionCount: proctoredSession.satTest.questions.length,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[VERIFY_PROCTOR_CODE_ERROR]', errorMsg)
    return { success: false, error: `Verification failed: ${errorMsg}` }
  }
}
