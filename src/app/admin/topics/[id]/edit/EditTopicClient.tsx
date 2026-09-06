"use client";

import { useState, useEffect, FormEvent, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  ArrowLeft,
  Trash2,
  UploadCloud,
  X,
  FileText,
  Film,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Check,
  BookOpen,
  Link2,
} from "lucide-react";
import Link from "next/link";
import {
  extractYoutubeVideoId,
  getYoutubeEmbedUrl,
  isValidYoutubeUrl,
  YoutubeIcon,
} from "@/lib/utils/youtube";

interface Group {
  id: string;
  name: string;
}

export default function EditTopicClient({
  topic,
  username,
  role,
}: {
  topic: any;
  username: string;
  role: string;
}) {
  const router = useRouter();

  const isInitialYoutube = isValidYoutubeUrl(topic.videoPath);

  // Basic Info
  const [title, setTitle] = useState(topic.title || "");
  const [description, setDescription] = useState(topic.description || "");
  const [subject, setSubject] = useState(topic.subject || "MATH");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    topic.groupProgress ? topic.groupProgress.map((gp: any) => gp.groupId) : []
  );
  const [groups, setGroups] = useState<Group[]>([]);

  // Materials
  const [bookTitle, setBookTitle] = useState(topic.bookTitle || "");
  const [bookPdfPath, setBookPdfPath] = useState(topic.bookPdfPath || "");
  const [youtubeUrl, setYoutubeUrl] = useState(topic.videoPath || "");

  // Upload States (PDF Books only)
  const [pdfFile, setPdfFile] = useState<{ name: string; size: number } | null>(
    topic.bookPdfPath
      ? { name: topic.bookPdfPath.split("/").pop() || "Existing PDF", size: 0 }
      : null
  );
  const [pdfUploading, setPdfUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/groups")
      .then((res) => res.json())
      .then((data) => {
        if (data.groups) {
          setGroups(data.groups);
        } else if (Array.isArray(data)) {
          setGroups(data);
        }
      })
      .catch(console.error);
  }, []);

  const handleGroupToggle = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const uploadPdfFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed for books");
      return;
    }
    setPdfUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "pdf");
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBookPdfPath(data.url);
        setPdfFile({ name: data.name || file.name, size: data.size || file.size });
      })
      .catch((err) => setError(err.message))
      .finally(() => setPdfUploading(false));
  };

  const handlePdfDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadPdfFile(file);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!title.trim()) {
        throw new Error("Topic title is required");
      }
      let finalVideoPath = "";
      const trimmed = youtubeUrl.trim();
      if (trimmed) {
        if (!isValidYoutubeUrl(trimmed)) {
          throw new Error("Please enter a valid YouTube video link (watch, youtu.be, embed, or shorts)");
        }
        finalVideoPath = trimmed;
      }

      const response = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subject,
          bookTitle,
          bookPdfPath,
          videoPath: finalVideoPath,
          groupIds: selectedGroups,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "Failed to update topic");
      }
      setSuccess("Topic updated successfully!");
      setTimeout(() => {
        router.push("/admin/topics");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this topic? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete topic");
      router.push("/admin/topics");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Edit Topic"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Topics", href: "/admin/topics" },
        { label: "Edit" },
      ]}
      userName={username}
      userEmail={username ? `${username}@satalfa.uz` : "admin@satalfa.uz"}
      userRole={role}
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin/topics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#EBFF00] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Topics</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Edit Topic
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Update lesson details, subject classification, assigned groups, and curriculum materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Delete Topic</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading || deleting}
            className="px-6 py-2.5 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-2xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-7 h-7 rounded-xl bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] font-bold text-xs flex items-center justify-center border border-[#EBFF00]/20">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Basic Information
              </h2>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Topic Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Linear Equations in One Variable"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#EBFF00] outline-none transition-all"
                />
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  Subject Classification <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                      subject === "MATH"
                        ? "border-[#EBFF00] bg-[#EBFF00]/10 text-slate-900 dark:text-white shadow-sm"
                        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="subject"
                      value="MATH"
                      checked={subject === "MATH"}
                      onChange={(e) => setSubject(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        subject === "MATH"
                          ? "border-[#EBFF00] bg-[#EBFF00]"
                          : "border-slate-400 dark:border-slate-600"
                      }`}
                    >
                      {subject === "MATH" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      )}
                    </div>
                    <span className="font-bold text-sm">SAT Math</span>
                  </label>

                  <label
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                      subject === "READING_WRITING"
                        ? "border-[#EBFF00] bg-[#EBFF00]/10 text-slate-900 dark:text-white shadow-sm"
                        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="subject"
                      value="READING_WRITING"
                      checked={subject === "READING_WRITING"}
                      onChange={(e) => setSubject(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        subject === "READING_WRITING"
                          ? "border-[#EBFF00] bg-[#EBFF00]"
                          : "border-slate-400 dark:border-slate-600"
                      }`}
                    >
                      {subject === "READING_WRITING" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      )}
                    </div>
                    <span className="font-bold text-sm">Reading & Writing</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Topic Overview / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the core rules, formulas, and skills covered in this topic..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#EBFF00] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Assigned Groups */}
          <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] font-bold text-xs flex items-center justify-center border border-[#EBFF00]/20">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Assign to Student Groups
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {selectedGroups.length} of {groups.length} selected
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Select which groups should have this topic in their learning syllabus and track completion.
            </p>

            {groups.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                <p className="text-sm text-slate-400">No active groups found in system.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {groups.map((group) => {
                  const isChecked = selectedGroups.includes(group.id);
                  return (
                    <label
                      key={group.id}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? "border-[#EBFF00] bg-[#EBFF00]/10 text-slate-900 dark:text-white"
                          : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? "border-[#EBFF00] bg-[#EBFF00] text-slate-900"
                            : "border-slate-400 dark:border-slate-600"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-semibold truncate">
                        {group.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Materials & Uploads */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#131313] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-7 h-7 rounded-xl bg-[#EBFF00]/10 text-slate-900 dark:text-[#EBFF00] font-bold text-xs flex items-center justify-center border border-[#EBFF00]/20">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Curriculum Materials
              </h2>
            </div>

            <div className="space-y-6">
              {/* Book Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Textbook Title <span className="font-normal text-slate-400 lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g., College Panda SAT Math Chapter 3"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-[#EBFF00] outline-none transition-all"
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  PDF Book / Worksheet
                </label>

                {!pdfFile && !bookPdfPath ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handlePdfDrop}
                    onClick={() => pdfInputRef.current?.click()}
                    className={`w-full p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                      pdfUploading
                        ? "border-[#EBFF00] bg-[#EBFF00]/5"
                        : "border-slate-200 dark:border-white/10 hover:border-[#EBFF00] hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      ref={pdfInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPdfFile(file);
                      }}
                      className="hidden"
                    />
                    {pdfUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-7 h-7 animate-spin text-[#EBFF00]" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Uploading PDF...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-2">
                          <UploadCloud className="w-5 h-5 text-[#EBFF00]" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                          Click or drag PDF file here
                        </p>
                        <p className="text-[11px] text-slate-400">PDF up to 50MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {pdfFile?.name || "Uploaded PDF Document"}
                        </p>
                        {pdfFile?.size ? (
                          <p className="text-[11px] text-slate-400">{formatSize(pdfFile.size)}</p>
                        ) : (
                          <p className="text-[11px] text-emerald-500 font-medium">Ready</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        setBookPdfPath("");
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
                      title="Remove PDF"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* YouTube Video Lesson Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    YouTube Video Lesson
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                    <YoutubeIcon className="w-3 h-3" />
                    <span>0 MB Server Space</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
                      <YoutubeIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono"
                    />
                    {youtubeUrl && (
                      <button
                        type="button"
                        onClick={() => setYoutubeUrl("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        title="Clear URL"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* YouTube URL Validation & Preview */}
                  {youtubeUrl.trim() ? (
                    isValidYoutubeUrl(youtubeUrl) ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Valid YouTube link detected (Video ID:{" "}
                            <code className="font-mono">{extractYoutubeVideoId(youtubeUrl)}</code>)
                          </span>
                        </div>
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-white/10 shadow-inner">
                          <iframe
                            src={getYoutubeEmbedUrl(youtubeUrl) || undefined}
                            className="absolute inset-0 w-full h-full border-0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          Incomplete or unrecognized YouTube link. Please paste a standard video or shorts URL.
                        </span>
                      </div>
                    )
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      💡 Paste an <strong>Unlisted (Доступ по ссылке)</strong> YouTube video URL. Zero storage consumed on your server with instant adaptive streaming.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
