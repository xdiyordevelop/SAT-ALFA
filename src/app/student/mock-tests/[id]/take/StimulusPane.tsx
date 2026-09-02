"use client";

import React from "react";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Card } from "@/components/ui/Card";

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
  if (!passage && !imageUrl) {
    return (
      <Card accent>
        <p className="text-slate-500 dark:text-slate-400 italic">
          No stimulus provided for this question
        </p>
      </Card>
    );
  }

  return (
    <Card accent className="space-y-4">
      {/* Image Above (if applicable) */}
      {imageUrl && imagePosition === "above" && (
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]">
          <img
            src={imageUrl}
            alt="Stimulus image"
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Passage Text with Math Rendering */}
      {passage && (
        <MathRenderer
          text={passage}
          className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-serif"
        />
      )}

      {/* Image Below (if applicable) */}
      {imageUrl && imagePosition === "below" && (
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]">
          <img
            src={imageUrl}
            alt="Stimulus image"
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        </div>
      )}
    </Card>
  );
}
