"use client";

import React, { useState } from "react";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Card } from "@/components/ui/Card";
import { ZoomIn, X } from "lucide-react";

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

  if (!passage && !imageUrl) {
    return (
      <Card accent>
        <p className="text-slate-500 dark:text-slate-400 italic">
          No stimulus provided for this question
        </p>
      </Card>
    );
  }

  const renderImage = () => {
    if (!imageUrl) return null;
    return (
      <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] flex justify-center items-center p-2">
        <img
          src={imageUrl}
          alt="Stimulus figure"
          className="max-h-[340px] w-auto max-w-full object-contain cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
          loading="lazy"
          onClick={() => setIsZoomed(true)}
        />
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
      <Card accent className="space-y-4">
        {/* Image Above */}
        {imageUrl && imagePosition === "above" && renderImage()}

        {/* Passage Text with Math Rendering */}
        {passage && (
          <MathRenderer
            text={passage}
            className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-[16px]"
          />
        )}

        {/* Image Below */}
        {imageUrl && imagePosition === "below" && renderImage()}
      </Card>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && imageUrl && (
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
              src={imageUrl}
              alt="Zoomed figure"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg mt-6"
            />
          </div>
        </div>
      )}
    </>
  );
}
