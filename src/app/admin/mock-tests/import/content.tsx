"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

// --- TYPES ---
export interface ExtractedQuestion {
  module: "MODULE_1" | "MODULE_2" | "MODULE_3" | "MODULE_4";
  format: "MCQ" | "FILL_IN";
  questionNumber: number;
  prompt: string;
  passage?: string | null;
  imageUrl?: string | null;
  options?: Record<string, string> | null;
  correctAnswer: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  domain: string;
  skill: string;
  explanation?: string | null;
}

let pdfjsPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="pdf.min.js"]');
    if (existing) {
      const checkInterval = setInterval(() => {
        if ((window as any).pdfjsLib) {
          clearInterval(checkInterval);
          resolve((window as any).pdfjsLib);
        }
      }, 50);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("pdf.js failed"));
      }
    };
    document.head.appendChild(script);
  });
  return pdfjsPromise;
}

export function TestImporterContent() {
  const router = useRouter();

  const [existingTests, setExistingTests] = useState<
    { id: string; name: string; modules: string[] }[]
  >([]);
  const [selectedTestId, setSelectedTestId] = useState<string>("");

  React.useEffect(() => {
    fetch("/api/admin/mock-tests/import")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setExistingTests(data);
      })
      .catch(() => {});
  }, []);

  const [testName, setTestName] = useState("");
  const [targetModule, setTargetModule] = useState<
    "MODULE_1" | "MODULE_2" | "MODULE_3" | "MODULE_4"
  >("MODULE_1");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    status: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{
    testId: string;
    count: number;
    name: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopRequested = useRef(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const renderPageToBase64 = async (
    pdfDoc: any,
    pageNum: number,
  ): Promise<{ base64Data: string; width: number; height: number }> => {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 2.0; // High quality
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert to jpeg for smaller size
    const base64Data = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
    return { base64Data, width: canvas.width, height: canvas.height };
  };

  const cropImage = (
    base64Source: string,
    box: any,
    sourceWidth: number,
    sourceHeight: number,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        // Add 2% padding
        const padY = (box.ymax - box.ymin) * 0.02;
        const padX = (box.xmax - box.xmin) * 0.02;

        const ymin = Math.max(0, ((box.ymin - padY) / 1000) * sourceHeight);
        const xmin = Math.max(0, ((box.xmin - padX) / 1000) * sourceWidth);
        const ymax = Math.min(
          sourceHeight,
          ((box.ymax + padY) / 1000) * sourceHeight,
        );
        const xmax = Math.min(
          sourceWidth,
          ((box.xmax + padX) / 1000) * sourceWidth,
        );

        canvas.width = xmax - xmin;
        canvas.height = ymax - ymin;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
          img,
          xmin,
          ymin,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        resolve(canvas.toDataURL("image/jpeg", 0.9).split(",")[1]);
      };
      img.src = "data:image/jpeg;base64," + base64Source;
    });
  };

  const handleStartUpload = async () => {
    if (!selectedTestId && !testName.trim())
      return setErrorMsg("Test Name is required for new tests");

    if (!file) return setErrorMsg("Please upload a PDF test file");

    setIsProcessing(true);
    setErrorMsg("");
    stopRequested.current = false;
    setSuccessData(null);

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setProgress({
        current: 0,
        total: pdfDoc.numPages,
        status: "Extracting pages as images...",
      });

      const pageImages: any[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (stopRequested.current) throw new Error("Stopped by user");
        setProgress({
          current: i,
          total: pdfDoc.numPages,
          status: `Rendering page ${i}/${pdfDoc.numPages}...`,
        });
        const pageInfo = await renderPageToBase64(pdfDoc, i);
        pageImages.push(pageInfo);
      }

      let allBoxes: any[] = [];

      for (let i = 0; i < pageImages.length; i++) {
        if (stopRequested.current) throw new Error("Stopped by user");
        setProgress({
          current: i + 1,
          total: pageImages.length,
          status: `Detecting questions on page ${i + 1}/${pageImages.length}...`,
        });

        const res = await fetch("/api/ai/detect-boxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: pageImages[i].base64Data }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        if (data.boxes && Array.isArray(data.boxes)) {
          data.boxes.forEach((box: any) => {
            if (
              box.isValid !== false &&
              typeof box.ymin === "number" &&
              typeof box.questionNumber === "number"
            ) {
              allBoxes.push({
                pageIndex: i,
                box,
              });
            }
          });
        }
      }

      if (allBoxes.length === 0)
        throw new Error("No valid questions found in this PDF.");

      allBoxes.sort((a, b) => a.box.questionNumber - b.box.questionNumber);

      // Filter out duplicate question numbers (keep first occurrence)
      const uniqueBoxes = [];
      const seen = new Set();
      for (const item of allBoxes) {
        if (!seen.has(item.box.questionNumber)) {
          seen.add(item.box.questionNumber);
          uniqueBoxes.push(item);
        }
      }
      allBoxes = uniqueBoxes;

      const extractedQuestions: ExtractedQuestion[] = [];
      const isMath = targetModule === "MODULE_3" || targetModule === "MODULE_4";

      for (let i = 0; i < allBoxes.length; i++) {
        if (stopRequested.current) throw new Error("Stopped by user");
        const qData = allBoxes[i];
        const qNum = qData.box.questionNumber;

        setProgress({
          current: i + 1,
          total: allBoxes.length,
          status: `Extracting Question ${qNum} (${i + 1}/${allBoxes.length})...`,
        });

        const pageInfo = pageImages[qData.pageIndex];
        const croppedBase64 = await cropImage(
          pageInfo.base64Data,
          qData.box,
          pageInfo.width,
          pageInfo.height,
        );

        let imageUrl: string | null = null;
        if (qData.box.hasImage && qData.box.imageBBox) {
          setProgress({
            current: i + 1,
            total: allBoxes.length,
            status: `Uploading image for Q${qNum}...`,
          });
          const imgBase64 = await cropImage(
            pageInfo.base64Data,
            qData.box.imageBBox,
            pageInfo.width,
            pageInfo.height,
          );

          // Convert base64 to File
          const byteCharacters = atob(imgBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let k = 0; k < byteCharacters.length; k++) {
            byteNumbers[k] = byteCharacters.charCodeAt(k);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/jpeg" });
          const file = new File([blob], `q${qNum}-image.jpg`, {
            type: "image/jpeg",
          });

          const formData = new FormData();
          formData.append("file", file);

          const upRes = await fetch("/api/uploads/questions", {
            method: "POST",
            body: formData,
          });
          const upData = await upRes.json();
          if (upData.url) {
            imageUrl = upData.url;
          }
        }

        const res = await fetch("/api/ai/parse-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: croppedBase64, isMath }),
        });
        const data = await res.json();
        if (data.error)
          throw new Error(`Failed to parse Q${qNum}: ${data.error}`);

        const parsed = data.data;

        extractedQuestions.push({
          module: targetModule,
          format: parsed.format === "mcq" ? "MCQ" : "FILL_IN",
          questionNumber: qNum,
          prompt: parsed.prompt || "",
          passage: parsed.passage || null,
          imageUrl: imageUrl,
          options: parsed.options || null,
          correctAnswer: parsed.correctAnswer || null,
          difficulty: "MEDIUM",
          domain: parsed.domain || "General",
          skill: parsed.skill || "General",
          explanation: parsed.explanation || null,
        });
      }

      setProgress({ current: 1, total: 1, status: "Saving to database..." });

      const saveRes = await fetch("/api/admin/mock-tests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: selectedTestId || undefined,
          testName: selectedTestId
            ? existingTests.find((t) => t.id === selectedTestId)?.name ||
              "Updated Test"
            : testName,
          questions: extractedQuestions,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.error);

      setSuccessData({
        testId: saveData.testId,
        count: saveData.questionCount,
        name: saveData.testName,
      });
    } catch (err: any) {
      if (err.message !== "Stopped by user") {
        setErrorMsg(err.message || "Unknown error occurred");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Import Test Module
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Target Test
            </label>
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm mb-3"
            >
              <option value="">-- Create New Test --</option>
              {existingTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {!selectedTestId && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                New Test Name
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g. SAT Practice Test 1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Module
            </label>
            <select
              value={targetModule}
              onChange={(e) => setTargetModule(e.target.value as any)}
              disabled={isProcessing}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] text-slate-900 dark:text-white outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
            >
              {(() => {
                const currentTest = existingTests.find(
                  (t) => t.id === selectedTestId,
                );
                const hasMod = (mod: string) =>
                  currentTest?.modules?.includes(mod);
                return (
                  <>
                    <option value="MODULE_1">
                      Reading & Writing - Module 1{" "}
                      {hasMod("MODULE_1")
                        ? "(Already Exists - Will Replace)"
                        : ""}
                    </option>
                    <option value="MODULE_2">
                      Reading & Writing - Module 2{" "}
                      {hasMod("MODULE_2")
                        ? "(Already Exists - Will Replace)"
                        : ""}
                    </option>
                    <option value="MODULE_3">
                      Math - Module 1{" "}
                      {hasMod("MODULE_3")
                        ? "(Already Exists - Will Replace)"
                        : ""}
                    </option>
                    <option value="MODULE_4">
                      Math - Module 2{" "}
                      {hasMod("MODULE_4")
                        ? "(Already Exists - Will Replace)"
                        : ""}
                    </option>
                  </>
                );
              })()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Test PDF (must contain correct answers checked/circled)
            </label>
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isProcessing
                  ? "opacity-50 border-slate-200 dark:border-white/10"
                  : "border-slate-300 dark:border-white/5 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
                disabled={isProcessing}
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              {file ? (
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Click to browse or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload PDF file
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              {errorMsg}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mt-6 p-6 rounded-xl bg-slate-50 dark:bg-[#1c1b1b]/50 border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                <span className="font-medium text-slate-900 dark:text-white">
                  Processing...
                </span>
              </div>
              <button
                onClick={() => {
                  stopRequested.current = true;
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Stop
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{progress.status}</span>
                <span>
                  {progress.current} / {progress.total || "?"}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#EBFF00] transition-all duration-300"
                  style={{
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {successData && (
          <div className="mt-6 p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-1">
                  Import Complete!
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
                  Successfully extracted and saved {successData.count} questions
                  to "{successData.name}".
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      router.push(`/admin/mock-tests/${successData.testId}`)
                    }
                    className="bg-[#EBFF00] hover:bg-[#EBFF00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] text-slate-900 dark:text-white"
                  >
                    View Test
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSuccessData(null);
                      setFile(null);
                    }}
                  >
                    Import Another Module
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <Button
            onClick={handleStartUpload}
            disabled={isProcessing}
            className="bg-[#EBFF00] hover:bg-[#d9ff00] text-slate-900 min-w-[140px]"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Start AI Extraction"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
