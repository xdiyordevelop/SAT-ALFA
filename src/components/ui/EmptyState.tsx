"use client";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1c1b1b] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500 dark:text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="primary"
          size="md"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
