import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeBugReportWithAI, BugReportContext } from '@/lib/ai/bug-report';

export async function POST(req: Request) {
 try {
 const body = await req.json();
 const { studentId, testId, questionId, issueType, message, screenshot, questionContext } = body;

 if (!studentId || !message || !issueType) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
 }

 // 1. Analyze with AI
 const ctx: BugReportContext = {
 testName: questionContext?.testName || 'Unknown Test',
 testId: testId || 'unknown',
 section: questionContext?.section || 'Unknown',
 module: questionContext?.module || 'Unknown',
 questionNumber: questionContext?.questionNumber || '?',
 prompt: questionContext?.prompt || '',
 options: questionContext?.options || {},
 passage: questionContext?.passage || '',
 };

 const aiResult = await analyzeBugReportWithAI(ctx, issueType, message);

 // 2. Save to database
 const bugReport = await prisma.bugReport.create({
 data: {
 studentId,
 satTestId: testId,
 questionId: questionId,
 issueType,
 message,
 screenshot,
 status: 'open',
 priority: aiResult.priority || 'MEDIUM',
 aiAnalysis: aiResult.analysis || '',
 suggestedFix: aiResult.suggested_fix || '',
 fixPayload: aiResult.fix_payload as any,
 }
 });

 // 3. (Optional) Forward to Telegram webhook here
 // In a real implementation, you would call your webhook URL
 // e.g., fetch('https://bug-report-webhook.onrender.com/send-bug-report', { ... })

 return NextResponse.json({ success: true, reportId: bugReport.id, aiAnalysis: aiResult });
 } catch (error: any) {
 console.error('[API] Bug Report Error:', error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}