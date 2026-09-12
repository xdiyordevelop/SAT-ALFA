"use client";

import {
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
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
  if (userRole !== "STUDENT") {
    return <AdminTopNav userName={userName} userEmail={userEmail} pageTitle={title} />;
  }

  const [openDropdown, setOpenDropdown] = useState<"profile" | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Live User State (syncs from props or fetches dynamically if default)
  const [profile, setProfile] = useState({
    name: userName && userName !== "User" ? userName : "",
    email: userEmail && userEmail !== "user@example.com" ? userEmail : "",
    role: userRole || "STUDENT",
    loaded: Boolean(userName && userName !== "User"),
  });

  useEffect(() => {
    if (!profile.loaded || userName === "User") {
      fetch("/api/auth/session")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setProfile({
              name: data.fullName || data.username || "Student",
              email: data.email || data.phone || data.username || "",
              role: data.role || "STUDENT",
              loaded: true,
            });
          }
        })
        .catch(() => {});
    } else if (userName && userName !== "User") {
      setProfile({
        name: userName,
        email: userEmail || "",
        role: userRole || "STUDENT",
        loaded: true,
      });
    }
  }, [userName, userEmail, userRole, profile.loaded]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch {
      window.location.href = "/login";
    }
  };

  const displayName = profile.name || "Student";
  const displayEmail = profile.email || `@${displayName.toLowerCase().replace(/\s+/g, "")}`;

  // Extract up to 2 initials
  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "S";

  return (
    <div className="sticky top-0 z-[40] w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full gap-4">
        {/* Left: Breadcrumbs (Hidden on small screens) */}
        <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-300 dark:text-slate-700 flex-shrink-0">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors truncate max-w-[200px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Title */}
        <div className="sm:hidden font-bold text-slate-900 dark:text-white text-sm truncate max-w-[180px]">
          {title}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 ml-auto">
          <ThemeToggle />

          {/* Live Student Notifications */}
          <NotificationBell />

          {/* Modern Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}
              className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all duration-200 ${
                openDropdown === "profile"
                  ? "bg-[#EBFF00]/10 border-[#EBFF00] shadow-sm"
                  : "bg-slate-100/70 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
              title="User Account & Profile"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-[#EBFF00] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#0a0a0a]" />
              </div>

              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline truncate max-w-[110px]">
                {displayName}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  openDropdown === "profile" ? "rotate-180 text-[#EBFF00]" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Box */}
            {openDropdown === "profile" && (
              <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-black/20 dark:shadow-black/70 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Header Profile Card */}
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/5 mb-1.5">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EBFF00] to-yellow-300 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
                        {initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#141414] rounded-full" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate leading-tight">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                        {displayEmail}
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-950 bg-[#EBFF00] px-2 py-0.5 rounded-md shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          {profile.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Navigation Links */}
                <div className="space-y-0.5">
                  <Link
                    href="/student/profile"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#EBFF00]/15 group-hover:text-[#EBFF00] transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/student/dashboard"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#EBFF00]/15 group-hover:text-[#EBFF00] transition-colors">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </div>
                    <span>Dashboard</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-slate-100 dark:border-white/5" />

                {/* Sign Out Action */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors w-full text-left group"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500/20 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
