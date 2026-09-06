"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  Clock,
  Eye,
  AlertTriangle,
  X,
  Globe,
  EyeOff,
  CheckCircle2,
  Loader2,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import {
  deleteArticle,
  toggleArticlePublish,
  bulkSetArticlePublish,
  bulkDeleteArticles,
} from "@/server/actions/article.actions";

type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string | null;
  coverImage: string | null;
  published: boolean;
  viewsCount: number;
  readTimeMin: number;
  createdAt: Date;
  updatedAt: Date;
};

export function AdminArticlesTable({
  articles: initialArticles,
}: {
  articles: ArticleItem[];
}) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [articleToDelete, setArticleToDelete] = useState<ArticleItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [bulkConfirmDelete, setBulkConfirmDelete] = useState(false);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const categories = ["ALL", "SCIENCE", "HISTORY", "LITERATURE", "STRATEGY", "VOCABULARY"];

  const filteredArticles = articles.filter((art) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "published"
        ? art.published
        : !art.published;

    const matchesCategory =
      categoryFilter === "ALL" || art.category.toUpperCase() === categoryFilter;

    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      art.title.toLowerCase().includes(q) ||
      (art.summary && art.summary.toLowerCase().includes(q)) ||
      art.slug.toLowerCase().includes(q);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const isAllSelected =
    filteredArticles.length > 0 &&
    filteredArticles.every((a) => selectedIds.has(a.id));
  const isSomeSelected =
    filteredArticles.some((a) => selectedIds.has(a.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredArticles.forEach((a) => next.add(a.id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // 1-Click Publish / Unpublish Toggle
  const handleTogglePublish = async (article: ArticleItem) => {
    if (togglingId) return;
    setTogglingId(article.id);

    const prevPublished = article.published;
    const newPublished = !prevPublished;

    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, published: newPublished } : a))
    );

    try {
      await toggleArticlePublish(article.id);
      showFeedback(
        "success",
        newPublished
          ? `"${article.title.slice(0, 32)}..." is now published and visible to students.`
          : `"${article.title.slice(0, 32)}..." moved to drafts.`
      );
    } catch (err: any) {
      // Rollback
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, published: prevPublished } : a))
      );
      showFeedback("error", err?.message || "Failed to update article status.");
    } finally {
      setTogglingId(null);
    }
  };

  // Bulk Publish / Unpublish
  const handleBulkPublish = (publish: boolean) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    startTransition(async () => {
      try {
        await bulkSetArticlePublish(ids, publish);
        setArticles((prev) =>
          prev.map((a) => (selectedIds.has(a.id) ? { ...a, published: publish } : a))
        );
        setSelectedIds(new Set());
        showFeedback(
          "success",
          `${ids.length} articles successfully ${publish ? "published" : "moved to drafts"}.`
        );
      } catch (err: any) {
        showFeedback("error", err?.message || "Bulk update failed.");
      }
    });
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    startTransition(async () => {
      try {
        await bulkDeleteArticles(ids);
        setArticles((prev) => prev.filter((a) => !selectedIds.has(a.id)));
        setSelectedIds(new Set());
        setBulkConfirmDelete(false);
        showFeedback("success", `${ids.length} articles deleted.`);
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to delete articles.");
      }
    });
  };

  // Single Delete
  const handleDelete = () => {
    if (!articleToDelete) return;
    startTransition(async () => {
      try {
        await deleteArticle(articleToDelete.id);
        setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
        setArticleToDelete(null);
        showFeedback("success", "Article deleted successfully.");
      } catch (err: any) {
        showFeedback("error", err?.message || "Failed to delete article.");
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-3.5 px-4 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span className="truncate">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-3 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-white dark:bg-[#1f1f1f] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({articles.length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "published"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Published ({articles.filter((a) => a.published).length})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "draft"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Drafts ({articles.filter((a) => !a.published).length})
          </button>
        </div>

        {/* Search input & Category dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#EBFF00]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-[#EBFF00] text-black"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 dark:bg-[#1a1a1a] text-white p-3 px-4 rounded-xl border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#EBFF00] text-black font-black text-[11px] flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-slate-200">
              selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkPublish(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish
            </button>
            <button
              onClick={() => handleBulkPublish(false)}
              disabled={isPending}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Draft
            </button>
            <button
              onClick={() => setBulkConfirmDelete(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              title="Deselect"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Articles Table - Full Width Responsive Table without Horizontal Scroll */}
      <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <button
                  onClick={handleSelectAll}
                  type="button"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title={isAllSelected ? "Deselect all" : "Select all visible"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#EBFF00]" />
                  ) : isSomeSelected ? (
                    <MinusSquare className="w-4 h-4 text-[#EBFF00]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-3 font-semibold">Article</th>
              <th className="w-24 hidden md:table-cell px-3 py-3 font-semibold">Category</th>
              <th className="w-28 sm:w-32 px-3 py-3 font-semibold">Status</th>
              <th className="w-20 hidden lg:table-cell px-3 py-3 font-semibold">Read</th>
              <th className="w-16 hidden xl:table-cell px-3 py-3 font-semibold">Views</th>
              <th className="w-28 sm:w-32 px-3 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {filteredArticles.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-40" />
                  <p className="font-semibold text-sm">No articles found.</p>
                  <p className="text-xs mt-1 text-slate-400">
                    Try clearing your search query or selecting another filter.
                  </p>
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => {
                const isSelected = selectedIds.has(article.id);
                const isToggling = togglingId === article.id;

                return (
                  <tr
                    key={article.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                      isSelected ? "bg-[#EBFF00]/[0.03] dark:bg-[#EBFF00]/[0.02]" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(article.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#EBFF00]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Article Info */}
                    <td className="px-3 py-3 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {article.coverImage ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-900">
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center shrink-0 text-[#EBFF00]">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 dark:text-white truncate leading-tight">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 truncate">
                            <span className="md:hidden font-semibold uppercase text-[10px] text-slate-300">
                              {article.category} •
                            </span>
                            <span className="lg:hidden">
                              {article.readTimeMin}m •
                            </span>
                            <span className="truncate">
                              {article.summary || article.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category (md and up) */}
                    <td className="w-24 hidden md:table-cell px-3 py-3">
                      <span className="text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block">
                        {article.category}
                      </span>
                    </td>

                    {/* Status - 1-Click Interactive Toggle */}
                    <td className="w-28 sm:w-32 px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(article)}
                        disabled={isToggling}
                        title={
                          article.published
                            ? "Published. Click to unpublish (hide from students)"
                            : "Draft. Click to publish immediately"
                        }
                        className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all border shadow-sm ${
                          article.published
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                        } ${isToggling ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              article.published ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                            }`}
                          />
                        )}
                        <span>{article.published ? "Published" : "Draft"}</span>
                      </button>
                    </td>

                    {/* Read Time (lg and up) */}
                    <td className="w-20 hidden lg:table-cell px-3 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{article.readTimeMin} min</span>
                      </div>
                    </td>

                    {/* Views (xl and up) */}
                    <td className="w-16 hidden xl:table-cell px-3 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>{article.viewsCount}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="w-28 sm:w-32 px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick 1-Click Publish/Unpublish Icon Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(article)}
                          disabled={isToggling}
                          title={article.published ? "Move to drafts" : "Publish immediately"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            article.published
                              ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 bg-slate-100 dark:bg-white/5"
                              : "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 bg-slate-100 dark:bg-white/5"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : article.published ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Globe className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Student Reader Preview */}
                        <Link
                          href={`/student/articles/${article.slug}`}
                          target="_blank"
                          title="Preview in Student Reading Room"
                          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Edit in Full Editor */}
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          title="Open Editor"
                          className="p-1.5 text-slate-400 hover:text-yellow-500 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setArticleToDelete(article)}
                          title="Delete Article"
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 bg-slate-100 dark:bg-white/5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Single Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete Article?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to permanently delete this article? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 mb-5">
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {articleToDelete.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>{articleToDelete.category}</span>
                <span>•</span>
                <span>{articleToDelete.viewsCount} views</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete {selectedIds.size} articles?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  All selected articles will be permanently removed from the database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setBulkConfirmDelete(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
              >
                {isPending ? "Deleting..." : `Delete All (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
