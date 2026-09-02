const fs = require('fs');
let content = fs.readFileSync('src/app/admin/groups/page.tsx', 'utf8');

content = content.replace(
  /import \{ Users, Calendar, Plus \} from "lucide-react";/,
  `import { Users, Calendar, Plus, BookOpen } from "lucide-react";`
);

content = content.replace(
  /<Link\s*key=\{group\.id\}\s*href=\{`\/admin\/groups\/\$\{group\.id\}`\}\s*className="animate-slide-up"\s*style=\{\{\s*animation: `slideUp 0\.3s ease-out \$\{100 \+ index \* 50\}ms backwards`,\s*\}\}\s*>/g,
  `<div key={group.id} className="animate-slide-up" style={{ animation: \`slideUp 0.3s ease-out \${100 + index * 50}ms backwards\` }}>`
);

content = content.replace(
  /<\/Link>\s*\)\)\s*\)\s*:\s*\(/g,
  `</div>\n              ))\n            ) : (`
);

content = content.replace(
  /<button className="w-full text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">/g,
  `<Link href={\`/admin/groups/\${group.id}\`} className="w-full block text-center text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">`
);

content = content.replace(
  /View Group →\s*<\/button>/g,
  `View Group →\n                        </Link>`
);

content = content.replace(
  /<div className="flex flex-col gap-2">/g,
  `<div className="flex flex-col gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">`
);

content = content.replace(
  /<object>/g,
  ``
);

content = content.replace(
  /<\/object>/g,
  ``
);

fs.writeFileSync('src/app/admin/groups/page.tsx', content);
