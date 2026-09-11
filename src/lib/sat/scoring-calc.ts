// Official Digital SAT Scaled Score Conversion Table (Reading & Writing: max 54)
export const RAW_TO_SCALED_RW: Record<number, number> = {
  54: 800, 53: 790, 52: 780, 51: 760, 50: 740,
  49: 730, 48: 710, 47: 700, 46: 680, 45: 670,
  44: 650, 43: 640, 42: 630, 41: 610, 40: 600,
  39: 590, 38: 580, 37: 570, 36: 560, 35: 550,
  34: 540, 33: 530, 32: 520, 31: 510, 30: 500,
  29: 490, 28: 480, 27: 470, 26: 460, 25: 450,
  24: 440, 23: 430, 22: 420, 21: 410, 20: 400,
  19: 390, 18: 380, 17: 370, 16: 360, 15: 350,
  14: 340, 13: 330, 12: 320, 11: 310, 10: 300,
  9: 290, 8: 280, 7: 270, 6: 260, 5: 250,
  4: 240, 3: 230, 2: 220, 1: 210, 0: 200,
};

// Official Digital SAT Scaled Score Conversion Table (Math: max 44)
export const RAW_TO_SCALED_MATH: Record<number, number> = {
  44: 800, 43: 790, 42: 780, 41: 760, 40: 750,
  39: 730, 38: 710, 37: 700, 36: 680, 35: 670,
  34: 650, 33: 630, 32: 620, 31: 600, 30: 590,
  29: 570, 28: 560, 27: 540, 26: 530, 25: 510,
  24: 500, 23: 480, 22: 470, 21: 450, 20: 440,
  19: 430, 18: 410, 17: 400, 16: 390, 15: 370,
  14: 360, 13: 350, 12: 330, 11: 320, 10: 310,
  9: 300, 8: 280, 7: 270, 6: 260, 5: 240,
  4: 230, 3: 220, 2: 210, 1: 200, 0: 200,
};

export function getScaledScoreRW(raw: number, total: number = 54): number {
  if (raw <= 0) return 200;
  if (total <= 0) return 200;
  
  // Normalize raw score to standard 54-question scale if total questions differ
  const normalizedRaw = Math.min(54, Math.max(0, Math.round((raw / total) * 54)));
  return RAW_TO_SCALED_RW[normalizedRaw] ?? 200;
}

export function getScaledScoreMath(raw: number, total: number = 44): number {
  if (raw <= 0) return 200;
  if (total <= 0) return 200;

  // Normalize raw score to standard 44-question scale if total questions differ
  const normalizedRaw = Math.min(44, Math.max(0, Math.round((raw / total) * 44)));
  return RAW_TO_SCALED_MATH[normalizedRaw] ?? 200;
}

export function calculateSatScaledScores(
  rwRaw: number,
  mathRaw: number,
  rwTotal: number = 54,
  mathTotal: number = 44
): { rwScore: number; mathScore: number; totalScore: number } {
  const rwScore = getScaledScoreRW(rwRaw, rwTotal);
  const mathScore = getScaledScoreMath(mathRaw, mathTotal);
  const totalScore = rwScore + mathScore;

  return { rwScore, mathScore, totalScore };
}
