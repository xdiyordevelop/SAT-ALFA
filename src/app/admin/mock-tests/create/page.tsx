import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import CreateMockTestClient from "./CreateMockTestClient";

export default async function CreateMockTestPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminLayout
      title="Create Mock Test"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Mock Tests" },
        { label: "Create" },
      ]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <CreateMockTestClient />
    </AdminLayout>
  );
}
