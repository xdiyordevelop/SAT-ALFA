import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';

export interface UploadedGoogleFile {
  fileUri: string;
  apiKey: string;
}

// Cache file URIs: key is filePath + ':' + mtimeMs, value is { fileUri: string, apiKey: string, fileName: string, expiresAt: number }
const fileUriCache = new Map<string, { fileUri: string; apiKey: string; fileName: string; expiresAt: number }>();

function getApiKey(): string {
  let raw = (process.env.GEMINI_API_KEY || '').trim();
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
  if (raw.startsWith("'") && raw.endsWith("'")) raw = raw.slice(1, -1);
  const keys = raw
    .split(',')
    .map(k => k.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);

  if (keys.length === 0) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return keys[0];
}

/**
 * Uploads a local file to Google AI Files API (or returns cached fileUri if still valid).
 * Google Files API files expire after 48 hours.
 */
export async function getOrUploadGoogleFile(diskPath: string, mimeType = 'application/pdf'): Promise<UploadedGoogleFile | null> {
  try {
    if (!fs.existsSync(diskPath)) {
      console.warn('[GoogleAIFileManager] File does not exist on disk:', diskPath);
      return null;
    }

    const stat = await fs.promises.stat(diskPath);
    const cacheKey = `${diskPath}:${stat.mtimeMs}:${stat.size}`;
    const cached = fileUriCache.get(cacheKey);

    // If cached and has at least 1 hour of TTL remaining (Google keeps files for 48h)
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`[GoogleAIFileManager] Reusing cached fileUri for ${path.basename(diskPath)}: ${cached.fileUri}`);
      return { fileUri: cached.fileUri, apiKey: cached.apiKey };
    }

    const apiKey = getApiKey();
    const fileManager = new GoogleAIFileManager(apiKey);

    console.log(`[GoogleAIFileManager] Uploading ${path.basename(diskPath)} (${(stat.size / 1024 / 1024).toFixed(1)} MB) to Google AI Files API...`);
    const uploadResult = await fileManager.uploadFile(diskPath, {
      mimeType,
      displayName: path.basename(diskPath),
    });

    let file = uploadResult.file;
    console.log(`[GoogleAIFileManager] Uploaded! Initial state: ${file.state}`);

    // Wait if state is PROCESSING
    let attempts = 0;
    while (file.state === 'PROCESSING' && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      file = await fileManager.getFile(uploadResult.file.name);
      attempts++;
    }

    if (file.state === 'FAILED') {
      console.error('[GoogleAIFileManager] File processing failed on Google servers');
      return null;
    }

    // Cache for 44 hours (Google TTL is 48 hours)
    const expiresAt = Date.now() + 44 * 60 * 60 * 1000;
    fileUriCache.set(cacheKey, {
      fileUri: file.uri,
      apiKey,
      fileName: file.name,
      expiresAt,
    });

    console.log(`[GoogleAIFileManager] File ready! URI: ${file.uri}`);
    return { fileUri: file.uri, apiKey };
  } catch (error: any) {
    console.error('[GoogleAIFileManager] Upload failed:', error.message);
    return null;
  }
}
