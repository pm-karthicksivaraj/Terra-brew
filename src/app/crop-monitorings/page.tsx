'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Eye, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, AlertTriangle, Bell,
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

interface FarmerOption {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLandOption {
  id: string
  farmName: string
  farmerId: string
}

interface CropMonitoring {
  id: string
  monitoringDate: string | null
  monitoringType: string | null
  growthStage: string | null
  plantHeight: number | null
  canopyDiameter: number | null
  leafColor: string | null
  healthScore: number | null
  pestPressure: string | null
  diseaseSymptoms: string | null
  weatherCondition: string | null
  temperature: number | null
  rainfall: number | null
  humidity: number | null
  soilMoisture: number | null
  alertTriggered: boolean
  alertType: string | null
  alertSeverity: string | null
  remedialAction: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null }
}

export default function CropMonitoringsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const [items, setItems] = useState<CropMonitoring[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CropMonitoring | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Alert filter tab
  const [alertFilter, setAlertFilter] = useState<'all' | 'alerts'>('all')

  const [farmers, setFarmers] = useState<FarmerOption[]>([])
  const [farmLands, setFarmLands] = useState<FarmLandOption[]>([])


  const [form, setForm] = useState({
    farmerId: '',
    farmLandId: '',
    monitoringDate: '',
    monitoringType: '',
    growthStage: '',
    plantHeight: '',
    canopyDiameter: '',
    leafColor: '',
    healthScore: '',
    pestPressure: '',
    diseaseSymptoms: '',
    weatherCondition: '',
    temperature: '',
    rainfall: '',
    humidity: '',
    soilMoisture: '',
    alertTriggered: false,
    alertType: '',
    alertSeverity: '',
    remedialAction: '',
    notes: '',
  })

  const resetForm = () => {
    setForm({
      farmerId: '', farmLandId: '', monitoringDate: '',
      monitoringType: '', growthStage: '', plantHeight: '',
      canopyDiameter: '', leafColor: '', healthScore: '',
      pestPressure: '', diseaseSymptoms: '', weatherCondition: '',
      temperature: '', rainfall: '', humidity: '',
      soilMoisture: '', alertTriggered: false, alertType: '',
      alertSeverity: '', remedialAction: '', notes: '',
    })
    setEditingItem(null)
  }

  const filteredFarmLands = useMemo(() => {
    if (!form.farmerId) return farmLands
    return farmLands.filter((fl) => fl.farmerId === form.farmerId)
  }, [farmLands, form.farmerId])

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
      if (alertFilter === 'alerts') {
        params.set('alertTriggered', 'true')
      }
      const res = await fetch(`/api/crop-monitorings?${params}`)
      const data = await res.json()
      if (data.success) {
        const _items = data.data?.data ?? data.data?.items ?? []; setItems(Array.isArray(_items) ? _items : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch crop monitorings', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, alertFilter])

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

  const fetchFarmLands = useCallback(async () => {
    try {
      const res = await fetch('/api/farmlands?pageSize=500&sortBy=farmName&sortOrder=asc')
      const data = await res.json()
      if (data.success) {
        setFarmLands((data.data?.data ?? []).map((fl: any) => ({ id: fl.id, farmName: fl.farmName, farmerId: fl.farmerId })))
      }
    } catch (err) {
      console.error('Failed to fetch farmlands', err)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchItems()
      fetchFarmers()
      fetchFarmLands()
    }
  }, [status, router, fetchItems, fetchFarmers, fetchFarmLands])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [alertFilter])

  useEffect(() => {
    if (form.farmerId && form.farmLandId) {
      const belongs = farmLands.find((fl) => fl.id === form.farmLandId && fl.farmerId === form.farmerId)
      if (!belongs) setForm((prev) => ({ ...prev, farmLandId: '' }))
    }
  }, [form.farmerId, form.farmLandId, farmLands])

  const handleEdit = (item: CropMonitoring) => {
    setEditingItem(item)
    setForm({
      farmerId: item.farmer.id,
      farmLandId: item.farmLand.id,
      monitoringDate: item.monitoringDate ? item.monitoringDate.split('T')[0] : '',
      monitoringType: item.monitoringType || '',
      growthStage: item.growthStage || '',
      plantHeight: item.plantHeight?.toString() || '',
      canopyDiameter: item.canopyDiameter?.toString() || '',
      leafColor: item.leafColor || '',
      healthScore: item.healthScore?.toString() || '',
      pestPressure: item.pestPressure || '',
      diseaseSymptoms: item.diseaseSymptoms || '',
      weatherCondition: item.weatherCondition || '',
      temperature: item.temperature?.toString() || '',
      rainfall: item.rainfall?.toString() || '',
      humidity: item.humidity?.toString() || '',
      soilMoisture: item.soilMoisture?.toString() || '',
      alertTriggered: item.alertTriggered,
      alertType: item.alertType || '',
      alertSeverity: item.alertSeverity || '',
      remedialAction: item.remedialAction || '',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmerId || !form.farmLandId) {
      toast.error(t2('Vui lòng điền các trường bắt buộc', 'Please fill required fields'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        plantHeight: form.plantHeight ? parseFloat(form.plantHeight) : undefined,
        canopyDiameter: form.canopyDiameter ? parseFloat(form.canopyDiameter) : undefined,
        healthScore: form.healthScore ? parseFloat(form.healthScore) : undefined,
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        rainfall: form.rainfall ? parseFloat(form.rainfall) : undefined,
        humidity: form.humidity ? parseFloat(form.humidity) : undefined,
        soilMoisture: form.soilMoisture ? parseFloat(form.soilMoisture) : undefined,
        monitoringDate: form.monitoringDate || undefined,
      }

      const url = '/api/crop-monitorings'
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
        toast.success(editingItem ? t2('Cập nhật thành công!', 'Updated successfully!') : t2('Tạo giám sát thành công!', 'Crop monitoring created!'))
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
      const res = await fetch(`/api/crop-monitorings?id=${id}`, { method: 'DELETE' })
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

  const getAlertBadge = (severity: string | null) => {
    if (!severity) return null
    const colors: Record<string, string> = {
      'critical': 'bg-red-100 text-red-700 border-red-200',
      'warning': 'bg-orange-100 text-orange-700 border-orange-200',
      'info': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'low': 'bg-blue-100 text-blue-700 border-blue-200',
    }
    return (
      <Badge className={`${colors[severity] || 'bg-muted text-foreground'} text-[10px] border`}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        {severity}
      </Badge>
    )
  }

  const getHealthScoreColor = (score: number | null) => {
    if (score === null) return 'bg-muted'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-muted-foreground" />
              {t2('Quản lý Giám sát cây trồng', 'Crop Monitoring Management')}
            </h2>
            <p className="text-sm text-muted-foreground">{t(`Tổng số: ${total} bản ghi`, `Total: ${total} records`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t2('Thêm giám sát', 'Add Monitoring')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {editingItem ? t2('Sửa giám sát', 'Edit Monitoring') : t2('Thêm giám sát mới', 'Add New Monitoring')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nông dân', 'Farmer')} *</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn nông dân', 'Select farmer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Land */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Đất nông trại', 'Farm Land')} *</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })} disabled={!form.farmerId}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn đất', 'Select farm land')} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredFarmLands.map((fl) => (
                          <SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monitoring Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Ngày giám sát', 'Monitoring Date')}</Label>
                    <Input type="date" value={form.monitoringDate} onChange={(e) => setForm({ ...form, monitoringDate: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Monitoring Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Loại giám sát', 'Monitoring Type')}</Label>
                    <Select value={form.monitoringType} onValueChange={(v) => setForm({ ...form, monitoringType: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn loại', 'Select type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">{t2('Định kỳ', 'Routine')}</SelectItem>
                        <SelectItem value="pest_survey">{t2('Khảo sát sâu bệnh', 'Pest Survey')}</SelectItem>
                        <SelectItem value="disease_check">{t2('Kiểm tra bệnh', 'Disease Check')}</SelectItem>
                        <SelectItem value="growth_assessment">{t2('Đánh giá tăng trưởng', 'Growth Assessment')}</SelectItem>
                        <SelectItem value="soil_analysis">{t2('Phân tích đất', 'Soil Analysis')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Growth Stage */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Giai đoạn sinh trưởng', 'Growth Stage')}</Label>
                    <Select value={form.growthStage} onValueChange={(v) => setForm({ ...form, growthStage: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn giai đoạn', 'Select stage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seedling">{t2('Cây giống', 'Seedling')}</SelectItem>
                        <SelectItem value="vegetative">{t2('Sinh dưỡng', 'Vegetative')}</SelectItem>
                        <SelectItem value="flowering">{t2('Ra hoa', 'Flowering')}</SelectItem>
                        <SelectItem value="fruiting">{t2('Đậu quả', 'Fruiting')}</SelectItem>
                        <SelectItem value="ripening">{t2('Chín', 'Ripening')}</SelectItem>
                        <SelectItem value="harvested">{t2('Đã thu hoạch', 'Harvested')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Plant Height */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Chiều cao cây (cm)', 'Plant Height (cm)')}</Label>
                    <Input type="number" value={form.plantHeight} onChange={(e) => setForm({ ...form, plantHeight: e.target.value })} placeholder="150" step="0.1" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Canopy Diameter */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Đường kính tán (cm)', 'Canopy Diameter (cm)')}</Label>
                    <Input type="number" value={form.canopyDiameter} onChange={(e) => setForm({ ...form, canopyDiameter: e.target.value })} placeholder="120" step="0.1" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Leaf Color */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Màu lá', 'Leaf Color')}</Label>
                    <Select value={form.leafColor} onValueChange={(v) => setForm({ ...form, leafColor: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn màu', 'Select color')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark_green">{t2('Xanh đậm', 'Dark Green')}</SelectItem>
                        <SelectItem value="green">{t2('Xanh', 'Green')}</SelectItem>
                        <SelectItem value="light_green">{t2('Xanh nhạt', 'Light Green')}</SelectItem>
                        <SelectItem value="yellowish">{t2('Vàng', 'Yellowish')}</SelectItem>
                        <SelectItem value="brown_spots">{t2('Đốm nâu', 'Brown Spots')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Health Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Điểm sức khỏe', 'Health Score')}</Label>
                    <Input type="number" value={form.healthScore} onChange={(e) => setForm({ ...form, healthScore: e.target.value })} placeholder="85" min="0" max="100" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Pest Pressure */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Áp lực sâu bệnh', 'Pest Pressure')}</Label>
                    <Select value={form.pestPressure} onValueChange={(v) => setForm({ ...form, pestPressure: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn mức', 'Select level')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t2('Không', 'None')}</SelectItem>
                        <SelectItem value="low">{t2('Thấp', 'Low')}</SelectItem>
                        <SelectItem value="moderate">{t2('Trung bình', 'Moderate')}</SelectItem>
                        <SelectItem value="high">{t2('Cao', 'High')}</SelectItem>
                        <SelectItem value="severe">{t2('Nghiêm trọng', 'Severe')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Disease Symptoms */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Triệu chứng bệnh', 'Disease Symptoms')}</Label>
                    <Input value={form.diseaseSymptoms} onChange={(e) => setForm({ ...form, diseaseSymptoms: e.target.value })} placeholder={t2('Mô tả triệu chứng', 'Describe symptoms')} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Weather Condition */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Thời tiết', 'Weather Condition')}</Label>
                    <Select value={form.weatherCondition} onValueChange={(v) => setForm({ ...form, weatherCondition: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn thời tiết', 'Select weather')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunny">{t2('Nắng', 'Sunny')}</SelectItem>
                        <SelectItem value="cloudy">{t2('Nhiều mây', 'Cloudy')}</SelectItem>
                        <SelectItem value="rainy">{t2('Mưa', 'Rainy')}</SelectItem>
                        <SelectItem value="dry">{t2('Khô', 'Dry')}</SelectItem>
                        <SelectItem value="foggy">{t2('Sương mù', 'Foggy')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nhiệt độ (°C)', 'Temperature (°C)')}</Label>
                    <Input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="25" step="0.1" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Rainfall */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Lượng mưa (mm)', 'Rainfall (mm)')}</Label>
                    <Input type="number" value={form.rainfall} onChange={(e) => setForm({ ...form, rainfall: e.target.value })} placeholder="120" step="0.1" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Humidity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Độ ẩm (%)', 'Humidity (%)')}</Label>
                    <Input type="number" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} placeholder="75" step="0.1" min="0" max="100" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Soil Moisture */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Độ ẩm đất (%)', 'Soil Moisture (%)')}</Label>
                    <Input type="number" value={form.soilMoisture} onChange={(e) => setForm({ ...form, soilMoisture: e.target.value })} placeholder="45" step="0.1" min="0" max="100" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Alert section */}
                  <div className="md:col-span-2 border-t border-border pt-3 mt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <Label className="text-xs font-semibold text-foreground">{t2('Cảnh báo', 'Alert Configuration')}</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Alert Triggered */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="alertTriggered"
                          checked={form.alertTriggered}
                          onCheckedChange={(v) => setForm({ ...form, alertTriggered: !!v })}
                        />
                        <Label htmlFor="alertTriggered" className="text-xs text-foreground">{t2('Kích hoạt cảnh báo', 'Alert Triggered')}</Label>
                      </div>
                      <div /> {/* spacer */}

                      {/* Alert Type */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-foreground">{t2('Loại cảnh báo', 'Alert Type')}</Label>
                        <Select value={form.alertType} onValueChange={(v) => setForm({ ...form, alertType: v })} disabled={!form.alertTriggered}>
                          <SelectTrigger className="rounded-xl border-input">
                            <SelectValue placeholder={t2('Chọn loại', 'Select type')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pest">{t2('Sâu bệnh', 'Pest')}</SelectItem>
                            <SelectItem value="disease">{t2('Bệnh', 'Disease')}</SelectItem>
                            <SelectItem value="nutrient">{t2('Thiếu dinh dưỡng', 'Nutrient Deficiency')}</SelectItem>
                            <SelectItem value="water_stress">{t2('Thiếu nước', 'Water Stress')}</SelectItem>
                            <SelectItem value="temperature">{t2('Nhiệt độ', 'Temperature')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Alert Severity */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-foreground">{t2('Mức độ', 'Severity')}</Label>
                        <Select value={form.alertSeverity} onValueChange={(v) => setForm({ ...form, alertSeverity: v })} disabled={!form.alertTriggered}>
                          <SelectTrigger className="rounded-xl border-input">
                            <SelectValue placeholder={t2('Chọn mức', 'Select severity')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">{t2('Thông tin', 'Info')}</SelectItem>
                            <SelectItem value="warning">{t2('Cảnh báo', 'Warning')}</SelectItem>
                            <SelectItem value="critical">{t2('Nghiêm trọng', 'Critical')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Remedial Action */}
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs text-foreground">{t2('Hành động khắc phục', 'Remedial Action')}</Label>
                        <Input value={form.remedialAction} onChange={(e) => setForm({ ...form, remedialAction: e.target.value })} placeholder={t2('Mô tả hành động', 'Describe action taken')} className="rounded-xl border-input focus:border-primary" disabled={!form.alertTriggered} />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Ghi chú', 'Notes')}</Label>
                    <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t2('Ghi chú thêm', 'Additional notes')} className="rounded-xl border-input focus:border-primary" />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                    {t2('Hủy', 'Cancel')}
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang lưu...', 'Saving...')}</>
                    ) : (
                      editingItem ? t2('Cập nhật', 'Update') : t2('Tạo mới', 'Create')
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search + Alert Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t2('Tìm kiếm giám sát...', 'Search crop monitorings...')}
              className="pl-9 rounded-xl border-input focus:border-primary bg-background"
            />
          </div>

          {/* Alert filter tabs */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlertFilter('all')}
              className={`h-7 px-3 text-[10px] rounded-lg ${alertFilter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t2('Tất cả', 'All')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlertFilter('alerts')}
              className={`h-7 px-3 text-[10px] rounded-lg gap-1 ${alertFilter === 'alerts' ? 'bg-background text-orange-700 shadow-sm' : 'text-muted-foreground hover:text-orange-600'}`}
            >
              <AlertTriangle className="w-3 h-3" />
              {t2('Cảnh báo', 'Alerts')}
            </Button>
          </div>

          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            {t(`${total} bản ghi`, `${total} records`)}
          </Badge>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Nông trại', 'Farm Land')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Ngày', 'Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Giai đoạn', 'Growth Stage')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Điểm SK', 'Health')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Cảnh báo', 'Alert')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">{t2('Mức độ', 'Severity')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Hành động', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        {alertFilter === 'alerts' ? t2('Không có cảnh báo nào', 'No alerts found') : t2('Không tìm thấy dữ liệu', 'No data found')}
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={item.id}
 className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${item.alertTriggered ? 'bg-orange-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{item.farmer.fullName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.farmLand.farmName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.monitoringDate ? new Date(item.monitoringDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.monitoringType || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.growthStage || '-'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {item.healthScore !== null ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getHealthScoreColor(item.healthScore)}`} style={{ width: `${item.healthScore}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{item.healthScore}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {item.alertTriggered ? (
                            <Badge className="bg-orange-100 text-orange-700 text-[10px] border border-orange-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {item.alertType || t2('Có', 'Yes')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-border text-muted-foreground">{t2('Không', 'No')}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          {getAlertBadge(item.alertSeverity)}
                        </td>
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
                      </tr>
                    ))
                  )}
</tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground">
                {t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0 rounded-lg border-input">
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return (
                    <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-primary text-primary-foreground' : 'text-border text-muted-foreground'}`}>
                      {p}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0 rounded-lg border-input">
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
