"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { generateAIAnalysis } from "./actions";
import { Brain, TrendingUp, AlertCircle, Map } from "lucide-react";

export function AIAnalysisLoader({
  attemptId,
  reviewIndex,
}: {
  attemptId: string;
  reviewIndex: any[];
}) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const res = await generateAIAnalysis(attemptId);
        if (res.success) {
          setAnalysis(res.analysis);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [attemptId]);

  if (loading) {
    return (
      <Card className="p-6 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 print:hidden animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            AI Diagnostic Engine Generating...
          </h2>
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-8 bg-white dark:bg-[#131313] shadow-lg border border-slate-200 dark:border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#EBFF00]/15 rounded-xl border border-[#EBFF00]/30">
          <Brain className="w-6 h-6 text-slate-900 dark:text-[#EBFF00]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            AI Performance Diagnostic
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Gemini AI Diagnostic Engine
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-emerald-950 dark:text-emerald-300">
              Strong Points & Mastered Skills
            </h3>
          </div>
          <ul className="space-y-3">
            {analysis.strengths?.map((str: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-emerald-200/90 leading-relaxed"
              >
                <span className="mt-1 text-emerald-500 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-rose-500/5 dark:bg-rose-950/20 rounded-2xl p-6 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="font-bold text-rose-950 dark:text-rose-300">
              Target Areas for Improvement
            </h3>
          </div>
          <ul className="space-y-3">
            {analysis.weaknesses?.map((wk: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-rose-200/90 leading-relaxed"
              >
                <span className="mt-1 text-rose-500 font-bold">!</span>
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Roadmap */}
      {analysis.roadmap && analysis.roadmap.length > 0 && (
        <div className="mt-6 bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Actionable Study Roadmap
            </h3>
          </div>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {analysis.roadmap.map((rm: string, i: number) => (
              <li
                key={i}
                className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-[#131313] p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm"
              >
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#EBFF00]/15 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30 w-fit">
                  Step {i + 1}
                </span>
                <span className="leading-relaxed font-medium">{rm}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
