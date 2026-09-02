import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AdminMockTestsView } from "@/components/admin/mock-tests/AdminMockTestsView";

export default async function AdminMockTestResultsPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const allTests = await prisma.mockTest.findMany({
    include: {
      student: {
        include: {
          user: true,
          group: true,
        },
      },
      performances: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] ">
      <Sidebar username={session.username} role={session.role} />

      <div className="lg:ml-64">
        <Topbar
          title="Student Results"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Mock Tests", href: "/admin/mock-tests" },
            { label: "Results" },
          ]}
          userName={session.username}
          userRole={session.role}
        />

        <main className="pt-24 px-6 pb-12">
          <AdminMockTestsView allTests={allTests} initialTab="results" />
        </main>
      </div>
    </div>
  );
}
