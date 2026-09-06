/**
 * Gemini API Key Pool with Smart Failover & Load Balancing
 *
 * Automatically rotates requests across multiple GEMINI_API_KEY entries.
 * If one key encounters a Rate Limit (429), Quota Exceeded, or 503 error,
 * it immediately switches to the next available API key without failing the request.
 */

export function getGeminiApiKeys(): string[] {
  const raw = process.env.GEMINI_API_KEY || "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export interface GeminiRequestOptions {
  timeoutMs?: number;
}

export async function fetchWithGeminiFailover(
  model: string,
  payload: any,
  options?: GeminiRequestOptions
): Promise<any> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  // Shuffle keys so concurrent requests distribute naturally across all available keys
  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
  let lastError: Error | null = null;

  for (let i = 0; i < shuffledKeys.length; i++) {
    const apiKey = shuffledKeys[i];
    const keyPreview = apiKey.substring(0, 6) + "..." + apiKey.substring(apiKey.length - 4);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs || 45000);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Check for Rate Limit (429), Quota Exceeded (403), or Service Unavailable (503)
      if (res.status === 429 || res.status === 503) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${res.status}`;
        console.warn(
          `[GeminiPool] Key ${keyPreview} hit ${res.status} (${errMsg}). Switching to next key (${i + 1}/${shuffledKeys.length})...`
        );
        lastError = new Error(`Key ${keyPreview} rate limited: ${errMsg}`);
        // Small 200ms delay before trying next key to prevent flooding
        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${res.status}`;

        // If error message indicates quota or rate limit, failover to next key
        if (
          errMsg.toLowerCase().includes("quota") ||
          errMsg.toLowerCase().includes("rate limit") ||
          errMsg.toLowerCase().includes("resource_exhausted")
        ) {
          console.warn(
            `[GeminiPool] Key ${keyPreview} quota exhausted (${errMsg}). Switching to next key...`
          );
          lastError = new Error(errMsg);
          continue;
        }

        throw new Error(errMsg);
      }

      const result = await res.json();
      return result;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        console.warn(`[GeminiPool] Key ${keyPreview} timed out. Trying next key...`);
        lastError = new Error("Gemini request timed out");
        continue;
      }
      lastError = err;
      console.warn(`[GeminiPool] Request with key ${keyPreview} failed: ${err.message}. Trying next key...`);
    }
  }

  throw lastError || new Error("All configured Gemini API keys failed or were rate-limited.");
}
