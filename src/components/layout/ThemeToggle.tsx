"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-16 h-8 ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`flex items-center bg-slate-200 dark:bg-[#1c1b1b] rounded-full p-1 ${className}`}
    >
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center justify-center w-8 h-6 rounded-full transition-all duration-300 ${
          !isDark
            ? "bg-white text-yellow-500 shadow-sm"
            : "text-slate-500 hover:text-slate-300"
        }`}
        aria-label="Switch to Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center justify-center w-8 h-6 rounded-full transition-all duration-300 ${
          isDark
            ? "bg-slate-950 text-yellow-500 shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }`}
        aria-label="Switch to Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
