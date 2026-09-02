import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CreateStudentForm } from "@/components/admin/students/CreateStudentForm";

export default async function CreateStudentPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Create Student"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Students" },
        { label: "Create" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Create New Student
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Add a new student to the system
        </p>
      </div>

      <CreateStudentForm />
    </AdminLayout>
  );
}
