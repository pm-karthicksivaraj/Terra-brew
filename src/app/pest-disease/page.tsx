'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bug, Search, Plus, ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, AlertTriangle,
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
import { formatCurrency } from '@/types'

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

interface PestDiseaseRecord {
  id: string
  farmerId: string
  farmLandId: string
  detectionDate: string | null
  pestOrDisease: string | null
  type: string | null
  severity: string | null
  affectedArea: number | null
  affectedTrees: number | null
  symptoms: string | null
  treatmentMethod: string | null
  treatmentProduct: string | null
  dosage: string | null
  applicationDate: string | null
  followUpDate: string | null
  outcome: string | null
  cost: number | null
  preventionMeasures: string | null
  notes: string | null
  isActive: boolean
  farmer: Farmer
  farmLand: FarmLand
}

const initialForm = {
  farmerId: '',
  farmLandId: '',
  detectionDate: '',
  pestOrDisease: '',
  type: 'pest',
  severity: 'low',
  affectedArea: '',
  affectedTrees: '',
  symptoms: '',
  treatmentMethod: '',
  treatmentProduct: '',
  dosage: '',
  applicationDate: '',
  followUpDate: '',
  outcome: '',
  cost: '',
  preventionMeasures: '',
  notes: '',
}

export default function PestDiseasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [records, setRecords] = useState<PestDiseaseRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PestDiseaseRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<PestDiseaseRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)

  // Dropdown data
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [farmLands, setFarmLands] = useState<FarmLand[]>([])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const resetForm = () => {
    setForm(initialForm)
    setEditingRecord(null)
  }

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
      const res = await fetch(`/api/pest-disease-mgmts?${params}`)
      const data = await res.json()
      if (data.success) {
        setRecords(data.data.data)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error('Failed to fetch records', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  const fetchFarmers = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=1000')
      const data = await res.json()
      if (data.success) setFarmers(data.data.farmers || data.data.data || [])
    } catch { /* ignore */ }
  }, [])

  const fetchFarmLands = useCallback(async (farmerId?: string) => {
    try {
      const params = new URLSearchParams({ pageSize: '1000' })
      if (farmerId) params.set('farmerId', farmerId)
      const res = await fetch(`/api/farmlands?${params}`)
      const data = await res.json()
      if (data.success) setFarmLands(data.data.farmLands || data.data.data || [])
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

  // Filter farmlands when farmer changes
  useEffect(() => {
    if (form.farmerId) {
      fetchFarmLands(form.farmerId)
    }
  }, [form.farmerId, fetchFarmLands])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        affectedArea: form.affectedArea ? parseFloat(form.affectedArea) : undefined,
        affectedTrees: form.affectedTrees ? parseInt(form.affectedTrees) : undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
      }

      const url = editingRecord ? '/api/pest-disease-mgmts' : '/api/pest-disease-mgmts'
      const method = editingRecord ? 'PUT' : 'POST'
      if (editingRecord) Object.assign(payload, { id: editingRecord.id })

      const res = await fetch(url, {
        method,
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
      const res = await fetch(`/api/pest-disease-mgmts?id=${deletingRecord.id}`, { method: 'DELETE' })
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

  const openEditDialog = (record: PestDiseaseRecord) => {
    setEditingRecord(record)
    setForm({
      farmerId: record.farmerId,
      farmLandId: record.farmLandId,
      detectionDate: record.detectionDate ? record.detectionDate.slice(0, 10) : '',
      pestOrDisease: record.pestOrDisease || '',
      type: record.type || 'pest',
      severity: record.severity || 'low',
      affectedArea: record.affectedArea?.toString() || '',
      affectedTrees: record.affectedTrees?.toString() || '',
      symptoms: record.symptoms || '',
      treatmentMethod: record.treatmentMethod || '',
      treatmentProduct: record.treatmentProduct || '',
      dosage: record.dosage || '',
      applicationDate: record.applicationDate ? record.applicationDate.slice(0, 10) : '',
      followUpDate: record.followUpDate ? record.followUpDate.slice(0, 10) : '',
      outcome: record.outcome || '',
      cost: record.cost?.toString() || '',
      preventionMeasures: record.preventionMeasures || '',
      notes: record.notes || '',
    })
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)

  const severityColor = (sev: string | null) => {
    switch (sev?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'critical': return 'bg-red-100 text-red-700'
      default: return 'bg-coffee-100 text-coffee-700'
    }
  }

  const typeColor = (type: string | null) => {
    return type?.toLowerCase() === 'disease'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-amber-100 text-amber-700'
  }

  if (status === 'loading' || (loading && records.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Bug className="w-9 h-9 text-white animate-pulse" />
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-900 flex items-center gap-2">
              <Bug className="w-5 h-5 text-coffee-600" />
              {t('Quản lý Sâu Bệnh', 'Pest & Disease Management')}
            </h2>
            <p className="text-sm text-coffee-500">{t(`Tổng số: ${total} bản ghi`, `Total: ${total} records`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t('Thêm mới', 'Add New')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-coffee-800 flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  {editingRecord ? t('Sửa bản ghi', 'Edit Record') : t('Thêm bản ghi mới', 'Add New Record')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Nông dân', 'Farmer')} *</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn nông dân', 'Select farmer')} />
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
                    <Label className="text-xs text-coffee-700">{t('Đất nông trại', 'Farm Land')} *</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn đất', 'Select farm land')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmLands.filter(fl => !form.farmerId || fl.farmerId === form.farmerId).map((fl) => (
                          <SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Detection Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày phát hiện', 'Detection Date')}</Label>
                    <Input type="date" value={form.detectionDate} onChange={(e) => setForm({ ...form, detectionDate: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Pest or Disease */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tên sâu/bệnh', 'Pest/Disease Name')} *</Label>
                    <Input value={form.pestOrDisease} onChange={(e) => setForm({ ...form, pestOrDisease: e.target.value })} placeholder={t('VD: Rỉ sét lá', 'e.g. Leaf rust')} className="rounded-xl border-coffee-200 focus:border-coffee-500" required />
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Loại', 'Type')}</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pest">{t('Sâu hại', 'Pest')}</SelectItem>
                        <SelectItem value="disease">{t('Bệnh', 'Disease')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Severity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Mức độ', 'Severity')}</Label>
                    <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('Thấp', 'Low')}</SelectItem>
                        <SelectItem value="medium">{t('Trung bình', 'Medium')}</SelectItem>
                        <SelectItem value="high">{t('Cao', 'High')}</SelectItem>
                        <SelectItem value="critical">{t('Nghiêm trọng', 'Critical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Affected Area */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Diện tích ảnh hưởng (ha)', 'Affected Area (ha)')}</Label>
                    <Input type="number" step="0.01" value={form.affectedArea} onChange={(e) => setForm({ ...form, affectedArea: e.target.value })} placeholder="0.5" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Affected Trees */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Số cây ảnh hưởng', 'Affected Trees')}</Label>
                    <Input type="number" value={form.affectedTrees} onChange={(e) => setForm({ ...form, affectedTrees: e.target.value })} placeholder="10" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Triệu chứng', 'Symptoms')}</Label>
                    <Textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder={t('Mô tả triệu chứng...', 'Describe symptoms...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
                  </div>

                  {/* Treatment Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Phương pháp xử lý', 'Treatment Method')}</Label>
                    <Input value={form.treatmentMethod} onChange={(e) => setForm({ ...form, treatmentMethod: e.target.value })} placeholder={t('Phun thuốc', 'Spray')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Treatment Product */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Sản phẩm xử lý', 'Treatment Product')}</Label>
                    <Input value={form.treatmentProduct} onChange={(e) => setForm({ ...form, treatmentProduct: e.target.value })} placeholder={t('Tên thuốc', 'Product name')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Dosage */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Liều lượng', 'Dosage')}</Label>
                    <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="2ml/l" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Application Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày xử lý', 'Application Date')}</Label>
                    <Input type="date" value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Follow Up Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày theo dõi', 'Follow-up Date')}</Label>
                    <Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Outcome */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Kết quả', 'Outcome')}</Label>
                    <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn kết quả', 'Select outcome')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resolved">{t('Đã khỏi', 'Resolved')}</SelectItem>
                        <SelectItem value="improving">{t('Đang cải thiện', 'Improving')}</SelectItem>
                        <SelectItem value="ongoing">{t('Đang xử lý', 'Ongoing')}</SelectItem>
                        <SelectItem value="worsening">{t('Nặng hơn', 'Worsening')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Chi phí (VND)', 'Cost (VND)')}</Label>
                    <Input type="number" step="1000" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="500000" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Prevention Measures */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Biện pháp phòng ngừa', 'Prevention Measures')}</Label>
                    <Textarea value={form.preventionMeasures} onChange={(e) => setForm({ ...form, preventionMeasures: e.target.value })} placeholder={t('Mô tả biện pháp phòng ngừa...', 'Describe prevention measures...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Ghi chú', 'Notes')}</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t('Ghi chú thêm...', 'Additional notes...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-coffee-100">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                    {t('Hủy', 'Cancel')}
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-white rounded-xl">
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Đang lưu...', 'Saving...')}</>
                    ) : editingRecord ? t('Cập nhật', 'Update') : t('Tạo mới', 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm sâu bệnh...', 'Search pest/disease...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Đất', 'Farm Land')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Ngày phát hiện', 'Detected')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Sâu/Bệnh', 'Pest/Disease')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Mức độ', 'Severity')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Xử lý', 'Treatment')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Kết quả', 'Outcome')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-coffee-400 text-sm">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {t('Không có bản ghi nào', 'No records found')}
                      </td>
                    </tr>
                  ) : (
                    records.map((record, i) => (
                      <motion.tr
                        key={record.id}
                        className="border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-coffee-800">{record.farmer?.fullName}</p>
                          <p className="text-[10px] text-coffee-400">{record.farmer?.farmerCode}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{record.farmLand?.farmName || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600">{record.detectionDate ? new Date(record.detectionDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-xs font-medium text-coffee-800">{record.pestOrDisease || '-'}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge className={`${typeColor(record.type)} text-[10px] border-0`}>
                            {record.type === 'disease' ? t('Bệnh', 'Disease') : t('Sâu', 'Pest')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${severityColor(record.severity)} text-[10px] border-0`}>
                            {record.severity === 'low' ? t('Thấp', 'Low') :
                             record.severity === 'medium' ? t('TB', 'Med') :
                             record.severity === 'high' ? t('Cao', 'High') :
                             record.severity === 'critical' ? t('NG', 'Crit') : record.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell max-w-[120px] truncate">{record.treatmentMethod || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{record.outcome || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-coffee-500 hover:text-coffee-800" onClick={() => openEditDialog(record)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => { setDeletingRecord(record); setDeleteDialogOpen(true) }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
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
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0 rounded-lg border-coffee-200">
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return (
                    <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-coffee-700 text-white' : 'border-coffee-200 text-coffee-600'}`}
                    >
                      {p}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0 rounded-lg border-coffee-200">
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-coffee-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {t('Xác nhận xóa', 'Confirm Delete')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-coffee-600">
            {t(
              `Bạn có chắc muốn xóa bản ghi "${deletingRecord?.pestOrDisease || ''}"?`,
              `Are you sure you want to delete "${deletingRecord?.pestOrDisease || ''}"?`
            )}
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
