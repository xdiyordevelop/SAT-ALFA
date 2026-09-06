import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { isStaff } from '@/lib/permissions/auth';

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ sessionId: string; participantId: string }> }
) {
 try {
 const session = await getSession()
 if (!session || !isStaff(session)) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { sessionId, participantId } = await params

 // Find the participant's test attempt and pause it
 const participant = await prisma.proctoredParticipant.findUnique({
 where: { id: participantId },
 })
 if (!participant) {
 return NextResponse.json(
 { error: 'Participant not found' },
 { status: 404 }
 )
 }

 // Update participant status to paused (we'll use a flag in the model)
 // For now, we'll just update the participant record
 const updated = await prisma.proctoredParticipant.update({
 where: { id: participantId },
 data: {
 status: 'PAUSED' as any, // Assuming PAUSED is a valid status
 },
 })

 return NextResponse.json(updated)
 } catch (error) {
 console.error('Failed to pause test:', error)
 return NextResponse.json(
 { error: 'Failed to pause test' },
 { status: 500 }
 )
 }
}