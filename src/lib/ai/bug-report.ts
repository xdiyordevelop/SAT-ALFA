import { geminiProvider } from '@/lib/ai/providers/gemini';

export interface BugReportContext {
 testName: string;
 testId: string;
 section: string;
 module: string;
 questionNumber: string | number;
 prompt: string;
 options: Record<string, string>;
 passage?: string;
}
export interface BugReportAiResult {
 valid: boolean;
 priority: "LOW" | "MEDIUM" | "HIGH";
 analysis: string;
 error_location: string;
 suggested_fix: string;
 fix_payload: {
 action: string;
 field?: string;
 newValue?: string;
 requires_pdf_sync?: boolean;
 };
}
export async function analyzeBugReportWithAI(
 ctx: BugReportContext, 
 issueType: string, 
 userMessage: string
): Promise<BugReportAiResult> {
 const prompt = `You are an AI assistant for ALFA SAT, a Digital SAT practice test platform.

A student has reported an issue with a question. Analyze the report and determine:
1. Is the report likely valid?
2. What specific fix should be applied?
3. Priority: LOW (cosmetic), MEDIUM (confusing), HIGH (wrong answer/missing content)
4. The exact location of the error.
5. Provide a machine-readable fix payload that can modify the question data directly if approved.

QUESTION CONTEXT:
- Test: "${ctx.testName}" (ID: ${ctx.testId})
- Section: ${ctx.section}, ${ctx.module}, Question ${ctx.questionNumber}
- Question prompt: "${ctx.prompt}"
- Answer options: ${JSON.stringify(ctx.options)}
- Passage excerpt: "${ctx.passage || 'None'}"

STUDENT REPORT:
- Issue type: ${issueType}
- Student message: "${userMessage}"

Respond in this exact JSON format ONLY:
{
 "valid": true,
 "priority": "MEDIUM",
 "analysis": "your brief analysis of the bug",
 "error_location": "exact location of the error",
 "suggested_fix": "human readable explanation of the fix",
 "fix_payload": {
 "action": "update",
 "field": "prompt",
 "newValue": "the strictly corrected text or answer letter",
 "requires_pdf_sync": false
 }
}

CRITICAL: If the issue requires extracting a completely missing passage from the original PDF that you cannot see, set requires_pdf_sync to true, and leave newValue empty. For typos, wrong correctAnswers, formatting (like unclosed tags or missing KaTeX $ signs), fix them directly in newValue.`;

 try {
 const response = await geminiProvider.generateContent({
 userPrompt: prompt,
 responseFormat: 'json_object',
 temperature: 0.2
 });

 try {
 const parsed = JSON.parse(response.text) as BugReportAiResult;
 return parsed;
 } catch (e: any) {
 console.error('[BUG REPORT] Failed to parse AI response:', e.message);
 return {
 valid: true,
 priority: 'MEDIUM',
 analysis: 'Failed to parse AI response. Forwarding as-is.',
 error_location: 'Unknown',
 suggested_fix: 'Manual review needed.',
 fix_payload: { action: 'manual_review' }
 };
 }
 } catch (error: any) {
 console.error('[BUG REPORT] Gemini API error:', error.message);
 return {
 valid: true,
 priority: 'MEDIUM',
 analysis: 'AI analysis unavailable. Forwarding as-is.',
 error_location: 'Unknown',
 suggested_fix: 'Manual review needed.',
 fix_payload: { action: 'manual_review' }
 };
 }
}
