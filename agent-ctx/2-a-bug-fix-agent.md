# Task 2-a: Bug Fix Agent Work Record

## Task
Fix 3 bugs and do menu rename

## Changes Made

### Bug 1: Age Field Fix
**File**: `/home/z/my-project/src/app/(app)/farmers/[id]/page.tsx`
- Line 460: Replaced `(!farmer.age || farmer.age === 0) ? 'Empty' : ...` with proper age computation from `dob`
- Now computes age from date of birth when `farmer.age` is null/0, falls back to `'—'` when both are missing

### Bug 2: QR Code Fix
**File**: `/home/z/my-project/src/app/(app)/farmers/[id]/page.tsx`
- Lines 279-301: Replaced QR generation useEffect
- Uses secure `/verify/{farmerCode}` URL pattern instead of plain URL
- Changed QR color from green (#047857) to coffee brown (#6D2932)
- Increased width from 128→160, margin from 1→2
- Added `console.error` logging on failure

### Bug 3: Menu Rename
**File**: `/home/z/my-project/src/lib/module-config.ts`
- NAV_GROUPS 'compliance': label "Compliance & Certification" → "EUDR Compliance & Certification"
- NAV_GROUPS 'compliance': labelVi "Tuân thủ & Chứng nhận" → "Tuân thủ EUDR & Chứng nhận"
- slug 'eudr-compliance': label "EUDR Compliance" → "EUDR Records"
- slug 'eudr-compliance': labelVi "Tuân thủ EUDR" → "Hồ sơ EUDR"

## Verification
- Ran `bun run lint` — no new lint errors introduced in edited files
- Worklog updated at `/home/z/my-project/worklog.md`
