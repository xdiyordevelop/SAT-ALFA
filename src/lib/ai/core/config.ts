export const AI_CONFIG = {
  gemini: {
    primaryModel: 'gemini-3.5-flash-lite',
    fallbackModels: ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.6-flash'],
    maxRetries: 1,
    initialRetryDelayMs: 400,
    maxRetryDelayMs: 2000,
  },
  timeouts: {
    generateTimeoutMs: 60000, 
  }
}
