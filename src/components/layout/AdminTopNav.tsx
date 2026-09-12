"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Menu, Settings, ChevronDown, Sparkles, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/server/actions/auth.actions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "./NotificationBell";

export function AdminTopNav({
  userName,
  userEmail,
  pageTitle,
}: {
  userName?: string;
  userEmail?: string;
  pageTitle?: string;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Live Admin Profile State
  const [profile, setProfile] = useState({
    name: userName && userName !== "admin" && userName !== "Admin" ? userName : "",
    email: userEmail && userEmail !== "admin" && userEmail !== "admin@sat-alfa.uz" ? userEmail : "",
    role: "ADMIN",
    loaded: Boolean(userName && userName !== "admin" && userName !== "Admin"),
  });

  useEffect(() => {
    if (!profile.loaded || !userName || userName.toLowerCase() === "admin") {
      fetch("/api/auth/session")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setProfile({
              name: data.fullName || data.username || "Admin",
              email: data.email || data.phone || `${data.username || "admin"}@sat-alfa.uz`,
              role: data.role || "ADMIN",
              loaded: true,
            });
          }
        })
        .catch(() => {});
    } else if (userName) {
      setProfile({
        name: userName,
        email: userEmail || `${userName}@sat-alfa.uz`,
        role: "ADMIN",
        loaded: true,
      });
    }
  }, [userName, userEmail, profile.loaded]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
    } catch {
      window.location.href = "/login";
    }
  };

  const displayName = profile.name || "Administrator";
  const displayEmail = profile.email || "admin@sat-alfa.uz";

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all duration-300 shadow-xs">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 h-16 gap-4">
        {/* Left: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          {pageTitle && (
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {pageTitle}
            </h2>
          )}
        </div>

        {/* Right: Global Controls */}
        <div className="flex items-center gap-2.5 ml-auto">
          <ThemeToggle />

          {/* Real-time Notifications */}
          <NotificationBell />

          {/* Modern Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all duration-200 ${
                profileOpen
                  ? "bg-[#EBFF00]/10 border-[#EBFF00] shadow-sm"
                  : "bg-slate-100/70 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
              title="Admin Profile & Settings"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-[#EBFF00] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#0a0a0a]" />
              </div>

              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline truncate max-w-[120px]">
                {displayName}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  profileOpen ? "rotate-180 text-[#EBFF00]" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-black/20 dark:shadow-black/70 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Admin Info Header Card */}
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
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {profile.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-0.5">
                  <Link
                    href="/admin/settings/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#EBFF00]/15 group-hover:text-[#EBFF00] transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span>Profile Settings</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#EBFF00]/15 group-hover:text-[#EBFF00] transition-colors">
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    <span>System Settings</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-slate-100 dark:border-white/5" />

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors w-full text-left group disabled:opacity-50"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500/20 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
