import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
    <AdminLayout
      title="Student Results"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests", href: "/admin/mock-tests" },
        { label: "Results" },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      <AdminMockTestsView allTests={allTests} initialTab="results" />
    </AdminLayout>
  );
}
