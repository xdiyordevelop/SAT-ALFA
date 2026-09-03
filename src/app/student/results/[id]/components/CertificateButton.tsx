"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

interface TestResults {
  id: string;
  totalScore: number;
  rwScore: number;
  mathScore: number;
  rwRaw: number;
  mathRaw: number;
  completedAt: string;
  student: {
    firstName: string;
    lastName: string;
  };
  satTest: {
    name: string;
  };
}

interface CertificateButtonProps {
  results: TestResults;
}

export function CertificateButton({
  results,
}: CertificateButtonProps): React.ReactElement {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20; // Dark background

      doc.setFillColor(15, 23, 42); // slate-950
      doc.rect(0, 0, pageWidth, pageHeight, "F"); // Yellow accent border

      doc.setDrawColor(251, 191, 36); // yellow-400
      doc.setLineWidth(3);
      doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin); // Inner accent lines

      doc.setLineWidth(0.5);
      doc.setDrawColor(251, 191, 36);
      doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin); // Header:"CERTIFICATE OF COMPLETION"

      doc.setTextColor(251, 191, 36); // yellow-400
      doc.setFontSize(24);
      doc.setFont("Helvetica", "bold");
      doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, margin + 25, {
        align: "center",
      }); // Subtitle

      doc.setTextColor(226, 232, 240); // slate-200
      doc.setFontSize(12);
      doc.setFont("Helvetica", "normal");
      doc.text("SAT ALFA Mock Test", pageWidth / 2, margin + 35, {
        align: "center",
      }); // Horizontal line

      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(1);
      doc.line(margin, margin + 40, pageWidth - margin, margin + 40); // Student Name

      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(251, 191, 36);
      doc.text("This certifies that", pageWidth / 2, margin + 55, {
        align: "center",
      });

      doc.setFontSize(20);
      doc.setTextColor(226, 232, 240);
      doc.text(
        `${results.student.firstName} ${results.student.lastName}`,
        pageWidth / 2,
        margin + 70,
        { align: "center" },
      ); // Achievement text

      doc.setFontSize(11);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `has successfully completed the ${results.satTest.name}`,
        pageWidth / 2,
        margin + 85,
        { align: "center" },
      );

      const completedDate = new Date(results.completedAt);
      const dateString = completedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`on ${dateString}`, pageWidth / 2, margin + 92, {
        align: "center",
      }); // Score Section

      doc.setFontSize(12);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(251, 191, 36);
      doc.text("Test Results", pageWidth / 2, margin + 115, {
        align: "center",
      }); // Score boxes

      const boxWidth = (pageWidth - 2 * margin - 10) / 3;
      const boxHeight = 35;
      const boxY = margin + 125; // Total Score Box

      drawScoreBox(
        doc,
        margin,
        boxY,
        boxWidth,
        boxHeight,
        "Total Score",
        `${results.totalScore}/1600`,
      ); // R&W Score Box

      drawScoreBox(
        doc,
        margin + boxWidth + 5,
        boxY,
        boxWidth,
        boxHeight,
        "Reading & Writing",
        `${results.rwScore}/800`,
      ); // Math Score Box

      drawScoreBox(
        doc,
        margin + 2 * (boxWidth + 5),
        boxY,
        boxWidth,
        boxHeight,
        "Math",
        `${results.mathScore}/800`,
      ); // Raw Scores

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.setFont("Helvetica", "normal");
      doc.text(
        `Raw Scores: R&W ${results.rwRaw}/54 • Math ${results.mathRaw}/44`,
        pageWidth / 2,
        boxY + boxHeight + 10,
        { align: "center" },
      ); // Percentile

      const percentile = estimatePercentile(results.totalScore);
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.setFont("Helvetica", "bold");
      doc.text(
        `Estimated Percentile: ${percentile}th`,
        pageWidth / 2,
        boxY + boxHeight + 18,
        { align: "center" },
      ); // Footer

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(
        "This certificate is issued upon successful completion of the test.",
        pageWidth / 2,
        pageHeight - margin - 15,
        { align: "center" },
      );
      doc.text(
        `Attempt ID: ${results.id.substring(0, 8)}...`,
        pageWidth / 2,
        pageHeight - margin - 10,
        { align: "center" },
      ); // Save PDF

      const filename = `SAT_ALFA_${results.student.firstName}_${results.student.lastName}_${results.totalScore}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-slate-950 hover:bg-[#EBFF00] disabled:opacity-50"
    >
      <Download className="w-5 h-5" />
      {isGenerating ? "Generating..." : "Download Certificate"}
    </Button>
  );
}

function drawScoreBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  score: string,
) {
  // Box background
  doc.setFillColor(30, 41, 59); // slate-900
  doc.rect(x, y, width, height, "F"); // Box border

  doc.setDrawColor(251, 191, 36); // yellow-400
  doc.setLineWidth(1);
  doc.rect(x, y, width, height); // Label

  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36);
  doc.setFont("Helvetica", "bold");
  doc.text(label, x + width / 2, y + 8, { align: "center" }); // Score

  doc.setFontSize(14);
  doc.setTextColor(226, 232, 240);
  doc.setFont("Helvetica", "bold");
  doc.text(score, x + width / 2, y + 22, { align: "center" });
}

function estimatePercentile(totalScore: number): number {
  if (totalScore >= 1500) return 95;
  if (totalScore >= 1400) return 88;
  if (totalScore >= 1300) return 78;
  if (totalScore >= 1200) return 65;
  if (totalScore >= 1100) return 50;
  if (totalScore >= 1000) return 35;
  if (totalScore >= 900) return 20;
  return 10;
}
