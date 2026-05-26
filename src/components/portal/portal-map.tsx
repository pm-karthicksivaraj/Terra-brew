'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'

interface PortalMapProps {
  lat: number
  lng: number
  farmName: string
  farmerName: string
  primaryColor: string
  accentColor: string
}

export function PortalMap({
  lat,
  lng,
  farmName,
  farmerName,
  primaryColor,
  accentColor,
}: PortalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
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

        const map = L.map(mapContainerRef.current, {
          center: [lat || 12.668, lng || 108.038],
          zoom: lat && lng ? 12 : 8,
          zoomControl: true,
          scrollWheelZoom: true,
        })

        // Clean light map style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map)

        // Add farm marker if coordinates exist
        if (lat && lng) {
          const icon = L.divIcon({
            className: 'portal-marker',
            html: `
              <div style="position:relative;width:48px;height:48px;">
                <div style="position:absolute;inset:0;border-radius:50%;background:${primaryColor}25;animation:tracePulse 2s ease-in-out infinite;"></div>
                <div style="position:absolute;inset:6px;border-radius:50%;background:${primaryColor};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;">
                  🌱
                </div>
              </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
          })

          const marker = L.marker([lat, lng], { icon }).addTo(map)
          marker.bindTooltip(`
            <div style="font-family:'Inter',system-ui,sans-serif;font-size:11px;min-width:140px;">
              <div style="font-weight:bold;margin-bottom:2px;">${farmName}</div>
              <div style="color:#666;">Farmer: ${farmerName}</div>
              <div style="color:#999;margin-top:2px;font-size:10px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            </div>
          `, { direction: 'top', offset: [0, -24] })

          map.setView([lat, lng], 12)
        }

        mapRef.current = map
        setMapReady(true)
      } catch (err) {
        console.error('Failed to init portal map:', err)
      }
    }
    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [mounted, lat, lng, primaryColor])

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ height: '300px', width: '100%', borderRadius: '16px', zIndex: 1 }}
        className="border border-border overflow-hidden"
      />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-2xl" style={{ zIndex: 2 }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading map...</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tracePulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
