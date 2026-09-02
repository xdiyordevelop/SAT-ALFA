import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateStructured } from "@/lib/ai/core";
import { SATQuestionSchema } from "@/lib/ai/validation/common";
import { z } from "zod";

export const maxDuration = 120;

const SAT_PARSER_SYSTEM_PROMPT = `Return ONLY a raw valid JSON object/array matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.

You are an elite SAT question parser. Analyze the raw text extracted from an SAT exam PDF and extract ALL questions present in the text.

Return EXACTLY a JSON object matching this structure:
{
 "questions": [
 {
 "module": "MODULE_1|MODULE_2|MODULE_3|MODULE_4",
 "format": "MCQ|FILL_IN",
 "questionNumber": 1,
 "prompt": "Question text with <p> tags. Wrap all math in $KaTeX$ delimiters.",
 "passage": "Reading passage in HTML if present, or null",
 "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
 "correctAnswer": "A",
 "difficulty": "EASY|MEDIUM|HARD",
 "domain": "SAT domain string",
 "skill": "SAT skill string",
 "explanation": "Step-by-step explanation in HTML"
 }
 ]
}

CRITICAL RULES:
1. Extract ONLY questions that exist in the provided text — do NOT invent or hallucinate questions.
8. CRITICAL: Do NOT guess the correctAnswer! If the answer key is explicitly written in the text, extract it. Otherwise, set correctAnswer to null.
2. module: Reading/Writing M1 -> MODULE_1, M2 -> MODULE_2; Math M1 -> MODULE_3, M2 -> MODULE_4. Default: MODULE_1.
3. format: "MCQ" for 4-choice, "FILL_IN" for grid-in/student-produced answers.
4. For FILL_IN format, set "options" to null or an empty object.
5. All math expressions MUST use KaTeX: inline $...$ or block $$...$$
6. correctAnswer: "A"/"B"/"C"/"D" for MCQ. Exact numeric string for FILL_IN.
7. Return ONLY valid JSON. Return ONLY a raw valid JSON object/array matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.`;

export async function POST(request: NextRequest) {
 const startTime = Date.now();
 try {
 const session = await getSession();
 if (!session || session.role !== "ADMIN") {
 return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
 }

 const { chunkText, chunkIndex, totalChunks } = await request.json();

 if (!chunkText || typeof chunkText !== "string" || chunkText.trim().length < 20) {
 return NextResponse.json({ success: false, error: "Text chunk is required." }, { status: 400 });
 }

 console.log(`[parse-text] Processing chunk ${chunkIndex + 1}/${totalChunks} — ${chunkText.length} chars`);

 const chunkLabel = totalChunks > 1 ? ` (chunk ${chunkIndex + 1}/${totalChunks})` : '';

 let parsed: any;
 let rawResponse: any;
 try {
 const result = await generateStructured({
 systemPrompt: SAT_PARSER_SYSTEM_PROMPT,
 userPrompt: `RAW EXTRACTED TEXT FROM SAT PDF${chunkLabel}:\n\n${chunkText}`,
 temperature: 0.1,
 maxTokens: 8192
 });
 parsed = result.parsed;
 rawResponse = result.raw;
 } catch (aiErr: any) {
 console.error(`[parse-text] AI Request failed for chunk ${chunkIndex}:`, aiErr.message);
 return NextResponse.json({ 
 success: false, 
 error: "AI Generation failed", 
 details: aiErr.message 
 }, { status: 502 });
 }

 const duration = Date.now() - startTime;
 console.log(`[parse-text] AI parsing completed in ${duration}ms. Validating items...`);

 // Individual item validation so a single bad question doesn't drop the whole chunk
 if (parsed?.success === false) {
 return NextResponse.json({
 success: false,
 error: parsed.error || "AI formatting error",
 raw: parsed
 }, { status: 422 });
 }
 const questionsRaw = parsed?.questions;
 if (!Array.isArray(questionsRaw)) {
 return NextResponse.json({
 success: false,
 error: "AI response did not contain a 'questions' array",
 raw: parsed
 }, { status: 422 });
 }

 const validQuestions: any[] = [];
 const rejectedQuestions: any[] = [];

 questionsRaw.forEach((qRaw, idx) => {
 const validation = SATQuestionSchema.safeParse(qRaw);
 if (validation.success) {
 validQuestions.push(validation.data);
 } else {
 rejectedQuestions.push({
 index: idx,
 original: qRaw,
 errors: validation.error.format()
 });
 }
 });

 console.log(`[parse-text] Chunk ${chunkIndex + 1} validation: ${validQuestions.length} valid, ${rejectedQuestions.length} rejected.`);

 if (questionsRaw.length > 0 && validQuestions.length === 0) {
 return NextResponse.json({
 success: false,
 error: "All questions rejected by validation schema",
 diagnostics: {
 rejectedDetails: rejectedQuestions
 }
 }, { status: 422 });
 }

 return NextResponse.json({
 success: true,
 questions: validQuestions,
 diagnostics: {
 totalReturned: questionsRaw.length,
 validCount: validQuestions.length,
 rejectedCount: rejectedQuestions.length,
 rejectedDetails: rejectedQuestions,
 durationMs: duration,
 model: rawResponse?.modelUsed
 }
 });
 } catch (error: any) {
 console.error("[PARSE_TEXT_ROUTE_ERROR]", error.message);
 return NextResponse.json(
 { success: false, error: `Failed to parse chunk: ${error.message}` },
 { status: 500 }
 );
 }
}
