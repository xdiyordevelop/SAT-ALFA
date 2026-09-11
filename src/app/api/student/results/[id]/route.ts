import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const session = await getSession();
 if (!session?.userId) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const { id: attemptId } = await params; // Fetch test attempt with related data

 const attempt = await prisma.studentTestAttempt.findUnique({
 where: { id: attemptId },
 include: {
 student: {
 select: {
 id: true,
 firstName: true,
 lastName: true,
 user: {
 select: {
 id: true,
 },
 },
 },
 },
 satTest: {
 select: {
 name: true,
 },
 },
 },
 });

 if (!attempt) {
 return NextResponse.json(
 { success: false, error: 'Test attempt not found' },
 { status: 404 }
 );
 } // Verify ownership

 if (attempt.student.user.id !== session.userId) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 403 }
 );
 }

 return NextResponse.json({
 id: attempt.id,
 totalScore: attempt.totalScore,
 rwScore: attempt.rwScore,
 mathScore: attempt.mathScore,
 rwRaw: attempt.rwRaw,
 mathRaw: attempt.mathRaw,
 completedAt: attempt.completedAt,
 userAnswers: attempt.userAnswers,
 reviewIndex: attempt.reviewIndex,
 student: {
 firstName: attempt.student.firstName,
 lastName: attempt.student.lastName,
 },
 satTest: {
 name: attempt.satTest.name,
 },
 });
 } catch (error) {
 console.error('Failed to fetch results:', error);
 return NextResponse.json(
 {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to fetch results',
 },
 { status: 500 }
 );
 }
}