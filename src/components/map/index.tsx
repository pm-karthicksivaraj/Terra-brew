'use client'

import dynamic from 'next/dynamic'

// Farm land geo-plotting map — client-only (Leaflet needs DOM)
export const FarmLandMap = dynamic(
  () => import('@/components/map/farm-land-map').then(m => ({ default: m.FarmLandMap })),
  { ssr: false, loading: () => <MapSkeleton /> }
)

// Traceability journey map — client-only
export const TraceabilityMap = dynamic(
  () => import('@/components/map/traceability-map').then(m => ({ default: m.TraceabilityMap })),
  { ssr: false, loading: () => <MapSkeleton /> }
)

function MapSkeleton() {
  return (
    <div className="w-full h-[450px] rounded-2xl border border-border bg-muted/30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
        <span className="text-xs">Loading map...</span>
      </div>
    </div>
  )
}

// Re-export types
export type { FarmLandPolygon, PolygonCoordinate } from '@/components/map/farm-land-map'
export type { TraceLocation } from '@/components/map/traceability-map'
