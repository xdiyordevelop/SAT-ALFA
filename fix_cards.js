const fs = require('fs');

let pageCode = fs.readFileSync('src/app/admin/mock-tests/analytics/page.tsx', 'utf8');

// Add Lucide icons import
pageCode = pageCode.replace(/import \{ Topbar \} from '@\/components\/layout\/Topbar'/, "import { Topbar } from '@/components/layout/Topbar'\nimport { Users, Target, BookOpen, Calculator, BarChart2 } from 'lucide-react'");

const cardsHtml = `
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Attempts</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalAttempts}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Avg Total Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgTotalScore}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Avg R&W</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgRWScore}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Avg Math</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgMathScore}</p>
                </div>
              </div>
            </div>
`;

pageCode = pageCode.replace(/\{\/\* Summary Cards \*\/\}[\s\S]*?\{\/\* Performance Benchmarks \*\/\}/, cardsHtml + '\n            {/* Performance Benchmarks */}');

fs.writeFileSync('src/app/admin/mock-tests/analytics/page.tsx', pageCode);

