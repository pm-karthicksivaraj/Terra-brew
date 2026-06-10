'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Trash2, Save, Undo2, Loader2, Upload, Hexagon } from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────

export interface PolygonCoordinate {
  lat: number
  lng: number
}

interface EudrDrawMapProps {
  center?: [number, number]
  zoom?: number
  /** Current lat from form */
  latitude?: number
  /** Current lng from form */
  longitude?: number
  /** Called when user clicks the map to set a point */
  onLocationSelect?: (lat: number, lng: number) => void
  /** Called when a polygon is drawn */
  onPolygonDrawn?: (coordinates: PolygonCoordinate[]) => void
  /** Called when area is calculated */
  onAreaCalculated?: (areaHectares: number) => void
  /** Existing polygon to display */
  existingPolygon?: PolygonCoordinate[]
  height?: string
}

// ─── Helper: Calculate area from coordinates (Spherical excess) ────

function calculatePolygonArea(coords: PolygonCoordinate[]): number {
  if (coords.length < 3) return 0
  const R = 6371000 // Earth's radius in meters
  let area = 0
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length
    const lat1 = (coords[i].lat * Math.PI) / 180
    const lat2 = (coords[j].lat * Math.PI) / 180
    const lng1 = (coords[i].lng * Math.PI) / 180
    const lng2 = (coords[j].lng * Math.PI) / 180
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }
  area = Math.abs((area * R * R) / 2)
  return area / 10000 // Convert m² to hectares
}

// ─── Component ────────────────────────────────────────────────────

export function EudrDrawMap({
  center = [11.9404, 108.4584],
  zoom = 12,
  latitude,
  longitude,
  onLocationSelect,
  onPolygonDrawn,
  onAreaCalculated,
  existingPolygon,
  height = '450px',
}: EudrDrawMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const polygonLayerRef = useRef<any>(null)
  const previewLayersRef = useRef<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<PolygonCoordinate[]>([])
  const [polygonArea, setPolygonArea] = useState<number>(0)
  const [finalizedPolygon, setFinalizedPolygon] = useState<PolygonCoordinate[]>(existingPolygon || [])

  useEffect(() => { setMounted(true) }, [])

  // Initialize map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return
    let cancelled = false

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !mapContainerRef.current) return

        // Fix default icon
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        const effectiveCenter: [number, number] = (latitude && longitude) ? [latitude, longitude] : center
        const map = L.map(mapContainerRef.current, { center: effectiveCenter, zoom, zoomControl: true, scrollWheelZoom: true })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        // Add marker if coordinates exist
        if (latitude && longitude) {
          const coffeeIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-brown.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
          const marker = L.marker([latitude, longitude], { icon: coffeeIcon }).addTo(map)
          marker.bindPopup(`<div style="font-family:monospace;font-size:12px"><strong>Farm Location</strong><br/>Lat: ${latitude.toFixed(4)}<br/>Lng: ${longitude.toFixed(4)}</div>`)
          markerRef.current = marker
        }

        mapRef.current = map
        setMapReady(true)

        // Render existing polygon if provided
        if (existingPolygon && existingPolygon.length >= 3) {
          const latLngs = existingPolygon.map(c => [c.lat, c.lng] as [number, number])
          const polygon = L.polygon(latLngs, {
            color: '#6D2932', weight: 2, opacity: 0.8, fillColor: '#6D2932', fillOpacity: 0.2,
          }).addTo(map)
          polygonLayerRef.current = polygon
          const area = calculatePolygonArea(existingPolygon)
          setPolygonArea(area)
          onAreaCalculated?.(area)
        }
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

  // Update marker when lat/lng change
  useEffect(() => {
    if (!mapRef.current || latitude === undefined || longitude === undefined) return
    const updateMarker = async () => {
      const L = (await import('leaflet')).default
      const map = mapRef.current
      if (!map) return

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
      marker.bindPopup(`<div style="font-family:monospace;font-size:12px"><strong>Farm Location</strong><br/>Lat: ${latitude.toFixed(4)}<br/>Lng: ${longitude.toFixed(4)}</div>`)
      markerRef.current = marker
    }
    updateMarker()
  }, [latitude, longitude])

  // Click handler for drawing and location selection
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng
      if (isDrawing) {
        setCurrentPoints(prev => [...prev, { lat, lng }])
      } else if (onLocationSelect) {
        onLocationSelect(lat, lng)
      }
    }
    map.on('click', handleClick)
    return () => { map.off('click', handleClick) }
  }, [isDrawing, onLocationSelect])

  // Update drawing preview
  useEffect(() => {
    if (!mapRef.current || !isDrawing) return
    const renderPreview = async () => {
      const L = (await import('leaflet')).default
      previewLayersRef.current.forEach(layer => {
        if (mapRef.current) mapRef.current.removeLayer(layer)
      })
      previewLayersRef.current = []

      currentPoints.forEach((point) => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 5, color: '#6D2932', fillColor: '#6D2932', fillOpacity: 1,
        }).addTo(mapRef.current)
        previewLayersRef.current.push(marker)
      })
      if (currentPoints.length >= 2) {
        const line = L.polyline(currentPoints.map(p => [p.lat, p.lng]), {
          color: '#6D2932', weight: 2, dashArray: '5, 5',
        }).addTo(mapRef.current)
        previewLayersRef.current.push(line)
      }
      if (currentPoints.length >= 3) {
        const poly = L.polygon(currentPoints.map(p => [p.lat, p.lng]), {
          color: '#6D2932', weight: 2, fillColor: '#6D2932', fillOpacity: 0.15, dashArray: '5, 5',
        }).addTo(mapRef.current)
        previewLayersRef.current.push(poly)
      }
    }
    renderPreview()
  }, [currentPoints, isDrawing])

  const startDrawing = useCallback(() => {
    setIsDrawing(true)
    setCurrentPoints([])
    if (mapRef.current) mapRef.current.getContainer().style.cursor = 'crosshair'
    toast.info('Click on the map to create polygon points. At least 3 points needed.')
  }, [])

  const finishDrawing = useCallback(() => {
    if (currentPoints.length < 3) {
      toast.error('Need at least 3 points to create a polygon')
      return
    }
    setIsDrawing(false)
    if (mapRef.current) mapRef.current.getContainer().style.cursor = ''

    // Clean up preview layers
    previewLayersRef.current.forEach(layer => {
      if (mapRef.current) mapRef.current.removeLayer(layer)
    })
    previewLayersRef.current = []

    // Remove old polygon layer
    if (polygonLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polygonLayerRef.current)
    }

    const area = calculatePolygonArea(currentPoints)
    setPolygonArea(area)
    setFinalizedPolygon(currentPoints)
    onAreaCalculated?.(area)
    onPolygonDrawn?.(currentPoints)

    // Render finalized polygon on map
    const renderPoly = async () => {
      const L = (await import('leaflet')).default
      const latLngs = currentPoints.map(c => [c.lat, c.lng] as [number, number])
      const polygon = L.polygon(latLngs, {
        color: '#6D2932', weight: 2, opacity: 0.8, fillColor: '#6D2932', fillOpacity: 0.2,
      }).addTo(mapRef.current)
      polygon.bindTooltip(`Farm Area: ${area.toFixed(2)} ha`, { sticky: true })
      polygonLayerRef.current = polygon
    }
    renderPoly()
    setCurrentPoints([])
    toast.success(`Polygon created. Area: ${area.toFixed(2)} hectares`)
  }, [currentPoints, onPolygonDrawn, onAreaCalculated])

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false)
    setCurrentPoints([])
    if (mapRef.current) mapRef.current.getContainer().style.cursor = ''
    previewLayersRef.current.forEach(layer => {
      if (mapRef.current) mapRef.current.removeLayer(layer)
    })
    previewLayersRef.current = []
  }, [])

  const undoLastPoint = useCallback(() => {
    setCurrentPoints(prev => prev.slice(0, -1))
  }, [])

  const clearPolygon = useCallback(() => {
    if (polygonLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polygonLayerRef.current)
      polygonLayerRef.current = null
    }
    setFinalizedPolygon([])
    setPolygonArea(0)
    onPolygonDrawn?.([])
    onAreaCalculated?.(0)
  }, [onPolygonDrawn, onAreaCalculated])

  const handleGeoJsonUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const geojson = JSON.parse(event.target?.result as string)
        let coords: PolygonCoordinate[] = []

        if (geojson.type === 'Feature' && geojson.geometry) {
          coords = extractCoordinates(geojson.geometry)
        } else if (geojson.type === 'Polygon') {
          coords = extractCoordinates(geojson)
        } else if (geojson.type === 'FeatureCollection' && geojson.features?.length > 0) {
          coords = extractCoordinates(geojson.features[0].geometry || geojson.features[0])
        }

        if (coords.length < 3) {
          toast.error('GeoJSON must contain at least 3 coordinate points')
          return
        }

        // Clear existing polygon
        if (polygonLayerRef.current && mapRef.current) {
          mapRef.current.removeLayer(polygonLayerRef.current)
        }

        const area = calculatePolygonArea(coords)
        setPolygonArea(area)
        setFinalizedPolygon(coords)
        onAreaCalculated?.(area)
        onPolygonDrawn?.(coords)

        // Render on map
        const L = (await import('leaflet')).default
        const latLngs = coords.map(c => [c.lat, c.lng] as [number, number])
        const polygon = L.polygon(latLngs, {
          color: '#6D2932', weight: 2, opacity: 0.8, fillColor: '#6D2932', fillOpacity: 0.2,
        }).addTo(mapRef.current)
        polygon.bindTooltip(`Farm Area: ${area.toFixed(2)} ha`, { sticky: true })
        polygonLayerRef.current = polygon
        mapRef.current.fitBounds(polygon.getBounds(), { padding: [50, 50] })

        // Set center location from polygon centroid
        const centroidLat = coords.reduce((s, c) => s + c.lat, 0) / coords.length
        const centroidLng = coords.reduce((s, c) => s + c.lng, 0) / coords.length
        onLocationSelect?.(centroidLat, centroidLng)

        toast.success(`GeoJSON loaded. Area: ${area.toFixed(2)} hectares`)
      } catch (err) {
        toast.error('Invalid GeoJSON file')
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be uploaded again
    e.target.value = ''
  }, [onPolygonDrawn, onAreaCalculated, onLocationSelect])

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
      {/* Controls */}
      {mapReady && (
        <div className="absolute top-3 right-3 flex flex-col gap-2" style={{ zIndex: 1000 }}>
          {!isDrawing ? (
            <>
              <Button size="sm" className="text-white gap-1.5 rounded-xl shadow-lg text-xs" style={{ backgroundColor: '#6D2932' }} onClick={startDrawing}>
                <Hexagon className="w-3.5 h-3.5" /> Draw Polygon
              </Button>
              <label className="cursor-pointer">
                <Button size="sm" variant="outline" className="gap-1.5 rounded-xl shadow-lg text-xs w-full" asChild>
                  <span><Upload className="w-3.5 h-3.5" /> Upload GeoJSON</span>
                </Button>
                <input type="file" accept=".json,.geojson" className="hidden" onChange={handleGeoJsonUpload} />
              </label>
              {finalizedPolygon.length >= 3 && (
                <Button size="sm" variant="ghost" className="gap-1 rounded-xl text-xs text-red-500 border border-red-200" onClick={clearPolygon}>
                  <Trash2 className="w-3 h-3" /> Clear
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-1.5 bg-card/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-border">
              <div className="text-[10px] text-muted-foreground text-center mb-1">
                {currentPoints.length} points
              </div>
              {currentPoints.length >= 3 && (
                <Button size="sm" className="text-white gap-1 rounded-lg text-[10px] h-7" style={{ backgroundColor: '#6D2932' }} onClick={finishDrawing}>
                  <Save className="w-3 h-3" /> Finish
                </Button>
              )}
              {currentPoints.length > 0 && (
                <Button size="sm" variant="outline" className="gap-1 rounded-lg text-[10px] h-7" onClick={undoLastPoint}>
                  <Undo2 className="w-3 h-3" /> Undo
                </Button>
              )}
              <Button size="sm" variant="ghost" className="gap-1 rounded-lg text-[10px] h-7 text-red-500" onClick={cancelDrawing}>
                <Trash2 className="w-3 h-3" /> Cancel
              </Button>
            </div>
          )}
        </div>
      )}
      {/* Area info overlay */}
      {polygonArea > 0 && (
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-3" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-bold text-foreground">Farm Boundary</span>
          </div>
          <Badge variant="outline" className="text-xs border-0 bg-muted/50" style={{ color: '#6D2932' }}>
            {polygonArea.toFixed(2)} ha
          </Badge>
        </div>
      )}
      {/* Coordinate overlay */}
      {latitude !== undefined && longitude !== undefined && (
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

// ─── Helper: Extract coordinates from GeoJSON ─────────────────────

function extractCoordinates(geometry: any): PolygonCoordinate[] {
  const coords: PolygonCoordinate[] = []
  if (geometry.type === 'Polygon' && geometry.coordinates) {
    const ring = geometry.coordinates[0] // exterior ring
    ring.forEach((c: number[]) => {
      if (c.length >= 2) coords.push({ lng: c[0], lat: c[1] })
    })
  } else if (geometry.type === 'MultiPolygon' && geometry.coordinates) {
    const ring = geometry.coordinates[0][0] // first polygon, exterior ring
    ring.forEach((c: number[]) => {
      if (c.length >= 2) coords.push({ lng: c[0], lat: c[1] })
    })
  } else if (geometry.type === 'Point' && geometry.coordinates) {
    coords.push({ lng: geometry.coordinates[0], lat: geometry.coordinates[1] })
  }
  return coords
}
