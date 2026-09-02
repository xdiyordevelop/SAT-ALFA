---
# PHASE 3: ADMIN & PROCTORING MANAGEMENT SYSTEM - IMPLEMENTATION MAP
# Created: 2026-08-26

## File Structure Overview

### 1. PROCTOR CONTROL CENTER
- src/app/admin/mock-tests/proctor/[sessionId]/page.tsx (main page with auth)
- src/app/admin/mock-tests/proctor/[sessionId]/components/SessionController.tsx
- src/app/admin/mock-tests/proctor/[sessionId]/components/ParticipantMatrix.tsx
- src/app/admin/mock-tests/proctor/[sessionId]/components/SecurityAlertTracker.tsx
- src/app/admin/mock-tests/proctor/[sessionId]/hooks/useSessionSync.ts (real-time updates)

### 2. TEST IMPORTER
- src/app/admin/mock-tests/import/page.tsx (main page with auth)
- src/app/admin/mock-tests/import/components/FileUploader.tsx
- src/app/admin/mock-tests/import/components/PreviewGrid.tsx
- src/app/api/admin/import-tests/route.ts (backend parser)

### 3. ADMIN ANALYTICS DASHBOARD
- src/app/admin/mock-tests/analytics/page.tsx (main page with auth)
- src/app/admin/mock-tests/analytics/components/PerformanceBenchmarks.tsx (recharts)
- src/app/admin/mock-tests/analytics/components/AttemptHistoryTable.tsx
- src/app/admin/mock-tests/analytics/components/PercentileVisualization.tsx

### 4. SHARED UTILITIES
- src/app/admin/mock-tests/utils/proctorHelpers.ts
- src/app/admin/mock-tests/utils/analyticsHelpers.ts
- src/app/admin/mock-tests/utils/importHelpers.ts

### 5. TYPES
- src/app/admin/mock-tests/types/proctor.ts
- src/app/admin/mock-tests/types/analytics.ts
- src/app/admin/mock-tests/types/import.ts

## Dependencies
- recharts (already installed)
- lucide-react (already installed)
- Prisma 7 (already installed)

## Timeline
- Session Controller + components: ~30 min
- Real-time sync hook: ~20 min
- Test Importer + components: ~30 min
- Analytics dashboard: ~35 min
- API endpoints: ~25 min
- Testing & verification: ~10 min

Total: ~2 hours for full Phase 3 implementation
