import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import Link from "next/link";
import { Lock, PlayCircle, Book, CheckCircle2 } from "lucide-react";

export default async function StudentTopicsRoadmapPage() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT" || !session.userId) {
    redirect("/login");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile || !profile.groupId) {
    return (
      <StudentLayout
        title="My Curriculum"
        breadcrumbs={[{ label: "Student" }, { label: "Curriculum" }]}
      >
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            No Group Assigned
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Please ask your administrator to assign you to a class group to
            access the curriculum.
          </p>
        </div>
      </StudentLayout>
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: profile.groupId },
    include: {
      groupProgress: {
        orderBy: { order: "asc" },
        include: {
          topic: true,
        },
      },
    },
  });

  const progress = group?.groupProgress || [];

  return (
    <StudentLayout
      title="My Curriculum Roadmap"
      breadcrumbs={[{ label: "Student" }, { label: "Curriculum" }]}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Syllabus Roadmap
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Follow your class's learning path. Unlock new topics as your
          teacher approves them.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 space-y-8">
        {progress.map((item: any, index: number) => {
          const isApproved = item.isApproved;
          const isCurrent =
            !isApproved && (index === 0 || progress[index - 1]?.isApproved);
          const isLocked = !isApproved && !isCurrent;

          // In this design, only approved topics are accessible.
          const canAccess = isApproved;

          return (
            <div key={item.id} className="relative pl-8">
              <div
                className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white dark:bg-[#131313] ${
                  isApproved ? 'border-green-500' : isCurrent ? 'border-yellow-500' : 'border-neutral-300'
                }`}
              >
                {isApproved && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-[#EBFF00]" />
                )}
              </div>

              {canAccess ? (
                <Link href={`/student/topics/${item.topicId}`}>
                  <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-5 hover:border-yellow-500 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1c1b1b]">
                            Step {index + 1}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-900 dark:text-yellow-500 bg-slate-50 dark:bg-[#0a0a0a]">
                            {item.topic.subject}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-yellow-500 transition-colors">
                          {item.topic.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {item.topic.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-yellow-500">
                        {item.topic.videoPath && (
                          <PlayCircle className="w-5 h-5" />
                        )}
                        {(item.topic.bookTitle ||
                          item.topic.bookPdfPath) && (
                          <Book className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl p-5 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 bg-neutral-200/50">
                          Step {index + 1}
                        </span>
                        {isCurrent && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-900 dark:text-yellow-500 bg-slate-50 dark:bg-[#0a0a0a]">
                            Current
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-slate-500 dark:text-slate-400">
                        {item.topic.title}
                      </h3>
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-[#1c1b1b] rounded-full">
                      <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> This lesson is locked until
                    approved by the teacher.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {progress.length === 0 && (
          <div className="pl-8 text-slate-500 dark:text-slate-400">
            Your group doesn't have any topics assigned yet.
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
