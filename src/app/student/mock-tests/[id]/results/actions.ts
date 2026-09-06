"use server";
import { prisma } from "@/lib/db/prisma";
import { generateStructured } from "@/lib/ai/core";

export async function generateAIAnalysis(attemptId: string) {
  try {
    const attempt = await prisma.studentTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        satTest: { include: { questions: true } },
      },
    });

    if (!attempt || !attempt.reviewIndex) {
      throw new Error("Attempt or review data not found");
    }

    // Return cached analysis if already generated
    if (attempt.aiEstimatedScore && typeof attempt.aiEstimatedScore === "object") {
      const cached = attempt.aiEstimatedScore as any;
      if (cached.strengths && cached.weaknesses && cached.roadmap) {
        return {
          success: true,
          analysis: cached,
        };
      }
    }

    const reviewData = attempt.reviewIndex as any[];
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

    // Save to database so subsequent loads are instant and free
    if (parsed) {
      await prisma.studentTestAttempt.update({
        where: { id: attemptId },
        data: { aiEstimatedScore: parsed },
      });
    }

    return {
      success: true,
      analysis: parsed,
    };
  } catch (error: any) {
    console.error("AI Analysis error:", error.message);
    return {
      success: false,
      error: "Failed to generate AI analysis",
    };
  }
}
