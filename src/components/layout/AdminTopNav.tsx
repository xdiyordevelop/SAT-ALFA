"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Bell, User, Menu } from "lucide-react";
import { logoutAction } from "@/server/actions/auth.actions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function AdminTopNav({ userName, userEmail, pageTitle }: { userName?: string; userEmail?: string; pageTitle?: string }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 h-16">

        {/* Left: Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors flex-shrink-0">
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          {pageTitle && (
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white hidden sm:block">
              {pageTitle}
            </h2>
          )}
        </div>

        {/* Right: Global Controls */}
        <div className="flex items-center gap-3 ml-auto">

          <ThemeToggle />

          {/* Notifications */}
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-lg transition-colors relative flex-shrink-0">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex-shrink-0"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {(userName?.charAt(0) || "A").toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-sm hidden sm:block text-slate-900 dark:text-white">
                {userName || "Admin"}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <p className="font-semibold text-slate-900 dark:text-white">{userName || "Admin"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || "admin@sat-alfa.uz"}</p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <Link href="/admin/settings/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
