import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ sessionId: string }> }
) {
 try {
 const session = await getSession();
 if (!session || session.role !== 'ADMIN') {
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
 fullscreenExitCount: true,
 score: true,
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
 if (!session || session.role !== 'ADMIN') {
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
 ...(status === 'COMPLETED' && { completedAt: new Date() }),
 },
 include: {
 participants: true,
 },
 });

 return NextResponse.json(updated);
 } catch (error) {
 console.error('Failed to update session:', error);
 return NextResponse.json(
 { error: 'Failed to update session' },
 { status: 500 }
 );
 }
}