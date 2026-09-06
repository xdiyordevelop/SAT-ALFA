"use client";

import { Settings, User, LogOut, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/server/actions/auth.actions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AdminTopNav } from "./AdminTopNav";
import { NotificationBell } from "./NotificationBell";

interface Breadcrumb {
  label: string;
  href?: string;
}

export interface TopbarProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  userRole?: string;
}

export function Topbar({
  title,
  breadcrumbs = [],
  userName = "User",
  userEmail = "user@example.com",
  userAvatar,
  userRole = "STUDENT",
}: TopbarProps) {
  if (userRole !== "STUDENT") return <AdminTopNav userName={userName} userEmail={userEmail} pageTitle={title} />;

  const [openDropdown, setOpenDropdown] = useState<"profile" | "settings" | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutside = !Object.values(dropdownRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (isOutside) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
  };

  const toggleDropdown = (name: "profile" | "settings") => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="sticky top-0 z-[40] w-full bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full gap-6">

        {/* Left: Breadcrumbs (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-300 dark:text-slate-700 flex-shrink-0">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-900 dark:text-white">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Title */}
        <div className="sm:hidden font-semibold text-slate-900 dark:text-white text-sm">
          {title}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-auto">

          <ThemeToggle />

          {/* Live Student Notifications */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative" ref={(el) => { if (el) dropdownRefs.current["profile"] = el; }}>
            <button
              onClick={() => toggleDropdown("profile")}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex-shrink-0"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
                {userName}
              </span>
            </button>

            {openDropdown === "profile" && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <Link
                    href="/student/profile"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button
                    onClick={() => { setOpenDropdown(null); handleLogout(); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
