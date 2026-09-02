"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-8 animate-fade-in ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-slate-600 dark:text-slate-400">{description}</p>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className={`px-6 py-3 rounded-lg font-medium transition-colors w-full md:w-auto ${
              action.variant === "secondary"
                ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#333333]"
                : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
            }`}
          >
            {action.label}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
