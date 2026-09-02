const fs = require('fs');

let pageCode = fs.readFileSync('src/app/admin/mock-tests/analytics/page.tsx', 'utf8');
pageCode = pageCode.replace(/\/\/ Performance by domain.*?const performanceByDomain = \[[\s\S]*?\]/s, 'const performanceByDomain: any[] = [];');
fs.writeFileSync('src/app/admin/mock-tests/analytics/page.tsx', pageCode);

let compCode = fs.readFileSync('src/app/admin/mock-tests/analytics/components/PerformanceBenchmarks.tsx', 'utf8');
compCode = compCode.replace(/\{\/\* Domain Performance \*\/\}[\s\S]*?<\/Card>/s, '');
fs.writeFileSync('src/app/admin/mock-tests/analytics/components/PerformanceBenchmarks.tsx', compCode);
