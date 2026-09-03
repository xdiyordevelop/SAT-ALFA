"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore: number;
  raw?: number;
  maxRaw?: number;
  variant: "primary" | "secondary";
}

export function ScoreCard({
  label,
  score,
  maxScore,
  raw,
  maxRaw,
  variant,
}: ScoreCardProps): React.ReactElement {
  const percentage = (score / maxScore) * 100;
  const bgClass =
    variant === "primary"
      ? "bg-gradient-to-br from-[#EBFF00]/50/40 to-[#000000]/40 border-yellow-600/50"
      : "bg-gradient-to-br from-blue-900/40 to-blue-950/40 border-blue-600/50";
  const textClass =
    variant === "primary"
      ? "text-slate-900 dark:text-[#EBFF00]"
      : "text-blue-600";
  const labelClass =
    variant === "primary" ? "text-[#d9ff00]" : "text-blue-700";

  return (
    <Card
      className={`${bgClass} border p-6 flex flex-col justify-between h-full`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p
            className={`text-sm font-bold ${labelClass} uppercase tracking-wide`}
          >
            {label}
          </p>
        </div>
        <TrendingUp className={`w-5 h-5 ${textClass}`} />
      </div>

      {/* Score Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-bold ${textClass}`}>{score}</span>
          <span className={`text-lg ${textClass}/60`}>/ {maxScore}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-2 bg-slate-100 dark:bg-[#1c1b1b] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              variant === "primary"
                ? "bg-gradient-to-r from-[#EBFF00] to-yellow-300"
                : "bg-gradient-to-r from-blue-400 to-blue-300"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Raw Score (if provided) */}
      {raw !== undefined && maxRaw && (
        <div className="pt-2 border-t border-slate-200 dark:border-white/10/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Raw Score
          </p>
          <p className={`text-sm font-bold ${textClass}`}>
            {raw} / {maxRaw}
          </p>
        </div>
      )}

      {/* Percentage */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/10/50 mt-2">
        <p className={`text-xs font-bold ${textClass}`}>
          {Math.round(percentage)}%
        </p>
      </div>
    </Card>
  );
}
