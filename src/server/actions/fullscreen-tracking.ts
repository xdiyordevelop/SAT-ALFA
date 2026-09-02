'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function logFullscreenViolation(testId: string) {
 const session = await getSession()
 if (!session?.userId) {
 return { success: false, error: 'Unauthorized' }
 }

 try {
 const attempt = await prisma.studentTestAttempt.findFirst({
 where: {
 satTestId: testId,
 student: {
 userId: session.userId,
 },
 completedAt: null,
 },
 })

 if (!attempt) {
 return { success: false, error: 'Test attempt not found' }
 }

 // Increment fullscreen exit count
 await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: {
 fullscreenExitCount: {
 increment: 1,
 },
 },
 })

 return {
 success: true,
 exitCount: attempt.fullscreenExitCount + 1,
 }
 } catch (error) {
 console.error('Failed to log fullscreen violation:', error)
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to log violation',
 }
 }
}
