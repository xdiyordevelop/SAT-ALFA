export class AiError extends Error {
 constructor(message: string, public readonly code: string, public readonly retryable: boolean, public readonly details?: any) {
 super(message);
 this.name = 'AiError';
 }
}

export class AiRateLimitError extends AiError {
 constructor(message: string = 'Rate limited by AI provider') {
 super(message, 'RATE_LIMIT', true);
 this.name = 'AiRateLimitError';
 }
}

export class AiUnavailableError extends AiError {
 constructor(message: string = 'AI provider is temporarily unavailable') {
 super(message, 'UNAVAILABLE', true);
 this.name = 'AiUnavailableError';
 }
}

export class AiQuotaExceededError extends AiError {
 constructor(message: string = 'AI provider quota exceeded') {
 super(message, 'QUOTA_EXCEEDED', false);
 this.name = 'AiQuotaExceededError';
 }
}

export class AiValidationError extends AiError {
 constructor(message: string, details?: any) {
 super(message, 'VALIDATION_FAILED', false, details);
 this.name = 'AiValidationError';
 }
}
