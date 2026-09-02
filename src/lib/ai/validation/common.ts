import { z } from 'zod';

export const SATModuleSchema = z.enum(['MODULE_1', 'MODULE_2', 'MODULE_3', 'MODULE_4']);
export const SATFormatSchema = z.enum(['MCQ', 'FILL_IN']);
export const SATDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

// Helper to gracefully handle options that might come as arrays or objects
const OptionsSchema = z.preprocess((val) => {
 if (Array.isArray(val)) {
 // Convert array ["opt1", "opt2", "opt3", "opt4"] to {"A": "opt1", "B": "opt2", "C": "opt3", "D": "opt4"}
 const map = ['A', 'B', 'C', 'D'];
 const obj: Record<string, string> = {};
 val.slice(0, 4).forEach((v, i) => {
 obj[map[i]] = String(v);
 });
 return obj;
 }
 return val;
}, z.record(z.string(), z.string()).nullable().optional());

export const SATQuestionSchema = z.object({
 module: SATModuleSchema.catch('MODULE_1'),
 format: SATFormatSchema.catch('MCQ'),
 questionNumber: z.coerce.number().int().positive().catch(1),
 prompt: z.string().min(2, "Prompt is too short"),
 passage: z.string().nullable().optional().catch(null),
 imageUrl: z.string().nullable().optional().catch(null),
 options: OptionsSchema,
 correctAnswer: z.string().nullable().optional().transform(val => {
 if (!val) return null;
 const match = val.match(/^[A-D]/i);
 return match ? match[0].toUpperCase() : val;
 }),
 difficulty: SATDifficultySchema.catch('MEDIUM'),
 domain: z.string().optional().catch(""),
 skill: z.string().optional().catch(""),
 explanation: z.string().nullable().optional().catch(null),
}).refine(data => {
 if (data.format === 'MCQ') {
 // Ensure we have at least 2 options for MCQ (some bad scans might drop an option, better to flag for review later than drop the whole question)
 if (!data.options || Object.keys(data.options).length < 2) return false;
 if (data.correctAnswer && !['A', 'B', 'C', 'D'].includes(data.correctAnswer)) return false;
 }
 return true;
}, {
 message: "Invalid options or correctAnswer for MCQ",
 path: ["correctAnswer"]
});

export const SATQuestionListSchema = z.object({
 questions: z.array(SATQuestionSchema).min(1),
});

export const ArticleVocabularySchema = z.object({
 word: z.string().min(1),
 definition: z.string().min(1),
 contextSentence: z.string().min(1),
});

export const ArticleSchema = z.object({
 title: z.string().min(3),
 slug: z.string().min(3),
 category: z.preprocess((val) => typeof val === 'string' ? val.toUpperCase() : val, z.enum(['SCIENCE', 'HISTORY', 'LITERATURE', 'STRATEGY', 'VOCABULARY'])),
 summary: z.string().min(10),
 readTimeMin: z.preprocess((val) => Number(val), z.number().int().positive()),
 content: z.string().min(50),
 vocabulary: z.array(ArticleVocabularySchema).min(0).max(50),
});
