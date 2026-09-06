import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { StudentTopicsRoadmapClient } from "@/components/student/topics/StudentTopicsRoadmapClient";

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
        title="Lessons & Syllabus"
        breadcrumbs={[{ label: "Student" }, { label: "Lessons" }]}
      >
        <div className="max-w-xl mx-auto my-12 text-center bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            No Study Group Assigned
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            You are not enrolled in an active class group yet. Please ask your teacher or administrator to assign you to a class to unlock your syllabus lessons and practice materials.
          </p>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
      title="Lessons"
      breadcrumbs={[{ label: "Student" }, { label: "Lessons" }]}
    >
      <StudentTopicsRoadmapClient
        groupName={group?.name || "Class Group"}
        progress={progress}
      />
    </StudentLayout>
  );
}
