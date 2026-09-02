"use client";

import { Bell, Settings, User, LogOut, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/server/actions/auth.actions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AdminTopNav } from "./AdminTopNav";

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

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  href: string;
}

export function Topbar({
  title,
  breadcrumbs = [],
  userName = "Foydalanuvchi",
  userEmail = "Foydalanuvchi emaili topilmadi",
  userAvatar,
  userRole = "STUDENT",
}: TopbarProps) {
  if (userRole === "ADMIN") return <AdminTopNav userName={userName} userEmail={userEmail} />;

  const [openDropdown, setOpenDropdown] = useState<"notifications" | "profile" | "settings" | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
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

  const toggleDropdown = (name: "notifications" | "profile" | "settings") => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      if (name === "notifications" && notifications.length === 0) {
        setIsLoadingNotifs(true);
        setTimeout(() => {
          setNotifications([]); // Mocking empty state
          setIsLoadingNotifs(false);
        }, 500);
      }
      setOpenDropdown(name);
    }
  };

  return (
    <div className="sticky top-0 z-[40] w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/10 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Left: Breadcrumbs (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-bold text-slate-900 dark:text-[#EBFF00]">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Title */}
        <div className="sm:hidden font-bold text-slate-900 dark:text-[#EBFF00]">
          {title}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={(el) => { if (el) dropdownRefs.current["notifications"] = el; }}>
            <button
              onClick={() => toggleDropdown("notifications")}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-[#EBFF00] dark:hover:bg-[#1c1b1b] transition-all relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {openDropdown === "notifications" && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#131313] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden transform origin-top-right transition-all">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1c1b1b]">
                  <h3 className="font-bold text-slate-900 dark:text-white">Xabarnomalar</h3>
                </div>
                <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                  {isLoadingNotifs ? (
                    <div className="p-6 text-center text-slate-500">Yuklanmoqda...</div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">Yangi xabarlar yo'q</p>
                      <p className="text-xs mt-1">Hamma narsa o'qilgan</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative ml-2" ref={(el) => { if (el) dropdownRefs.current["profile"] = el; }}>
            <button
              onClick={() => toggleDropdown("profile")}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-[#EBFF00] flex items-center justify-center">
                <span className="text-xs font-bold text-white dark:text-black">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </button>

            {openDropdown === "profile" && (
               <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#131313] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-white/10">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <Link
                    href={userRole === "ADMIN" ? "/admin/settings/profile" : "/student/profile"}
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c1b1b] hover:text-slate-900 dark:hover:text-[#EBFF00] transition-colors"
                  >
                    <User className="w-4 h-4" /> Profil
                  </Link>
                  <button
                    onClick={() => { setOpenDropdown(null); handleLogout(); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Chiqish
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
