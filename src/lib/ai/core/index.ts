import { geminiProvider } from '../providers/gemini';
import { AiGenerateRequest, AiGenerateResponse } from './types';
import { parseStructuredAiResponse } from './json';

export * from './types';
export * from './errors';
export * from './config';
export * from './json';

// We default to Gemini, but this abstraction allows swapping providers later
export async function generateContent(req: AiGenerateRequest): Promise<AiGenerateResponse> {
 return geminiProvider.generateContent(req);
}

export async function generateStructured<T>(req: AiGenerateRequest): Promise<{ parsed: T, raw: AiGenerateResponse }> {
 const reqObj = { ...req, responseFormat: 'json_object' as const };
 const rawResponse = await generateContent(reqObj);
 const parsed = parseStructuredAiResponse<T>(rawResponse.text);
 return { parsed, raw: rawResponse };
}
