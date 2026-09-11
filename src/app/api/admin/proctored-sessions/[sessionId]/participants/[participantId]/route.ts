import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { isStaff } from '@/lib/permissions/auth';

export async function DELETE(
 request: NextRequest,
 { params }: { params: Promise<{ sessionId: string; participantId: string }> }
) {
 try {
 const session = await getSession()
 if (!session || !isStaff(session)) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { sessionId, participantId } = await params

 // Delete participant
 await prisma.proctoredParticipant.delete({
 where: { id: participantId },
 })

 // Decrement session participant count
 await prisma.proctoredSession.update({
 where: { id: sessionId },
 data: {
 totalParticipants: {
 decrement: 1,
 },
 },
 })

 return NextResponse.json({ success: true })
 } catch (error) {
 console.error('Failed to disconnect participant:', error)
 return NextResponse.json(
 { error: 'Failed to disconnect participant' },
 { status: 500 }
 )
 }
}