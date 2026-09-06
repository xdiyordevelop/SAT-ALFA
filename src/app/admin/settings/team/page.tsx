import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { TeamManagementClient } from "@/components/admin/settings/TeamManagementClient";
import { getTeamMembers } from "@/server/actions/team.actions";
import { canManageTeam, isStaff } from "@/lib/permissions/auth";

export default async function AdminTeamPage() {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    redirect("/login");
  }

  if (!canManageTeam(session)) {
    return (
      <AdminLayout
        title="Settings Restricted"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Team & Staff" },
        ]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Team Management Restricted"
          message="Managing administrative team members, roles, and platform permissions is restricted to Super Administrators."
          requiredRole="Super Admin"
        />
      </AdminLayout>
    );
  }

  const members = await getTeamMembers();

  return (
    <AdminLayout
      title="Team & Staff"
      breadcrumbs={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Team & Staff" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Team & Staff
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Manage admin, teacher, and manager accounts and configure platform access
          </p>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="md:col-span-1">
            <SettingsSidebar />
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <TeamManagementClient
              initialMembers={members}
              currentUserId={session.userId}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
