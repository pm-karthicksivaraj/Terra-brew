'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface GeoLocationMapProps {
  lat: number
  lng: number
  zoom?: number
  height?: string
  popupText?: string
}

export function GeoLocationMap({
  lat,
  lng,
  zoom = 13,
  height = '300px',
  popupText,
}: GeoLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Initialize map once on mount
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return
    let cancelled = false

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !mapContainerRef.current) return

        // Fix default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom,
          zoomControl: true,
          scrollWheelZoom: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        const marker = L.marker([lat, lng]).addTo(map)
        const displayText = popupText || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        marker.bindPopup(
          `<div style="text-align:center; font-family: monospace; font-size: 12px;">
            <strong><span style="color: #059669;">📍 Geolocation</span></strong><br/>
            ${displayText}<br/>
            <span style="font-size: 10px; color: #888;">Lat: ${lat}, Lng: ${lng}</span>
          </div>`
        ).openPopup()

        mapRef.current = map
        markerRef.current = marker
        setMapReady(true)
      } catch (err) {
        console.error('Failed to initialize map:', err)
      }
    }
    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // We intentionally only initialize the map once on mount.
    // Coordinate updates are handled in the separate effect below.
  }, [mounted])

  // Update center and marker when coordinates change
  const updateMapPosition = useCallback(async () => {
    if (!mapRef.current) return
    const L = (await import('leaflet')).default
    const map = mapRef.current
    if (!map) return

    map.setView([lat, lng], zoom)

    // Remove old marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current)
    }

    // Add new marker
    const marker = L.marker([lat, lng]).addTo(map)
    const displayText = popupText || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    marker.bindPopup(
      `<div style="text-align:center; font-family: monospace; font-size: 12px;">
        <strong><span style="color: #059669;">📍 Geolocation</span></strong><br/>
        ${displayText}<br/>
        <span style="font-size: 10px; color: #888;">Lat: ${lat}, Lng: ${lng}</span>
      </div>`
    ).openPopup()
    markerRef.current = marker
  }, [lat, lng, zoom, popupText])

  useEffect(() => {
    updateMapPosition()
  }, [updateMapPosition])

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
    </div>
  )
}
