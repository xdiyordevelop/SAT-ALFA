"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FileUp, Loader2, XCircle } from "lucide-react";
import { saveParsedArticle } from "@/server/actions/article.actions";
import { renderPdfToCanvases, cropAndUploadCanvas } from "./pdf-helper";

export default function ImportArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProgressMsg("Preparing PDF for AI...");

    const formData = new FormData(e.currentTarget);
    const file = formData.get("pdf") as File;

    // Add 180-second explicit timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
      // 1. Render all pages to canvases
      const pages = await renderPdfToCanvases(file);

      setProgressMsg("Analyzing document with Gemini...");
      // 2. Send the base64 images to the API instead of raw PDF
      const apiFormData = new FormData();
      apiFormData.append("filename", file.name);
      pages.forEach((p, idx) => {
        apiFormData.append(`page_${idx + 1}`, p.base64);
      });

      const res = await fetch("/api/admin/articles/parse-pdf", {
        method: "POST",
        body: apiFormData,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error
            ? data.error +
              (data.details ? " Details: " + JSON.stringify(data.details) : "")
            : `Server error (${res.status})`,
        );
      }

      if (!data) {
        throw new Error("Failed to parse response from server");
      }

      setProgressMsg("Processing extracted images...");

      // 3. Replace image tags in content
      let markdownContent = data.content as string;

      // Look for tags like: [IMAGE_BOX: pageNum, ymin, xmin, ymax, xmax]
      const regex =
        /\[IMAGE_BOX:\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/g;
      const matches = [...markdownContent.matchAll(regex)];

      for (const match of matches) {
        const fullTag = match[0];
        const pageNum = parseInt(match[1]);
        const ymin = parseInt(match[2]);
        const xmin = parseInt(match[3]);
        const ymax = parseInt(match[4]);
        const xmax = parseInt(match[5]);

        const pageData = pages.find((p) => p.pageNum === pageNum);
        if (pageData && pageData.canvas) {
          const url = await cropAndUploadCanvas(pageData.canvas, {
            ymin,
            xmin,
            ymax,
            xmax,
          });
          if (url) {
            markdownContent = markdownContent.replace(
              fullTag,
              `\n\n![Article Image](${url})\n\n`,
            );
          } else {
            markdownContent = markdownContent.replace(
              fullTag,
              `\n\n*(Failed to extract image)*\n\n`,
            );
          }
        }
      }

      setProgressMsg("Saving article...");
      // Save it as draft
      const result = await saveParsedArticle({
        ...data,
        content: markdownContent,
        published: false,
      });

      router.push(`/admin/articles/${result.id}/edit`);
    } catch (err: any) {
      console.error(err);
      if (err.name === "AbortError") {
        setError(
          "Parsing took too long. Please try again with a smaller document.",
        );
      } else {
        setError(err.message || "Failed to process the PDF. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setProgressMsg("");
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#131313] text-slate-800 dark:text-slate-200">
      <Sidebar username="Admin" role="ADMIN" />
      <div className="lg:ml-64 flex-1 min-w-0 w-full lg:w-[calc(100%-16rem)]">
        <Topbar
          title="Import PDF Article"
          breadcrumbs={[
            { label: "Admin" },
            { label: "Articles" },
            { label: "Import" },
          ]}
        />
        <main className="pt-24 px-6 pb-12 max-w-2xl mx-auto">
          <form
            onSubmit={handleUpload}
            className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-8 rounded-2xl text-center"
          >
            <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileUp className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Import from PDF
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              Upload a PDF document. Gemini 2.5 Flash will extract the full
              article content, KaTeX math formulas, and 6–10 SAT vocabulary
              words automatically.
            </p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 flex items-start justify-between text-left">
                <div className="text-rose-600 text-sm">{error}</div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-rose-600 hover:text-rose-300 transition-colors ml-4 shrink-0"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                PDF Document
              </label>
              <input
                type="file"
                name="pdf"
                accept=".pdf"
                className="w-full text-slate-700 dark:text-slate-300 bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading
                ? progressMsg || "Analyzing Document..."
                : "Extract Article"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
