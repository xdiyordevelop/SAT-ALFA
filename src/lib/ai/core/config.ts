export const AI_CONFIG = {
  gemini: {
    primaryModel: 'gemini-3.5-flash',
    fallbackModels: ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.7-flash'],
    maxRetries: 2,
    initialRetryDelayMs: 800,
    maxRetryDelayMs: 3000,
  },
  timeouts: {
    generateTimeoutMs: 120000, 
  }
}
