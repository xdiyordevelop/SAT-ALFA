export interface AiGenerateRequest {
 systemPrompt?: string;
 userPrompt: string;
 responseFormat?: 'text' | 'json_object';
 temperature?: number;
 maxTokens?: number;
 pdfBase64?: string;
 imageBase64?: string;
 imageMimeType?: string;
 imagesBase64?: { mimeType: string; data: string }[];
 signal?: AbortSignal;
}
export interface AiGenerateResponse {
 text: string;
 modelUsed: string;
 usage?: {
 promptTokens: number;
 completionTokens: number;
 totalTokens: number;
 };
}
export interface AiProvider {
 name: string;
 generateContent(req: AiGenerateRequest): Promise<AiGenerateResponse>;
}
