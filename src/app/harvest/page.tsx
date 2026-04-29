'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Wheat, Search, Plus, ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, AlertTriangle, Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface Farmer {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLand {
  id: string
  farmName: string
  plotBlockId: string | null
  farmerId: string
}

interface HarvestRecord {
  id: string
  farmerId: string
  farmLandId: string
  plannedHarvestDate: string | null
  plotBlockId: string | null
  coffeeVariety: string | null
  estimatedYield: string | null
  actualHarvestDate: string | null
  harvestMethod: string | null
  cherryRipeness: number | null
  harvestLabourCost: number | null
  sampleWeight: number | null
  sampleArea: number | null
  sampleYield: number | null
  estimatedYieldPerHa: number | null
  processingMethod: string | null
  dryingMethod: string | null
  dryingDurationDays: number | null
  targetMoisture: number | null
  moistureContent: number | null
  defectiveBeans: number | null
  foreignMatter: number | null
  cupScore: number | null
  batchId: string | null
  coffeeVarietyAtBatch: string | null
  processingStage: string | null
  batchNotes: string | null
  isActive: boolean
  farmer: Farmer
  farmLand: FarmLand
}

const initialForm = {
  farmerId: '',
  farmLandId: '',
  plannedHarvestDate: '',
  plotBlockId: '',
  coffeeVariety: '',
  estimatedYield: '',
  actualHarvestDate: '',
  harvestMethod: '',
  cherryRipeness: '',
  harvestLabourCost: '',
  sampleWeight: '',
  sampleArea: '',
  sampleYield: '',
  estimatedYieldPerHa: '',
  processingMethod: '',
  dryingMethod: '',
  dryingDurationDays: '',
  targetMoisture: '',
  moistureContent: '',
  defectiveBeans: '',
  foreignMatter: '',
  cupScore: '',
  batchId: '',
  coffeeVarietyAtBatch: '',
  processingStage: '',
  batchNotes: '',
}

export default function HarvestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [records, setRecords] = useState<HarvestRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [batchIdSearch, setBatchIdSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<HarvestRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<HarvestRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)

  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [farmLands, setFarmLands] = useState<FarmLand[]>([])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const resetForm = () => { setForm(initialForm); setEditingRecord(null) }

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      if (batchIdSearch) params.set('batchId', batchIdSearch)
      const res = await fetch(`/api/harvest-traceabilities?${params}`)
      const data = await res.json()
      if (data.success) {
        const _records = data.data?.data ?? data.data?.items ?? []; setRecords(Array.isArray(_records) ? _records : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch records', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, batchIdSearch])

  const fetchFarmers = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=1000')
      const data = await res.json()
      if (data.success) setFarmers(data.data?.data ?? data.data?.farmers ?? [])
    } catch { /* ignore */ }
  }, [])

  const fetchFarmLands = useCallback(async (farmerId?: string) => {
    try {
      const params = new URLSearchParams({ pageSize: '1000' })
      if (farmerId) params.set('farmerId', farmerId)
      const res = await fetch(`/api/farmlands?${params}`)
      const data = await res.json()
      if (data.success) setFarmLands(data.data?.data ?? data.data?.farmLands ?? [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchRecords()
      fetchFarmers()
      fetchFarmLands()
    }
  }, [status, router, fetchRecords, fetchFarmers, fetchFarmLands])

  useEffect(() => {
    if (form.farmerId) fetchFarmLands(form.farmerId)
  }, [form.farmerId, fetchFarmLands])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        cherryRipeness: form.cherryRipeness ? parseFloat(form.cherryRipeness) : undefined,
        harvestLabourCost: form.harvestLabourCost ? parseFloat(form.harvestLabourCost) : undefined,
        sampleWeight: form.sampleWeight ? parseFloat(form.sampleWeight) : undefined,
        sampleArea: form.sampleArea ? parseFloat(form.sampleArea) : undefined,
        sampleYield: form.sampleYield ? parseFloat(form.sampleYield) : undefined,
        estimatedYieldPerHa: form.estimatedYieldPerHa ? parseFloat(form.estimatedYieldPerHa) : undefined,
        dryingDurationDays: form.dryingDurationDays ? parseInt(form.dryingDurationDays) : undefined,
        targetMoisture: form.targetMoisture ? parseFloat(form.targetMoisture) : undefined,
        moistureContent: form.moistureContent ? parseFloat(form.moistureContent) : undefined,
        defectiveBeans: form.defectiveBeans ? parseFloat(form.defectiveBeans) : undefined,
        foreignMatter: form.foreignMatter ? parseFloat(form.foreignMatter) : undefined,
        cupScore: form.cupScore ? parseFloat(form.cupScore) : undefined,
      }
      if (editingRecord) Object.assign(payload, { id: editingRecord.id })

      const res = await fetch('/api/harvest-traceabilities', {
        method: editingRecord ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingRecord ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo mới thành công!', 'Created successfully!'))
        setDialogOpen(false)
        resetForm()
        fetchRecords()
      } else {
        toast.error(data.error || t('Lỗi khi lưu', 'Error saving'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingRecord) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/harvest-traceabilities?id=${deletingRecord.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Xóa thành công!', 'Deleted successfully!'))
        setDeleteDialogOpen(false)
        setDeletingRecord(null)
        fetchRecords()
      } else {
        toast.error(data.error || t('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (record: HarvestRecord) => {
    setEditingRecord(record)
    setForm({
      farmerId: record.farmerId,
      farmLandId: record.farmLandId,
      plannedHarvestDate: record.plannedHarvestDate ? record.plannedHarvestDate.slice(0, 10) : '',
      plotBlockId: record.plotBlockId || '',
      coffeeVariety: record.coffeeVariety || '',
      estimatedYield: record.estimatedYield || '',
      actualHarvestDate: record.actualHarvestDate ? record.actualHarvestDate.slice(0, 10) : '',
      harvestMethod: record.harvestMethod || '',
      cherryRipeness: record.cherryRipeness?.toString() || '',
      harvestLabourCost: record.harvestLabourCost?.toString() || '',
      sampleWeight: record.sampleWeight?.toString() || '',
      sampleArea: record.sampleArea?.toString() || '',
      sampleYield: record.sampleYield?.toString() || '',
      estimatedYieldPerHa: record.estimatedYieldPerHa?.toString() || '',
      processingMethod: record.processingMethod || '',
      dryingMethod: record.dryingMethod || '',
      dryingDurationDays: record.dryingDurationDays?.toString() || '',
      targetMoisture: record.targetMoisture?.toString() || '',
      moistureContent: record.moistureContent?.toString() || '',
      defectiveBeans: record.defectiveBeans?.toString() || '',
      foreignMatter: record.foreignMatter?.toString() || '',
      cupScore: record.cupScore?.toString() || '',
      batchId: record.batchId || '',
      coffeeVarietyAtBatch: record.coffeeVarietyAtBatch || '',
      processingStage: record.processingStage || '',
      batchNotes: record.batchNotes || '',
    })
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)

  const cupScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return 'bg-muted text-muted-foreground'
    if (score >= 85) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 75) return 'bg-blue-100 text-blue-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  const stageColor = (stage: string | null) => {
    switch (stage?.toLowerCase()) {
      case 'harvested': return 'bg-emerald-100 text-emerald-700'
      case 'processed': return 'bg-blue-100 text-blue-700'
      case 'drying': return 'bg-amber-100 text-amber-700'
      case 'hulled': return 'bg-purple-100 text-purple-700'
      case 'sorted': return 'bg-cyan-100 text-cyan-700'
      case 'stored': return 'bg-muted text-foreground'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (status === 'loading' || (loading && records.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Wheat className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Wheat className="w-5 h-5 text-muted-foreground" />
              {t('Truy xuất Thu hoạch', 'Harvest Traceability')}
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
                {t('Thêm mới', 'Add New')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Wheat className="w-5 h-5" />
                  {editingRecord ? t('Sửa bản ghi', 'Edit Record') : t('Thêm bản ghi mới', 'Add New Record')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Nông dân', 'Farmer')} *</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t('Chọn nông dân', 'Select farmer')} /></SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (<SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Land */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Đất nông trại', 'Farm Land')} *</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t('Chọn đất', 'Select farm land')} /></SelectTrigger>
                      <SelectContent>
                        {farmLands.filter(fl => !form.farmerId || fl.farmerId === form.farmerId).map((fl) => (<SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Planned Harvest Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Ngày thu hoạch dự kiến', 'Planned Harvest Date')}</Label>
                    <Input type="date" value={form.plannedHarvestDate} onChange={(e) => setForm({ ...form, plannedHarvestDate: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Actual Harvest Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Ngày thu hoạch thực tế', 'Actual Harvest Date')}</Label>
                    <Input type="date" value={form.actualHarvestDate} onChange={(e) => setForm({ ...form, actualHarvestDate: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Coffee Variety */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Giống cà phê', 'Coffee Variety')}</Label>
                    <Select value={form.coffeeVariety} onValueChange={(v) => setForm({ ...form, coffeeVariety: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t('Chọn giống', 'Select variety')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robusta">{t('Robusta', 'Robusta')}</SelectItem>
                        <SelectItem value="Arabica">{t('Arabica', 'Arabica')}</SelectItem>
                        <SelectItem value="Liberica">{t('Liberica', 'Liberica')}</SelectItem>
                        <SelectItem value="Excelsa">{t('Excelsa', 'Excelsa')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Harvest Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Phương pháp thu hoạch', 'Harvest Method')}</Label>
                    <Select value={form.harvestMethod} onValueChange={(v) => setForm({ ...form, harvestMethod: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t('Chọn phương pháp', 'Select method')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hand-picking">{t('Hái tay', 'Hand Picking')}</SelectItem>
                        <SelectItem value="strip-picking">{t('Hái tuốt', 'Strip Picking')}</SelectItem>
                        <SelectItem value="mechanical">{t('Máy', 'Mechanical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cherry Ripeness */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Độ chín (%)', 'Cherry Ripeness (%)')}</Label>
                    <Input type="number" step="0.1" value={form.cherryRipeness} onChange={(e) => setForm({ ...form, cherryRipeness: e.target.value })} placeholder="95" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Estimated Yield */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Sản lượng dự kiến (kg)', 'Estimated Yield (kg)')}</Label>
                    <Input value={form.estimatedYield} onChange={(e) => setForm({ ...form, estimatedYield: e.target.value })} placeholder="500" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Harvest Labour Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Chi phí nhân công (VND)', 'Harvest Labour Cost (VND)')}</Label>
                    <Input type="number" value={form.harvestLabourCost} onChange={(e) => setForm({ ...form, harvestLabourCost: e.target.value })} placeholder="2000000" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Processing Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Phương pháp chế biến', 'Processing Method')}</Label>
                    <Select value={form.processingMethod} onValueChange={(v) => setForm({ ...form, processingMethod: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t('Chọn phương pháp', 'Select method')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wet">{t('Ướt', 'Wet')}</SelectItem>
                        <SelectItem value="dry">{t('Khô', 'Dry')}</SelectItem>
                        <SelectItem value="honey">{t('Mật ong', 'Honey')}</SelectItem>
                        <SelectItem value="natural">{t('Tự nhiên', 'Natural')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Drying Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Phương pháp sấy', 'Drying Method')}</Label>
                    <Input value={form.dryingMethod} onChange={(e) => setForm({ ...form, dryingMethod: e.target.value })} placeholder={t('Phơi nắng', 'Sun dried')} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Drying Duration */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Thời gian sấy (ngày)', 'Drying Duration (days)')}</Label>
                    <Input type="number" value={form.dryingDurationDays} onChange={(e) => setForm({ ...form, dryingDurationDays: e.target.value })} placeholder="14" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Moisture Content */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Độ ẩm (%)', 'Moisture Content (%)')}</Label>
                    <Input type="number" step="0.1" value={form.moistureContent} onChange={(e) => setForm({ ...form, moistureContent: e.target.value })} placeholder="12.5" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Cup Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Điểm cupping', 'Cup Score')}</Label>
                    <Input type="number" step="0.5" value={form.cupScore} onChange={(e) => setForm({ ...form, cupScore: e.target.value })} placeholder="82" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Batch ID */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground font-semibold">{t('Mã lô (Batch ID)', 'Batch ID')}</Label>
                    <Input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} placeholder="BATCH-2024-001" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Processing Stage */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Giai đoạn chế biến', 'Processing Stage')}</Label>
                    <Select value={form.processingStage} onValueChange={(v) => setForm({ ...form, processingStage: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t('Chọn giai đoạn', 'Select stage')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="harvested">{t('Đã thu hoạch', 'Harvested')}</SelectItem>
                        <SelectItem value="processed">{t('Đã chế biến', 'Processed')}</SelectItem>
                        <SelectItem value="drying">{t('Đang sấy', 'Drying')}</SelectItem>
                        <SelectItem value="hulled">{t('Đã bóc vỏ', 'Hulled')}</SelectItem>
                        <SelectItem value="sorted">{t('Đã phân loại', 'Sorted')}</SelectItem>
                        <SelectItem value="stored">{t('Đã lưu kho', 'Stored')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coffee Variety at Batch */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Giống CP tại lô', 'Variety at Batch')}</Label>
                    <Input value={form.coffeeVarietyAtBatch} onChange={(e) => setForm({ ...form, coffeeVarietyAtBatch: e.target.value })} placeholder="Robusta" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Sample Weight */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Trọng lượng mẫu (kg)', 'Sample Weight (kg)')}</Label>
                    <Input type="number" step="0.01" value={form.sampleWeight} onChange={(e) => setForm({ ...form, sampleWeight: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Sample Area */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Diện tích mẫu (m²)', 'Sample Area (m²)')}</Label>
                    <Input type="number" step="0.01" value={form.sampleArea} onChange={(e) => setForm({ ...form, sampleArea: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Defective Beans */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Hạt lỗi (%)', 'Defective Beans (%)')}</Label>
                    <Input type="number" step="0.1" value={form.defectiveBeans} onChange={(e) => setForm({ ...form, defectiveBeans: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Foreign Matter */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Tạp chất (%)', 'Foreign Matter (%)')}</Label>
                    <Input type="number" step="0.1" value={form.foreignMatter} onChange={(e) => setForm({ ...form, foreignMatter: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Batch Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t('Ghi chú lô', 'Batch Notes')}</Label>
                    <Textarea value={form.batchNotes} onChange={(e) => setForm({ ...form, batchNotes: e.target.value })} placeholder={t('Ghi chú thêm...', 'Additional notes...')} className="rounded-xl border-input focus:border-primary" rows={2} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">{t('Hủy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Đang lưu...', 'Saving...')}</> : editingRecord ? t('Cập nhật', 'Update') : t('Tạo mới', 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Batch ID Search + General Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={batchIdSearch}
              onChange={(e) => { setBatchIdSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm mã lô (Batch ID)...', 'Search Batch ID...')}
              className="pl-9 rounded-xl border-input focus:border-primary bg-background font-semibold"
            />
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm thu hoạch...', 'Search harvest...')}
              className="pl-9 rounded-xl border-input focus:border-primary bg-background"
            />
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
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Mã lô', 'Batch ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Đất', 'Farm Land')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Giống', 'Variety')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Ngày thu hoạch', 'Harvest Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Phương pháp', 'Method')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Độ chín', 'Ripeness')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Cup Score', 'Cup Score')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Giai đoạn', 'Stage')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {t('Không có bản ghi nào', 'No records found')}
                      </td>
                    </tr>
                  ) : (
                    records.map((record, i) => (
                      <tr key={record.id}
 className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          {record.batchId ? (
                            <Badge className="bg-muted text-foreground text-[10px] border text-border font-mono font-bold">
                              {record.batchId}
                            </Badge>
                          ) : <span className="text-xs text-muted-foreground">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{record.farmer?.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{record.farmer?.farmerCode}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{record.farmLand?.farmName || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{record.coffeeVariety || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{record.actualHarvestDate ? new Date(record.actualHarvestDate).toLocaleDateString() : (record.plannedHarvestDate ? new Date(record.plannedHarvestDate).toLocaleDateString() : '-')}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{record.harvestMethod || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {record.cherryRipeness !== null && record.cherryRipeness !== undefined ? `${record.cherryRipeness}%` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {record.cupScore !== null && record.cupScore !== undefined ? (
                            <Badge className={`${cupScoreColor(record.cupScore)} text-[10px] border-0 font-bold`}>
                              {record.cupScore}
                            </Badge>
                          ) : <span className="text-xs text-muted-foreground">-</span>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {record.processingStage ? (
                            <Badge className={`${stageColor(record.processingStage)} text-[10px] border-0`}>
                              {record.processingStage}
                            </Badge>
                          ) : <span className="text-xs text-muted-foreground">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(record)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => { setDeletingRecord(record); setDeleteDialogOpen(true) }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
</tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground">{t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0 rounded-lg border-input"><ChevronLeft className="w-3 h-3" /></Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-primary text-primary-foreground' : 'text-border text-muted-foreground'}`}>{p}</Button>
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0 rounded-lg border-input"><ChevronRight className="w-3 h-3" /></Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {t('Xác nhận xóa', 'Confirm Delete')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t(`Bạn có chắc muốn xóa lô "${deletingRecord?.batchId || ''}"?`, `Are you sure you want to delete batch "${deletingRecord?.batchId || ''}"?`)}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">{t('Hủy', 'Cancel')}</Button>
            <Button onClick={handleDelete} disabled={submitting} className="bg-red-600 text-white rounded-xl hover:bg-red-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t('Xóa', 'Delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
