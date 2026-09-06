import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions/auth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminHelpCenterClient } from "@/components/admin/help/AdminHelpCenterClient";

export const metadata = {
  title: "Staff Help & SOPs | SAT-ALFA Admin",
  description: "Standard operating procedures, proctoring guidelines, and test authoring documentation",
};

export default async function AdminHelpPage() {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Staff Operations & SOPs"
      breadcrumbs={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Help & SOPs" },
      ]}
      userName={session.username || "Staff"}
      userEmail={session.username}
      userRole={session.role}
    >
      <AdminHelpCenterClient />
    </AdminLayout>
  );
}
