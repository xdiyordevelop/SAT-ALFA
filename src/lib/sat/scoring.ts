import { prisma } from "@/lib/db/prisma";
import {
  calculateSatScaledScores,
  getScaledScoreRW,
  getScaledScoreMath,
  RAW_TO_SCALED_RW,
  RAW_TO_SCALED_MATH,
} from "./scoring-calc";

export {
  calculateSatScaledScores,
  getScaledScoreRW,
  getScaledScoreMath,
  RAW_TO_SCALED_RW,
  RAW_TO_SCALED_MATH,
};

/**
 * Checks an attempt and auto-repairs / calculates missing or zero scores
 * for practice tests or attempts that were incorrectly saved with 0 scores.
 */
export async function repairAndScoreAttempt(attempt: any, existingQuestions?: any[]): Promise<any> {
  if (!attempt) return attempt;

  // If already properly scored (score > 0), no repair needed
  if (
    attempt.totalScore &&
    attempt.totalScore > 0 &&
    attempt.rwScore &&
    attempt.rwScore > 0 &&
    attempt.mathScore &&
    attempt.mathScore > 0
  ) {
    return attempt;
  }

  // Live proctored sessions with confirmed disqualification stay 0
  if (attempt.proctorCode && attempt.fullscreenExitCount >= 5 && attempt.totalScore === 0) {
    return attempt;
  }

  let rwRaw = attempt.rwRaw || 0;
  let mathRaw = attempt.mathRaw || 0;
  let rwTotal = attempt.rwTotal || 0;
  let mathTotal = attempt.mathTotal || 0;
  let reviewIndex = Array.isArray(attempt.reviewIndex) ? attempt.reviewIndex : [];

  // If reviewIndex has items, compute raw counts directly from reviewIndex
  if (reviewIndex.length > 0) {
    let computedRwRaw = 0;
    let computedMathRaw = 0;
    let computedRwTotal = 0;
    let computedMathTotal = 0;

    reviewIndex.forEach((r: any) => {
      const isRW =
        r.module === "MODULE_1" ||
        r.module === "MODULE_2" ||
        r.module === 1 ||
        r.module === 2 ||
        String(r.module).includes("1") ||
        String(r.module).includes("2");

      if (isRW) {
        computedRwTotal++;
        if (r.isCorrect) computedRwRaw++;
      } else {
        computedMathTotal++;
        if (r.isCorrect) computedMathRaw++;
      }
    });

    if (computedRwTotal > 0 || computedMathTotal > 0) {
      rwRaw = computedRwRaw;
      mathRaw = computedMathRaw;
      rwTotal = computedRwTotal || 54;
      mathTotal = computedMathTotal || 44;
    }
  }

  // Fallback: If rwTotal or mathTotal are 0, use defaults
  if (rwTotal === 0) rwTotal = 54;
  if (mathTotal === 0) mathTotal = 44;

  const { rwScore, mathScore, totalScore } = calculateSatScaledScores(
    rwRaw,
    mathRaw,
    rwTotal,
    mathTotal
  );

  // Update in database so repair is permanent
  try {
    const updated = await prisma.studentTestAttempt.update({
      where: { id: attempt.id },
      data: {
        rwRaw,
        mathRaw,
        rwTotal,
        mathTotal,
        rwScore,
        mathScore,
        totalScore,
        scoringStatus: "PUBLISHED",
      },
    });

    return {
      ...attempt,
      rwRaw,
      mathRaw,
      rwTotal,
      mathTotal,
      rwScore,
      mathScore,
      totalScore,
      scoringStatus: "PUBLISHED",
    };
  } catch (err) {
    console.error("Failed to persist repaired scores to attempt:", err);
    return {
      ...attempt,
      rwRaw,
      mathRaw,
      rwTotal,
      mathTotal,
      rwScore,
      mathScore,
      totalScore,
    };
  }
}
