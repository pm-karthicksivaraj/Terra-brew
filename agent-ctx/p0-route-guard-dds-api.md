# Task: P0 Features - Route Guard Middleware & DDS API Routes

## Summary

Implemented two major feature sets for the TerraBrew Coffee E2E Traceability Platform:

### PART 1: Route Guard Middleware (proxy.ts)

**Important Discovery**: Next.js 16 uses `proxy.ts` instead of `middleware.ts`. Creating `middleware.ts` causes a fatal conflict error. The route guard logic was integrated into the existing `/home/z/my-project/src/proxy.ts`.

**Changes made to proxy.ts:**
- Added imports from `@/lib/module-config` (MODULES, UNLOCK_BUCKETS, UnlockBucket)
- Added PUBLIC_PREFIXES for `/eudr-readiness/` and `/public/`
- Expanded TENANT_PROTECTED_PREFIXES to include all EUDR/compliance routes: `/eudr-compliance`, `/deforestation`, `/export-docs`, `/shipments`, `/buyers`, `/trading-desk`, `/rfq`, `/inspections`, `/product-monitoring`, `/logistics`, `/iot-sensors`, `/api-settings`, `/billing`, `/analytics`, `/compliance-marketplace`
- Built HREF_BUCKET_MAP from MODULES array for fast pathname → unlock bucket lookup
- Added `findModuleBucketForPath()` function with exact and prefix matching
- Added progressive disclosure enforcement in tenant route checks: after authentication, checks if the matched module's unlock bucket exceeds the tenant's age-based unlock level
- If locked, redirects to `/dashboard?locked=1`
- Platform admins bypass module gating
- Bucket 1 modules (0 days) are always accessible
- Expanded matcher config to include all new route patterns

### PART 2: DDS API Routes

**Files created:**

1. `/home/z/my-project/src/app/api/due-diligence/route.ts`
   - GET: List DDS records with pagination, filtering by `status` and `operatorEori`, includes `eudrCompliance` relation
   - POST: Create new DDS record, auto-sets tenantId and createdBy

2. `/home/z/my-project/src/app/api/due-diligence/[id]/route.ts`
   - GET: Get DDS detail with `eudrCompliance` relation
   - PUT: Update DDS record (checks tenant ownership first)
   - DELETE: Soft delete (sets isActive = false)

3. `/home/z/my-project/src/app/api/due-diligence/[id]/submit/route.ts`
   - POST: Submits a draft DDS to EU TRACES
   - Gets the DDS record, builds DueDiligenceStatementData payload
   - Calls `submitDueDiligenceStatement()` from `@/lib/integrations/traces`
   - Updates the DDS record with TRACES response (tracesRef, status, submittedDate)
   - Only allows submission of records in 'draft' status

4. `/home/z/my-project/src/app/api/deforestation/assess/route.ts`
   - POST: Accepts `{ geojson, referencePeriodStart, referencePeriodEnd, farmLandId?, eudrComplianceId? }`
   - Calls `assessDeforestationRisk()` from `@/lib/integrations/deforestation`
   - Creates a DeforestationAssessment record in the DB with all risk results
   - Returns both the DB record and the raw risk assessment result

**All files follow the same patterns as existing eudr-compliance routes:**
- Import from `@/lib/api-middleware`: getAuthUser, requireTenantAccess, apiResponse, apiError, getPaginationParams
- Import `db` from `@/lib/db`
- Use requireTenantAccess with 'eudr-compliance' module slug
- Proper error handling with typed catch blocks
- No `any` types where avoidable (only Prisma dynamic `where` clause uses `any` matching existing pattern)

**Lint check: PASSED** - No errors in any new files
**Dev server: RUNNING** - All endpoints respond correctly (return 401 for unauthenticated requests)
