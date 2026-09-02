"use client";
import { StatCard } from "@/components/ui/StatCard";
import { getIcon, IconKey } from "@/lib/icons";
interface StatCardWrapperProps {
  iconKey: IconKey;
  label: string;
  value: string | number;
  trend?: { direction: "up" | "down"; percentage: number };
  color?: "primary" | "success" | "warning" | "danger";
  style?: React.CSSProperties;
}
export function StatCardWrapper({
  iconKey,
  label,
  value,
  trend,
  color = "primary",
  style,
}: StatCardWrapperProps) {
  const Icon = getIcon(iconKey);
  return (
    <div style={style}>
      {" "}
      <StatCard
        icon={Icon}
        label={label}
        value={value}
        trend={trend}
        color={color}
      />{" "}
    </div>
  );
}
