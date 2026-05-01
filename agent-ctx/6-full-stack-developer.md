# Task 6: Enhance Traceability Page with Map Integration

## Agent: full-stack-developer

## Summary
Integrated the TraceabilityMap component into the traceability page so that when a batch is traced, the journey appears on an animated OpenStreetMap alongside the timeline.

## Files Modified

### 1. `src/components/map/traceability-map.tsx`
- Added `onLocationClickRef` to prevent stale closure in marker click handlers
- Split journey rendering effect from `activeLocationId` updates to avoid re-rendering polylines on every stage click
- Added **fly-to effect**: when `activeLocationId` changes, the map pans/zooms smoothly to that location (zoom 14, 1.2s animation)
- Added **marker re-render effect**: when `activeLocationId` changes, only markers are re-rendered (polylines stay intact) with active marker scaled to 1.3x and auto-opened tooltip
- Removed unused `Badge` and `useCallback` imports
- Fixed eslint warnings by removing unnecessary eslint-disable directives and updating dependency arrays

### 2. `src/app/traceability/page.tsx`
- Added imports: `TraceabilityMap`, `TraceLocation` type, `FadeIn`, `MapPin`, `useMemo`
- Added `STAGE_COORDINATES` constant mapping all 14 stage keys to Central Highlands Vietnam coordinates
- Added `activeLocationId` state for tracking selected map location
- Added `traceLocations` useMemo converting `TraceStage[]` to `TraceLocation[]` with coordinate lookup
- Added `handleStageClick` callback: sets `activeLocationId` + scrolls timeline (replaces direct `scrollToStage` in pipeline)
- Added `handleMapLocationClick` callback: sets `activeLocationId` + scrolls timeline to matching stage
- Reset `activeLocationId` on new search
- Integrated `TraceabilityMap` component ABOVE the timeline, inside a Card with header (MapPin icon, bilingual title/subtitle)
- Wrapped map card in `FadeIn` animation (delay 0.1s)
- Updated `SupplyChainPipeline` `onStageClick` to use `handleStageClick` (connects pipeline clicks to map)

## Key Coordinates (Central Highlands, Vietnam)
| Stage | Lat | Lng | Description |
|-------|-----|-----|-------------|
| farmer | 12.668 | 108.038 | Buon Ma Thuot area |
| farmland | 12.672 | 108.042 | |
| cultivation | 12.675 | 108.040 | |
| nursery | 12.665 | 108.035 | |
| land_preparation | 12.670 | 108.045 | |
| crop_monitoring | 12.673 | 108.043 | |
| fertilizer | 12.671 | 108.041 | |
| pest_disease | 12.676 | 108.039 | |
| harvest | 12.669 | 108.044 | |
| procurement | 12.745 | 108.052 | Collection centre |
| processing | 12.800 | 108.100 | Processing facility |
| certification | 12.810 | 108.120 | |
| inspection | 12.815 | 108.125 | |
| marketplace | 12.900 | 108.200 | Distribution |

## Verification
- ✅ Build: `npx next build` passes with zero errors
- ✅ No AnimatePresence used (FadeIn only, safe for React 19)
- ✅ Map loaded via `dynamic(ssr: false)` through `@/components/map` index.tsx
- ✅ No lint errors in modified files
