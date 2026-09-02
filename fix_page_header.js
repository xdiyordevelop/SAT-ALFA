const fs = require('fs');
let content = fs.readFileSync('src/app/admin/topics/page.tsx', 'utf8');

// Breadcrumbs
content = content.replace(
  /breadcrumbs=\{.*?label:\s*"Admin".*?label:\s*"Mock Tests".*?label:\s*"Topics".*?\}/,
  'breadcrumbs={[{ label: "Admin" }, { label: "Academics" }, { label: "Topics" }]}'
);

// Title
content = content.replace(
  /<h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">\s*Curriculum & Roadmap\s*<\/h1>/,
  '<h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">\n                Topics\n              </h1>'
);

// Subtitle
content = content.replace(
  /<p className="text-neutral-600 dark:text-neutral-400">\s*Manage the unified topic bank and group-specific learning roadmaps\.\s*<\/p>/,
  '<p className="text-neutral-600 dark:text-neutral-400">\n                Manage topic repository and group-specific learning roadmaps.\n              </p>'
);

// Update button string "+ Yangi Mavzu Yaratish" to "+ Create Topic"
content = content.replace(
  /Yangi Mavzu Yaratish/,
  'Create Topic'
);

fs.writeFileSync('src/app/admin/topics/page.tsx', content);
