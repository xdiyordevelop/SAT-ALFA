import { AiProvider, AiGenerateRequest, AiGenerateResponse } from '../core/types';
import { AiError, AiRateLimitError, AiUnavailableError, AiQuotaExceededError } from '../core/errors';
import { AI_CONFIG } from '../core/config';

export class GeminiProvider implements AiProvider {
 name = 'gemini';
 private currentKeyIndex = 0;

 getApiKey(preferredKey?: string): string {
  if (preferredKey) return preferredKey;
  let raw = (process.env.GEMINI_API_KEY || '').trim();
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
  if (raw.startsWith("'") && raw.endsWith("'")) raw = raw.slice(1, -1);
  const keys = raw
   .split(',')
   .map(k => k.trim().replace(/^["']|["']$/g, ''))
   .filter(Boolean);

  if (keys.length === 0) {
   throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  const key = keys[this.currentKeyIndex % keys.length];
  this.currentKeyIndex = (this.currentKeyIndex + 1) % keys.length;
  return key;
 }

 async generateContent(req: AiGenerateRequest): Promise<AiGenerateResponse> {
 const models = [AI_CONFIG.gemini.primaryModel, ...AI_CONFIG.gemini.fallbackModels];
 let lastError: Error | null = null;

 for (const model of models) {
 let attempt = 0;
 const maxRetries = AI_CONFIG.gemini.maxRetries;

 while (attempt <= maxRetries) {
 try {
 const res = await this.executeRequest(model, req);
 return res;
 } catch (error: any) {
 lastError = error;
 
 if (error instanceof AiRateLimitError || error instanceof AiUnavailableError) {
 attempt++;
 if (attempt > maxRetries) {
 console.warn(`[Gemini] Exhausted ${maxRetries} retries on ${model}. Trying next model in fallback chain.`);
 break; // Break the while loop, proceed to next model in the for loop
 }
 
 // Exponential backoff with jitter
 const delay = Math.min(
 AI_CONFIG.gemini.initialRetryDelayMs * Math.pow(2, attempt) + (Math.random() * 500),
 AI_CONFIG.gemini.maxRetryDelayMs
 );
 console.warn(`[Gemini] ${error.code} on ${model}. Retry ${attempt}/${maxRetries} in ${Math.round(delay)}ms...`);
 await new Promise((r) => setTimeout(r, delay));
 } else if (error instanceof AiQuotaExceededError) {
 // Quota exceeded is usually account-wide, but maybe just this model. We can try next model.
 console.warn(`[Gemini] Quota exceeded on ${model}. Trying next model.`);
 break;
 } else if (error.code === 'MODEL_NOT_FOUND') {
 console.warn(`[Gemini] Model ${model} not found. Skipping to next model.`);
 break;
 } else if (error.message?.includes('RECITATION') || error.message?.includes('SAFETY')) {
 console.warn(`[Gemini] Filter triggered (${error.message}) on ${model}. Skipping to next model immediately.`);
 break;
 } else {
 // Non-retryable error, try next model just in case it's a weird edge case, 
 // but normally we might want to just throw. We'll break to next model.
 console.error(`[Gemini] Non-retryable error on ${model}:`, error.message);
 break;
 }
 }
 }
 }

 throw lastError || new AiError('All Gemini models failed', 'ALL_MODELS_FAILED', false);
 }

 private async executeRequest(model: string, req: AiGenerateRequest): Promise<AiGenerateResponse> {
 const activeKey = req.apiKey || this.getApiKey();
 const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
 
 const parts: any[] = [];
 const fullText = (req.systemPrompt ? req.systemPrompt + '\n\n' : '') + req.userPrompt;
 
 if (fullText) {
 parts.push({ text: fullText });
 }

 if (req.pdfFileUri) {
   parts.push({ fileData: { mimeType: 'application/pdf', fileUri: req.pdfFileUri } });
 } else if (req.pdfBase64) {
   parts.push({ inlineData: { mimeType: 'application/pdf', data: req.pdfBase64 } });
 }

 if (req.imagesBase64 && req.imagesBase64.length > 0) {
 for (const img of req.imagesBase64) {
 parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
 }
 }
 
 if (req.imageBase64 && req.imageMimeType) {
 parts.push({ inlineData: { mimeType: req.imageMimeType, data: req.imageBase64 } });
 }

 const payload = {
 contents: [{ role: 'user', parts }],
 generationConfig: {
 responseMimeType: req.responseFormat === 'json_object' ? 'application/json' : 'text/plain',
 temperature: req.temperature ?? 0.1,
 maxOutputTokens: req.maxTokens ?? 8192,
 topP: 0.95,
 },
 };

 // Controller for timeout if none provided
 const abortController = new AbortController();
 const timeoutId = setTimeout(() => abortController.abort(), AI_CONFIG.timeouts.generateTimeoutMs);
 const signal = req.signal || abortController.signal;

 try {
 const response = await fetch(url, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 signal,
 });

 if (!response.ok) {
 const errorData = await response.json().catch(() => ({}));
 const status = response.status;
 
 if (status === 429) {
 throw new AiRateLimitError(errorData?.error?.message || 'Rate limit exceeded');
 } else if (status === 503 || status === 502 || status === 500) {
 throw new AiUnavailableError(errorData?.error?.message || `Service unavailable (${status})`);
 } else if (status === 403 && errorData?.error?.message?.toLowerCase().includes('quota')) {
 throw new AiQuotaExceededError(errorData?.error?.message || 'Quota exceeded');
 } else if (status === 404) {
 throw new AiError(`Model not found`, 'MODEL_NOT_FOUND', false, errorData);
 } else {
 throw new AiError(`API Error ${status}: ${errorData?.error?.message || 'Unknown error'}`, 'API_ERROR', false, errorData);
 }
 }

 const data = await response.json();
 
 const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
 if (!text) {
 // Could be a safety block
 const finishReason = data?.candidates?.[0]?.finishReason;
 throw new AiError(`Empty response from model. Finish reason: ${finishReason || 'Unknown'}`, 'EMPTY_RESPONSE', false, data);
 }

 return {
 text,
 modelUsed: model,
 usage: data.usageMetadata ? {
 promptTokens: data.usageMetadata.promptTokenCount,
 completionTokens: data.usageMetadata.candidatesTokenCount,
 totalTokens: data.usageMetadata.totalTokenCount,
 } : undefined
 };
 } catch (error: any) {
 if (error.name === 'AbortError') {
 throw new AiError('AI request timed out', 'TIMEOUT', true);
 }
 if (error instanceof AiError) {
 throw error;
 }
 throw new AiError(error.message, 'NETWORK_ERROR', true, error);
 } finally {
 clearTimeout(timeoutId);
 }
 }
}

export const geminiProvider = new GeminiProvider();
