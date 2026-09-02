const fs = require('fs');
let content = fs.readFileSync('src/app/student/topics/[id]/page.tsx', 'utf8');
content = content.replace(/<video\s+src=\{embedUrl\}/g, '<video \n                        src={topic.videoPath}');
fs.writeFileSync('src/app/student/topics/[id]/page.tsx', content);
