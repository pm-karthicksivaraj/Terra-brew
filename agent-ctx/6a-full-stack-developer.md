# Task 6a - RFQ Trading Flow Pages

## Task ID: 6a
## Agent: Full-stack Developer

## Task Summary
Build 2 new pages for the RFQ (Request for Quotation) trading flow plus supporting API routes.

## Work Log

### API Routes Created

1. **`/src/app/api/rfq/route.ts`** — RFQ List & Create
   - GET: List all RFQs for tenant with pagination, search, status filter, commodity filter
   - Includes buyer info and response count
   - Auto-generates RFQ numbers (RFQ-YYMM-XXXX format)
   - POST: Create new RFQ with all fields from schema

2. **`/src/app/api/rfq/[id]/route.ts`** — RFQ Detail, Update, Delete
   - GET: Get RFQ with buyer details and all responses
   - PUT: Update RFQ fields + response status updates (accept/reject responses)
   - DELETE: Soft delete (isActive = false)

3. **`/src/app/api/escrow/route.ts`** — Escrow Transactions
   - GET: List escrow transactions with pagination, search, status filter
   - POST: Create new escrow transaction with auto-generated number (ESC-YYMM-XXXX)

4. **`/src/app/api/cross-border/route.ts`** — Cross-Border Transactions
   - GET: List cross-border transactions with pagination, search, status filter
   - POST: Create new cross-border transaction with auto-generated number (CBT-YYMM-XXXX)

All API routes use `getAuthUser` + `requireTenantAccess` from api-middleware, filtering by tenantId.

### Pages Created

1. **`/src/app/rfq/page.tsx`** — Comprehensive RFQ Management Page
   - Header with "Request for Quotation (RFQ)" title + Create RFQ button
   - 4 KPI stat cards: Total RFQs, Pending Response, In Negotiation, Accepted
   - Filters: Search, status filter (7 statuses), commodity filter, date range
   - Table with columns: RFQ Number, Commodity, Quantity, Target Price, Status, Delivery Date, Responses, Actions
   - Create RFQ Dialog (max-w-6xl) with 4-step wizard:
     - Step 1: Basic Info — Commodity, Grade, Quantity, Target Price, Currency
     - Step 2: Delivery — Destination Country, Delivery Port, Delivery Date, Incoterm
     - Step 3: Requirements — Quality Specs (textarea), Sample Required (toggle), Inspection Required (toggle), Payment Terms, Notes
     - Step 4: Review — Summary of all entered data
   - Detail View Dialog showing full RFQ details + response list with Accept/Reject buttons
   - Status badges color-coded: draft=gray, submitted=blue, responded=amber, negotiated=purple, accepted=green, rejected=red, expired=orange, cancelled=gray

2. **`/src/app/trading-desk/page.tsx`** — Comprehensive Trading Desk (REPLACED existing)
   - 5 tabs: Overview, RFQ, Contracts, Escrow, Cross-Border
   - Overview tab: 5 KPI cards (Trade Volume, Active Contracts, Pending RFQs, Escrow Balance, Verified), Recent Activity feed, Quick Access cards linking to other tabs
   - RFQ tab: Embedded RFQ list with "Full RFQ Manager" button linking to /rfq
   - Contracts tab: Full contract list with stats row, create dialog, detail dialog
   - Escrow tab: Escrow transactions with visual status timeline (6-step progress dots)
   - Cross-Border tab: Transactions with documentation completion progress bar, customs status badges

### Key Design Decisions
- Used `responses` (not `rfqResponses`) for Prisma include — matches the schema relation name on RFQ model
- Used DashboardShell layout wrapper, FadeIn/StaggerContainer animations
- Used Space Mono font via existing global styles
- All pages use 'use client' directive
- Consistent teal/coffee color scheme matching platform style

### Build Verification
- `npx next build` compiles successfully with zero errors
- No lint errors in new files
- Both /rfq and /trading-desk routes are listed in build output
