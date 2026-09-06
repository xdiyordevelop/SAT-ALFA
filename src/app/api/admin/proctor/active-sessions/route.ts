import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { canManageAcademics } from '@/lib/permissions/auth'

export async function GET(request: Request) {
 try {
 const session = await getSession()
 if (!session || !canManageAcademics(session)) {
 return NextResponse.json({ error: 'Unauthorized. Academic management access required.' }, { status: 401 })
 }

  const { searchParams } = new URL(request.url)
  const proctorSessionId = searchParams.get('proctorSessionId')
  const statusParam = searchParams.get('status')

  if (!proctorSessionId) {
    // Return proctor sessions based on status filter
    const whereClause: any = {}
    if (statusParam === 'COMPLETED') {
      whereClause.status = 'COMPLETED'
    } else if (statusParam === 'all') {
      // no filter
    } else {
      whereClause.status = 'ACTIVE'
    }

    const sessions = await prisma.proctoredSession.findMany({
      where: whereClause,
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
    
    return NextResponse.json(sessions)
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
