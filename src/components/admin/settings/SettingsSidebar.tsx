"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Building2,
  GraduationCap,
  Users,
} from "lucide-react";
import { Suspense } from "react";

function SettingsSidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "credentials";

  const menuItems = [
    {
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      label: "Super Admin Security",
      href: "/admin/settings?tab=credentials",
      active:
        (pathname === "/admin/settings" && currentTab === "credentials") ||
        pathname === "/admin/settings/security",
    },
    {
      icon: <Building2 className="w-5 h-5 text-blue-500" />,
      label: "Center Profile",
      href: "/admin/settings?tab=profile",
      active: pathname === "/admin/settings" && currentTab === "profile",
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-emerald-500" />,
      label: "Academic & Exam Rules",
      href: "/admin/settings?tab=academic",
      active: pathname === "/admin/settings" && currentTab === "academic",
    },
    {
      icon: <Users className="w-5 h-5 text-purple-500" />,
      label: "Team & Staff",
      href: "/admin/settings/team",
      active: pathname === "/admin/settings/team",
    },
  ];

  return (
    <div className="bg-transparent h-fit sticky top-24">
      <nav className="space-y-1.5">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              item.active
                ? "bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm border-l-4 border-amber-500 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border-l-4 border-transparent"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function SettingsSidebar() {
  return (
    <Suspense
      fallback={
        <div className="h-44 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
      }
    >
      <SettingsSidebarInner />
    </Suspense>
  );
}
