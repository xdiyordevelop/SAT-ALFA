import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArticleEditor } from "@/components/admin/articles/ArticleEditor";
export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();
  return (
    <AdminLayout
      title="Edit Article"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Articles", href: "/admin/articles" },
        { label: "Edit" },
      ]}
      userName={session.username || "Admin"}
      userEmail={session.username || "admin@satalfa.uz"}
      userRole={session.role}
    >
      <ArticleEditor initialData={article} />
    </AdminLayout>
  );
}
