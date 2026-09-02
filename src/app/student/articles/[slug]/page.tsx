import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ArticleReader } from "@/components/student/articles/ArticleReader";
export default async function ArticleReadingRoom({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/login");
  const { slug } = await params; // Auto-increment views
  let article;
  try {
    article = await prisma.article.update({
      where: { slug },
      data: { viewsCount: { increment: 1 } },
    });
  } catch (err) {
    article = await prisma.article.findUnique({ where: { slug } });
  }
  if (!article || !article.published) notFound();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-700 dark:text-slate-300">
      {" "}
      <Sidebar username={session.username} role={session.role} />{" "}
      <div className="lg:ml-64 flex-1 min-w-0 w-full lg:w-[calc(100%-16rem)]">
        {" "}
        <Topbar
          title={article.title}
          breadcrumbs={[
            { label: "Student" },
            { label: "Reading Room", href: "/student/articles" },
            { label: "Read" },
          ]}
        />{" "}
        <main className="pt-24 px-6 pb-12 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
          {" "}
          <div className="flex-1 w-full min-w-0">
            {" "}
            <ArticleReader article={article} />{" "}
          </div>{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
