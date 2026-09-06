import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { isStaff } from '@/lib/permissions/auth';

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ sessionId: string }> }
) {
 try {
 const session = await getSession();
 if (!session || !isStaff(session)) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { sessionId } = await params;
 const proctoredSession = await prisma.proctoredSession.findUnique({
 where: { id: sessionId },
 include: {
 participants: {
 select: {
 id: true,
 studentId: true,
 userName: true,
 email: true,
 status: true,
 startedAt: true,
 completedAt: true,
 currentModule: true,
 currentQuestionIndex: true,
 timeRemaining: true,
 lastHeartbeat: true,
 timeAdded: true,
 fullscreenExitCount: true,
 score: true,
 },
 orderBy: {
 createdAt: 'asc',
 },
 },
 },
 });

 if (!proctoredSession) {
 return NextResponse.json({ error: 'Session not found' }, { status: 404 });
 }

 return NextResponse.json(proctoredSession);
 } catch (error) {
 console.error('Failed to fetch session:', error);
 return NextResponse.json(
 { error: 'Failed to fetch session' },
 { status: 500 }
 );
 }
}

export async function PATCH(
 request: NextRequest,
 { params }: { params: Promise<{ sessionId: string }> }
) {
 try {
 const session = await getSession();
 if (!session || !isStaff(session)) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { sessionId } = await params;
 const body = await request.json();
 const { status } = body;

 if (!['ACTIVE', 'COMPLETED', 'REVOKED'].includes(status)) {
 return NextResponse.json(
 { error: 'Invalid status' },
 { status: 400 }
 );
 }

 const updated = await prisma.proctoredSession.update({
 where: { id: sessionId },
 data: {
 status: status as any,
 },
 include: {
 participants: {
 select: {
 id: true,
 studentId: true,
 userName: true,
 email: true,
 status: true,
 startedAt: true,
 completedAt: true,
 currentModule: true,
 currentQuestionIndex: true,
 timeRemaining: true,
 lastHeartbeat: true,
 timeAdded: true,
 fullscreenExitCount: true,
 score: true,
 },
 orderBy: {
 createdAt: 'asc',
 },
 },
 },
 });

 if (status === 'COMPLETED') {
 // Mark active participants as completed
 await prisma.proctoredParticipant.updateMany({
 where: {
 sessionId,
 status: { in: ['TAKING', 'WAITING', 'PAUSED'] },
 },
 data: {
 status: 'COMPLETED',
 completedAt: new Date(),
 },
 });
 } else if (status === 'REVOKED') {
 // Mark active participants as disqualified/revoked
 await prisma.proctoredParticipant.updateMany({
 where: {
 sessionId,
 status: { in: ['TAKING', 'WAITING', 'PAUSED'] },
 },
 data: {
 status: 'DISQUALIFIED',
 },
 });
 }

 return NextResponse.json(updated);
 } catch (error) {
 console.error('Failed to update session:', error);
 return NextResponse.json(
 { error: error instanceof Error ? error.message : 'Failed to update session' },
 { status: 500 }
 );
 }
}