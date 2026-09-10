"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Shield,
  Monitor,
  Target,
  Users,
  CreditCard,
  AlertTriangle,
  Code,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Sparkles,
  LifeBuoy,
  X,
  FileText,
} from "lucide-react";
import { AuthorProfileCard } from "@/components/student/help/AuthorProfileCard";

type StaffCategoryKey =
  | "all"
  | "proctoring"
  | "tests"
  | "students"
  | "attendance-billing"
  | "emergency";

interface StaffSOPItem {
  id: string;
  category: StaffCategoryKey;
  title: string;
  summary: string;
  tags: string[];
  content: React.ReactNode;
}

export function AdminHelpCenterClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<StaffCategoryKey>("all");
  const [expandedSopId, setExpandedSopId] = useState<string | null>("proctoring-launch");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories: Array<{ key: StaffCategoryKey; label: string; icon: any }> = [
    { key: "all", label: "All SOPs", icon: LifeBuoy },
    { key: "proctoring", label: "Live Proctoring SOP", icon: Monitor },
    { key: "tests", label: "Mock Tests & KaTeX", icon: Target },
    { key: "students", label: "Students & Cohorts", icon: Users },
    { key: "attendance-billing", label: "Attendance & Billing", icon: CreditCard },
    { key: "emergency", label: "Emergency Protocols", icon: AlertTriangle },
  ];

  const sops: StaffSOPItem[] = [
    {
      id: "proctoring-launch",
      category: "proctoring",
      title: "SOP-01: Launching Live Exam Rooms & Classroom Projector",
      summary: "Standard procedure for starting a synchronized mock test session and projecting PIN for students.",
      tags: ["launch", "projector", "pin", "room", "start", "classroom"],
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBFF00] text-slate-950 flex items-center justify-center text-xs font-black">1</span>
              Initiate Room
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Navigate to <strong>Mock Tests &gt; Proctoring</strong>. Click <strong>&quot;Launch New Exam Session&quot;</strong> and choose the designated SAT Mock Test.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBFF00] text-slate-950 flex items-center justify-center text-xs font-black">2</span>
              Display on Projector Screen
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Inside the Proctor Control Room, click <strong>&quot;Projector Mode&quot;</strong>. This displays the 6-digit access PIN in high contrast across the front-of-room screen.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#EBFF00] text-slate-950 flex items-center justify-center text-xs font-black">3</span>
              Verify Student Connections
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Observe the Participant Matrix in the control room. As students join via <code>/student/mock-tests</code>, their names and green heartbeat indicators will appear in real time.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "proctoring-actions",
      category: "proctoring",
      title: "SOP-02: Live Student Interventions (Pause, Extra Time, Disqualify)",
      summary: "Guidelines for managing students in real time during testing.",
      tags: ["pause", "resume", "extra time", "disqualify", "clear", "violations"],
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            The Proctor Control Room provides direct action controls for each connected student:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Pause / Resume:</strong> If a student needs to leave the room or resolve a device issue, click <strong>Pause</strong>. Their countdown timer will halt immediately. Click <strong>Resume</strong> when they return.
            </li>
            <li>
              <strong>+Add Extra Time:</strong> In cases of power glitch, browser reload delay, or accommodations, click <strong>+Time</strong>. Select from convenient presets (+5 min, +10 min, +15 min) or input a custom duration.
            </li>
            <li>
              <strong>Disqualify:</strong> For deliberate non-compliance, click <strong>Disqualify</strong>. A confirmation modal will appear to prevent accidental triggers.
            </li>
            <li>
              <strong>Dismiss / Clear Violations:</strong> In the Security Tracker sidebar, if a tab switch was verified as an innocent operating system prompt, click the reset icon to clear the student&apos;s exit count.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "test-conclude-scoring",
      category: "proctoring",
      title: "SOP-03: Concluding Sessions & AI Scoring Workflow",
      summary: "Completing exam rooms and initiating student grading.",
      tags: ["conclude", "complete", "scoring", "results", "publish"],
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            When testing time has elapsed across all modules:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Click <strong>&quot;Conclude Session&quot;</strong> in the Session Controller bar.</li>
            <li>Confirm the prompt. This automatically submits all remaining active student tests and expires the 6-digit PIN.</li>
            <li>
              Navigate to <strong>Mock Tests &gt; Results</strong> to review scored submissions. AI scoring computes domain breakdowns and publishes verified results to students&apos; portals.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: "katex-syntax",
      category: "tests",
      title: "SOP-04: Test Authoring & KaTeX Mathematical Syntax Guide",
      summary: "Reference guide for inputting SAT math formulas and algebra notation in questions.",
      tags: ["katex", "math", "formulas", "latex", "questions", "symbols"],
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            SAT-ALFA renders mathematical formulas using KaTeX. Wrap inline formulas with standard LaTeX notation or copy from the reference list below:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
              <span className="text-slate-400">Fraction:</span>
              <div className="text-slate-900 dark:text-[#EBFF00] font-bold mt-1">\frac&#123;a&#125;&#123;b&#125;</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
              <span className="text-slate-400">Square Root:</span>
              <div className="text-slate-900 dark:text-[#EBFF00] font-bold mt-1">\sqrt&#123;x + 1&#125;</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
              <span className="text-slate-400">Exponents:</span>
              <div className="text-slate-900 dark:text-[#EBFF00] font-bold mt-1">x^2 + y^2 = r^2</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
              <span className="text-slate-400">Greek Symbols:</span>
              <div className="text-slate-900 dark:text-[#EBFF00] font-bold mt-1">\theta, \pi, \alpha</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "curriculum-cohorts",
      category: "students",
      title: "SOP-05: Group Enrollment & Unlocking Curriculum Lessons",
      summary: "Managing cohorts, setting syllabi, and releasing lessons to students.",
      tags: ["groups", "curriculum", "lessons", "unlock", "cohorts"],
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            To assign students to cohorts and regulate lesson pace:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Go to <strong>Groups</strong> to create or update cohorts (e.g. &quot;SAT Intensive Fall 2026&quot;).
            </li>
            <li>
              Click on a group and select the <strong>Curriculum</strong> tab.
            </li>
            <li>
              Click <strong>&quot;Unlock Lesson&quot;</strong> on specific topics as your class progresses. This automatically triggers an in-app notification to all enrolled students.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "attendance-export",
      category: "attendance-billing",
      title: "SOP-06: Attendance Logs & Excel/CSV Data Export",
      summary: "Taking roll call and generating attendance compliance reports.",
      tags: ["attendance", "export", "csv", "excel", "roll call"],
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Roll call is recorded daily in <strong>Attendance &gt; Mark Attendance</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Select the class group and today&apos;s date.</li>
            <li>Mark each student as <strong>Present</strong>, <strong>Late</strong>, <strong>Absent</strong>, or <strong>Excused</strong>.</li>
            <li>
              To export attendance records for academic audits or parent reports, click <strong>&quot;Export CSV&quot;</strong> on the attendance dashboard.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "emergency-power",
      category: "emergency",
      title: "SOP-07: Emergency Incident: Device Crash or Power Interruption",
      summary: "Step-by-step resolution when a student laptop shuts down during testing.",
      tags: ["emergency", "crash", "power", "freeze", "recover"],
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            In the event of hardware crash, power outage, or browser freeze:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Pause the Student:</strong> Open the Proctor Control Room and click <strong>Pause</strong> on the affected student&apos;s card to freeze their timer.
            </li>
            <li>
              <strong>Restart Device:</strong> Have the student restart their machine or transition to a spare backup computer.
            </li>
            <li>
              <strong>Re-Enter Room:</strong> The student visits <code>/student/mock-tests</code> &gt; Join Live Exam and enters the room PIN again.
            </li>
            <li>
              <strong>Add Compensation Time:</strong> In the control room, click <strong>+Time</strong> and add minutes lost during the hardware restart, then click <strong>Resume</strong>.
            </li>
          </ol>
        </div>
      ),
    },
  ];

  const filteredSops = useMemo(() => {
    return sops.filter((sop) => {
      const matchesCategory =
        selectedCategory === "all" || sop.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const titleMatch = sop.title.toLowerCase().includes(q);
      const summaryMatch = sop.summary.toLowerCase().includes(q);
      const tagMatch = sop.tags.some((tag) => tag.toLowerCase().includes(q));

      return titleMatch || summaryMatch || tagMatch;
    });
  }, [sops, selectedCategory, searchQuery]);

  const copyKaTeX = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-[#131313] to-slate-900 border border-white/10 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EBFF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBFF00]/10 border border-[#EBFF00]/20 text-[#EBFF00] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Staff Operations & Proctoring SOPs
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Staff & Proctor Help Center
          </h1>
          <p className="text-sm text-slate-300">
            Official standard operating procedures for test room administration, live interventions, KaTeX formulas, and emergency recovery.
          </p>

          {/* Search Bar */}
          <div className="relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SOPs by protocol, keyword, or action (e.g. 'projector', 'extra time', 'katex')..."
              className="w-full bg-white/10 dark:bg-white/5 border border-white/20 focus:border-[#EBFF00] rounded-2xl pl-12 pr-10 py-4 text-sm font-medium text-white placeholder-slate-400 focus:outline-none backdrop-blur-md shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-900 dark:bg-[#EBFF00] text-white dark:text-slate-950 shadow-md"
                  : "bg-white dark:bg-[#131313] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: SOPs (2 cols) & Cheat Sheets (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOPs Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Standard Operating Procedures (SOP)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {filteredSops.length} protocols available
            </span>
          </div>

          {filteredSops.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                No SOPs match &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try searching with broader terms or clear your search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-xs font-bold text-[#EBFF00] underline"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredSops.map((sop) => {
              const isExpanded = expandedSopId === sop.id;
              return (
                <div
                  key={sop.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "bg-white dark:bg-[#131313] border-slate-400 dark:border-[#EBFF00]/40 shadow-sm"
                      : "bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSopId(isExpanded ? null : sop.id)
                    }
                    className="w-full flex items-start justify-between p-5 text-left gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {sop.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {sop.summary}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-slate-900 dark:text-[#EBFF00]" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-150">
                      {sop.content}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mr-1">
                          Tags:
                        </span>
                        {sop.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar: Author Profile, KaTeX Cheat Sheet & Technical Hotline */}
        <div className="space-y-4">
          <AuthorProfileCard variant="sidebar" />

          {/* KaTeX Copyable Cheat Sheet */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Code className="w-4 h-4 text-[#EBFF00]" />
              KaTeX Quick Formula Snippets
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click to copy mathematical snippets for test questions:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { label: "Fraction", code: "\\frac{x + 1}{2}" },
                { label: "Square Root", code: "\\sqrt{3x - 5}" },
                { label: "Exponent", code: "f(x) = ax^2 + bx + c" },
                { label: "Inequality", code: "x \\le 4 \\quad \\text{or} \\quad x > 9" },
                { label: "System", code: "\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases}" },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={() => copyKaTeX(item.code)}
                  className="cursor-pointer group p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between hover:border-[#EBFF00]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</div>
                    <div className="font-mono text-xs text-slate-900 dark:text-white truncate mt-0.5">
                      {item.code}
                    </div>
                  </div>
                  <div className="shrink-0 ml-2 text-slate-400 group-hover:text-[#EBFF00]">
                    {copiedCode === item.code ? (
                      <Check className="w-3.5 h-3.5 text-[#EBFF00]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Escalation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#181818] border border-white/10 text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <LifeBuoy className="w-4 h-4 text-emerald-400" />
              Technical Escalation Desk
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Need engineering assistance for system outages, database resets, or automated exam deployment?
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1 text-slate-300">
              <div>Dev Team Hotline: <span className="font-mono font-bold text-white">+998 71 200 00 00</span></div>
              <div>Direct Telegram: <span className="font-mono font-bold text-[#EBFF00]">{process.env.NEXT_PUBLIC_TELEGRAM_TECH_HANDLE || "@satalfa_tech"}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator & Platform Architect Spotlight Banner */}
      <AuthorProfileCard variant="banner" />
    </div>
  );
}
