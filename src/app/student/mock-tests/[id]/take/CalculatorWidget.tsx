"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTestContext } from "../context/TestContext";
import {
  ChevronDown,
  ChevronUp,
  X,
  GripHorizontal,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const STORAGE_KEY_POS = "sat_calc_position";
const STORAGE_KEY_SIZE = "sat_calc_size";
const DEFAULT_POS: Position = { x: 80, y: 90 };
const DEFAULT_SIZE: Size = { width: 560, height: 480 };
const MAX_SIZE: Size = { width: 900, height: 700 };
const MIN_SIZE: Size = { width: 380, height: 320 };

export function CalculatorWidget(): React.ReactElement {
  const { currentModule, isCalculatorOpen, setCalculatorOpen } =
    useTestContext();
  const [pos, setPos] = useState<Position>(DEFAULT_POS);
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const prevSizeRef = useRef<Size>(DEFAULT_SIZE);
  const prevPosRef = useRef<Position>(DEFAULT_POS);

  // Persist position/size
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem(STORAGE_KEY_POS);
      const savedSize = localStorage.getItem(STORAGE_KEY_SIZE);
      if (savedPos) setPos(JSON.parse(savedPos));
      if (savedSize) setSize(JSON.parse(savedSize));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isMaximized) {
      try {
        localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    }
  }, [pos, isMaximized]);

  useEffect(() => {
    if (!isMaximized && !isMinimized) {
      try {
        localStorage.setItem(STORAGE_KEY_SIZE, JSON.stringify(size));
      } catch {
        /* ignore */
      }
    }
  }, [size, isMaximized, isMinimized]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
      e.preventDefault();
      setIsDragging(true);
      setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    },
    [pos],
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: Math.max(
          0,
          Math.min(e.clientX - dragOffset.x, window.innerWidth - size.width),
        ),
        y: Math.max(
          0,
          Math.min(e.clientY - dragOffset.y, window.innerHeight - 60),
        ),
      });
    };

    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, dragOffset, size.width]);

  const toggleMaximize = () => {
    if (isMaximized) {
      setPos(prevPosRef.current);
      setSize(prevSizeRef.current);
      setIsMaximized(false);
    } else {
      prevPosRef.current = pos;
      prevSizeRef.current = size;
      setPos({ x: 0, y: 64 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 64 });
      setIsMaximized(true);
      setIsMinimized(false);
    }
  };

  if (currentModule < 3 || !isCalculatorOpen) return <></>;

  const containerStyle = isMaximized
    ? {
        left: 0,
        top: 64,
        width: "100vw",
        height: `calc(100vh - 64px)`,
        borderRadius: 0,
      }
    : {
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: isMinimized ? "auto" : size.height,
      };

  return (
    <div
      className="fixed z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col"
      style={containerStyle}
    >
      {/* Drag Handle / Header */}
      <div
        onMouseDown={!isMaximized ? handleMouseDown : undefined}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#131313] select-none shrink-0 ${
          !isMaximized ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Desmos Graphing Calculator
          </span>
        </div>
        <div className="flex items-center gap-1" data-no-drag>
          {/* Minimize */}
          <button
            onClick={() => {
              setIsMinimized(!isMinimized);
              setIsMaximized(false);
            }}
            className="p-1.5 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {/* Maximize / Restore */}
          <button
            onClick={toggleMaximize}
            className="p-1.5 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          {/* Close — hides but preserves graph state via iframe src staying mounted */}
          <button
            onClick={() => setCalculatorOpen(false)}
            className="p-1.5 hover:bg-red-900/50 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-red-600"
            title="Close calculator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desmos iframe — kept mounted to preserve graph state */}
      {!isMinimized && (
        <div className="flex-1 bg-white dark:bg-[#131313] overflow-hidden">
          <iframe
            src="https://www.desmos.com/calculator"
            title="Desmos Graphing Calculator"
            className="w-full h-full"
            style={{ border: "none", display: "block" }}
            allow="fullscreen"
          />
        </div>
      )}

      {/* Resize handle (bottom-right corner) */}
      {!isMaximized && !isMinimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            const startW = size.width;
            const startH = size.height;
            const onMove = (ev: MouseEvent) => {
              setSize({
                width: Math.max(
                  MIN_SIZE.width,
                  Math.min(MAX_SIZE.width, startW + ev.clientX - startX),
                ),
                height: Math.max(
                  MIN_SIZE.height,
                  Math.min(MAX_SIZE.height, startH + ev.clientY - startY),
                ),
              });
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
        >
          <svg
            viewBox="0 0 16 16"
            className="w-full h-full text-slate-600 dark:text-slate-400"
          >
            <path
              d="M14 14L6 14M14 14L14 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
