"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  LineChart,
  Line,
  Pie,
  Cell,
} from "recharts";
import type { AnalyticsSummary } from "@/app/admin/mock-tests/types/analytics";

interface PerformanceBenchmarksProps {
  analytics: AnalyticsSummary;
}

export function PerformanceBenchmarks({
  analytics,
}: PerformanceBenchmarksProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
      {/* Score Distribution */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.scoreDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark-stroke="#334155" />
            <XAxis
              dataKey="range"
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              formatter={(value) => `${value} students`}
            />
            <Bar dataKey="count" fill="#EBFF00" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Completion Rate */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Completion Rate
        </h3>
        <div className="relative flex items-center justify-center h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Completed",
                    value: analytics.completedAttempts,
                  },
                  {
                    name: "Incomplete",
                    value:
                      analytics.totalAttempts - analytics.completedAttempts,
                  },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#EBFF00" />
                <Cell fill="#cbd5e1" opacity={0.3} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                itemStyle={{ color: "#f8fafc" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
              {Math.round(analytics.completionRate)}%
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Completions Over Time */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Completions Over Time
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analytics.completionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              itemStyle={{ color: "#f8fafc" }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#EBFF00"
              strokeWidth={2}
              dot={{ r: 3, fill: "#EBFF00" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Average Scores */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Average Scores by Section
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              {
                section: "Reading & Writing",
                score: analytics.avgRWScore,
                max: 800,
              },
              {
                section: "Math",
                score: analytics.avgMathScore,
                max: 800,
              },
              {
                section: "Total",
                score: analytics.avgTotalScore,
                max: 1600,
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="section"
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
              itemStyle={{ color: "#f8fafc" }}
              formatter={(value) => Math.round(value as number)}
            />
            <Bar dataKey="score" fill="#EBFF00" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
