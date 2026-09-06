"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateArticle, createArticle } from "@/server/actions/article.actions";
import { MathRenderer } from "@/components/ui/MathRenderer";
import {
  Save,
  Eye,
  Edit2,
  Plus,
  Trash2,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  Quote,
  Calculator,
  Image as ImageIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";

type VocabEntry = { word: string; definition: string; context: string };

function deserializeVocab(raw: unknown): VocabEntry[] {
  if (!raw) return [];
  try {
    const arr: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr.map((v: any) => ({
      word: v?.word || "",
      definition: v?.definition || "",
      context: v?.contextSentence || v?.context || "",
    }));
  } catch {
    return [];
  }
}

export function ArticleEditor({ initialData }: { initialData: any }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    category: initialData?.category || "STRATEGY",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || "",
    readTimeMin: initialData?.readTimeMin || 5,
    vocabulary: deserializeVocab(initialData?.vocabulary),
  });

  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const wordCount = (formData.content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const suggestedReadTime = Math.max(1, Math.ceil(wordCount / 180));

  const contentImages = React.useMemo(() => {
    const matches = [...(formData.content || "").matchAll(/!\[(.*?)\]\((.*?)\)/g)];
    return matches.map((m) => ({ alt: m[1], url: m[2], fullMatch: m[0] }));
  }, [formData.content]);

  const insertFormatting = (
    prefix: string,
    suffix: string = "",
    placeholder: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || placeholder;
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  };

  const handleSave = async (published: boolean) => {
    if (!formData.title.trim()) {
      setStatusMsg({ type: "error", text: "Please provide an article title." });
      return;
    }
    if (!formData.content.trim()) {
      setStatusMsg({ type: "error", text: "Article content cannot be empty." });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      if (formData.id) {
        await updateArticle(formData.id, { ...formData, published });
      } else {
        const created = await createArticle({ ...formData, published });
        setFormData((prev) => ({ ...prev, id: created.id, slug: created.slug }));
      }
      setStatusMsg({
        type: "success",
        text: published
          ? "Article published successfully!"
          : "Draft saved successfully!",
      });
      setTimeout(() => router.push("/admin/articles"), 800);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.message || "Failed to save article. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append("file", file);
    body.append("type", "image");

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
        setStatusMsg({ type: "success", text: "Cover image uploaded!" });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to upload image",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVocabChange = (index: number, field: string, value: string) => {
    const newVocab = [...(formData.vocabulary || [])];
    newVocab[index] = { ...newVocab[index], [field]: value };
    setFormData((prev) => ({ ...prev, vocabulary: newVocab }));
  };

  const removeVocab = (index: number) => {
    const newVocab = [...(formData.vocabulary || [])];
    newVocab.splice(index, 1);
    setFormData((prev) => ({ ...prev, vocabulary: newVocab }));
  };

  const addVocab = () => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: [
        ...(prev.vocabulary || []),
        { word: "", definition: "", context: "" },
      ],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formData.id ? "Edit Article" : "Write New Article"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Author and format SAT reading articles with KaTeX formulas and vocabulary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl transition-all text-xs sm:text-sm font-bold border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            {isPreview ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#EBFF00]" />}
            {isPreview ? "Editor View" : "Preview Mode"}
          </button>
          <button
            disabled={loading}
            onClick={() => handleSave(false)}
            className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-xl transition-all text-xs sm:text-sm font-bold border border-slate-200 dark:border-white/10 disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            disabled={loading}
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-5 py-2 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-950 rounded-xl transition-all text-xs sm:text-sm font-black shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Publish Article
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: Left Column (Editor/Preview) & Right Column (Metadata/Vocab) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            {!isPreview ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#EBFF00]"
                    placeholder="e.g. Evolutionary Adaptations in Deep Sea Ecosystems"
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Short Summary / Subtitle
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#EBFF00] h-20 resize-none"
                    placeholder="A concise 1-2 sentence overview of the article's core thesis..."
                  />
                </div>

                {/* Rich Markdown & KaTeX Toolbar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Article Content (Markdown + KaTeX) *
                    </label>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>~{suggestedReadTime} min read</span>
                    </div>
                  </div>

                  {/* Formatting Buttons Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-t-xl">
                    <button
                      type="button"
                      title="Heading 2"
                      onClick={() => insertFormatting("\n## ", "\n", "Heading Title")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Heading 3"
                      onClick={() => insertFormatting("\n### ", "\n", "Subheading Title")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => insertFormatting("**", "**", "bold text")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => insertFormatting("*", "*", "italic text")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Bullet List"
                      onClick={() => insertFormatting("\n- ", "", "list item")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Blockquote"
                      onClick={() => insertFormatting("\n> ", "\n", "quoted text")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                    <button
                      type="button"
                      title="KaTeX Inline Math ($x$)"
                      onClick={() => insertFormatting("$", "$", "x^2 + y^2 = r^2")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                    >
                      <Calculator className="w-3.5 h-3.5" /> $x$
                    </button>
                    <button
                      type="button"
                      title="KaTeX Display Equation ($$x$$)"
                      onClick={() => insertFormatting("\n$$\n", "\n$$\n", "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      $$E=mc^2$$
                    </button>
                    <button
                      type="button"
                      title="Insert Image"
                      onClick={() => insertFormatting("![Figure description](", ")", "https://...")}
                      className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Image
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-t-0 border-slate-200 dark:border-white/10 rounded-b-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#EBFF00] h-[550px] font-mono text-xs sm:text-sm leading-relaxed"
                    placeholder="Write article in Markdown. Wrap math formulas in $...$ and $$...$$. Use ## for sections..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="pb-6 border-b border-slate-200 dark:border-white/10">
                  <span className="text-xs font-bold text-[#EBFF00] bg-[#EBFF00]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {formData.category}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3 mb-2">
                    {formData.title || "Untitled Article"}
                  </h1>
                  {formData.summary && (
                    <p className="text-base text-slate-500 dark:text-slate-400">
                      {formData.summary}
                    </p>
                  )}
                </div>
                <div className="prose prose-slate dark:prose-invert prose-yellow max-w-none">
                  <MathRenderer text={formData.content} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Metadata
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="SCIENCE">SCIENCE</option>
                  <option value="HISTORY">HISTORY</option>
                  <option value="LITERATURE">LITERATURE</option>
                  <option value="STRATEGY">STRATEGY</option>
                  <option value="VOCABULARY">VOCABULARY</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-500 dark:text-slate-400">
                    Read Time (min)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        readTimeMin: suggestedReadTime,
                      }))
                    }
                    className="text-[11px] text-[#EBFF00] hover:underline flex items-center gap-1"
                    title={`Calculate based on ${wordCount} words`}
                  >
                    <Clock className="w-3 h-3" /> Auto ({suggestedReadTime}m)
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  value={formData.readTimeMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      readTimeMin: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Cover Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="https://... or upload"
                    value={formData.coverImage}
                    onChange={(e) =>
                      setFormData({ ...formData, coverImage: e.target.value })
                    }
                    className="w-full bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? "..." : "Upload"}
                  </button>
                </div>
                {formData.coverImage && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 aspect-video bg-slate-900 group">
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, coverImage: "" }))
                      }
                      className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1 rounded-md text-xs transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {contentImages.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#EBFF00]" />
                    Images in Article ({contentImages.length})
                  </span>
                  <div className="space-y-2">
                    {contentImages.map((img, idx) => {
                      const isCover = formData.coverImage === img.url;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                        >
                          <img
                            src={img.url}
                            alt={img.alt || "Article graphic"}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-900 shrink-0 border border-slate-200 dark:border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                              {img.alt || "Inline Image"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {isCover ? (
                                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  Current Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      coverImage: img.url,
                                    }))
                                  }
                                  className="text-[10px] text-[#EBFF00] hover:underline font-bold"
                                >
                                  Set as Cover
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Vocabulary
              </h3>
              <button
                onClick={addVocab}
                className="text-yellow-500 hover:text-slate-900 dark:text-yellow-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {(formData.vocabulary || []).map((v: any, i: number) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-4 rounded-xl relative"
                >
                  <button
                    onClick={() => removeVocab(i)}
                    className="absolute top-2 right-2 text-slate-500 dark:text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Word"
                    value={v.word}
                    onChange={(e) =>
                      handleVocabChange(i, "word", e.target.value)
                    }
                    className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 pb-1 mb-2 text-yellow-500 font-bold outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Definition"
                    value={v.definition}
                    onChange={(e) =>
                      handleVocabChange(i, "definition", e.target.value)
                    }
                    className="w-full bg-transparent mb-2 text-slate-900 dark:text-white outline-none text-sm"
                  />
                  <textarea
                    placeholder="Context"
                    value={v.context}
                    onChange={(e) =>
                      handleVocabChange(i, "context", e.target.value)
                    }
                    className="w-full bg-transparent text-slate-500 dark:text-slate-400 outline-none text-xs resize-none"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
