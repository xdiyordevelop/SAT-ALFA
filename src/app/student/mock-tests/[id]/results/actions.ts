"use server";
import { prisma } from "@/lib/db/prisma";
import { generateStructured } from "@/lib/ai/core";
import { repairAndScoreAttempt } from "@/lib/sat/scoring";
import { scoreSingleAttemptWithAI } from "@/lib/ai/scoring-engine";

export async function generateAIAnalysis(attemptId: string) {
  try {
    let attempt = await prisma.studentTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        satTest: { include: { questions: true } },
      },
    });

    if (!attempt || !attempt.reviewIndex) {
      throw new Error("Attempt or review data not found");
    }

    // If attempt has missing or 0 scores, auto-repair it first
    attempt = await repairAndScoreAttempt(attempt, attempt.satTest?.questions);
    if (!attempt) {
      throw new Error("Failed to load attempt after repair");
    }

    // Return cached analysis if already complete
    if (attempt.aiEstimatedScore && typeof attempt.aiEstimatedScore === "object") {
      const cached = attempt.aiEstimatedScore as any;
      if (cached.strengths?.length > 0 && cached.weaknesses?.length > 0 && cached.roadmap?.length > 0) {
        return {
          success: true,
          analysis: cached,
        };
      }
    }

    // Try full AI IRT scoring engine first
    try {
      const aiResult = await scoreSingleAttemptWithAI(attemptId);
      if (aiResult && aiResult.strengths?.length > 0) {
        return {
          success: true,
          analysis: aiResult,
        };
      }
    } catch (engineErr: any) {
      console.warn("AI scoring engine fallback to diagnostic prompt:", engineErr?.message);
    }

    const reviewData = (attempt.reviewIndex as any[]) || [];
    const domainStats: Record<string, { correct: number; total: number }> = {};
    
    reviewData.forEach((item) => {
      const d = item.domain || "General";
      if (!domainStats[d]) {
        domainStats[d] = { correct: 0, total: 0 };
      }
      domainStats[d].total++;
      if (item.isCorrect) {
        domainStats[d].correct++;
      }
    });

    const prompt = `You are an expert SAT tutor analyzing a student's performance on the Digital SAT mock test.
Total Score: ${attempt.totalScore} / 1600 (Math: ${attempt.mathScore} / 800, Reading & Writing: ${attempt.rwScore} / 800).

Detailed Domain Breakdown (correct/total):
${JSON.stringify(domainStats, null, 2)}

Provide deeply insightful, highly constructive, and highly specific feedback based on these domains.
Do not use generic statements. Point out exactly which skills need work.
For the roadmap, give 3-4 concrete actionable steps they must take.

Return EXACTLY a JSON object matching this structure:
{
  "strengths": ["highly specific strength 1", "highly specific strength 2"],
  "weaknesses": ["highly specific weakness 1", "highly specific weakness 2"],
  "roadmap": ["actionable step 1", "actionable step 2", "actionable step 3"]
}`;

    const { parsed } = await generateStructured<any>({
      userPrompt: prompt,
      temperature: 0.4,
    });

    const finalAnalysis = parsed || {
      strengths: ["Solid test endurance", "Foundational question familiarity"],
      weaknesses: ["Timed accuracy under pressure", "Domain-specific mastery"],
      roadmap: [
        "Review missed questions in the Review Pane below",
        "Target weakest domain skills with focused practice sets",
        "Retake timed mock test to track score growth"
      ]
    };

    // Save to database so subsequent loads are instant and free
    await prisma.studentTestAttempt.update({
      where: { id: attemptId },
      data: { aiEstimatedScore: finalAnalysis },
    });

    return {
      success: true,
      analysis: finalAnalysis,
    };
  } catch (error: any) {
    console.error("AI Analysis error:", error.message);
    return {
      success: false,
      error: "Failed to generate AI analysis",
    };
  }
}

