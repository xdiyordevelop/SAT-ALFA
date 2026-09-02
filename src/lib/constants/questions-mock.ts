'use client';
export interface MockQuestion {
 id: string;
module: 1 | 2 | 3 | 4
 questionNumber: number;
format: 'mcq' | 'fill-in'
 difficulty: 'easy' | 'medium' | 'hard'
 domain: string;
skill: string

 // Content
 prompt: string // HTML with potential LaTeX
 passage?: string // Optional stimulus
 imageUrl?: string;
imagePosition?: 'above' | 'below'

 // Answers (MCQ)
 options?: {
 A: string;
B: string;
C: string;
D: string
 }
 correctAnswer?: string // 'A', 'B', 'C', or 'D'

 // Answers (Fill-in)
 fillInAnswer?: string // Can be fraction "3/4", decimal "0.75", or whole number "5"

 explanation?: string
}

// ==================== READING & WRITING MODULE 1 ====================

const RWModule1Questions: MockQuestion[] = [
 {
 id: 'rw1-001',
 module: 1,
 questionNumber: 1,
 format: 'mcq',
 difficulty: 'easy',
 domain: 'Reading',
 skill: 'Main Idea',
 prompt:
 'Which of the following best describes the main idea of the passage?',
 passage:
 'The Industrial Revolution fundamentally transformed society through the development of new manufacturing technologies. Steam power, mechanized looms, and improved transportation systems created unprecedented economic growth and urbanization. However, these changes also led to crowded cities, labor exploitation, and environmental pollution.',
 options: {
 A: 'The Industrial Revolution was purely beneficial to society.',
 B: 'The Industrial Revolution transformed society through technology but also created new problems.',
 C: 'Steam power was the most important invention of the era.',
 D: 'Environmental pollution was the primary result of industrialization.',
 },
 correctAnswer: 'B',
 explanation:
 'The passage presents both positive aspects (economic growth, new technologies) and negative consequences (crowding, exploitation, pollution), making B the best answer.',
 },

 {
 id: 'rw1-002',
 module: 1,
 questionNumber: 2,
 format: 'mcq',
 difficulty: 'medium',
 domain: 'Reading',
 skill: 'Word in Context',
 prompt:
 'As used in the passage, "unprecedented" most nearly means:',
 passage:
 'The Industrial Revolution created unprecedented economic growth never before seen in human history.',
 options: {
 A: 'Temporary',
 B: 'Never done or known before',
 C: 'Carefully planned',
 D: 'Widely accepted',
 },
 correctAnswer: 'B',
 explanation:
 '"Unprecedented" means never done or known before, which aligns with "never before seen in human history."',
 },

 {
 id: 'rw1-003',
 module: 1,
 questionNumber: 3,
 format: 'mcq',
 difficulty: 'hard',
 domain: 'Grammar',
 skill: 'Verb Tense',
 prompt: 'Which sentence correctly uses verb tense?',
 options: {
 A: 'The scientist had discovered the cure before the disease spreading.',
 B: 'The scientist discovered the cure before the disease spread.',
 C: 'The scientist has discover the cure before the disease was spreading.',
 D: 'The scientist discovering the cure before the disease spreads.',
 },
 correctAnswer: 'B',
 explanation:
 'Option B correctly uses simple past tense for both actions in chronological order (discovered, then spread).',
 },

 {
 id: 'rw1-004',
 module: 1,
 questionNumber: 4,
 format: 'fill-in',
 difficulty: 'medium',
 domain: 'Math',
 skill: 'Arithmetic',
 prompt: 'If 3x + 5 = 20, what is the value of x?',
 fillInAnswer: '5',
 explanation: 'Solve: 3x = 15, so x = 5.',
 },

 {
 id: 'rw1-005',
 module: 1,
 questionNumber: 5,
 format: 'mcq',
 difficulty: 'medium',
 domain: 'Reading',
 skill: 'Inference',
 prompt:
 'Based on the passage, what can be inferred about the relationship between industrialization and urbanization?',
 passage:
 'As factories grew in number and size, rural populations migrated to cities seeking employment. This mass movement transformed small towns into sprawling urban centers with dense populations.',
 options: {
 A: 'Industrialization caused urbanization.',
 B: 'Urbanization prevented industrialization.',
 C: 'Rural areas benefited more from industrialization.',
 D: 'Urban centers rejected factory workers.',
 },
 correctAnswer: 'A',
 explanation:
 'The passage shows that factory growth prompted rural-to-urban migration, demonstrating that industrialization caused urbanization.',
 },
]

// ==================== MATH MODULE 1 ====================

const MathModule1Questions: MockQuestion[] = [
 {
 id: 'math1-001',
 module: 3,
 questionNumber: 1,
 format: 'mcq',
 difficulty: 'easy',
 domain: 'Algebra',
 skill: 'Linear Equations',
 prompt: 'Solve for y: 2y - 8 = 12',
 options: {
 A: 'y = 2',
 B: 'y = 10',
 C: 'y = 20',
 D: 'y = 4',
 },
 correctAnswer: 'B',
 explanation:
 'Add 8 to both sides: 2y = 20. Divide by 2: y = 10.',
 },

 {
 id: 'math1-002',
 module: 3,
 questionNumber: 2,
 format: 'fill-in',
 difficulty: 'medium',
 domain: 'Algebra',
 skill: 'Quadratic Equations',
 prompt:
 'If x^2 - 5x + 6 = 0, what is the sum of the two solutions? (Enter as a decimal or fraction)',
 fillInAnswer: '5',
 explanation:
 'Using Vieta\'s formulas, for x^2 - 5x + 6 = 0, the sum of roots is 5.',
 },

 {
 id: 'math1-003',
 module: 3,
 questionNumber: 3,
 format: 'mcq',
 difficulty: 'medium',
 domain: 'Geometry',
 skill: 'Circle Properties',
 prompt:
 'If the radius of a circle is 7, what is its circumference? (Use \\pi \\approx 3.14)',
 options: {
 A: '43.96',
 B: '49.00',
 C: '21.98',
 D: '153.86',
 },
 correctAnswer: 'A',
 explanation:
 'Circumference = 2\\pi r = 2 \\times 3.14 \\times 7 = 43.96.',
 },

 {
 id: 'math1-004',
 module: 3,
 questionNumber: 4,
 format: 'fill-in',
 difficulty: 'hard',
 domain: 'Trigonometry',
 skill: 'Right Triangles',
 prompt:
 'In a right triangle, if one leg is 3 and the hypotenuse is 5, what is the length of the other leg?',
 fillInAnswer: '4',
 explanation:
 'Using the Pythagorean theorem: 3^2 + b^2 = 5^2, so b = 4.',
 },

 {
 id: 'math1-005',
 module: 3,
 questionNumber: 5,
 format: 'mcq',
 difficulty: 'easy',
 domain: 'Arithmetic',
 skill: 'Percentages',
 prompt: 'What is 25% of 80?',
 options: {
 A: '16',
 B: '20',
 C: '24',
 D: '32',
 },
 correctAnswer: 'B',
 explanation: '25% of 80 = 0.25 × 80 = 20.',
 },
]

// ==================== READING & WRITING MODULE 2 ====================

const RWModule2Questions: MockQuestion[] = [
 {
 id: 'rw2-001',
 module: 2,
 questionNumber: 1,
 format: 'mcq',
 difficulty: 'medium',
 domain: 'Reading',
 skill: 'Author\'s Tone',
 prompt: 'What is the author\'s tone in this passage?',
 passage:
 'Climate change is not merely a distant threat—it is an urgent reality demanding immediate action. The scientific consensus is overwhelming, and the evidence is undeniable.',
 options: {
 A: 'Humorous',
 B: 'Urgent and serious',
 C: 'Doubtful and cautious',
 D: 'Sarcastic',
 },
 correctAnswer: 'B',
 explanation:
 'Words like "urgent," "demanding," and "overwhelming" convey a serious, urgent tone.',
 },

 {
 id: 'rw2-002',
 module: 2,
 questionNumber: 2,
 format: 'mcq',
 difficulty: 'easy',
 domain: 'Grammar',
 skill: 'Subject-Verb Agreement',
 prompt: 'Which sentence has correct subject-verb agreement?',
 options: {
 A: 'The group of students are studying together.',
 B: 'The group of students is studying together.',
 C: 'The students is studying together.',
 D: 'The students studying together.',
 },
 correctAnswer: 'B',
 explanation:
 '"Group" is singular, so "is" is correct. The prepositional phrase "of students" doesn\'t affect agreement.',
 },

 {
 id: 'rw2-003',
 module: 2,
 questionNumber: 3,
 format: 'fill-in',
 difficulty: 'medium',
 domain: 'Reading',
 skill: 'Vocabulary',
 prompt:
 'The detective\'s __________ approach revealed that the suspect was innocent.',
 options: {
 A: 'thorough',
 B: 'careless',
 C: 'hasty',
 D: 'superficial',
 },
 correctAnswer: 'A',
 explanation:
 'A thorough investigation logically leads to discovering innocence. The other options contradict the meaning.',
 },

 {
 id: 'rw2-004',
 module: 2,
 questionNumber: 4,
 format: 'mcq',
 difficulty: 'hard',
 domain: 'Reading',
 skill: 'Complex Inference',
 prompt:
 'Which statement best represents the implied relationship described in the passage?',
 passage:
 'Medieval scholars preserved classical texts not out of nostalgia, but because they recognized their practical value for theology and medicine. Without this pragmatic motivation, these works might have been lost forever.',
 options: {
 A: 'Medieval scholars were not interested in classical learning.',
 B: 'Practical necessity, rather than sentiment, was the key to preserving classical knowledge.',
 C: 'Theology and medicine were less important than preserving texts.',
 D: 'Classical texts had no value beyond historical interest.',
 },
 correctAnswer: 'B',
 explanation:
 'The passage explicitly states "pragmatic motivation" over "nostalgia," showing that practical value was key.',
 },

 {
 id: 'rw2-005',
 module: 2,
 questionNumber: 5,
 format: 'fill-in',
 difficulty: 'easy',
 domain: 'Grammar',
 skill: 'Pronoun Consistency',
 prompt:
 'After the ceremony, the newly married couple celebrated __________ achievement with family.',
 options: {
 A: 'their',
 B: 'his',
 C: 'its',
 D: 'one\'s',
 },
 correctAnswer: 'A',
 explanation:
 '"Their" is the correct plural possessive pronoun to refer to the couple.',
 },
]

// ==================== MATH MODULE 2 ====================

const MathModule2Questions: MockQuestion[] = [
 {
 id: 'math2-001',
 module: 4,
 questionNumber: 1,
 format: 'mcq',
 difficulty: 'medium',
 domain: 'Algebra',
 skill: 'Systems of Equations',
 prompt:
 'If x + y = 10 and x - y = 4, what is the value of x?',
 options: {
 A: '3',
 B: '7',
 C: '6',
 D: '14',
 },
 correctAnswer: 'B',
 explanation:
 'Adding the equations: 2x = 14, so x = 7.',
 },

 {
 id: 'math2-002',
 module: 4,
 questionNumber: 2,
 format: 'fill-in',
 difficulty: 'hard',
 domain: 'Trigonometry',
 skill: 'Sine Rule',
 prompt:
 'In a triangle, if side a = 10, angle A = 30°, and angle B = 60°, find side b. (Use \\sin 30° = 0.5 and \\sin 60° = 0.866)',
 fillInAnswer: '17.32',
 explanation:
 'Using sine rule: \\frac{a}{\\sin A} = \\frac{b}{\\sin B}, so b = \\frac{10 \\times 0.866}{0.5} \\approx 17.32.',
 },

 {
 id: 'math2-003',
 module: 4,
 questionNumber: 3,
 format: 'mcq',
 difficulty: 'easy',
 domain: 'Arithmetic',
 skill: 'Fractions',
 prompt: 'What is \\frac{3}{4} + \\frac{1}{6}?',
 options: {
 A: '\\frac{4}{10}',
 B: '\\frac{11}{12}',
 C: '\\frac{7}{12}',
 D: '\\frac{4}{24}',
 },
 correctAnswer: 'B',
 explanation:
 'LCM of 4 and 6 is 12. \\frac{3}{4} = \\frac{9}{12} and \\frac{1}{6} = \\frac{2}{12}, so sum is \\frac{11}{12}.',
 },

 {
 id: 'math2-004',
 module: 4,
 questionNumber: 4,
 format: 'fill-in',
 difficulty: 'medium',
 domain: 'Algebra',
 skill: 'Exponents',
 prompt: 'Simplify: 2^3 \\times 2^4 \\div 2^2',
 fillInAnswer: '32',
 explanation:
 'Using exponent rules: 2^{3+4-2} = 2^5 = 32.',
 },

 {
 id: 'math2-005',
 module: 4,
 questionNumber: 5,
 format: 'mcq',
 difficulty: 'hard',
 domain: 'Statistics',
 skill: 'Probability',
 prompt:
 'A bag contains 3 red balls, 4 blue balls, and 2 green balls. If one ball is drawn randomly, what is the probability it is not red?',
 options: {
 A: '\\frac{1}{3}',
 B: '\\frac{1}{2}',
 C: '\\frac{2}{3}',
 D: '\\frac{3}{9}',
 },
 correctAnswer: 'C',
 explanation:
 'Total balls = 9. Non-red balls = 6 (blue + green). Probability = \\frac{6}{9} = \\frac{2}{3}.',
 },
]

// ==================== EXPORT ALL QUESTIONS ====================

export const allMockQuestions: MockQuestion[] = [
 ...RWModule1Questions,
 ...RWModule2Questions,
 ...MathModule1Questions,
 ...MathModule2Questions,
]

export function getMockQuestionsForModule(module: 1 | 2 | 3 | 4): MockQuestion[] {
 return allMockQuestions.filter((q) => q.module === module)
}
export function getMockQuestionById(id: string): MockQuestion | undefined {
 return allMockQuestions.find((q) => q.id === id)
}
