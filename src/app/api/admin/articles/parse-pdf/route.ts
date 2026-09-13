import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageAcademics } from "@/lib/permissions/auth";
import { generateStructured } from "@/lib/ai/core";
import { ArticleSchema } from "@/lib/ai/validation/common";
import pdfParse from "pdf-parse";

export const maxDuration = 120;

const ARTICLE_SYSTEM_PROMPT = `You are a Principal Academic Publishing & SAT Editorial AI specializing in converting high-caliber academic journals (such as Scientific American, Nature, The Atlantic, and SAT Reading Passages) into digital reading experiences.

Return ONLY a raw valid JSON object matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any conversational preamble or sign-off.`;

const ARTICLE_USER_PROMPT = `Analyze the DOCUMENT (both text and visual layout) and produce the following JSON object:

{
  "title": "Exact full title of the article",
  "slug": "url-friendly-slug-derived-from-title",
  "category": "Exactly one of: SCIENCE | HISTORY | LITERATURE | STRATEGY | VOCABULARY",
  "summary": "Exactly 2 complete, sophisticated sentences summarizing the central thesis.",
  "authorName": "Author's full name (or null if not stated)",
  "authorBio": "Author's affiliation, credentials, and institutional title (or null)",
  "readTimeMin": <integer — calculated as total word count divided by 200, minimum 5>,
  "content": "<FULL Markdown body — formatted according to the Academic Magazine Rules below>",
  "vocabulary": [
    {
      "word": "advanced SAT academic vocabulary word",
      "definition": "precise, student-friendly academic definition",
      "contextSentence": "The exact sentence from the article where this word appears"
    }
  ]
}

CRITICAL ACADEMIC MAGAZINE RULES:
1. PRESERVE 100% UNABRIDGED DEPTH:
   - Do NOT summarize or condense the article.
   - Retain every scientific study, historical narrative, medical case report, researcher name, institution, and physiological mechanism.
   - The article must provide a rich, immersive SAT-level reading experience.

2. HISTORICAL & PATIENT QUOTATIONS (BLOCKQUOTES):
   - Whenever historical figures, authors, or case reports are quoted at length (e.g. Hemingway, Sir Francis Beaufort, Alexander Ogston, Dostoyevsky, clinical patients), format them as blockquotes with proper attribution:
     > "Quoted text here..."
     > — *Author or Source (Year)*

3. PULL QUOTES (CENTRAL THESIS HIGHLIGHTS):
   - Identify 1 or 2 powerful, defining thesis sentences that summarize a major scientific or philosophical turning point (such as "Local brain regions go offline one after another...").
   - Format them specifically as a pull quote:
     <blockquote class="pull-quote">
     "Central impactful sentence here..."
     </blockquote>

4. SECTION HEADINGS:
   - Convert primary section titles into uppercase H2 headers:
     ## PEACE BEYOND UNDERSTANDING
     ## THE UNDISCOVERED COUNTRY
     ## THE FADING OF THE LIGHT

5. FIGURE & ILLUSTRATION EXTRACTION:
   - Identify artwork, portraits, charts, and infographics in the document.
   - Insert figure tags with 0-1000 normalized coordinates:
     [IMAGE_BOX: page_index, ymin, xmin, ymax, xmax, Caption]
   - CRITICAL REQUIREMENT: These tags MUST be embedded directly INSIDE the "content" markdown string at the exact logical paragraph where the illustration belongs.
   - NEVER emit figure tags outside of the "content" JSON string.

6. BIBLIOGRAPHY & FURTHER EXPLORATION:
   - If the document includes "More to Explore", "From our Archives", or references, format them at the very end under:
     ## More to Explore
     - **Title of Work**, Authors, Year.

7. VOCABULARY (8-12 ADVANCED WORDS):
   - Extract 8 to 12 advanced SAT words that appear verbatim in the text (e.g. *numinous*, *ineffable*, *precariousness*, *ineluctable*, *ischemia*, *stupor*, *idiosyncratic*).
   - Provide clear, student-friendly definitions and the exact sentence from the text.

STRICT FORMATTING RULE:
Return ONLY the raw valid JSON object starting with { and ending with }.
Do NOT output any figure tags, conversational preamble, markdown fences, or text before or after the JSON.`;

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
    let rawPdfText = "";

    if (pdfFile && typeof pdfFile.arrayBuffer === "function") {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfBuf = Buffer.from(arrayBuffer);
      pdfBase64 = pdfBuf.toString("base64");
      try {
        const parsedPdf = await pdfParse(pdfBuf);
        if (parsedPdf?.text && parsedPdf.text.trim().length > 100) {
          rawPdfText = parsedPdf.text.trim();
        }
      } catch (parseErr) {
        console.warn("[parse-pdf] Native text stream extraction skipped:", parseErr);
      }
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

    let userPrompt = ARTICLE_USER_PROMPT;
    if (rawPdfText) {
      userPrompt += `\n\n--- EXTRACTED NATIVE DIGITAL TEXT STREAM (Use for 100% fidelity, vocabulary context, and author attribution) ---\n` + rawPdfText.slice(0, 35000);
    }

    const { parsed, raw } = await generateStructured({
      systemPrompt: ARTICLE_SYSTEM_PROMPT,
      userPrompt,
      pdfBase64: pdfBase64 || undefined,
      imagesBase64: !pdfBase64 && imagesBase64.length > 0 ? imagesBase64 : undefined,
      temperature: 0.15,
      maxTokens: 16384,
    });

    if ((parsed as any)?.success === false) {
      return NextResponse.json({
        success: false,
        error: (parsed as any).error || "AI formatting error",
        raw: parsed
      }, { status: 422 });
    }

    let dataToValidate: any = parsed;
    
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
    
    // Unwrap array if Gemini returns an array containing the article object
    if (Array.isArray(dataToValidate)) {
      const articleCandidate = dataToValidate.find(
        (item) => item && typeof item === "object" && ("title" in item || "content" in item)
      );
      if (articleCandidate) {
        dataToValidate = articleCandidate;
      } else if (dataToValidate.length > 0 && typeof dataToValidate[0] === "object") {
        dataToValidate = dataToValidate[0];
      }
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

  // Format byline and author bio into content if not already present
  let formattedContent = validatedData.content;
  if (
    validatedData.authorName &&
    !formattedContent.slice(0, 300).toLowerCase().includes(validatedData.authorName.toLowerCase())
  ) {
    formattedContent = `*By **${validatedData.authorName}***\n\n` + formattedContent;
  }

  if (
    validatedData.authorBio &&
    !formattedContent.toLowerCase().includes(validatedData.authorBio.toLowerCase())
  ) {
    formattedContent =
      formattedContent +
      `\n\n---\n\n<div class="article-author-card">\n\n### ABOUT THE AUTHOR\n\n**${validatedData.authorName || "The Author"}** — ${validatedData.authorBio}\n\n</div>\n`;
  }

  // Normalize vocabulary for legacy DB field if necessary
  const normalizedVocab = validatedData.vocabulary.map((v) => ({
    word: v.word,
    definition: v.definition,
    context: v.contextSentence,
  }));

  return NextResponse.json({
    ...validatedData,
    content: formattedContent,
    vocabulary: normalizedVocab,
    _metadata: {
      modelUsed: raw.modelUsed,
      usage: raw.usage,
    },
  });
 } catch (error: any) {
 console.error("[parse-pdf] Error:", error);
 return NextResponse.json(
 { error: error.message || "Failed to parse PDF." },
 { status: 500 }
 );
 }
}
