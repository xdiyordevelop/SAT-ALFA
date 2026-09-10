"use client";

import React, { useMemo } from "react";
import { renderMathInText } from "@/lib/math-renderer";
import { Marked } from "marked";

const customMarked = new Marked({
  renderer: {
    image({ href, text, title }) {
      const caption = text
        ? `<span class="block text-center text-xs text-slate-500 dark:text-slate-400 mt-2.5 italic font-sans">${text}</span>`
        : "";
      return `<span class="article-image-wrapper block my-6 text-center"><img src="${href}" alt="${text || ""}" title="${title || ""}" class="article-image max-h-[440px] w-auto max-w-full mx-auto object-contain rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg cursor-pointer hover:opacity-95 transition-all" loading="lazy" />${caption}</span>`;
    },
  },
});

interface MathRendererProps {
  /** Raw text that may contain LaTeX delimiters */
  text: string;
  className?: string;
  /** Use <span> instead of <div> for inline contexts */
  inline?: boolean;
}

/**
 * Renders a string that may contain LaTeX math expressions and Markdown.
 * Supports \( \), \[ \], $ $, $$ $$ delimiters via KaTeX.
 * Falls back to plain text on any KaTeX error.
 */
export function MathRenderer({
  text,
  className,
  inline = false,
}: MathRendererProps) {
  const html = useMemo(() => {
    const { html: mathHtml } = renderMathInText(text ?? "");

    // Parse the result as markdown (keeps KaTeX HTML intact)
    try {
      if (inline) {
        return customMarked.parseInline(mathHtml, { async: false }) as string;
      }
      return customMarked.parse(mathHtml, { async: false }) as string;
    } catch {
      return mathHtml;
    }
  }, [text, inline]);

  if (inline) {
    return (
      <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
