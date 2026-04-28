'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, ClipboardCheck, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface CoffeeInspection {
  id: string
  farmerId: string | null
  farmLandId: string | null
  batchId: string | null
  inspectionId: string | null
  inspectionDate: string | null
  inspectorName: string | null
  inspectorCertNo: string | null
  inspectionType: string | null
  inspectionStandard: string | null
  sampleSize: number | null
  moistureContent: number | null
  defectCount: number | null
  foreignMatter: number | null
  screenSize: string | null
  color: string | null
  aroma: string | null
  taste: string | null
  body: string | null
  acidity: string | null
  aftertaste: string | null
  cupScore: number | null
  overallGrade: string | null
  passFail: string | null
  remarks: string | null
  isActive: boolean
  createdAt: string
  farmer?: { id: string; fullName: string; farmerCode: string | null } | null
  farmLand?: { id: string; farmName: string; plotBlockId: string | null } | null
}

interface FarmerOption {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLandOption {
  id: string
  farmName: string
  plotBlockId: string | null
}

const emptyForm = {
  farmerId: '',
  farmLandId: '',
  batchId: '',
  inspectionId: '',
  inspectionDate: '',
  inspectorName: '',
  inspectorCertNo: '',
  inspectionType: 'Pre-Export',
  inspectionStandard: 'VCA',
  sampleSize: '',
  moistureContent: '',
  defectCount: '',
  foreignMatter: '',
  screenSize: '',
  color: '',
  aroma: '',
  taste: '',
  body: '',
  acidity: '',
  aftertaste: '',
  cupScore: '',
  overallGrade: '',
  passFail: 'Pass',
  remarks: '',
}

export default function CoffeeInspectionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [inspections, setInspections] = useState<CoffeeInspection[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CoffeeInspection | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [passFailFilter, setPassFailFilter] = useState<string>('all')
  const [farmerOptions, setFarmerOptions] = useState<FarmerOption[]>([])
  const [farmLandOptions, setFarmLandOptions] = useState<FarmLandOption[]>([])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const [form, setForm] = useState(emptyForm)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingItem(null)
  }

  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      if (passFailFilter !== 'all') {
        params.set('passFail', passFailFilter)
      }
      const res = await fetch(`/api/coffee-inspections?${params}`)
      const data = await res.json()
      if (data.success) {
        setInspections(data.data.data)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error('Failed to fetch inspections', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, passFailFilter])

  const fetchFarmerOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=100')
      const data = await res.json()
      if (data.success) {
        setFarmerOptions(data.data?.data ?? data.data?.farmers ?? [])
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchFarmLandOptions = useCallback(async (farmerId?: string) => {
    try {
      const params = new URLSearchParams({ pageSize: '100' })
      if (farmerId) params.set('farmerId', farmerId)
      const res = await fetch(`/api/farmlands?${params}`)
      const data = await res.json()
      if (data.success) {
        setFarmLandOptions(data.data?.data ?? [])
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchInspections()
    }
  }, [status, router, fetchInspections])

  useEffect(() => {
    if (dialogOpen && status === 'authenticated') {
      fetchFarmerOptions()
    }
  }, [dialogOpen, status, fetchFarmerOptions])

  useEffect(() => {
    if (form.farmerId) {
      fetchFarmLandOptions(form.farmerId)
    }
  }, [form.farmerId, fetchFarmLandOptions])

  const handleEdit = (item: CoffeeInspection) => {
    setEditingItem(item)
    setForm({
      farmerId: item.farmerId || '',
      farmLandId: item.farmLandId || '',
      batchId: item.batchId || '',
      inspectionId: item.inspectionId || '',
      inspectionDate: item.inspectionDate ? new Date(item.inspectionDate).toISOString().split('T')[0] : '',
      inspectorName: item.inspectorName || '',
      inspectorCertNo: item.inspectorCertNo || '',
      inspectionType: item.inspectionType || 'Pre-Export',
      inspectionStandard: item.inspectionStandard || 'VCA',
      sampleSize: item.sampleSize !== null ? String(item.sampleSize) : '',
      moistureContent: item.moistureContent !== null ? String(item.moistureContent) : '',
      defectCount: item.defectCount !== null ? String(item.defectCount) : '',
      foreignMatter: item.foreignMatter !== null ? String(item.foreignMatter) : '',
      screenSize: item.screenSize || '',
      color: item.color || '',
      aroma: item.aroma || '',
      taste: item.taste || '',
      body: item.body || '',
      acidity: item.acidity || '',
      aftertaste: item.aftertaste || '',
      cupScore: item.cupScore !== null ? String(item.cupScore) : '',
      overallGrade: item.overallGrade || '',
      passFail: item.passFail || 'Pass',
      remarks: item.remarks || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        sampleSize: form.sampleSize ? parseFloat(form.sampleSize) : undefined,
        moistureContent: form.moistureContent ? parseFloat(form.moistureContent) : undefined,
        defectCount: form.defectCount ? parseFloat(form.defectCount) : undefined,
        foreignMatter: form.foreignMatter ? parseFloat(form.foreignMatter) : undefined,
        cupScore: form.cupScore ? parseFloat(form.cupScore) : undefined,
        inspectionDate: form.inspectionDate ? new Date(form.inspectionDate).toISOString() : undefined,
        farmerId: form.farmerId || undefined,
        farmLandId: form.farmLandId || undefined,
      }

      const url = editingItem ? '/api/coffee-inspections' : '/api/coffee-inspections'
      const method = editingItem ? 'PUT' : 'POST'
      if (editingItem) {
        (payload as Record<string, unknown>).id = editingItem.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingItem ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo kiểm tra thành công!', 'Inspection created!'))
        setDialogOpen(false)
        resetForm()
        fetchInspections()
      } else {
        toast.error(data.error || t('Lỗi khi lưu', 'Error saving'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/coffee-inspections?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Xóa thành công!', 'Deleted successfully!'))
        setDeleteConfirm(null)
        fetchInspections()
      } else {
        toast.error(data.error || t('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const cupScoreColor = (score: number | null) => {
    if (score === null) return 'text-coffee-400'
    if (score >= 85) return 'text-green-600'
    if (score >= 80) return 'text-emerald-500'
    if (score >= 75) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-500'
    return 'text-red-500'
  }

  if (status === 'loading' || (loading && inspections.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-coffee-600">
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
            <h2 className="text-xl md:text-2xl font-bold text-coffee-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-coffee-600" />
              {t('Kiểm tra Cà phê', 'Coffee Inspections')}
            </h2>
            <p className="text-sm text-coffee-500">{t(`Tổng số: ${total} kiểm tra`, `Total: ${total} inspections`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t('Thêm kiểm tra mới', 'Add New Inspection')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-coffee-800 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  {editingItem ? t('Sửa kiểm tra', 'Edit Inspection') : t('Thêm kiểm tra mới', 'Add New Inspection')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Nông dân', 'Farmer')}</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn nông dân', 'Select farmer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmerOptions.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* FarmLand */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Đất nông trại', 'Farm Land')}</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn đất', 'Select land')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmLandOptions.map((fl) => (
                          <SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Batch ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Mã lô', 'Batch ID')}</Label>
                    <Input
                      value={form.batchId}
                      onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                      placeholder="BATCH-001"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Inspection ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Mã kiểm tra', 'Inspection ID')}</Label>
                    <Input
                      value={form.inspectionId}
                      onChange={(e) => setForm({ ...form, inspectionId: e.target.value })}
                      placeholder="INS-001"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Inspection Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày kiểm tra', 'Inspection Date')}</Label>
                    <Input
                      type="date"
                      value={form.inspectionDate}
                      onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Inspector Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Người kiểm tra', 'Inspector Name')}</Label>
                    <Input
                      value={form.inspectorName}
                      onChange={(e) => setForm({ ...form, inspectorName: e.target.value })}
                      placeholder={t('Nguyễn Văn A', 'John Doe')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Inspector Cert No */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Số chứng chỉ', 'Cert No')}</Label>
                    <Input
                      value={form.inspectorCertNo}
                      onChange={(e) => setForm({ ...form, inspectorCertNo: e.target.value })}
                      placeholder="CERT-2024-001"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Inspection Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Loại kiểm tra', 'Inspection Type')}</Label>
                    <Select value={form.inspectionType} onValueChange={(v) => setForm({ ...form, inspectionType: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pre-Export">{t('Tiền xuất khẩu', 'Pre-Export')}</SelectItem>
                        <SelectItem value="Pre-Ship">{t('Tiền vận chuyển', 'Pre-Ship')}</SelectItem>
                        <SelectItem value="Cupping">{t('Cupping', 'Cupping')}</SelectItem>
                        <SelectItem value="Quality Control">{t('Kiểm soát chất lượng', 'Quality Control')}</SelectItem>
                        <SelectItem value="Organic">{t('Hữu cơ', 'Organic')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Inspection Standard */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tiêu chuẩn', 'Standard')}</Label>
                    <Select value={form.inspectionStandard} onValueChange={(v) => setForm({ ...form, inspectionStandard: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VCA">VCA</SelectItem>
                        <SelectItem value="SCA">SCA</SelectItem>
                        <SelectItem value="ISO">ISO</SelectItem>
                        <SelectItem value="UTZ">UTZ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sample Size */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Kích thước mẫu (g)', 'Sample Size (g)')}</Label>
                    <Input
                      type="number"
                      value={form.sampleSize}
                      onChange={(e) => setForm({ ...form, sampleSize: e.target.value })}
                      placeholder="300"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Moisture Content */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Độ ẩm (%)', 'Moisture (%)')}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.moistureContent}
                      onChange={(e) => setForm({ ...form, moistureContent: e.target.value })}
                      placeholder="12.5"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Defect Count */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Số lỗi', 'Defect Count')}</Label>
                    <Input
                      type="number"
                      value={form.defectCount}
                      onChange={(e) => setForm({ ...form, defectCount: e.target.value })}
                      placeholder="5"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Foreign Matter */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tạp chất (%)', 'Foreign Matter (%)')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.foreignMatter}
                      onChange={(e) => setForm({ ...form, foreignMatter: e.target.value })}
                      placeholder="0.5"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Screen Size */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Kích thước rây', 'Screen Size')}</Label>
                    <Input
                      value={form.screenSize}
                      onChange={(e) => setForm({ ...form, screenSize: e.target.value })}
                      placeholder="16+"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Color */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Màu sắc', 'Color')}</Label>
                    <Input
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      placeholder={t('Xanh bluish', 'Bluish green')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Cup Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Điểm cupping', 'Cup Score')}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.cupScore}
                      onChange={(e) => setForm({ ...form, cupScore: e.target.value })}
                      placeholder="82.5"
                      min="0" max="100"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Overall Grade */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Xếp hạng', 'Grade')}</Label>
                    <Select value={form.overallGrade} onValueChange={(v) => setForm({ ...form, overallGrade: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn hạng', 'Select grade')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Specialty">{t('Đặc sản', 'Specialty')}</SelectItem>
                        <SelectItem value="Premium">{t('Cao cấp', 'Premium')}</SelectItem>
                        <SelectItem value="Grade 1">{t('Hạng 1', 'Grade 1')}</SelectItem>
                        <SelectItem value="Grade 2">{t('Hạng 2', 'Grade 2')}</SelectItem>
                        <SelectItem value="Grade 3">{t('Hạng 3', 'Grade 3')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pass/Fail */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Đạt/Không đạt', 'Pass/Fail')}</Label>
                    <Select value={form.passFail} onValueChange={(v) => setForm({ ...form, passFail: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pass">{t('Đạt', 'Pass')}</SelectItem>
                        <SelectItem value="Fail">{t('Không đạt', 'Fail')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Aroma */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Hương thơm', 'Aroma')}</Label>
                    <Input
                      value={form.aroma}
                      onChange={(e) => setForm({ ...form, aroma: e.target.value })}
                      placeholder={t('Chocolate, hoa quả', 'Chocolate, fruity')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Taste */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Vị', 'Taste')}</Label>
                    <Input
                      value={form.taste}
                      onChange={(e) => setForm({ ...form, taste: e.target.value })}
                      placeholder={t('Ngọt, cân bằng', 'Sweet, balanced')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Body */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Body', 'Body')}</Label>
                    <Input
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      placeholder={t('Đầy đặn', 'Full')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Acidity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Độ axit', 'Acidity')}</Label>
                    <Input
                      value={form.acidity}
                      onChange={(e) => setForm({ ...form, acidity: e.target.value })}
                      placeholder={t('Sáng, tinh khiết', 'Bright, clean')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Aftertaste */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Hậu vị', 'Aftertaste')}</Label>
                    <Input
                      value={form.aftertaste}
                      onChange={(e) => setForm({ ...form, aftertaste: e.target.value })}
                      placeholder={t('Dài, dễ chịu', 'Long, pleasant')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Ghi chú', 'Remarks')}</Label>
                    <Input
                      value={form.remarks}
                      onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                      placeholder={t('Ghi chú thêm...', 'Additional remarks...')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-coffee-100">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                    {t('Hủy', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-white rounded-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('Đang lưu...', 'Saving...')}
                      </>
                    ) : (
                      editingItem ? t('Cập nhật', 'Update') : t('Tạo mới', 'Create')
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Tabs value={passFailFilter} onValueChange={(v) => { setPassFailFilter(v); setPage(1) }}>
            <TabsList className="bg-coffee-50 rounded-xl">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-coffee-700 data-[state=active]:text-white rounded-lg">
                {t('Tất cả', 'All')}
              </TabsTrigger>
              <TabsTrigger value="Pass" className="text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg">
                {t('Đạt', 'Pass')}
              </TabsTrigger>
              <TabsTrigger value="Fail" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">
                {t('Không đạt', 'Fail')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm kiểm tra...', 'Search inspections...')}
              className="pl-9 rounded-xl border-coffee-200 focus:border-coffee-500 bg-white"
            />
          </div>
          <Badge variant="outline" className="border-coffee-300 text-coffee-600 text-xs">
            {t(`${total} bản ghi`, `${total} records`)}
          </Badge>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-coffee-50 border-b border-coffee-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Mã KT', 'Insp ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Mã lô', 'Batch')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Người KT', 'Inspector')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Ngày', 'Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Cup Score', 'Cup Score')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Hạng', 'Grade')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Đạt/Không', 'Pass/Fail')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider text-right">{t('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {inspections.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-coffee-400">
                          <ClipboardCheck className="w-10 h-10" />
                          <p className="text-sm">{t('Chưa có kiểm tra nào', 'No inspections found')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inspections.map((item, i) => (
                      <tr key={item.id}
 className="border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs text-coffee-500 font-mono">{item.inspectionId || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 font-mono">{item.batchId || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{item.inspectorName || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-500 hidden lg:table-cell">
                          {item.inspectionDate ? new Date(item.inspectionDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-[10px] border-coffee-200 text-coffee-600">
                            {item.inspectionType || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${cupScoreColor(item.cupScore)}`}>
                            {item.cupScore !== null && item.cupScore !== undefined ? item.cupScore.toFixed(1) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{item.overallGrade || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${item.passFail === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px] border-0`}>
                            {item.passFail === 'Pass' ? t('Đạt', 'Pass') : t('Không đạt', 'Fail')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-coffee-100" onClick={() => handleEdit(item)}>
                              <Pencil className="w-3 h-3 text-coffee-600" />
                            </Button>
                            {deleteConfirm === item.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-red-100" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-coffee-100" onClick={() => setDeleteConfirm(null)}>
                                  <X className="w-3 h-3 text-coffee-400" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-red-50" onClick={() => setDeleteConfirm(item.id)}>
                                <Trash2 className="w-3 h-3 text-coffee-300" />
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-coffee-100">
              <p className="text-[10px] text-coffee-500">
                {t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 w-7 p-0 rounded-lg border-coffee-200"
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
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-coffee-700 text-white' : 'border-coffee-200 text-coffee-600'}`}
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
                  className="h-7 w-7 p-0 rounded-lg border-coffee-200"
                >
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
