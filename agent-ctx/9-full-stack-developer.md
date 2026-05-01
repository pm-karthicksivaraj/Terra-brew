# Task 9: Enhance Seed Data for Full Pipeline Demo

**Agent**: full-stack-developer
**Status**: ✅ Completed

## Summary
Enhanced the seed data file (`prisma/seed.ts`) to provide complete E2E traceability pipeline demo data across all 14 stages for 2 batch IDs, with multi-region farmer support (Vietnam, Ethiopia, Kenya).

## What Was Done

### 1. Rewrote Seed File with Idempotent Patterns
- Replaced the early-return `if (existingFarmers > 0) return` pattern with granular `findFirst + create` checks for each record type
- Used `findUnique` for records with unique constraints (farmerCode, contractId, etc.)
- Used `findFirst` for records with composite lookups (farmerId + farmLandId + date)
- All records are safely skipped if they already exist

### 2. Added 5 Farmers (Multi-Region)
| Code | Name | Region | Coordinates |
|------|------|--------|-------------|
| FRM-VN-001 | Nguyễn Văn Thanh | Vietnam, Đắk Lắk | 12.668, 108.038 |
| FRM-VN-002 | Trần Thị Hoa | Vietnam, Đắk Lắk | 12.692, 108.055 |
| FRM-VN-003 | Lê Văn Minh | Vietnam, Đắk Lắk | 12.695, 108.050 |
| FRM-ET-001 | Abebe Tadesse | Ethiopia, Yirgacheffe | 6.162, 38.202 |
| FRM-KE-001 | Kamau Ndirangu | Kenya, Nyeri | -0.420, 36.951 |

### 3. Added 5 Farm Lands with Polygon GeoJSON
- Created `makePolygonGeoJson()` helper function generating ~200m x 200m farm boundary polygons
- Each farm land has: `polygonGeoJson`, `boundaryArea`, `geoCenterLat`, `geoCenterLng`
- Updated existing farm lands (TB-PLT-001, TB-PLT-002) with polygon data via update-if-missing pattern

### 4. Added Intercropping Data
| Cultivation | Primary Crop | Intercrop | Ratio | Scheme |
|-------------|-------------|-----------|-------|--------|
| Lô Robusta A1 | Robusta | Pepper | 3:1 | row-planting |
| Lô Arabica B1 | Arabica | Durian | 5:1 | mixed-planting |
| Yirgacheffe Heirloom | Heirloom | Enset | 4:1 | mixed-planting |
| Nyeri SL28 | SL28 | Macadamia | 6:1 | row-planting |

### 5. Complete E2E Pipeline for BOTH Batch IDs
- **TB-BATCH-2024-001** (Robusta Chari): Full 14-stage pipeline
- **TB-BATCH-2024-002** (Arabica Catimor): Full 14-stage pipeline (was incomplete before)
  - Added: ProcurementRecord, ProcessingJobOrder, 4 ProcessingStageRecords, CoffeeInspection

### 6. Hash Chain Blocks (28 total)
- 14 blocks per batch covering ALL traceability stages:
  FARMER_REGISTRATION → FARMLAND_REGISTRATION → CULTIVATION → NURSERY → LAND_PREPARATION → CROP_MONITORING → FERTILIZER_APPLICATION → PEST_DISEASE → HARVEST → PROCUREMENT → PROCESSING → CERTIFICATION → INSPECTION → MARKETPLACE

### 7. Additional Records
- 5 Nurseries (including Ethiopia & Kenya)
- 5 Land Preparations, 5 Crop Monitorings, 5 Fertilizer Applications, 3 Pest/Disease records
- 5 Cert Assessments (Organic, Fair Trade, UTZ across regions)
- 5 Smart Contracts (including international: Blue Bottle USA, Square Mile UK)
- 5 Marketplace Listings (including USD-priced international listings)
- 2 Collection Centres (Ea Tam + Ea Drăng)

## Verification
- ✅ Seed runs successfully: `npx tsx prisma/seed.ts`
- ✅ Idempotent: second run correctly skips all existing records
- ✅ Database synced to db/custom.db
- ✅ Lint errors are pre-existing (mobile app files), not related to seed changes
