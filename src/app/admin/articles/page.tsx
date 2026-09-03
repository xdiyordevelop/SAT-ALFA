import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { FileText, Plus, FileUp, Edit, Trash2 } from "lucide-react";
import { deleteArticle } from "@/server/actions/article.actions";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { filter } = await searchParams;
  const statusFilter = filter || "all";

  const articles = await prisma.article.findMany({
    where:
      statusFilter === "published"
        ? { published: true }
        : statusFilter === "draft"
          ? { published: false }
          : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout
      title="Articles & Reading"
      breadcrumbs={[{ label: "Admin" }, { label: "Articles" }]}
      userName={session.username}
      userEmail={session.username || ""}
      userRole={session.role}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Articles & Reading Room
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles/create"
            className="flex items-center gap-2 bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write Article
              </Link>
              <Link
                href="/admin/articles/import"
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-4 py-2 rounded-xl font-bold transition-colors"
              >
                <FileUp className="w-4 h-4" />
                Import from PDF
              </Link>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Link
              href="/admin/articles"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === "all" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-[#0a0a0a]"}`}
            >
              All
            </Link>
            <Link
              href="/admin/articles?filter=published"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === "published" ? "bg-yellow-500/20 text-yellow-500" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-[#0a0a0a]"}`}
            >
              Published
            </Link>
            <Link
              href="/admin/articles?filter=draft"
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === "draft" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-[#0a0a0a]"}`}
            >
              Drafts
            </Link>
          </div>

          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white dark:bg-[#131313] border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Views</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {articles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-white mb-1">
                          {article.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {article.summary}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-slate-100 dark:bg-[#1c1b1b] text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-bold tracking-wider">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {article.published ? (
                          <span className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 px-2 py-1 rounded font-medium">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {article.viewsCount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-yellow-500 bg-white dark:bg-[#131313] hover:bg-slate-100 dark:bg-[#1c1b1b] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <form
                            action={async () => {
                              "use server";
                              await deleteArticle(article.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 bg-white dark:bg-[#131313] hover:bg-slate-100 dark:bg-[#1c1b1b] rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
    </AdminLayout>
  );
}
