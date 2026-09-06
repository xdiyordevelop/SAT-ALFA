'use client';

import React, { useState } from 'react';
import { Radio, BarChart3, Users, Clock, AlertCircle } from 'lucide-react';
import { ProctoredControlRoom } from '../ProctoredControlRoom';
import { CohortAnalyticsView } from './CohortAnalyticsView';
import type { CohortAnalyticsResult } from '@/server/actions/proctor-analytics';

interface ProctorSessionWorkspaceProps {
  sessionId: string;
  initialSession: any;
  adminUsername: string;
  cohortData: CohortAnalyticsResult | null;
}

export function ProctorSessionWorkspace({
  sessionId,
  initialSession,
  adminUsername,
  cohortData,
}: ProctorSessionWorkspaceProps) {
  // Default to analytics if session is completed, otherwise live monitor
  const isCompleted = initialSession.status === 'COMPLETED';
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'ANALYTICS'>(
    isCompleted ? 'ANALYTICS' : 'MONITOR'
  );

  return (
    <div className="space-y-6">
      {/* Workspace Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 gap-4 flex-wrap print:hidden">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('MONITOR')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MONITOR'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-[#EBFF00] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                initialSession.status === 'ACTIVE'
                  ? 'text-emerald-500 animate-pulse'
                  : 'text-slate-400'
              }`}
            />
            Live Monitor
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-[#EBFF00] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#EBFF00]" />
            Cohort Analytics & Domain Breakdown
            {cohortData && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#EBFF00]/20 text-slate-900 dark:text-[#EBFF00]">
                {cohortData.metrics.completedCount}/{cohortData.metrics.totalEnrolled}
              </span>
            )}
          </button>
        </div>

        {isCompleted && (
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Session Completed • Cohort Report Ready
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'MONITOR' ? (
        <ProctoredControlRoom
          sessionId={sessionId}
          initialSession={initialSession}
          adminUsername={adminUsername}
        />
      ) : cohortData ? (
        <CohortAnalyticsView
          initialData={cohortData}
          sessionId={sessionId}
        />
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Cohort Analytics Not Available Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No completed attempts have been recorded for this session. As soon as students finish their exam, group metrics and domain breakdowns will populate here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
