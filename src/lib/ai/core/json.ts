import { jsonrepair } from 'jsonrepair';
import { AiValidationError } from './errors';

const cleanJsonString = (rawText: string) => {
 let cleanStr = rawText
 .replace(/```(?:json)?\n?/gi, '')
 .replace(/```/g, '')
 .trim();

 const match = cleanStr.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
 cleanStr = match ? match[0] : cleanStr;
 
 // Escape bare LaTeX backslashes (e.g. \frac -> \\frac) that break JSON
 // Only escape if it's not already a valid JSON escape sequence like \n, \t, \", \\
 cleanStr = cleanStr.replace(/\\(?!["\\/bfnrt])/g, '\\\\');
 
 return cleanStr;
};

/**
 * Robust JSON extraction and parsing from AI responses.
 * Handles markdown fences, dangling commas, and unescaped KaTeX backslashes.
 */
export function parseStructuredAiResponse<T = any>(responseText: string): T {
 try {
 const cleanStr = cleanJsonString(responseText);
 
 if (!cleanStr.includes('{') && !cleanStr.includes('[')) {
 throw new Error("No JSON object or array found in AI response");
 }

 try {
 const repaired = jsonrepair(cleanStr);
 return JSON.parse(repaired);
 } catch (err: any) {
 // Fallback to raw parse if repair fails
 return JSON.parse(cleanStr);
 }
 } catch (error: any) {
 console.error("[parseStructuredAiResponse] AI JSON Parsing Error:", error.message);
 // Securely log a snippet of the raw response instead of throwing fatal errors
 console.error("Raw AI Response Snippet:", responseText.substring(0, 500));
 
 // Return graceful fallback state
 return {
 success: false,
 error: "AI formatting error",
 questions: []
 } as unknown as T;
 }
}
