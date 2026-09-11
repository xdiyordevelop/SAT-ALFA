import { prisma } from '@/lib/db/prisma';
import { geminiProvider } from '@/lib/ai/providers/gemini';
import { ScoringStatus } from '@/lib/prisma';

export interface ScoreProgressCallback {
 (scored: number, total: number, message: string): void;
}

/**
 * Main queue processor: processes all students for a proctored session.
 *
 * @param sessionId - the proctored session ID
 * @param onProgress - optional callback for progress
 */
export async function processSessionScores(sessionId: string, onProgress?: ScoreProgressCallback) {
 console.log(`[SCORING] === PIPELINE START === Session: ${sessionId}`);

 // 1. Get session info
const session = await prisma.proctoredSession.findUnique({
 where: { id: sessionId },
 include: {
 satTest: {
 include: { questions: true }
 },
 participants: {
 where: { status: 'COMPLETED' },
 include: { student: true }
 }
 }
 });

 if (!session) throw new Error('Session not found');

 const testName = session.satTest.name;
 const allQuestions = session.satTest.questions;
 
 allQuestions.sort((a, b) => {
 // Sort by module first, then question number
const modMap: Record<string, number> = {
 'MODULE_1': 1, 'MODULE_2': 2, 'MODULE_3': 3, 'MODULE_4': 4
 };
 if (a.module !== b.module) return (modMap[a.module] || 0) - (modMap[b.module] || 0);
 return a.questionNumber - b.questionNumber;
 });

 // 2. Mark session as processing
 await prisma.proctoredSession.update({
 where: { id: sessionId },
 data: {
 scoringStartedAt: new Date()
 }
 });

 const participants = session.participants;
 if (participants.length === 0) {
 await prisma.proctoredSession.update({
 where: { id: sessionId },
 data: { scoringStatus: ScoringStatus.SCORED, scoredCount: 0, totalParticipants: 0 }
 });
 return { success: true, scoredCount: 0, errors: [] };
 }

 // 3. Collect all result docs
const testAttempts = await prisma.studentTestAttempt.findMany({
 where: {
 satTestId: session.satTestId,
 studentId: { in: participants.map(p => p.studentId) },
 }
 });

 if (testAttempts.length === 0) {
 return { success: false, scoredCount: 0, errors: ['No completed test attempts found for participants'] };
 }

 // 4. Collect raw scores for group comparison
const groupRawScores = testAttempts.map(attempt => ({
 name: attempt.studentId,
 rwRaw: attempt.rwRaw || 0,
 mathRaw: attempt.mathRaw || 0,
 rwTotal: attempt.rwTotal || 54,
 mathTotal: attempt.mathTotal || 44
 }));

 // 5. Process each student one-by-one
let scoredCount = 0;
 const errors: { studentId: string; error: string }[] = [];

 for (let i = 0; i < testAttempts.length; i++) {
 const attempt = testAttempts[i];
 console.log(`[SCORING] --- Student ${i + 1}/${testAttempts.length}: ${attempt.id} ---`);

 // Skip already-scored students on re-runs
if (attempt.aiEstimatedScore) {
 console.log(`[SCORING] Already scored. Skipping.`);
 scoredCount++;
 if (onProgress) onProgress(scoredCount, testAttempts.length, `Student ${i + 1} already scored`);
 continue;
 }

 if (onProgress) onProgress(scoredCount, testAttempts.length, `Processing student ${i + 1}...`);

 try {
 // Rate limit roughly
if (i > 0) {
 await new Promise(r => setTimeout(r, 2000));
 }
const aiScore = await scoreStudentWithAI(attempt, allQuestions, groupRawScores, testName);

 if (aiScore) {
 // Write AI score to StudentTestAttempt
 await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: {
 aiEstimatedScore: aiScore,
 scoringStatus: ScoringStatus.SCORED,
 totalScore: aiScore.totalScore,
 rwScore: aiScore.rwScore,
 mathScore: aiScore.mathScore
 }
 });

 // Also update the participant doc with the final scores
 await prisma.proctoredParticipant.updateMany({
 where: { sessionId, studentId: attempt.studentId },
 data: {
 score: aiScore.totalScore
 }
 });

 scoredCount++;
 } else {
 errors.push({ studentId: attempt.studentId, error: 'Scoring returned null' });
 }

 // Update session progress
 await prisma.proctoredSession.update({
 where: { id: sessionId },
 data: { scoredCount }
 });

 } catch (err: any) {
 console.error(`[SCORING] Error scoring ${attempt.id}:`, err.message);
 errors.push({ studentId: attempt.studentId, error: err.message });
 }
 }

 // 6. Second pass: comparison normalization
if (scoredCount === testAttempts.length && scoredCount > 1) {
 console.log('[SCORING] === NORMALIZATION PASS ===');
 if (onProgress) onProgress(scoredCount, testAttempts.length, 'Normalizing scores...');

 try {
 await new Promise(r => setTimeout(r, 2000));
 await compareAndNormalizeScores(sessionId, session.satTestId);
 } catch (err: any) {
 console.warn('[SCORING] Score comparison pass failed:', err.message);
 }
 }

 // 7. Mark session as scored
const publishAfter = new Date(session.createdAt.getTime() + 12 * 60 * 60 * 1000);

 await prisma.proctoredSession.update({
 where: { id: sessionId },
 data: {
 scoringStatus: ScoringStatus.SCORED,
 scoredCount,
 totalParticipants: testAttempts.length,
 scoredAt: new Date(),
 publishAfter
 }
 });

 console.log(`[SCORING] === COMPLETE: ${scoredCount}/${testAttempts.length} scored ===`);
 if (onProgress) onProgress(scoredCount, testAttempts.length, 'Processing complete.');

 return { success: true, scoredCount, errors };
}

async function scoreStudentWithAI(attemptData: any, allQuestions: any[], groupRawScores: any[], testName: string) {
 const userAnswers: Record<string, string> = attemptData.userAnswers || {};

 const wrongQuestions: any[] = [];
 const rightQuestions: any[] = [];

 allQuestions.forEach(q => {
 const studentAns = userAnswers[q.id];
 const correct = studentAns === q.correctAnswer;
 
 // Treat MODULE_1 and MODULE_2 as R&W, MODULE_3 and MODULE_4 as Math for tracking based on SAT structure
 const section = (q.module === 'MODULE_1' || q.module === 'MODULE_2') ? 'R&W' : 'Math';

 const info = {
 module: q.module,
 number: q.questionNumber,
 section,
 difficulty: q.difficulty,
 skill: q.skill || q.domain,
 correctAnswer: q.correctAnswer,
 studentAnswer: studentAns || '(blank)'
 };
 if (correct) rightQuestions.push(info);
 else wrongQuestions.push(info);
 });

 // Determine module path (adaptive routing);
const m1Questions = allQuestions.filter(q => q.module === 'MODULE_1');
 const m1Correct = m1Questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
 const m1Pct = m1Questions.length > 0 ? (m1Correct / m1Questions.length * 100).toFixed(0) : 0;

 const m3Questions = allQuestions.filter(q => q.module === 'MODULE_3');
 const m3Correct = m3Questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
 const m3Pct = m3Questions.length > 0 ? (m3Correct / m3Questions.length * 100).toFixed(0) : 0;

 const avgRwRaw = groupRawScores.reduce((s, g) => s + g.rwRaw, 0) / (groupRawScores.length || 1);
 const avgMathRaw = groupRawScores.reduce((s, g) => s + g.mathRaw, 0) / (groupRawScores.length || 1);

 const prompt = `You are a College Board SAT scoring expert. Estimate the ACCURATE scaled score for a student who took a Digital SAT practice test.

## Background: Digital SAT Scoring
- R&W: 54 questions total. Raw 54 = 800, Raw 51-52 = 760-780, Raw 45-48 = 660-700, Raw 35-40 = 530-580
- Math: 44 questions total. Raw 44 = 800, Raw 41-42 = 780-800, Raw 35-38 = 730-780, Raw 25-30 = 590-660
- Getting a HARD question wrong is penalized less than getting an EASY question wrong.

## Student Performance
**Test:** ${testName}
**R&W Raw Score:** ${attemptData.rwRaw}/${attemptData.rwTotal || 54} correct
**Math Raw Score:** ${attemptData.mathRaw}/${attemptData.mathTotal || 44} correct

**Module 1 (R&W) Performance:** ${m1Correct}/${m1Questions.length} correct (${m1Pct}%) — ${Number(m1Pct) > 65 ? 'HARD Module 2 path' : 'EASY Module 2 path'}
**Module 3 (Math) Performance:** ${m3Correct}/${m3Questions.length} correct (${m3Pct}%) — ${Number(m3Pct) > 65 ? 'HARD Module 4 path' : 'EASY Module 4 path'}

**Questions WRONG (${wrongQuestions.length} total):**
${wrongQuestions.map(q => `- \${q.section} \${q.module} Q\${q.number}: difficulty=\${q.difficulty}, skill=\${q.skill}, student="\${q.studentAnswer}", correct="\${q.correctAnswer}"`).join('\n') || 'None — perfect score!'}

**Questions RIGHT (${rightQuestions.length} total):**
${rightQuestions.filter(q => q.section === 'R&W').length} R&W correct, ${rightQuestions.filter(q => q.section === 'Math').length} Math correct.

**Group Context (${groupRawScores.length} students):**
- Average R&W raw: ${avgRwRaw.toFixed(1)}/${attemptData.rwTotal || 54}
- Average Math raw: ${avgMathRaw.toFixed(1)}/${attemptData.mathTotal || 44}

Return ONLY valid JSON (no markdown):
{
 "rwScore": <number 200-800>,
 "mathScore": <number 200-800>,
 "totalScore": <number 400-1600>,
 "confidence": "high" | "medium" | "low",
 "explanation": "<2-3 sentence explanation referencing difficulty and IRT>",
 "rwStrengths": ["<strength 1>"],
 "rwWeaknesses": ["<weakness 1>"],
 "mathStrengths": ["<strength 1>"],
 "mathWeaknesses": ["<weakness 1>"],
 "studyRecommendation": "<actionable recommendation>"
}`;

 const response = await geminiProvider.generateContent({
 userPrompt: prompt,
 responseFormat: 'json_object',
 temperature: 0.2
 });

 try {
 return JSON.parse(response.text);
 } catch (e: any) {
 console.error('[SCORING] Failed to parse AI response:', e.message);
 return null;
 }
}

async function compareAndNormalizeScores(sessionId: string, satTestId: string) {
 const participants = await prisma.proctoredParticipant.findMany({
 where: { sessionId, status: 'COMPLETED' },
 select: { studentId: true }
 });

 const testAttempts = await prisma.studentTestAttempt.findMany({
 where: {
 satTestId,
 studentId: { in: participants.map(p => p.studentId) },
 }
 });

 const studentScores = testAttempts
 .filter(t => t.aiEstimatedScore)
 .map(t => {
 const aiScore: any = t.aiEstimatedScore;
 return {
 id: t.id,
 rwRaw: t.rwRaw,
 mathRaw: t.mathRaw,
 aiRW: aiScore.rwScore,
 aiMath: aiScore.mathScore,
 aiTotal: aiScore.totalScore
 };
 });

 if (studentScores.length < 2) return;

 const comparisonPrompt = `You are an SAT score normalization expert. Review these ${studentScores.length} students' estimated scores and verify they are internally consistent.

Students:
${studentScores.map((s, i) => `Student ${i}: rwRaw=${s.rwRaw}, mathRaw=${s.mathRaw}, estRW=${s.aiRW}, estMath=${s.aiMath}, estTotal=${s.aiTotal}`).join('\n')}

Rules:
- Higher raw scores MUST result in higher or equal scaled scores.
- The gap between students with similar raw scores should be small.
- If any inconsistency is found, suggest corrections.

Return ONLY valid JSON (no markdown):
{
 "adjustments": [
 { "studentIndex": 0, "newRW": 750, "newMath": 690, "newTotal": 1440, "reason": "..." }
 ],
 "groupAnalysis": "Brief analysis of this cohort's performance"
}
If no adjustments needed, return: { "adjustments": [], "groupAnalysis": "..." }`;

 const response = await geminiProvider.generateContent({
 userPrompt: comparisonPrompt,
 responseFormat: 'json_object',
 temperature: 0.1
 });

 try {
 const comparison = JSON.parse(response.text);
 const adjustments = comparison.adjustments || [];

 for (const adj of adjustments) {
 const student = studentScores[adj.studentIndex];
 if (student) {
 // Find existing attempt to update the nested JSON
const attempt = testAttempts.find(t => t.id === student.id);
 if (attempt && attempt.aiEstimatedScore) {
 const updatedAiScore = {
 ...(attempt.aiEstimatedScore as any),
 rwScore: adj.newRW,
 mathScore: adj.newMath,
 totalScore: adj.newTotal,
 adjustmentReason: adj.reason,
 groupAnalysis: comparison.groupAnalysis
 };

 await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: {
 aiEstimatedScore: updatedAiScore,
 totalScore: adj.newTotal,
 rwScore: adj.newRW,
 mathScore: adj.newMath
 }
 });
 }
 }
 }

 // Update groupAnalysis for all remaining
 for (const attempt of testAttempts) {
 if (attempt.aiEstimatedScore) {
 const aiScore = {
 ...(attempt.aiEstimatedScore as any),
 groupAnalysis: comparison.groupAnalysis
 };
 await prisma.studentTestAttempt.update({
 where: { id: attempt.id },
 data: { aiEstimatedScore: aiScore }
 });
 }
 }
 } catch (e: any) {
 console.error('[SCORING] Normalization parse error:', e.message);
 }
}

/**
 * Score a single student attempt with AI (usable for both practice and proctored tests).
 * Generates an adaptive IRT score, confidence level, diagnostic explanation, strengths,
 * weaknesses, and personalized study roadmap.
 */
export async function scoreSingleAttemptWithAI(attemptId: string) {
  try {
    const attempt = await prisma.studentTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        satTest: {
          include: { questions: true },
        },
      },
    });

    if (!attempt || !attempt.satTest || !attempt.satTest.questions) {
      return null;
    }

    const testName = attempt.satTest.name;
    const allQuestions = [...attempt.satTest.questions];

    allQuestions.sort((a, b) => {
      const modMap: Record<string, number> = {
        MODULE_1: 1,
        MODULE_2: 2,
        MODULE_3: 3,
        MODULE_4: 4,
      };
      if (a.module !== b.module) {
        return (modMap[a.module] || 0) - (modMap[b.module] || 0);
      }
      return a.questionNumber - b.questionNumber;
    });

    const groupRawScores = [
      {
        name: attempt.studentId,
        rwRaw: attempt.rwRaw || 0,
        mathRaw: attempt.mathRaw || 0,
        rwTotal: attempt.rwTotal || 54,
        mathTotal: attempt.mathTotal || 44,
      },
    ];

    const aiScore = await scoreStudentWithAI(
      attempt,
      allQuestions,
      groupRawScores,
      testName
    );

    if (aiScore) {
      const rwScore =
        typeof aiScore.rwScore === "number" && aiScore.rwScore >= 200 && aiScore.rwScore <= 800
          ? Math.round(aiScore.rwScore / 10) * 10
          : attempt.rwScore || 200;
      const mathScore =
        typeof aiScore.mathScore === "number" && aiScore.mathScore >= 200 && aiScore.mathScore <= 800
          ? Math.round(aiScore.mathScore / 10) * 10
          : attempt.mathScore || 200;
      const totalScore = rwScore + mathScore;

      const structuredScore = {
        rwScore,
        mathScore,
        totalScore,
        confidence: aiScore.confidence || "high",
        explanation: aiScore.explanation || `Digital SAT performance scored with AI IRT model.`,
        strengths: [
          ...(aiScore.rwStrengths || []),
          ...(aiScore.mathStrengths || []),
        ].filter(Boolean),
        weaknesses: [
          ...(aiScore.rwWeaknesses || []),
          ...(aiScore.mathWeaknesses || []),
        ].filter(Boolean),
        roadmap: Array.isArray(aiScore.studyRecommendation)
          ? aiScore.studyRecommendation
          : [aiScore.studyRecommendation].filter(Boolean),
        rwStrengths: aiScore.rwStrengths || [],
        rwWeaknesses: aiScore.rwWeaknesses || [],
        mathStrengths: aiScore.mathStrengths || [],
        mathWeaknesses: aiScore.mathWeaknesses || [],
        studyRecommendation: aiScore.studyRecommendation || "",
      };

      await prisma.studentTestAttempt.update({
        where: { id: attempt.id },
        data: {
          aiEstimatedScore: structuredScore,
          scoringStatus: ScoringStatus.SCORED,
          ...((!attempt.totalScore || attempt.totalScore === 0)
            ? {
                totalScore,
                rwScore,
                mathScore,
              }
            : {}),
        },
      });

      return structuredScore;
    }
  } catch (err: any) {
    console.error("[SCORING] Single attempt AI scoring failed:", err?.message || err);
  }
  return null;
}
