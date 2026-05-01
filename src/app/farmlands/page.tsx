'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, MapPin, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { formatCurrency } from '@/types'
import { FadeIn, TableStaggerTbody, TableStaggerRow, hoverScale, MotionButton } from '@/components/ui/motion'
import { FarmLandMap, type FarmLandPolygon, type PolygonCoordinate } from '@/components/map'

interface FarmerOption {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLand {
  id: string
  farmName: string
  plotBlockId: string | null
  totalLandHolding: number | null
  altitude: number | null
  latitude: number | null
  longitude: number | null
  soilType: string | null
  noOfTrees: number | null
  estYield: number | null
  childLabourPolicy: boolean
  minimumWageCompliance: boolean
  ppeAvailable: boolean
  isActive: boolean
  polygonGeoJson?: string | null
  boundaryArea?: number | null
  geoCenterLat?: number | null
  geoCenterLng?: number | null
  createdAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
}

export default function FarmLandsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const [items, setItems] = useState<FarmLand[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FarmLand | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Dropdown options
  const [farmers, setFarmers] = useState<FarmerOption[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table')
  const [mapPolygons, setMapPolygons] = useState<FarmLandPolygon[]>([])


  // Form state
  const [form, setForm] = useState({
    farmName: '',
    farmerId: '',
    plotBlockId: '',
    totalLandHolding: '',
    altitude: '',
    latitude: '',
    longitude: '',
    landOwnership: '',
    soilType: '',
    waterSource: '',
    noOfTrees: '',
    estYield: '',
    childLabourPolicy: false,
    minimumWageCompliance: false,
    ppeAvailable: false,
    polygonGeoJson: '',
  })

  // Form map polygons for the mini map inside the dialog
  const [formMapPolygons, setFormMapPolygons] = useState<FarmLandPolygon[]>([])

  const resetForm = () => {
    setForm({
      farmName: '', farmerId: '', plotBlockId: '',
      totalLandHolding: '', altitude: '', latitude: '',
      longitude: '', landOwnership: '', soilType: '',
      waterSource: '', noOfTrees: '', estYield: '',
      childLabourPolicy: false, minimumWageCompliance: false,
      ppeAvailable: false, polygonGeoJson: '',
    })
    setEditingItem(null)
    setFormMapPolygons([])
  }

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      const res = await fetch(`/api/farmlands?${params}`)
      const data = await res.json()
      if (data.success) {
        const itemsArr = data.data?.data ?? data.data?.items ?? []
        setItems(Array.isArray(itemsArr) ? itemsArr : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch farmlands', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  // Convert farmland items to map polygons for the map view
  useEffect(() => {
    const polys: FarmLandPolygon[] = items
      .filter(item => item.latitude && item.longitude)
      .map((item, i) => {
        // Parse existing polygonGeoJson if available
        let coords: PolygonCoordinate[] = []
        if (item.polygonGeoJson) {
          try {
            const geojson = JSON.parse(item.polygonGeoJson)
            coords = (geojson.coordinates?.[0] || []).map((c: number[]) => ({ lat: c[1], lng: c[0] }))
          } catch {}
        }
        // Fallback: create a small polygon around the center point
        if (coords.length < 3 && item.latitude && item.longitude) {
          const d = 0.001 // ~100m offset
          coords = [
            { lat: item.latitude - d, lng: item.longitude - d },
            { lat: item.latitude - d, lng: item.longitude + d },
            { lat: item.latitude + d, lng: item.longitude + d },
            { lat: item.latitude + d, lng: item.longitude - d },
          ]
        }
        return {
          id: item.id,
          name: item.farmName,
          coordinates: coords,
          color: ['#059669', '#d97706', '#2563eb', '#7c3aed', '#0891b2'][i % 5],
          cropType: item.soilType || undefined,
        }
      })
    setMapPolygons(polys)
  }, [items])

  const fetchFarmers = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=500&sortBy=fullName&sortOrder=asc')
      const data = await res.json()
      if (data.success) {
        setFarmers((data.data?.data ?? data.data?.farmers ?? []).map((f: any) => ({ id: f.id, fullName: f.fullName, farmerCode: f.farmerCode })))
      }
    } catch (err) {
      console.error('Failed to fetch farmers', err)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchItems()
      fetchFarmers()
    }
  }, [status, router, fetchItems, fetchFarmers])

  const handleEdit = (item: FarmLand) => {
    setEditingItem(item)
    setForm({
      farmName: item.farmName,
      farmerId: item.farmer.id,
      plotBlockId: item.plotBlockId || '',
      totalLandHolding: item.totalLandHolding?.toString() || '',
      altitude: item.altitude?.toString() || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
      landOwnership: '',
      soilType: item.soilType || '',
      waterSource: '',
      noOfTrees: item.noOfTrees?.toString() || '',
      estYield: item.estYield?.toString() || '',
      childLabourPolicy: item.childLabourPolicy,
      minimumWageCompliance: item.minimumWageCompliance,
      ppeAvailable: item.ppeAvailable,
      polygonGeoJson: item.polygonGeoJson || '',
    })
    // Build polygon for the form mini map when editing
    if (item.polygonGeoJson) {
      try {
        const geojson = JSON.parse(item.polygonGeoJson)
        const coords: PolygonCoordinate[] = (geojson.coordinates?.[0] || []).map((c: number[]) => ({ lat: c[1], lng: c[0] }))
        if (coords.length >= 3) {
          setFormMapPolygons([{ id: item.id, name: item.farmName, coordinates: coords.slice(0, -1), color: '#059669' }])
        } else {
          setFormMapPolygons([])
        }
      } catch {
        setFormMapPolygons([])
      }
    } else {
      setFormMapPolygons([])
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmName || !form.farmerId) {
      toast.error(t2('Vui lòng điền các trường bắt buộc', 'Please fill required fields'))
      return
    }
    setSubmitting(true)
    try {
      // Compute geo center from polygon if available
      let geoCenterLat: number | undefined
      let geoCenterLng: number | undefined
      let boundaryArea: number | undefined
      if (form.polygonGeoJson) {
        try {
          const geojson = JSON.parse(form.polygonGeoJson)
          const ring: number[][] = geojson.coordinates?.[0] || []
          const points = ring.slice(0, -1) // remove closing point
          if (points.length >= 3) {
            geoCenterLat = points.reduce((s: number, c: number[]) => s + c[1], 0) / points.length
            geoCenterLng = points.reduce((s: number, c: number[]) => s + c[0], 0) / points.length
            // Calculate area using spherical excess
            const R = 6371000
            let area = 0
            for (let i = 0; i < points.length; i++) {
              const j = (i + 1) % points.length
              const lat1 = (points[i][1] * Math.PI) / 180
              const lat2 = (points[j][1] * Math.PI) / 180
              const lng1 = (points[i][0] * Math.PI) / 180
              const lng2 = (points[j][0] * Math.PI) / 180
              area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
            }
            boundaryArea = Math.abs((area * R * R) / 2) / 10000 // hectares
          }
        } catch { /* ignore parse errors */ }
      }

      const payload = {
        ...form,
        totalLandHolding: form.totalLandHolding ? parseFloat(form.totalLandHolding) : undefined,
        altitude: form.altitude ? parseFloat(form.altitude) : undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        noOfTrees: form.noOfTrees ? parseInt(form.noOfTrees) : undefined,
        estYield: form.estYield ? parseFloat(form.estYield) : undefined,
        boundaryArea,
        geoCenterLat,
        geoCenterLng,
      }

      const url = editingItem ? '/api/farmlands' : '/api/farmlands'
      const method = editingItem ? 'PUT' : 'POST'
      if (editingItem) {
        (payload as any).id = editingItem.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingItem ? t2('Cập nhật thành công!', 'Updated successfully!') : t2('Tạo đất nông trại thành công!', 'Farm land created!'))
        setDialogOpen(false)
        resetForm()
        fetchItems()
      } else {
        toast.error(data.error || t2('Lỗi khi lưu', 'Error saving'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/farmlands?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t2('Xóa thành công!', 'Deleted successfully!'))
        fetchItems()
      } else {
        toast.error(data.error || t2('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    }
    setDeleteConfirm(null)
  }

  const totalPages = Math.ceil(total / pageSize)

  if (status === 'loading' || (loading && items.length === 0)) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Coffee className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div>
        {/* Header */}
        <FadeIn>
          <div className="flex flex-row items-center justify-between gap-3 mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="truncate">{t2('Quản lý Đất nông trại', 'Farm Land Management')}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{t(`Tổng số: ${total} mảnh đất`, `Total: ${total} farm lands`)}</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <MotionButton
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 rounded-xl shadow-md h-9 px-3 sm:px-4 text-xs font-medium cursor-pointer shrink-0"
                  onClick={() => { resetForm(); setDialogOpen(true) }}
                  {...hoverScale}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{t2('Thêm đất', 'Add Land')}</span>
                  <span className="sm:hidden">{t2('Thêm', 'Add')}</span>
                </MotionButton>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {editingItem ? t2('Sửa thông tin đất', 'Edit Farm Land') : t2('Thêm đất nông trại mới', 'Add New Farm Land')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Farm Name */}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs text-foreground">{t2('Tên nông trại', 'Farm Name')} *</Label>
                      <Input
                        value={form.farmName}
                        onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                        placeholder={t2('Nhập tên nông trại', 'Enter farm name')}
                        className="rounded-xl border-input focus:border-primary"
                        required
                      />
                    </div>

                    {/* Farmer Select */}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs text-foreground">{t2('Nông dân', 'Farmer')} *</Label>
                      <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v })}>
                        <SelectTrigger className="rounded-xl border-input">
                          <SelectValue placeholder={t2('Chọn nông dân', 'Select farmer')} />
                        </SelectTrigger>
                        <SelectContent>
                          {farmers.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Plot Block ID */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Mã lô đất', 'Plot Block ID')}</Label>
                      <Input
                        value={form.plotBlockId}
                        onChange={(e) => setForm({ ...form, plotBlockId: e.target.value })}
                        placeholder={t2('PB-001', 'PB-001')}
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Total Land Holding */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Diện tích (ha)', 'Area (ha)')}</Label>
                      <Input
                        type="number"
                        value={form.totalLandHolding}
                        onChange={(e) => setForm({ ...form, totalLandHolding: e.target.value })}
                        placeholder="2.5"
                        step="0.1"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Altitude */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Độ cao (m)', 'Altitude (m)')}</Label>
                      <Input
                        type="number"
                        value={form.altitude}
                        onChange={(e) => setForm({ ...form, altitude: e.target.value })}
                        placeholder="1200"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Latitude */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Vĩ độ', 'Latitude')}</Label>
                      <Input
                        type="number"
                        value={form.latitude}
                        onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                        placeholder="12.2345"
                        step="0.0001"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Longitude */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Kinh độ', 'Longitude')}</Label>
                      <Input
                        type="number"
                        value={form.longitude}
                        onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                        placeholder="108.4567"
                        step="0.0001"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Land Ownership */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Quyền sở hữu', 'Land Ownership')}</Label>
                      <Select value={form.landOwnership} onValueChange={(v) => setForm({ ...form, landOwnership: v })}>
                        <SelectTrigger className="rounded-xl border-input">
                          <SelectValue placeholder={t2('Chọn...', 'Select...')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owned">{t2('Sở hữu', 'Owned')}</SelectItem>
                          <SelectItem value="leased">{t2('Thuê', 'Leased')}</SelectItem>
                          <SelectItem value="shared">{t2('Chung', 'Shared')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Soil Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Loại đất', 'Soil Type')}</Label>
                      <Select value={form.soilType} onValueChange={(v) => setForm({ ...form, soilType: v })}>
                        <SelectTrigger className="rounded-xl border-input">
                          <SelectValue placeholder={t2('Chọn loại đất', 'Select soil type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basalt (Đỏ bazan)">{t2('Đỏ bazan', 'Basalt Red')}</SelectItem>
                          <SelectItem value="Sandy (Cát)">{t2('Cát', 'Sandy')}</SelectItem>
                          <SelectItem value="Clay (Đất sét)">{t2('Đất sét', 'Clay')}</SelectItem>
                          <SelectItem value="Loam (Đất thịt)">{t2('Đất thịt', 'Loam')}</SelectItem>
                          <SelectItem value="Volcanic (Đất núi lửa)">{t2('Đất núi lửa', 'Volcanic')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Water Source */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Nguồn nước', 'Water Source')}</Label>
                      <Select value={form.waterSource} onValueChange={(v) => setForm({ ...form, waterSource: v })}>
                        <SelectTrigger className="rounded-xl border-input">
                          <SelectValue placeholder={t2('Chọn nguồn nước', 'Select water source')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rainfed">{t2('Tưới tự nhiên', 'Rainfed')}</SelectItem>
                          <SelectItem value="irrigation">{t2('Tưới tiêu', 'Irrigation')}</SelectItem>
                          <SelectItem value="well">{t2('Giếng', 'Well')}</SelectItem>
                          <SelectItem value="river">{t2('Sông/Suối', 'River/Stream')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* No of Trees */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Số cây', 'Trees')}</Label>
                      <Input
                        type="number"
                        value={form.noOfTrees}
                        onChange={(e) => setForm({ ...form, noOfTrees: e.target.value })}
                        placeholder="1200"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Est Yield */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t2('Sản lượng ước (kg)', 'Est. Yield (kg)')}</Label>
                      <Input
                        type="number"
                        value={form.estYield}
                        onChange={(e) => setForm({ ...form, estYield: e.target.value })}
                        placeholder="3500"
                        step="0.1"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="childLabourPolicy"
                        checked={form.childLabourPolicy}
                        onCheckedChange={(v) => setForm({ ...form, childLabourPolicy: !!v })}
                      />
                      <Label htmlFor="childLabourPolicy" className="text-xs text-foreground">{t2('Không lao động trẻ em', 'No Child Labour')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="minimumWageCompliance"
                        checked={form.minimumWageCompliance}
                        onCheckedChange={(v) => setForm({ ...form, minimumWageCompliance: !!v })}
                      />
                      <Label htmlFor="minimumWageCompliance" className="text-xs text-foreground">{t2('Tuân thủ lương tối thiểu', 'Min Wage Compliance')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="ppeAvailable"
                        checked={form.ppeAvailable}
                        onCheckedChange={(v) => setForm({ ...form, ppeAvailable: !!v })}
                      />
                      <Label htmlFor="ppeAvailable" className="text-xs text-foreground">{t2('Có đồ bảo hộ', 'PPE Available')}</Label>
                    </div>
                  </div>

                  {/* Draw Boundary on Map */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <Label className="text-xs font-medium text-foreground">
                        {t2('Vẽ ranh giới trên bản đồ', 'Draw boundary on map')}
                      </Label>
                      {form.polygonGeoJson && (
                        <Badge className="bg-green-100 text-green-700 text-[9px] border-0">
                          {t2('Da giac da ve', 'Polygon drawn')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {t2(
                        'Nhan "Ve da giac" roi nhan vao ban do de tao cac diem. It nhat 3 diem de tao da giac.',
                        'Click "Draw Polygon" then click on the map to place points. At least 3 points required.'
                      )}
                    </p>
                    <FarmLandMap
                      center={form.latitude && form.longitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : [12.668, 108.038]}
                      zoom={14}
                      polygons={formMapPolygons}
                      drawMode={true}
                      lang={lang}
                      height="280px"
                      onPolygonDrawn={(coords) => {
                        // Store the polygon coordinates as GeoJSON
                        const geoJson = {
                          type: 'Polygon' as const,
                          coordinates: [coords.map(c => [c.lng, c.lat] as [number, number]).concat([[coords[0].lng, coords[0].lat]] as [number, number][])],
                        }
                        // Calculate center point from polygon
                        const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length
                        const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length
                        setFormMapPolygons([{ id: 'form-polygon', name: form.farmName || t2('Dat moi', 'New Land'), coordinates: coords, color: '#059669' }])
                        setForm(f => ({
                          ...f,
                          polygonGeoJson: JSON.stringify(geoJson),
                          latitude: centerLat.toFixed(6),
                          longitude: centerLng.toFixed(6),
                        }))
                        toast.success(t2('Ranh gioi da duoc ve thanh cong!', 'Boundary drawn successfully!'))
                      }}
                      onPolygonDelete={() => {
                        setFormMapPolygons([])
                        setForm(f => ({ ...f, polygonGeoJson: '' }))
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                      {t2('Hủy', 'Cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t2('Đang lưu...', 'Saving...')}
                        </>
                      ) : (
                        editingItem ? t2('Cập nhật', 'Update') : t2('Tạo mới', 'Create')
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Search */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder={t2('Tìm kiếm đất nông trại...', 'Search farm lands...')}
                className="pl-9 rounded-xl border-input focus:border-primary bg-background"
              />
            </div>
            <Badge variant="outline" className="border-border text-muted-foreground text-xs">
              {t(`${total} bản ghi`, `${total} records`)}
            </Badge>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2.5 text-[10px] rounded-md"
                onClick={() => setViewMode('table')}
              >
                {t2('Bảng', 'Table')}
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2.5 text-[10px] rounded-md gap-1"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="w-3 h-3" />
                {t2('Bản đồ', 'Map')}
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Table or Map View */}
        <FadeIn delay={0.2}>
          {viewMode === 'map' ? (
            <Card className="rounded-2xl border-0 shadow-sm p-4">
              <FarmLandMap
                center={[12.668, 108.038]}
                zoom={13}
                polygons={mapPolygons}
                drawMode={true}
                lang={lang}
                height="500px"
                onPolygonDrawn={(coords) => {
                  // Store the polygon coordinates as GeoJSON for the form
                  const geoJson = {
                    type: 'Polygon',
                    coordinates: [coords.map(c => [c.lng, c.lat]).concat([[coords[0].lng, coords[0].lat]])],
                  }
                  setForm(f => ({ ...f, polygonGeoJson: JSON.stringify(geoJson) }))
                  toast.success(t2('Đa giác đã được vẽ! Mở form để lưu.', 'Polygon drawn! Open form to save.'))
                }}
                onPolygonDelete={(id) => {
                  setMapPolygons(prev => prev.filter(p => p.id !== id))
                }}
                onSave={(polys) => {
                  toast.success(t2('Tọa độ đã được cập nhật', 'Coordinates updated'))
                }}
              />
            </Card>
          ) : (
          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Tên nông trại', 'Farm Name')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Nông dân', 'Farmer')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Mã lô', 'Plot ID')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Diện tích', 'Area (ha)')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Độ cao', 'Altitude')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Loại đất', 'Soil')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Số cây', 'Trees')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">{t2('SL ước', 'Est. Yield')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Hành động', 'Actions')}</th>
                  </tr>
                </thead>
                <TableStaggerTbody>
                  {items.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                          {t2('Không tìm thấy dữ liệu', 'No data found')}
                        </td>
                      </tr>
                    ) : (
                        <>
                        {items.map((item) => (
                          <TableStaggerRow key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-xs font-medium text-foreground">{item.farmName}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs text-foreground">{item.farmer.fullName}</p>
                                <p className="text-[10px] text-muted-foreground">{item.farmer.farmerCode || ''}</p>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{item.plotBlockId || '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.totalLandHolding ? `${item.totalLandHolding} ha` : '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.altitude ? `${item.altitude}m` : '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.soilType || '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.noOfTrees?.toLocaleString() || '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">{item.estYield ? `${item.estYield.toLocaleString()} kg` : '-'}</td>
                              <td className="px-4 py-3">
                                <Badge className={`${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
                                  {item.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(item)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  {deleteConfirm === item.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-red-600 text-[10px]" onClick={() => handleDelete(item.id)}>
                                        {t2('Xóa', 'Del')}
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-muted-foreground text-[10px]" onClick={() => setDeleteConfirm(null)}>
                                        {t2('Hủy', 'No')}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setDeleteConfirm(item.id)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </TableStaggerRow>
                        ))}
                        </>
                    )}
                </TableStaggerTbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground">
                {t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 w-7 p-0 rounded-lg border-border"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                    >
                      {p}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-7 w-7 p-0 rounded-lg border-border"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </Card>
          )}
        </FadeIn>
      </div>
    </DashboardShell>
  )
}
