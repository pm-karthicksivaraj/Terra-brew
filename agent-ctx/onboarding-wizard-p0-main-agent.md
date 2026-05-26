# Task: Onboarding Wizard P0 Feature

## Summary

Implemented the complete Onboarding Wizard P0 feature for the TerraBrew Coffee platform. The wizard provides entity-type-specific setup flows for new users with bilingual (Vietnamese/English) support and a professional coffee-brown themed UI.

## Files Created

### 1. `/home/z/my-project/src/components/onboarding/step-indicator.tsx`
- Visual step indicator showing current step, total steps
- Completed/active/pending states with animated progress lines
- Step labels below each indicator dot
- Coffee brown palette (#561C24, #6D2932, #C7B7A3, #E8D8C4)
- Bilingual labels via `useI18n`

### 2. `/home/z/my-project/src/components/onboarding/onboarding-wizard.tsx`
- Multi-step wizard accepting `entityType` and `userId` props
- **Exporter Flow (4 steps):** Company Profile → Link Suppliers → GPS/Deforestation → Generate DDS
- **Aggregator Flow (4 steps):** Collection Centre Setup → Enroll First Farmers → Map Plot Boundaries → Compliance Check
- **Importer Flow (3 steps):** Company Profile → Link Suppliers → Download Compliance Report
- **Producer Flow (3 steps):** Farm Details → Cultivation Info → First Harvest
- **Certification Body/Lab Flow (2 steps):** Organization Profile → Connect to Platform (API key generation)
- **Default Flow (2 steps):** Basic Info → Get Started (tutorial links)
- Custom renderers for: supplier IDs (add/remove), farmer enrollment, DDS review, compliance check simulation, API key generation, tutorial links
- "Skip for now" button on non-final steps
- Final step calls `/api/onboarding/complete`
- After completion, redirects to `/dashboard`

### 3. `/home/z/my-project/src/app/api/onboarding/complete/route.ts`
- POST endpoint requiring authentication (getServerSession)
- Validates user ID matches session
- Updates `user.onboardingCompleted = true` in database via Prisma
- Returns success/error JSON responses

### 4. `/home/z/my-project/src/app/onboarding/page.tsx`
- `'use client'` page component
- Checks authentication via `useSession()`
- Redirects unauthenticated users to `/login`
- Redirects users with `onboardingCompleted = true` to `/dashboard`
- Renders `OnboardingWizard` with session data

## Files Modified

### `/home/z/my-project/src/proxy.ts`
- Added `/onboarding` to `PUBLIC_EXACT_PATHS` so the onboarding page is accessible

## Verification

- ✅ All new files pass ESLint (`bun run lint`)
- ✅ Onboarding page compiles and returns HTTP 200
- ✅ API endpoint returns 401 for unauthenticated requests (correct behavior)
- ✅ All entity type flows defined with proper form fields
- ✅ Bilingual support (Vietnamese/English) via `useI18n` hook
- ✅ Coffee brown palette styling consistent with platform
- ✅ shadcn/ui components used (Card, Button, Input, Label, Badge, Separator)
- ✅ Lucide icons throughout
