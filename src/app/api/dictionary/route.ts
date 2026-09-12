import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

interface CachedEntry {
  data: any;
  timestamp: number;
}

// In-memory cache to save Merriam-Webster query quotas (1000 requests/day limit)
const dictionaryCache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getAudioUrl(audio: string): string {
  let subdir = audio.charAt(0);
  if (audio.startsWith("bix")) {
    subdir = "bix";
  } else if (audio.startsWith("gg")) {
    subdir = "gg";
  } else if (/^[0-9]/.test(audio) || /^[^a-zA-Z]/.test(audio)) {
    subdir = "number";
  }
  return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audio}.mp3`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const rawWord = searchParams.get("word");

    if (!rawWord || !rawWord.trim()) {
      return NextResponse.json({ error: "Word parameter is required" }, { status: 400 });
    }

    const cleanWord = rawWord
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, ""); // strip punctuation

    if (!cleanWord) {
      return NextResponse.json({ error: "Invalid word" }, { status: 400 });
    }

    const apiKey = process.env.DICTIONARY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "DICTIONARY_API_KEY is not configured",
          configured: false,
        },
        { status: 503 }
      );
    }

    // Check cache
    const cacheKey = cleanWord;
    const cached = dictionaryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    // Fetch from Merriam-Webster Collegiate Dictionary API
    const apiUrl = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(
      cleanWord
    )}?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // Next.js cache 24h
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Merriam-Webster API error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      const notFoundPayload = {
        found: false,
        word: cleanWord,
        suggestions: [],
      };
      dictionaryCache.set(cacheKey, { data: notFoundPayload, timestamp: Date.now() });
      return NextResponse.json(notFoundPayload);
    }

    // If first item is a string, it means word wasn't found and MW returned suggestions
    if (typeof data[0] === "string") {
      const suggestionsPayload = {
        found: false,
        word: cleanWord,
        suggestions: data.slice(0, 8),
      };
      dictionaryCache.set(cacheKey, { data: suggestionsPayload, timestamp: Date.now() });
      return NextResponse.json(suggestionsPayload);
    }

    // Filter valid dictionary entries
    const entries = data.filter((item: any) => typeof item === "object" && item.meta);

    if (entries.length === 0) {
      const notFoundPayload = {
        found: false,
        word: cleanWord,
        suggestions: [],
      };
      dictionaryCache.set(cacheKey, { data: notFoundPayload, timestamp: Date.now() });
      return NextResponse.json(notFoundPayload);
    }

    // Extract primary audio and phonetic
    let primaryAudioUrl: string | null = null;
    let primaryPhonetic = "";
    let primaryHw = "";

    for (const entry of entries) {
      if (!primaryHw && entry.hwi?.hw) {
        primaryHw = entry.hwi.hw.replace(/\*/g, "·");
      }
      const prs = entry.hwi?.prs;
      if (prs && Array.isArray(prs)) {
        for (const pr of prs) {
          if (!primaryPhonetic && pr.mw) {
            primaryPhonetic = pr.mw;
          }
          if (!primaryAudioUrl && pr.sound?.audio) {
            primaryAudioUrl = getAudioUrl(pr.sound.audio);
          }
        }
      }
      if (primaryAudioUrl && primaryPhonetic) break;
    }

    // Extract senses/definitions grouped by part of speech
    const senses: Array<{
      partOfSpeech: string;
      definitions: string[];
      phonetic?: string;
      audioUrl?: string | null;
    }> = [];

    for (const entry of entries) {
      const fl = entry.fl || "definition";
      const definitions: string[] = Array.isArray(entry.shortdef) ? entry.shortdef : [];
      if (definitions.length === 0) continue;

      let entryAudioUrl: string | null = null;
      let entryPhonetic = "";
      const prs = entry.hwi?.prs;
      if (prs && Array.isArray(prs) && prs.length > 0) {
        entryPhonetic = prs[0]?.mw || "";
        if (prs[0]?.sound?.audio) {
          entryAudioUrl = getAudioUrl(prs[0].sound.audio);
        }
      }

      senses.push({
        partOfSpeech: fl,
        definitions,
        phonetic: entryPhonetic || primaryPhonetic,
        audioUrl: entryAudioUrl || primaryAudioUrl,
      });
    }

    const allStems = Array.from(
      new Set(entries.flatMap((e: any) => e.meta?.stems || []))
    ).slice(0, 8);

    const result = {
      found: true,
      word: cleanWord,
      headword: primaryHw || cleanWord,
      phonetic: primaryPhonetic,
      audioUrl: primaryAudioUrl,
      stems: allStems,
      senses:
        senses.length > 0
          ? senses
          : [
              {
                partOfSpeech: entries[0]?.fl || "definition",
                definitions: entries[0]?.shortdef || [],
                phonetic: primaryPhonetic,
                audioUrl: primaryAudioUrl,
              },
            ],
    };

    dictionaryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Dictionary lookup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to look up word in dictionary" },
      { status: 500 }
    );
  }
}
