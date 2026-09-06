import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  History,
  Maximize2,
  Play,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MockTestLobbyPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!studentProfile) {
    redirect("/login");
  }

  // Fetch the mock test
  const test = await prisma.sATMockTest.findUnique({
    where: { id },
    include: {
      questions: {
        select: {
          id: true,
          module: true,
          format: true,
        },
      },
      studentAttempts: {
        where: { studentId: studentProfile.id },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (!test) {
    notFound();
  }

  const m1Count = test.questions.filter((q) => q.module === "MODULE_1").length || 27;
  const m2Count = test.questions.filter((q) => q.module === "MODULE_2").length || 27;
  const m3Count = test.questions.filter((q) => q.module === "MODULE_3").length || 22;
  const m4Count = test.questions.filter((q) => q.module === "MODULE_4").length || 22;
  const totalQuestions = test.questions.length || m1Count + m2Count + m3Count + m4Count;

  const previousAttempts = test.studentAttempts.filter((a) => a.completedAt !== null);
  const bestScore = previousAttempts.length > 0
    ? Math.max(...previousAttempts.map((a) => a.totalScore || 0))
    : null;

  return (
    <StudentLayout title={test.name}>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/student/mock-tests"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mock Tests
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-xl shadow-black/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#EBFF00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[#EBFF00]/15 text-slate-900 dark:text-[#EBFF00] border border-[#EBFF00]/30 rounded-lg text-xs font-bold tracking-wider uppercase">
                Digital SAT Simulation
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium">
                Official 4-Module Structure
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {test.name}
            </h1>

            {test.description ? (
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-3xl mb-6 leading-relaxed">
                {test.description}
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-3xl mb-6 leading-relaxed">
                Full-length adaptive digital SAT practice test mirroring the official College Board Bluebook testing environment.
              </p>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Duration</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">134 Minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Questions</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{totalQuestions} Total</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sections</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">R&W + Math</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBFF00]/15 flex items-center justify-center text-slate-900 dark:text-[#EBFF00] shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your Best Score</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {bestScore ? `${bestScore} / 1600` : "Not attempted"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Structure Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-900 dark:text-[#EBFF00]" />
            Test Structure & Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1: Reading and Writing */}
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Section 1: Reading and Writing
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                  64 mins total
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Module 1</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reading comprehension & writing craft</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{m1Count} questions</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">32 minutes</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Module 2</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Expression of ideas & standard English</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{m2Count} questions</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">32 minutes</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Followed by a scheduled 10-minute break before Section 2 begins.
              </p>
            </div>

            {/* Section 2: Math */}
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Section 2: Math
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">
                  70 mins total
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Module 1</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Algebra, Advanced Math & Problem Solving</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{m3Count} questions</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">35 minutes</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Module 2</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Geometry, Trigonometry & Data Analysis</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{m4Count} questions</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">35 minutes</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Integrated Desmos graphing calculator and official formula sheet enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Pre-Exam Checklist & Guidelines */}
        <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Exam Room Checklist & Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
              <Maximize2 className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Fullscreen Enforced</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The test must remain in full-screen mode. Leaving full screen or switching tabs will be logged as an irregularity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
              <Calculator className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Built-in Desmos Calculator</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You may use the embedded graphing calculator on all Math questions via the calculator button in the top bar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
              <ShieldAlert className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">No Return Policy</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Once time runs out or you submit a module, you cannot return to any questions from earlier modules.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5">
              <History className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Auto-Saving Progress</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Answers and bookmarks are automatically saved locally and synchronized with the server every 10 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Ready to Begin?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ensure you have a quiet environment and a stable internet connection.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/student/mock-tests"
              className="w-full sm:w-auto px-5 py-3.5 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-center"
            >
              Cancel
            </Link>
            <Link
              href={`/student/mock-tests/${test.id}/take`}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(235,255,0,0.25)] hover:shadow-[0_0_25px_rgba(235,255,0,0.4)] whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              Enter Testing Room & Begin
            </Link>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
