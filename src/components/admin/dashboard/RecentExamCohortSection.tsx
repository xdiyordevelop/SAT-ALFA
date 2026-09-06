'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Award,
  Target,
  Users,
  Radio,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Calculator,
  ChevronRight,
} from 'lucide-react';
import type { CohortAnalyticsResult } from '@/server/actions/proctor-analytics';

export interface RecentSessionSummary {
  id: string;
  code: string;
  testId: string;
  testName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'REVOKED';
  createdAt: string;
  participantCount: number;
  completedCount: number;
  avgScore: number;
}

interface RecentExamCohortSectionProps {
  recentSessions: RecentSessionSummary[];
  initialFeaturedCohort: CohortAnalyticsResult | null;
}

export function RecentExamCohortSection({
  recentSessions,
  initialFeaturedCohort,
}: RecentExamCohortSectionProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialFeaturedCohort?.session.id || recentSessions[0]?.id || ''
  );
  const [cohortData, setCohortData] = useState<CohortAnalyticsResult | null>(
    initialFeaturedCohort
  );
  const [isLoadingCohort, setIsLoadingCohort] = useState(false);

  // Switch selected session
  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === selectedSessionId && cohortData) return;
    setSelectedSessionId(sessionId);
    setIsLoadingCohort(true);
    try {
      const res = await fetch(`/api/admin/proctored-sessions/${sessionId}/cohort-analytics`);
      if (res.ok) {
        const data = await res.json();
        setCohortData(data);
      }
    } catch (err) {
      console.error('Failed to load session cohort data:', err);
    } finally {
      setIsLoadingCohort(false);
    }
  };

  if (recentSessions.length === 0) {
    return (
      <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EBFF00]/10 border border-[#EBFF00]/30 flex items-center justify-center mx-auto text-neutral-900 dark:text-[#EBFF00]">
          <BarChart3 className="w-6 h-6 text-neutral-900 dark:text-[#EBFF00]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-neutral-900 dark:text-white">
            No Exam Sessions Conducted Yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-1">
            When you launch and complete live proctored mock examinations, comprehensive group performance, weak & strong topics, and SAT domain breakdowns will appear here automatically.
          </p>
        </div>
        <div>
          <Link
            href="/admin/mock-tests/proctor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-black text-xs font-bold transition-all"
          >
            Launch Live Exam Session
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const activeSessionItem = recentSessions.find((s) => s.id === selectedSessionId) || recentSessions[0];

  return (
    <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
      {/* Header & Session Pills Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#EBFF00]/10 border border-[#EBFF00]/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-neutral-900 dark:text-[#EBFF00]" />
            </div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">
              Latest Exam Cohort Performance & Domain Breakdown
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real student group outcomes, domain accuracy, and weakness hotspots from recent examinations
          </p>
        </div>

        {/* Quick link to all proctoring */}
        <Link
          href="/admin/mock-tests/proctor"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EBFF00] transition-colors self-start sm:self-auto"
        >
          <span>All Exam Rooms</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Session Selector Pills if multiple sessions exist */}
      {recentSessions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {recentSessions.map((s) => {
            const isSelected = s.id === selectedSessionId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSession(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-[#1C1B1B] text-white dark:text-[#EBFF00] border-neutral-900 dark:border-[#EBFF00]/40'
                    : 'bg-neutral-100 dark:bg-[#1C1B1B]/60 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10'
                }`}
              >
                {s.status === 'ACTIVE' ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                )}
                <span>{s.testName}</span>
                <span className="text-[10px] font-mono opacity-70">({s.code})</span>
                {s.avgScore > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EBFF00]/20 text-neutral-900 dark:text-[#EBFF00] font-black">
                    {s.avgScore}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Featured Exam Cohort Card */}
      {isLoadingCohort ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
          <div className="w-8 h-8 border-3 border-[#EBFF00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Loading cohort analytics...</span>
        </div>
      ) : cohortData ? (
        <div className="space-y-6">
          {/* Cohort Headline Stats Banner */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1C1B1B] border border-neutral-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {cohortData.session.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    <Radio className="w-3 h-3 animate-pulse" /> Live Session
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-neutral-200/60 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-neutral-300/60 dark:border-white/10 uppercase tracking-wider">
                    Completed
                  </span>
                )}
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">PIN: {cohortData.session.code}</span>
              </div>
              <h3 className="text-base font-black text-neutral-900 dark:text-white">
                {cohortData.session.testName}
              </h3>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Cohort Average
                </span>
                <span className="text-2xl font-black text-neutral-900 dark:text-[#EBFF00] tracking-tight">
                  {cohortData.metrics.avgTotalScore}
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 ml-1">/ 1600</span>
                </span>
              </div>

              <div className="hidden sm:block h-8 w-px bg-neutral-200 dark:bg-white/10" />

              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Turnout
                </span>
                <span className="text-lg font-black text-neutral-900 dark:text-white">
                  {cohortData.metrics.completedCount} / {cohortData.metrics.totalEnrolled}
                </span>
              </div>

              <Link
                href={`/admin/mock-tests/proctor/${cohortData.session.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-black text-xs font-black transition-all ml-auto md:ml-2"
              >
                <span>Full Cohort Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3-Column Performance Grid: Section Scores, Domain Breakdown, Weak/Strong Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Score Split & Accuracy */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                Score & Accuracy Split
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Reading & Writing Avg:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">
                    {cohortData.metrics.avgRWScore} / 800
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Math Section Avg:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">
                    {cohortData.metrics.avgMathScore} / 800
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Overall Accuracy:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {cohortData.metrics.overallAccuracy}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Score Range:</span>
                  <span className="font-medium text-neutral-500 dark:text-neutral-400 font-mono">
                    {cohortData.metrics.lowestScore} — {cohortData.metrics.highestScore}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Strongest Topics */}
            <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Top Strong Topics (Mastered)
              </div>

              {cohortData.strongSkills.length === 0 ? (
                <p className="text-xs text-neutral-400 italic pt-2">No skills above 70% accuracy.</p>
              ) : (
                <div className="space-y-1.5 pt-0.5">
                  {cohortData.strongSkills.slice(0, 3).map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/10"
                    >
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                        {s.skill}
                      </span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {s.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Priority Review Areas (Weak Points) */}
            <div className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Classroom Review Priorities
              </div>

              {cohortData.weakSkills.length === 0 ? (
                <p className="text-xs text-emerald-500 italic pt-2">No critical weak areas identified.</p>
              ) : (
                <div className="space-y-1.5 pt-0.5">
                  {cohortData.weakSkills.slice(0, 3).map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-rose-500/[0.07] border border-rose-500/10"
                    >
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-2">
                        {s.skill}
                      </span>
                      <span className="font-black text-rose-600 dark:text-rose-400 text-[11px]">
                        {s.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content Domain Accuracy Progress Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#EBFF00]" />
                Domain Accuracy Overview
              </h4>
              <span className="text-[11px] text-neutral-400">
                {cohortData.domainBreakdowns.length} SAT Content Domains
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cohortData.domainBreakdowns.slice(0, 4).map((d) => {
                const isStrong = d.accuracy >= 75;
                const isWeak = d.accuracy < 55;

                return (
                  <div
                    key={d.domain}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-bold text-neutral-900 dark:text-white line-clamp-1">
                        {d.domain}
                      </span>
                      <span
                        className={`text-xs font-black ${
                          isStrong
                            ? 'text-emerald-500 dark:text-[#EBFF00]'
                            : isWeak
                            ? 'text-rose-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {d.accuracy}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isStrong
                            ? 'bg-[#EBFF00]'
                            : isWeak
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(d.accuracy, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{d.section}</span>
                      <span>{d.correctCount}/{d.totalAttempts} correct</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Fallback if session has no attempts yet */
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#1C1B1B] border border-neutral-200 dark:border-white/10 text-center space-y-2">
          <p className="text-xs font-bold text-neutral-900 dark:text-white">
            {activeSessionItem.testName} (PIN: {activeSessionItem.code})
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {activeSessionItem.participantCount} students enrolled. No completed attempts submitted yet.
          </p>
          <Link
            href={`/admin/mock-tests/proctor/${activeSessionItem.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-black text-xs font-bold mt-2"
          >
            Open Live Room
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
