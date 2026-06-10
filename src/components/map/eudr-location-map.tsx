'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface PolygonCoordinate {
  lat: number
  lng: number
}

interface EudrLocationMapProps {
  latitude: number
  longitude: number
  complianceId?: string
  farmerName?: string
  zoom?: number
  height?: string
  /** Polygon GeoJSON string from farmland */
  polygonGeoJson?: string | null
  /** Polygon coordinates array */
  polygonCoordinates?: PolygonCoordinate[]
}

export function EudrLocationMap({
  latitude,
  longitude,
  complianceId,
  farmerName,
  zoom = 12,
  height = '400px',
  polygonGeoJson,
  polygonCoordinates,
}: EudrLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const polygonLayerRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return
    let cancelled = false

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !mapContainerRef.current) return

        delete (L.Icon.Default.prototype as any)._getIconUrl

        const coffeeIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-brown.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        const map = L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom,
          zoomControl: true,
          scrollWheelZoom: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        // Add marker
        const marker = L.marker([latitude, longitude], { icon: coffeeIcon }).addTo(map)
        marker.bindPopup(`
          <div style="font-family:monospace;font-size:12px">
            ${complianceId ? `<p style="font-weight:bold;margin:0 0 4px">${complianceId}</p>` : ''}
            ${farmerName ? `<p style="margin:0 0 4px">${farmerName}</p>` : ''}
            <p style="font-size:10px;color:#888;margin:0">Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</p>
          </div>
        `)
        markerRef.current = marker

        // Add polygon if available
        const coords = polygonCoordinates || parseGeoJson(polygonGeoJson)
        if (coords && coords.length >= 3) {
          const latLngs = coords.map(c => [c.lat, c.lng] as [number, number])
          const polygon = L.polygon(latLngs, {
            color: '#6D2932',
            weight: 2,
            opacity: 0.8,
            fillColor: '#6D2932',
            fillOpacity: 0.2,
          }).addTo(map)
          polygon.bindTooltip(`Farm Boundary`, { sticky: true })
          polygonLayerRef.current = polygon
          map.fitBounds(polygon.getBounds(), { padding: [50, 50] })
        }

        mapRef.current = map
        setMapReady(true)
      } catch (err) {
        console.error('Failed to initialize map:', err)
      }
    }
    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [mounted])

  // Update position when coordinates change
  useEffect(() => {
    if (!mapRef.current) return
    const updatePos = async () => {
      const L = (await import('leaflet')).default
      const map = mapRef.current
      if (!map) return

      map.setView([latitude, longitude], zoom)

      // Update marker
      if (markerRef.current) map.removeLayer(markerRef.current)
      const coffeeIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-brown.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      const marker = L.marker([latitude, longitude], { icon: coffeeIcon }).addTo(map)
      marker.bindPopup(`
        <div style="font-family:monospace;font-size:12px">
          ${complianceId ? `<p style="font-weight:bold;margin:0 0 4px">${complianceId}</p>` : ''}
          ${farmerName ? `<p style="margin:0 0 4px">${farmerName}</p>` : ''}
          <p style="font-size:10px;color:#888;margin:0">Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</p>
        </div>
      `)
      markerRef.current = marker
    }
    updatePos()
  }, [latitude, longitude, zoom, complianceId, farmerName])

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', borderRadius: '12px', zIndex: 1 }}
        className="border border-border overflow-hidden"
      />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-xl" style={{ zIndex: 2 }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading map...</span>
          </div>
        </div>
      )}
      {/* Coordinate overlay */}
      {mapReady && (
        <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border px-3 py-2" style={{ zIndex: 1000 }}>
          <div className="text-[10px] font-mono text-muted-foreground">
            <span style={{ color: '#6D2932' }}>Lat:</span> {latitude.toFixed(4)} &nbsp;
            <span style={{ color: '#6D2932' }}>Lng:</span> {longitude.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helper: Parse GeoJSON string to coordinates ─────────────────

function parseGeoJson(geoJsonStr?: string | null): PolygonCoordinate[] | null {
  if (!geoJsonStr) return null
  try {
    const geojson = JSON.parse(geoJsonStr)
    const coords: PolygonCoordinate[] = []
    if (geojson.type === 'Polygon' && geojson.coordinates) {
      const ring = geojson.coordinates[0]
      ring.forEach((c: number[]) => {
        if (c.length >= 2) coords.push({ lng: c[0], lat: c[1] })
      })
    } else if (geojson.type === 'MultiPolygon' && geojson.coordinates) {
      const ring = geojson.coordinates[0][0]
      ring.forEach((c: number[]) => {
        if (c.length >= 2) coords.push({ lng: c[0], lat: c[1] })
      })
    }
    return coords.length >= 3 ? coords : null
  } catch {
    return null
  }
}
