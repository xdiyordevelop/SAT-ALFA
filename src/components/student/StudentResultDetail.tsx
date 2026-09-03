"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  Check,
  Brain,
} from "lucide-react";

interface StudentResultDetailProps {
  test: any;
  analysis: any;
}

export function StudentResultDetail({
  test,
  analysis,
}: StudentResultDetailProps) {
  const totalScore =
    test.totalScore || test.score || (analysis?.totalScore ?? 0);
  const mathScore = test.mathScore || analysis?.mathScore || null;
  const englishScore = test.englishScore || analysis?.englishScore || null;

  const strengths: string[] = analysis?.strengths || [];
  const weaknesses: string[] = analysis?.weaknesses || [];
  const recommendations: string[] = analysis?.recommendations || [];
  const studyPriorities: string[] = analysis?.studyPriorities || [];
  const nextSteps: string[] = analysis?.nextSteps || [];
  const overallInsight =
    analysis?.overallInsight ||
    analysis?.summary ||
    "Comprehensive SAT performance analysis.";

  // Topic performances
  const topicList =
    test.performances?.map((p: any) => ({
      name: p.topic?.title || "Topic",
      subject: p.topic?.subject || "General",
      percentage: p.percentage,
    })) ||
    (analysis?.detailedTopics
      ? analysis.detailedTopics.map((dt: any) => ({
          name: dt.name,
          subject: dt.subject,
          percentage: dt.percentCorrect,
        }))
      : analysis?.topicPerformance
        ? Object.entries(analysis.topicPerformance).map(([name, pct]) => ({
            name,
            subject:
              name.toLowerCase().includes("math") ||
              name.toLowerCase().includes("algebra")
                ? "Math"
                : "English",
            percentage: Number(pct),
          }))
        : []);

  return (
    <div className="space-y-8">
      {/* Top Back Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/student/mock-tests"
          className="inline-flex items-center gap-2 text-slate-900 dark:text-[#EBFF00] hover:text-[#d9ff00] font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Mock Tests
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 ">
          <CheckCircle2 className="w-4 h-4" />
          Official Approved Result
        </span>
      </div>

      {/* Hero Test Card */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBFF00]/10 dark:bg-[#EBFF00]/50/30 text-[#d9ff00] uppercase tracking-wider">
              {test.subject || "SAT Mock Test"}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {test.testName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(test.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {test.duration || 180} minutes
              </span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-center min-w-[160px]">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              SAT Scaled Score
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-[#EBFF00] ">
              {totalScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              out of 1600
            </span>
          </div>
        </div>
      </div>

      {/* SAT Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Score Card */}
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl p-6 text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-yellow-200">
                Total Score
              </span>
              <Award className="w-6 h-6 text-yellow-200" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-extrabold tracking-tight">
                {totalScore}
              </span>
              <span className="text-yellow-200 text-lg">/ 1600</span>
            </div>
            <div className="w-full bg-[#EBFF00]/50/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white dark:bg-[#131313] h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, ((totalScore - 400) / 1200) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Math Score Card */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 ">
              Math Section Score
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 ">
              200–800
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white ">
              {mathScore || "—"}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              / 800
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1c1b1b] rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${mathScore ? Math.min(100, ((mathScore - 200) / 600) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Reading & Writing Score Card */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 ">
              Reading & Writing Score
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 ">
              200–800
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white ">
              {englishScore || "—"}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              / 800
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1c1b1b] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#EBFF00] h-2 rounded-full transition-all duration-500"
              style={{
                width: `${englishScore ? Math.min(100, ((englishScore - 200) / 600) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Topic Performance Breakdown */}
      {topicList.length > 0 && (
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-900 dark:text-[#EBFF00] " />
            SAT Topic Performance Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicList.map((topic: any, idx: number) => {
              const isHigh = topic.percentage >= 80;
              const isMedium = topic.percentage >= 70 && topic.percentage < 80;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white ">
                        {topic.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        ({topic.subject})
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isHigh
                          ? "text-green-600 "
                          : isMedium
                          ? "text-slate-900 dark:text-[#EBFF00] "
                          : "text-red-600 "
                      }`}
                    >
                      {topic.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isHigh ? "bg-green-500" : isMedium ? "bg-[#EBFF00]" : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, topic.percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 ">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
              Your Strong Points
            </h3>
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-2.5">
              {strengths.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50/50 border border-green-100 text-sm text-green-900 "
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              Keep practicing to establish high-confidence strong areas.
            </p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 ">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white ">
              Areas to Improve
            </h3>
          </div>

          {weaknesses.length > 0 ? (
            <ul className="space-y-2.5">
              {weaknesses.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50/50 border border-red-100 text-sm text-red-900 "
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No significant weaknesses found! Excellent performance.
            </p>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#EBFF00] to-violet-600 flex items-center justify-center text-slate-900 dark:text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white ">
              Personalized AI Study Recommendations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 ">
              Tailored study plan based on your SAT results
            </p>
          </div>
        </div>

        {/* Insight Overview */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-[#EBFF00]/10 ">
          <p className="text-sm text-indigo-950 leading-relaxed font-medium">
            {overallInsight}
          </p>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-slate-200 "
              >
                <div className="w-6 h-6 rounded-full bg-[#EBFF00]/10 dark:bg-[#EBFF00]/50/30 text-[#d9ff00] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div className="pt-4 border-t border-slate-100 ">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Suggested Next Actions
            </h4>
            <ul className="space-y-2">
              {nextSteps.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EBFF00] " />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
