# White-label Consumer Portal Implementation

## Task ID: white-label-portal
## Agent: main

## Summary
Implemented the complete White-label Consumer Portal feature for the Enterprise tier ($799/mo). This includes:

### Files Created
1. **`src/types/index.ts`** — Added `WhiteLabelConfig` interface and `DEFAULT_WHITE_LABEL_CONFIG` constant
2. **`src/app/api/white-label/route.ts`** — GET/PUT API for white-label configuration (auth required, Enterprise plan check)
3. **`src/app/api/portal/[slug]/route.ts`** — Public API returning tenant branding + traceability data
4. **`src/app/white-label/page.tsx`** — Dashboard page for Enterprise tenants to configure their portal
5. **`src/app/portal/[slug]/page.tsx`** — Consumer-facing portal page with branded experience
6. **`src/components/portal/portal-map.tsx`** — Leaflet map component for farm origin display

### Files Modified
1. **`src/components/layout/app-sidebar.tsx`** — Added White Label nav item with Palette icon
2. **`src/components/layout/dashboard-shell.tsx`** — Added white-label breadcrumb mapping
3. **`src/types/index.ts`** — Added WhiteLabelConfig type and defaults

### Key Features
- White-label config page with tabs: General, Branding, Content, Social, Preview
- Enterprise plan gating with upgrade CTA for non-Enterprise users
- Color preset system with 6 theme options
- Custom domain configuration
- Portal section toggles (Sustainability, Farmer Profile, Map, Certifications)
- Live portal preview in the config page
- Consumer portal with branded header, hero, search, journey timeline
- Farm-to-cup journey visualization with blockchain verification
- Meet the Farmer section with photo, location, certifications
- Sustainability metrics (EUDR, deforestation-free, organic)
- Interactive Leaflet map for farm origin
- Social links in footer
- Graceful handling of missing whiteLabelConfig (uses defaults)

### API Responses Verified
- `GET /api/portal/{slug}` — Returns branding + batch data (public, no auth)
- `GET /api/white-label` — Returns current config (auth required)
- `PUT /api/white-label` — Updates config (auth + Enterprise plan required)
- Portal API correctly returns 404 for unknown tenants
- White-label API correctly returns 401 for unauthenticated requests

### Both Pages Verified
- `/white-label` — 200 OK (compiles and renders)
- `/portal/{slug}` — 200 OK (compiles and renders)
- Note: Dev server has memory constraints in sandbox; each page compiles individually but may OOM when compiling multiple pages in sequence
