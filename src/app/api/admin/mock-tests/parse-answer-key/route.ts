import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { generateStructured } from "@/lib/ai/core";
import { z } from "zod";

export const maxDuration = 60;

const ANSWER_KEY_PROMPT = `Return ONLY a raw valid JSON object/array matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.

You are an expert SAT answer key parser. You are given text extracted from an answer key PDF (or the end of a test).
Your job is to find all the correct answers and return them in a strict JSON object mapping question numbers to their correct answers (A, B, C, D, or the numeric answer for fill-in).

Format:
{
 "answers": {
 "1": "A",
 "2": "C",
 "3": "B",
 "4": "D",
 ...
 }
}

Do not guess. Only return answers explicitly found in the text. Ignore extraneous text.`;

const AnswerKeySchema = z.object({
 answers: z.record(z.string(), z.string())
});

export async function POST(request: NextRequest) {
 try {
 const session = await getSession();
 if (!session || !canManageAcademics(session)) {
 return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
 }

 const { text } = await request.json();
 if (!text || typeof text !== "string") {
 return NextResponse.json({ success: false, error: "Text is required." }, { status: 400 });
 }

 const { parsed } = await generateStructured({
 systemPrompt: ANSWER_KEY_PROMPT,
 userPrompt: `RAW ANSWER KEY TEXT:\n\n${text}`,
 temperature: 0.1,
 maxTokens: 4096
 });

 if ((parsed as any)?.success === false) {
 return NextResponse.json({
 success: false,
 error: (parsed as any).error || "AI formatting error",
 raw: parsed
 }, { status: 422 });
 }
 const validation = AnswerKeySchema.safeParse(parsed);
 if (!validation.success) {
 return NextResponse.json({ success: false, error: "Validation failed", details: validation.error }, { status: 422 });
 }

 return NextResponse.json({ success: true, answers: validation.data.answers });
 } catch (error: any) {
 console.error("[PARSE_ANSWER_KEY_ERROR]", error.message);
 return NextResponse.json({ success: false, error: error.message }, { status: 500 });
 }
}
