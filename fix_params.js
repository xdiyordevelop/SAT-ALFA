const fs = require('fs');

let pageCode = fs.readFileSync('src/app/admin/mock-tests/analytics/page.tsx', 'utf8');
pageCode = pageCode.replace(/searchParams: \{ testId\?: string; groupId\?: string; timeRange\?: string \}/, 'searchParams: Promise<{ testId?: string; groupId?: string; timeRange?: string }>');
pageCode = pageCode.replace(/const \{ testId, groupId, timeRange \} = searchParams;/, 'const resolvedSearchParams = await searchParams;\n  const { testId, groupId, timeRange } = resolvedSearchParams;');
fs.writeFileSync('src/app/admin/mock-tests/analytics/page.tsx', pageCode);

