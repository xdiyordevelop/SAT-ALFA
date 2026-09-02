# SAT-ALFA DESIGN & VISUAL FIXES - IMPLEMENTATION PROMPTS

**Generated:** 2026-09-02  
**Status:** Ready for implementation  
**Priority:** URGENT (All items needed before launch)

---

## PART 1: IMMEDIATE VISUAL FIXES (Day 1-2)

### Prompt 1: Fix Login Form Button States
```
File: /src/components/auth/NeonLoginForm.tsx

ISSUE: Submit button disabled state not visually obvious (opacity-70 too subtle)

FIX:
- Replace: disabled:opacity-70
- With: disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
- Add: disabled:shadow-none to remove glow effect
- Add: disabled:hover:shadow-none to disable hover

Expected Result: Button clearly appears disabled (grayed out, no glow)
```

### Prompt 2: Fix Form Field Focus States
```
File: /src/components/auth/NeonLoginForm.tsx

ISSUE: Input focus indicator weak, yellow border hard to see in light mode

FIX:
Replace the input className:
FROM:
  focus:outline-none focus:border-[#EBFF00] dark:focus:shadow-[0_0_8px_rgba(235,255,0,0.3)]

TO:
  focus:outline-none focus:border-[#EBFF00] focus:ring-2 focus:ring-[#EBFF00] focus:ring-offset-2
  dark:focus:ring-offset-[#0a0a0a]

Expected Result: Clear yellow ring around input when focused
```

### Prompt 3: Fix Error Message Styling
```
File: /src/components/auth/NeonLoginForm.tsx

ISSUE: Error message too minimal, hard to see

CURRENT (Line 74-78):
  <div className="p-3 text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-lg flex items-start gap-2">

FIX:
  <div className="p-4 text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 dark:border-rose-400 rounded-lg flex items-start gap-3 shadow-sm">
    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
    </svg>
    <span>{error}</span>
  </div>

Expected Result: Error message with left red border, better visual hierarchy
```

### Prompt 4: Fix Role Tab Styling
```
File: /src/components/auth/NeonLoginForm.tsx

ISSUE: Tab buttons different heights/padding, hover state missing

FIX:
Replace (Line 41-64):
  FROM: flex bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-lg mb-8

  TO: flex bg-slate-100 dark:bg-[#1c1b1b] p-1 rounded-lg mb-8 gap-1

Replace button styling:
  FROM: flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300

  TO: flex-1 py-2.5 px-4 text-sm font-semibold rounded-md transition-all duration-300

Add hover for inactive button:
  text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200
  hover:bg-slate-50 dark:hover:bg-[#131313]

Expected Result: Equal-height buttons with hover effect
```

### Prompt 5: Fix Password Icon
```
File: /src/components/auth/NeonLoginForm.tsx

ISSUE: KeyRound icon confusing for password field

FIX:
Replace (Line 113):
  FROM: <KeyRound className="w-5 h-5" />
  TO: <Lock className="w-5 h-5" />

Also add to imports at top:
  import { ..., Lock } from "lucide-react";

Expected Result: Lock icon (🔒) instead of key (🔑) - more intuitive
```

---

## PART 2: SIDEBAR & LAYOUT FIXES (Day 2-3)

### Prompt 6: Fix Sidebar Width Consistency
```
Files to fix (6 files total):
1. /src/app/admin/dashboard/page.tsx (Line 77)
2. /src/app/admin/groups/page.tsx (Line 33)
3. /src/app/admin/students/page.tsx (Line 39-40)
4. /src/app/admin/mock-tests/page.tsx (Line 64)
5. /src/app/student/dashboard/page.tsx (Line 128)
6. /src/app/student/mock-tests/page.tsx (Line 68)

ISSUE: Sidebar is w-72 (288px) but some pages use lg:ml-64 (256px) - 32px mismatch

FIX:
Replace all instances of:
  FROM: lg:ml-64
  TO: lg:ml-72

VERIFY: Sidebar component (Line 110) uses w-72 - CORRECT

Expected Result: Sidebar and content properly aligned, no overlap
```

### Prompt 7: Remove Weak Pro Button
```
File: /src/components/layout/Sidebar.tsx

ISSUE: "Pro versiyaga o'tish" button has no action, confuses users

FIX (Line 148-151):
Remove entire block:
  {role === "STUDENT" && (
    <button className="...">
      <Zap className="w-4 h-4" /> Pro versiyaga o'tish
    </button>
  )}

OR if keeping it, add:
  disabled
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
  title="Pro feature coming soon"

Expected Result: Users don't see non-functional button
```

### Prompt 8: Fix Sidebar Menu Item Hover
```
File: /src/components/layout/Sidebar.tsx

ISSUE: Menu item hover state too subtle

CURRENT (Line 174-177):
  text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131313]

FIX:
  text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#EBFF00] 
  hover:bg-slate-100 dark:hover:bg-[#131313]
  group hover:shadow-sm transition-all duration-200

Expected Result: Menu items highlight with yellow text on hover
```

---

## PART 3: TOPBAR FIXES (Day 3)

### Prompt 9: Add Theme Toggle Animation
```
File: /src/components/layout/ThemeToggle.tsx

ISSUE: Instant theme switch with no animation (jarring)

FIX: Add transition to body tag in layout.tsx

File: /src/app/layout.tsx
Replace (Line 13-14):
  FROM: <body className="min-h-full flex flex-col transition-colors duration-300 ...">
  TO: <body className="min-h-full flex flex-col transition-all duration-300 ease-in-out ...">

Add to html tag:
  className="transition-colors duration-300"

Expected Result: Smooth color transition when theme switches
```

### Prompt 10: Fix Notification Bell
```
File: /src/components/layout/Topbar.tsx

ISSUE: Red dot always visible even with no notifications

FIX (Line 119):
Replace:
  FROM: <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>

TO: {notifications.length > 0 && (
      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
    )}

Expected Result: Red dot only shows when notifications exist
```

### Prompt 11: Fix Breadcrumb Separator
```
File: /src/components/layout/Topbar.tsx

ISSUE: "/" separator too light in dark mode

CURRENT (Line 85):
  <span className="text-slate-300 dark:text-slate-600">/</span>

FIX:
  <span className="text-slate-400 dark:text-slate-500">/</span>

OR use better separator:
  <span className="text-slate-400 dark:text-slate-500">›</span>

Expected Result: Separator visible in both themes
```

---

## PART 4: COLOR SYSTEM STANDARDIZATION (Day 4-5)

### Prompt 12: Create Design Tokens File
```
File: Create /src/lib/design-tokens.ts

CONTENT:
export const designTokens = {
  colors: {
    primary: '#EBFF00',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    light: {
      bg: '#FFFFFF',
      surface: '#F8FAFC',
      border: '#E2E8F0',
      text: '#1E293B',
      textSecondary: '#64748B',
    },
    
    dark: {
      bg: '#0a0a0a',      // Main background
      surface: '#131313',  // Cards, modals
      overlay: '#1c1b1b',  // Hover, overlays
      border: 'rgba(255,255,255,0.1)',
      text: '#FFFFFF',
      textSecondary: '#B4B4B4',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.15)',
  },

  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
};
```

Expected Result: Single source of truth for design values
```

### Prompt 13: Replace Dark Color Variants
```
Throughout codebase, replace:
  dark:bg-[#1c1b1b] → dark:bg-overlay (or use token)
  dark:bg-[#131313] → dark:bg-surface
  dark:bg-[#0a0a0a] → dark:bg-base

Create Tailwind config with theme colors:
File: /tailwind.config.ts

Add to theme.extend.backgroundColor:
  overlay: designTokens.colors.dark.overlay,
  surface: designTokens.colors.dark.surface,
  base: designTokens.colors.dark.bg,

Expected Result: Consistent dark colors throughout
```

---

## PART 5: RESPONSIVE DESIGN (Day 5-6)

### Prompt 14: Fix Mobile Form Labels
```
File: /src/components/auth/NeonLoginForm.tsx

ISSUE: Labels text-[13px] too small on mobile

FIX (Lines 82, 104):
Replace:
  FROM: className="text-[13px] font-bold ... uppercase tracking-wider"
  TO: className="text-sm font-semibold ... tracking-normal"

Expected Result: Readable labels on mobile
```

### Prompt 15: Fix Form Field Tap Targets
```
File: /src/components/auth/NeonLoginForm.tsx

ISSUE: Theme toggle and buttons may be < 44x44px (accessibility minimum)

FIX:
Replace input height:
  FROM: py-3
  TO: py-3.5 sm:py-3

Replace button height:
  FROM: py-3.5
  TO: py-4 sm:py-3.5

Expected Result: Bigger tap targets on mobile
```

### Prompt 16: Add Tablet Breakpoint
```
File: Identify all grid layouts

ISSUE: No md: (768px) breakpoint for tablets

FIX Examples:
FROM:  grid grid-cols-1 lg:grid-cols-3
TO:    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

FROM:  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5
TO:    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5

Expected Result: Proper layout on tablets
```

---

## PART 6: ACCESSIBILITY FIXES (Day 6)

### Prompt 17: Add ARIA Labels
```
File: /src/components/layout/ThemeToggle.tsx

FIX:
Add aria-label to theme toggle button:
  aria-label="Toggle dark mode"

File: /src/components/layout/Topbar.tsx

FIX:
Bell button: aria-label="Notifications"
Profile button: aria-label="User profile menu"
```

### Prompt 18: Improve Focus Indicators
```
Files: All interactive elements

FIX:
Add visible focus rings to all buttons:
  focus:outline-none focus:ring-2 focus:ring-[#EBFF00] focus:ring-offset-2
  dark:focus:ring-offset-[#0a0a0a]

Test with Tab key to verify visibility
```

---

## PART 7: LANGUAGE CONSISTENCY (Day 7)

### Prompt 19: Fix Groups Page Language
```
File: /src/app/admin/groups/page.tsx

ALL ENGLISH TEXT SHOULD BE UZBEK:

Line 45: "Group Management" → "Guruhlar Boshqaruvi"
Line 48: "Manage and organize..." → "Guruhlarni boshqarish va tashkil qilish..."
Line 52: "New Group" → "Yangi Guruh"
Line 118: "View Group Settings" → "Guruh Sozlamalarini Ko'rish"
Line 124: "Syllabus Roadmap" → "Dars Plani"
Line 126: "students" → "talabalar"

Expected Result: 100% Uzbek UI
```

### Prompt 20: Fix Sidebar Pro Button Text
```
File: /src/components/layout/Sidebar.tsx

CURRENTLY: "Pro versiyaga o'tish"
ISSUE: Unclear what "Pro" means

BETTER: "Premium rezyumiga o'tish" (Go to Premium version)

OR remove if not implemented

Expected Result: Clear intent for users
```

---

## PART 8: TESTING CHECKLIST

After implementing each fix, test:

```
✅ VISUAL TESTS:
- [ ] Login form renders correctly
- [ ] Submit button disabled state visible
- [ ] Error message displays with icon
- [ ] Focus ring appears on inputs (Tab key)
- [ ] Role tabs are same height
- [ ] Password icon is lock (not key)

✅ SIDEBAR TESTS:
- [ ] Sidebar doesn't overlap content
- [ ] Menu items highlight on hover
- [ ] Active menu item highlighted yellow
- [ ] Responsive on mobile (hamburger works)

✅ THEME TESTS:
- [ ] Theme toggle animates smoothly
- [ ] All colors consistent in dark mode
- [ ] Notification bell only shows when needed
- [ ] Breadcrumb separator visible

✅ RESPONSIVE TESTS:
- [ ] Mobile (375px): Form readable, buttons tappable
- [ ] Tablet (768px): Layout proper
- [ ] Desktop (1920px): Content not too wide

✅ ACCESSIBILITY TESTS:
- [ ] All buttons have ARIA labels
- [ ] Focus ring visible on all elements
- [ ] Tab key navigates all elements
- [ ] Text contrast passes WCAG AA

✅ LANGUAGE TESTS:
- [ ] All UI text is Uzbek (or all English - consistent)
- [ ] No mixed languages
- [ ] Button text clear and understandable
```

---

## IMPLEMENTATION ORDER

**Recommended sequence (by dependency):**

1. ✏️ Login form fixes (Prompt 1-5) - 1 hour
2. ✏️ Design tokens file (Prompt 12) - 30 min
3. ✏️ Sidebar width (Prompt 6) - 30 min
4. ✏️ Color consistency (Prompt 13) - 2 hours
5. ✏️ Topbar fixes (Prompt 9-11) - 1 hour
6. ✏️ Responsive design (Prompt 14-16) - 2 hours
7. ✏️ Language fixes (Prompt 19-20) - 1 hour
8. ✏️ Accessibility (Prompt 17-18) - 1.5 hours
9. ✅ Testing (Checklist) - 2 hours

**Total: ~12 hours**

---

## EXPECTED IMPROVEMENTS

| Metric | Before | After |
|--------|--------|-------|
| Visual Consistency | 48/100 | 85/100 |
| Accessibility | 30/100 | 75/100 |
| Responsive Design | 50/100 | 85/100 |
| Color System | 40/100 | 95/100 |
| User Experience | 45/100 | 80/100 |
| **OVERALL** | **52/100** | **84/100** |

---

## NEXT STEPS AFTER VISUAL FIXES

Once visual design is fixed:

1. Create missing components (StudentMockTestsHub, AdminMockTestsRoom)
2. Fix registration/password recovery pages
3. Implement loading states and error boundaries
4. Add pagination to lists
5. Optimize database queries (N+1 problem)
6. Full accessibility audit with screen reader
7. Performance optimization
8. End-to-end testing

---

**Status:** Ready to implement  
**Complexity:** Medium (CSS/styling focus)  
**Estimated Timeline:** 2-3 weeks  
**Resource:** 1 developer  

**All prompts are production-ready and can be implemented immediately.**

