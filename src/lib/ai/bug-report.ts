import { geminiProvider } from '@/lib/ai/providers/gemini';
import { getOrUploadGoogleFile } from './google-file-manager';
import path from 'path';
import fs from 'fs';

export interface BugReportContext {
  testName: string;
  testId: string;
  section: string;
  module: string;
  questionNumber: string | number;
  prompt: string;
  options: Record<string, string>;
  passage?: string;
  correctAnswer?: string;
  imageUrl?: string | null;
  sourceFileUrl?: string | null;
  sourceFileName?: string | null;
}

export interface BugReportAiResult {
  valid: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  analysis: string;
  error_location: string;
  suggested_fix: string;
  can_auto_fix: boolean;
  confidence: number;
  source_verified?: boolean;
  source_reference?: string;
  discrepancies?: string[];
  fix_payload: {
    action: "update" | "manual_review" | "remove" | "delete";
    field?: "prompt" | "passage" | "correctAnswer" | "options" | "all" | "imageUrl" | "image";
    newValue?: any;
    updatedQuestion?: {
      prompt?: string;
      passage?: string | null;
      options?: Record<string, string>;
      correctAnswer?: string;
      imageUrl?: string | null;
      imagePosition?: string;
    };
    requires_pdf_sync?: boolean;
    extractImage?: {
      pageNumber: number;
      boundingBox: { ymin: number; xmin: number; ymax: number; xmax: number };
      description: string;
    };
  };
}

export async function analyzeBugReportWithAI(
  ctx: BugReportContext, 
  issueType: string, 
  userMessage: string,
  screenshotBase64?: string | null
): Promise<BugReportAiResult> {
  // Check if original test document exists on disk
  let sourcePdfBase64: string | undefined;
  let sourcePdfFileUri: string | undefined;
  let sourcePdfApiKey: string | undefined;
  let hasSourceDocument = false;

  if (ctx.sourceFileUrl) {
    try {
      const cleanPath = ctx.sourceFileUrl.startsWith('/') ? ctx.sourceFileUrl.slice(1) : ctx.sourceFileUrl;
      const fullDiskPath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(fullDiskPath)) {
        const stat = await fs.promises.stat(fullDiskPath);
        // If file is > 10MB, use Google AI Files API (supports up to 2GB PDFs seamlessly)
        if (stat.size > 10 * 1024 * 1024) {
          const uploadRes = await getOrUploadGoogleFile(fullDiskPath);
          if (uploadRes) {
            sourcePdfFileUri = uploadRes.fileUri;
            sourcePdfApiKey = uploadRes.apiKey;
            hasSourceDocument = true;
          }
        } else {
          // Smaller file: read directly as base64
          const fileBuffer = await fs.promises.readFile(fullDiskPath);
          sourcePdfBase64 = fileBuffer.toString('base64');
          hasSourceDocument = true;
        }
      }
    } catch (e: any) {
      console.warn('[BUG REPORT] Could not read or upload source document:', e.message);
    }
  }

  const prompt = `You are an expert SAT curriculum director, mathematician, and lead debugger for ALFA SAT (Digital SAT practice test platform).

A student has submitted an issue report on an SAT question during a practice test.
${hasSourceDocument ? `- THE ORIGINAL SOURCE TEST DOCUMENT (${ctx.sourceFileName || 'PDF'}) IS ATTACHED AS INLINE DOCUMENT DATA.` : "- Note: No original source document is attached; use intrinsic SAT knowledge."}

==================================================
CURRENT DATABASE QUESTION CONTEXT:
- Test: "${ctx.testName}" (ID: ${ctx.testId})
- Section: ${ctx.section}, ${ctx.module}, Question #${ctx.questionNumber}
- Current Prompt: "${ctx.prompt}"
- Answer Choices: ${JSON.stringify(ctx.options || {})}
- Current Recorded Answer: "${ctx.correctAnswer || 'Unknown'}"
- Passage / Stimulus: "${ctx.passage || 'None'}"
- Image Attached: ${ctx.imageUrl ? ctx.imageUrl : 'None'}

STUDENT ISSUE REPORT:
- Category: ${issueType}
- Student's Complaint: "${userMessage}"
==================================================

${hasSourceDocument ? `
CRITICAL AUTONOMOUS RESTORATION INSTRUCTIONS:
YOU ARE AN AUTOMATED RESTORATION AGENT. DO NOT MERELY DIAGNOSE OR RECOMMEND THAT SOMETHING NEEDS TO BE ADDED.
YOU MUST OPEN THE ATTACHED PDF DOCUMENT, FIND QUESTION #${ctx.questionNumber} IN ${ctx.module}, AND TRANSCRIBE THE ACTUAL CONTENT INTO fix_payload.updatedQuestion!

TASKS:
1. Locate the EXACT question corresponding to Question #${ctx.questionNumber} in ${ctx.module} (${ctx.section}) within the attached original source document.
   Search hints:
   - Search by prompt text keywords: "${ctx.prompt.slice(0, 120)}"
   - Note: In Digital SAT, Reading & Writing has Module 1 (27 questions) and Module 2 (27 questions). Math has Module 1 (22 questions) and Module 2 (22 questions).
2. Read the authentic original prompt, passage/stimulus, mathematical formulas, answer choices, and correct answer directly from the source document pages.
3. If the passage is missing in the database (or student reported missing passage/text):
   - You MUST transcribe EVERY SINGLE WORD of the passage from the PDF page into fix_payload.updatedQuestion.passage!
   - You MUST transcribe all 4 answer options (A, B, C, D) from the PDF page into fix_payload.updatedQuestion.options!
   - You MUST provide the correct answer letter in fix_payload.updatedQuestion.correctAnswer!
   - Set can_auto_fix = true!
4. If a diagram/figure image is missing or broken:
   - CRITICAL: extractImage MUST ONLY be used if there is an actual standalone visual diagram, geometry shape, coordinate plane, graph, chart, or table illustration in the PDF.
   - NEVER crop the question text, prompt sentences, or answer choices as an image! All text and options MUST ALWAYS be transcribed into fix_payload.updatedQuestion.prompt and options.
   - If there is an actual diagram illustration, include extractImage with pageNumber and tight boundingBox { ymin, xmin, ymax, xmax } around ONLY the diagram.
5. If the student reports that an image is wrongly attached (e.g. an image exists on a reading question or full-question screenshot was wrongly attached):
   - Set fix_payload.action = "remove", fix_payload.field = "imageUrl", or set updatedQuestion.imageUrl = null.
   - Set can_auto_fix = true!
6. Always set source_verified = true, record source_reference (e.g. "Source PDF Page 13, Question 11"), and set can_auto_fix = true.
` : `
AUTONOMOUS SOLVING & VERIFICATION TASKS:
1. Re-solve the question rigorously.
2. Check for typos, broken HTML, malformed KaTeX expressions (e.g., missing $ signs), or wrong answer key.
3. If confident (>= 0.85), provide fix_payload with the corrected question fields and set can_auto_fix = true.
`}

Respond in this exact JSON format ONLY:
{
  "valid": true,
  "priority": "HIGH",
  "can_auto_fix": true,
  "confidence": 0.95,
  "source_verified": ${hasSourceDocument ? "true" : "false"},
  "source_reference": "Source PDF Page X, Question Y",
  "discrepancies": [
    "List of exact differences between current database and authentic source"
  ],
  "analysis": "Concise technical explanation of the issue and how it was resolved",
  "error_location": "Prompt / Options / Correct Answer / Passage / Formula",
  "suggested_fix": "Human-readable summary of the fix applied",
  "fix_payload": {
    "action": "update",
    "field": "all",
    "updatedQuestion": {
      "prompt": "Complete corrected prompt with KaTeX",
      "passage": "Corrected passage transcribed verbatim or null",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctAnswer": "B"
    },
    "requires_pdf_sync": false,
    "extractImage": {
      "pageNumber": 15,
      "boundingBox": { "ymin": 200, "xmin": 50, "ymax": 600, "xmax": 450 },
      "description": "Description of the diagram/figure (ONLY include this field if question has a visual element)"
    }
  }
}`;

  try {
    let cleanImageBase64: string | undefined;
    let imageMimeType: string | undefined;

    if (screenshotBase64) {
      if (screenshotBase64.includes(';base64,')) {
        const parts = screenshotBase64.split(';base64,');
        imageMimeType = parts[0].replace('data:', '');
        cleanImageBase64 = parts[1];
      } else {
        cleanImageBase64 = screenshotBase64;
        imageMimeType = 'image/jpeg';
      }
    }

    // When a ground-truth source document is available, do NOT pass the browser screenshot to Gemini.
    // The screenshot displays the incomplete/broken UI, which misdirects Gemini's vision attention
    // into describing the screenshot instead of transcribing the text from the source PDF.
    const imageToSend = hasSourceDocument ? undefined : cleanImageBase64;
    const mimeToSend = hasSourceDocument ? undefined : imageMimeType;

    const response = await geminiProvider.generateContent({
      userPrompt: prompt,
      pdfBase64: sourcePdfBase64,
      pdfFileUri: sourcePdfFileUri,
      apiKey: sourcePdfApiKey,
      imageBase64: imageToSend,
      imageMimeType: mimeToSend,
      responseFormat: 'json_object',
      temperature: 0.1
    });

    try {
      const parsed = JSON.parse(response.text) as BugReportAiResult;
      return {
        valid: Boolean(parsed.valid),
        priority: parsed.priority || 'MEDIUM',
        analysis: parsed.analysis || 'Analysis completed.',
        error_location: parsed.error_location || 'Question',
        suggested_fix: parsed.suggested_fix || '',
        can_auto_fix: Boolean(parsed.can_auto_fix && (parsed.confidence ?? 0) >= 0.80),
        confidence: Number(parsed.confidence || 0.5),
        source_verified: Boolean(parsed.source_verified),
        source_reference: parsed.source_reference || '',
        discrepancies: Array.isArray(parsed.discrepancies) ? parsed.discrepancies : [],
        fix_payload: parsed.fix_payload || { action: 'manual_review' }
      };
    } catch (e: any) {
      console.error('[BUG REPORT] Failed to parse AI response:', e.message);
      return {
        valid: true,
        priority: 'MEDIUM',
        analysis: 'AI analysis could not parse response. Forwarded for manual review.',
        error_location: 'Unknown',
        suggested_fix: 'Manual review needed.',
        can_auto_fix: false,
        confidence: 0,
        source_verified: false,
        fix_payload: { action: 'manual_review' }
      };
    }
  } catch (error: any) {
    console.error('[BUG REPORT] Gemini API error:', error.message);
    return {
      valid: true,
      priority: 'MEDIUM',
      analysis: 'AI analysis unavailable. Forwarded for manual review.',
      error_location: 'Unknown',
      suggested_fix: 'Manual review needed.',
      can_auto_fix: false,
      confidence: 0,
      source_verified: false,
      fix_payload: { action: 'manual_review' }
    };
  }
}
