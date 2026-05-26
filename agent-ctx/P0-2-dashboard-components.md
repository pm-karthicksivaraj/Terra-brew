# P0-2: Role-Specific Dashboard Components & DashboardRouter

## Task Summary
Built role-specific dashboard components and a DashboardRouter that renders the correct dashboard based on user role, then wired it into the dashboard page.

## Files Created

1. **`src/components/dashboard/shared-components.tsx`** (18.5KB)
   - Reusable utility components extracted from the original dashboard:
     - `CHART_COLORS` constant
     - `useDashboardData()` hook — fetches from `/api/dashboard/stats`
     - `AnimatedCounter` — animated number display
     - `Sparkline` — mini SVG polyline chart
     - `RadialScore` — radial progress ring
     - `TrendIndicator` — trend % with up/down arrow
     - `KPICard` / `KPIGrid` — KPI display card with sparklines
     - `DashboardHeader` — welcome header with role badge and clock
     - `QuickActionsPanel` — quick action buttons with route navigation
     - `ActivityFeed` — scrollable activity feed from audit logs
     - `EmptyState` — "No data yet" placeholder
     - `DashboardLoading` — loading skeleton

2. **`src/components/dashboard/admin-dashboard.tsx`** (12.9KB)
   - For: `tenant_admin` (all entity types)
   - KPIs: Total Revenue, Total Farmers, EUDR Compliance Rate, Active Shipments, Quality Score, Pending Approvals
   - Quick Actions: Add Farmer, New Procurement, EUDR Assessment, View Reports, Manage Users
   - Charts: Revenue trend (AreaChart), EUDR compliance pie, Processing pipeline (horizontal BarChart)
   - Activity Feed from API

3. **`src/components/dashboard/operations-dashboard.tsx`** (6.4KB)
   - For: `operations_manager`
   - KPIs: Active Procurements, Pending Processing, Shipment Status, Quality Score, EUDR Compliance
   - Quick Actions: New Procurement, Process Batch, Create Shipment, Schedule Inspection
   - Charts: Processing pipeline with bottleneck focus
   - Activity Feed from API

4. **`src/components/dashboard/field-dashboard.tsx`** (6.9KB)
   - For: `field_officer`
   - KPIs: My Farmers, Farms Visited, Pending Inspections, Crop Alerts, Harvest Volume
   - Quick Actions: Register Farmer, Record Harvest, Log Crop Monitoring, Add Farm Land
   - Charts: Farmers by Province with summary pills
   - Activity Feed from API

5. **`src/components/dashboard/quality-dashboard.tsx`** (8.7KB)
   - For: `quality_controller`
   - KPIs: Pending Inspections, Avg Cup Score, Quality Distribution, Failed Inspections, Cert Status
   - Quick Actions: New Inspection, Cert Assessment, QC Verification, View Quality Reports
   - Charts: Quality distribution pie, Certifications by type bar
   - Activity Feed from API

6. **`src/components/dashboard/trader-dashboard.tsx`** (9.0KB)
   - For: `trader`
   - KPIs: Active Contracts, Marketplace Listings, Revenue, Shipment Status, Avg Price/kg
   - Quick Actions: Create Contract, New Listing, Place RFQ, Book Shipment, View Trading Desk
   - Charts: Market trends area, Supply chain status bar
   - Activity Feed from API

7. **`src/components/dashboard/finance-dashboard.tsx`** (6.2KB)
   - For: `finance_manager`
   - KPIs: Total Revenue, Outstanding Payments, Subscription Status, Procurement Spend, Currency
   - Quick Actions: View Billing, Payment Reports, Export Financial Data, Manage Subscription
   - Charts: Revenue trend area
   - Activity Feed from API

8. **`src/components/dashboard/viewer-dashboard.tsx`** (11.3KB)
   - For: `viewer` (read-only)
   - Same KPIs as admin dashboard but read-only
   - NO quick action buttons, NO create actions
   - "Read-only view" badge displayed
   - Charts: Supply chain trends, EUDR compliance, Processing pipeline
   - Activity Feed from API

9. **`src/components/dashboard/dashboard-router.tsx`** (1.3KB)
   - Takes `role` and `entityType` props
   - Renders the appropriate dashboard variant based on role
   - Fallback to AdminDashboard for unknown roles

## Files Modified

10. **`src/app/dashboard/page.tsx`** (reduced from ~800+ lines to ~58 lines)
    - Imports `DashboardRouter`
    - Gets `role` and `entityType` from session
    - Renders `<DashboardRouter role={role} entityType={entityType} />`
    - Removed ALL old inline dashboard code (MOCK data, chart code, etc.)

## Design Decisions
- Each dashboard uses `useDashboardData()` hook that fetches from `/api/dashboard/stats`
- NO mock data — if API returns empty, components show `EmptyState` with "No data yet"
- All dashboards wrap content in `<DashboardShell>` as required
- Bilingual support via `useI18n()` / `t2()` throughout
- Shared components extracted to `shared-components.tsx` for DRY code
- Each dashboard component is 150-250 lines (focused and manageable)
- Recharts used for all chart visualizations (consistent with existing codebase)

## Lint & Type Check
- No ESLint errors in any dashboard file
- No TypeScript errors in any dashboard file
