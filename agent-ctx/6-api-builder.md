# Task 6 - Build All API Routes

## Agent: API Builder
## Status: COMPLETED

## Summary
Created 16 API route files with full CRUD (GET, POST, PUT, DELETE) for the Terra Brew Coffee Traceability Platform.

## Files Created
1. `/src/app/api/farmlands/route.ts` - FarmLand CRUD with farmer relation
2. `/src/app/api/cultivations/route.ts` - Cultivation CRUD with farmer + farmLand
3. `/src/app/api/nurseries/route.ts` - Nursery CRUD with farmer relation
4. `/src/app/api/land-preparations/route.ts` - LandPreparation CRUD with farmer + farmLand
5. `/src/app/api/crop-monitorings/route.ts` - CropMonitoring CRUD with alertTriggered filter
6. `/src/app/api/fertilizer-apps/route.ts` - FertilizerApplication CRUD with farmer + farmLand
7. `/src/app/api/pest-disease-mgmts/route.ts` - PestDiseaseManagement CRUD with farmer + farmLand
8. `/src/app/api/harvest-traceabilities/route.ts` - HarvestTraceability CRUD with batchId search
9. `/src/app/api/procurement/route.ts` - ProcurementRecord CRUD with batchId + paymentStatus filters
10. `/src/app/api/processing/route.ts` - ProcessingJobOrder CRUD with processingStages include
11. `/src/app/api/cert-assessments/route.ts` - CertAssessment CRUD with status filter
12. `/src/app/api/coffee-inspections/route.ts` - CoffeeInspection CRUD with batchId + passFail filters
13. `/src/app/api/smart-contracts/route.ts` - SmartContract CRUD with status filter
14. `/src/app/api/marketplace/route.ts` - MarketplaceListing CRUD with listingStatus + coffeeType filters
15. `/src/app/api/users/route.ts` - User CRUD with password masking, tenant_admin-only
16. `/src/app/api/hash-chain/route.ts` - Hash chain GET (list+verify) + POST (add block)

## Schema Changes
Added missing Prisma relations:
- Nursery → Farmer (farmerId was present but no relation field)
- CertAssessment → Farmer + FarmLand
- CoffeeInspection → Farmer + FarmLand
- SmartContract → Farmer
- MarketplaceListing → Farmer
- Added back-references on Farmer model

## Key Design Decisions
- Every query includes tenantId filter for multi-tenant isolation
- All mutations set createdBy: user!.id
- DELETE uses soft delete (isActive: false)
- Users API masks passwordHash in all responses
- Hash chain API computes dataHash + blockHash automatically
- Hash chain verification checks previousHash, dataHash, and blockHash integrity
