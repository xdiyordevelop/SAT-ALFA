"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  Brain,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Target,
  Check,
  AlertTriangle,
  Play,
} from "lucide-react";

interface MetricsData {
  latestScore: number | null;
  latestMathScore?: number | null;
  latestEnglishScore?: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  averageScore: number | null;
  totalTests: number;
  scoreTrend?: {
    date: string;
    score: number;
    mathScore?: number;
    englishScore?: number;
    testName: string;
  }[];
  tests: any[];
}

interface StudentDashboardContentProps {
  studentId: string;
  studentName: string;
  metrics: MetricsData;
  pendingTestsCount: number;
}

export function StudentDashboardContent({
  studentId,
  studentName,
  metrics,
  pendingTestsCount,
}: StudentDashboardContentProps) {
  if (!studentId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
      </div>
    );
  }

  // Extract latest approved test analysis if available
  const latestApprovedTest = metrics.tests?.[0] || null;
  let latestAnalysis: any = null;

  if (latestApprovedTest?.notes) {
    try {
      const parsed = JSON.parse(latestApprovedTest.notes);
      latestAnalysis = parsed.analysis || parsed;
    } catch {
      // plain text
    }
  }

  const mathScore =
    metrics.latestMathScore ||
    latestApprovedTest?.mathScore ||
    latestAnalysis?.mathScore ||
    null;
  const englishScore =
    metrics.latestEnglishScore ||
    latestApprovedTest?.englishScore ||
    latestAnalysis?.englishScore ||
    null;
  const strengths: string[] = latestAnalysis?.strengths || [];
  const weaknesses: string[] = latestAnalysis?.weaknesses || [];
  const recommendations: string[] = latestAnalysis?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {studentName} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your official SAT scores, AI diagnostics, and recommended
            study plan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/student/mock-tests"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] hover:bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 font-medium text-sm transition-colors shadow-sm"
          >
            <Brain className="w-4 h-4 text-slate-900 dark:text-yellow-500" />{" "}
            Take Mock Test
          </Link>
        </div>
      </div>
    </div>
  );
}
