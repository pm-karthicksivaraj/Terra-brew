# Task 14 — Add Zod Validation + Reseed DB

## Summary

Completed both parts of Task 14 successfully.

### Part 1: Zod Validation on API Routes

- **Created** `/src/lib/validations.ts` with 5 Zod schemas (farmerSchema, farmLandSchema, eudrComplianceSchema, cultivationSchema, priceTickerSchema) and a `validateData<T>()` helper function
- **Adapted for zod v4**: Used `z.ZodType` (not `z.ZodSchema`) and `errors.issues` (not `errors.errors`)
- **Wired validation into 4 API routes**:
  - `src/app/api/farmers/route.ts` — POST uses farmerSchema
  - `src/app/api/farmlands/route.ts` — POST uses farmLandSchema
  - `src/app/api/eudr-compliance/route.ts` — POST uses eudrComplianceSchema
  - `src/app/api/price-tickers/route.ts` — POST uses priceTickerSchema (replaced manual validation)
- Each route returns 400 with `{ success: false, error: 'Validation failed', details: [...] }` on invalid input

### Part 2: Reseed Database

- **seed-v2.ts already had Ghana + Uganda data** (added in Task 1)
- **Fixed seed bug**: Destructured `key` and `farmerCode` from farmLandDefs before Prisma create
- **Set up embedded PostgreSQL 16.2** since no PG server was available in the environment
- **Reseeded successfully**: 6 tenants, 18 farmers, 18 farmlands, 9 EUDR records, 6 price tickers, 14 users

## Files Modified

- `src/lib/validations.ts` (NEW)
- `src/app/api/farmers/route.ts` (added validation import + POST validation)
- `src/app/api/farmlands/route.ts` (added validation import + POST validation)
- `src/app/api/eudr-compliance/route.ts` (added validation import + POST validation)
- `src/app/api/price-tickers/route.ts` (replaced manual validation with Zod schema)
- `prisma/seed-v2.ts` (fixed `key`/`farmerCode` destructuring bug)
- `.env` (updated DATABASE_URL for local PostgreSQL)
- `worklog.md` (appended task log)
