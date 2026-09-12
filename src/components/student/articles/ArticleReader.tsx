"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MathRenderer } from "@/components/ui/MathRenderer";
import {
  BookA,
  X,
  Clock,
  Eye,
  ArrowLeft,
  Share2,
  Check,
  Search,
  Sparkles,
  Volume2,
  Loader2,
  History,
  AlertCircle,
  Bookmark,
} from "lucide-react";

type ArticleData = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  readTimeMin: number;
  viewsCount: number;
  createdAt: Date;
  vocabulary?: unknown;
};

type DictionarySense = {
  partOfSpeech: string;
  definitions: string[];
  phonetic?: string;
  audioUrl?: string | null;
};

type DictionaryResult = {
  found: boolean;
  word: string;
  headword?: string;
  phonetic?: string;
  audioUrl?: string | null;
  stems?: string[];
  senses: DictionarySense[];
  suggestions?: string[];
  configured?: boolean;
  error?: string;
};

type VocabEntry = {
  word: string;
  definition: string;
  context?: string;
};

function parseArticleVocab(raw: unknown): VocabEntry[] {
  if (!raw) return [];
  try {
    const arr: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((v: any) => ({
        word: String(v?.word || "").trim(),
        definition: String(v?.definition || "").trim(),
        context: String(v?.contextSentence || v?.context || "").trim(),
      }))
      .filter((v) => v.word.length > 0);
  } catch {
    return [];
  }
}

const DEFAULT_SAT_WORDS = ["ubiquitous", "pragmatic", "ephemeral", "anomaly", "lucid", "esoteric"];

export function ArticleReader({
  article,
  relatedArticles = [],
}: {
  article: ArticleData;
  relatedArticles?: ArticleData[];
}) {
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const passageVocab = parseArticleVocab(article.vocabulary);

  // Reader Typography Customization Preferences
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [readingProgress, setReadingProgress] = useState(0);

  // Dictionary Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<DictionaryResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Floating Popover for selected text in passage
  const [selectionTooltip, setSelectionTooltip] = useState<{
    word: string;
    top: number;
    left: number;
  } | null>(null);

  // Fullscreen Lightbox for article images
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    alt?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  // Reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Text selection listener for quick lookup
  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const text = selection.toString().trim();
      // Allow single words or short phrases up to 30 characters
      if (!text || text.length > 30 || !/^[a-zA-Z\s'-]+$/.test(text)) {
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSelectionTooltip({
            word: text,
            top: rect.top + window.scrollY - 46,
            left: Math.max(16, Math.min(window.innerWidth - 220, rect.left + rect.width / 2 - 80)),
          });
        }
      } catch {
        // Ignore range errors
      }
    };

    const handleDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#selection-lookup-tooltip")) {
        setSelectionTooltip(null);
      }
    };

    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const imgTarget = target.closest("img") as HTMLImageElement | null;
      if (imgTarget && container.contains(imgTarget)) {
        e.stopPropagation();
        setLightboxImage({ url: imgTarget.src, alt: imgTarget.alt });
      }
    };

    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("click", handleImageClick);
    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("click", handleImageClick);
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, []);

  // Dictionary Lookup Function
  const lookupWord = async (wordToSearch: string) => {
    const clean = wordToSearch.trim().toLowerCase().replace(/[^\w\s-]/g, "");
    if (!clean) return;

    setSearchQuery(wordToSearch.trim());
    setIsSearching(true);
    setSelectionTooltip(null);

    // Update session recent searches (up to 6 distinct items)
    setRecentSearches((prev) => [clean, ...prev.filter((w) => w !== clean)].slice(0, 6));

    try {
      const res = await fetch(`/api/dictionary?word=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchResult({
          found: false,
          word: clean,
          error: data.error || "Failed to search word",
          configured: data.configured !== undefined ? data.configured : true,
          senses: [],
        });
      } else {
        setSearchResult(data);
      }
    } catch {
      setSearchResult({
        found: false,
        word: clean,
        error: "Network error while connecting to dictionary",
        senses: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  const playPronunciation = (audioUrl?: string | null) => {
    if (!audioUrl) return;
    try {
      const audio = new Audio(audioUrl);
      setPlayingAudio(true);
      audio.onended = () => setPlayingAudio(false);
      audio.onerror = () => setPlayingAudio(false);
      audio.play().catch(() => setPlayingAudio(false));
    } catch {
      setPlayingAudio(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Compute inline typography styles
  const currentFontSize = fontSize === "sm" ? "15px" : fontSize === "lg" ? "22px" : "18px";
  const currentLineHeight = fontSize === "sm" ? "1.7" : fontSize === "lg" ? "2.0" : "1.85";
  const currentFontFamily =
    fontFamily === "serif"
      ? 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, "Times New Roman", serif'
      : '"Geist", var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Reusable Dictionary Component for Sidebar & Mobile Drawer
  const renderDictionaryContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <BookA className="w-5 h-5 text-[#EBFF00]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Dictionary Search
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Merriam-Webster Collegiate
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-black bg-[#EBFF00] px-2 py-0.5 rounded">
          Live
        </span>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            lookupWord(searchQuery);
          }
        }}
        className="relative mb-3 shrink-0"
      >
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search any English word..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#EBFF00] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Recent Lookups / History */}
      {recentSearches.length > 0 && (
        <div className="mb-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
            <History className="w-3 h-3" />
            <span>Recent lookups:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((rw) => (
              <button
                key={rw}
                type="button"
                onClick={() => lookupWord(rw)}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border transition-all ${
                  searchResult?.word === rw
                    ? "bg-[#EBFF00]/15 text-[#EBFF00] border-[#EBFF00]/40 font-bold"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#EBFF00]/30"
                }`}
              >
                {rw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results View Container */}
      <div className="flex-1 overflow-y-auto pr-1 overscroll-contain space-y-3">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-7 h-7 text-[#EBFF00] animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Consulting Merriam-Webster...
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Retrieving definitions & audio</p>
          </div>
        ) : searchResult ? (
          <>
            {/* Unconfigured API key warning */}
            {searchResult.configured === false && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-600 dark:text-amber-400 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">API Key Not Configured</strong>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      Please set <code className="bg-black/20 px-1 py-0.5 rounded text-amber-500 font-mono">DICTIONARY_API_KEY</code> in your <code className="bg-black/20 px-1 py-0.5 rounded font-mono">.env</code> file.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Word Found Result */}
            {searchResult.found ? (
              <div className="space-y-3 animate-in fade-in duration-150">
                {/* Word Card Banner */}
                <div className="p-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {searchResult.headword || searchResult.word}
                      </h4>
                      {searchResult.phonetic && (
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          \{searchResult.phonetic}\
                        </p>
                      )}
                    </div>

                    {searchResult.audioUrl && (
                      <button
                        type="button"
                        onClick={() => playPronunciation(searchResult.audioUrl)}
                        disabled={playingAudio}
                        title="Play audio pronunciation"
                        className="p-2 rounded-xl bg-[#EBFF00] text-slate-950 hover:bg-[#d4e600] active:scale-95 transition-all shadow-sm"
                      >
                        {playingAudio ? (
                          <Volume2 className="w-4 h-4 animate-pulse" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Stems / Inflections */}
                  {searchResult.stems && searchResult.stems.length > 1 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/5 flex flex-wrap gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">
                        Forms:
                      </span>
                      {searchResult.stems.slice(0, 5).map((stem) => (
                        <button
                          key={stem}
                          type="button"
                          onClick={() => lookupWord(stem)}
                          className="text-[10px] bg-slate-200 dark:bg-white/5 hover:bg-[#EBFF00]/20 hover:text-[#EBFF00] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium transition-colors"
                        >
                          {stem}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Senses & Definitions */}
                <div className="space-y-2.5">
                  {searchResult.senses.map((sense, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#EBFF00] bg-[#EBFF00]/10 border border-[#EBFF00]/20 px-2 py-0.5 rounded-md">
                          {sense.partOfSpeech}
                        </span>
                        {sense.audioUrl && sense.audioUrl !== searchResult.audioUrl && (
                          <button
                            type="button"
                            onClick={() => playPronunciation(sense.audioUrl)}
                            className="text-slate-400 hover:text-white p-1"
                            title="Play pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <ol className="list-decimal list-outside ml-4 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
                        {sense.definitions.map((def, dIdx) => (
                          <li key={dIdx} className="pl-0.5">
                            {def}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Word Not Found / Suggestions */
              <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl text-center space-y-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No direct entry found for &ldquo;<span className="text-[#EBFF00] font-bold">{searchResult.word}</span>&rdquo;
                </p>

                {searchResult.suggestions && searchResult.suggestions.length > 0 ? (
                  <div className="text-left pt-2 border-t border-slate-200 dark:border-white/5">
                    <p className="text-[11px] text-slate-400 font-semibold mb-2">
                      Did you mean one of these?
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {searchResult.suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => lookupWord(sug)}
                          className="text-xs px-2.5 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#EBFF00] text-slate-800 dark:text-white rounded-lg transition-all font-medium"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Try checking the spelling or highlight a word directly from the passage.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          /* Empty / Idle State */
          <div className="p-4 text-center space-y-4 py-6">
            <div className="w-10 h-10 rounded-2xl bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center mx-auto text-[#EBFF00]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Instant SAT Word Lookup
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Highlight or select any word in the text to instantly see Merriam-Webster definitions and native audio pronunciation.
              </p>
            </div>

            {/* If passage has AI-extracted vocabulary words, show them as quick clickable chips */}
            {passageVocab.length > 0 ? (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-left">
                <span className="text-[10px] uppercase font-bold text-[#EBFF00] tracking-wider flex items-center gap-1 mb-2">
                  <Bookmark className="w-3 h-3" /> Passage Key Words ({passageVocab.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {passageVocab.map((pv) => (
                    <button
                      key={pv.word}
                      type="button"
                      onClick={() => lookupWord(pv.word)}
                      className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-white/5 hover:bg-[#EBFF00]/20 hover:text-[#EBFF00] hover:border-[#EBFF00]/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-lg transition-all font-medium"
                    >
                      {pv.word}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  Sample SAT Words:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_SAT_WORDS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => lookupWord(w)}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 hover:bg-[#EBFF00]/20 hover:text-[#EBFF00] text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative pb-16">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
        <div
          className="h-full bg-[#EBFF00] shadow-[0_0_8px_#EBFF00] transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Selection Tooltip */}
      {selectionTooltip && (
        <div
          id="selection-lookup-tooltip"
          style={{ top: `${selectionTooltip.top}px`, left: `${selectionTooltip.left}px` }}
          className="absolute z-50 flex items-center gap-1.5 bg-slate-900 border border-[#EBFF00]/80 rounded-xl px-2.5 py-1.5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            onClick={() => {
              lookupWord(selectionTooltip.word);
              if (window.innerWidth < 1024) {
                setMobileDrawerOpen(true);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#EBFF00] hover:underline"
          >
            <Search className="w-3.5 h-3.5" />
            <span>
              Define &ldquo;{selectionTooltip.word.length > 14 ? selectionTooltip.word.slice(0, 14) + "..." : selectionTooltip.word}&rdquo;
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectionTooltip(null)}
            className="text-slate-400 hover:text-white p-0.5 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Close image"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt || "Enlarged illustration"}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/15 bg-black"
            />
            {lightboxImage.alt && (
              <p className="text-xs text-slate-300 mt-3 text-center bg-black/70 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm max-w-md">
                {lightboxImage.alt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start relative">
        {/* Left / Center Article Reader */}
        <article className="flex-1 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 md:p-12 w-full min-w-0 shadow-sm">
          {/* Top Bar: Back, Share, and Reading Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100 dark:border-white/5 text-xs">
            <Link
              href="/student/articles"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#EBFF00] font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>

            {/* Typography Controls */}
            <div className="flex items-center gap-3">
              {/* Font Family Switch */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setFontFamily("serif")}
                  className={`px-3 py-1 rounded-lg font-serif font-bold text-xs transition-all ${
                    fontFamily === "serif"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm border border-slate-200/60 dark:border-white/10 scale-105"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Serif font (Classic SAT passage style)"
                >
                  Serif
                </button>
                <button
                  onClick={() => setFontFamily("sans")}
                  className={`px-3 py-1 rounded-lg font-sans font-bold text-xs transition-all ${
                    fontFamily === "sans"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm border border-slate-200/60 dark:border-white/10 scale-105"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Sans-serif font (Modern clean style)"
                >
                  Sans
                </button>
              </div>

              {/* Font Size Switch */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    fontSize === "sm"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm border border-slate-200/60 dark:border-white/10 scale-105"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Kichik matn (15px)"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("base")}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    fontSize === "base"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm border border-slate-200/60 dark:border-white/10 scale-105"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Standart matn (18px)"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2.5 py-1 rounded-lg font-bold text-sm transition-all ${
                    fontSize === "lg"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm border border-slate-200/60 dark:border-white/10 scale-105"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Katta matn (22px)"
                >
                  A+
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Copy article link"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-10 pb-8 border-b border-slate-100 dark:border-white/5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-black bg-[#EBFF00] px-3 py-1 rounded-lg shadow-sm">
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {article.readTimeMin} min read
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> {article.viewsCount} reads
              </span>
              <span className="text-xs text-[#EBFF00] bg-[#EBFF00]/10 border border-[#EBFF00]/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <BookA className="w-3.5 h-3.5" /> Merriam-Webster Dictionary Search
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {article.summary}
              </p>
            )}

            {/* Cover Image banner if available */}
            {article.coverImage && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-[16/9] max-h-[440px] w-full bg-slate-900">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </header>

          {/* Rendered Content with Dynamic Typography */}
          <div
            ref={contentContainerRef}
            className="article-passage-content max-w-none text-slate-800 dark:text-slate-200 select-text"
            style={{
              ["--passage-font-size" as any]: currentFontSize,
              ["--passage-line-height" as any]: currentLineHeight,
              fontFamily: currentFontFamily,
            }}
          >
            <MathRenderer text={article.content} />
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-[#EBFF00]" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  More in {article.category}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/student/articles/${rel.slug}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-[#EBFF00]/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#EBFF00] bg-[#EBFF00]/10 px-2 py-0.5 rounded">
                        {rel.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-[#EBFF00] transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-2 border-t border-slate-100 dark:border-white/5">
                      <span>{rel.readTimeMin} min read</span>
                      <span className="text-[#EBFF00] font-semibold">&rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Desktop Sticky Dictionary Sidebar */}
        <aside className="hidden lg:block w-80 xl:w-88 shrink-0 sticky top-20 self-start">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-5 xl:p-6 shadow-sm flex flex-col h-[calc(100vh-6rem)]">
            {renderDictionaryContent()}
          </div>
        </aside>
      </div>

      {/* Floating Action Button for Mobile Dictionary Drawer */}
      <button
        onClick={() => setMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#EBFF00] text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-black/10 hover:scale-105 active:scale-95 transition-transform"
      >
        <BookA className="w-4 h-4" />
        <span>Dictionary</span>
      </button>

      {/* Mobile Dictionary Slide-Up Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden p-5">
            <div className="flex justify-end pb-1">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {renderDictionaryContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
