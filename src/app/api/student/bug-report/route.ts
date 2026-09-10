import { NextResponse, after } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { analyzeBugReportWithAI, BugReportContext } from '@/lib/ai/bug-report';
import { renderPdfPage, cropImageFromBuffer, saveQuestionImage } from '@/lib/ai/pdf-renderer';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    // 1. Save base64 screenshot to disk if provided
    let screenshotUrl: string | null = null;
    if (screenshot && typeof screenshot === 'string' && screenshot.startsWith('data:image/')) {
      try {
        const bugsDir = path.join(process.cwd(), 'public', 'uploads', 'bugs');
        await mkdir(bugsDir, { recursive: true });

        const extMatch = screenshot.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
        const ext = extMatch ? (extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1]) : 'jpg';
        const base64Data = screenshot.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');
        const filename = `bug-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = path.join(bugsDir, filename);

        await writeFile(filePath, Buffer.from(base64Data, 'base64'));
        screenshotUrl = `/uploads/bugs/${filename}`;
      } catch (saveErr) {
        console.warn('[BugReport] Failed to save screenshot to disk:', saveErr);
      }
    } else if (screenshot && typeof screenshot === 'string') {
      screenshotUrl = screenshot;
    }

    // 2. Save Bug Report record to DB immediately so student is NEVER blocked
    const bugReport = await prisma.bugReport.create({
      data: {
        studentId: resolvedStudentId,
        satTestId: testId || null,
        questionId: questionId || null,
        issueType,
        message,
        screenshot: screenshotUrl,
        status: 'open',
        priority: 'MEDIUM',
        aiAnalysis: 'AI background ground-truth analysis queued...',
        suggestedFix: '',
      },
    });

    // 3. Immediately dispatch asynchronous background worker (runs non-blocking)
    const runBackgroundWorker = async () => {
      try {
        let dbQuestion: any = null;
        if (questionId) {
          dbQuestion = await prisma.sATQuestion.findUnique({
            where: { id: questionId },
            include: { satTest: true },
          });
        }

        let ctx: BugReportContext | null = null;
        if (questionId && dbQuestion) {
          // Resolve exact module source file (Targeted Resolution Hierarchy):
          // 1. dbQuestion.sourceFileUrl (exact file this question was imported from)
          // 2. dbQuestion.satTest.moduleSourceFiles[dbQuestion.module] (per-module file)
          // 3. dbQuestion.satTest.sourceFileUrl (test-level fallback for single-file tests)
          const moduleFiles = (dbQuestion.satTest?.moduleSourceFiles as any) || {};
          const moduleKey = questionContext?.module || dbQuestion.module;
          const specificModuleFile = moduleFiles[moduleKey] || moduleFiles[dbQuestion.module];

          const resolvedSourceFileUrl =
            dbQuestion.sourceFileUrl ||
            specificModuleFile?.url ||
            dbQuestion.satTest?.sourceFileUrl ||
            null;

          const resolvedSourceFileName =
            dbQuestion.sourceFileName ||
            specificModuleFile?.fileName ||
            dbQuestion.satTest?.sourceFileName ||
            null;

          ctx = {
            testName: dbQuestion.satTest?.name || questionContext?.testName || 'SAT Mock Test',
            testId: dbQuestion.satTestId || testId || 'unknown',
            section: questionContext?.section || (dbQuestion.module.includes('3') || dbQuestion.module.includes('4') ? 'Math' : 'Reading & Writing'),
            module: moduleKey,
            questionNumber: questionContext?.questionNumber || dbQuestion.questionNumber,
            prompt: dbQuestion.prompt || questionContext?.prompt || '',
            options: (dbQuestion.options as any) || questionContext?.options || {},
            passage: dbQuestion.passage || questionContext?.passage || '',
            correctAnswer: dbQuestion.correctAnswer || questionContext?.correctAnswer || '',
            imageUrl: dbQuestion.imageUrl,
            sourceFileUrl: resolvedSourceFileUrl,
            sourceFileName: resolvedSourceFileName,
          };
        } else if (testId) {
          const testRecord = await prisma.sATMockTest.findUnique({ where: { id: testId } });
          const moduleFiles = (testRecord?.moduleSourceFiles as any) || {};
          const reqMod = questionContext?.module || 'Unknown';
          const specificModuleFile = moduleFiles[reqMod];

          const resolvedSourceFileUrl =
            specificModuleFile?.url ||
            testRecord?.sourceFileUrl ||
            null;

          const resolvedSourceFileName =
            specificModuleFile?.fileName ||
            testRecord?.sourceFileName ||
            null;

          ctx = {
            testName: testRecord?.name || questionContext?.testName || 'SAT Mock Test',
            testId: testId || 'unknown',
            section: questionContext?.section || 'Unknown',
            module: reqMod,
            questionNumber: questionContext?.questionNumber || '?',
            prompt: questionContext?.prompt || '',
            options: questionContext?.options || {},
            passage: questionContext?.passage || '',
            correctAnswer: questionContext?.correctAnswer || '',
            sourceFileUrl: resolvedSourceFileUrl,
            sourceFileName: resolvedSourceFileName,
          };
        }

        if (!ctx) return;

        // Run AI analysis with Ground-Truth source document in the background
        const aiResult = await analyzeBugReportWithAI(ctx, issueType, message, screenshot);

        let autoFixed = false;
        let autoFixDetails: string | null = null;

        if (aiResult.can_auto_fix && questionId && aiResult.fix_payload) {
          const payload = aiResult.fix_payload;
          const updateData: any = {};

          if (payload.updatedQuestion) {
            const uq = payload.updatedQuestion;
            if (uq.prompt) updateData.prompt = uq.prompt;
            if (uq.passage !== undefined) updateData.passage = uq.passage;
            if (uq.options && typeof uq.options === 'object') updateData.options = uq.options;
            if (uq.correctAnswer) updateData.correctAnswer = String(uq.correctAnswer).trim();
            if (uq.imageUrl !== undefined) updateData.imageUrl = uq.imageUrl;
            if (uq.imagePosition) updateData.imagePosition = uq.imagePosition;

            autoFixDetails = aiResult.source_verified
              ? `Reconstructed from original source document (${aiResult.source_reference || 'Source PDF'}).`
              : `Auto-corrected based on AI ground-truth verification.`;
          } else if (payload.action === 'remove' || payload.action === 'delete') {
            if (payload.field === 'imageUrl' || payload.field === 'image' || issueType === 'image-issue' || (payload.field === 'passage' && !payload.newValue)) {
              updateData.imageUrl = null;
              autoFixDetails = 'Irrelevant or wrongly attached image removed from question.';
            }
          } else if (payload.field === 'correctAnswer' && payload.newValue) {
            updateData.correctAnswer = String(payload.newValue).trim();
            autoFixDetails = `Correct answer updated to "${updateData.correctAnswer}".`;
          } else if (payload.field === 'prompt' && payload.newValue) {
            updateData.prompt = String(payload.newValue);
            autoFixDetails = `Question prompt text corrected.`;
          } else if (payload.field === 'passage' && payload.newValue) {
            updateData.passage = String(payload.newValue);
            autoFixDetails = `Passage text corrected.`;
          } else if (payload.field === 'options' && payload.newValue && typeof payload.newValue === 'object') {
            updateData.options = payload.newValue;
            autoFixDetails = `Question options corrected.`;
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.sATQuestion.update({
              where: { id: questionId },
              data: updateData,
            });
            autoFixed = true;
          }

          // IMAGE EXTRACTION: If AI identified a diagram/figure in the PDF, crop and save it
          if (payload.extractImage && ctx.sourceFileUrl) {
            try {
              const { pageNumber, boundingBox, description } = payload.extractImage;
              const cleanPath = ctx.sourceFileUrl.startsWith('/') ? ctx.sourceFileUrl.slice(1) : ctx.sourceFileUrl;
              const fullPdfPath = path.join(process.cwd(), 'public', cleanPath);

              console.log(`[BugReport] Extracting image from PDF page ${pageNumber}, bbox:`, boundingBox);

              // 1. Render the PDF page at high resolution (150 DPI)
              const rendered = await renderPdfPage(fullPdfPath, pageNumber, 150);
              console.log(`[BugReport] Rendered page ${pageNumber}: ${rendered.width}x${rendered.height}`);

              // 2. Crop the image region using AI-provided bounding box
              const croppedBuffer = await cropImageFromBuffer(rendered.buffer, boundingBox, 0.02);
              console.log(`[BugReport] Cropped image: ${(croppedBuffer.length / 1024).toFixed(1)} KB`);

              // 3. Save to disk and get URL
              const imageUrl = await saveQuestionImage(croppedBuffer, questionId);

              // 4. Update question's imageUrl in database
              await prisma.sATQuestion.update({
                where: { id: questionId },
                data: { imageUrl },
              });

              autoFixed = true;
              autoFixDetails = (autoFixDetails || '') + ` Image extracted from PDF page ${pageNumber} (${description || 'diagram/figure'}).`;
              console.log(`[BugReport] ✅ Image auto-extracted and saved: ${imageUrl}`);
            } catch (imgErr: any) {
              console.error('[BugReport] Image extraction failed:', imgErr.message);
              // Don't fail the whole auto-fix if image extraction fails
              autoFixDetails = (autoFixDetails || '') + ` [Image extraction attempted but failed: ${imgErr.message}]`;
            }
          }
        }

        // Update BugReport record in database
        await prisma.bugReport.update({
          where: { id: bugReport.id },
          data: {
            satTestId: bugReport.satTestId || dbQuestion?.satTestId || null,
            status: autoFixed ? 'resolved' : 'open',
            priority: aiResult.priority || 'MEDIUM',
            aiAnalysis: autoFixed
              ? `${aiResult.analysis} [AUTO-FIXED BY AI: ${autoFixDetails}]`
              : (aiResult.analysis || 'Completed ground-truth review.'),
            suggestedFix: aiResult.suggested_fix || '',
            fixPayload: {
              ...aiResult.fix_payload,
              autoFixed,
              autoFixDetails,
              source_verified: Boolean(aiResult.source_verified),
              source_reference: aiResult.source_reference || null,
              discrepancies: aiResult.discrepancies || [],
              appliedAt: autoFixed ? new Date().toISOString() : null,
            } as any,
          },
        });

        // Telegram notification dispatch in background
        try {
          const { sendTelegramMessage } = await import('@/lib/telegram');
          const studentName = session?.username || 'Student';
          const sourceBadge = aiResult.source_verified ? `📑 [Source Verified: ${aiResult.source_reference || 'PDF'}]` : '';
          const tgText = `🚨 *SAT-ALFA Issue Report* ${autoFixed ? '⚡ (AUTO-FIXED BY AI)' : ''}\n\n` +
            `👤 *Student:* ${studentName}\n` +
            `🏷️ *Category:* \`${issueType}\`\n` +
            `📝 *Description:* ${message}\n` +
            (sourceBadge ? `🔍 *Ground-Truth:* ${sourceBadge}\n` : '') +
            (autoFixed ? `✅ *Auto-Fix Applied:* ${autoFixDetails}\n` : '') +
            (testId ? `🎯 *Test ID:* \`${testId}\`\n` : '') +
            `🆔 *Report ID:* \`${bugReport.id}\``;

          await sendTelegramMessage(tgText, 'Markdown');
        } catch (tgError) {
          console.warn('[BugReport] Telegram dispatch skipped/failed:', tgError);
        }
      } catch (bgError) {
        console.error('[BugReport Worker] Background processing error:', bgError);
      }
    };

    // Execute background worker using Next.js after() so it completes reliably after response is returned
    after(async () => {
      try {
        await runBackgroundWorker();
      } catch (e) {
        console.error('[BugReport] Worker unhandled error in after():', e);
      }
    });

    // Return instant success response to student in <50ms!
    return NextResponse.json({
      success: true,
      reportId: bugReport.id,
      message: 'Report submitted successfully! You can resume your test.',
    });
  } catch (error: any) {
    console.error('[API] Bug Report Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit bug report' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');
    const questionId = searchParams.get('questionId');

    if (reportId) {
      const report = await prisma.bugReport.findUnique({
        where: { id: reportId },
        select: {
          id: true,
          status: true,
          questionId: true,
          fixPayload: true,
          aiAnalysis: true,
        },
      });

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      let question: any = null;
      if (report.questionId) {
        question = await prisma.sATQuestion.findUnique({
          where: { id: report.questionId },
          select: {
            id: true,
            prompt: true,
            passage: true,
            options: true,
            imageUrl: true,
            imagePosition: true,
            correctAnswer: true,
            questionNumber: true,
          },
        });
      }

      const fixPayload = (report.fixPayload as any) || {};

      return NextResponse.json({
        reportId: report.id,
        status: report.status,
        autoFixed: Boolean(fixPayload.autoFixed),
        autoFixDetails: fixPayload.autoFixDetails || null,
        question,
      });
    }

    if (questionId) {
      const question = await prisma.sATQuestion.findUnique({
        where: { id: questionId },
        select: {
          id: true,
          prompt: true,
          passage: true,
          options: true,
          imageUrl: true,
          imagePosition: true,
          correctAnswer: true,
          questionNumber: true,
        },
      });

      return NextResponse.json({ question });
    }

    return NextResponse.json({ error: 'Missing reportId or questionId parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[API] Bug Report GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch bug report status' }, { status: 500 });
  }
}