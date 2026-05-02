'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Pencil, Trash2, MapPin, Hand } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const DEFAULT_CENTER: [number, number] = [12.5, 108.0]

export function PolygonMap({ center, existingPolygon, onPolygonChange }: {
  center?: { lat: number; lng: number };
  existingPolygon?: Array<{ lat: number; lng: number }>;
  onPolygonChange: (coords: Array<{ lat: number; lng: number }>) => void;
}) {
  const [mode, setMode] = useState<'draw' | 'edit' | 'view'>(() => existingPolygon && existingPolygon.length > 0 ? 'view' : 'draw')
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>(() => existingPolygon || [])
  const mapRef = useRef<L.Map | null>(null)

  // Notify parent when points change
  useEffect(() => {
    if (points.length >= 3) {
      onPolygonChange(points)
    } else if (points.length === 0) {
      onPolygonChange([])
    }
  }, [points, onPolygonChange])

  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : (points.length > 0 ? [points[0].lat, points[0].lng] : DEFAULT_CENTER)

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (mode === 'draw') {
      const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng }
      setPoints(prev => [...prev, newPoint])
    }
  }, [mode])

  const handleClear = () => {
    setPoints([])
    setMode('draw')
    onPolygonChange([])
  }

  const handleUndo = () => {
    setPoints(prev => {
      const updated = prev.slice(0, -1)
      if (updated.length < 3) onPolygonChange([])
      return updated
    })
  }

  const handleFinish = () => {
    if (points.length >= 3) {
      setMode('view')
    }
  }

  const handleEdit = () => {
    setMode('draw')
  }

  const polygonPositions: [number, number][] = points.map(p => [p.lat, p.lng])

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          size="sm"
          variant={mode === 'draw' ? 'default' : 'outline'}
          onClick={handleEdit}
          className="text-xs"
        >
          <Pencil className="h-3 w-3 mr-1" /> Draw
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'view' && points.length >= 3 ? 'default' : 'outline'}
          onClick={handleFinish}
          className="text-xs"
          disabled={points.length < 3}
        >
          <Hand className="h-3 w-3 mr-1" /> Finish
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleUndo}
          className="text-xs"
          disabled={points.length === 0}
        >
          ↩ Undo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleClear}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          {points.length > 0 && (
            <span className="text-xs text-muted-foreground font-medium">
              <MapPin className="h-3 w-3 inline mr-1" />
              {points.length} point{points.length !== 1 ? 's' : ''}
              {points.length >= 3 && <span className="text-emerald-600 ml-1">✓ Polygon ready</span>}
            </span>
          )}
        </div>
      </div>

      {mode === 'draw' && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">
          Click on the map to add points. Add at least 3 points to form a polygon, then click &quot;Finish&quot;.
        </p>
      )}

      {/* Map */}
      <div className="rounded-xl border overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          ref={mapRef}
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          {/* Polygon */}
          {polygonPositions.length >= 3 && (
            <Polygon
              positions={polygonPositions}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
          )}
          {/* Markers for each point */}
          {polygonPositions.map((pos, idx) => (
            <Marker key={idx} position={pos}>
              <Popup>
                <span className="text-xs font-medium">Point {idx + 1}<br />{pos[0].toFixed(5)}, {pos[1].toFixed(5)}</span>
              </Popup>
            </Marker>
          ))}
          {/* Lines connecting points when drawing */}
          {polygonPositions.length >= 2 && (
            <PolylineComponent positions={polygonPositions} />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

// Click handler component
function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  useMapEvents({
    click: onClick,
  })
  return null
}

// Polyline component for drawing lines between points
function PolylineComponent({ positions }: { positions: [number, number][] }) {
  return <Polyline positions={positions} pathOptions={{ color: '#2563eb', weight: 2, dashArray: '8, 8' }} />
}
