import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { CreateGroupForm } from "@/components/admin/groups/CreateGroupForm";

export default async function CreateGroupPage() {
  const session = await getSession();

  if (!session || session.role === "STUDENT") {
    redirect("/login");
  }

  if (session.role === "TEACHER") {
    return (
      <AdminLayout
        title="Group Creation Restricted"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Groups", href: "/admin/groups" },
          { label: "Create" },
        ]}
        userName={session.username}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Classroom Creation Restricted"
          message="Creating new groups, configuring tuition fees, and classroom scheduling is managed by Administrators and Managers."
          requiredRole="Super Admin or Manager"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Create Group"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Groups" },
        { label: "Create" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Create New Group
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Set up a new student group
        </p>
      </div>

      <CreateGroupForm />
    </AdminLayout>
  );
}
