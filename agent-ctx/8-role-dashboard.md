# Task 8: Role-Specific Dashboard Content

## Agent: Main Agent
## Task: Build role-specific dashboard content and super-admin module management

### Work Log:

**1. Rebuilt /src/app/dashboard/page.tsx as role-aware dashboard**

- Created 5 role-specific sub-components:
  - `AdminDashboard` — Full dashboard with 2 rows of 4 KPI cards, 4 charts (harvest volume area chart, EUDR compliance donut, revenue trend line chart, processing pipeline bar chart), activity feed, quick actions
  - `AggregatorDashboard` — Collection-focused with 4 KPIs, collection centres status, recent collections table, activity feed, quick actions (Add Farmer, Record Collection, View Farm Lands, Schedule Visit)
  - `ProcessorDashboard` — Processing-focused with 4 KPIs, visual processing pipeline (8 stages: Pulping → Fermentation → Washing → Drying → Hulling → Sorting → Roasting → Packaging with active job counts), quality overview table, cup score distribution chart, defect rate, quick actions
  - `ExporterDashboard` — Trade-focused with 4 KPIs, recent RFQs table, shipment tracking with progress bars, compliance status (EUDR, export docs, customs), active trading contracts, quick actions (Create RFQ, Book Shipment, Request Inspection, View Escrow)
  - `ViewerDashboard` — Analytics dashboard with 4 KPIs, key metrics trend line chart, data freshness indicators with progress bars, report generation links

- Common header for all roles:
  - Language-aware greeting (supports vi, en, am, sw, pt, id, es, hi)
  - User name and tenant name display
  - Current date/time with tenant timezone formatting
  - Role-specific badge with color coding

- Implementation approach:
  - Gets role from `session?.user?.role` and normalizes with `normalizeRole()` from `@/lib/module-config`
  - Renders role-specific sub-component based on normalized role
  - Each sub-component uses shared utility components: `KPICard`, `ActivityRow`, `QuickAction`, `AnimatedCounter`, `Sparkline`, `TrendIndicator`
  - Mock/fallback data when APIs return empty results
  - Uses DashboardShell layout, FadeIn/StaggerContainer animations, shadcn/ui components

**2. Updated /src/app/super-admin/dashboard/page.tsx with Module Management**

- Replaced the basic "Module Marketplace" tab with comprehensive "Module Management" section
- Two sections:
  - **Module Catalog**: Grid of all 33 modules from `MODULE_CATALOG` (from `@/lib/module-config`), showing name, description, category badge, default-enabled badge, enabled count per tenants, and role access list
  - **Toggle Modules per Tenant**: For each active tenant, shows a card with:
    - Tenant name, plan badge, enabled module count
    - "Enable All" and "Disable All" buttons
    - Grid of all 33 modules with individual Switch toggles
    - Each toggle calls PUT `/api/modules` with updated `enabledModules` object
    - Toast notifications for success/failure
- Category badges with distinct colors: core=emerald, premium=amber, compliance=teal, trade=blue, service=purple

**3. Lint check**
- Fixed `Function` type to `(vi: string, en: string) => string` in 5 sub-components
- Zero lint errors in both dashboard files

### Stage Summary:
- Dashboard page is now fully role-aware with 5 distinct dashboard views
- Super admin has comprehensive module management with per-tenant toggle controls
- All changes follow existing design patterns (Space Mono, teal/coffee theme, shadcn/ui)
- Lint passes with zero errors in modified files
