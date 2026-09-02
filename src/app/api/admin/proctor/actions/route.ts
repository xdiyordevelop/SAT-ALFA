import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function POST(request: Request) {
 try {
 const session = await getSession()
 if (!session || session.role !== 'ADMIN') {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { action, participantId, sessionId, timeToAdd } = await request.json()

 if (!action || !participantId) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
 }

 let updateData: any = {}

 switch (action) {
 case 'FORCE_SUBMIT':
 updateData = { status: 'COMPLETED', completedAt: new Date() }
 break
 case 'ADD_TIME':
 if (!timeToAdd) return NextResponse.json({ error: 'Missing timeToAdd' }, { status: 400 })
 updateData = { timeAdded: { increment: timeToAdd } }
 break
 case 'PAUSE_TEST':
 updateData = { status: 'PAUSED' }
 break
 case 'RESUME_TEST':
 updateData = { status: 'TAKING' }
 break
 case 'DISQUALIFY':
 updateData = { status: 'DISQUALIFIED', completedAt: new Date() }
 break
 default:
 return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
 }

 const participant = await prisma.proctoredParticipant.update({
 where: { id: participantId },
 data: updateData
 })

 // If force submit or disqualify, we also need to update the StudentTestAttempt
 if (action === 'FORCE_SUBMIT' || action === 'DISQUALIFY') {
 const attempt = await prisma.studentTestAttempt.findFirst({
 where: {
 studentId: participant.studentId,
 proctorCode: participant.sessionId,
 completedAt: null
 }
 })
 if (attempt) {
 await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: { completedAt: new Date() }
 })
 }
 }

 return NextResponse.json({ success: true, participant })
 } catch (error) {
 console.error('Proctor action POST error:', error)
 return NextResponse.json({ error: 'Failed to perform proctor action' }, { status: 500 })
 }
}
