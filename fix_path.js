const fs = require('fs');

let code = fs.readFileSync('src/app/admin/mock-tests/analytics/components/AnalyticsFilters.tsx', 'utf8');

// Add usePathname import
code = code.replace(/useRouter, useSearchParams/, 'useRouter, useSearchParams, usePathname');

// Add usePathname hook
code = code.replace(/const searchParams = useSearchParams\(\)/, 'const searchParams = useSearchParams()\n  const pathname = usePathname()');

// Replace router.push line
code = code.replace(/router\.push\(\`\?\$\{params\.toString\(\)\}\`, \{ scroll: false \}\)/, 'router.push(`${pathname}?${params.toString()}`, { scroll: false })');

fs.writeFileSync('src/app/admin/mock-tests/analytics/components/AnalyticsFilters.tsx', code);
