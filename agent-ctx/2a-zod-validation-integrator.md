# Task 2a - Zod Validation Integrator

## Summary
Added Zod validation to POST and PUT handlers of 10 API routes using the `validateBody()` helper from `@/lib/api-middleware` and schemas from `@/lib/validators`.

## Changes Made

### Pattern Applied to Each Route

**POST handlers:**
```typescript
const body = await req.json()
const validation = validateBody(createXxxSchema, body)
if ('error' in validation) return validation.error
const validatedData = validation.data
const item = await db.xxx.create({ data: { ...validatedData, tenantId, createdBy: user!.id } })
```

**PUT handlers:**
```typescript
const body = await req.json()
const { id, ...rest } = body
if (!id) return apiError('ID is required', 400)
const validation = validateBody(updateXxxSchema, rest)
if ('error' in validation) return validation.error
const validatedData = validation.data
const item = await db.xxx.update({ where: { id }, data: validatedData })
```

### Files Modified (10 routes)

1. `src/app/api/farmers/route.ts` — createFarmerSchema / updateFarmerSchema
2. `src/app/api/farmlands/route.ts` — createFarmLandSchema / updateFarmLandSchema
3. `src/app/api/cultivations/route.ts` — createCultivationSchema / updateCultivationSchema
4. `src/app/api/nurseries/route.ts` — createNurserySchema / updateNurserySchema
5. `src/app/api/land-preparations/route.ts` — createLandPreparationSchema / updateLandPreparationSchema
6. `src/app/api/crop-monitorings/route.ts` — createCropMonitoringSchema / updateCropMonitoringSchema
7. `src/app/api/fertilizer-apps/route.ts` — createFertilizerAppSchema / updateFertilizerAppSchema
8. `src/app/api/pest-disease-mgmts/route.ts` — createPestDiseaseSchema / updatePestDiseaseSchema
9. `src/app/api/harvest-traceabilities/route.ts` — createHarvestTraceSchema / updateHarvestTraceSchema
10. `src/app/api/collection-centres/route.ts` — createCollectionCentreSchema / updateCollectionCentreSchema

## Verification
- ESLint: No new errors introduced
- TypeScript: 0 new errors (3 pre-existing errors in unrelated files)
- No redundant manual validation checks were present to remove
