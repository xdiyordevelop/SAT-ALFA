'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Target,
  BookOpen,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  ShieldAlert,
  BarChart3,
  Award,
  Sparkles,
} from 'lucide-react';
import type {
  CohortAnalyticsResult,
  DomainBreakdown,
  SkillPerformance,
  MostMissedQuestion,
  ParticipantScoreRecord,
} from '@/server/actions/proctor-analytics';

interface CohortAnalyticsViewProps {
  initialData: CohortAnalyticsResult;
  sessionId: string;
}

export function CohortAnalyticsView({ initialData, sessionId }: CohortAnalyticsViewProps) {
  const [data, setData] = useState<CohortAnalyticsResult>(initialData);
  const [activeDomainTab, setActiveDomainTab] = useState<'ALL' | 'RW' | 'MATH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const { metrics, domainBreakdowns, strongSkills, weakSkills, mostMissedQuestions, participants, session } = data;

  // Filter domains by tab
  const filteredDomains = domainBreakdowns.filter((d) => {
    if (activeDomainTab === 'RW') return d.section === 'Reading & Writing';
    if (activeDomainTab === 'MATH') return d.section === 'Math';
    return true;
  });

  // Filter students by search
  const filteredParticipants = participants.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.studentName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.groupName.toLowerCase().includes(q)
    );
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Rank,Student Name,Email,Group,Total Score,RW Score,Math Score,Accuracy %,Violations,Status'];
    const rows = participants.map((p, idx) =>
      [
        idx + 1,
        `"${p.studentName}"`,
        `"${p.email}"`,
        `"${p.groupName}"`,
        p.totalScore ?? 'N/A',
        p.rwScore ?? 'N/A',
        p.mathScore ?? 'N/A',
        p.accuracy !== null ? `${p.accuracy}%` : 'N/A',
        p.fullscreenExitCount,
        p.status,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cohort_${session.code}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      {/* Top Banner / Session Overview & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#EBFF00]/20 text-neutral-900 dark:text-[#EBFF00] border border-[#EBFF00]/40">
              Cohort Performance Analytics
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              Session PIN: <strong className="text-neutral-900 dark:text-white">{session.code}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1.5">
            {session.testName} — Group Cohort Report
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {metrics.completedCount} of {metrics.totalEnrolled} students submitted • Cohort Average: {metrics.avgTotalScore} pts
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-black transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4 text-[#EBFF00]" />
          </div>
          <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {metrics.avgTotalScore}
            <span className="text-xs font-normal text-neutral-400 ml-1">/ 1600</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 flex items-center justify-between">
            <span>R&W: <strong className="text-neutral-700 dark:text-neutral-200">{metrics.avgRWScore}</strong></span>
            <span>Math: <strong className="text-neutral-700 dark:text-neutral-200">{metrics.avgMathScore}</strong></span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Accuracy</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {metrics.overallAccuracy}%
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Correctly answered across all test questions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Score Spread</span>
            <TrendingUp className="w-4 h-4 text-neutral-700 dark:text-[#EBFF00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {metrics.lowestScore} — {metrics.highestScore}
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Lowest to highest achieved student scores
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Turnout</span>
            <Users className="w-4 h-4 text-neutral-700 dark:text-[#EBFF00]" />
          </div>
          <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {metrics.completedCount}
            <span className="text-xs font-normal text-neutral-400 ml-1">/ {metrics.totalEnrolled}</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            {metrics.totalEnrolled > 0
              ? `${Math.round((metrics.completedCount / metrics.totalEnrolled) * 100)}% completion rate`
              : '0% completion rate'}
          </p>
        </div>
      </div>

      {/* SECTION 1: CONTENT DOMAIN BREAKDOWN */}
      <div className="rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-white/10">
          <div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#EBFF00]" />
              Content Domain Breakdown
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Classroom mastery and accuracy across official SAT subject domains
            </p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveDomainTab('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDomainTab === 'ALL'
                  ? 'bg-white dark:bg-[#1C1B1B] text-neutral-900 dark:text-[#EBFF00]'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All Domains ({domainBreakdowns.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDomainTab('RW')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDomainTab === 'RW'
                  ? 'bg-white dark:bg-[#1C1B1B] text-neutral-900 dark:text-[#EBFF00]'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Reading & Writing
            </button>
            <button
              type="button"
              onClick={() => setActiveDomainTab('MATH')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDomainTab === 'MATH'
                  ? 'bg-white dark:bg-[#1C1B1B] text-neutral-900 dark:text-[#EBFF00]'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Math
            </button>
          </div>
        </div>

        {filteredDomains.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-sm">
            No question domain metrics recorded for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDomains.map((d) => {
              const isMath = d.section === 'Math';
              const isStrong = d.benchmark === 'strong';
              const isWeak = d.benchmark === 'weak';

              return (
                <div
                  key={d.domain}
                  className="p-4 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isMath
                              ? 'bg-neutral-200/70 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-300/60 dark:border-white/10'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {d.section}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {d.questionCount} questions
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {d.domain}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-black ${
                          isStrong
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isWeak
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {d.accuracy}%
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {d.correctCount} / {d.totalAttempts} correct
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isStrong
                          ? 'bg-emerald-500'
                          : isWeak
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(d.accuracy, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5">
                    <span>Performance Status:</span>
                    <span
                      className={`font-semibold ${
                        isStrong
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isWeak
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isStrong
                        ? 'Strong Mastery'
                        : isWeak
                        ? 'Needs Review (Low Accuracy)'
                        : 'Moderate Proficiency'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: WEAK & STRONG POINTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Skills */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131313] border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Strong Mastery Topics
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {strongSkills.length} skills
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Skills where the cohort achieved $\ge 70\%$ accuracy rate
          </p>

          {strongSkills.length === 0 ? (
            <div className="p-6 rounded-xl bg-neutral-50 dark:bg-white/[0.02] text-center text-xs text-neutral-400">
              No skills reached $\ge 70\%$ benchmark yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {strongSkills.map((s, idx) => (
                <div
                  key={`${s.skill}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {s.skill}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{s.section}</span>
                      <span>•</span>
                      <span>{s.domain}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {s.accuracy}%
                    </span>
                    <div className="text-[10px] text-neutral-400">
                      {s.correctCount}/{s.totalAttempts} correct
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Skills */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131313] border border-rose-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Areas for Improvement (Weak Points)
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              {weakSkills.length} skills
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Skills with highest error rate (recommended for classroom recap)
          </p>

          {weakSkills.length === 0 ? (
            <div className="p-6 rounded-xl bg-neutral-50 dark:bg-white/[0.02] text-center text-xs text-emerald-500">
              Excellent! No severe weak skills identified in this cohort.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {weakSkills.map((s, idx) => (
                <div
                  key={`${s.skill}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-rose-500/[0.04] border border-rose-500/15"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {s.skill}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                      <span className="font-medium text-rose-600 dark:text-rose-400">{s.section}</span>
                      <span>•</span>
                      <span>{s.domain}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      {s.accuracy}%
                    </span>
                    <div className="text-[10px] text-neutral-400">
                      {s.totalAttempts - s.correctCount}/{s.totalAttempts} missed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: MOST MISSED QUESTIONS */}
      <div className="rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/10">
          <div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Top Missed Questions (Error Hotspots)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Questions that students struggled with the most, with explanations for classroom review
            </p>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            Top {mostMissedQuestions.length} Questions
          </span>
        </div>

        {mostMissedQuestions.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-xs">
            No question errors recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {mostMissedQuestions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.questionId;
              const moduleTitle =
                q.module <= 2
                  ? `Reading & Writing (Module ${q.module})`
                  : `Math (Module ${q.module - 2})`;

              return (
                <div
                  key={q.questionId}
                  className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#181818] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.questionId)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-100/50 dark:hover:bg-white/5 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">
                        {moduleTitle} • Question #{q.questionNumber}
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                        {q.domain} &gt; {q.skill}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {q.errorRate}% Missed ({q.incorrectCount}/{q.totalAttempts})
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-neutral-200 dark:border-white/10 space-y-3 bg-white dark:bg-[#0A0A0A]/40 text-xs">
                      {q.passage && (
                        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 italic border-l-2 border-[#EBFF00]">
                          {q.passage}
                        </div>
                      )}

                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white mb-1">
                          Question Prompt:
                        </div>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200"
                          dangerouslySetInnerHTML={{ __html: q.prompt }}
                        />
                      </div>

                      {q.options && typeof q.options === 'object' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {Object.entries(q.options).map(([optKey, optVal]) => {
                            const isCorrect = String(optKey).trim() === String(q.correctAnswer).trim();
                            return (
                              <div
                                key={optKey}
                                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                                    : 'bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400'
                                }`}
                              >
                                <span className="font-black w-5">{optKey}:</span>
                                <span>{String(optVal)}</span>
                                {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-[#EBFF00]/5 border border-[#EBFF00]/20 space-y-1">
                        <div className="font-bold text-neutral-900 dark:text-[#EBFF00] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Correct Answer: <span className="font-mono">{q.correctAnswer}</span>
                        </div>
                        {q.explanation && (
                          <div className="text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: STUDENT RESULTS SCOREBOARD */}
      <div className="rounded-2xl bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-neutral-100 dark:border-white/10">
          <div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-neutral-700 dark:text-[#EBFF00]" />
              Cohort Scoreboard & Student Roster
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Comprehensive list of all students who took this live proctored examination
            </p>
          </div>

          <div className="relative w-full sm:w-64 print:hidden">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#EBFF00]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/10 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Group</th>
                <th className="py-3 px-3 text-center">Total Score</th>
                <th className="py-3 px-3 text-center">R&W</th>
                <th className="py-3 px-3 text-center">Math</th>
                <th className="py-3 px-3 text-center">Accuracy</th>
                <th className="py-3 px-3 text-center">Security Violations</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-neutral-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => (
                  <tr key={p.participantId} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {p.studentName}
                      </div>
                      <div className="text-[10px] text-neutral-400">{p.email}</div>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                      {p.groupName}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.totalScore !== null ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-[#EBFF00]/20 text-neutral-900 dark:text-[#EBFF00] border border-[#EBFF00]/40">
                          {p.totalScore}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-neutral-700 dark:text-neutral-200">
                      {p.rwScore ?? '—'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-neutral-700 dark:text-neutral-200">
                      {p.mathScore ?? '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.accuracy !== null ? (
                        <span
                          className={`font-black ${
                            p.accuracy >= 75
                              ? 'text-emerald-500'
                              : p.accuracy < 55
                              ? 'text-rose-500'
                              : 'text-amber-500'
                          }`}
                        >
                          {p.accuracy}%
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.fullscreenExitCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          {p.fullscreenExitCount} exits
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-medium">Clean (0)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.attemptId ? (
                        <Link
                          href={`/admin/mock-tests/results/${p.attemptId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-700 dark:text-white transition-colors"
                        >
                          Review
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-neutral-400 italic">Not submitted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
