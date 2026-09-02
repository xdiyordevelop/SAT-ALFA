"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PenTool,
  History,
  CreditCard,
  Target,
  LogOut,
  Menu,
  X,
  FileBarChart,
  GraduationCap,
  Clock,
  Settings,
  FileText,
  HelpCircle,
  Zap
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth.actions";

interface SidebarProps {
  username: string;
  role: string;
}

export function Sidebar({ username, role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  const adminMenu = [
    {
      label: "Main",
      items: [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/students", icon: Users, label: "Students" },
        { href: "/admin/groups", icon: GraduationCap, label: "Groups" },
        { href: "/admin/payments", icon: CreditCard, label: "Payments" },
        { href: "/admin/attendance", icon: Clock, label: "Attendance" },
      ],
    },
    {
      label: "Academics",
      items: [
        { href: "/admin/topics", icon: BookOpen, label: "Topics & Lessons" },
        { href: "/admin/mock-tests", icon: PenTool, label: "Test Bank" },
        { href: "/admin/mock-tests/proctor", icon: Target, label: "Proctoring" },
        { href: "/admin/mock-tests/analytics", icon: FileBarChart, label: "Analytics" },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/articles", icon: FileText, label: "Articles & Reading" },
      ],
    },
  ];

  const studentMenu = [
    {
      label: "Study Portal",
      items: [
        { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/student/topics", icon: BookOpen, label: "Practice" },
        { href: "/student/mock-tests", icon: PenTool, label: "Mock Tests" },
        { href: "/student/articles", icon: FileText, label: "Reading Library" },
        { href: "/student/results", icon: History, label: "Results" },
        { href: "/student/payments", icon: CreditCard, label: "Payments" },
      ],
    },
  ];

  const menuGroups = role === "ADMIN" ? adminMenu : studentMenu;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="fixed top-3 left-4 z-[60] lg:hidden p-2 rounded-md bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-lg text-slate-700 dark:text-[#EBFF00] hover:bg-slate-50 dark:hover:bg-[#1c1b1b] transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-[50]"
        />
      )}

      {/* Sidebar Container */}
      <nav
        className={`fixed left-0 top-0 h-screen w-72 bg-slate-50 dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-white/10 flex flex-col z-[55] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header & Profile Area */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col items-start gap-5 bg-white/50 dark:bg-[#131313]/50 backdrop-blur-md">
          <Link href={role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"} className="flex items-center gap-3 group">
             <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 relative border border-slate-200 dark:border-white/5">
              <Image 
                src="/images/sat-alfa.jpg" 
                alt="SAT ALFA Logo" 
                fill 
                className="object-contain p-0.5"
                sizes="32px"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-[#EBFF00] tracking-tighter group-hover:scale-105 transition-transform">
              SAT-ALFA
            </h1>
          </Link>

          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full border-2 border-slate-300 dark:border-[#EBFF00] bg-slate-200 dark:bg-[#1c1b1b] flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              <span className="text-lg font-bold text-slate-700 dark:text-[#EBFF00]">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {username}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                {role === "ADMIN" ? "Administrator" : "Student"}
              </p>
            </div>
          </div>

          {role === "STUDENT" && (
            <button className="w-full bg-[#EBFF00] text-black font-bold py-2.5 px-4 rounded-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(235,255,0,0.1)] hover:shadow-[0_0_15px_rgba(235,255,0,0.2)]">
              <Zap className="w-4 h-4" /> Upgrade to Pro
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-1">
          {menuGroups.map((group, groupIdx) => (
            <div key={group.label} className="mb-2">
              <h3 className="px-6 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                {group.label}
              </h3>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active =
                    pathname.startsWith(item.href) &&
                    ((item.href !== "/admin/dashboard" && item.href !== "/student/dashboard") ||
                      pathname === item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mx-3 px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        active
                          ? "bg-slate-200 dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00] border-l-4 border-slate-900 dark:border-[#EBFF00] font-bold shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131313] font-semibold border-l-4 border-transparent"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bottom Actions */}
          <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-slate-200 dark:border-white/10 px-3 pb-4">
             {role === "ADMIN" && (
              <Link
                href="/admin/settings"
                className="px-4 py-3 flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131313] rounded-lg transition-colors font-semibold"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </Link>
            )}
            <Link
              href="#"
              className="px-4 py-3 flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131313] rounded-lg transition-colors font-semibold"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm">Help Center</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-3 flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors font-semibold text-left disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
