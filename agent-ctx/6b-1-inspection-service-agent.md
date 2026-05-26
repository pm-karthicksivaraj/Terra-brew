# Task 6b-1: Inspection Service Page and API Routes

## Agent: Full-stack Developer

## Work Log:

### Read Reference Files
- Read `/src/app/coffee-inspections/page.tsx` for existing inspection patterns (830 lines) — forms, table, pagination, status badges
- Read `/src/app/eudr-compliance/page.tsx` (first 100 lines) for layout/animation patterns — FadeIn, StaggerContainer, MotionCard, hoverScale
- Read `/src/components/layout/dashboard-shell.tsx` for shell layout — DashboardShell wrapper, breadcrumb map already has "inspections" entry
- Read Prisma schema: `InspectionRequest` model has 30+ fields including status lifecycle, inspection levels, results, defect/pass rates, photographs

### API Routes Assessment
- `/src/app/api/inspections/route.ts` — Already exists with GET (list with search, status, level filters, pagination) and POST (create with auto INS-XXXX number, level pricing)
- `/src/app/api/inspections/[id]/route.ts` — Already exists with GET, PUT, DELETE (soft delete)
- API routes use `getAuthUser` + `requireTenantAccess` from `api-middleware` (project standard pattern)
- No changes needed — existing routes are production-quality with proper error handling, tenant scoping, and RBAC

### Page Build: `/src/app/inspections/page.tsx`
Completely rewrote the existing 637-line basic page into a comprehensive ~580-line production-quality page with all 7 required sections:

1. **Header** — "Inspection Service" title with subtitle "Independent 3rd party | Professional inspectors | High-efficiency" and teal "Request Inspection" button
2. **Service Levels Card** — 3-column grid showing S-3 ($118), G-I ($188), G-II ($268) with all check quantities, qty verification, and service time
3. **Stats Row** — 4 KPI cards with icons: Total Inspections, Pending, Completed, Pass Rate (%) using StaggerContainer/MotionCard animations
4. **Filters** — Search input, Status dropdown (6 statuses), Level filter (S-3, G-I, G-II), record count badge
5. **Table** — Full columns: INS Number, Commodity, Level, Status (colored badges), Inspector, Scheduled Date, Result, Actions (View/Edit/Delete with confirmation)
6. **Request Inspection Dialog (max-w-6xl)** — 4-step wizard:
   - Step 1: Order Info (Shipment/Contract ref, Commodity, Total Quantity)
   - Step 2: Inspection Level (radio cards with all details, Special Requirements textarea)
   - Step 3: Scheduling (Preferred Date, Facility Address, Facility Country with 10 countries, Notes)
   - Step 4: Review & Submit (complete summary with all data)
7. **Detail Dialog (max-w-6xl)** — Full inspection report view:
   - General Information section (inspector, date, level, facility, country, provider, commodity, quantity, cost, status)
   - Results Summary with 5 colored check cards (workmanship, function, quality, conformity, quantity)
   - Defect Rate and Pass Rate progress bars with color coding
   - Findings table (JSON-parsed)
   - Photographs grid
   - Report download button with report number and date

### Key Implementation Details
- Status badges: requested=blue, notified=cyan, appointment_scheduled=amber, in_progress=purple, completed=green, cancelled=red
- Result badges: passed=green, failed=red, conditional=amber
- Dark mode support on all badge colors
- Edit functionality: populates form from existing inspection, reuses wizard
- Delete with confirmation pattern (Trash icon → confirm/cancel)
- i18n support via `useI18n()` hook with `t2()` for inline translations
- FadeIn, StaggerContainer, MotionCard, hoverScale animations
- TableStaggerTbody/TableStaggerRow for table animations
- Loading state with animated ClipboardCheck icon
- Teal color scheme for primary actions (matching inspection service branding)
- Responsive design: hidden columns on mobile/tablet, responsive grids

### Lint Check
- No lint errors in the inspections page
- Pre-existing lint errors in other files (upload directory, client-app, dashboard-shell) — not from this change

## Stage Summary:
- Comprehensive Inspection Service page built with all 7 sections
- API routes already production-quality, no changes needed
- Zero new lint errors introduced
- Full CRUD operations supported (Create, Read, Update, Delete)
- Production-quality with error handling, loading states, and responsive design
