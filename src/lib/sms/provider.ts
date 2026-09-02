export interface SmsMessage {
 phoneNumber: string;
 message: string;
 studentName: string;
 testName?: string;
 score?: number;
 maxScore?: number;
}

export interface SmsProvider {
 send(message: SmsMessage): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

class MockSmsProvider implements SmsProvider {
 async send(message: SmsMessage) {
 console.log(`[SMS Mock] To: ${message.phoneNumber}, Message: ${message.message}`);
 return {
 success: true,
 messageId: `mock_${Date.now()}_{Math.random().toString(36).substr(2, 9)}`,
 };
 }
}

let smsProvider: SmsProvider | null = null;

function getMockSmsProvider(): SmsProvider {
 if (!smsProvider) {
 smsProvider = new MockSmsProvider();
 }
 return smsProvider;
}

export function getSmsProvider(): SmsProvider {
 const provider = process.env.SMS_PROVIDER || "mock";

 if (provider === "mock") {
 return getMockSmsProvider();
 }

 // Placeholder for real SMS provider (Twilio, AWS SNS, etc.)
 return getMockSmsProvider();
}

export function formatTestResultMessage(
 studentName: string,
 testName: string,
 score: number,
 maxScore: number
): string {
 const percentage = ((score / maxScore) * 100).toFixed(1);
 return `Hello! ${studentName} completed "${testName}" with a score of ${score}/${maxScore} (${percentage}%). Great effort! 📚`;
}

export function formatTestStartMessage(studentName: string, testName: string): string {
 return `Hello! ${studentName} just started "${testName}". Good luck! 📝`;
}

export function formatProgressUpdateMessage(
 studentName: string,
 averageScore: number,
 improvement: number
): string {
 return `${studentName}'s progress update: Average score is ${averageScore.toFixed(1)}% with +${improvement}% improvement. Keep it up! 🌟`;
}
