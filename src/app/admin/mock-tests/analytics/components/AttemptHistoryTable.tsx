"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { AttemptRecord } from "@/app/admin/mock-tests/types/analytics";
import { Eye, ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface AttemptHistoryTableProps {
  attempts: AttemptRecord[];
}

type SortField =
  | "studentName"
  | "totalScore"
  | "completedAt"
  | "rwScore"
  | "mathScore";
type SortOrder = "asc" | "desc";

export function AttemptHistoryTable({ attempts }: AttemptHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("completedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const sortedAttemptsAll = [...attempts].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "completedAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-4 h-4 ml-1 inline ${
        sortField === field
          ? "text-[#EBFF00] dark:text-[#d9ff00]"
          : "text-slate-500 dark:text-slate-400"
      }`}
    />
  );

  return (
    <Card className="bg-white dark:bg-[#131313] border-slate-200 dark:border-white/10 overflow-hidden shadow-sm rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-white dark:bg-[#131313] border-b border-slate-200 dark:border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                <button
                  onClick={() => handleSort("studentName")}
                  className="flex items-center hover:text-[#EBFF00] transition-colors"
                >
                  Student
                  <SortIcon field="studentName" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                Test Name
              </th>
              <th className="px-6 py-4 text-left text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                <button
                  onClick={() => handleSort("completedAt")}
                  className="flex items-center hover:text-[#EBFF00] transition-colors"
                >
                  Completed
                  <SortIcon field="completedAt" />
                </button>
              </th>
              <th className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                <button
                  onClick={() => handleSort("rwScore")}
                  className="flex items-center justify-center hover:text-[#EBFF00] transition-colors w-full"
                >
                  R&W
                  <SortIcon field="rwScore" />
                </button>
              </th>
              <th className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                <button
                  onClick={() => handleSort("mathScore")}
                  className="flex items-center justify-center hover:text-[#EBFF00] transition-colors w-full"
                >
                  Math
                  <SortIcon field="mathScore" />
                </button>
              </th>
              <th className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                <button
                  onClick={() => handleSort("totalScore")}
                  className="flex items-center justify-center hover:text-[#EBFF00] transition-colors w-full"
                >
                  Total
                  <SortIcon field="totalScore" />
                </button>
              </th>
              <th className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  No test attempts found
                </td>
              </tr>
            ) : (
              sortedAttemptsAll
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((attempt, index) => (
                  <tr
                    key={attempt.id}
                    className={`border-b border-slate-200 dark:border-white/10 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      index % 2 === 0 ? "bg-white dark:bg-[#131313]/30" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {attempt.studentName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {attempt.groupName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {attempt.testName}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {new Date(attempt.completedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-bold ${
                          attempt.rwScore
                            ? attempt.rwScore >= 600
                              ? "text-emerald-600"
                              : attempt.rwScore >= 500
                                ? "text-[#EBFF00] dark:text-[#d9ff00]"
                                : "text-red-600"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {attempt.rwScore ? attempt.rwScore : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-bold ${
                          attempt.mathScore
                            ? attempt.mathScore >= 600
                              ? "text-emerald-600"
                              : attempt.mathScore >= 500
                                ? "text-[#EBFF00] dark:text-[#d9ff00]"
                                : "text-red-600"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {attempt.mathScore ? attempt.mathScore : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-bold text-lg ${
                          attempt.totalScore
                            ? attempt.totalScore >= 1200
                              ? "text-emerald-600"
                              : attempt.totalScore >= 1000
                                ? "text-[#EBFF00] dark:text-[#d9ff00]"
                                : "text-red-600"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {attempt.totalScore ? attempt.totalScore : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/admin/mock-tests/results/${attempt.id}`}>
                        <Button className="text-xs px-3 py-1 bg-[#EBFF00] hover:bg-[#d9ff00] dark:bg-[#EBFF00] dark:hover:bg-[#d9ff00] text-slate-900 flex items-center gap-1 mx-auto">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Showing{" "}
            {Math.min((currentPage - 1) * itemsPerPage + 1, attempts.length)} to{" "}
            {Math.min(currentPage * itemsPerPage, attempts.length)} of{" "}
            {attempts.length} attempts
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(Math.ceil(attempts.length / itemsPerPage), p + 1),
                )
              }
              disabled={
                currentPage >= Math.ceil(attempts.length / itemsPerPage)
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
