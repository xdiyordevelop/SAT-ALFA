const fs = require('fs');

let code = fs.readFileSync('src/app/admin/mock-tests/analytics/components/AnalyticsFilters.tsx', 'utf8');

// Import icons
code = code.replace(/import \{ useRouter, useSearchParams, usePathname \} from 'next\/navigation'/, "import { useRouter, useSearchParams, usePathname } from 'next/navigation'\nimport { FileText, Users, Calendar } from 'lucide-react'");

// Add icons and update container styling
code = code.replace(/rounded-lg p-4/, 'rounded-2xl shadow-sm p-5');

code = code.replace(
  /<select \n\s*value=\{currentTest \|\| 'all'\}/,
  '<div className="relative">\n          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />\n          <select \n            value={currentTest || \'all\'}'
);
code = code.replace(
  /\{tests\.map\(t => <option key=\{t\.id\} value=\{t\.id\}>\{t\.name\}<\/option>\)\}\n\s*<\/select>/,
  '{tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}\n          </select>\n        </div>'
);

code = code.replace(
  /<select \n\s*value=\{currentGroup \|\| 'all'\}/,
  '<div className="relative">\n          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />\n          <select \n            value={currentGroup || \'all\'}'
);
code = code.replace(
  /\{groups\.map\(g => <option key=\{g\.id\} value=\{g\.id\}>\{g\.name\}<\/option>\)\}\n\s*<\/select>/,
  '{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}\n          </select>\n        </div>'
);

code = code.replace(
  /<select \n\s*value=\{currentTime \|\| 'all'\}/,
  '<div className="relative">\n          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />\n          <select \n            value={currentTime || \'all\'}'
);
code = code.replace(
  /<option value="90">Last 90 Days<\/option>\n\s*<\/select>/,
  '<option value="90">Last 90 Days</option>\n          </select>\n        </div>'
);

// Add pl-10 to select classNames
code = code.replace(/className="w-full px-3 py-2/g, 'className="w-full pl-10 pr-3 py-2.5');
code = code.replace(/rounded-lg border/g, 'rounded-xl border');

fs.writeFileSync('src/app/admin/mock-tests/analytics/components/AnalyticsFilters.tsx', code);

