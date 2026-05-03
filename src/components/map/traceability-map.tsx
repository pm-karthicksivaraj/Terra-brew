'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────

export interface TraceLocation {
  id: string
  name: string
  lat: number
  lng: number
  stage: string
  status: 'completed' | 'pending' | 'not_available'
  icon: string
  date?: string
  details?: string
}

interface TraceabilityMapProps {
  /** Locations to display on the journey map */
  locations: TraceLocation[]
  /** Active/selected location ID */
  activeLocationId?: string
  /** Language */
  lang?: string
  /** Map height */
  height?: string
  /** On location click */
  onLocationClick?: (id: string) => void
}

const STATUS_COLORS = {
  completed: { marker: '#059669', pulse: 'rgba(5, 150, 105, 0.3)', line: '#059669' },
  pending: { marker: '#d97706', pulse: 'rgba(217, 119, 6, 0.3)', line: '#d97706' },
  not_available: { marker: '#9ca3af', pulse: 'rgba(156, 163, 175, 0.1)', line: '#d1d5db' },
}

export function TraceabilityMap({
  locations,
  activeLocationId,
  lang = 'vi',
  height = '450px',
  onLocationClick,
}: TraceabilityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const onLocationClickRef = useRef(onLocationClick)
  onLocationClickRef.current = onLocationClick

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return
    let cancelled = false

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !mapContainerRef.current) return

        delete (L.Icon.Default.prototype as any)._getIconUrl

        const map = L.map(mapContainerRef.current, {
          center: [12.668, 108.038],
          zoom: 10,
          zoomControl: true,
          scrollWheelZoom: true,
        })

        // Use a clean, light map style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map)

        mapRef.current = map
        setMapReady(true)
      } catch (err) {
        console.error('Failed to init traceability map:', err)
      }
    }
    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [mounted])

  // Render journey when locations change (NOT on activeLocationId — that's handled separately)
  useEffect(() => {
    if (!mapRef.current || !mapReady || locations.length === 0) return

    const renderJourney = async () => {
      const L = (await import('leaflet')).default
      const map = mapRef.current

      // Clear existing markers and lines
      markersRef.current.forEach(m => map.removeLayer(m))
      markersRef.current = []

      // Filter valid locations
      const validLocs = locations.filter(l => l.lat && l.lng)
      if (validLocs.length === 0) return

      // Draw journey lines between consecutive locations
      for (let i = 0; i < validLocs.length - 1; i++) {
        const from = validLocs[i]
        const to = validLocs[i + 1]
        const status = from.status === 'completed' && to.status === 'completed' ? 'completed' :
          from.status === 'completed' || to.status === 'completed' ? 'pending' : 'not_available'
        const colors = STATUS_COLORS[status]

        // Draw the route line with animation effect
        const latlngs: [number, number][] = [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ]

        // Background line (thick, faded)
        const bgLine = L.polyline(latlngs, {
          color: colors.line,
          weight: 4,
          opacity: 0.15,
          dashArray: status === 'completed' ? undefined : '8, 8',
        }).addTo(map)
        markersRef.current.push(bgLine)

        // Foreground line (thin, solid or dashed)
        const fgLine = L.polyline(latlngs, {
          color: colors.line,
          weight: 2,
          opacity: status === 'completed' ? 0.7 : 0.3,
          dashArray: status === 'completed' ? undefined : '6, 6',
        }).addTo(map)
        markersRef.current.push(fgLine)

        // Add animated dash for completed segments
        if (status === 'completed') {
          const animatedLine = L.polyline(latlngs, {
            color: '#ffffff',
            weight: 2,
            opacity: 0.6,
            dashArray: '2, 12',
            dashOffset: '0',
          }).addTo(map)
          markersRef.current.push(animatedLine)

          // Animate the dash offset
          let offset = 0
          const animate = () => {
            offset -= 1
            animatedLine.setStyle({ dashOffset: String(offset) })
            if (mapRef.current) requestAnimationFrame(animate)
          }
          animate()
        }
      }

      // Draw markers for each location
      validLocs.forEach((loc) => {
        const colors = STATUS_COLORS[loc.status]
        const isActive = loc.id === activeLocationId

        // Create custom div icon
        const icon = L.divIcon({
          className: 'trace-marker',
          html: `
            <div style="position:relative;width:40px;height:40px;">
              ${loc.status === 'completed' ? `
                <div style="position:absolute;inset:0;border-radius:50%;background:${colors.pulse};animation:tracePulse 2s ease-in-out infinite;"></div>
              ` : ''}
              <div style="position:absolute;inset:4px;border-radius:50%;background:${colors.marker};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;${isActive ? 'transform:scale(1.2);z-index:10;' : ''}">
                ${loc.icon}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)

        // Tooltip
        marker.bindTooltip(`
          <div style="font-family:'Inter',system-ui,sans-serif;font-size:10px;min-width:120px;">
            <div style="font-weight:bold;margin-bottom:2px;">${loc.name}</div>
            <div style="color:#666;">${loc.stage}</div>
            ${loc.date ? `<div style="color:#999;margin-top:2px;">${new Date(loc.date).toLocaleDateString()}</div>` : ''}
            ${loc.details ? `<div style="color:#888;margin-top:2px;font-size:9px;">${loc.details}</div>` : ''}
          </div>
        `, { direction: 'top', offset: [0, -20] })

        if (onLocationClickRef.current) {
          marker.on('click', () => onLocationClickRef.current?.(loc.id))
        }

        markersRef.current.push(marker)
      })

      // Fit map to all locations
      if (validLocs.length > 0) {
        const bounds = L.latLngBounds(validLocs.map(l => [l.lat, l.lng]))
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 })
      }
    }

    renderJourney()
  }, [locations, mapReady])

  // Fly to active location when activeLocationId changes
  useEffect(() => {
    if (!mapRef.current || !mapReady || !activeLocationId) return
    const loc = locations.find(l => l.id === activeLocationId)
    if (!loc || !loc.lat || !loc.lng) return
    mapRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 })
  }, [activeLocationId, locations, mapReady])

  // Re-render markers when activeLocationId changes (for highlight styling)
  useEffect(() => {
    if (!mapRef.current || !mapReady || locations.length === 0 || !activeLocationId) return

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default
      const map = mapRef.current

      // Remove only existing markers (keep polylines)
      const existingMarkers = markersRef.current.filter(m => m instanceof L.Marker || m.getLatLng)
      existingMarkers.forEach(m => map.removeLayer(m))
      markersRef.current = markersRef.current.filter(m => !(m instanceof L.Marker || m.getLatLng))

      const validLocs = locations.filter(l => l.lat && l.lng)

      validLocs.forEach((loc) => {
        const colors = STATUS_COLORS[loc.status]
        const isActive = loc.id === activeLocationId

        const icon = L.divIcon({
          className: 'trace-marker',
          html: `
            <div style="position:relative;width:40px;height:40px;">
              ${loc.status === 'completed' ? `
                <div style="position:absolute;inset:0;border-radius:50%;background:${colors.pulse};animation:tracePulse 2s ease-in-out infinite;"></div>
              ` : ''}
              <div style="position:absolute;inset:4px;border-radius:50%;background:${colors.marker};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;${isActive ? 'transform:scale(1.3);z-index:10;' : ''}">
                ${loc.icon}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)

        marker.bindTooltip(`
          <div style="font-family:'Inter',system-ui,sans-serif;font-size:10px;min-width:120px;">
            <div style="font-weight:bold;margin-bottom:2px;">${loc.name}</div>
            <div style="color:#666;">${loc.stage}</div>
            ${loc.date ? `<div style="color:#999;margin-top:2px;">${new Date(loc.date).toLocaleDateString()}</div>` : ''}
            ${loc.details ? `<div style="color:#888;margin-top:2px;font-size:9px;">${loc.details}</div>` : ''}
          </div>
        `, { direction: 'top', offset: [0, -20] })

        if (onLocationClickRef.current) {
          marker.on('click', () => onLocationClickRef.current?.(loc.id))
        }

        markersRef.current.push(marker)

        // Open tooltip for active marker
        if (isActive) {
          setTimeout(() => marker.openTooltip(), 300)
        }
      })
    }

    updateMarkers()
  }, [activeLocationId, locations, mapReady])

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', borderRadius: '16px', zIndex: 1 }}
        className="border border-border overflow-hidden"
      />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-2xl" style={{ zIndex: 2 }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">{lang === 'vi' ? 'Đang tải bản đồ...' : 'Loading map...'}</span>
          </div>
        </div>
      )}

      {/* Journey legend */}
      {locations.length > 0 && (
        <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-2" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-[9px] text-foreground">{lang === 'vi' ? 'Hoàn thành' : 'Done'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span className="text-[9px] text-foreground">{lang === 'vi' ? 'Đang chờ' : 'Pending'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="text-[9px] text-foreground">N/A</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
