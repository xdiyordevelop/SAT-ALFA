const fs = require('fs');
let content = fs.readFileSync('src/app/admin/groups/page.tsx', 'utf8');

const replacement = `                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex flex-col gap-2">
                        <Link href={\`/admin/groups/\${group.id}\`} className="w-full block text-center text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                          View Group →
                        </Link>
                        <Link href={\`/admin/groups/\${group.id}/curriculum\`} className="w-full text-center py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-lg font-medium text-sm transition-colors border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center gap-2">
                          <BookOpen className="w-4 h-4" /> Syllabus Roadmap
                        </Link>
                      </div>
                    </div>`;

content = content.replace(/<div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">[\s\S]*?<\/Link>\n                    <\/div>/, replacement);

fs.writeFileSync('src/app/admin/groups/page.tsx', content);
