import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download, PlayCircle } from "lucide-react";

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

  const progress = await prisma.groupTopicProgress.findUnique({
    where: { groupId_topicId: { groupId: profile.groupId, topicId: topicId } },
    include: { topic: true },
  });

  if (!progress || !progress.isApproved) {
    // Backend Guard
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-slate-900 dark:text-white flex-col">
        <h1 className="text-3xl font-bold mb-4">403 - Forbidden</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          This lesson is locked or not available for your group yet.
        </p>
        <Link
          href="/student/topics"
          className="bg-yellow-600 px-4 py-2 rounded"
        >
          Return to Roadmap
        </Link>
      </div>
    );
  }

  const { topic } = progress;

  // Extract youtube video ID for embedding
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const embedUrl = topic.videoPath ? getYoutubeEmbedUrl(topic.videoPath) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      <Sidebar username={session.username} role={session.role} />
      <div className="lg:ml-64">
        <Topbar
          title={topic.title}
          breadcrumbs={[
            { label: "Student" },
            { label: "Curriculum" },
            { label: topic.title },
          ]}
        />
        <main className="pt-24 px-6 pb-12 max-w-6xl mx-auto">
          <Link
            href="/student/topics"
            className="inline-flex items-center gap-2 text-slate-900 dark:text-yellow-500 hover:text-yellow-700 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Roadmap
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-900 dark:text-yellow-500 bg-slate-50 dark:bg-[#0a0a0a]">
                {topic.subject}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-slate-600 dark:text-slate-400 max-w-3xl text-lg">
                {topic.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player Section */}
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-yellow-500" /> Video
                  Lesson
                </h2>
                {topic.videoPath ? (
                  topic.videoPath.startsWith("http") ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] shadow-inner">
                      <iframe
                        src={embedUrl || undefined}
                        className="absolute inset-0 w-full h-full border-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] shadow-inner">
                      <video
                        src={topic.videoPath || undefined}
                        controls
                        controlsList="nodownload"
                        className="absolute inset-0 w-full h-full object-contain"
                      ></video>
                    </div>
                  )
                ) : (
                  <div className="w-full aspect-video rounded-xl bg-slate-100 dark:bg-[#1c1b1b] flex items-center justify-center flex-col text-slate-500 dark:text-slate-400">
                    <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
                    <p>No video lesson available for this topic.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Materials Section */}
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm sticky top-28">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-500" /> Learning
                  Materials
                </h2>
                {topic.bookTitle || topic.bookPdfPath ? (
                  <div className="space-y-4">
                    {topic.bookTitle && (
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                          Reference Book
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {topic.bookTitle}
                        </p>
                      </div>
                    )}
                    {topic.bookPdfPath && (
                      <a
                        href={topic.bookPdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] hover:bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 rounded-xl font-medium transition-colors border border-yellow-200"
                      >
                        <Download className="w-4 h-4" /> Download PDF / Open
                        Book
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No additional materials provided.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
