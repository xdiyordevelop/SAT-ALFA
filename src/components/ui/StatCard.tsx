"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  color?: "primary" | "success" | "warning" | "danger";
}

const colorClasses = {
  primary:
    "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400",
  success:
    "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  warning:
    "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400",
  danger: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "primary",
}: StatCardProps) {
  return (
    <div className="group">
      <div className="bg-white dark:bg-[#131313] rounded-xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:border-yellow-400/50 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                trend.direction === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {trend.percentage}%
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
          {label}
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
