"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScoreCard } from "./components/ScoreCard";
import { ReviewGrid } from "./components/ReviewGrid";
import { PerformanceBreakdown } from "./components/PerformanceBreakdown";
import { CertificateButton } from "./components/CertificateButton";
import { ArrowLeft } from "lucide-react";

interface TestResults {
  id: string;
  totalScore: number;
  rwScore: number;
  mathScore: number;
  rwRaw: number;
  mathRaw: number;
  completedAt: string;
  userAnswers: Record<string, string>;
  reviewIndex: Array<{
    questionId: string;
    module: number;
    questionNumber: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    domain?: string;
    skill?: string;
  }>;
  student: {
    firstName: string;
    lastName: string;
  };
  satTest: {
    name: string;
  };
}

export function ResultsPage(): React.ReactElement {
  const params = useParams();
  const attemptId = params.id as string;
  const [results, setResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/student/results/${attemptId}`);
        if (!response.ok) {
          throw new Error("Failed to load results");
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    if (attemptId) {
      fetchResults();
    }
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton count={5} height="h-24" width="w-full" className="mb-6" />
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-8 flex items-center justify-center">
        <Card className="max-w-md w-full bg-white dark:bg-[#131313] border-red-500/50">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Results
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || "Results not found"}
          </p>
          <Link href="/student/dashboard">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const completedDate = new Date(results.completedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-200 dark:border-white/10 p-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/student/dashboard" className="inline-block mb-6">
            <Button variant="secondary" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Test Results
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {results.student.firstName} {results.student.lastName} •{" "}
              {results.satTest.name}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Completed on {completedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Score Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ScoreCard
              label="Total Score"
              score={results.totalScore}
              maxScore={1600}
              variant="primary"
            />
            <ScoreCard
              label="Reading & Writing"
              score={results.rwScore}
              maxScore={800}
              raw={results.rwRaw}
              maxRaw={54}
              variant="secondary"
            />
            <ScoreCard
              label="Math"
              score={results.mathScore}
              maxScore={800}
              raw={results.mathRaw}
              maxRaw={44}
              variant="secondary"
            />
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-700/50 rounded-lg p-6 flex flex-col justify-center">
              <p className="text-emerald-600 text-sm font-bold mb-2">
                PERCENTILE
              </p>
              <p className="text-3xl font-bold text-emerald-700">
                {estimatePercentile(results.totalScore)}%
              </p>
              <p className="text-xs text-emerald-600 mt-2">Estimated ranking</p>
            </div>
          </div>

          {/* Performance Breakdown */}
          <PerformanceBreakdown reviewIndex={results.reviewIndex} />

          {/* Review Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Question Review
            </h2>
            <ReviewGrid reviewIndex={results.reviewIndex} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <CertificateButton results={results} />
            <Link href="/student/dashboard">
              <Button variant="secondary">Take Another Test</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return <ResultsPage />;
}

function estimatePercentile(totalScore: number): number {
  // Rough SAT percentile estimation (2024 scale)
  if (totalScore >= 1500) return 95;
  if (totalScore >= 1400) return 88;
  if (totalScore >= 1300) return 78;
  if (totalScore >= 1200) return 65;
  if (totalScore >= 1100) return 50;
  if (totalScore >= 1000) return 35;
  if (totalScore >= 900) return 20;
  return 10;
}
