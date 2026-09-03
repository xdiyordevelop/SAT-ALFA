"use client";

import React, { useEffect, useCallback } from "react";
import { useTestContext } from "../context/TestContext";

type HighlightColor = "yellow" | "blue";

const COLOR_MAP: Record<HighlightColor, string> = {
  yellow: "bg-[#EBFF00]/60 text-slate-900 dark:text-white",
  blue: "bg-blue-400/50 text-slate-900 dark:text-white",
};

// Global color preference (doesn't need to be in context);
let currentColor: HighlightColor = "yellow";

function setGlobalColor(c: HighlightColor) {
  currentColor = c;
}

/**
 * Injects a highlight <mark> around the current selection.
 * Clicking an existing mark shows a remove button via title attribute.
 */
function applyHighlight() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);

  // Don't highlight inside inputs or buttons
  const container = range.commonAncestorContainer;
  const el =
    container.nodeType === Node.ELEMENT_NODE
      ? (container as Element)
      : container.parentElement;
  if (!el) return;
  if (el.closest("button,input,textarea,select,[data-no-highlight]")) return;

  const mark = document.createElement("mark");
  mark.dataset.satHighlight = currentColor;
  mark.title = "Click to remove highlight";
  mark.className = `sat-highlight cursor-pointer rounded px-0.5 ${COLOR_MAP[currentColor]}`;
  mark.style.backgroundColor =
    currentColor === "yellow"
      ? "rgba(250,204,21,0.55)"
      : "rgba(96,165,250,0.45)";
  mark.style.color = "inherit";

  try {
    range.surroundContents(mark);
  } catch {
    // If selection spans multiple elements, wrap with extractContents
    const fragment = range.extractContents();
    mark.appendChild(fragment);
    range.insertNode(mark);
  }
  selection.removeAllRanges();
}

function removeHighlight(mark: HTMLElement) {
  const parent = mark.parentNode;
  if (!parent) return;
  while (mark.firstChild) {
    parent.insertBefore(mark.firstChild, mark);
  }
  parent.removeChild(mark);
}

/**
 * Hook that activates or deactivates annotation mode.
 * In active mode: mouseup → highlight selection; click on mark → remove it.
 */
export function useAnnotateTool() {
  const { isAnnotateActive } = useTestContext();

  const handleMouseUp = useCallback(() => {
    if (!isAnnotateActive) return;
    applyHighlight();
  }, [isAnnotateActive]);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const mark = target.closest(
      "mark[data-sat-highlight]",
    ) as HTMLElement | null;
    if (mark) removeHighlight(mark);
  }, []);

  useEffect(() => {
    if (isAnnotateActive) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("click", handleClick);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleClick);
    };
  }, [isAnnotateActive, handleMouseUp, handleClick]);
}

/**
 * Color picker that appears when Annotate is active (shown in header).
 */
export function AnnotateColorPicker() {
  const { isAnnotateActive } = useTestContext();
  const [selected, setSelected] = React.useState<HighlightColor>("yellow");

  if (!isAnnotateActive) return null;

  const pick = (c: HighlightColor) => {
    setSelected(c);
    setGlobalColor(c);
  };

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/10 rounded-lg"
      data-no-highlight
    >
      <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
        Color:
      </span>
      <button
        onClick={() => pick("yellow")}
        className={`w-5 h-5 rounded-full bg-[#EBFF00] border-2 transition-transform ${selected === "yellow" ? "border-white scale-110" : "border-transparent"}`}
        title="Yellow highlight"
      />
      <button
        onClick={() => pick("blue")}
        className={`w-5 h-5 rounded-full bg-blue-400 border-2 transition-transform ${selected === "blue" ? "border-white scale-110" : "border-transparent"}`}
        title="Blue highlight"
      />
    </div>
  );
}
