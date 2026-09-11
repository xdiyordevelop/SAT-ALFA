"use client";

import React from "react";
import { CheckCircle2, Award, ShieldCheck, BookOpen, Calculator } from "lucide-react";
import { calculateSatScaledScores } from "@/lib/sat/scoring-calc";

interface OfficialScoreReportProps {
  attempt: any;
  questions: any[];
  student: any;
}

export function getSATPercentile(score: number): number {
  if (score >= 1570) return 99;
  if (score >= 1530) return 99;
  if (score >= 1500) return 98;
  if (score >= 1450) return 96;
  if (score >= 1400) return 93;
  if (score >= 1350) return 90;
  if (score >= 1300) return 86;
  if (score >= 1250) return 81;
  if (score >= 1200) return 75;
  if (score >= 1150) return 68;
  if (score >= 1100) return 60;
  if (score >= 1050) return 51;
  if (score >= 1000) return 43;
  if (score >= 950) return 34;
  if (score >= 900) return 26;
  if (score >= 850) return 19;
  if (score >= 800) return 13;
  if (score >= 700) return 5;
  return 1;
}

export function OfficialScoreReport({
  attempt,
  questions,
  student,
}: OfficialScoreReportProps) {
  const isDisqualified = Boolean(attempt.proctorCode) && attempt.totalScore === 0 && Boolean((attempt.fullscreenExitCount || 0) >= 5);

  const reviewIndex: any[] = attempt.reviewIndex || [];
  const correctCount = reviewIndex.filter((r) => r.isCorrect).length;
  const totalCount = questions?.length || reviewIndex.length || 98;
  const unansweredCount = reviewIndex.filter((r) => !r.userAnswer).length;
  const incorrectCount = Math.max(0, totalCount - correctCount - unansweredCount);

  let fallbackScores = {
    totalScore: attempt.totalScore || 400,
    rwScore: attempt.rwScore || 200,
    mathScore: attempt.mathScore || 200,
  };

  if (!isDisqualified && (!attempt.totalScore || attempt.totalScore === 0) && reviewIndex.length > 0) {
    let rwC = 0, mathC = 0, rwT = 0, mathT = 0;
    reviewIndex.forEach((r: any) => {
      const isRW =
        r.module === "MODULE_1" ||
        r.module === "MODULE_2" ||
        r.module === 1 ||
        r.module === 2 ||
        String(r.module).includes("1") ||
        String(r.module).includes("2");
      if (isRW) { rwT++; if (r.isCorrect) rwC++; }
      else { mathT++; if (r.isCorrect) mathC++; }
    });
    fallbackScores = calculateSatScaledScores(rwC, mathC, rwT || 54, mathT || 44);
  }

  const totalScore = isDisqualified ? 0 : (attempt.totalScore && attempt.totalScore > 0 ? attempt.totalScore : fallbackScores.totalScore);
  const rwScore = isDisqualified ? 0 : (attempt.rwScore && attempt.rwScore > 0 ? attempt.rwScore : fallbackScores.rwScore);
  const mathScore = isDisqualified ? 0 : (attempt.mathScore && attempt.mathScore > 0 ? attempt.mathScore : fallbackScores.mathScore);
  const percentile = getSATPercentile(totalScore);

  // Benchmarks according to College Board
  const rwBenchmark = 480;
  const mathBenchmark = 530;
  const isRwMet = rwScore >= rwBenchmark;
  const isMathMet = mathScore >= mathBenchmark;

  // Domain Breakdown
  const rwDomains: Record<string, { correct: number; total: number }> = {};
  const mathDomains: Record<string, { correct: number; total: number }> = {};

  reviewIndex.forEach((r) => {
    const isRW =
      String(r.module).includes("1") ||
      String(r.module).includes("2") ||
      r.module === 1 ||
      r.module === 2;
    const target = isRW ? rwDomains : mathDomains;
    const d = r.domain || (isRW ? "Reading & Writing" : "Math");
    if (!target[d]) {
      target[d] = { correct: 0, total: 0 };
    }
    target[d].total++;
    if (r.isCorrect) target[d].correct++;
  });

  const getScoreBand = (percent: number) => {
    if (percent >= 85) return { band: "680–800", level: "Advanced" };
    if (percent >= 70) return { band: "610–670", level: "Proficient" };
    if (percent >= 55) return { band: "550–600", level: "Developing" };
    return { band: "Under 550", level: "Needs Focus" };
  };

  const formattedDate = attempt.completedAt
    ? new Date(attempt.completedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="bg-white text-slate-900 w-full max-w-[210mm] mx-auto p-6 sm:p-8 md:p-10 border border-slate-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-left font-sans score-report-print avoid-break">
      {/* 1. Header with Official Branding */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4 print:pb-2.5 print:mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-slate-950">
              SAT-ALFA
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white uppercase tracking-wider">
              Digital SAT®
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-0.5">
            Official Student Score Report
          </p>
        </div>

        <div className="text-right text-xs text-slate-500 space-y-0.5">
          <p>
            <strong className="text-slate-900">Report ID:</strong>{" "}
            {attempt.id.slice(0, 8).toUpperCase()}
          </p>
          <p>
            <strong className="text-slate-900">Test Date:</strong> {formattedDate}
          </p>
          <p>
            <strong className="text-slate-900">Format:</strong> Full-Length Digital Simulation
          </p>
        </div>
      </div>

      {/* 2. Student & Test Identification Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 print:p-2.5 print:mb-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-500 uppercase font-semibold text-[10px] block">
            Student Name
          </span>
          <strong className="text-slate-900 text-sm font-bold block truncate">
            {student.firstName} {student.lastName}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold text-[10px] block">
            Test Name
          </span>
          <strong className="text-slate-900 text-sm font-bold block truncate">
            {attempt.satTest?.name || "Practice Test"}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold text-[10px] block">
            Testing Center
          </span>
          <span className="text-slate-800 font-semibold block truncate">SAT-ALFA Academic</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold text-[10px] block">
            Administered
          </span>
          <span className="text-slate-800 font-semibold block truncate">Standard Digital Timing</span>
        </div>
      </div>

      {/* 3. Primary Score Showcase (College Board Authentic 3-Card Box) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4 print:mb-3">
        {/* Total Score Box */}
        <div className="border-2 border-slate-900 rounded-xl p-4 print:p-3 bg-slate-900 text-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase tracking-widest font-bold text-slate-300">
                Your Total Score
              </span>
              <Award className="w-4 h-4 text-[#EBFF00]" />
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#EBFF00] my-1">
              {totalScore}
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              400 – 1600 Total Scale
            </p>
          </div>
          <div className="pt-2.5 mt-2.5 border-t border-slate-800 text-[11px]">
            <span className="font-bold text-white">{percentile}th</span> Nationally Representative Percentile
          </div>
        </div>

        {/* Reading and Writing Section Score */}
        <div className="border border-slate-200 rounded-xl p-4 print:p-3 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Reading & Writing
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-1">
              {rwScore}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              200 – 800 Scale
            </p>
          </div>
          <div className="pt-2.5 mt-2.5 border-t border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium text-[11px]">Benchmark: {rwBenchmark}</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                isRwMet
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isRwMet ? "✓ Met Benchmark" : "Approaching"}
            </span>
          </div>
        </div>

        {/* Math Section Score */}
        <div className="border border-slate-200 rounded-xl p-4 print:p-3 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                Math Section
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-1">
              {mathScore}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              200 – 800 Scale
            </p>
          </div>
          <div className="pt-2.5 mt-2.5 border-t border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium text-[11px]">Benchmark: {mathBenchmark}</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                isMathMet
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isMathMet ? "✓ Met Benchmark" : "Approaching"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Accuracy & Question Counts Strip */}
      <div className="bg-slate-100 rounded-xl p-3 mb-4 print:p-2 print:mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600 uppercase text-[10px]">Accuracy Summary:</span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {correctCount} / {totalCount} ({Math.round((correctCount / Math.max(1, totalCount)) * 100)}%)
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <span className="text-emerald-700 font-bold">
            ✓ {correctCount} Correct
          </span>
          <span className="text-rose-700 font-bold">
            ✗ {incorrectCount} Incorrect
          </span>
          <span className="text-slate-600 font-bold">
            ○ {unansweredCount} Omitted
          </span>
        </div>
      </div>

      {/* 5. Domain Performance Matrix (2 Columns: R&W and Math) */}
      <div className="mb-4 print:mb-2.5">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 print:mb-1.5">
          Content Domain Performance & Score Bands
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:gap-2.5">
          {/* Reading & Writing Domains */}
          <div className="border border-slate-200 rounded-xl p-3.5 print:p-2.5 space-y-2.5 bg-white">
            <h4 className="text-[11px] font-bold text-blue-700 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Reading & Writing Domains
            </h4>
            {Object.keys(rwDomains).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No domain statistics available</p>
            ) : (
              Object.entries(rwDomains).map(([name, data]) => {
                const pct = Math.round((data.correct / Math.max(1, data.total)) * 100);
                const { band, level } = getScoreBand(pct);
                return (
                  <div key={name} className="space-y-0.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 text-[10px] sm:text-[11px] truncate max-w-[180px]">
                        {name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-mono text-slate-500">
                          {data.correct}/{data.total}
                        </span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[9px]">
                          {band}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Math Domains */}
          <div className="border border-slate-200 rounded-xl p-3.5 print:p-2.5 space-y-2.5 bg-white">
            <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> Math Domains
            </h4>
            {Object.keys(mathDomains).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No domain statistics available</p>
            ) : (
              Object.entries(mathDomains).map(([name, data]) => {
                const pct = Math.round((data.correct / Math.max(1, data.total)) * 100);
                const { band, level } = getScoreBand(pct);
                return (
                  <div key={name} className="space-y-0.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 text-[10px] sm:text-[11px] truncate max-w-[180px]">
                        {name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-mono text-slate-500">
                          {data.correct}/{data.total}
                        </span>
                        <span className="font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[9px]">
                          {band}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 6. Verification Notice & Seal Footer */}
      <div className="pt-3 print:pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-[9.5px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <p className="max-w-md leading-tight">
            Verified SAT Simulation Report. Scoring conforms to College Board standard conversion metrics. SAT is a registered trademark of the College Board.
          </p>
        </div>
        <div className="text-right whitespace-nowrap">
          <p className="font-bold text-slate-800">SAT-ALFA Testing Authority</p>
          <p>sat-alfa.uz • Doc ID: #{attempt.id.slice(0, 10).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
