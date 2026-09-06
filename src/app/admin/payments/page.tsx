import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { canManagePayments, isStaff } from "@/lib/permissions/auth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import { PaymentsClient } from "./PaymentsClient";

export default async function PaymentsPage() {
  const session = await getSession();

  if (!session || !isStaff(session)) {
    redirect("/login");
  }

  if (!canManagePayments(session)) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[{ label: "Admin" }, { label: "Payments" }]}
        userName={session.username}
        userEmail={session.username || ""}
        userRole={session.role}
      >
        <AccessDeniedView
          title="Finance & Payments Restricted"
          message="Financial records, student tuition balances, and payment processing are restricted to Super Administrators and Managers."
          requiredRole="Super Admin or Manager"
        />
      </AdminLayout>
    );
  }

  return (
    <PaymentsClient
      userRole={session.role}
      userName={session.username}
      userEmail={session.username || "admin@satalfa.uz"}
    />
  );
}
