"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FileText, Users, Calendar } from "lucide-react";

interface AnalyticsFiltersProps {
  tests: { id: string; name: string }[];
  groups: { id: string; name: string }[];
  currentTest?: string;
  currentGroup?: string;
  currentTime?: string;
}

export function AnalyticsFilters({
  tests,
  groups,
  currentTest,
  currentGroup,
  currentTime,
}: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-5 flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 w-full">
        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Filter by Test
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={currentTest || "all"}
            onChange={(e) => updateFilter("testId", e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#131313] text-sm outline-none focus:border-yellow-500"
          >
            <option value="all">All Tests</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 w-full">
        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Filter by Group
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={currentGroup || "all"}
            onChange={(e) => updateFilter("groupId", e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#131313] text-sm outline-none focus:border-yellow-500"
          >
            <option value="all">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 w-full">
        <label className="block text-xs font-semibold text-slate-500 mb-1">
          Time Range
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={currentTime || "all"}
            onChange={(e) => updateFilter("timeRange", e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#131313] text-sm outline-none focus:border-yellow-500"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
