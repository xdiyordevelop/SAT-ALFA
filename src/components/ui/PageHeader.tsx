"use client";

import { ReactNode } from "react";
import { Button } from "./Button";

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
          <h1 className="heading-2 text-slate-900 dark:text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="subtitle text-slate-600 dark:text-slate-400">{description}</p>
          )}
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant === "secondary" ? "secondary" : "primary"}
            size="md"
            className="w-full md:w-auto"
          >
            {action.label}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
