const fs = require('fs');

let pageCode = fs.readFileSync('src/app/admin/mock-tests/analytics/page.tsx', 'utf8');
pageCode = "export const dynamic = 'force-dynamic';\n" + pageCode;
pageCode = pageCode.replace(/<AnalyticsFilters(.*)\/>/g, '<React.Suspense fallback={<div className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>}><AnalyticsFilters$1/></React.Suspense>');
fs.writeFileSync('src/app/admin/mock-tests/analytics/page.tsx', pageCode);

