const fs = require('fs');

let pageCode = fs.readFileSync('src/app/admin/mock-tests/analytics/page.tsx', 'utf8');
pageCode = pageCode.replace(/import \{ subDays \} from 'date-fns'\n/, '');
pageCode = pageCode.replace(/gte: subDays\(new Date\(\), days\),/g, 'gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),');
fs.writeFileSync('src/app/admin/mock-tests/analytics/page.tsx', pageCode);

