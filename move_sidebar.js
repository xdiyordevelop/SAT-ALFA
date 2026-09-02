const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Add Layers to imports if not there
if (!content.includes('Layers,')) {
    content = content.replace(/BookOpen,/, 'BookOpen,\n  Layers,');
}

// Remove from Mock Tests Hub
content = content.replace(/\s*\{\s*href:\s*"\/admin\/topics",\s*icon:\s*BookOpen,\s*label:\s*"Topics & Skills"\s*\},/g, '');

// Add to Academics
content = content.replace(
    /\{\s*href:\s*"\/admin\/attendance",\s*icon:\s*Calendar,\s*label:\s*"Attendance"\s*\}/g,
    '{ href: "/admin/attendance", icon: Calendar, label: "Attendance" },\n        { href: "/admin/topics", icon: Layers, label: "Topics" }'
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
