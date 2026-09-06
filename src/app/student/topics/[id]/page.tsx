import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  PlayCircle,
  Lock,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getYoutubeEmbedUrl, isValidYoutubeUrl } from "@/lib/utils/youtube";

export default async function StudentTopicViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT" || !session.userId) {
    redirect("/login");
  }

  const { id: topicId } = await params;
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile || !profile.groupId) {
    redirect("/student/topics");
  }

  // Fetch all progress items for this group to enable sequential navigation
  const allProgress = await prisma.groupTopicProgress.findMany({
    where: { groupId: profile.groupId },
    orderBy: { order: "asc" },
    include: { topic: true },
  });

  const currentIndex = allProgress.findIndex((p) => p.topicId === topicId);
  const currentProgress = currentIndex !== -1 ? allProgress[currentIndex] : null;

  // If topic not in group or not approved, render friendly locked layout
  if (!currentProgress || !currentProgress.isApproved) {
    return (
      <StudentLayout
        title="Locked Lesson"
        breadcrumbs={[
          { label: "Student" },
          { label: "Lessons", href: "/student/topics" },
          { label: "Locked" },
        ]}
      >
        <div className="max-w-lg mx-auto my-16 text-center bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-sm animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Lesson Locked
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            This lesson is part of your group&apos;s curriculum, but has not been approved by your teacher yet. It will automatically unlock once assigned in class.
          </p>
          <Link
            href="/student/topics"
            className="inline-flex items-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lessons Roadmap</span>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { topic } = currentProgress;

  // Previous & Next navigation
  const prevProgress = currentIndex > 0 ? allProgress[currentIndex - 1] : null;
  const nextProgress = currentIndex < allProgress.length - 1 ? allProgress[currentIndex + 1] : null;

  const isYoutube = isValidYoutubeUrl(topic.videoPath);
  const embedUrl = isYoutube
    ? getYoutubeEmbedUrl(topic.videoPath, { rel: 0, modestbranding: 1, controls: 1 })
    : topic.videoPath;
  const isMath = topic.subject.toUpperCase() === "MATH";
  const studentWatermark = `${profile.firstName} ${profile.lastName} • ${profile.phone}`;

  return (
    <StudentLayout
      title={topic.title}
      breadcrumbs={[
        { label: "Student" },
        { label: "Lessons", href: "/student/topics" },
        { label: topic.title },
      ]}
    >
      <div className="space-y-8 pb-12">
        {/* Top Back Link & Step Badge */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/student/topics"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#EBFF00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lessons Roadmap</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400">
              Lesson {currentIndex + 1} of {allProgress.length}
            </span>
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                isMath
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
              }`}
            >
              {topic.subject}
            </span>
          </div>
        </div>

        {/* Lesson Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
            {topic.title}
          </h1>
          {topic.description && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {topic.description}
            </p>
          )}
        </div>

        {/* 2-Column Grid: Video Player (Main) & Practice Materials (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center text-[#EBFF00]">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      Video Lesson
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Watch the core concepts explained
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              {topic.videoPath ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-200 dark:border-white/10 group">
                  {isYoutube ? (
                    <iframe
                      src={embedUrl || undefined}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video
                      src={topic.videoPath || undefined}
                      controls
                      controlsList="nodownload"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}

                  {/* Anti-Leak Student Watermark (Discrete floating identifier) */}
                  <div className="absolute top-3 right-3 pointer-events-none select-none z-10 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] sm:text-xs font-mono font-medium text-white/50 tracking-wider">
                    {studentWatermark}
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <PlayCircle className="w-10 h-10 mb-2 opacity-40 text-[#EBFF00]" />
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    No video lecture uploaded yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Your instructor will cover this topic in live sessions, or refer to the practice materials on the right.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Practice Materials & Reference Book */}
          <div className="space-y-6 lg:sticky lg:top-20">
            <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center text-[#EBFF00]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    Practice Materials
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Lesson handbook &amp; homework PDF
                  </p>
                </div>
              </div>

              {topic.bookTitle || topic.bookPdfPath ? (
                <div className="space-y-4">
                  {topic.bookTitle && (
                    <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Assigned Textbook / Chapter
                      </p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#EBFF00] shrink-0" />
                        <span>{topic.bookTitle}</span>
                      </p>
                    </div>
                  )}

                  {topic.bookPdfPath ? (
                    <div className="space-y-3">
                      <a
                        href={topic.bookPdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 px-5 py-3.5 rounded-2xl font-black text-xs transition-all shadow-md group"
                      >
                        <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Download Practice PDF / Book</span>
                      </a>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                        Use this PDF for theory formulas, step-by-step examples, and homework practice problems.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center italic">
                      PDF file will be provided by your instructor.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">
                    No additional PDF attached to this lesson.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Lesson Navigation Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Lesson */}
          {prevProgress && prevProgress.isApproved ? (
            <Link
              href={`/student/topics/${prevProgress.topic.id}`}
              className="w-full sm:w-auto flex items-center gap-3 p-3.5 px-5 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 hover:border-[#EBFF00]/60 rounded-2xl transition-all text-left group shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Previous Lesson
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs group-hover:text-[#EBFF00] transition-colors">
                  {prevProgress.topic.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {/* Roadmap Center Button */}
          <Link
            href="/student/topics"
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#EBFF00] transition-colors"
          >
            All Lessons Roadmap
          </Link>

          {/* Next Lesson */}
          {nextProgress ? (
            nextProgress.isApproved ? (
              <Link
                href={`/student/topics/${nextProgress.topic.id}`}
                className="w-full sm:w-auto flex items-center justify-end gap-3 p-3.5 px-5 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 hover:border-[#EBFF00]/60 rounded-2xl transition-all text-right group shadow-sm"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Next Lesson
                  </p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs group-hover:text-[#EBFF00] transition-colors">
                    {nextProgress.topic.title}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center text-[#EBFF00] shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ) : (
              <div className="w-full sm:w-auto flex items-center justify-end gap-3 p-3.5 px-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl text-right opacity-60">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Next (Locked)
                  </p>
                  <p className="text-xs font-bold text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                    {nextProgress.topic.title}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
            )
          ) : (
            <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>You reached the end of the syllabus!</span>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
