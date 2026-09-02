const fs = require('fs');
let content = fs.readFileSync('src/app/student/topics/[id]/page.tsx', 'utf8');

const replacement = `
                {topic.videoPath ? (
                  topic.videoPath.startsWith('http') ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                      <iframe 
                        src={topic.videoPath} 
                        className="absolute inset-0 w-full h-full border-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                      <video 
                        src={topic.videoPath} 
                        controls
                        controlsList="nodownload"
                        className="absolute inset-0 w-full h-full object-contain"
                      ></video>
                    </div>
                  )
                ) : (
`;

content = content.replace(
  /\{embedUrl \? \([\s\S]*?\) : \(/,
  replacement
);

fs.writeFileSync('src/app/student/topics/[id]/page.tsx', content);
