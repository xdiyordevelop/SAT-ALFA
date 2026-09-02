const fs = require('fs');
let content = fs.readFileSync('src/app/admin/topics/TopicsDashboardClient.tsx', 'utf8');

// Alerts
content = content.replace(/Haqiqatan ham bu mavzuni o'chirmoqchimisiz\?/g, 'Are you sure you want to delete this topic?');
content = content.replace(/Mavzuni guruh rejasidan chiqarib tashlamoqchimisiz\?/g, 'Are you sure you want to remove this topic from the group syllabus?');

// Tabs
content = content.replace(/Mavzular Banki/g, 'Topic Repository');
content = content.replace(/Guruhlar Dars Xaritasi/g, 'Group Roadmap');

// Actions
content = content.replace(/Guruhga biriktirish/g, 'Assign to Group');

// Status Badges
content = content.replace(/'O‘tilgan' : isCurrent \? 'Joriy dars' : 'Kelgusi dars'/g, "'Completed' : isCurrent ? 'Current Lesson' : 'Upcoming'");

// Modals & Empty States
content = content.replace(/Syllabusga Mavzu Qo'shish/g, 'Add Lesson to Syllabus');
content = content.replace(/Bunday mavzu topilmadi\./g, 'No topics found.');
content = content.replace(/"Biriktirilgan"/g, '"Assigned"');

fs.writeFileSync('src/app/admin/topics/TopicsDashboardClient.tsx', content);
