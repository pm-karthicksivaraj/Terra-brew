# Task: EUDR Compliance — 3 Fixes

## Task ID: eudr-3fixes

## Summary of Changes

### Task 1: Convert EUDR Compliance CRUD from Dialog to Full Page Navigation

**Files Modified:**
- `/src/app/eudr-compliance/page.tsx` — Completely rewritten to remove Dialog-based create/edit/view. Now uses Link navigation:
  - "New Record" button → `/eudr-compliance/new`
  - "View" (Eye icon) button → `/eudr-compliance/[id]`
  - "Edit" (Pencil icon) button → `/eudr-compliance/[id]?edit=true`
  - Removed all Dialog usage from ComplianceRecordsTab
  - Extracted shared data/types/constants to `_lib/data.ts`
  - Kept OverviewTab, DeforestationTab, DDSTab, RiskAnalyticsTab intact

**Files Created:**
- `/src/app/eudr-compliance/_lib/data.ts` — Shared types, constants, mock data, and helper functions
- `/src/app/eudr-compliance/new/page.tsx` — Dedicated create page with full-page ComplianceWizardForm
- `/src/app/eudr-compliance/[id]/page.tsx` — Detail/view page with:
  - Tabs: Overview, Deforestation Assessment, DDS Tracker
  - Edit mode toggle that uses inline wizard form
  - GeoLocationMap integration in Overview tab
  - 404 handling for invalid IDs
  - Breadcrumb navigation back to listing

### Task 2: Add OpenStreetMap (GeoLocationMap) for Geolocation

**Files Created:**
- `/src/components/map/geo-location-map.tsx` — SSR-safe Leaflet map component:
  - Takes `lat`, `lng`, `zoom`, `height`, `popupText` props
  - Client-side only rendering (dynamic import in index.tsx)
  - Shows OpenStreetMap with marker and popup at given coordinates
  - Default zoom level 13
  - Updates marker position when coordinates change without reinitializing the map
  - Similar style to existing FarmLandMap

**Files Modified:**
- `/src/components/map/index.tsx` — Added `GeoLocationMap` export with dynamic import (ssr: false)
- `/src/app/eudr-compliance/new/page.tsx` — Uses GeoLocationMap in wizard Step 1
- `/src/app/eudr-compliance/[id]/page.tsx` — Uses GeoLocationMap in detail Overview tab AND in edit mode wizard Step 1

### Task 3: Rename 'Traceability' to 'EUDR Compliance' in Sidebar i18n

**Files Modified:**
- `/src/components/layout/app-sidebar.tsx` — Changed `'eudr-compliance': 'nav.traceability'` to `'eudr-compliance': 'nav.eudrCompliance'`
- `/src/i18n/en.json` — Added `"eudrCompliance": "EUDR Compliance"`
- `/src/i18n/vi.json` — Added `"eudrCompliance": "Tuân thủ EUDR"`
- `/src/i18n/pt.json` — Added `"eudrCompliance": "Conformidade EUDR"`
- `/src/i18n/am.json` — Added `"eudrCompliance": "የEUDR ተገቢነት"`
- `/src/i18n/sw.json` — Added `"eudrCompliance": "Uzingatiaji EUDR"`

## Lint Status
All modified files pass lint checks with no new errors or warnings.
