const fs = require('fs');

let code = fs.readFileSync('src/app/admin/mock-tests/analytics/components/AttemptHistoryTable.tsx', 'utf8');

// Fix missing $ in template literals
code = code.replace(/inline \{/g, 'inline ${');
code = code.replace(/dark:bg-slate-950 \{/g, 'dark:bg-slate-950 ${');
code = code.replace(/font-bold \{/g, 'font-bold ${');
code = code.replace(/font-bold text-lg \{/g, 'font-bold text-lg ${');

// Add groupName under studentName
code = code.replace(
  /<p className="font-bold text-slate-900 dark:text-white">\{attempt\.studentName\}<\/p>/,
  '<p className="font-bold text-slate-900 dark:text-white">{attempt.studentName}</p>\n <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{attempt.groupName}</p>'
);

// Remove the redundant old pagination info block at the very bottom
code = code.replace(/\{\/\* Pagination info \*\/\}\s*\{attempts\.length > 0 && \(\s*<div.*?<\/div>\s*\)\}/s, '');

fs.writeFileSync('src/app/admin/mock-tests/analytics/components/AttemptHistoryTable.tsx', code);
