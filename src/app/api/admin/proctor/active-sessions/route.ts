import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function GET(request: Request) {
 try {
 const session = await getSession()
 if (!session || session.role !== 'ADMIN') {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { searchParams } = new URL(request.url)
 const proctorSessionId = searchParams.get('proctorSessionId')

 if (!proctorSessionId) {
 // Return all active proctor sessions
 const activeSessions = await prisma.proctoredSession.findMany({
 where: { status: 'ACTIVE' },
 include: {
 satTest: {
 select: { name: true }
 },
 _count: {
 select: { participants: true }
 }
 },
 orderBy: { createdAt: 'desc' }
 })
 
 return NextResponse.json(activeSessions)
 }

 // Return detailed participants for a specific session
 const participants = await prisma.proctoredParticipant.findMany({
 where: { sessionId: proctorSessionId },
 include: {
 student: {
 select: {
 firstName: true,
 lastName: true,
 group: { select: { name: true } }
 }
 }
 },
 orderBy: { userName: 'asc' }
 })

 return NextResponse.json(participants)
 } catch (error) {
 console.error('Proctor GET error:', error)
 return NextResponse.json({ error: 'Failed to fetch proctor data' }, { status: 500 })
 }
}
