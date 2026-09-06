export const AI_CONFIG = {
 gemini: {
 primaryModel: 'gemini-3.7-flash',
 fallbackModels: ['gemini-3.6-flash', 'gemini-3.1-flash-lite'],
 maxRetries: 3,
 initialRetryDelayMs: 1000,
 maxRetryDelayMs: 10000,
 },
 timeouts: {
 // We should use an AbortController for large requests.
 // Setting global request timeout slightly lower than Vercel's maxDuration
 generateTimeoutMs: 110000, 
 }
}
