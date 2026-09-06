"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MathRenderer } from "@/components/ui/MathRenderer";
import {
  BookOpen,
  X,
  Clock,
  Eye,
  Type,
  ArrowLeft,
  ChevronRight,
  Share2,
  Check,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";

type VocabEntry = {
  word: string;
  definition: string;
  context: string;
};

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
  vocabulary: unknown;
};

function parseVocab(raw: unknown): VocabEntry[] {
  if (!raw) return [];
  try {
    const arr: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.map((v: any) => ({
      word: v?.word || "",
      definition: v?.definition || "",
      context: v?.contextSentence || v?.context || "",
    }));
  } catch {
    return [];
  }
}

export function ArticleReader({
  article,
  relatedArticles = [],
}: {
  article: ArticleData;
  relatedArticles?: ArticleData[];
}) {
  const vocabList = parseVocab(article.vocabulary);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Reader Customization Preferences
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [readingProgress, setReadingProgress] = useState(0);

  // Vocabulary States
  const [activeVocab, setActiveVocab] = useState<number | null>(null);
  const [vocabSearch, setVocabSearch] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Floating Popover for clicked word
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    definition: string;
    context: string;
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

  // In-text vocabulary highlight injection
  useEffect(() => {
    const container = contentContainerRef.current;
    if (!container || vocabList.length === 0) return;

    // Filter valid words and sort by descending length to match phrases properly
    const words = vocabList
      .map((v) => v.word.trim())
      .filter((w) => w.length > 1)
      .sort((a, b) => b.length - a.length);

    if (words.length === 0) return;

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `\\b(${words.map(escapeRegex).join("|")})\\b`,
      "gi"
    );

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (
            parent.closest(".katex") ||
            parent.closest("pre") ||
            parent.closest("code") ||
            parent.closest("a") ||
            parent.closest(".sat-vocab-highlight")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((node) => {
      const text = node.nodeValue;
      if (!text || !pattern.test(text)) return;
      pattern.lastIndex = 0;

      const span = document.createElement("span");
      span.innerHTML = text.replace(pattern, (match) => {
        return `<mark class="sat-vocab-highlight cursor-pointer bg-[#EBFF00]/15 hover:bg-[#EBFF00]/35 text-slate-900 dark:text-[#EBFF00] font-semibold border-b-2 border-[#EBFF00] rounded-sm px-1 transition-all inline-block select-none" data-word="${match.toLowerCase()}">${match}</mark>`;
      });

      node.parentNode?.replaceChild(span, node);
    });

    const handleWordClick = (e: MouseEvent) => {
      const clickedEl = e.target as HTMLElement;

      // Handle image click for lightbox zoom
      const imgTarget = clickedEl.closest("img") as HTMLImageElement | null;
      if (imgTarget) {
        e.stopPropagation();
        setLightboxImage({ url: imgTarget.src, alt: imgTarget.alt });
        return;
      }

      const target = clickedEl.closest(
        ".sat-vocab-highlight"
      ) as HTMLElement | null;
      if (!target) {
        setSelectedWord(null);
        return;
      }

      e.stopPropagation();
      const wordKey = target.dataset.word?.toLowerCase();
      const found = vocabList.find(
        (v) => v.word.trim().toLowerCase() === wordKey
      );

      if (found) {
        const rect = target.getBoundingClientRect();
        setSelectedWord({
          word: found.word,
          definition: found.definition,
          context: found.context,
          top: rect.bottom + window.scrollY + 8,
          left: Math.max(16, Math.min(window.innerWidth - 320, rect.left)),
        });

        const idx = vocabList.findIndex(
          (v) => v.word.trim().toLowerCase() === wordKey
        );
        if (idx !== -1) {
          setActiveVocab(idx);
          setTimeout(() => {
            const el = document.getElementById(`vocab-sidebar-item-${idx}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 50);
        }
      }
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#vocab-popover") && !target.closest(".sat-vocab-highlight")) {
        setSelectedWord(null);
      }
    };

    container.addEventListener("click", handleWordClick);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      container.removeEventListener("click", handleWordClick);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [article.content, article.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredVocab = vocabList.filter(
    (v) =>
      v.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      v.definition.toLowerCase().includes(vocabSearch.toLowerCase())
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

      {/* Floating In-Text Popover */}
      {selectedWord && (
        <div
          id="vocab-popover"
          style={{ top: `${selectedWord.top}px`, left: `${selectedWord.left}px` }}
          className="absolute z-50 w-72 sm:w-80 bg-slate-900 border-2 border-[#EBFF00]/60 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150 text-white"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EBFF00] bg-[#EBFF00]/10 px-2 py-0.5 rounded">
                SAT Vocabulary
              </span>
              <h4 className="text-lg font-black text-white mt-1 capitalize">
                {selectedWord.word}
              </h4>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed mb-3">
            {selectedWord.definition}
          </p>
          {selectedWord.context && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-[11px] text-slate-300 italic">
              "{selectedWord.context}"
            </div>
          )}
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
                  className={`px-2.5 py-1 rounded-lg font-serif font-bold text-xs transition-colors ${
                    fontFamily === "serif"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Serif font (SAT passage style)"
                >
                  Serif
                </button>
                <button
                  onClick={() => setFontFamily("sans")}
                  className={`px-2.5 py-1 rounded-lg font-sans font-bold text-xs transition-colors ${
                    fontFamily === "sans"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Sans-serif font"
                >
                  Sans
                </button>
              </div>

              {/* Font Size Switch */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    fontSize === "sm"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Small text"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("base")}
                  className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors ${
                    fontSize === "base"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Medium text"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-2 py-1 rounded-lg font-bold text-sm transition-colors ${
                    fontSize === "lg"
                      ? "bg-white dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] shadow-sm"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Large text"
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
              {vocabList.length > 0 && (
                <span className="text-xs text-yellow-600 dark:text-[#EBFF00] bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg font-bold">
                  {vocabList.length} vocabulary words highlighted
                </span>
              )}
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

          {/* Rendered Content */}
          <div
            ref={contentContainerRef}
            className={`prose prose-slate dark:prose-invert max-w-none prose-yellow prose-headings:font-bold prose-headings:tracking-tight prose-img:rounded-2xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-white/10 prose-a:text-[#EBFF00] ${
              fontFamily === "serif" ? "font-serif leading-loose" : "font-sans leading-relaxed"
            } ${
              fontSize === "sm"
                ? "text-[15px] prose-sm"
                : fontSize === "lg"
                ? "text-[19px] prose-lg"
                : "text-[17px] prose-base"
            }`}
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

        {/* Desktop Sticky Vocabulary Sidebar with Independent Scroll */}
        {vocabList.length > 0 && (
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-20 self-start">
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-5 xl:p-6 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#EBFF00]" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    SAT Vocabulary
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                  {vocabList.length}
                </span>
              </div>

              {/* Vocab Filter */}
              <div className="relative mb-3 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter vocabulary..."
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#EBFF00]"
                />
              </div>

              {/* Vocabulary Items List with Independent Scroll */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 overscroll-contain">
                {filteredVocab.length === 0 ? (
                  <p className="text-xs text-center py-6 text-slate-400">
                    No vocabulary matches "{vocabSearch}"
                  </p>
                ) : (
                  filteredVocab.map((v, i) => {
                    const isExpanded = activeVocab === i;
                    return (
                      <div
                        key={i}
                        id={`vocab-sidebar-item-${i}`}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? "bg-white dark:bg-[#1a1a1a] border-[#EBFF00]/60 shadow-md"
                            : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15"
                        }`}
                      >
                        <button
                          onClick={() => setActiveVocab(isExpanded ? null : i)}
                          className="w-full text-left px-3.5 py-2.5 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white"
                        >
                          <span
                            className={
                              isExpanded
                                ? "text-[#EBFF00]"
                                : "text-slate-800 dark:text-slate-200"
                            }
                          >
                            {v.word}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {isExpanded ? "Hide" : "View"}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 animate-in fade-in duration-150">
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2.5">
                              {v.definition}
                            </p>
                            {v.context && (
                              <div className="bg-slate-100 dark:bg-black/30 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                  "{v.context}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Floating Action Button for Mobile Vocabulary Drawer */}
      {vocabList.length > 0 && (
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="xl:hidden fixed bottom-6 right-6 z-40 bg-[#EBFF00] text-slate-950 font-black px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-black/10 hover:scale-105 active:scale-95 transition-transform"
        >
          <BookOpen className="w-4 h-4" />
          <span>Vocab ({vocabList.length})</span>
        </button>
      )}

      {/* Mobile Vocabulary Slide-Up Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#EBFF00]" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Passage Vocabulary ({vocabList.length})
                </h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-white/10">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search words..."
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-[#EBFF00]"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {filteredVocab.map((v, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                >
                  <h4 className="font-bold text-sm text-[#EBFF00] capitalize mb-1">
                    {v.word}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">
                    {v.definition}
                  </p>
                  {v.context && (
                    <div className="bg-slate-100 dark:bg-black/30 p-2 rounded-lg text-[11px] text-slate-400 italic">
                      "{v.context}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
