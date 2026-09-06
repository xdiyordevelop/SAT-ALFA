import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";
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
    <StudentLayout
      title="Reading Room"
      breadcrumbs={[{ label: "Student" }, { label: "Articles" }]}
    >
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
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-[#EBFF00]"
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
              className={`whitespace-nowrap px-4 py-3 rounded-xl text-sm font-bold transition-colors ${category === cat || (!category && cat === "ALL") ? "bg-[#EBFF00] text-slate-950" : "bg-white dark:bg-[#131313] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-white/10"}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 border-dashed">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-40" />
            <p className="font-bold text-slate-800 dark:text-white">No articles found matching your criteria.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try exploring other categories or clearing your search query.
            </p>
          </div>
        ) : (
          articles.map((article) => {
            let vocabCount = 0;
            try {
              if (Array.isArray(article.vocabulary)) {
                vocabCount = article.vocabulary.length;
              } else if (typeof article.vocabulary === "string") {
                const parsed = JSON.parse(article.vocabulary);
                if (Array.isArray(parsed)) vocabCount = parsed.length;
              }
            } catch {
              vocabCount = 0;
            }

            return (
              <Link
                href={`/student/articles/${article.slug}`}
                key={article.id}
                className="group flex flex-col bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#EBFF00]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
              >
                {/* Cover Image or Aesthetic Fallback */}
                {article.coverImage ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-[#EBFF00] px-2.5 py-1 rounded-md shadow-sm">
                        {article.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-[#1a1a1a] dark:via-[#161616] dark:to-[#0f0f0f] p-4 flex flex-col justify-between border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#EBFF00] bg-[#EBFF00]/10 px-2.5 py-1 rounded-md border border-[#EBFF00]/20">
                        {article.category}
                      </span>
                      <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[#EBFF00] transition-colors" />
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {!article.coverImage && null}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {article.readTimeMin} min read
                    </span>
                    {vocabCount > 0 && (
                      <span className="text-[11px] bg-yellow-500/10 text-yellow-600 dark:text-[#EBFF00] px-2 py-0.5 rounded-full font-bold">
                        {vocabCount} vocab words
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#EBFF00] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                    <span>{article.viewsCount} views</span>
                    <span className="text-slate-900 dark:text-white group-hover:text-[#EBFF00] font-bold flex items-center gap-1 transition-colors">
                      Read Article &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </StudentLayout>
  );
}
