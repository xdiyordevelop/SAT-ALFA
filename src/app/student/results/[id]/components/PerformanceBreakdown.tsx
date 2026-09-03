"use client";
import React, { useMemo } from "react";
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
} from "recharts";

interface ReviewQuestion {
  questionId: string;
  module: number;
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  domain?: string;
  skill?: string;
}

interface PerformanceBreakdownProps {
  reviewIndex: ReviewQuestion[];
}

interface TopicStats {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export function PerformanceBreakdown({
  reviewIndex,
}: PerformanceBreakdownProps): React.ReactElement {
  const topicStats = useMemo(() => {
    const stats: Record<string, { correct: number; total: number }> = {};
    reviewIndex.forEach((q) => {
      const topic = q.domain || q.skill || "General";
      if (!stats[topic]) {
        stats[topic] = { correct: 0, total: 0 };
      }
      stats[topic].total++;
      if (q.isCorrect) {
        stats[topic].correct++;
      }
    });
    return Object.entries(stats)
      .map(([topic, data]) => ({
        topic,
        correct: data.correct,
        total: data.total,
        percentage: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [reviewIndex]);

  const moduleStats = useMemo(() => {
    const stats: Record<number, { correct: number; total: number }> = {};
    reviewIndex.forEach((q) => {
      if (!stats[q.module]) {
        stats[q.module] = { correct: 0, total: 0 };
      }
      stats[q.module].total++;
      if (q.isCorrect) {
        stats[q.module].correct++;
      }
    });
    return Object.entries(stats)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([module, data]) => ({
        module: getModuleLabel(parseInt(module)),
        correct: data.correct,
        total: data.total,
        percentage: Math.round((data.correct / data.total) * 100),
      }));
  }, [reviewIndex]);

  const strengths = topicStats.filter((t) => t.percentage >= 75);
  const weaknesses = topicStats.filter((t) => t.percentage < 60);

  return (
    <div className="space-y-8 mb-8">
      {/* Topic Performance Chart */}
      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-[#EBFF00] mb-6">
          Performance by Topic
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topicStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="topic"
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              formatter={(value) => `${value}%`}
            />
            <Bar dataKey="percentage" fill="#FBBF24" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Module Performance */}
      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-[#EBFF00] mb-6">
          Module Performance
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={moduleStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="module"
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
              formatter={(value) => `${value}%`}
            />
            <Bar dataKey="percentage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border-emerald-700/50 p-6">
          <h4 className="text-lg font-bold text-emerald-600 mb-4">Strengths</h4>
          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {topic.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-[#1c1b1b] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-emerald-600 w-10 text-right">
                      {topic.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No strong topics yet
            </p>
          )}
        </Card>

        {/* Weaknesses */}
        <Card className="bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-700/50 p-6">
          <h4 className="text-lg font-bold text-red-600 mb-4">
            Areas to Improve
          </h4>
          {weaknesses.length > 0 ? (
            <div className="space-y-3">
              {weaknesses.map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {topic.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-[#1c1b1b] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400"
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-red-600 w-10 text-right">
                      {topic.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Great work! No weak areas identified.
            </p>
          )}
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-slate-50 dark:bg-[#0a0a0a] border-yellow-600/30 p-6">
        <h4 className="text-lg font-bold text-slate-900 dark:text-[#EBFF00] mb-4">
          📊 Key Insights
        </h4>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
          <li className="flex gap-2">
            <span className="text-slate-900 dark:text-[#EBFF00]">•</span>
            <span>
              {" "}
              Overall accuracy:{" "}
              <strong>
                {Math.round(
                  (reviewIndex.filter((q) => q.isCorrect).length /
                    reviewIndex.length) *
                    100,
                )}
                %
              </strong>{" "}
              ({reviewIndex.filter((q) => q.isCorrect).length} /{" "}
              {reviewIndex.length} questions)
            </span>
          </li>
          {strengths.length > 0 && (
            <li className="flex gap-2">
              <span className="text-emerald-600">•</span>
              <span>
                {" "}
                You're excelling in <strong>{strengths[0].topic}</strong> (
                {strengths[0].percentage}%)
              </span>
            </li>
          )}
          {weaknesses.length > 0 && (
            <li className="flex gap-2">
              <span className="text-red-600">•</span>
              <span>
                {" "}
                Focus on <strong>{weaknesses[0].topic}</strong> for improvement
                ({weaknesses[0].percentage}%)
              </span>
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function getModuleLabel(module: number): string {
  const labels: Record<number, string> = {
    1: "R&W 1",
    2: "R&W 2",
    3: "Math 1",
    4: "Math 2",
  };
  return labels[module] || `Module ${module}`;
}
