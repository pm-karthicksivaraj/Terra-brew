'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom coffee brown marker icon
const coffeeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-brown.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface EudrLocationMapProps {
  latitude: number
  longitude: number
  complianceId?: string
  farmerName?: string
  zoom?: number
}

export function EudrLocationMap({ latitude, longitude, complianceId, farmerName, zoom = 12 }: EudrLocationMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={coffeeIcon}>
        <Popup>
          <div className="font-mono text-sm">
            {complianceId && <p className="font-bold">{complianceId}</p>}
            {farmerName && <p>{farmerName}</p>}
            <p className="text-xs text-gray-500">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
