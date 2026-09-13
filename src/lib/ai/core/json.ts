import { jsonrepair } from 'jsonrepair';
import { AiValidationError } from './errors';

/**
 * Intelligent JSON extractor that isolates the true top-level JSON object or array
 * even if the model outputs preambles, trailing text, or figure tags outside the JSON.
 */
function extractTopLevelJson(rawText: string): string {
  let text = rawText
    .replace(/```(?:json)?\n?/gi, '')
    .replace(/```/g, '')
    .trim();

  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');

  let startIdx = -1;
  let openChar = '{';
  let closeChar = '}';

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    openChar = '{';
    closeChar = '}';
  } else if (firstBracket !== -1 && firstBrace !== -1 && firstBracket < firstBrace) {
    // If a bracket appears before a brace, check if it's an unescaped tag like [IMAGE_BOX: ...]
    const between = text.slice(firstBracket, firstBrace).trim();
    if (
      between.startsWith('[IMAGE_BOX') ||
      between.startsWith('[FIGURE') ||
      between.startsWith('[BOX') ||
      !between.includes('{')
    ) {
      startIdx = firstBrace;
      openChar = '{';
      closeChar = '}';
    } else {
      startIdx = firstBracket;
      openChar = '[';
      closeChar = ']';
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    openChar = '[';
    closeChar = ']';
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
    openChar = '{';
    closeChar = '}';
  }

  if (startIdx === -1) return text;

  let depth = 0;
  let inString = false;
  let escape = false;
  let endIdx = -1;

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === openChar) {
        depth++;
      } else if (char === closeChar) {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
  }

  let result = text;
  if (endIdx !== -1) {
    result = text.substring(startIdx, endIdx + 1);
  } else {
    const lastClose = text.lastIndexOf(closeChar);
    if (lastClose > startIdx) {
      result = text.substring(startIdx, lastClose + 1);
    } else {
      result = text.substring(startIdx);
    }
  }

  // Escape bare LaTeX backslashes (e.g. \frac -> \\frac) that break JSON strings
  // Only escape if it's not already a valid JSON escape sequence like \n, \t, \", \\, \/
  result = result.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

  return result;
}

/**
 * Robust JSON extraction and parsing from AI responses.
 * Handles markdown fences, dangling commas, and unescaped KaTeX backslashes.
 */
export function parseStructuredAiResponse<T = any>(responseText: string): T {
  try {
    const cleanStr = extractTopLevelJson(responseText);

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
    console.error("Raw AI Response Snippet:", responseText.substring(0, 500));

    // Return graceful fallback state
    return {
      success: false,
      error: "AI formatting error",
      questions: [],
    } as unknown as T;
  }
}
