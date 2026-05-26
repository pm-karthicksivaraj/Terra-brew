# Task 2b - Zod Validation Integrator

## Summary
Added Zod validation to POST and PUT handlers of 13 API routes using `validateBody()` helper from `@/lib/api-middleware` and schemas from `@/lib/validators`.

## Routes Updated (13 total)

| Route | POST Schema | PUT Schema | Notes |
|-------|-------------|------------|-------|
| `/api/procurement` | `createProcurementSchema` | `updateProcurementSchema` | POST + PUT |
| `/api/processing` | `createProcessingJobSchema` | `updateProcessingJobSchema` | Special: stages extracted before validation |
| `/api/cert-assessments` | `createCertAssessmentSchema` | `updateCertAssessmentSchema` | POST + PUT |
| `/api/coffee-inspections` | `createCoffeeInspectionSchema` | `updateCoffeeInspectionSchema` | POST + PUT |
| `/api/eudr-compliance` | `createEudrComplianceSchema` | - | POST only |
| `/api/eudr-compliance/[id]` | - | `updateEudrComplianceSchema` | PUT only |
| `/api/deforestation` | `createDeforestationSchema` | - | POST only |
| `/api/deforestation/[id]` | - | `updateDeforestationSchema` | PUT only |
| `/api/export-docs` | `createExportDocSchema` | - | POST only; removed manual `!body.documentType` check |
| `/api/export-docs/[id]` | - | `updateExportDocSchema` | PUT only |
| `/api/shipments` | `createShipmentSchema` | - | POST only |
| `/api/buyers` | `createBuyerSchema` | - | POST only; removed manual `!body.companyName` check |
| `/api/buyers/[id]` | - | `updateBuyerSchema` | PUT only |

## Key Patterns Applied
- **POST**: `validateBody(createXxxSchema, body)` → `validatedData` used in Prisma create
- **PUT**: Extract `id` from body, then `validateBody(updateXxxSchema, rest)` → `validatedData` used in Prisma update
- **Processing special case**: Extract `processingStages`/`stages` first, validate `restBody` with schema, stages handled separately

## Redundant Checks Removed
1. `!body.documentType` in `/api/export-docs` (now enforced by Zod enum)
2. `!body.companyName` in `/api/buyers` (now enforced by Zod `.min(1)`)

## Verification
- ESLint: No new errors from modified files
- TypeScript: 0 new compilation errors
