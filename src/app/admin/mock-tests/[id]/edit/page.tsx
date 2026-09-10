"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AccessDeniedView } from "@/components/admin/AccessDeniedView";
import "katex/dist/katex.min.css";

interface QuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface Question {
  id: string;
  prompt: string;
  passage?: string | null;
  stimulus?: string | null;
  imageUrl?: string | null;
  options: QuestionOption;
  correctAnswer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  domain: string;
  skill: string;
  module: "MODULE_1" | "MODULE_2" | "MODULE_3" | "MODULE_4";
  format: string;
  questionNumber: number;
  explanation?: string | null;
}

interface ModuleSourceInfo {
  url: string;
  fileName?: string | null;
  fileType?: string | null;
  updatedAt?: string;
}

interface MockTest {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  status: string;
  sourceFileUrl?: string | null;
  sourceFileName?: string | null;
  sourceFileType?: string | null;
  moduleSourceFiles?: Record<string, ModuleSourceInfo> | null;
}

const MODULE_CONFIG = {
  MODULE_1: {
    key: "MODULE_1",
    short: "RW 1",
    name: "Reading & Writing — Module 1",
    subject: "Reading & Writing",
    badgeColor: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
  },
  MODULE_2: {
    key: "MODULE_2",
    short: "RW 2",
    name: "Reading & Writing — Module 2",
    subject: "Reading & Writing",
    badgeColor: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
  },
  MODULE_3: {
    key: "MODULE_3",
    short: "Math 1",
    name: "Math — Module 1",
    subject: "Math",
    badgeColor: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
  },
  MODULE_4: {
    key: "MODULE_4",
    short: "Math 2",
    name: "Math — Module 2",
    subject: "Math",
    badgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  },
} as const;

export default function MockTestEditPage() {
  const params = useParams();
  const router = useRouter();
  const testId = (params.id || params.testId) as string;

  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<
    "ALL" | "MODULE_1" | "MODULE_2" | "MODULE_3" | "MODULE_4"
  >("ALL");
  const [showImagePreview, setShowImagePreview] = useState<{
    [key: number]: boolean;
  }>({});
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
  const [sourceUploadingModule, setSourceUploadingModule] = useState<string | null>(null);
  const [sourceSuccessMsg, setSourceSuccessMsg] = useState<string | null>(null);
  const [sourceErrorMsg, setSourceErrorMsg] = useState<string | null>(null);

  const handleSourceFileUpload = async (file: File, targetModule?: string) => {
    if (!mockTest) return;
    const uploadKey = targetModule || "MASTER";
    setSourceUploadingModule(uploadKey);
    setSourceSuccessMsg(null);
    setSourceErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/uploads/test-sources", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload source file");
      }
      const uploadData = await uploadRes.json();
      
      const payload: any = {
        sourceFileUrl: uploadData.url,
        sourceFileName: uploadData.originalName || file.name,
        sourceFileType: uploadData.fileType || "pdf",
      };
      if (targetModule) {
        payload.targetModule = targetModule;
      }

      const putRes = await fetch(`/api/admin/mock-tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!putRes.ok) {
        throw new Error("Failed to update test source document");
      }

      setMockTest((prev) => {
        if (!prev) return prev;
        if (targetModule) {
          const currentMap = { ...(prev.moduleSourceFiles || {}) };
          currentMap[targetModule] = {
            url: uploadData.url,
            fileName: uploadData.originalName || file.name,
            fileType: uploadData.fileType || "pdf",
            updatedAt: new Date().toISOString(),
          };
          return {
            ...prev,
            moduleSourceFiles: currentMap,
          };
        } else {
          return {
            ...prev,
            sourceFileUrl: uploadData.url,
            sourceFileName: uploadData.originalName || file.name,
            sourceFileType: uploadData.fileType || "pdf",
          };
        }
      });

      const label = targetModule
        ? MODULE_CONFIG[targetModule as keyof typeof MODULE_CONFIG]?.name || targetModule
        : "Master Exam PDF";
      setSourceSuccessMsg(
        `Source document for ${label} saved successfully! AI will cross-verify reported issues against this document.`
      );
      setTimeout(() => setSourceSuccessMsg(null), 6000);
    } catch (err: any) {
      setSourceErrorMsg(err.message || "Error uploading source file");
    } finally {
      setSourceUploadingModule(null);
    }
  };

  const handleRemoveSourceFile = async (targetModule?: string) => {
    if (!mockTest) return;
    const label = targetModule
      ? MODULE_CONFIG[targetModule as keyof typeof MODULE_CONFIG]?.name || targetModule
      : "Master Exam PDF";
    if (!confirm(`Are you sure you want to remove the source document for ${label}?`)) return;

    setSourceSuccessMsg(null);
    setSourceErrorMsg(null);
    try {
      const payload: any = {
        sourceFileUrl: null,
        sourceFileName: null,
      };
      if (targetModule) {
        payload.targetModule = targetModule;
      }

      const putRes = await fetch(`/api/admin/mock-tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!putRes.ok) throw new Error("Failed to remove source document");

      setMockTest((prev) => {
        if (!prev) return prev;
        if (targetModule) {
          const currentMap = { ...(prev.moduleSourceFiles || {}) };
          delete currentMap[targetModule];
          return { ...prev, moduleSourceFiles: currentMap };
        } else {
          return { ...prev, sourceFileUrl: null, sourceFileName: null };
        }
      });
      setSourceSuccessMsg(`Source document for ${label} has been removed.`);
      setTimeout(() => setSourceSuccessMsg(null), 5000);
    } catch (err: any) {
      setSourceErrorMsg(err.message || "Failed to remove source document");
    }
  };

  useEffect(() => {
    async function fetchTest() {
      try {
        const response = await fetch(`/api/admin/mock-tests/${testId}`);
        if (response.status === 401 || response.status === 403) {
          setIsUnauthorized(true);
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch test");
        const data = await response.json();
        setMockTest(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [testId]);

  const handleSaveQuestion = async (
    index: number,
    updatedQuestion: Question,
  ) => {
    if (!mockTest) return;
    const updatedQuestions = [...mockTest.questions];
    updatedQuestions[index] = updatedQuestion;
    setMockTest({ ...mockTest, questions: updatedQuestions });
    setEditingQuestionIndex(null);

    try {
      const response = await fetch(
        `/api/admin/mock-tests/${testId}/questions/${updatedQuestion.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedQuestion),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to save question");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!mockTest) return;
    setUploading({ ...uploading, [index]: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads/questions", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { url } = await response.json();
      const updatedQuestion = { ...mockTest.questions[index], imageUrl: url };
      await handleSaveQuestion(index, updatedQuestion);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading({ ...uploading, [index]: false });
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    if (!mockTest) return;
    const question = mockTest.questions[index];
    const updatedQuestions = mockTest.questions.filter((_, i) => i !== index);
    setMockTest({ ...mockTest, questions: updatedQuestions });
    try {
      await fetch(`/api/admin/mock-tests/${testId}/questions/${question.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (isUnauthorized) {
    return (
      <AdminLayout
        title="Access Denied"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Mock Tests", href: "/admin/mock-tests" },
          { label: "Edit" },
        ]}
      >
        <AccessDeniedView
          title="Exam Editing Restricted"
          message="Editing mock test questions, answer keys, and exam details is restricted to Teachers and Super Administrators."
          requiredRole="Super Admin or Teacher"
        />
      </AdminLayout>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!mockTest) {
    return <div className="text-center py-8">Test not found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-[#EBFF00] mb-2">
              {mockTest.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {mockTest.questions.length} questions
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            className="bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-600 text-slate-900 dark:text-white"
          >
            Back
          </Button>
        </div>
      </Card>

      {/* Source PDF Documents Card */}
      <div id="source-files" className="space-y-4">
        <Card className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Original Source Documents (PDF)
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EBFF00] bg-[#EBFF00]/10 border border-[#EBFF00]/20 px-2.5 py-0.5 rounded-full">
                    AI Auto-Fix Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                  These original exam PDFs provide ground-truth verification for the AI engine when students report bugs during live exams. You can attach a master test PDF and dedicated PDFs for each individual module.
                </p>
              </div>
            </div>

            {/* Master PDF Quick Action */}
            <div className="flex items-center gap-2 shrink-0">
              {mockTest.sourceFileUrl ? (
                <div className="flex items-center gap-2">
                  <a
                    href={mockTest.sourceFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Master PDF</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                  <label className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer px-2 py-1">
                    {sourceUploadingModule === "MASTER" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Replace Master</span>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      disabled={!!sourceUploadingModule}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSourceFileUpload(f);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSourceFile()}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Remove Master PDF"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-all shadow-sm">
                  {sourceUploadingModule === "MASTER" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Master PDF</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    disabled={!!sourceUploadingModule}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSourceFileUpload(f);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Module-by-Module PDF Documents Grid */}
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Per-Module Source PDFs ({Object.keys(mockTest.moduleSourceFiles || {}).length}/4 Attached)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(["MODULE_1", "MODULE_2", "MODULE_3", "MODULE_4"] as const).map((modKey) => {
                const conf = MODULE_CONFIG[modKey];
                const modPdf = mockTest.moduleSourceFiles?.[modKey];
                const modQuestions = mockTest.questions.filter((q) => q.module === modKey);
                const isUploading = sourceUploadingModule === modKey;

                return (
                  <div
                    key={modKey}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      modPdf
                        ? "bg-slate-50 dark:bg-[#1a1a1a] border-emerald-500/30 dark:border-emerald-500/20"
                        : mockTest.sourceFileUrl
                        ? "bg-slate-50/50 dark:bg-[#151515] border-slate-200 dark:border-white/10"
                        : "bg-slate-50/30 dark:bg-[#121212] border-dashed border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${conf.badgeColor}`}>
                          {conf.short}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {modQuestions.length} Qs
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {conf.name}
                      </div>

                      {/* PDF Attachment Status */}
                      <div className="mt-2.5">
                        {modPdf ? (
                          <div className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold truncate text-slate-800 dark:text-slate-200" title={modPdf.fileName || "Module PDF"}>
                                {modPdf.fileName || "Module PDF"}
                              </p>
                              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                                Attached for {conf.short}
                              </p>
                            </div>
                          </div>
                        ) : mockTest.sourceFileUrl ? (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" />
                            <span className="truncate">Using Master PDF</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 opacity-60" />
                            <span>No PDF attached</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                      {modPdf?.url ? (
                        <>
                          <a
                            href={modPdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Replace"}
                              <input
                                type="file"
                                accept=".pdf,.docx"
                                disabled={!!sourceUploadingModule}
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleSourceFileUpload(f, modKey);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveSourceFile(modKey)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                              title="Remove PDF for this module"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold py-1.5 px-2 rounded-lg text-[11px] cursor-pointer transition-all border border-slate-200 dark:border-white/10">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                              <span>Upload {conf.short} PDF</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept=".pdf,.docx"
                            disabled={!!sourceUploadingModule}
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleSourceFileUpload(f, modKey);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {sourceSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{sourceSuccessMsg}</span>
            </div>
          )}

          {sourceErrorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{sourceErrorMsg}</span>
            </div>
          )}
        </Card>
      </div>

      {/* Module Filter Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setSelectedModuleFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            selectedModuleFilter === "ALL"
              ? "bg-slate-900 text-white dark:bg-[#EBFF00] dark:text-black shadow-sm"
              : "bg-white dark:bg-[#181818] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
          }`}
        >
          <span>All Modules</span>
          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-white/20 dark:bg-black/20">
            {mockTest.questions.length}
          </span>
        </button>

        {[
          {
            key: "MODULE_1",
            label: "Reading & Writing 1",
            count: mockTest.questions.filter((q) => q.module === "MODULE_1").length,
          },
          {
            key: "MODULE_2",
            label: "Reading & Writing 2",
            count: mockTest.questions.filter((q) => q.module === "MODULE_2").length,
          },
          {
            key: "MODULE_3",
            label: "Math 1",
            count: mockTest.questions.filter((q) => q.module === "MODULE_3").length,
          },
          {
            key: "MODULE_4",
            label: "Math 2",
            count: mockTest.questions.filter((q) => q.module === "MODULE_4").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedModuleFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedModuleFilter === tab.key
                ? "bg-slate-900 text-white dark:bg-[#EBFF00] dark:text-black shadow-sm"
                : "bg-white dark:bg-[#181818] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                tab.count > 0
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-white/10 text-slate-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {mockTest.questions
          .filter((q) => selectedModuleFilter === "ALL" || q.module === selectedModuleFilter)
          .map((question) => {
            const index = mockTest.questions.findIndex((q) => q.id === question.id);
            return (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                isEditing={editingQuestionIndex === index}
                onEdit={() => setEditingQuestionIndex(index)}
                onCancel={() => setEditingQuestionIndex(null)}
                onSave={(updated) => handleSaveQuestion(index, updated)}
                onDelete={() => handleDeleteQuestion(index)}
                onImageUpload={(file) => handleImageUpload(index, file)}
                isUploading={uploading[index] || false}
                showPreview={showImagePreview[index] || false}
                onTogglePreview={() =>
                  setShowImagePreview({
                    ...showImagePreview,
                    [index]: !showImagePreview[index],
                  })
                }
              />
            );
          })}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updated: Question) => void;
  onDelete: () => void;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
}

function QuestionCard({
  question,
  index,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onImageUpload,
  isUploading,
  showPreview,
  onTogglePreview,
}: QuestionCardProps) {
  const [editData, setEditData] = useState(question);
  const [aiFixInstruction, setAiFixInstruction] = useState("");
  const [aiFixLoading, setAiFixLoading] = useState(false);
  const [aiParseLoading, setAiParseLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleUploadImageFile = async (file: File) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/questions", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload image");
      }
      const data = await res.json();
      if (data.url) {
        setEditData((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (err: any) {
      alert("Image upload error: " + (err.message || String(err)));
    } finally {
      setImageUploading(false);
    }
  };

  const handleAiFix = async () => {
    if (!aiFixInstruction.trim()) return;
    setAiFixLoading(true);
    try {
      const res = await fetch("/api/ai/fix-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: aiFixInstruction,
          currentData: {
            passage: editData.passage,
            prompt: editData.prompt,
            options: editData.options,
            explanation: editData.explanation,
            correctAnswer: editData.correctAnswer,
          },
        }),
      });
      if (!res.ok) throw new Error("AI Fix failed");
      const json = await res.json();
      if (json.data) {
        setEditData({
          ...editData,
          passage: json.data.passage ?? editData.passage,
          prompt: json.data.prompt ?? editData.prompt,
          options: { ...editData.options, ...json.data.options },
          explanation: json.data.explanation ?? editData.explanation,
          correctAnswer: json.data.correctAnswer ?? editData.correctAnswer,
        });
        setAiFixInstruction("");
      }
    } catch (e) {
      alert("AI Fix error:" + e);
    } finally {
      setAiFixLoading(false);
    }
  };

  const handleAiParseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiParseLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = (event.target?.result as string).split(",")[1];
        const res = await fetch("/api/ai/parse-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64String,
            isMath:
              editData.module === "MODULE_3" || editData.module === "MODULE_4",
          }),
        });
        if (!res.ok) throw new Error("AI Parse failed");
        const json = await res.json();
        if (json.data) {
          setEditData({
            ...editData,
            passage: json.data.passage || editData.passage,
            prompt: json.data.prompt || editData.prompt,
            options: { ...editData.options, ...json.data.options },
            correctAnswer: json.data.correctAnswer || editData.correctAnswer,
            explanation: json.data.explanation || editData.explanation,
            domain: json.data.domain || editData.domain,
            skill: json.data.skill || editData.skill,
          });
        }
        setAiParseLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      alert("AI Parse error:" + e);
      setAiParseLoading(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="bg-slate-50 dark:bg-[#0a0a0a] border-[#EBFF00]/50 p-6">
        <div className="space-y-4">
          {/* AI Tools Section */}
          <div className="bg-yellow-950/30 border border-[#EBFF00]/30 p-4 rounded-md space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[#d9ff00] font-bold flex items-center gap-2">
                <span className="text-xl">✨</span> AI Assistant
              </h3>
            </div>
            {/* AI Image Import */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer bg-[#EBFF00] hover:bg-[#EBFF00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] text-slate-900 dark:text-white text-slate-900 dark:text-white px-3 py-2 rounded text-sm w-max transition-colors">
                {aiParseLoading ? "Parsing image..." : "Import from Screenshot"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAiParseImage}
                  disabled={aiParseLoading}
                />
              </label>
            </div>
            {/* AI Fix */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiFixInstruction}
                onChange={(e) => setAiFixInstruction(e.target.value)}
                placeholder="Tell AI to fix something (e.g.,'Fix the math formatting','Extract options')"
                className="flex-1 px-3 py-2 bg-white dark:bg-[#131313] border border-[#EBFF00]/50 rounded text-slate-900 dark:text-white text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAiFix();
                }}
              />
              <Button
                onClick={handleAiFix}
                disabled={aiFixLoading || !aiFixInstruction}
                className="bg-[#EBFF00] hover:bg-[#EBFF00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] text-slate-900 dark:text-white"
              >
                {aiFixLoading ? "Fixing..." : "AI Fix"}
              </Button>
            </div>
          </div>

          {/* Question Number */}
          <div>
            <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2">
              Question #{index + 1}
            </label>
            <input
              type="number"
              value={editData.questionNumber}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  questionNumber: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2">
              Question Text (HTML/KaTeX)
            </label>
            <textarea
              value={editData.prompt}
              onChange={(e) =>
                setEditData({ ...editData, prompt: e.target.value })
              }
              className="w-full h-24 px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white font-mono text-sm"
            />
          </div>

          {/* Passage */}
          {editData.passage && (
            <div>
              <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2">
                Stimulus/Passage
              </label>
              <textarea
                value={editData.passage}
                onChange={(e) =>
                  setEditData({ ...editData, passage: e.target.value })
                }
                className="w-full h-20 px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Options */}
          <div>
            <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2">
              Options
            </label>
            <div className="space-y-2 bg-slate-100 dark:bg-[#1c1b1b] p-3 rounded border border-slate-600">
              {Object.keys(editData.options).map((key) => (
                <input
                  key={key}
                  type="text"
                  placeholder={`Option ${key}`}
                  value={editData.options[key as keyof QuestionOption]}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      options: {
                        ...editData.options,
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-500 rounded text-slate-900 dark:text-white text-sm"
                />
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2">
              Correct Answer
            </label>
            <select
              value={editData.correctAnswer}
              onChange={(e) =>
                setEditData({ ...editData, correctAnswer: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white"
            >
              {["A", "B", "C", "D"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2 text-sm">
                Difficulty
              </label>
              <select
                value={editData.difficulty}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    difficulty: e.target.value as "EASY" | "MEDIUM" | "HARD",
                  })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2 text-sm">
                Module
              </label>
              <select
                value={editData.module}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    module: e.target.value as
                      | "MODULE_1"
                      | "MODULE_2"
                      | "MODULE_3"
                      | "MODULE_4",
                  })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              >
                <option value="MODULE_1">Module 1</option>
                <option value="MODULE_2">Module 2</option>
                <option value="MODULE_3">Module 3</option>
                <option value="MODULE_4">Module 4</option>
              </select>
            </div>
          </div>

          {/* Domain & Skill */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2 text-sm">
                Domain
              </label>
              <input
                type="text"
                value={editData.domain}
                onChange={(e) =>
                  setEditData({ ...editData, domain: e.target.value })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2 text-sm">
                Skill
              </label>
              <input
                type="text"
                value={editData.skill}
                onChange={(e) =>
                  setEditData({ ...editData, skill: e.target.value })
                }
                className="w-full px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-slate-900 dark:text-[#EBFF00] font-bold mb-2">
              Explanation
            </label>
            <textarea
              value={editData.explanation || ""}
              onChange={(e) =>
                setEditData({ ...editData, explanation: e.target.value })
              }
              className="w-full h-16 px-3 py-2 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Image Upload */}
          <div className="bg-slate-100 dark:bg-[#1c1b1b] border border-slate-600 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-slate-900 dark:text-[#EBFF00] font-bold">
                Question Image / Diagram (Optional)
              </label>
              {editData.imageUrl && (
                <Button
                  type="button"
                  onClick={() => setEditData({ ...editData, imageUrl: null })}
                  className="bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white px-2 py-1 text-xs"
                >
                  Remove Image
                </Button>
              )}
            </div>

            {imageUploading ? (
              <div className="py-8 text-center text-sm text-[#EBFF00] flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-[#EBFF00] border-t-transparent rounded-full animate-spin" />
                <span>Uploading image to server...</span>
              </div>
            ) : editData.imageUrl ? (
              <div className="space-y-3">
                <div className="p-2 bg-white dark:bg-[#0a0a0a] rounded-lg border border-slate-300 dark:border-white/10 inline-block max-w-full">
                  <img
                    src={
                      editData.imageUrl.startsWith("http") ||
                      editData.imageUrl.startsWith("/") ||
                      editData.imageUrl.startsWith("data:")
                        ? editData.imageUrl
                        : `/uploads/questions/${editData.imageUrl}`
                    }
                    alt="Question preview"
                    className="max-h-48 max-w-full rounded object-contain"
                  />
                </div>
                <div>
                  <label className="cursor-pointer text-xs font-semibold text-blue-600 dark:text-[#EBFF00] hover:underline">
                    <span>Replace Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) handleUploadImageFile(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-600 rounded cursor-pointer hover:border-[#EBFF00] transition-colors">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400 mx-auto mb-2" />
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    Click or drag & drop to upload diagram image
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP, GIF</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) handleUploadImageFile(file);
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onSave(editData)}
              className="bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 font-bold flex items-center gap-2 flex-1"
            >
              <Save className="w-4 h-4" /> Save Question
            </Button>
            <Button
              onClick={onCancel}
              className="bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-600 text-slate-900 dark:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 p-4 hover:border-[#EBFF00]/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-slate-900 dark:text-[#EBFF00] font-bold">
            Question #{index + 1}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {question.domain} • {question.difficulty} • {question.module}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onTogglePreview}
            className="bg-slate-100 dark:bg-[#1c1b1b] hover:bg-slate-600 text-slate-900 dark:text-white p-2"
            title="Toggle preview"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={onEdit}
            className="bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 px-3 py-1"
          >
            Edit
          </Button>
          <Button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {showPreview && (
        <div className="bg-slate-100 dark:bg-[#1c1b1b]/50 p-4 rounded mb-3 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <strong className="text-slate-900 dark:text-[#EBFF00]">
              Question:
            </strong>
            <div className="mt-1 whitespace-pre-wrap break-words">
              {question.prompt}
            </div>
          </div>
          {question.passage && (
            <div>
              <strong className="text-slate-900 dark:text-[#EBFF00]">
                Passage:
              </strong>
              <div className="mt-1 whitespace-pre-wrap break-words">
                {question.passage}
              </div>
            </div>
          )}
          {question.imageUrl && (
            <div>
              <strong className="text-slate-900 dark:text-[#EBFF00]">
                Image / Diagram:
              </strong>
              <div className="mt-2">
                <img
                  src={
                    question.imageUrl.startsWith("http") ||
                    question.imageUrl.startsWith("/") ||
                    question.imageUrl.startsWith("data:")
                      ? question.imageUrl
                      : `/uploads/questions/${question.imageUrl}`
                  }
                  alt="Question diagram"
                  className="max-h-48 max-w-full rounded border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] object-contain p-1"
                />
              </div>
            </div>
          )}
          <div>
            <strong className="text-slate-900 dark:text-[#EBFF00]">
              Options:
            </strong>
            <div className="mt-1 space-y-1">
              {Object.entries(question.options).map(([key, value]) => (
                <div
                  key={key}
                  className={
                    question.correctAnswer === key
                      ? "text-green-600 font-bold"
                      : ""
                  }
                >
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
          {question.explanation && (
            <div>
              <strong className="text-slate-900 dark:text-[#EBFF00]">
                Explanation:
              </strong>
              <div className="mt-1">{question.explanation}</div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
