"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ScoreAnalyticsChartProps {
  data: {
    month: string;
    math: number;
    readingWriting: number;
  }[];
}

export default function ScoreAnalyticsChart({
  data,
}: ScoreAnalyticsChartProps) {
  const hasData = useMemo(
    () => data.some((d) => d.math > 0 || d.readingWriting > 0),
    [data],
  );

  const displayData = hasData
    ? data
    : [
        { month: "Jan", math: 500, readingWriting: 480 },
        { month: "Feb", math: 520, readingWriting: 510 },
        { month: "Mar", math: 550, readingWriting: 540 },
        { month: "Apr", math: 590, readingWriting: 580 },
        { month: "May", math: 620, readingWriting: 610 },
        { month: "Jun", math: 650, readingWriting: 630 },
      ];

  return (
    <div className="w-full h-[300px] relative mt-4">
      {!hasData && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]/40 backdrop-blur-[2px] rounded-xl border border-slate-200 dark:border-white/10/50">
          <p className="text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-[#131313] px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 shadow-xl text-sm">
            Analytics will calibrate as students complete tests
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={displayData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRW" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[400, 800]}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "8px",
              color: "#f8fafc",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
            }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="math"
            name="Math"
            stroke="#818cf8"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMath)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "#818cf8" }}
          />
          <Area
            type="monotone"
            dataKey="readingWriting"
            name="Reading & Writing"
            stroke="#34d399"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRW)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "#34d399" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
