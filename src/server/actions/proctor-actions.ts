'use server'

import { prisma } from '@/lib/db/prisma'
import { getSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

/**
 * Start a new live proctored session for a test (Admin only)
 */
export async function startProctorSessionAction(satTestId: string) {
 try {
 const session = await getSession()
 if (!session || session.role !== 'ADMIN') {
 return { success: false, error: 'Unauthorized. Admin access required.' }
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
 * Toggle publish status of an SATMockTest (draft <-> published)
 */
export async function togglePublishSatTestAction(satTestId: string) {
 try {
 const session = await getSession()
 if (!session || session.role !== 'ADMIN') {
 return { success: false, error: 'Unauthorized. Admin access required.' }
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
 if (!session || session.role !== 'STUDENT') {
 return { success: false, error: 'Unauthorized. Student login required.' }
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
 const studentProfile = await prisma.studentProfile.findUnique({
 where: { userId: session.userId },
 include: { user: true },
 })

 const studentId = studentProfile?.id || session.userId
 const userName = studentProfile
 ? `${studentProfile.firstName} ${studentProfile.lastName}`.trim() || session.username
 : session.username
 const email = studentProfile?.user?.username || `${session.username}@student.alfa`

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
