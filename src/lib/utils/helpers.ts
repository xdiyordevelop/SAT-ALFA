import bcryptjs from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
 return await bcryptjs.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
 return await bcryptjs.compare(password, hash);
}

export function generateUUID(): string {
 return crypto.randomUUID();
}

export function formatDate(date: Date): string {
 return new Intl.DateTimeFormat("en-US", {
 year: "numeric",
 month: "2-digit",
 day: "2-digit",
 }).format(date);
}

export function formatCurrency(amount: number): string {
 return new Intl.NumberFormat("en-US", {
 style: "currency",
 currency: "USD",
 }).format(amount);
}

export function calculateImprovement(
 currentScore: number,
 previousScore: number
): { improvement: number; improvementPct: number } {
 const improvement = currentScore - previousScore;
 const improvementPct = previousScore > 0 ? (improvement / previousScore) * 100 : 0;
 return { improvement, improvementPct };
}

export function classifyWeakStrong(percentage: number): "weak" | "strong" | "neutral" {
 if (percentage < 65) return "weak";
 if (percentage > 85) return "strong";
 return "neutral";
}
