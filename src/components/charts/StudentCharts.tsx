"use client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
interface ProgressData {
  date: string;
  mathScore: number;
  englishScore: number;
}
interface SubjectPerformance {
  name: string;
  percentage: number;
  color: string;
}
export function ProgressChart({ data }: { data: ProgressData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {" "}
      <LineChart data={data}>
        {" "}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />{" "}
        <XAxis dataKey="date" stroke="#9ca3af" /> <YAxis stroke="#9ca3af" />{" "}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f3f4f6" }}
        />{" "}
        <Legend />{" "}
        <Line
          type="monotone"
          dataKey="mathScore"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={{ fill: "#4f46e5" }}
          name="Math"
        />{" "}
        <Line
          type="monotone"
          dataKey="englishScore"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: "#10b981" }}
          name="English"
        />{" "}
      </LineChart>{" "}
    </ResponsiveContainer>
  );
}
export function SubjectPerformanceChart({
  data,
}: {
  data: SubjectPerformance[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {" "}
      <BarChart data={data}>
        {" "}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />{" "}
        <XAxis dataKey="name" stroke="#9ca3af" /> <YAxis stroke="#9ca3af" />{" "}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f3f4f6" }}
        />{" "}
        <Bar dataKey="percentage" fill="#4f46e5" radius={[8, 8, 0, 0]} />{" "}
      </BarChart>{" "}
    </ResponsiveContainer>
  );
}
