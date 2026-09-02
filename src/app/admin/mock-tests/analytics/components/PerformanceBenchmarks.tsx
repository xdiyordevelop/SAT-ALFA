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

const COLORS = ["#FBBF24", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export function PerformanceBenchmarks({
  analytics,
}: PerformanceBenchmarksProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Score Distribution */}
      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-6">
        <h3 className="text-lg font-bold text-amber-500 mb-6">
          Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.scoreDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
              }}
              formatter={(value) => `${value} students`}
            />
            <Bar dataKey="count" fill="#FBBF24" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Completion Rate */}
      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-6">
        <h3 className="text-lg font-bold text-amber-500 mb-6">
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
                <Cell fill="#10B981" />
                <Cell fill="#64748b" opacity={0.3} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#f8fafc" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
              {Math.round(analytics.completionRate)}%
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Completed
            </span>
          </div>
        </div>
      </Card>

      {/* Completions Over Time */}
      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-6 ">
        <h3 className="text-lg font-bold text-amber-500 mb-6">
          Completions Over Time
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analytics.completionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Average Scores */}

      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 shadow-sm rounded-2xl p-6 ">
        <h3 className="text-lg font-bold text-amber-500 mb-6">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
              }}
              formatter={(value) => Math.round(value as number)}
            />
            <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
