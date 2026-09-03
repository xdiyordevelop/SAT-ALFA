"use client";

import { useState, useEffect, FormEvent, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";


import {
  ArrowLeft,
  UploadCloud,
  X,
  FileText,
  Film,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
}

export default function CreateTopicPage() {
  const router = useRouter();

  // Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("MATH");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Materials
  const [bookTitle, setBookTitle] = useState("");
  const [bookPdfPath, setBookPdfPath] = useState("");
  const [videoPath, setVideoPath] = useState("");

  // Upload States
  const [pdfFile, setPdfFile] = useState<{ name: string; size: number } | null>(
    null,
  );
  const [videoFile, setVideoFile] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/groups")
      .then((res) => res.json())
      .then((data) => {
        if (data.groups) {
          setGroups(data.groups);
        }
      })
      .catch(console.error);
  }, []);

  const handleGroupToggle = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const uploadFile = (file: File, type: "pdf" | "video") => {
    if (type === "pdf") {
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
          setPdfFile({ name: data.name, size: data.size });
        })
        .catch((err) => setError(err.message))
        .finally(() => setPdfUploading(false));
    } else {
      if (!file.type.includes("video/")) {
        setError("Invalid video format");
        return;
      }
      setVideoUploading(true);
      setError("");
      setVideoProgress(10); // Fake initial progress

      // We will simulate progress since fetch doesn't support upload progress natively easily without XHR
      const interval = setInterval(() => {
        setVideoProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 500);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");

      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setVideoPath(data.url);
          setVideoFile({ name: data.name, size: data.size });
          setVideoProgress(100);
        })
        .catch((err) => setError(err.message))
        .finally(() => {
          clearInterval(interval);
          setTimeout(() => setVideoUploading(false), 500);
        });
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: "pdf" | "video") => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file, type);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!title.trim()) {
        throw new Error("Topic title is required");
      }

      const response = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subject,
          bookTitle,
          bookPdfPath,
          videoPath,
          groupIds: selectedGroups,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "Failed to create topic");
      }

      setSuccess("Topic created successfully!");
      setTimeout(() => {
        router.push("/admin/topics");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Create Topic"
      breadcrumbs={[
        { label: "Admin" },
        { label: "Topics" },
        { label: "Create" },
      ]}
      userName="Admin"
      userEmail="admin@satalfa.uz"
      userRole="ADMIN"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin/topics"
            className="inline-flex items-center gap-2 text-slate-900 dark:text-[#EBFF00] hover:text-[#d9ff00] font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create New Topic
          </h1>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("submit-btn")?.click();
          }}
              disabled={loading}
              className="px-6 py-3 bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 rounded-xl font-medium transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
            >
              {loading ? "Saving..." : "Save Topic"}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-600 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            <button type="submit" id="submit-btn" className="hidden">
              submit
            </button>

            {/* Left Column - Basic Info */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-sm backdrop-blur-xl">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-slate-900 dark:text-yellow-500 ">
                    1
                  </span>
                  Basic Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Topic Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Linear Equations"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 {
 subject === "MATH" 
 ? "border-yellow-500 bg-slate-50 dark:bg-[#0a0a0a] " 
 : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-yellow-300 "
 }`}
                      >
                        <input
                          type="radio"
                          name="subject"
                          value="MATH"
                          checked={subject === "MATH"}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-4 h-4 text-slate-900 dark:text-yellow-500 focus:ring-yellow-500"
                        />
                        <span className="font-semibold text-slate-900 dark:text-white ">
                          Math
                        </span>
                      </label>
                      <label
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 {
 subject === "READING_WRITING" 
 ? "border-yellow-500 bg-slate-50 dark:bg-[#0a0a0a] " 
 : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-yellow-300 "
 }`}
                      >
                        <input
                          type="radio"
                          name="subject"
                          value="READING_WRITING"
                          checked={subject === "READING_WRITING"}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-4 h-4 text-slate-900 dark:text-yellow-500 focus:ring-yellow-500"
                        />
                        <span className="font-semibold text-slate-900 dark:text-white ">
                          Reading & Writing
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a comprehensive description of what students will learn..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-sm backdrop-blur-xl">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-slate-900 dark:text-yellow-500 ">
                    2
                  </span>
                  Assign to Groups
                </h2>

                {groups.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-white/5 text-center">
                    <p className="text-slate-500 dark:text-slate-400 ">
                      No active groups found in the system.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {groups.map((group) => (
                      <label
                        key={group.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer {
 selectedGroups.includes(group.id) 
 ? "border-yellow-500 bg-slate-50 dark:bg-[#0a0a0a]/50 " 
 : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] hover:border-yellow-300 "
 }`}
                      >
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={() => handleGroupToggle(group.id)}
                            className="w-4 h-4 rounded text-slate-900 dark:text-yellow-500 focus:ring-yellow-500 bg-slate-100 dark:bg-[#1c1b1b] border-slate-300 dark:border-white/5 "
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {group.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Uploads */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#131313] rounded-2xl border border-slate-200 dark:border-white/10 p-8 shadow-sm backdrop-blur-xl">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-slate-900 dark:text-yellow-500 ">
                    3
                  </span>
                  Learning Materials
                </h2>

                <div className="space-y-8">
                  {/* Book / PDF Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Book Title{" "}
                      <span className="text-slate-500 dark:text-slate-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g., College Panda SAT Math"
                      className="w-full px-4 py-3 mb-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white placeholder-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
                    />

                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Upload PDF Book
                    </label>

                    {!pdfFile && !bookPdfPath ? (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, "pdf")}
                        onClick={() => pdfInputRef.current?.click()}
                        className={`relative w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-colors {
 pdfUploading 
 ? "border-yellow-500 bg-slate-50 dark:bg-[#0a0a0a] " 
 : "border-slate-300 dark:border-white/5 hover:border-yellow-500 hover:bg-slate-50 dark:bg-[#0a0a0a] "
 }`}
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          ref={pdfInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadFile(file, "pdf");
                          }}
                          className="hidden"
                        />
                        {pdfUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 mb-2 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
                            <span className="text-sm font-medium text-slate-900 dark:text-yellow-500 ">
                              Uploading PDF...
                            </span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-slate-500 dark:text-slate-400 mb-2" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 ">
                              Click or drag PDF here
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Maximum file size: 50MB
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {pdfFile?.name || "Uploaded PDF"}
                            </p>
                            {pdfFile && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatSize(pdfFile.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFile(null);
                            setBookPdfPath("");
                          }}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700 "></div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Upload Video Lesson
                    </label>

                    {!videoFile && !videoPath ? (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, "video")}
                        onClick={() => videoInputRef.current?.click()}
                        className={`relative w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-colors {
 videoUploading 
 ? "border-yellow-500 bg-slate-50 dark:bg-[#0a0a0a] " 
 : "border-slate-300 dark:border-white/5 hover:border-yellow-500 hover:bg-slate-50 dark:bg-[#0a0a0a] "
 }`}
                      >
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          ref={videoInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadFile(file, "video");
                          }}
                          className="hidden"
                        />
                        {videoUploading ? (
                          <div className="w-full max-w-[200px] flex flex-col items-center">
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                              <div
                                className="h-full bg-[#EBFF00] transition-all duration-300 ease-out"
                                style={{ width: `${videoProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-yellow-500 ">
                              Uploading... {videoProgress}%
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 mb-2 rounded-full bg-slate-100 dark:bg-[#1c1b1b] flex items-center justify-center text-slate-500 dark:text-slate-400">
                              <Film className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 ">
                              Click or drag Video here
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              MP4, MOV, WEBM up to 500MB
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-slate-900 dark:text-yellow-500 flex-shrink-0">
                            <Film className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {videoFile?.name || "Uploaded Video"}
                            </p>
                            {videoFile && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatSize(videoFile.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoFile(null);
                            setVideoPath("");
                          }}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
    </AdminLayout>
  );
}
