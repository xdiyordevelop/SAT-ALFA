import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Users, Calendar, Plus, BookOpen, DollarSign } from "lucide-react";

export default async function GroupsPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  const isUserTeacher = session.role === "TEACHER";
  const staffProfile = isUserTeacher
    ? await prisma.staffProfile.findUnique({ where: { userId: session.userId } })
    : null;
  const teacherNames = [session.username.toLowerCase()];
  if (staffProfile?.fullName) teacherNames.push(staffProfile.fullName.toLowerCase());

  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
  });

  const groupsWithCounts = await Promise.all(
    groups.map(async (group) => {
      const studentCount = await prisma.studentProfile.count({
        where: { groupId: group.id },
      });
      const isMyGroup =
        isUserTeacher &&
        !!group.teacher &&
        teacherNames.includes(group.teacher.toLowerCase());
      return { ...group, studentCount, isMyGroup };
    }),
  );

  // If teacher, show their assigned groups first, or all if none assigned
  const displayedGroups = isUserTeacher
    ? groupsWithCounts.sort((a, b) => (b.isMyGroup ? 1 : 0) - (a.isMyGroup ? 1 : 0))
    : groupsWithCounts;

  return (
    <AdminLayout
      title="Groups"
      breadcrumbs={[{ label: "Admin" }, { label: "Groups" }]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      {/* Page Header */}
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Group Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isUserTeacher
              ? "View your assigned classes, track student attendance, and guide curriculum roadmaps."
              : "Manage and organize student groups, memberships, and billing."}
          </p>
        </div>
        {!isUserTeacher && (
          <Link
            href="/admin/groups/create"
            className="px-6 py-3 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#EBFF00]/10"
          >
            <Plus className="w-5 h-5" />
            New Group
          </Link>
        )}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGroups.length > 0 ? (
              displayedGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="animate-slide-up"
                  style={{
                    animation: `slideUp 0.3s ease-out ${100 + index * 50}ms backwards`,
                  }}
                >
                  <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-6 hover:border-[#EBFF00]/50 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {group.name}
                        </h3>
                        <span className="inline-flex px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md text-[10px] font-bold tracking-wider uppercase">
                          {group.status}
                        </span>
                        {group.isMyGroup && (
                          <span className="inline-flex ml-2 px-2 py-0.5 bg-[#EBFF00]/10 text-yellow-600 dark:text-[#EBFF00] border border-[#EBFF00]/30 rounded-md text-[10px] font-bold tracking-wider uppercase">
                            My Class
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 flex-1 relative z-10">
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm">
                          <strong className="text-slate-900 dark:text-white">
                            {group.studentCount}
                          </strong>{" "}
                          students
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm">
                          {group.monthlyFee
                            ? group.monthlyFee.toLocaleString() + " UZS / month"
                            : "Free"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 relative z-10">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/groups/${group.id}`}
                          className="w-full text-center py-2 px-4 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-lg font-bold text-sm transition-colors"
                        >
                          View Settings
                        </Link>
                        <Link
                          href={`/admin/groups/${group.id}/curriculum`}
                          className="w-full text-center py-2 px-4 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-[#EBFF00] rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" /> Curriculum
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#1c1b1b] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No groups found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Create your first group to get started
                </p>
              </div>
            )}
          </div>
    </AdminLayout>
  );
}
