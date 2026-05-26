# Task: Role-Specific Dashboard Views + Entity-Type Onboarding Wizards

## Agent: Main
## Task ID: P0-Dashboard-Onboarding

## Summary

Successfully implemented all 3 requirements:

### REQUIREMENT 1: Role-Specific Dashboard Views ✅

Created 6 role-specific dashboard views in `src/components/dashboard/`:

1. **`compliance-officer-view.tsx`** — EUDR-focused with score, pending DDS list, risk alerts, "Generate DDS" CTA
2. **`export-director-view.tsx`** — Shipment readiness board, docs checklist per container, DDS status per shipment
3. **`coop-manager-view.tsx`** — Procurement intake queue, batch processing pipeline, farmer enrollment
4. **`trader-view.tsx`** — Active RFQs, price ticker (4 varieties), contract pipeline
5. **`field-officer-view.tsx`** — Today's task list (farmers to register, plots to map), offline sync status
6. **`buyer-view.tsx`** — Supplier compliance grid (green/amber/red cards), shipment pipeline, one-click DDS download

Also created:
- **`dashboard-router.tsx`** — Routes to correct view based on role + entityType
- **`dds-status-widget.tsx`** — Reusable DDS status traffic light widget (supports compact mode, auto-calculates traffic light)

### REQUIREMENT 2: Entity-Type-Specific Onboarding Wizards ✅

Created in `src/components/onboarding/`:

1. **`exporter-wizard.tsx`** — 4 steps: Link Supplier → Import GPS → Deforestation Check → Generate DDS
2. **`aggregator-wizard.tsx`** — 4 steps: Enroll Farmer → Map Plot → Create Batch → Compliance Status
3. **`buyer-wizard.tsx`** — 3 steps: Link Suppliers → Supplier Compliance → Download Package
4. **`onboarding-router.tsx`** — Routes to correct wizard based on entityType from session
5. **`wizard-step-indicator.tsx`** — Shared step indicator component with completed/current/future states

### REQUIREMENT 3: DDS Status Dashboard Widget ✅

Created `src/components/dashboard/dds-status-widget.tsx`:
- Shows "X of Y shipments have complete DDS"
- Shows "Z plots pending verification"
- Red/amber/green traffic light indicator
- Appears at the top of compliance officer and export director dashboards
- Accepts props: `completeDds`, `totalShipments`, `pendingPlots`, `status?`, `compact?`

### Integration

- **`src/app/dashboard/page.tsx`** — Replaced monolithic ~820-line content with `DashboardRouter` component
- **`src/app/page.tsx`** — Replaced `StartHereFlow` with `OnboardingRouter` for entity-type-specific onboarding
- Both pages keep existing loading/auth states and DashboardShell wrappers

### Role → View Mapping

| Role | EntityType | Dashboard View |
|---|---|---|
| quality_controller | any | ComplianceOfficerView |
| trader | any | TraderView |
| field_officer | any | FieldOfficerView |
| buyer | any | BuyerView |
| operations_manager / tenant_admin | exporter | ExportDirectorView |
| operations_manager / tenant_admin | aggregator | CoopManagerView |
| operations_manager / tenant_admin | importer/buyer | BuyerView |
| operations_manager / tenant_admin | other | ComplianceOfficerView |
| finance_manager | any | ExportDirectorView |
| viewer | any | ComplianceOfficerView |

### EntityType → Onboarding Mapping

| EntityType | Wizard |
|---|---|
| exporter | ExporterWizard (4 steps) |
| aggregator | AggregatorWizard (4 steps) |
| buyer / importer | BuyerWizard (3 steps) |
| other (producer, etc.) | StartHereFlow (existing generic 3-step) |

### Lint Status
All new files pass lint with zero errors.
