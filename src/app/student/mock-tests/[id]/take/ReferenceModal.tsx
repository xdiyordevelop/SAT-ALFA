"use client";

import React from "react";
import { useTestContext } from "../context/TestContext";
import { X } from "lucide-react";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface FormulaCardProps {
  title: string;
  formulas: string[];
  className?: string;
}

function FormulaCard({ title, formulas, className = "" }: FormulaCardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-4 ${className}`}
    >
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {formulas.map((f, i) => (
          <MathRenderer
            key={i}
            text={f}
            className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
          />
        ))}
      </div>
    </div>
  );
}

export function ReferenceModal(): React.ReactElement {
  const { isReferenceOpen, setReferenceOpen } = useTestContext();

  if (!isReferenceOpen) return <></>;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0a0a0a]/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setReferenceOpen(false);
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              SAT Math Reference
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official College Board Formula Sheet
            </p>
          </div>
          <button
            onClick={() => setReferenceOpen(false)}
            className="p-2 hover:bg-slate-100 dark:bg-[#1c1b1b] rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Areas */}
          <FormulaCard
            title="Area"
            formulas={[
              "Circle: \\( A = \\pi r^2 \\)",
              "Rectangle: \\( A = lw \\)",
              "Triangle: \\( A = \\frac{1}{2}bh \\)",
            ]}
          />

          {/* Circumference */}
          <FormulaCard
            title="Circumference"
            formulas={[
              "Circle: \\( C = 2\\pi r \\)",
              "Circle (diameter): \\( C = \\pi d \\)",
            ]}
          />

          {/* Pythagorean Theorem */}
          <FormulaCard
            title="Pythagorean Theorem"
            formulas={["\\( a^2 + b^2 = c^2 \\)"]}
          />

          {/* Special Right Triangles */}
          <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              Special Right Triangles
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* 30-60-90 */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  30°–60°–90°
                </p>
                <svg
                  viewBox="0 0 120 110"
                  className="w-full max-w-[140px] mx-auto"
                  fill="none"
                >
                  <polygon
                    points="10,100 110,100 10,10"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <text x="14" y="98" fontSize="9" fill="#94a3b8">
                    30°
                  </text>
                  <text x="90" y="98" fontSize="9" fill="#94a3b8">
                    60°
                  </text>
                  <text x="14" y="22" fontSize="9" fill="#94a3b8">
                    90°
                  </text>
                  <text x="55" y="108" fontSize="9" fill="#e2e8f0">
                    x
                  </text>
                  <text x="0" y="58" fontSize="9" fill="#e2e8f0">
                    x√3
                  </text>
                  <text x="60" y="52" fontSize="9" fill="#e2e8f0">
                    2x
                  </text>
                </svg>
              </div>

              {/* 45-45-90 */}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  45°–45°–90°
                </p>
                <svg
                  viewBox="0 0 120 110"
                  className="w-full max-w-[140px] mx-auto"
                  fill="none"
                >
                  <polygon
                    points="10,100 110,100 10,10"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <text x="14" y="98" fontSize="9" fill="#94a3b8">
                    45°
                  </text>
                  <text x="90" y="98" fontSize="9" fill="#94a3b8">
                    45°
                  </text>
                  <text x="14" y="22" fontSize="9" fill="#94a3b8">
                    90°
                  </text>
                  <text x="55" y="108" fontSize="9" fill="#e2e8f0">
                    x
                  </text>
                  <text x="0" y="58" fontSize="9" fill="#e2e8f0">
                    x
                  </text>
                  <text x="62" y="52" fontSize="9" fill="#e2e8f0">
                    x√2
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Volume */}
          <FormulaCard
            title="Volume"
            formulas={[
              "Rectangular Prism: \\( V = lwh \\)",
              "Cylinder: \\( V = \\pi r^2 h \\)",
              "Sphere: \\( V = \\frac{4}{3}\\pi r^3 \\)",
              "Cone: \\( V = \\frac{1}{3}\\pi r^2 h \\)",
              "Pyramid: \\( V = \\frac{1}{3}lwh \\)",
            ]}
          />

          {/* Key Facts */}
          <FormulaCard
            title="Key Facts"
            formulas={[
              "A circle has \\( 360° \\) of arc",
              "A circle has \\( 2\\pi \\) radians of arc",
              "The sum of angles in a triangle is \\( 180° \\)",
            ]}
          />
        </div>

        {/* Footer note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            The number of degrees of arc in a circle is 360. The number of
            radians of arc in a circle is 2π. The sum of the measures in degrees
            of the angles of a triangle is 180.
          </p>
        </div>
      </div>
    </div>
  );
}
