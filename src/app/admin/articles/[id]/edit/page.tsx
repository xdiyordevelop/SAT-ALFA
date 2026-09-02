import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-700 dark:text-slate-300">
      {" "}
      <Sidebar username={session.username} role={session.role} />{" "}
      <div className="lg:ml-64 flex-1 min-w-0 w-full lg:w-[calc(100%-16rem)]">
        {" "}
        <Topbar
          title="Edit Article"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Articles", href: "/admin/articles" },
            { label: "Edit" },
          ]}
        />{" "}
        <main className="pt-24 px-6 pb-12 max-w-5xl mx-auto">
          {" "}
          <ArticleEditor initialData={article} />{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
