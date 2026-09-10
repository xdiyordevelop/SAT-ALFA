"use client";

import React, { useState, useMemo } from "react";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Card } from "@/components/ui/Card";
import { ZoomIn, X } from "lucide-react";

import { useTestContext } from "../context/TestContext";

interface StimulusPaneProps {
  passage?: string;
  imageUrl?: string;
  imagePosition?: "above" | "below";
}

export function StimulusPane({
  passage,
  imageUrl,
  imagePosition = "above",
}: StimulusPaneProps): React.ReactElement {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { fontSize } = useTestContext();

  const isLarge = fontSize === "large";

  // Normalize image URL
  const resolvedImageUrl = useMemo(() => {
    if (!imageUrl) return null;
    const trimmed = imageUrl.trim();
    if (!trimmed) return null;
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed;
    }
    return `/uploads/questions/${trimmed}`;
  }, [imageUrl]);

  if (!passage && !resolvedImageUrl) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400 dark:text-zinc-500 italic text-base">
          No stimulus provided for this question
        </p>
      </div>
    );
  }

  const renderImage = () => {
    if (!resolvedImageUrl || imageError) return null;
    return (
      <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-center items-center p-3 my-4 shadow-sm">
        <img
          src={resolvedImageUrl}
          alt="Stimulus figure"
          className="max-h-[380px] w-auto max-w-full object-contain cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
          loading="lazy"
          onClick={() => setIsZoomed(true)}
          onError={() => setImageError(true)}
        />
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shadow-md"
          title="Click to zoom figure"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Zoom</span>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 text-slate-900 dark:text-slate-100 select-text">
        {/* Image Above */}
        {resolvedImageUrl && imagePosition === "above" && renderImage()}

        {/* Passage Text with Math & Markdown Rendering - Bluebook Typography */}
        {passage && (
          <div
            className={`font-serif tracking-normal text-slate-900 dark:text-slate-100 antialiased ${
              isLarge
                ? "text-[21px] lg:text-[22px] leading-[1.85]"
                : "text-[18.5px] lg:text-[19px] leading-[1.8]"
            }`}
          >
            <MathRenderer
              text={passage}
              className={`max-w-none text-slate-900 dark:text-slate-100 ${
                isLarge
                  ? "text-[21px] lg:text-[22px] leading-[1.85] [&_p]:text-[21px] [&_p]:lg:text-[22px] [&_p]:leading-[1.85] [&_p]:mb-5"
                  : "text-[18.5px] lg:text-[19px] leading-[1.8] [&_p]:text-[18.5px] [&_p]:lg:text-[19px] [&_p]:leading-[1.8] [&_p]:mb-4"
              } [&_em]:italic [&_i]:italic [&_strong]:font-bold [&_b]:font-bold [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-4 [&_blockquote]:italic`}
            />
          </div>
        )}

        {/* Image Below */}
        {resolvedImageUrl && imagePosition === "below" && renderImage()}
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && resolvedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={resolvedImageUrl}
              alt="Zoomed figure"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg mt-6"
            />
          </div>
        </div>
      )}
    </>
  );
}
