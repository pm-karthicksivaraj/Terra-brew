# P0-5: /api/v1/compliance/status Endpoint with Trust Score Calculation

## Task Summary
Built the public-facing API v1 compliance status endpoint with Trust Score calculation for the TerraBrew Coffee Platform.

## Files Created/Modified

### 1. NEW: `/src/app/api/v1/trust-score.ts`
**Purpose:** Reusable Trust Score calculation module, extracted from the route handler for use across the platform.

**Exports:**
- `TrustScoreInput` — Typed interface for all Trust Score inputs
- `TrustScoreBreakdown` — Typed interface for score breakdown output
- `calcEudrScore(statuses)` — EUDR compliance component (0-30 pts)
- `calcDeforestationScore(riskCategories)` — Deforestation risk component (0-25 pts)
- `calcDdsScore(ddsStatuses)` — DDS status component (0-20 pts)
- `calcCertScore(activeCount, expiredCount, totalCerts)` — Certifications component (0-15 pts)
- `calcDataCompletenessScore(hasGeolocation, hasFarmPolygon, hasFarmerData)` — Data completeness component (0-10 pts)
- `calculateTrustScore(params)` — Returns total score (0-100)
- `calculateTrustScoreWithBreakdown(params)` — Returns total + per-component breakdown
- `determineOverallEudrStatus(statuses)` — Best EUDR status from records
- `determineOverallDeforestationRisk(categories)` — Best (lowest) risk from assessments

**Scoring Rules (0-100):**
| Component | Max | Values |
|-----------|-----|--------|
| EUDR Compliance | 30 | compliant=30, in_review=20, pending=10, expired=5, non_compliant=0 |
| Deforestation Risk | 25 | negligible=25, low=20, medium=10, high=0, critical=0 |
| DDS Status | 20 | accepted=20, submitted=15, draft=5, none=0 |
| Certifications | 15 | all active=15, some expired=10, none=0 |
| Data Completeness | 10 | full(geo+polygon+farmer)=10, partial=5, minimal=0 |

### 2. MODIFIED: `/src/app/api/v1/compliance/status/route.ts`
**Changes:**
- Removed inline trust score calculation functions (now imported from `trust-score.ts`)
- Added `calculateTrustScoreWithBreakdown()` to provide per-component scores in the API response
- Added `trust_score_breakdown` field to the response JSON
- Uses typed `TrustScoreInput` interface for input parameters

**Endpoint:** `GET /api/v1/compliance/status?supplier_id=xxx&shipment_ref=yyy`
**Auth:** API Key (X-API-Key header or api_key query param)
**HTTP Status Codes:** 200, 400, 401, 404, 429, 500

### 3. MODIFIED: `/src/app/api/v1/route.ts`
**Changes:**
- Added `trust_score_breakdown` documentation to the response schema

### 4. EXISTING (verified): `/src/app/api/v1/auth.ts`
**Key features:**
- SHA-256 hashed API keys (raw keys never stored)
- In-memory rate limiting (100 req/hour per key, with periodic cleanup)
- Validates key existence, expiration, and tenant active status
- Returns typed `ApiKeyAuthResult | ApiKeyAuthError` discriminated union
- `authErrorResponse()` helper for standardized error responses

## Lint Status
No lint errors in the v1 API files. All errors are from pre-existing files (upload/, mobile/, i18n, etc.).

## Architecture Notes
- Trust Score calculation is fully deterministic (same inputs → same score)
- The `trust-score.ts` module has zero database dependencies — it's a pure calculation module
- Database queries happen in the route handler, which then passes structured data to the calculator
- All v1 routes use `validateApiKey()` instead of session-based `getAuthUser()`/`requireTenantAccess()`
