"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  FileUp,
  Loader2,
  XCircle,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Globe,
  Eye,
  Edit,
  RotateCcw,
  BookOpen,
  Clock,
  ExternalLink,
} from "lucide-react";
import { saveParsedArticle, toggleArticlePublish } from "@/server/actions/article.actions";
import { renderPdfToCanvases, cropAndUploadCanvas } from "./pdf-helper";

interface ImportedArticleInfo {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  category: string;
  readTimeMin: number;
  vocabCount: number;
  coverImage: string | null;
}

interface ArticleImportClientProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function ArticleImportClient({
  userRole = "ADMIN",
  userName = "Admin",
  userEmail = "admin@satalfa.uz",
}: ArticleImportClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);

  // Success state after import
  const [importedArticle, setImportedArticle] = useState<ImportedArticleInfo | null>(null);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  const steps = [
    { title: "Prepare Document", desc: "Loading pages & rendering canvas" },
    { title: "Gemini 3.7 Flash", desc: "Extracting sections, math & SAT vocab" },
    { title: "Process Figures", desc: "Cropping diagrams & cover image" },
    { title: "Save & Finalize", desc: "Saving to reading room" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else if (selected) {
      setError("Please select a valid PDF file (.pdf)");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setError("");
    } else if (dropped) {
      setError("Only PDF files are supported");
    }
  };

  const handleTogglePublished = async () => {
    if (!importedArticle || isTogglingPublish) return;
    setIsTogglingPublish(true);
    try {
      const res = await toggleArticlePublish(importedArticle.id);
      setImportedArticle((prev) =>
        prev ? { ...prev, published: res.published } : null
      );
    } catch (err: any) {
      setError(err?.message || "Failed to toggle status");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImportedArticle(null);
    setError("");
    setActiveStep(0);
    setProgressMsg("");
  };

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF document to import.");
      return;
    }

    setLoading(true);
    setError("");
    setActiveStep(1);
    setProgressMsg("Preparing PDF document...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
      // 1. Render all pages to canvases if possible
      let pages: any[] = [];
      try {
        pages = await renderPdfToCanvases(file);
      } catch (canvasErr) {
        console.warn("Client canvas render skipped, using direct PDF upload:", canvasErr);
      }

      // 2. Send both raw PDF and page base64 images to API
      setActiveStep(2);
      setProgressMsg("Analyzing document with Gemini 3.7 Flash...");

      const apiFormData = new FormData();
      apiFormData.append("pdf", file);
      apiFormData.append("filename", file.name);

      if (pages.length > 0) {
        pages.forEach((p, idx) => {
          apiFormData.append(`page_${idx + 1}`, p.base64);
        });
      }

      const res = await fetch("/api/admin/articles/parse-pdf", {
        method: "POST",
        body: apiFormData,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error
            ? data.error + (data.details ? " Details: " + JSON.stringify(data.details) : "")
            : `Server error (${res.status})`
        );
      }

      if (!data) {
        throw new Error("Failed to parse response from server");
      }

      setActiveStep(3);
      setProgressMsg("Processing extracted figures and illustrations...");

      // 3. Replace image tags in content
      let markdownContent = data.content as string;
      const regex = /\[IMAGE_BOX:\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([^\]]+))?\]/g;
      const matches = [...markdownContent.matchAll(regex)];

      let firstExtractedUrl: string | null = null;
      for (const match of matches) {
        const fullTag = match[0];
        const pageNum = parseInt(match[1]);
        const ymin = parseInt(match[2]);
        const xmin = parseInt(match[3]);
        const ymax = parseInt(match[4]);
        const xmax = parseInt(match[5]);
        const caption = match[6]?.trim() || "Illustration";

        const pageData = pages.find((p) => p.pageNum === pageNum);
        if (pageData && pageData.canvas) {
          const url = await cropAndUploadCanvas(pageData.canvas, {
            ymin,
            xmin,
            ymax,
            xmax,
          });
          if (url) {
            if (!firstExtractedUrl) firstExtractedUrl = url;
            markdownContent = markdownContent.replace(
              fullTag,
              `\n\n![${caption}](${url})\n\n`
            );
          } else {
            markdownContent = markdownContent.replace(
              fullTag,
              `\n\n*(Figure extraction skipped)*\n\n`
            );
          }
        } else {
          markdownContent = markdownContent.replace(fullTag, "");
        }
      }

      setActiveStep(4);
      setProgressMsg(
        publishImmediately
          ? "Saving and publishing article for students..."
          : "Saving draft to database..."
      );

      // 4. Save parsed article with requested publish status
      const cover = data.coverImage || firstExtractedUrl || null;
      const result = await saveParsedArticle({
        ...data,
        content: markdownContent,
        coverImage: cover,
        published: publishImmediately,
      });

      // Instead of forcing navigation to edit page, show success screen
      setImportedArticle({
        id: result.id,
        title: result.title,
        slug: result.slug,
        published: result.published,
        category: result.category,
        readTimeMin: result.readTimeMin,
        vocabCount: Array.isArray(result.vocabulary) ? result.vocabulary.length : 0,
        coverImage: cover,
      });
    } catch (err: any) {
      console.error(err);
      if (err.name === "AbortError") {
        setError("Parsing took longer than expected. Please try again with a smaller file.");
      } else {
        setError(err.message || "Failed to process the PDF document. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setProgressMsg("");
    }
  }

  return (
    <AdminLayout
      title="Import PDF Article"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Articles", href: "/admin/articles" },
        { label: "Import" },
      ]}
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
    >
      <div className="max-w-2xl mx-auto py-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#EBFF00]/10 text-[#EBFF00] border border-[#EBFF00]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileUp className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Import Article from PDF
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Upload any academic PDF, science paper, or study guide. Gemini 3.7 Flash converts it into a full SAT reading passage with KaTeX math and vocabulary.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 flex items-start justify-between text-left animate-in fade-in duration-200">
            <div className="text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed">
              {error}
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-rose-500 hover:text-rose-400 ml-4 shrink-0"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* If imported successfully, show Celebratory Success Screen */}
        {importedArticle ? (
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Article Imported Successfully!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI extracted full passage text, KaTeX formulas, and SAT vocabulary.
              </p>
            </div>

            {/* Article Card */}
            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-4">
                {importedArticle.coverImage ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-slate-900">
                    <img
                      src={importedArticle.coverImage}
                      alt={importedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#EBFF00]/10 border border-[#EBFF00]/20 flex items-center justify-center shrink-0 text-[#EBFF00]">
                    <BookOpen className="w-7 h-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold bg-[#EBFF00]/10 border border-[#EBFF00]/20 text-[#EBFF00] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {importedArticle.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {importedArticle.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {importedArticle.readTimeMin} min read
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#EBFF00]" />
                      {importedArticle.vocabCount} SAT vocabulary words
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & 1-Click Toggle */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Status:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-bold ${
                      importedArticle.published
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        importedArticle.published ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      }`}
                    />
                    {importedArticle.published ? "Published" : "Draft"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePublished}
                  disabled={isTogglingPublish}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isTogglingPublish ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  {importedArticle.published ? "Move to Draft" : "Publish Now"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href={`/student/articles/${importedArticle.slug}`}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 py-3 rounded-xl font-black text-xs transition-all shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Student Reading Room</span>
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Link
                  href="/admin/articles"
                  className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Articles List
                </Link>

                <Link
                  href={`/admin/articles/${importedArticle.id}/edit`}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Open in Editor
                </Link>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Import Another PDF
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Upload Card */
          <form onSubmit={handleUpload}>
            <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file
                    ? "border-[#EBFF00] bg-[#EBFF00]/5"
                    : "border-slate-200 dark:border-white/10 hover:border-[#EBFF00]/60 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                } ${loading ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  name="pdf"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#EBFF00] text-black flex items-center justify-center mb-3 shadow-md">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-sm mb-1">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • Click or drop to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-3">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      Click to select PDF or drag & drop
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports scientific papers, historical passages, and study guides (.pdf)
                    </p>
                  </div>
                )}
              </div>

              {/* Publish Immediately Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 mt-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      publishImmediately
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-slate-200 dark:bg-white/5 text-slate-400"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Publish immediately upon import
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Make available in the student reading room right away without drafting
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPublishImmediately(!publishImmediately)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    publishImmediately ? "bg-[#EBFF00]" : "bg-slate-300 dark:bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                      publishImmediately ? "translate-x-6" : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Stepper progress when loading */}
              {loading && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-4 h-4 text-[#EBFF00] animate-spin" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {progressMsg}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {steps.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isDone = activeStep > stepNum;
                      const isCurrent = activeStep === stepNum;
                      return (
                        <div
                          key={step.title}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isDone
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : isCurrent
                              ? "bg-[#EBFF00]/10 border-[#EBFF00]/30 text-slate-900 dark:text-white"
                              : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-400 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Step {stepNum}
                            </span>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            {isCurrent && <Loader2 className="w-3 h-3 text-[#EBFF00] animate-spin" />}
                          </div>
                          <p className="text-xs font-bold truncate">{step.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/admin/articles")}
                  disabled={loading}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 px-6 py-3 rounded-xl font-black text-xs transition-all disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Article with AI</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
