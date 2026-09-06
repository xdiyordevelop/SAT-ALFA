import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { generateStructured } from "@/lib/ai/core";
import { ArticleSchema } from "@/lib/ai/validation/common";
import pdfParse from "pdf-parse";

export const maxDuration = 120;

const ARTICLE_SYSTEM_PROMPT = `Return ONLY a raw valid JSON object matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.

You are a Senior SAT Content Extraction AI. Your task is to convert a PDF document into a complete educational article for SAT students. Return ONLY a raw valid JSON object matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.`;

const ARTICLE_USER_PROMPT = `Analyze the DOCUMENT TEXT below and produce the following JSON object:

{
 "title": "The exact article title found in the document",
 "slug": "url-friendly-slug-derived-from-title",
 "category": "Exactly one of: SCIENCE | HISTORY | LITERATURE | STRATEGY | VOCABULARY",
 "summary": "Exactly 2 complete sentences summarizing the article's main idea.",
 "readTimeMin": <integer — estimated reading time in minutes>,
 "content": "<FULL Markdown body — see rules below>",
 "vocabulary": [
 {
 "word": "advanced SAT vocabulary word",
 "definition": "clear, student-friendly definition",
 "contextSentence": "The exact sentence from the article where this word appears"
 }
 ]
}

CRITICAL RULES:
1. Preserve ALL analytical depth. Do NOT summarize or shorten the core arguments.
2. If the document has multiple sections, convert each into an appropriate Markdown H2 (##) or H3 (###).
3. The content field must be rich, well-formatted Markdown suitable for rendering on the SAT Alfa platform.
4. Insert figure image tags where images, charts, or diagrams are seen in the pages. OUTPUT EXACTLY THIS FORMAT: [IMAGE_BOX: page_index, ymin, xmin, ymax, xmax]. 
   Example: [IMAGE_BOX: 1, 100, 200, 500, 800]. The page_index is 1-indexed. The coordinates must be 0-1000 scaled relative to that page's dimensions.
5. Use proper Markdown: ## for H2, ### for H3, **bold**, *italic*, - for bullet lists, 1. for numbered lists.
6. Do NOT add a top-level H1 heading (the title field covers that).

VOCABULARY RULES (CRITICAL):
- Extract between 6 and 10 advanced SAT-level vocabulary words that ACTUALLY appear in the article text.
- Do NOT invent words or pull from outside the document.
- Each entry MUST include the exact sentence from the article as "contextSentence".
- Prefer multi-syllabic academic or domain-specific words.

Return ONLY the JSON object. No prose before or after.`;

export async function POST(req: NextRequest) {
 try {
 const session = await getSession();
 if (!session || !canManageAcademics(session)) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const formData = await req.formData();
 
 // Support both direct PDF file and rendered page images
 const pdfFile = (formData.get("pdf") || formData.get("file")) as File | null;
 let pdfBase64: string | undefined;

 if (pdfFile && typeof pdfFile.arrayBuffer === "function") {
   const arrayBuffer = await pdfFile.arrayBuffer();
   pdfBase64 = Buffer.from(arrayBuffer).toString("base64");
 }

 // We also receive `page_1`, `page_2`, etc. as base64 strings if provided
 const imagesBase64: { mimeType: string; data: string }[] = [];
 let i = 1;
 while (true) {
   const pageData = formData.get(`page_${i}`) as string;
   if (!pageData) break;
   imagesBase64.push({ mimeType: "image/jpeg", data: pageData });
   i++;
 }

 if (!pdfBase64 && imagesBase64.length === 0) {
   return NextResponse.json(
     { error: "No PDF document or page images provided." },
     { status: 400 },
   );
 }

 const { parsed, raw } = await generateStructured({
   systemPrompt: ARTICLE_SYSTEM_PROMPT,
   userPrompt: ARTICLE_USER_PROMPT,
   pdfBase64: pdfBase64 || undefined,
   imagesBase64: !pdfBase64 && imagesBase64.length > 0 ? imagesBase64 : undefined,
   temperature: 0.2,
   maxTokens: 8192,
 });

 if ((parsed as any)?.success === false) {
 return NextResponse.json({
 success: false,
 error: (parsed as any).error || "AI formatting error",
 raw: parsed
 }, { status: 422 });
 }

 let dataToValidate = parsed;
 
 // If it's a string, try to parse it again (sometimes AI double-escapes JSON)
 let stringParseAttempts = 0;
 while (typeof dataToValidate === 'string' && stringParseAttempts < 3) {
   try {
     const nextData = JSON.parse(dataToValidate);
     if (typeof nextData === 'string' && nextData === dataToValidate) {
        break; // Stop if JSON.parse("foo") === "foo"
     }
     dataToValidate = nextData;
   } catch(e) {
     break;
   }
   stringParseAttempts++;
 }
 
 if (typeof dataToValidate === 'string') {
    return NextResponse.json({ error: "AI returned a raw string instead of a valid JSON object.", raw: dataToValidate }, { status: 422 });
 }

 // Unwrap array if Gemini returns an array of one article
 if (Array.isArray(dataToValidate) && dataToValidate.length > 0) {
   dataToValidate = dataToValidate[0];
 }

 if (typeof dataToValidate === 'string') {
    return NextResponse.json({ error: "AI returned a raw string instead of a valid JSON object. AI Output: " + (dataToValidate.substring(0, 200) + "...") }, { status: 422 });
 }

 // Zod validation
 const validationResult = ArticleSchema.safeParse(dataToValidate);
 
 if (!validationResult.success) {
 console.error("[parse-pdf] Validation failed:", validationResult.error.format());
 console.error("[parse-pdf] RAW AI TEXT WAS:", raw.text);
 return NextResponse.json(
 { 
 error: "AI did not return a valid article structure. AI Output: " + (raw.text.substring(0, 200) + "..."), 
 details: validationResult.error.format()
 },
 { status: 422 }
 );
 }

 const validatedData = validationResult.data;

 // Normalize vocabulary for legacy DB field if necessary
 const normalizedVocab = validatedData.vocabulary.map((v) => ({
 word: v.word,
 definition: v.definition,
 context: v.contextSentence,
 }));

 return NextResponse.json({
 ...validatedData,
 vocabulary: normalizedVocab,
 _metadata: {
 modelUsed: raw.modelUsed,
 usage: raw.usage
 }
 });
 } catch (error: any) {
 console.error("[parse-pdf] Error:", error);
 return NextResponse.json(
 { error: error.message || "Failed to parse PDF." },
 { status: 500 }
 );
 }
}
