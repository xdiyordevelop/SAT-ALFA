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
    <Card className="p-8 bg-white dark:bg-[#131313] shadow border border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Brain className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          AI Performance Diagnostic
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-900">Strong Points</h3>
          </div>
          <ul className="space-y-3">
            {analysis.strengths.map((str: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-emerald-800"
              >
                <span className="mt-1 text-emerald-500">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-rose-50 rounded-xl p-6 border border-rose-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-rose-900">Areas for Improvement</h3>
          </div>
          <ul className="space-y-3">
            {analysis.weaknesses.map((wk: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-rose-800"
              >
                <span className="mt-1 text-rose-500">•</span>
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Roadmap */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-blue-900">Actionable Study Roadmap</h3>
        </div>
        <ul className="space-y-3">
          {analysis.roadmap.map((rm: string, i: number) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-blue-800 bg-white dark:bg-[#131313] p-3 rounded-lg border border-blue-100 shadow-sm"
            >
              <span className="font-bold text-blue-500">Step {i + 1}:</span>
              <span>{rm}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
