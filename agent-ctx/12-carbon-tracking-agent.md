# Task 12 — Carbon Tracking Model, API, and UI Page

## Work Log

### Step 1: Prisma Schema — CarbonTracking model
- Verified `CarbonTracking` model already existed in `prisma/schema.prisma` with all required fields (tenantId, batchId, farmerId, farmLandId, eudrComplianceId, trackingId, reportingPeriod, scope1/2/3 emissions, totalEmissions, emissionsPerKg, carbonSequestered, netEmissions, methodology, dataSources, verificationStatus, verifiedBy, verificationDate, notes, metadata, isActive)
- Verified relations already added to Tenant (`carbonTrackings CarbonTracking[]`), Farmer (`carbonTrackings CarbonTracking[]`), FarmLand (`carbonTrackings CarbonTracking[]`), EudrCompliance (`carbonTrackings CarbonTracking[]`)
- Ran `npx prisma generate` to regenerate Prisma client (PostgreSQL DB unreachable in sandbox, but client generation succeeds without DB connection)

### Step 2: Carbon Tracking API
- Created `/src/app/api/carbon-tracking/route.ts` — GET (list with pagination, search, verificationStatus filter) and POST (create with auto-calculation of totalEmissions and netEmissions)
- Created `/src/app/api/carbon-tracking/[id]/route.ts` — GET (single record with includes), PUT (update with auto-recalc), DELETE (soft delete by setting isActive=false)
- Followed same pattern as existing `/api/eudr-compliance` routes
- Used `requireTenantAccess(user, 'eudr-compliance', ...)` for auth (reusing eudr-compliance module permissions)

### Step 3: Carbon Tracking UI Page
- Created `/src/app/carbon-tracking/page.tsx` — full featured page:
  - Dashboard header with coffee brown (#6D2932) theme
  - 4 KPI cards: Total Emissions, Carbon Sequestered, Net Emissions, Avg per Kg
  - Verification Status pie chart and Scope Breakdown bar chart (using recharts)
  - Data table with all carbon tracking fields (trackingId, batchId, farmer, period, scope 1/2/3, total, sequestered, net, status, actions)
  - Create dialog with form fields: trackingId, batchId, farmerId, farmLandId, eudrComplianceId, reportingPeriod, scope1/2/3 emissions, carbonSequestered, methodology, notes
  - Auto-calculate: totalEmissions = scope1 + scope2 + scope3, netEmissions = total - sequestered
  - Filter by verificationStatus (pending, verified, rejected)
  - Detail dialog with full emissions breakdown, scope visualization bar, net emissions summary
  - Delete confirmation dialog
  - Uses DashboardShell from @/components/layout/dashboard-shell

### Step 4: Sidebar Navigation
- Added carbon-tracking module to `/src/lib/module-config.ts`:
  - slug: 'carbon-tracking', label: 'Carbon Tracking', labelVi: 'Theo dõi Carbon'
  - href: '/carbon-tracking', icon: 'Activity', color: '#059669'
  - group: 'compliance', orderInGroup: 5
  - entityTypeAccess: producer: full, aggregator: full, exporter: full, importer: view, certification_body: view, laboratory: hidden
  - roleAccess: tenant_admin: full, operations_manager: view, field_officer: hidden, quality_controller: full, trader: view, finance_manager: view, buyer: view, viewer: view
- Added 'carbon-tracking' to slugToNavKey map in `/src/components/layout/app-sidebar.tsx`
- 'Activity' icon was already in LUCIDE_ICON_MAP — no change needed

### Step 5: Breadcrumb Mapping
- Added 'carbon-tracking' entry to BREADCRUMB_MAP in `/src/components/layout/dashboard-shell.tsx`: { en: 'Carbon Tracking', vi: 'Theo dõi Carbon' }

### Verification
- TypeScript compilation: No errors in carbon-tracking files
- Pre-existing lint errors (all unrelated to this task)
- Build attempted but failed due to filesystem issues in sandbox (not code-related)

## Stage Summary
- CarbonTracking Prisma model verified and client regenerated
- Full CRUD API: GET (list), POST (create), GET [id], PUT [id], DELETE [id] with soft delete
- Rich UI page with KPIs, charts, data table, create/detail/delete dialogs
- Sidebar navigation entry added to compliance group
- Breadcrumb mapping added
