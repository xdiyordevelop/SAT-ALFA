import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { GroupDetailContent } from "@/components/admin/groups/GroupDetailContent";
interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}
export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  const { id } = await params; // Get current month
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      studentProfiles: {
        include: { user: true, payments: { where: { month: currentMonth } } },
        orderBy: { firstName: "asc" },
      },
    },
  });
  if (!group) {
    notFound();
  } // Get unassigned students or all students for the add modal // To avoid huge payloads, you could fetch just active students who are not in this group
  const otherStudents = await prisma.studentProfile.findMany({
    where: { status: "ACTIVE", NOT: { groupId: id } },
    include: {
      user: { select: { username: true } },
      group: { select: { name: true } },
    },
    orderBy: { firstName: "asc" },
  });
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-700 dark:text-slate-300">
      {" "}
      <Sidebar username={session.username} role={session.role} />{" "}
      <div className="lg:ml-64">
        {" "}
        <Topbar
          title="Group Details"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Groups", href: "/admin/groups" },
            { label: group.name },
          ]}
        />{" "}
        <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
          {" "}
          <GroupDetailContent
            group={group}
            otherStudents={otherStudents}
            currentMonth={currentMonth}
          />{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
