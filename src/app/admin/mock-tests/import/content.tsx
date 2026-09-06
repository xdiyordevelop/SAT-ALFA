"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Trash2,
  Plus,
  Edit3,
  Check,
  X,
  Sparkles,
  Layers,
  ZoomIn,
  HelpCircle,
  Key,
} from "lucide-react";
import { renderMathInText } from "@/lib/math-renderer";
import "katex/dist/katex.min.css";

// --- TYPES ---
export type SatModuleKey = "MODULE_1" | "MODULE_2" | "MODULE_3" | "MODULE_4";

export interface ExtractedQuestion {
  id: string; // client temporary id
  module: SatModuleKey;
  format: "MCQ" | "FILL_IN";
  questionNumber: number;
  prompt: string;
  passage?: string | null;
  imageUrl?: string | null;
  diagramDescription?: string | null;
  options?: Record<string, string> | null;
  correctAnswer: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  domain: string;
  skill: string;
  explanation?: string | null;
  requiresReview?: boolean;
}

const MODULE_LABELS: Record<SatModuleKey, { title: string; subject: "rw" | "math"; defaultCount: number }> = {
  MODULE_1: { title: "Reading & Writing — Module 1", subject: "rw", defaultCount: 27 },
  MODULE_2: { title: "Reading & Writing — Module 2", subject: "rw", defaultCount: 27 },
  MODULE_3: { title: "Math — Module 1", subject: "math", defaultCount: 22 },
  MODULE_4: { title: "Math — Module 2", subject: "math", defaultCount: 22 },
};

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
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("PDF.js initialization failed"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js script"));
    document.head.appendChild(script);
  });
  return pdfjsPromise;
}

export function TestImporterContent() {
  const router = useRouter();

  // Mode: All 4 modules vs single module
  const [importMode, setImportMode] = useState<"ALL_MODULES" | "SINGLE_MODULE">("ALL_MODULES");
  const [singleTargetModule, setSingleTargetModule] = useState<SatModuleKey>("MODULE_1");

  // Tests & naming
  const [existingTests, setExistingTests] = useState<{ id: string; name: string; modules: string[] }[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [testName, setTestName] = useState("");

  // Step wizard: 'UPLOAD' | 'EXTRACTING' | 'VERIFY' | 'SUCCESS'
  const [currentStep, setCurrentStep] = useState<"UPLOAD" | "EXTRACTING" | "VERIFY" | "SUCCESS">("UPLOAD");

  // File & execution state
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({
    percent: 0,
    pageCurrent: 0,
    pageTotal: 0,
    qCurrent: 0,
    qTotal: 0,
    status: "",
    currentModule: "MODULE_1" as SatModuleKey,
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Extracted data for verification
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [activeTabModule, setActiveTabModule] = useState<SatModuleKey>("MODULE_1");
  const [filterMode, setFilterMode] = useState<"ALL" | "WITH_IMAGES" | "NEEDS_REVIEW" | "GRID_IN">("ALL");

  // Image lightbox & uploading states
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Bulk Answer Key Modal state
  const [answerKeyModalOpen, setAnswerKeyModalOpen] = useState(false);
  const [rawAnswerKeyText, setRawAnswerKeyText] = useState("");
  const [answerKeyFeedback, setAnswerKeyFeedback] = useState<string | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savedResult, setSavedResult] = useState<{ testId: string; name: string; count: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopRequested = useRef(false);

  useEffect(() => {
    fetch("/api/admin/mock-tests/import")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setExistingTests(data);
      })
      .catch((err) => console.error("Failed to load existing tests:", err));
  }, []);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type === "application/pdf" || dropped.name.endsWith(".pdf")) {
        setFile(dropped);
        setErrorMsg("");
      } else {
        setErrorMsg("Please upload a valid PDF document.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type === "application/pdf" || selected.name.endsWith(".pdf")) {
        setFile(selected);
        setErrorMsg("");
      } else {
        setErrorMsg("Please upload a valid PDF document.");
      }
    }
  };

  // Convert PDF page to base64 JPEG
  const renderPageToBase64 = async (
    pdfDoc: any,
    pageNum: number
  ): Promise<{ base64Data: string; width: number; height: number }> => {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 2.0; // High quality
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const base64Data = canvas.toDataURL("image/jpeg", 0.88).split(",")[1];
    return { base64Data, width: canvas.width, height: canvas.height };
  };

  // Crop image region given 0-1000 coordinates directly using the image's own natural dimensions
  const cropImageRegion = (
    base64Source: string,
    box: { ymin: number; xmin: number; ymax: number; xmax: number },
    paddingPercent: number = 0.02
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;

        const padY = (box.ymax - box.ymin) * paddingPercent;
        const padX = (box.xmax - box.xmin) * paddingPercent;

        const ymin = Math.max(0, ((box.ymin - padY) / 1000) * sourceHeight);
        const xmin = Math.max(0, ((box.xmin - padX) / 1000) * sourceWidth);
        const ymax = Math.min(sourceHeight, ((box.ymax + padY) / 1000) * sourceHeight);
        const xmax = Math.min(sourceWidth, ((box.xmax + padX) / 1000) * sourceWidth);

        const cropWidth = Math.max(1, Math.round(xmax - xmin));
        const cropHeight = Math.max(1, Math.round(ymax - ymin));

        const canvas = document.createElement("canvas");
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext("2d")!;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cropWidth, cropHeight);

        ctx.drawImage(img, xmin, ymin, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const parts = dataUrl.split(",");
          resolve(parts[1] || "");
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = "data:image/jpeg;base64," + base64Source;
    });
  };

  // Upload base64 JPEG to /api/uploads/questions using native blob decoding
  const uploadBase64Image = async (base64Data: string, filename: string): Promise<string | null> => {
    if (!base64Data || base64Data.length < 50) return null;
    try {
      const resBlob = await fetch("data:image/jpeg;base64," + base64Data);
      const blob = await resBlob.blob();
      if (!blob || blob.size < 100) {
        console.warn("Skipping upload: blob too small or empty", blob?.size);
        return null;
      }

      const formData = new FormData();
      formData.append("file", blob, filename);

      const res = await fetch("/api/uploads/questions", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data?.url || null;
    } catch (err) {
      console.error("Failed to upload question image:", err);
      return null;
    }
  };

  // --- EXTRACTION PIPELINE ---
  const handleStartExtraction = async () => {
    if (!selectedTestId && !testName.trim()) {
      return setErrorMsg("Please provide a name for the new test.");
    }
    if (!file) {
      return setErrorMsg("Please upload an SAT test PDF file.");
    }

    setIsProcessing(true);
    setCurrentStep("EXTRACTING");
    setErrorMsg("");
    stopRequested.current = false;

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;

      setProgress({
        percent: 3,
        pageCurrent: 0,
        pageTotal: numPages,
        qCurrent: 0,
        qTotal: 0,
        status: `Analyzing ${numPages} PDF pages & section boundaries...`,
        currentModule: "MODULE_1",
      });

      // PHASE 1: Fast Text Scan to establish module page boundaries
      const detectModuleFromStr = (text: string): SatModuleKey | null => {
        if (!text) return null;
        const clean = text.toLowerCase().replace(/\s+/g, " ");

        // Math Module 2 (MODULE_4)
        if (
          /(math|mathematics).*module\s*2/i.test(clean) ||
          /module\s*2.*(math|mathematics)/i.test(clean) ||
          /section\s*4\s*[:\-—]?\s*(math|mathematics)/i.test(clean) ||
          /section\s*2.*module\s*2/i.test(clean) ||
          /module\s*4/i.test(clean)
        ) {
          return "MODULE_4";
        }

        // Math Module 1 (MODULE_3)
        if (
          /(math|mathematics).*module\s*1/i.test(clean) ||
          /module\s*1.*(math|mathematics)/i.test(clean) ||
          /section\s*2\s*[:\-—]?\s*(math|mathematics)/i.test(clean) ||
          /section\s*3\s*[:\-—]?\s*(math|mathematics)/i.test(clean) ||
          /(math|mathematics)\s*section/i.test(clean) ||
          /module\s*3/i.test(clean)
        ) {
          return "MODULE_3";
        }

        // Reading and Writing Module 2 (MODULE_2)
        if (
          /(reading\s*(and|&)?\s*writing|reading).*module\s*2/i.test(clean) ||
          /module\s*2.*(reading\s*(and|&)?\s*writing|reading)/i.test(clean)
        ) {
          return "MODULE_2";
        }

        // Reading and Writing Module 1 (MODULE_1)
        if (
          /(reading\s*(and|&)?\s*writing|reading).*module\s*1/i.test(clean) ||
          /module\s*1.*(reading\s*(and|&)?\s*writing|reading)/i.test(clean) ||
          /section\s*1\s*[:\-—]?\s*(reading|writing)/i.test(clean)
        ) {
          return "MODULE_1";
        }

        return null;
      };

      const hasMathFormulas = (text: string): boolean => {
        if (!text) return false;
        const clean = text.toLowerCase();
        return /\b(f\(x\)|g\(x\)|y\s*=\s*[-+]?\d*x|quadratic|hypotenuse|pythagorean|polynomial|coordinate plane|xy-plane|cosine|sine|tangent|degree measures)\b/i.test(clean);
      };

      const pageModuleMap: Record<number, SatModuleKey | null> = {};
      let currentSectionModule: SatModuleKey | null = null;

      for (let p = 1; p <= numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((i: any) => i.str).join(" ");
        const detected = detectModuleFromStr(pageText);

        if (detected) {
          currentSectionModule = detected;
        } else if (hasMathFormulas(pageText)) {
          // If we haven't switched to math yet, switch to MODULE_3
          if (currentSectionModule === "MODULE_1" || currentSectionModule === "MODULE_2" || !currentSectionModule) {
            currentSectionModule = "MODULE_3";
          }
        }

        // Only skip pure scoring sheets or answer key conversions at the very end of PDF
        const isScoring = p >= numPages - 2 && (
          pageText.toLowerCase().includes("scoring your test") || 
          pageText.toLowerCase().includes("raw score conversion") ||
          pageText.toLowerCase().includes("answer key")
        );

        // Skip cover page (page 1) only if it's purely a cover title with no question text
        const isCover = p === 1 && !pageText.toLowerCase().includes("module") && pageText.length < 400;

        if (isScoring || isCover) {
          pageModuleMap[p] = null;
        } else {
          if (!currentSectionModule) {
            currentSectionModule = "MODULE_1";
          }
          pageModuleMap[p] = currentSectionModule;
        }
      }

      // Filter pages that actually contain test questions
      const pagesToProcess: number[] = [];
      for (let p = 1; p <= numPages; p++) {
        if (importMode === "SINGLE_MODULE") {
          // If single module, only process pages matching that module or all if not recognized
          if (pageModuleMap[p] === singleTargetModule || pageModuleMap[p] !== null) {
            pagesToProcess.push(p);
          }
        } else {
          if (pageModuleMap[p] !== null) {
            pagesToProcess.push(p);
          }
        }
      }

      if (pagesToProcess.length === 0) {
        // Fallback: process all pages except first
        for (let p = (numPages > 1 ? 2 : 1); p <= numPages; p++) pagesToProcess.push(p);
      }

      // PHASE 2: Render question pages & detect bounding boxes
      interface DetectedItem {
        pageNum: number;
        pageImage: { base64Data: string; width: number; height: number };
        box: any;
        moduleKey: SatModuleKey;
      }

      const allDetectedQuestions: DetectedItem[] = [];
      const seenPerModule: Record<SatModuleKey, Set<number>> = {
        MODULE_1: new Set(),
        MODULE_2: new Set(),
        MODULE_3: new Set(),
        MODULE_4: new Set(),
      };

      let activeModuleTracker: SatModuleKey = "MODULE_1";
      const moduleOrder: SatModuleKey[] = ["MODULE_1", "MODULE_2", "MODULE_3", "MODULE_4"];

      for (let idx = 0; idx < pagesToProcess.length; idx++) {
        if (stopRequested.current) throw new Error("Stopped by user");
        const pageNum = pagesToProcess[idx];

        let assignedModule: SatModuleKey;

        if (importMode === "SINGLE_MODULE") {
          assignedModule = singleTargetModule;
        } else {
          // In ALL_MODULES mode: start with Phase 1 map or active tracker
          const mappedMod = pageModuleMap[pageNum];
          if (mappedMod && moduleOrder.indexOf(mappedMod) >= moduleOrder.indexOf(activeModuleTracker)) {
            activeModuleTracker = mappedMod;
          }
          assignedModule = activeModuleTracker;
        }

        setProgress({
          percent: 5 + Math.round(((idx + 1) / pagesToProcess.length) * 35),
          pageCurrent: pageNum,
          pageTotal: numPages,
          qCurrent: 0,
          qTotal: 0,
          status: `Analyzing ${MODULE_LABELS[assignedModule].title} • Page ${pageNum}/${numPages}...`,
          currentModule: assignedModule,
        });

        const pageInfo = await renderPageToBase64(pdfDoc, pageNum);

        const res = await fetch("/api/ai/detect-boxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: pageInfo.base64Data }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // In ALL_MODULES mode: Dynamic module correction using Gemini visual header
        if (importMode === "ALL_MODULES" && data.moduleHeader) {
          const geminiDetectedMod = detectModuleFromStr(data.moduleHeader);
          if (geminiDetectedMod && moduleOrder.indexOf(geminiDetectedMod) >= moduleOrder.indexOf(activeModuleTracker)) {
            activeModuleTracker = geminiDetectedMod;
            assignedModule = geminiDetectedMod;
          }
        }

        const rawBoxes = Array.isArray(data.boxes) ? data.boxes : [];
        const validBoxes = rawBoxes
          .filter(
            (b: any) =>
              typeof b.ymin === "number" &&
              typeof b.ymax === "number" &&
              b.ymax > b.ymin &&
              b.isValid !== false
          )
          .sort((a: any, b: any) => {
            const qA = typeof a.questionNumber === "number" && a.questionNumber > 0 ? a.questionNumber : 0;
            const qB = typeof b.questionNumber === "number" && b.questionNumber > 0 ? b.questionNumber : 0;
            if (qA > 0 && qB > 0 && qA !== qB) {
              return qA - qB;
            }
            // Fallback to 2-column reading order: left column (xmin < 500) before right column (xmin >= 500), then top to bottom
            const colA = (a.xmin ?? 0) < 500 ? 0 : 1;
            const colB = (b.xmin ?? 0) < 500 ? 0 : 1;
            if (colA !== colB) return colA - colB;
            return a.ymin - b.ymin;
          });

        // In ALL_MODULES mode: check for question number reset (SAT module boundary)
        if (importMode === "ALL_MODULES" && validBoxes.length > 0) {
          const positiveNumbers = validBoxes
            .map((b: any) => b.questionNumber)
            .filter((n: any) => typeof n === "number" && n > 0);

          if (positiveNumbers.length > 0) {
            const minQOnPage = Math.min(...positiveNumbers);
            const currentSeen = seenPerModule[assignedModule];
            const maxQSeenInCurrentMod = currentSeen.size > 0 ? Math.max(...Array.from(currentSeen)) : 0;

            // If current module has already seen question 15+ and this page starts with 1, 2, or 3,
            // this is an unmistakable SAT module boundary! Advance to next module.
            if (maxQSeenInCurrentMod >= 15 && minQOnPage <= 3) {
              const currentModIdx = moduleOrder.indexOf(assignedModule);
              if (currentModIdx < moduleOrder.length - 1) {
                const nextMod = moduleOrder[currentModIdx + 1];
                activeModuleTracker = nextMod;
                assignedModule = nextMod;
              }
            }
          }
        }

        for (const box of validBoxes) {
          let qNum = typeof box.questionNumber === "number" && box.questionNumber > 0 ? box.questionNumber : null;
          if (!qNum) {
            // Infer next expected question number in current module if missing
            const currentSeen = seenPerModule[assignedModule];
            const maxSeen = currentSeen.size > 0 ? Math.max(...Array.from(currentSeen)) : 0;
            qNum = maxSeen + 1;
            box.questionNumber = qNum;
          }

          // Strictly deduplicate per-module
          if (!seenPerModule[assignedModule].has(qNum)) {
            seenPerModule[assignedModule].add(qNum);
            allDetectedQuestions.push({
              pageNum,
              pageImage: pageInfo,
              box: { ...box, questionNumber: qNum },
              moduleKey: assignedModule,
            });
          }
        }
      }

      if (allDetectedQuestions.length === 0) {
        throw new Error("No valid questions could be detected in this PDF. Please verify the document format.");
      }

      // Sort questions: by module sequence (MODULE_1 -> MODULE_2 -> MODULE_3 -> MODULE_4), then by questionNumber
      allDetectedQuestions.sort((a, b) => {
        const modDiff = moduleOrder.indexOf(a.moduleKey) - moduleOrder.indexOf(b.moduleKey);
        if (modDiff !== 0) return modDiff;
        return a.box.questionNumber - b.box.questionNumber;
      });

      // PHASE 3: Parse each question with Gemini & crop visual stimulus diagrams
      const extracted: ExtractedQuestion[] = [];
      const totalQ = allDetectedQuestions.length;

      for (let i = 0; i < totalQ; i++) {
        if (stopRequested.current) throw new Error("Stopped by user");

        const item = allDetectedQuestions[i];
        const qNum = item.box.questionNumber;
        const modKey = item.moduleKey;
        const isMath = modKey === "MODULE_3" || modKey === "MODULE_4";

        setProgress({
          percent: 42 + Math.round(((i + 1) / totalQ) * 56),
          pageCurrent: item.pageNum,
          pageTotal: numPages,
          qCurrent: i + 1,
          qTotal: totalQ,
          status: `Parsing ${MODULE_LABELS[modKey].title} • Question ${qNum} (${i + 1}/${totalQ})...`,
          currentModule: modKey,
        });

        // Crop question container image
        const questionCropBase64 = await cropImageRegion(item.pageImage.base64Data, item.box, 0.02);

        // Call parse-question with retry
        let parsedData: any = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const parseRes = await fetch("/api/ai/parse-question", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageBase64: questionCropBase64, isMath }),
            });
            if (parseRes.ok) {
              const parseJson = await parseRes.json();
              if (parseJson.success && parseJson.data) {
                parsedData = parseJson.data;
                break;
              }
            }
          } catch (pErr) {
            console.warn(`Attempt ${attempt} fail on Q${qNum}:`, pErr);
          }
          if (attempt < 2 && !stopRequested.current) {
            await new Promise((r) => setTimeout(r, 1200));
          }
        }

        // Image auto-cropping logic:
        let savedImageUrl: string | null = null;
        let diagramDescription: string | null = null;

        // Layer 1: Check if parse-question identified visual stimulus inside the question
        if (
          parsedData?.hasVisualStimulus &&
          parsedData?.stimulusBBox &&
          (parsedData.stimulusBBox.ymax > parsedData.stimulusBBox.ymin + 30 ||
            parsedData.stimulusBBox.xmax > parsedData.stimulusBBox.xmin + 30)
        ) {
          diagramDescription = parsedData.diagramDescription || null;
          try {
            // Crop stimulus directly from the question crop (using question crop's natural dimensions)
            const stimulusBase64 = await cropImageRegion(questionCropBase64, parsedData.stimulusBBox, 0.03);
            savedImageUrl = await uploadBase64Image(stimulusBase64, `q${qNum}-${modKey}-diagram.jpg`);
          } catch (cErr) {
            console.warn("Failed to crop question stimulus:", cErr);
          }
        }
        // Layer 2: Fallback to detect-boxes page-level imageBBox
        else if (item.box.hasImage && item.box.imageBBox) {
          try {
            const stimulusBase64 = await cropImageRegion(item.pageImage.base64Data, item.box.imageBBox, 0.02);
            savedImageUrl = await uploadBase64Image(stimulusBase64, `q${qNum}-${modKey}-figure.jpg`);
          } catch (cErr) {
            console.warn("Failed to crop page figure:", cErr);
          }
        }

        // Construct verified question object
        extracted.push({
          id: `q_${modKey}_${qNum}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          module: modKey,
          format: parsedData?.format === "fill-in" || (!parsedData?.options && isMath) ? "FILL_IN" : "MCQ",
          questionNumber: qNum,
          prompt: parsedData?.prompt || `Question ${qNum}`,
          passage: parsedData?.passage || null,
          imageUrl: savedImageUrl,
          diagramDescription,
          options: parsedData?.options || (parsedData?.format === "fill-in" || (isMath && !parsedData?.options) ? null : { A: "", B: "", C: "", D: "" }),
          correctAnswer: parsedData?.correctAnswer || "",
          difficulty: "MEDIUM",
          domain: parsedData?.domain || (isMath ? "Algebra" : "Information and Ideas"),
          skill: parsedData?.skill || (isMath ? "Linear Equations" : "Central Ideas"),
          explanation: parsedData?.explanation || null,
          requiresReview: !parsedData?.correctAnswer || !parsedData?.prompt,
        });
      }

      setExtractedQuestions(extracted);
      setProgress((prev) => ({ ...prev, percent: 100, status: "Extraction complete! Ready for verification." }));

      // Set initial active tab
      const firstMod = moduleOrder.find((m) => extracted.some((q) => q.module === m)) || "MODULE_1";
      setActiveTabModule(firstMod);

      setCurrentStep("VERIFY");
    } catch (err: any) {
      if (err.message !== "Stopped by user") {
        setErrorMsg(err.message || "An unexpected error occurred during test extraction.");
      }
      setCurrentStep("UPLOAD");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- BULK ANSWER KEY APPLIER ---
  const handleApplyBulkAnswerKey = () => {
    if (!rawAnswerKeyText.trim()) return;

    // Supports: "1. A 2. B 3. C" OR "1:A 2:B" OR "A B C D A B C..."
    const text = rawAnswerKeyText.trim();
    const updated = [...extractedQuestions];
    let appliedCount = 0;

    // Check if numbered: e.g. "1. A", "1: A", "1 A"
    const numberedMatches = Array.from(text.matchAll(/(?:^|\s)(\d{1,2})[\.\:\-\s]+([A-D]|[0-9\/\.\-]+)/gi));

    if (numberedMatches.length > 0) {
      for (const m of numberedMatches) {
        const qNum = parseInt(m[1], 10);
        const ans = m[2].toUpperCase().trim();
        const targetQ = updated.find((q) => q.module === activeTabModule && q.questionNumber === qNum);
        if (targetQ) {
          targetQ.correctAnswer = ans;
          targetQ.requiresReview = false;
          appliedCount++;
        }
      }
    } else {
      // Sequence of letters e.g. "A B C D A B C"
      const letters = text.match(/[A-D]/gi);
      if (letters && letters.length > 0) {
        const modQuestions = updated
          .filter((q) => q.module === activeTabModule)
          .sort((a, b) => a.questionNumber - b.questionNumber);

        for (let i = 0; i < Math.min(letters.length, modQuestions.length); i++) {
          modQuestions[i].correctAnswer = letters[i].toUpperCase();
          modQuestions[i].requiresReview = false;
          appliedCount++;
        }
      }
    }

    setExtractedQuestions(updated);
    setAnswerKeyFeedback(`Applied ${appliedCount} answers to ${MODULE_LABELS[activeTabModule].title}!`);
    setTimeout(() => {
      setAnswerKeyFeedback(null);
      setAnswerKeyModalOpen(false);
      setRawAnswerKeyText("");
    }, 1200);
  };

  // --- VERIFICATION ACTIONS ---
  const handleUpdateQuestion = (qId: string, patch: Partial<ExtractedQuestion>) => {
    setExtractedQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, ...patch } : q)));
  };

  const handleDeleteQuestion = (qId: string) => {
    setExtractedQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleManualImageUpload = async (qId: string, file: File) => {
    setUploadingImageId(qId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/questions", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        handleUpdateQuestion(qId, { imageUrl: data.url });
      }
    } catch (err) {
      console.error("Failed to upload manual image:", err);
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleAddNewQuestion = (targetMod: SatModuleKey) => {
    const modQuestions = extractedQuestions.filter((q) => q.module === targetMod);
    const maxQNum = modQuestions.reduce((max, q) => Math.max(max, q.questionNumber), 0);
    const newQ: ExtractedQuestion = {
      id: `q_manual_${Date.now()}`,
      module: targetMod,
      format: "MCQ",
      questionNumber: maxQNum + 1,
      prompt: "Enter question prompt here...",
      passage: null,
      imageUrl: null,
      options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" },
      correctAnswer: "A",
      difficulty: "MEDIUM",
      domain: targetMod === "MODULE_3" || targetMod === "MODULE_4" ? "Algebra" : "Information and Ideas",
      skill: "General",
      explanation: null,
      requiresReview: false,
    };
    setExtractedQuestions((prev) => [...prev, newQ]);
  };

  // --- SAVE TO DATABASE ---
  const handleSaveToDatabase = async () => {
    if (extractedQuestions.length === 0) {
      return setErrorMsg("No questions to save.");
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const finalTestName = selectedTestId
        ? existingTests.find((t) => t.id === selectedTestId)?.name || "Updated SAT Mock Test"
        : testName.trim();

      const payload = {
        testId: selectedTestId || undefined,
        testName: finalTestName,
        questions: extractedQuestions.map((q) => ({
          module: q.module,
          format: q.format,
          questionNumber: q.questionNumber,
          prompt: q.prompt,
          passage: q.passage || null,
          imageUrl: q.imageUrl || null,
          options: q.format === "MCQ" ? q.options : null,
          correctAnswer: q.correctAnswer || "A",
          difficulty: q.difficulty,
          domain: q.domain,
          skill: q.skill,
          explanation: q.explanation || null,
          requiresReview: q.requiresReview || false,
        })),
      };

      const res = await fetch("/api/admin/mock-tests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to save mock test.");
      }

      setSavedResult({
        testId: resData.testId,
        name: resData.testName,
        count: resData.questionCount,
      });
      setCurrentStep("SUCCESS");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to commit questions to the database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter questions for active module
  const currentModuleQuestions = extractedQuestions
    .filter((q) => q.module === activeTabModule)
    .filter((q) => {
      if (filterMode === "WITH_IMAGES") return !!q.imageUrl;
      if (filterMode === "NEEDS_REVIEW") return q.requiresReview || !q.correctAnswer;
      if (filterMode === "GRID_IN") return q.format === "FILL_IN";
      return true;
    });

  // Counts for tabs
  const getModuleStats = (mod: SatModuleKey) => {
    const questions = extractedQuestions.filter((q) => q.module === mod);
    const withImages = questions.filter((q) => q.imageUrl).length;
    const needsReview = questions.filter((q) => q.requiresReview || !q.correctAnswer).length;
    return { count: questions.length, withImages, needsReview };
  };

  return (
    <div className="space-y-6">
      {/* ERROR ALERT */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start justify-between gap-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1: CONFIGURATION & UPLOAD */}
      {currentStep === "UPLOAD" && (
        <Card className="p-6 md:p-8 bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 shadow-sm">
          <div className="max-w-3xl space-y-6">
            {/* Mode selection pills */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Import Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setImportMode("ALL_MODULES")}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    importMode === "ALL_MODULES"
                      ? "border-[#EBFF00] bg-[#EBFF00]/5 ring-1 ring-[#EBFF00]"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#181818]"
                  }`}
                >
                  <Layers className={`w-5 h-5 mt-0.5 ${importMode === "ALL_MODULES" ? "text-amber-500 dark:text-[#EBFF00]" : "text-slate-400"}`} />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      Complete SAT Exam (All 4 Modules)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Uploads full 40-70 page PDF. Automatically divides into R&W Mod 1, R&W Mod 2, Math Mod 1, and Math Mod 2 without mixing.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode("SINGLE_MODULE")}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    importMode === "SINGLE_MODULE"
                      ? "border-[#EBFF00] bg-[#EBFF00]/5 ring-1 ring-[#EBFF00]"
                      : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#181818]"
                  }`}
                >
                  <FileText className={`w-5 h-5 mt-0.5 ${importMode === "SINGLE_MODULE" ? "text-amber-500 dark:text-[#EBFF00]" : "text-slate-400"}`} />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      Single Module Only
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Import or replace just one specific section (e.g. only Math Module 1).
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Target Test Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Target Test
                </label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181818] text-slate-900 dark:text-white outline-none focus:border-[#EBFF00] text-sm"
                >
                  <option value="">+ Create New Mock Test</option>
                  {existingTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.modules.length} modules)
                    </option>
                  ))}
                </select>
              </div>

              {!selectedTestId && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    New Test Title
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Official SAT Practice Test 11"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181818] text-slate-900 dark:text-white outline-none focus:border-[#EBFF00] text-sm"
                  />
                </div>
              )}

              {importMode === "SINGLE_MODULE" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Target Module
                  </label>
                  <select
                    value={singleTargetModule}
                    onChange={(e) => setSingleTargetModule(e.target.value as SatModuleKey)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181818] text-slate-900 dark:text-white outline-none focus:border-[#EBFF00] text-sm"
                  >
                    <option value="MODULE_1">Reading & Writing — Module 1</option>
                    <option value="MODULE_2">Reading & Writing — Module 2</option>
                    <option value="MODULE_3">Math — Module 1</option>
                    <option value="MODULE_4">Math — Module 2</option>
                  </select>
                </div>
              )}
            </div>

            {/* Drag & Drop PDF Box */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                SAT Test PDF Document
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file
                    ? "border-[#EBFF00] bg-[#EBFF00]/5"
                    : "border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 bg-slate-50/50 dark:bg-[#181818]/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  {file ? (
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-base">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        Click or drag & drop SAT test PDF here
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        PDF up to 100MB supported with auto-detection of charts, geometry diagrams, and KaTeX math
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Visual Diagram Protection
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Geometry drawings, coordinate grids, and data charts are cropped and preserved as images.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Full KaTeX Math
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Equations, exponents, fractions, and square roots are preserved in KaTeX LaTeX markup.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Interactive Verification
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Review, edit questions, inspect images, and check answers before committing to the database.
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
              <Button
                onClick={handleStartExtraction}
                disabled={!file || (!selectedTestId && !testName.trim())}
                className="bg-[#EBFF00] hover:bg-[#d9ff00] text-black font-semibold px-8 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Start AI Extraction
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: EXTRACTION IN PROGRESS */}
      {currentStep === "EXTRACTING" && (
        <Card className="p-8 md:p-12 bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 shadow-sm text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/10" />
              <div
                className="absolute inset-0 rounded-full border-4 border-[#EBFF00] border-t-transparent animate-spin"
              />
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {progress.percent}%
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Processing Test Document
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 min-h-[24px]">
                {progress.status}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#EBFF00] h-full transition-all duration-300 ease-out"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>Pages: {progress.pageCurrent} / {progress.pageTotal}</span>
              {progress.qTotal > 0 && (
                <span>Questions: {progress.qCurrent} / {progress.qTotal}</span>
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  stopRequested.current = true;
                  setCurrentStep("UPLOAD");
                  setIsProcessing(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors"
              >
                Cancel Extraction
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: INTERACTIVE VERIFICATION DASHBOARD */}
      {currentStep === "VERIFY" && (
        <div className="space-y-6">
          {/* Top Bar Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready for Review
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedTestId
                    ? existingTests.find((t) => t.id === selectedTestId)?.name
                    : testName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {extractedQuestions.length} total questions extracted •{" "}
                {extractedQuestions.filter((q) => q.imageUrl).length} questions with diagrams/figures •{" "}
                {extractedQuestions.filter((q) => q.requiresReview || !q.correctAnswer).length} flagged for review
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setAnswerKeyModalOpen(true)}
                className="text-xs px-4 py-2.5 rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                Paste Answer Key
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Are you sure you want to discard these extracted questions and upload another file?")) {
                    setCurrentStep("UPLOAD");
                    setExtractedQuestions([]);
                  }
                }}
                className="text-xs px-4 py-2.5 rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
              >
                Start Over
              </Button>
              <Button
                onClick={handleSaveToDatabase}
                disabled={isSaving || extractedQuestions.length === 0}
                className="bg-[#EBFF00] hover:bg-[#d9ff00] text-black font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving to Test...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Verified Test ({extractedQuestions.length} Questions)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            {(["MODULE_1", "MODULE_2", "MODULE_3", "MODULE_4"] as SatModuleKey[]).map((modKey) => {
              const stats = getModuleStats(modKey);
              const isActive = activeTabModule === modKey;
              return (
                <button
                  key={modKey}
                  type="button"
                  onClick={() => setActiveTabModule(modKey)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-[#EBFF00] dark:text-black shadow-sm"
                      : "bg-white dark:bg-[#181818] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
                  }`}
                >
                  <span>{MODULE_LABELS[modKey].title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                      isActive
                        ? "bg-white/20 dark:bg-black/20"
                        : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {stats.count}
                  </span>
                  {stats.withImages > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${stats.withImages} figures/charts`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Filter Bar within Module */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterMode("ALL")}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  filterMode === "ALL"
                    ? "bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                All ({extractedQuestions.filter((q) => q.module === activeTabModule).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("WITH_IMAGES")}
                className={`px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  filterMode === "WITH_IMAGES"
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                With Diagrams ({getModuleStats(activeTabModule).withImages})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("NEEDS_REVIEW")}
                className={`px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  filterMode === "NEEDS_REVIEW"
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Needs Review ({getModuleStats(activeTabModule).needsReview})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAnswerKeyModalOpen(true)}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mr-3"
              >
                <Key className="w-3.5 h-3.5" />
                Paste Key
              </button>
              <button
                type="button"
                onClick={() => handleAddNewQuestion(activeTabModule)}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-[#EBFF00] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>

          {/* Question List for Active Module */}
          <div className="space-y-4">
            {currentModuleQuestions.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No questions found matching this filter in {MODULE_LABELS[activeTabModule].title}.
                </p>
                <Button
                  onClick={() => handleAddNewQuestion(activeTabModule)}
                  variant="outline"
                  className="mt-4 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add New Question Manually
                </Button>
              </Card>
            ) : (
              currentModuleQuestions.map((q) => {
                const isEditing = editingQuestionId === q.id;
                const renderedPrompt = renderMathInText(q.prompt);

                return (
                  <Card
                    key={q.id}
                    className={`p-6 bg-white dark:bg-[#131313] border transition-all ${
                      q.requiresReview || !q.correctAnswer
                        ? "border-amber-500/40 dark:border-amber-500/30"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-[#EBFF00] dark:text-black font-bold text-sm flex items-center justify-center">
                          {q.questionNumber}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {q.format === "MCQ" ? "Multiple Choice" : "Grid-In / Student Produced"}
                        </span>
                        <select
                          value={q.difficulty}
                          onChange={(e) => handleUpdateQuestion(q.id, { difficulty: e.target.value as any })}
                          className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-none outline-none"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                        {(q.requiresReview || !q.correctAnswer) && (
                          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                            Needs Review
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            isEditing
                              ? "bg-[#EBFF00] text-black"
                              : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          }`}
                          title={isEditing ? "Done editing" : "Edit question text"}
                        >
                          {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Passage (if Reading & Writing) */}
                    {q.passage && (
                      <div className="mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Passage / Context
                        </span>
                        {isEditing ? (
                          <textarea
                            value={q.passage}
                            onChange={(e) => handleUpdateQuestion(q.id, { passage: e.target.value })}
                            rows={3}
                            className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
                          />
                        ) : (
                          <p className="whitespace-pre-line leading-relaxed">{q.passage}</p>
                        )}
                      </div>
                    )}

                    {/* Question Prompt */}
                    <div className="mb-4">
                      {isEditing ? (
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Prompt (Supports LaTeX: $math$ or $$display$$)
                          </label>
                          <textarea
                            value={q.prompt}
                            onChange={(e) => handleUpdateQuestion(q.id, { prompt: e.target.value })}
                            rows={3}
                            className="w-full text-sm p-3 rounded-xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#EBFF00]"
                          />
                        </div>
                      ) : (
                        <div
                          className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderedPrompt.html }}
                        />
                      )}
                    </div>

                    {/* Visual Stimulus / Diagram Component */}
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                          Visual Diagram / Figure
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            <span>{q.imageUrl ? "Replace Image" : "+ Add Diagram Image"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleManualImageUpload(q.id, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          {q.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleUpdateQuestion(q.id, { imageUrl: null })}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {uploadingImageId === q.id ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#EBFF00]" />
                          Uploading diagram image...
                        </div>
                      ) : q.imageUrl ? (
                        <div className="relative inline-block group">
                          <img
                            src={q.imageUrl}
                            alt="Question stimulus diagram"
                            className="max-h-48 rounded-lg border border-slate-200 dark:border-white/10 object-contain bg-white cursor-pointer"
                            onClick={() => setLightboxImage(q.imageUrl!)}
                          />
                          <button
                            type="button"
                            onClick={() => setLightboxImage(q.imageUrl!)}
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Zoom diagram"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                          No diagram detected. (If this question references a figure or coordinate plane, click &quot;+ Add Diagram Image&quot; above).
                        </p>
                      )}
                    </div>

                    {/* Options (MCQ) vs Numeric (Grid-In) */}
                    {q.format === "MCQ" ? (
                      <div className="space-y-2 mb-4">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">
                          Options (Select the correct answer letter)
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {(["A", "B", "C", "D"] as const).map((letter) => {
                            const optText = q.options?.[letter] || "";
                            const isCorrect = q.correctAnswer === letter;
                            const renderedOpt = renderMathInText(optText);

                            return (
                              <div
                                key={letter}
                                onClick={() => handleUpdateQuestion(q.id, { correctAnswer: letter, requiresReview: false })}
                                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                  isCorrect
                                    ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 ring-1 ring-emerald-500"
                                    : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/5"
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                    isCorrect
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <div className="flex-1 min-w-0">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={optText}
                                      onChange={(e) => {
                                        const newOpts = { ...(q.options || {}), [letter]: e.target.value };
                                        handleUpdateQuestion(q.id, { options: newOpts });
                                      }}
                                      className="w-full text-xs p-1.5 rounded bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <div
                                      className="text-xs text-slate-800 dark:text-slate-200 leading-normal"
                                      dangerouslySetInnerHTML={{ __html: renderedOpt.html }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Correct Numeric Answer(s) (e.g. 14, 3/4, 0.75)
                        </label>
                        <input
                          type="text"
                          value={q.correctAnswer || ""}
                          onChange={(e) => handleUpdateQuestion(q.id, { correctAnswer: e.target.value, requiresReview: false })}
                          placeholder="e.g. 42"
                          className="w-full max-w-xs px-3 py-2 text-sm rounded-xl bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-[#EBFF00]"
                        />
                      </div>
                    )}

                    {/* Domain & Skill Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <span className="text-slate-400 mr-2">Domain:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={q.domain}
                            onChange={(e) => handleUpdateQuestion(q.id, { domain: e.target.value })}
                            className="text-xs p-1 rounded bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
                          />
                        ) : (
                          <span className="font-medium text-slate-700 dark:text-slate-300">{q.domain}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 mr-2">Skill:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={q.skill}
                            onChange={(e) => handleUpdateQuestion(q.id, { skill: e.target.value })}
                            className="text-xs p-1 rounded bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none"
                          />
                        ) : (
                          <span className="font-medium text-slate-700 dark:text-slate-300">{q.skill}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Save Action Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 rounded-2xl bg-slate-900/95 dark:bg-[#181818]/95 backdrop-blur-md border border-white/10 shadow-2xl text-white">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">{extractedQuestions.length} Questions</span> ready across{" "}
              <span className="font-bold text-[#EBFF00]">
                {new Set(extractedQuestions.map((q) => q.module)).size} Modules
              </span>
            </div>
            <Button
              onClick={handleSaveToDatabase}
              disabled={isSaving || extractedQuestions.length === 0}
              className="bg-[#EBFF00] hover:bg-[#d9ff00] text-black font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Verified Test to Database
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {currentStep === "SUCCESS" && savedResult && (
        <Card className="p-8 md:p-12 bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 shadow-sm text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Test Successfully Saved!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">&quot;{savedResult.name}&quot;</span> has been updated with{" "}
                <span className="font-semibold text-emerald-600 dark:text-[#EBFF00]">{savedResult.count}</span> verified questions, diagrams, and math formulas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                onClick={() => router.push(`/admin/mock-tests`)}
                className="w-full sm:w-auto bg-[#EBFF00] hover:bg-[#d9ff00] text-black font-semibold text-sm px-6 py-3 rounded-xl"
              >
                View in Mock Tests List
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExtractedQuestions([]);
                  setFile(null);
                  setCurrentStep("UPLOAD");
                  setSavedResult(null);
                }}
                className="w-full sm:w-auto text-xs px-5 py-3 rounded-xl border-slate-200 dark:border-white/10"
              >
                Import Another Test
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* PASTE ANSWER KEY MODAL */}
      {answerKeyModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setAnswerKeyModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#181818] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Paste Answer Key
                </h3>
              </div>
              <button
                onClick={() => setAnswerKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Applying answers to <span className="font-semibold text-slate-800 dark:text-slate-200">{MODULE_LABELS[activeTabModule].title}</span>.
              Paste numbered list (e.g. <code className="bg-slate-100 dark:bg-white/10 px-1 rounded">1. A 2. B 3. C</code>) or sequence of letters (e.g. <code className="bg-slate-100 dark:bg-white/10 px-1 rounded">A B C D A B C</code>):
            </p>

            <textarea
              rows={6}
              value={rawAnswerKeyText}
              onChange={(e) => setRawAnswerKeyText(e.target.value)}
              placeholder="1. A&#10;2. B&#10;3. D&#10;4. C&#10;..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#131313] border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-[#EBFF00]"
            />

            {answerKeyFeedback && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center">
                {answerKeyFeedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
              <Button
                variant="outline"
                onClick={() => setAnswerKeyModalOpen(false)}
                className="text-xs px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyBulkAnswerKey}
                disabled={!rawAnswerKeyText.trim()}
                className="bg-[#EBFF00] hover:bg-[#d9ff00] text-black font-semibold text-xs px-5 py-2"
              >
                Apply Answers
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR ZOOMING DIAGRAMS */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Full resolution diagram"
              className="max-h-[80vh] w-auto mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
