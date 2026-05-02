'use client'

import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const DEFAULT_CENTER: [number, number] = [12.5, 108.0]

export function PolygonDisplayMap({ center, polygonCoords }: {
  center: { lat: number; lng: number };
  polygonCoords: Array<{ lat: number; lng: number }> | null;
}) {
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : (polygonCoords && polygonCoords.length > 0 ? [polygonCoords[0].lat, polygonCoords[0].lng] : DEFAULT_CENTER)

  const polygonPositions: [number, number][] = (polygonCoords || []).map(p => [p.lat, p.lng])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ height: '400px' }}>
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
        {/* Show markers for each vertex */}
        {polygonPositions.map((pos, idx) => (
          <Marker key={idx} position={pos}>
            <Popup>
              <span className="text-xs font-medium">Point {idx + 1}<br />{pos[0].toFixed(5)}, {pos[1].toFixed(5)}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
