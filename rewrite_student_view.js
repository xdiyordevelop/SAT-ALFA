const fs = require('fs');
let content = fs.readFileSync('src/components/student/StudentMockTestsView.tsx', 'utf8');

// Replace tabs
content = content.replace(/const tabs = \[\s*\{ id: "available"[^\]]+\];/m, `const tabs = [
    { id: "available", label: "Available Tests", icon: FileText },
    { id: "completed", label: "Completed Tests", icon: Award },
  ];`);

// Replace activeTab states
content = content.replace(/const \[activeTab, setActiveTab\] = useState<"available" \| "pending" \| "approved" \| "rejected">/, 'const [activeTab, setActiveTab] = useState<"available" | "completed">');

// Rename approvedTests to completedTests 
content = content.replace(/const approvedTests = submissions\.filter\(s => s\.status === "APPROVED"\);/g, 'const completedTests = submissions.filter(s => s.status === "COMPLETED" || s.status === "APPROVED");');

// Fix tabs mapping
content = content.replace(/activeTab === "approved"/g, 'activeTab === "completed"');

// Delete the pending tab logic
content = content.replace(/\{\/\* TAB 2: PENDING REVIEW \*\/\}[\s\S]*?(?=\{\/\* TAB 3:)/, '');

// Delete rejected tab logic
content = content.replace(/\{\/\* TAB 4: REJECTED SUBMISSIONS \*\/\}[\s\S]*?(?=\{\/\* UPLOAD MODAL \*\/\}|$)/, '');

// Delete upload modal logic
content = content.replace(/\{\/\* UPLOAD MODAL \*\/\}[\s\S]*/, '      </div>\n    </div>\n  );\n}\n');

// Delete upload button
content = content.replace(/<p className="text-slate-500[^>]+>[\s\S]*?You can still upload your official SAT Bluebook score report[\s\S]*?<\/p>[\s\S]*?<button onClick=\{\(\) => setShowUploadModal\(true\)\}[\s\S]*?<\/button>/, '<p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">Check back later for new tests.</p>');

// Delete BluebookUploadComponent import
content = content.replace(/import \{ BluebookUploadComponent \}.*?;/, '');

// Delete showUploadModal state
content = content.replace(/const \[showUploadModal, setShowUploadModal\] = useState\(false\);/, '');

// Delete handleUploadComplete
content = content.replace(/const handleUploadComplete.*?\}/s, '');

// Replace text "Complete a practice test or upload your Bluebook report to get started."
content = content.replace(/Complete a practice test or upload your Bluebook report to get started./, 'Complete a practice test to get started.');

fs.writeFileSync('src/components/student/StudentMockTestsView.tsx', content);
