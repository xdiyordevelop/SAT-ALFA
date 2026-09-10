"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  HelpCircle,
  ShieldAlert,
  Clock,
  BookOpen,
  CreditCard,
  Target,
  Calculator,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  X,
  Phone,
  Sparkles,
} from "lucide-react";
import { createPortal } from "react-dom";
import { AuthorProfileCard } from "./AuthorProfileCard";

type CategoryKey =
  | "all"
  | "mock-tests"
  | "proctor"
  | "anti-cheat"
  | "curriculum"
  | "payments";

interface FAQItem {
  id: string;
  category: CategoryKey;
  question: string;
  answer: React.ReactNode;
  tags: string[];
}

interface StudentHelpCenterClientProps {
  studentProfileId?: string;
  studentName: string;
}

export function StudentHelpCenterClient({
  studentProfileId,
  studentName,
}: StudentHelpCenterClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("sat-scoring");

  // Bug report modal state
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [issueType, setIssueType] = useState("platform-glitch");
  const [bugMessage, setBugMessage] = useState("");
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [bugSuccessMessage, setBugSuccessMessage] = useState<string | null>(null);
  const [bugErrorMessage, setBugErrorMessage] = useState<string | null>(null);

  const categories: Array<{ key: CategoryKey; label: string; icon: any }> = [
    { key: "all", label: "All Topics", icon: HelpCircle },
    { key: "mock-tests", label: "Digital SAT & Bluebook", icon: Target },
    { key: "proctor", label: "Live Proctoring & PIN", icon: Clock },
    { key: "anti-cheat", label: "Anti-Cheat & Fullscreen", icon: ShieldAlert },
    { key: "curriculum", label: "Lessons & Curriculum", icon: BookOpen },
    { key: "payments", label: "Tuition & Attendance", icon: CreditCard },
  ];

  const faqs: FAQItem[] = [
    {
      id: "sat-scoring",
      category: "mock-tests",
      question: "How does Digital SAT scoring and section adaptability work?",
      tags: ["score", "400-1600", "adaptive", "module", "reading", "math", "curve"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            The SAT-ALFA mock testing engine replicates the official College Board Digital SAT multi-stage adaptive scoring format:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Total Score:</strong> Scaled between <strong>400 and 1600</strong>, calculated from two sections: Reading & Writing (200–800) and Math (200–800).
            </li>
            <li>
              <strong>Multi-Stage Adaptive Routing:</strong> In each section, your performance on <strong>Module 1</strong> determines whether you are routed to the easier or harder version of <strong>Module 2</strong>.
            </li>
            <li>
              <strong>Maximum Potential:</strong> Achieving the harder Module 2 unlocks access to the highest score bands (up to 800 per section).
            </li>
            <li>
              <strong>No Guessing Penalty:</strong> You do not lose points for incorrect answers. Always select an answer for every question before time expires.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "join-proctor",
      category: "proctor",
      question: "How do I join a Live Proctored Exam in the classroom?",
      tags: ["join", "proctor", "pin", "room", "live", "code", "6-digit"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            To participate in an in-person or live proctored mock examination:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Navigate to <strong>Mock Tests</strong> from the sidebar and click the <strong>&quot;Join Live Exam&quot;</strong> button.
            </li>
            <li>
              Check the front projector screen in your classroom where your teacher or proctor displays the <strong>6-digit Room PIN</strong> (e.g. <code className="font-mono bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-[#EBFF00] dark:text-[#EBFF00]">482 109</code>).
            </li>
            <li>
              Enter the 6-digit PIN and click <strong>&quot;Enter Exam Room&quot;</strong>.
            </li>
            <li>
              Wait for the proctor to give the start signal. When your exam begins, full-screen mode will activate automatically.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: "fullscreen-anti-cheat",
      category: "anti-cheat",
      question: "What happens if I accidentally exit fullscreen or switch tabs?",
      tags: ["fullscreen", "exit", "cheat", "tab", "warning", "disqualify", "pause"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            To safeguard official SAT exam integrity, our test interface strictly monitors fullscreen status and tab switches:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-2">
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 dark:text-yellow-300">
              <div className="font-black text-xs uppercase mb-1">1–2 Exits</div>
              <div className="text-xs">Warning banner alerts you to return to fullscreen immediately.</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
              <div className="font-black text-xs uppercase mb-1">3–4 Exits</div>
              <div className="text-xs">Alert flagged on the teacher&apos;s live proctor control screen.</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
              <div className="font-black text-xs uppercase mb-1">5+ Exits</div>
              <div className="text-xs">Test is paused automatically; requires teacher authorization to resume.</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tip: Disable pop-up notifications, incoming messaging apps, and external screens before starting your exam.
          </p>
        </div>
      ),
    },
    {
      id: "internet-disconnect",
      category: "anti-cheat",
      question: "What if my internet connection drops during an exam?",
      tags: ["disconnect", "internet", "offline", "wifi", "reload", "crash", "recover"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>Don&apos;t panic! Your progress is safe.</strong> The SAT-ALFA testing engine uses dual caching:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Every answer you select is saved instantly to local browser storage and dispatched to the server every 5 seconds.
            </li>
            <li>
              If your Wi-Fi drops, reconnect to the network and refresh the page (<kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-xs">F5</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-xs">Ctrl+R</kbd>).
            </li>
            <li>
              Your timer and question state will restore exactly where you left off. If you lose time due to a hardware failure, notify your teacher to add extra time via the Proctor Controller.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "desmos-tools",
      category: "mock-tests",
      question: "Which tools are available during the exam (Desmos, Highlighting, Strikethrough)?",
      tags: ["desmos", "calculator", "math", "formulas", "highlight", "strikethrough", "tools"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            The test engine provides the exact suite of tools allowed on the real Digital SAT:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Built-in Desmos Graphing Calculator:</strong> Available on all Math questions in the top right header. Supports graphing, regression, and trigonometric functions.
            </li>
            <li>
              <strong>Reference Sheet:</strong> Click the reference icon in Math to open standard formulas for area, volume, Pythagorean theorem, and special right triangles.
            </li>
            <li>
              <strong>Option Eliminator (Strikethrough):</strong> Click the ABC cross-out icon to cross off eliminated choices.
            </li>
            <li>
              <strong>Mark for Review:</strong> Flag uncertain questions to return to them using the question navigator grid before submitting the module.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "curriculum-unlock",
      category: "curriculum",
      question: "How do upcoming lessons unlock in the Curriculum?",
      tags: ["lessons", "topics", "curriculum", "unlock", "homework", "teacher"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Lesson materials and topics unlock according to your group&apos;s syllabus schedule:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              When your instructor unlocks a topic for your class cohort, you will receive an in-app notification (&quot;New Lesson Unlocked&quot;).
            </li>
            <li>
              Complete the accompanying practice questions and review the video or article resources.
            </li>
            <li>
              If a lesson appears locked, check with your instructor to ensure you have fulfilled any prerequisites for that module.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "test-review-explanations",
      category: "mock-tests",
      question: "Where can I review my mock test results and AI explanations?",
      tags: ["results", "review", "explanations", "answers", "mistakes", "analysis"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            After your test submission is processed and approved by your teacher:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Go to <strong>Results</strong> from the sidebar.</li>
            <li>Click on your completed test to open the <strong>Detailed Performance Report</strong>.</li>
            <li>
              Inspect your score breakdown by domain (Algebra, Advanced Math, Information & Ideas, Craft & Structure).
            </li>
            <li>
              Click on any question in the review grid to view the correct answer, your response, and comprehensive step-by-step explanations.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: "payments-tuition",
      category: "payments",
      question: "How do monthly tuition payments and receipts work?",
      tags: ["payment", "tuition", "receipt", "billing", "uzs", "due"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Tuition accounting details are tracked in the <strong>Payments</strong> section of your portal:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Tuition is calculated on a 30-day billing cycle basis. Your active status, amount due, and due date are displayed on your Payments dashboard.
            </li>
            <li>
              Payments made via bank transfer or cash are verified and credited to your account by the administrative finance desk.
            </li>
            <li>
              Keep your payment receipts. If a payment has not been marked as paid within 24 hours, click &quot;Contact Support&quot; below with your transaction receipt.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "attendance-policy",
      category: "payments",
      question: "What is the SAT-ALFA attendance policy?",
      tags: ["attendance", "absence", "late", "excused", "policy"],
      answer: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Consistent attendance is vital for reaching your target SAT score:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Present:</strong> Student arrived on time and completed the class session.
            </li>
            <li>
              <strong>Late:</strong> Arrival after the scheduled start time is logged. 3 late records count as 1 absence.
            </li>
            <li>
              <strong>Excused:</strong> Absences notified to the administration in advance with valid medical or emergency notice.
            </li>
            <li>
              Students maintaining an <strong>85%+ attendance rate</strong> remain eligible for complimentary weekly proctored mock exams.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const titleMatch = faq.question.toLowerCase().includes(q);
      const tagMatch = faq.tags.some((tag) => tag.toLowerCase().includes(q));

      return titleMatch || tagMatch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  // Handle bug report submission
  const handleSubmitBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugMessage.trim()) return;

    try {
      setIsSubmittingBug(true);
      setBugErrorMessage(null);
      setBugSuccessMessage(null);

      const response = await fetch("/api/student/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentProfileId,
          issueType,
          message: bugMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setBugSuccessMessage("Thank you! Your issue report has been recorded and sent to the technical team.");
      setBugMessage("");
      setTimeout(() => {
        setIsBugModalOpen(false);
        setBugSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setBugErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmittingBug(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-[#131313] to-slate-900 border border-white/10 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EBFF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBFF00]/10 border border-[#EBFF00]/20 text-[#EBFF00] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> SAT-ALFA Knowledge Base
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            How can we help you today,{" "}
            <span className="text-[#EBFF00]">{studentName}</span>?
          </h1>
          <p className="text-sm text-slate-300">
            Search our student knowledge base for Digital SAT procedures, Desmos tips, exam rules, and tuition billing.
          </p>

          {/* Search Bar */}
          <div className="relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. 'Desmos', 'PIN', 'score', 'fullscreen', 'tuition')..."
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

      {/* Main Content Layout: FAQ List (2 cols) & Sidebar Shortcuts (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Accordion Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Frequently Asked Questions
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredFaqs.length} of {faqs.length} articles
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                No articles matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try searching with different keywords, or click below to submit a direct inquiry to our staff.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-xs font-bold text-[#EBFF00] underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "bg-white dark:bg-[#131313] border-slate-400 dark:border-[#EBFF00]/40 shadow-sm"
                      : "bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFaqId(isExpanded ? null : faq.id)
                    }
                    className="w-full flex items-center justify-between p-5 text-left gap-4"
                  >
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-slate-900 dark:text-[#EBFF00]" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-150">
                      {faq.answer}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mr-1">
                          Tags:
                        </span>
                        {faq.tags.map((tag) => (
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

        {/* Right Sidebar: Shortcuts & Support Action Cards */}
        <div className="space-y-4">
          {/* Creator & Lead Developer Profile Card */}
          <AuthorProfileCard variant="sidebar" />

          {/* Desmos Cheat Sheet Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Calculator className="w-4 h-4 text-indigo-500" />
              Desmos SAT Quick Hacks
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Master the built-in graphing calculator to solve algebraic systems rapidly:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                <div className="font-mono font-bold text-slate-900 dark:text-[#EBFF00]">
                  y = 2x + 1 & y = -x + 4
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Type both lines to click their intersection point directly.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                <div className="font-mono font-bold text-slate-900 dark:text-[#EBFF00]">
                  y1 ~ mx1 + b
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Input a table of coordinates and use the tilde (~) for instant linear regression.
                </div>
              </div>
            </div>
          </div>

          {/* Report Bug / Technical Issue Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#181818] border border-white/10 text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Found a Glitch or Question Error?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Report typos, missing diagrams, or platform bugs directly to our academic engineering team.
            </p>
            <button
              type="button"
              onClick={() => setIsBugModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Report Platform Issue
            </button>
          </div>

          {/* Academic Helpdesk Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Phone className="w-4 h-4 text-emerald-500" />
              Academic Support Hotline
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Reach out to our head instructors and administration for urgent inquiries:
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Working Hours:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Mon–Sat, 9:00–20:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Location:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Tashkent Center</span>
              </div>
            </div>
            <a
              href={process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL || "https://t.me/satalfa_support"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-900 dark:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Telegram Support Desk
            </a>
          </div>
        </div>
      </div>

      {/* Featured Platform Creator & Engineering Spotlight Banner */}
      <AuthorProfileCard variant="banner" />

      {/* Bug Report Modal (Portaled) */}
      {isBugModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto select-none">
            <div
              className="fixed -inset-12 min-h-[120dvh] min-w-[120dvw] bg-slate-900/30 dark:bg-black/80 backdrop-blur-sm dark:backdrop-blur-md transition-all animate-in fade-in duration-200"
              onClick={() => setIsBugModalOpen(false)}
            />
            <div
              className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/15 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Report an Issue
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBugModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Describe the issue or question error you experienced. Our system analyzes feedback to improve test quality.
              </p>

              {bugSuccessMessage ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{bugSuccessMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitBug} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Issue Category
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/15 focus:border-slate-900 dark:focus:border-[#EBFF00] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-colors"
                    >
                      <option value="platform-glitch">Platform / UI Glitch</option>
                      <option value="wrong-answer">Question Answer Dispute / Mistake</option>
                      <option value="typo">Spelling or Mathematical Typo</option>
                      <option value="image-issue">Diagram / Formula Rendering Issue</option>
                      <option value="billing">Tuition / Payment Inquiry</option>
                      <option value="other">Other General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Describe What Happened
                    </label>
                    <textarea
                      rows={4}
                      value={bugMessage}
                      onChange={(e) => setBugMessage(e.target.value)}
                      placeholder="Please include details such as which section, question number, or screen you encountered this on..."
                      className="w-full bg-slate-50 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/15 focus:border-slate-900 dark:focus:border-[#EBFF00] rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  {bugErrorMessage && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bugErrorMessage}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsBugModalOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBug || !bugMessage.trim()}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#EBFF00] hover:bg-[#d4e600] disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#EBFF00]/10"
                    >
                      {isSubmittingBug ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Send Report
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
