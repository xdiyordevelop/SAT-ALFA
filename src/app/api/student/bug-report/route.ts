import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { analyzeBugReportWithAI, BugReportContext } from '@/lib/ai/bug-report';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { studentId, testId, questionId, issueType, message, screenshot, questionContext } = body;

    // Resolve studentId from session if missing
    let resolvedStudentId = studentId;
    if (!resolvedStudentId && session?.userId) {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      resolvedStudentId = student?.id;
    }

    if (!resolvedStudentId || !message || !issueType) {
      return NextResponse.json({ error: 'Missing required fields (studentId, issueType, or message).' }, { status: 400 });
    }

    let aiResult: any = { priority: 'MEDIUM', analysis: 'General platform feedback/issue report.', suggested_fix: '' };

    // Run AI analysis if associated with a test question
    if (testId && questionContext) {
      try {
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
        aiResult = await analyzeBugReportWithAI(ctx, issueType, message);
      } catch (err) {
        console.warn('[BugReport] AI analysis failed, falling back to default:', err);
      }
    }

    // Save to database
    const bugReport = await prisma.bugReport.create({
      data: {
        studentId: resolvedStudentId,
        satTestId: testId || null,
        questionId: questionId || null,
        issueType,
        message,
        screenshot: screenshot || null,
        status: 'open',
        priority: aiResult.priority || 'MEDIUM',
        aiAnalysis: aiResult.analysis || '',
        suggestedFix: aiResult.suggested_fix || '',
        fixPayload: aiResult.fix_payload as any,
      },
    });

    // 3. Dispatch alert to Telegram channel/group if configured
    try {
      const { sendTelegramMessage } = await import('@/lib/telegram');
      const studentName = session?.username || 'Student';
      const tgText = `🚨 *SAT-ALFA New Issue Report*\n\n` +
        `👤 *Student:* ${studentName}\n` +
        `🏷️ *Category:* \`${issueType}\`\n` +
        `📝 *Description:* ${message}\n` +
        (testId ? `🎯 *Test ID:* \`${testId}\`\n` : '') +
        `🆔 *Report ID:* \`${bugReport.id}\``;

      await sendTelegramMessage(tgText, 'Markdown');
    } catch (tgError) {
      console.warn('[BugReport] Telegram dispatch skipped/failed:', tgError);
    }

    return NextResponse.json({ success: true, reportId: bugReport.id, aiAnalysis: aiResult });
  } catch (error: any) {
    console.error('[API] Bug Report Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit bug report' }, { status: 500 });
  }
}