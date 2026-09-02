import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function POST(request: Request) {
 try {
 const session = await getSession()
 if (!session || session.role !== 'STUDENT' || !session.userId) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const profile = await prisma.studentProfile.findUnique({
 where: { userId: session.userId }
 })

 if (!profile) {
 return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
 }

 const { sessionId, currentModule, currentQuestionIndex, timeRemaining, tabSwitch } = await request.json()

 if (!sessionId) {
 return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
 }

 // Prepare update data
 const updateData: any = {
 lastHeartbeat: new Date(),
 }
 
 if (currentModule !== undefined) updateData.currentModule = currentModule
 if (currentQuestionIndex !== undefined) updateData.currentQuestionIndex = currentQuestionIndex
 if (timeRemaining !== undefined) updateData.timeRemaining = timeRemaining
 
 if (tabSwitch) {
 updateData.fullscreenExitCount = { increment: 1 }
 }

 const participant = await prisma.proctoredParticipant.update({
 where: {
 sessionId_studentId: {
 sessionId,
 studentId: profile.id
 }
 },
 data: updateData
 })

 // Return the status so the client knows if it was paused or disqualified
 return NextResponse.json({ 
 success: true, 
 status: participant.status,
 timeAdded: participant.timeAdded
 })
 } catch (error) {
 console.error('Proctor heartbeat POST error:', error)
 return NextResponse.json({ error: 'Failed to record heartbeat' }, { status: 500 })
 }
}
