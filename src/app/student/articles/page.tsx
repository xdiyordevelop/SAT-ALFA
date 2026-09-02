import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import Link from "next/link";
import { BookOpen, Search, Clock } from "lucide-react";

export default async function StudentArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/login");

  const { q, category } = await searchParams;

  const whereClause: any = { published: true };
  if (q) {
    whereClause.title = { contains: q, mode: "insensitive" };
  }
  if (category && category !== "ALL") {
    whereClause.category = category;
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  const categories = [
    "ALL",
    "SCIENCE",
    "HISTORY",
    "LITERATURE",
    "STRATEGY",
    "VOCABULARY",
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#131313] text-slate-800 dark:text-slate-200">
      <Sidebar username={session.username} role={session.role} />
      <div className="lg:ml-64 flex-1 min-w-0 w-full lg:w-[calc(100%-16rem)]">
        <Topbar
          title="Reading Room"
          breadcrumbs={[{ label: "Student" }, { label: "Articles" }]}
        />
        <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              SAT Reading Room
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Master the digital SAT with interactive articles, KaTeX math
              parsing, and integrated vocabulary highlights.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <form>
                <input
                  type="text"
                  name="q"
                  defaultValue={q || ""}
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
                />
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
              </form>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 hide-scrollbar">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/student/articles?category=${cat}${q ? `&q=${q}` : ""}`}
                  className={`whitespace-nowrap px-4 py-3 rounded-xl text-sm font-bold transition-colors ${category === cat || (!category && cat === "ALL") ? "bg-yellow-500 text-slate-950" : "bg-white dark:bg-[#131313] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/10"}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/10 border-dashed">
                No articles found matching your criteria.
              </div>
            ) : (
              articles.map((article) => (
                <Link
                  href={`/student/articles/${article.slug}`}
                  key={article.id}
                  className="block group bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-yellow-500/50 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-md">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {article.readTimeMin}m
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-900 dark:text-yellow-500 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-white/10">
                    <span>{article.viewsCount} views</span>
                    <span className="text-yellow-500 font-medium group-hover:underline">
                      Read Article &rarr;
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
