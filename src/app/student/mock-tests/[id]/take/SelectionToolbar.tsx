"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTestState } from "./hooks/useTestState";
import { Card } from "@/components/ui/Card";
import { Highlighter, Underline, X } from "lucide-react";

interface Annotation {
  text: string;
  color: string;
  style: "highlight" | "underline";
  timestamp: number;
}

export function SelectionToolbar(): React.ReactElement {
  const { getCurrentQuestion } = useTestState();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState<string>("");
  const [annotations, setAnnotations] = useState<Record<string, Annotation[]>>(
    {},
  );
  const toolbarRef = useRef<HTMLDivElement>(null);
  const currentQuestion = getCurrentQuestion();

  // Listen for text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        setIsVisible(false);
        return;
      }
      const text = selection.toString();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 50,
      });
      setIsVisible(true);
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  // Close toolbar on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false);
        window.getSelection()?.removeAllRanges();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || !selectedText) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    const colorClasses: Record<string, string> = {
      yellow: "bg-yellow-300/40 text-slate-700 dark:text-slate-300",
      blue: "bg-blue-300/40 text-slate-700 dark:text-slate-300",
      green: "bg-green-300/40 text-slate-700 dark:text-slate-300",
    };
    span.className = `px-1 rounded cursor-pointer transition-colors hover:opacity-75 ${colorClasses[color] || colorClasses.yellow}`;
    span.textContent = selectedText;
    span.title = "Click to remove highlight";
    range.deleteContents();
    range.insertNode(span);

    // Store annotation
    const key = `q-${currentQuestion}`;
    setAnnotations((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        {
          text: selectedText,
          color,
          style: "highlight",
          timestamp: Date.now(),
        },
      ],
    }));
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleUnderline = () => {
    const selection = window.getSelection();
    if (!selection || !selectedText) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.className =
      "underline decoration-[#EBFF00] decoration-2 underline-offset-2 cursor-pointer hover:decoration-[#EBFF00] transition-colors";
    span.textContent = selectedText;
    span.title = "Click to remove underline";
    range.deleteContents();
    range.insertNode(span);

    // Store annotation
    const key = `q-${currentQuestion}`;
    setAnnotations((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        {
          text: selectedText,
          color: "yellow",
          style: "underline",
          timestamp: Date.now(),
        },
      ],
    }));
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleClearAnnotations = () => {
    const key = `q-${currentQuestion}`;
    setAnnotations((prev) => ({
      ...prev,
      [key]: [],
    }));
    setIsVisible(false);
  };

  if (!isVisible) return <></>;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-40 pointer-events-auto"
      style={{
        left: `${Math.max(0, position.x - 150)}px`,
        top: `${Math.max(0, position.y)}px`,
      }}
    >
      <Card className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 p-2">
        <div className="flex items-center gap-1">
          {/* Yellow Highlight */}
          <button
            onClick={() => handleHighlight("yellow")}
            className="p-2 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded transition-colors"
            title="Highlight yellow"
          >
            <Highlighter className="w-4 h-4 text-slate-900 dark:text-[#EBFF00]" />
          </button>

          {/* Blue Highlight */}
          <button
            onClick={() => handleHighlight("blue")}
            className="p-2 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded transition-colors"
            title="Highlight blue"
          >
            <Highlighter className="w-4 h-4 text-blue-600" />
          </button>

          {/* Green Highlight */}
          <button
            onClick={() => handleHighlight("green")}
            className="p-2 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded transition-colors"
            title="Highlight green"
          >
            <Highlighter className="w-4 h-4 text-green-600" />
          </button>

          {/* Underline */}
          <button
            onClick={handleUnderline}
            className="p-2 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded transition-colors border-l border-slate-200 dark:border-white/10"
            title="Underline"
          >
            <Underline className="w-4 h-4 text-slate-900 dark:text-[#EBFF00]" />
          </button>

          {/* Clear */}
          <button
            onClick={handleClearAnnotations}
            className="p-2 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded transition-colors border-l border-slate-200 dark:border-white/10"
            title="Clear annotations for this question"
          >
            <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </Card>
    </div>
  );
}
