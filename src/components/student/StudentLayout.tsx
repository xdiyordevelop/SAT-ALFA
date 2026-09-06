"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ReactNode } from "react";

interface StudentLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  userName?: string;
  userEmail?: string;
}

export function StudentLayout({
  children,
  title,
  breadcrumbs = [],
  userName,
  userEmail,
}: StudentLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar username={userName || "Student"} role="STUDENT" />

      {/* Main Content Area - explicit offset from fixed sidebar */}
      <div className="ml-0 lg:ml-72 transition-all duration-300 flex flex-col min-h-screen">
        {/* Top Header */}
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          userName={userName}
          userEmail={userEmail}
          userRole="STUDENT"
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-clip">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
