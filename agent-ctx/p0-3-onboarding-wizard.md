# P0-3: Onboarding Wizard Implementation

## Task
Build onboarding wizard with route, post-login redirect, and entity-specific flows for TerraBrew Coffee Platform.

## Files Created

### 1. `/src/app/onboarding/page.tsx` — Onboarding Page Route
- 'use client' component
- Uses `useSession()` to get user info
- Redirects to `/dashboard` if `onboardingCompleted` is true
- Redirects to `/login` if unauthenticated
- Redirects platform admins to `/super-admin/dashboard`
- Dynamically imports `OnboardingWizard` (ssr: false)
- Passes `entityType`, `tenantName`, `userName` from session

### 2. `/src/components/onboarding/onboarding-wizard.tsx` — Main Wizard
- Multi-step wizard with progress bar and step indicators
- 4 steps: Organization → Entity-Specific → Compliance → Completion
- Steps vary by entityType (6 entity types supported)
- Centralized state management with `useState`
- `getStepsForEntityType()` determines which entity-specific step to show
- Navigation: Back/Continue buttons, clickable completed steps
- On completion: POST to `/api/onboarding/complete`, then `window.location.href = '/dashboard'`
- Standalone layout (no DashboardShell), with TerraBrew logo header
- Uses coffee brown palette

### 3. `/src/components/onboarding/types.ts` — Type Definitions
- `OrganizationData`, `ProducerData`, `AggregatorData`, `ExporterData`, `ImporterData`
- `CertificationBodyData`, `LaboratoryData`, `ComplianceData`
- `OnboardingData` (composite of all above)
- `StepDef` and `StepProps<T>` interfaces

### 4. `/src/components/onboarding/steps/organization-step.tsx` — Common Step 1
- Legal name, tax ID, address, city, state, postal code, country (dropdown), phone, website
- Uses shadcn Card, Input, Label components
- Country selector with 20 coffee-producing/importing nations

### 5. `/src/components/onboarding/steps/producer-step.tsx` — Producer Step
- Farm details: name, size, altitude, coffee varieties, processing methods
- Certifications checkbox grid (Organic, Fair Trade, Rainforest Alliance, etc.)
- First farmer registration: name, phone, village

### 6. `/src/components/onboarding/steps/aggregator-step.tsx` — Aggregator Step
- Processing capacity, collection centre count
- Processing methods checkbox grid
- Primary collection centre details
- Certifications

### 7. `/src/components/onboarding/steps/exporter-step.tsx` — Exporter Step
- Export license number and expiry
- Annual export volume, port of export
- Destination countries checkbox grid
- Primary coffee types exported

### 8. `/src/components/onboarding/steps/importer-step.tsx` — Importer Step
- EU EORI number (required), annual import volume
- Source countries checkbox grid
- Compliance needs checklist (EUDR, EFSA, organic, etc.)
- Warehouse locations, distribution regions

### 9. `/src/components/onboarding/steps/certification-step.tsx` — Certification Body Step
- Accreditation body, number, expiry
- Inspector count
- Certification standards checklist (ISO, Organic, Fair Trade, etc.)
- Geographic coverage checklist

### 10. `/src/components/onboarding/steps/laboratory-step.tsx` — Laboratory Step
- Lab accreditation standard, number, expiry
- Monthly sample capacity
- Test capabilities checklist (moisture, aflatoxin, pesticide, etc.)
- Equipment types checklist

### 11. `/src/components/onboarding/steps/compliance-step.tsx` — EUDR Compliance Step
- 6 yes/no readiness questions: exports to EU, EUDR awareness, due diligence process, geolocation data, deforestation risk, traceability system
- "Need help with EUDR?" opt-in
- Applicable to all entity types that export to EU

### 12. `/src/components/onboarding/steps/completion-step.tsx` — Completion/Summary Step
- Success animation (checkmark icon)
- Setup summary cards with entity-specific details
- EUDR compliance status badge (Ready / In Progress / Getting Started)
- "Go to Dashboard" button with loading state

### 13. `/src/app/api/onboarding/complete/route.ts` — API Route
- POST endpoint
- Verifies user is authenticated via JWT
- Updates `User.onboardingCompleted = true` in database
- Updates `Tenant` record with legalName, taxId, countryCode
- Sets `Tenant.eudrCompliant = true` if compliance answers indicate readiness
- Creates `AuditLog` entry
- Re-encodes JWT with `onboardingCompleted: true`
- Sets new `next-auth.session-token` cookie
- Returns success response

## Additional Fix
- Removed `/src/middleware.ts` which was conflicting with `/src/proxy.ts` (Next.js 16 uses proxy.ts natively, both files caused a build error)

## Key Design Decisions
- Standalone layout (no DashboardShell/sidebar) for the onboarding flow
- Coffee brown palette (#561c24, #6d2932, #c7b7a3, #e8d8c4)
- Each step gets `data` and `onChange` props for centralized state
- JWT refresh: after API success, the API sets a new session cookie, and the frontend uses `window.location.href = '/dashboard'` to force a full page reload with the fresh JWT
- The middleware (proxy.ts) already redirects `onboardingCompleted=false` users to `/onboarding`
- Checkbox-based selections for certifications, capabilities, etc.
- Responsive design with grid layouts
