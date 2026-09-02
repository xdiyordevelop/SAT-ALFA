// SAT 2024 Score Lookup Tables
// Reading & Writing: 0-54 raw score → 200-800 scaled score
export const RW_SCORE_TABLE: Record<number, number> = {
 0: 200, 1: 200, 2: 200, 3: 210, 4: 220, 5: 230, 6: 240, 7: 250, 8: 260, 9: 270,
 10: 280, 11: 280, 12: 290, 13: 300, 14: 310, 15: 320, 16: 330, 17: 340, 18: 350, 19: 360,
 20: 370, 21: 370, 22: 380, 23: 390, 24: 400, 25: 410, 26: 420, 27: 430, 28: 440, 29: 450,
 30: 460, 31: 460, 32: 470, 33: 480, 34: 490, 35: 500, 36: 510, 37: 520, 38: 530, 39: 540,
 40: 550, 41: 560, 42: 570, 43: 580, 44: 590, 45: 600, 46: 610, 47: 620, 48: 630, 49: 640,
 50: 650, 51: 670, 52: 680, 53: 700, 54: 800,
}

// Math: 0-44 raw score → 200-800 scaled score
export const MATH_SCORE_TABLE: Record<number, number> = {
 0: 200, 1: 200, 2: 210, 3: 220, 4: 230, 5: 240, 6: 250, 7: 260, 8: 270, 9: 280,
 10: 280, 11: 290, 12: 300, 13: 310, 14: 320, 15: 330, 16: 340, 17: 350, 18: 360, 19: 370,
 20: 380, 21: 390, 22: 400, 23: 410, 24: 420, 25: 430, 26: 440, 27: 450, 28: 460, 29: 470,
 30: 480, 31: 490, 32: 500, 33: 510, 34: 520, 35: 530, 36: 540, 37: 550, 38: 560, 39: 570,
 40: 580, 41: 600, 42: 620, 43: 700, 44: 800,
}
export interface RawScores {
 rwRaw: number;
mathRaw: number
}
export interface ScaledScores {
 rwScore: number;
mathScore: number;
totalScore: number
}
export function calculateRawScores(
 userAnswers: Record<string, string>,
 questions: Array<{
 id: string;
module: number;
correctAnswer: string;
fillInAnswer?: string
 }>
): RawScores {
 let rwRaw = 0
 let mathRaw = 0

 questions.forEach((q) => {
 const userAns = userAnswers[q.id]
 if (!userAns) return

 const isCorrect = q.fillInAnswer
 ? areAnswersEquivalent(userAns, q.fillInAnswer)
 : userAns === q.correctAnswer

 if (isCorrect) {
 if (q.module <= 2) {
 rwRaw++
 } else {
 mathRaw++
 }
 }
 })

 return { rwRaw, mathRaw }
}
export function convertToScaledScore(rwRaw: number, mathRaw: number): ScaledScores {
 return {
 rwScore: RW_SCORE_TABLE[rwRaw] ?? 200,
 mathScore: MATH_SCORE_TABLE[mathRaw] ?? 200,
 totalScore: (RW_SCORE_TABLE[rwRaw] ?? 200) + (MATH_SCORE_TABLE[mathRaw] ?? 200),
 }
}
export function areAnswersEquivalent(userAnswer: string, correctAnswer: string): boolean {
 if (!userAnswer || !correctAnswer) return false

 const normalize = (s: string) => s.trim().toLowerCase();
const userNorm = normalize(userAnswer);
const correctNorm = normalize(correctAnswer)

 if (userNorm === correctNorm) return true

 // Handle fractions: "3/4" vs "0.75";
const userFrac = parseFraction(userAnswer);
const correctFrac = parseFraction(correctAnswer)

 if (userFrac !== null && correctFrac !== null) {
 return Math.abs(userFrac - correctFrac) < 0.001
 }

 // Handle decimal precision
const userNum = parseFloat(userAnswer);
const correctNum = parseFloat(correctAnswer)

 if (!isNaN(userNum) && !isNaN(correctNum)) {
 return Math.abs(userNum - correctNum) < 0.001
 }

 return false
}
export function parseFraction(str: string): number | null {
 const match = str.match(/^(\d+)\s*\/\s*(\d+)/)
 if (match) {
 const [, numerator, denominator] = match
 return parseInt(numerator, 10) / parseInt(denominator, 10)
 }
 return null
}
