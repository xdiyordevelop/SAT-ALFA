import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestImporterContent } from "./content";

export default async function AdminTestImporterPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Import SAT Tests"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Import" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="max-w-6xl">
        <Link
          href="/admin/mock-tests/create"
          className="inline-flex items-center gap-2 text-slate-900 dark:text-[#EBFF00] hover:text-[#d9ff00] font-medium mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Test Creation Hub
        </Link>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#d9ff00] mb-2">
                AI-Powered Test Importer
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Convert PDF, Word, and text files into structured SAT mock tests
                with one click
              </p>
            </div>

            <TestImporterContent />
      </div>
    </AdminLayout>
  );
}
