'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Trash2, Save, Undo2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

// ─── Types ────────────────────────────────────────────────────────

export interface PolygonCoordinate {
  lat: number
  lng: number
}

export interface FarmLandPolygon {
  id: string
  name: string
  coordinates: PolygonCoordinate[]
  color: string
  area?: number
  cropType?: string
}

interface FarmLandMapProps {
  center?: [number, number]
  zoom?: number
  polygons?: FarmLandPolygon[]
  drawMode?: boolean
  onPolygonDrawn?: (coordinates: PolygonCoordinate[]) => void
  onPolygonDelete?: (id: string) => void
  onSave?: (polygons: FarmLandPolygon[]) => void
  lang?: 'vi' | 'en'
  height?: string
}

const POLYGON_COLORS = [
  '#059669', '#d97706', '#2563eb', '#dc2626', '#7c3aed',
  '#0891b2', '#be185d', '#65a30d', '#0369a1', '#ea580c',
]

export function FarmLandMap({
  center = [12.668, 108.038],
  zoom = 14,
  polygons = [],
  drawMode = true,
  onPolygonDrawn,
  onPolygonDelete,
  onSave,
  lang: langProp,
  height = '500px',
}: FarmLandMapProps) {
  const { t2, lang: i18nLang } = useI18n()
  const effectiveLang = langProp || i18nLang
  const t = (vi: string, en: string) => effectiveLang === 'vi' ? vi : en
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<PolygonCoordinate[]>([])
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const polygonsRef = useRef(polygons)
  const previewLayersRef = useRef<any[]>([])
  polygonsRef.current = polygons

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return
    let cancelled = false

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !mapContainerRef.current) return

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        const map = L.map(mapContainerRef.current, { center, zoom, zoomControl: true })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        const drawnItems = new L.FeatureGroup()
        drawnItems.addTo(map)
        drawnItemsRef.current = drawnItems
        mapRef.current = map
        setMapReady(true)
        renderPolygons(L, polygons)
      } catch (err) {
        console.error('Failed to initialize map:', err)
      }
    }
    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  useEffect(() => {
    if (!mapRef.current || !drawnItemsRef.current) return
    const render = async () => {
      const L = (await import('leaflet')).default
      renderPolygons(L, polygonsRef.current)
    }
    render()
  }, [polygons])

  const renderPolygons = (L: any, polys: FarmLandPolygon[]) => {
    if (!drawnItemsRef.current) return
    drawnItemsRef.current.clearLayers()

    polys.forEach((poly, index) => {
      const latLngs = poly.coordinates.map(c => [c.lat, c.lng] as [number, number])
      if (latLngs.length < 3) return

      const polygon = L.polygon(latLngs, {
        color: poly.color || POLYGON_COLORS[index % POLYGON_COLORS.length],
        weight: 2,
        opacity: 0.8,
        fillColor: poly.color || POLYGON_COLORS[index % POLYGON_COLORS.length],
        fillOpacity: 0.25,
      })

      polygon.bindTooltip(`${poly.name}${poly.cropType ? ` — ${poly.cropType}` : ''}`, {
        sticky: true,
      })

      polygon.on('click', () => { setSelectedPolygon(poly.id) })
      drawnItemsRef.current.addLayer(polygon)
    })

    if (polys.length > 0 && mapRef.current) {
      const allCoords = polys.flatMap(p => p.coordinates)
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords.map(c => [c.lat, c.lng]))
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }

  // Click handler for drawing
  useEffect(() => {
    if (!mapRef.current || !isDrawing) return
    const map = mapRef.current
    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng
      setCurrentPoints(prev => [...prev, { lat, lng }])
    }
    map.on('click', handleClick)
    return () => { map.off('click', handleClick) }
  }, [isDrawing])

  // Update drawing preview
  useEffect(() => {
    if (!mapRef.current || !isDrawing) return
    const renderPreview = async () => {
      const L = (await import('leaflet')).default
      // Remove previous preview layers
      previewLayersRef.current.forEach(layer => {
        if (mapRef.current) mapRef.current.removeLayer(layer)
      })
      previewLayersRef.current = []
      currentPoints.forEach((point) => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 5, color: '#059669', fillColor: '#059669', fillOpacity: 1,
        }).addTo(mapRef.current)
        previewLayersRef.current.push(marker)
      })
      if (currentPoints.length >= 2) {
        const line = L.polyline(currentPoints.map(p => [p.lat, p.lng]), {
          color: '#059669', weight: 2, dashArray: '5, 5',
        }).addTo(mapRef.current)
        previewLayersRef.current.push(line)
      }
      if (currentPoints.length >= 3) {
        const poly = L.polygon(currentPoints.map(p => [p.lat, p.lng]), {
          color: '#059669', weight: 2, fillColor: '#059669', fillOpacity: 0.15, dashArray: '5, 5',
        }).addTo(mapRef.current)
        previewLayersRef.current.push(poly)
      }
    }
    renderPreview()
  }, [currentPoints, isDrawing])

  const startDrawing = useCallback(() => {
    setIsDrawing(true)
    setCurrentPoints([])
    setSelectedPolygon(null)
    if (mapRef.current) mapRef.current.getContainer().style.cursor = 'crosshair'
    toast.info(t('Nhấn vào bản đồ để tạo các điểm đa giác', 'Click the map to create polygon points'))
  }, [t])

  const finishDrawing = useCallback(() => {
    if (currentPoints.length < 3) {
      toast.error(t('Cần ít nhất 3 điểm', 'Need at least 3 points'))
      return
    }
    setIsDrawing(false)
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = ''
      previewLayersRef.current.forEach(layer => {
        if (mapRef.current) mapRef.current.removeLayer(layer)
      })
      previewLayersRef.current = []
    }
    onPolygonDrawn?.(currentPoints)
    setCurrentPoints([])
  }, [currentPoints, onPolygonDrawn, t])

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false)
    setCurrentPoints([])
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = ''
      previewLayersRef.current.forEach(layer => {
        if (mapRef.current) mapRef.current.removeLayer(layer)
      })
      previewLayersRef.current = []
    }
  }, [])

  const undoLastPoint = useCallback(() => {
    setCurrentPoints(prev => prev.slice(0, -1))
  }, [])

  const handleDelete = useCallback((id: string) => {
    onPolygonDelete?.(id)
    setSelectedPolygon(null)
  }, [onPolygonDelete])

  const handleSave = useCallback(() => {
    onSave?.(polygons)
  }, [polygons, onSave])

  const calculateArea = (coords: PolygonCoordinate[]): number => {
    if (coords.length < 3) return 0
    const R = 6371000
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
    return area / 10000
  }

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
            <span className="text-xs">{t('Đang tải bản đồ...', 'Loading map...')}</span>
          </div>
        </div>
      )}
      {drawMode && mapReady && (
        <div className="absolute top-3 right-3 flex flex-col gap-2" style={{ zIndex: 1000 }}>
          {!isDrawing ? (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl shadow-lg text-xs" onClick={startDrawing}>
              <MapPin className="w-3.5 h-3.5" />
              {t('Vẽ đa giác', 'Draw Polygon')}
            </Button>
          ) : (
            <div className="flex flex-col gap-1.5 bg-card/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-border">
              <div className="text-[10px] text-muted-foreground text-center mb-1">
                {t(`${currentPoints.length} điểm`, `${currentPoints.length} pts`)}
              </div>
              {currentPoints.length >= 3 && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-lg text-[10px] h-7" onClick={finishDrawing}>
                  <Save className="w-3 h-3" /> {t('Hoàn thành', 'Finish')}
                </Button>
              )}
              {currentPoints.length > 0 && (
                <Button size="sm" variant="outline" className="gap-1 rounded-lg text-[10px] h-7" onClick={undoLastPoint}>
                  <Undo2 className="w-3 h-3" /> {t('Hoàn tác', 'Undo')}
                </Button>
              )}
              <Button size="sm" variant="ghost" className="gap-1 rounded-lg text-[10px] h-7 text-red-500" onClick={cancelDrawing}>
                <Trash2 className="w-3 h-3" /> {t('Hủy', 'Cancel')}
              </Button>
            </div>
          )}
        </div>
      )}
      {polygons.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-3 max-w-xs" style={{ zIndex: 1000 }}>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-bold text-foreground">{t('Mảnh đất', 'Land Plots')}</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {polygons.map((poly, i) => (
              <div key={poly.id} className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${selectedPolygon === poly.id ? 'bg-accent' : 'hover:bg-muted/50'}`}
                onClick={() => setSelectedPolygon(poly.id === selectedPolygon ? null : poly.id)}>
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: poly.color || POLYGON_COLORS[i % POLYGON_COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-foreground truncate">{poly.name}</p>
                  {poly.cropType && <p className="text-[9px] text-muted-foreground">{poly.cropType}</p>}
                </div>
                <Badge variant="outline" className="text-[9px] border-0 bg-muted/50 shrink-0">
                  {poly.area ? `${poly.area.toFixed(2)} ha` : `${calculateArea(poly.coordinates).toFixed(2)} ha`}
                </Badge>
                {onPolygonDelete && (
                  <button className="text-muted-foreground hover:text-red-500 transition-colors shrink-0" onClick={(e) => { e.stopPropagation(); handleDelete(poly.id) }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {onSave && polygons.length > 0 && (
        <div className="absolute bottom-3 right-3" style={{ zIndex: 1000 }}>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 rounded-xl shadow-lg text-xs" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" /> {t('Lưu tọa độ', 'Save')}
          </Button>
        </div>
      )}
    </div>
  )
}
