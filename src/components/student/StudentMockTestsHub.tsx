"use client";

import Link from "next/link";
import { Play, CheckCircle, Clock, Timer, BarChart2 } from "lucide-react";
import { useState } from "react";

interface AvailableTest {
  id: string;
  name: string;
  questions: any[];
  studentAttempts: {
    id: string;
    totalScore: number | null;
    completedAt: Date | null;
  }[];
}

interface CompletedAttempt {
  id: string;
  totalScore: number | null;
  completedAt: Date | null;
  satTest: { name: string };
}

interface StudentMockTestsHubProps {
  availableTests: AvailableTest[];
  completedAttempts: CompletedAttempt[];
  highestScore: number | null;
}

export function StudentMockTestsHub({
  availableTests,
  completedAttempts,
  highestScore,
}: StudentMockTestsHubProps) {
  const [filter, setFilter] = useState<"ALL" | "TODO" | "COMPLETED">("ALL");

  const completedSet = new Set(
    completedAttempts.map((a) => a.satTest.name)
  );

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Mock Imtihonlar
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Mashq testini tanlang va o'z darajangizni oshiring.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-lg p-1 flex">
             <button
               onClick={() => setFilter("ALL")}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === "ALL" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"}`}
             >
               Barchasi
             </button>
             <button
               onClick={() => setFilter("TODO")}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === "TODO" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"}`}
             >
               Yangi
             </button>
             <button
               onClick={() => setFilter("COMPLETED")}
               className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === "COMPLETED" ? "bg-slate-100 dark:bg-[#1c1b1b] text-slate-900 dark:text-[#EBFF00]" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"}`}
             >
               Yakunlangan
             </button>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Render Available Tests (Not Started / In Progress) */}
        {availableTests
          .filter(t => filter === "ALL" || filter === "TODO" || (filter === "COMPLETED" && t.studentAttempts.some(a => a.completedAt)))
          .map((test) => {
            
          const attempt = test.studentAttempts[0];
          const isCompleted = attempt?.completedAt != null;
          const isInProgress = attempt && !attempt.completedAt;
          
          if (filter === "TODO" && isCompleted) return null;
          if (filter === "COMPLETED" && !isCompleted) return null;

          if (isCompleted) {
            // Completed Card
            return (
              <div key={test.id} className="bg-slate-50 dark:bg-[#131313]/50 border border-slate-200 dark:border-white/5 rounded-xl p-6 flex flex-col opacity-90 hover:opacity-100 transition-opacity shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-emerald-100 dark:bg-[#1c1b1b] border border-emerald-200 dark:border-white/10 text-emerald-700 dark:text-slate-400 font-bold uppercase tracking-wider px-3 py-1 rounded text-[10px]">Yakunlangan</span>
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-slate-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{test.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                  <span>Ball: <span className="font-bold text-slate-900 dark:text-white">{attempt.totalScore || '-'}</span></span>
                  <span>•</span>
                  <span>{new Date(attempt.completedAt!).toLocaleDateString()}</span>
                </div>
                <div className="mt-auto">
                  <Link href={`/student/results/${attempt.id}`} className="w-full bg-transparent border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-lg hover:border-slate-400 hover:bg-slate-100 dark:hover:border-white/30 dark:hover:bg-[#1c1b1b] transition-all flex items-center justify-center gap-2">
                    <BarChart2 className="w-4 h-4" /> Natijani ko'rish
                  </Link>
                </div>
              </div>
            );
          } else if (isInProgress) {
            // In Progress Card
             return (
              <div key={test.id} className="bg-white dark:bg-[#131313] border border-[#EBFF00] dark:border-[#EBFF00] rounded-xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_15px_rgba(235,255,0,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00] dark:bg-[#EBFF00] opacity-10 blur-[40px]"></div>
                <div className="flex justify-between items-start mb-6 z-10">
                  <span className="bg-yellow-50 dark:bg-[#EBFF00]/10 border border-yellow-200 dark:border-[#EBFF00]/20 text-[#d9ff00] dark:text-[#EBFF00] font-bold uppercase tracking-wider px-3 py-1 rounded text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EBFF00] dark:bg-[#EBFF00] animate-pulse"></span> Davom etmoqda
                  </span>
                  <Timer className="w-5 h-5 text-yellow-600 dark:text-[#EBFF00]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 z-10">{test.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium z-10">
                  <span>Jarayonda...</span>
                  <span>•</span>
                  <span>{test.questions.length} Savol</span>
                </div>
                <div className="mt-auto z-10">
                   <Link href={`/student/mock-tests/${test.id}/take`} className="w-full bg-transparent border-2 border-[#EBFF00] dark:border-[#EBFF00] text-[#d9ff00] dark:text-[#EBFF00] font-bold py-3 px-4 rounded-lg hover:bg-yellow-50 dark:hover:bg-[#EBFF00] dark:hover:text-black transition-all flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Davom ettirish
                  </Link>
                </div>
              </div>
            );
          } else {
            // Not Started Card
            return (
              <div key={test.id} className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col hover:border-slate-300 dark:hover:border-[#EBFF00] transition-colors group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBFF00] dark:bg-[#EBFF00] opacity-5 blur-[40px] group-hover:opacity-10 transition-opacity"></div>
                <div className="flex justify-between items-start mb-6 z-10">
                  <span className="bg-slate-100 dark:bg-[#1c1b1b] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider px-3 py-1 rounded text-[10px]">Boshlanmagan</span>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 z-10">{test.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium z-10">
                  <span>2s 14d</span>
                  <span>•</span>
                  <span>{test.questions.length} Savol</span>
                </div>
                <div className="mt-auto z-10">
                   <Link href={`/student/mock-tests/${test.id}/take`} className="w-full bg-[#EBFF00] dark:bg-[#EBFF00] text-slate-950 font-bold py-3 px-4 rounded-lg hover:bg-[#d9ff00] dark:hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(235,255,0,0.1)]">
                    <Play className="w-4 h-4" /> Boshlash
                  </Link>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
