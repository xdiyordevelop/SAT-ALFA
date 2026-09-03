"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getIcon } from "@/lib/icons";
import type { IconKey } from "@/lib/icons";
interface QuickAction {
  iconKey: IconKey;
  label: string;
  href: string;
}
const QUICK_ACTIONS: QuickAction[] = [
  { iconKey: "brain", label: "Take Mock Test", href: "/student/mock-tests" },
  { iconKey: "bookOpen", label: "View Results", href: "/student/results/math" },
  { iconKey: "calendar", label: "Attendance", href: "/student/attendance" },
  { iconKey: "trendingUp", label: "Progress", href: "/student/dashboard" },
];
export function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {" "}
      {QUICK_ACTIONS.map((action, index) => {
        const Icon = getIcon(action.iconKey);
        return (
          <Link
            key={action.href}
            href={action.href}
            style={{
              animation: `slideUp 0.5s ease-out {400 + index * 50}ms backwards`,
            }}
          >
            {" "}
            <div className="group p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-yellow-300 hover:bg-slate-50 dark:bg-[#0a0a0a] transition-all duration-300 cursor-pointer">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="p-2 rounded-lg bg-[#EBFF00]/10 dark:bg-[#EBFF00]/50/30 group-hover:bg-yellow-200 transition-colors">
                    {" "}
                    <Icon className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />{" "}
                  </div>{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-[#EBFF00]">
                    {" "}
                    {action.label}{" "}
                  </span>{" "}
                </div>{" "}
                <ArrowRight className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-[#EBFF00] group-hover:translate-x-1 transition-all" />{" "}
              </div>{" "}
            </div>{" "}
          </Link>
        );
      })}{" "}
    </div>
  );
}
