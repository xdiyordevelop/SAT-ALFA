"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Upload, Eye, BookOpen } from "lucide-react";
export function MockTestsTabs() {
  const pathname = usePathname();
  const tabs = [
    {
      href: "/admin/mock-tests",
      label: "All Tests",
      icon: FileText,
      strict: true,
    },
    { href: "/admin/mock-tests/import", label: "Import", icon: Upload },
    { href: "/admin/mock-tests/proctor", label: "Live Proctor", icon: Eye },
    { href: "/admin/topics", label: "Topics & Skills", icon: BookOpen },
  ];
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-lg border border-slate-200 dark:border-white/10 w-full sm:w-auto overflow-x-auto mb-6 custom-scrollbar">
      {" "}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.strict
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${isActive ? "bg-white dark:bg-[#131313] text-slate-900 dark:text-[#EBFF00] shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-[#1c1b1b]/50"}`}
          >
            {" "}
            <Icon className="w-4 h-4" /> {tab.label}{" "}
          </Link>
        );
      })}{" "}
    </div>
  );
}
