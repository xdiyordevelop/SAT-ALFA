import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
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

  const relatedArticles = await prisma.article.findMany({
    where: {
      published: true,
      category: article.category,
      id: { not: article.id },
    },
    take: 3,
    orderBy: { viewsCount: "desc" },
  });

  return (
    <StudentLayout
      title={article.title}
      breadcrumbs={[
        { label: "Student" },
        { label: "Reading Room", href: "/student/articles" },
        { label: article.category },
      ]}
    >
      <div className="flex-1 w-full min-w-0">
        <ArticleReader article={article} relatedArticles={relatedArticles} />
      </div>
    </StudentLayout>
  );
}
