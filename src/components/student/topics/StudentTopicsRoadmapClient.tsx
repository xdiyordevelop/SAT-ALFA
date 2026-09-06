"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  PlayCircle,
  Book,
  CheckCircle2,
  Search,
  X,
  Clock,
  Sparkles,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";

export type GroupTopicItem = {
  id: string;
  order: number;
  isApproved: boolean;
  approvedAt: Date | string | null;
  topic: {
    id: string;
    title: string;
    subject: string;
    description: string | null;
    bookTitle: string | null;
    bookPdfPath: string | null;
    videoPath: string | null;
  };
};

interface StudentTopicsRoadmapClientProps {
  groupName: string;
  progress: GroupTopicItem[];
}

export function StudentTopicsRoadmapClient({
  groupName,
  progress,
}: StudentTopicsRoadmapClientProps) {
  const [subjectFilter, setSubjectFilter] = useState<"ALL" | "MATH" | "READING_WRITING">("ALL");
  const [search, setSearch] = useState("");

  const totalCount = progress.length;
  const unlockedCount = progress.filter((p) => p.isApproved).length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const mathCount = progress.filter((p) => p.topic.subject.toUpperCase() === "MATH").length;
  const rwCount = progress.filter((p) => {
    const s = p.topic.subject.toUpperCase();
    return s === "READING_WRITING" || s.includes("READ") || s.includes("WRIT") || s.includes("ENG");
  }).length;

  const filteredItems = useMemo(() => {
    return progress.filter((item) => {
      const subj = item.topic.subject.toUpperCase();
      const matchesSubject =
        subjectFilter === "ALL"
          ? true
          : subjectFilter === "MATH"
          ? subj === "MATH"
          : subj === "READING_WRITING" || subj.includes("READ") || subj.includes("WRIT") || subj.includes("ENG");

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.topic.title.toLowerCase().includes(q) ||
        (item.topic.description && item.topic.description.toLowerCase().includes(q));

      return matchesSubject && matchesSearch;
    });
  }, [progress, subjectFilter, search]);

  return (
    <div className="space-y-8">
      {/* Header & Class Progress Banner */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-black bg-[#EBFF00] px-2.5 py-0.5 rounded-md">
                Group: {groupName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Syllabus &amp; Lessons
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Course Learning Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Follow your class syllabus step-by-step. Watch theory lessons and download PDF materials to complete your practice homework.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 w-full lg:w-72 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Course Progress
              </span>
              <span className="text-xs font-black text-[#EBFF00] bg-[#EBFF00]/10 px-2 py-0.5 rounded">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className="bg-[#EBFF00] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#EBFF00]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {unlockedCount} Unlocked
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                {totalCount - unlockedCount} Upcoming
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Subject Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSubjectFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              subjectFilter === "ALL"
                ? "bg-white dark:bg-[#1f1f1f] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Lessons ({totalCount})
          </button>
          <button
            onClick={() => setSubjectFilter("MATH")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              subjectFilter === "MATH"
                ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Math ({mathCount})
          </button>
          <button
            onClick={() => setSubjectFilter("READING_WRITING")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              subjectFilter === "READING_WRITING"
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Reading &amp; Writing ({rwCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#EBFF00]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Roadmap Timeline */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <Layers className="w-10 h-10 mx-auto text-slate-400 opacity-40 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            No lessons match your filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
            Try clearing your search query or switching to another subject tab.
          </p>
          {(search || subjectFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setSubjectFilter("ALL");
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 sm:ml-6 space-y-6 sm:space-y-8 pb-4">
          {filteredItems.map((item, index) => {
            const isApproved = item.isApproved;
            const isMath = item.topic.subject.toUpperCase() === "MATH";

            return (
              <div key={item.id} className="relative pl-7 sm:pl-9">
                {/* Status Dot on Timeline */}
                <div
                  className={`absolute -left-[11px] top-6 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    isApproved
                      ? "border-emerald-500 bg-white dark:bg-[#131313] shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      : "border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-[#131313]"
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                  )}
                </div>

                {/* Card */}
                {isApproved ? (
                  <Link href={`/student/topics/${item.topic.id}`}>
                    <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 hover:border-[#EBFF00]/60 hover:shadow-lg transition-all cursor-pointer group">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                              Step {index + 1}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                isMath
                                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              }`}
                            >
                              {item.topic.subject}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              Unlocked
                            </span>
                          </div>

                          <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#EBFF00] transition-colors leading-snug">
                            {item.topic.title}
                          </h3>

                          {item.topic.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {item.topic.description}
                            </p>
                          )}
                        </div>

                        {/* Media Badges & Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            {item.topic.videoPath && (
                              <span
                                className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#EBFF00] hover:bg-[#EBFF00]/10 transition-colors"
                                title="Video lesson available"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </span>
                            )}
                            {(item.topic.bookTitle || item.topic.bookPdfPath) && (
                              <span
                                className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#EBFF00] hover:bg-[#EBFF00]/10 transition-colors"
                                title="Reference book & PDF practice material"
                              >
                                <FileText className="w-4 h-4" />
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-[#EBFF00] transition-colors">
                            <span>Open Lesson</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  /* Locked Card */
                  <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-5 sm:p-6 opacity-70">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                            Step {index + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-slate-500">
                            {item.topic.subject}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-500 dark:text-slate-400">
                          {item.topic.title}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-1">
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>This lesson will unlock when your teacher approves it for the group.</span>
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-200 dark:bg-white/5 rounded-xl text-slate-400 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
