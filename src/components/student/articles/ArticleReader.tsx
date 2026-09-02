"use client";
import { useState } from "react";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { BookOpen, X, Clock, Eye } from "lucide-react";

export function ArticleReader({ article }: { article: any }) {
  const vocabList = (article.vocabulary || []) as Array<{
    word: string;
    definition: string;
    context: string;
  }>;
  const [activeVocab, setActiveVocab] = useState<number | null>(null);

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start relative">
      <article className="flex-1 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-8 md:p-12 w-full min-w-0">
        <header className="mb-10 pb-10 border-b border-slate-200 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg uppercase tracking-wider">
              {article.category}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-4 h-4" /> {article.readTimeMin} min read
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Eye className="w-4 h-4" /> {article.viewsCount} views
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
            {article.summary}
          </p>
        </header>
        <div className="prose prose-slate prose-amber max-w-none prose-lg prose-img:rounded-xl prose-img:border prose-img:border-slate-200 dark:border-white/10 prose-headings:text-slate-900 dark:text-white prose-a:text-yellow-500">
          <MathRenderer text={article.content} />
        </div>
      </article>

      {/* Interactive Vocabulary Sidebar */}
      {vocabList.length > 0 && (
        <aside className="w-full xl:w-80 shrink-0 sticky top-24">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                SAT Vocabulary
              </h3>
            </div>
            <div className="space-y-3">
              {vocabList.map((v, i) => (
                <div
                  key={i}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${activeVocab === i ? "bg-white dark:bg-[#131313] border-yellow-500/50" : "bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 hover:border-slate-200 dark:border-white/10"}`}
                >
                  <button
                    onClick={() => setActiveVocab(activeVocab === i ? null : i)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between font-bold text-slate-900 dark:text-white"
                  >
                    <span className="text-slate-900 dark:text-yellow-500">
                      {v.word}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      {activeVocab === i ? "Close" : "View"}
                    </span>
                  </button>
                  {activeVocab === i && (
                    <div className="px-4 pb-4 animate-slide-down">
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                        {v.definition}
                      </p>
                      <div className="bg-slate-50 dark:bg-[#0a0a0a] p-3 rounded-lg border border-slate-200 dark:border-white/10">
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          "{v.context}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
