'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cog, Search, Plus, ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, XCircle,
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

interface ProcessingStage {
  id: string
  stageType: string | null
  stageDate: string | null
  inputWeight: number | null
  outputWeight: number | null
  durationMinutes: number | null
  temperature: number | null
  humidity: number | null
  machineUsed: string | null
  operatorName: string | null
  qualityCheckPassed: boolean
  notes: string | null
}

interface ProcessingRecord {
  id: string
  jobOrderId: string | null
  processingDate: string | null
  batchIdInput: string | null
  coffeeTypeInput: string | null
  coffeeVarietyInput: string | null
  inputQuantityKg: number | null
  processingMethod: string | null
  targetOutputProduct: string | null
  operatorName: string | null
  plantFacilityName: string | null
  inputWeightKg: number | null
  finalOutputWeightKg: number | null
  overallOutturn: number | null
  totalProcessingCost: number | null
  costPerKg: number | null
  finalMoistureContent: number | null
  cupScore: number | null
  cuppingNotes: string | null
  qcApprovedBy: string | null
  qcApprovalDate: string | null
  isActive: boolean
  processingStages: ProcessingStage[]
}

const initialForm = {
  jobOrderId: '',
  processingDate: '',
  batchIdInput: '',
  coffeeTypeInput: '',
  coffeeVarietyInput: '',
  inputQuantityKg: '',
  processingMethod: '',
  targetOutputProduct: '',
  operatorName: '',
  plantFacilityName: '',
  inputWeightKg: '',
  finalOutputWeightKg: '',
  overallOutturn: '',
  totalProcessingCost: '',
  costPerKg: '',
  finalMoistureContent: '',
  cupScore: '',
  cuppingNotes: '',
  qcApprovedBy: '',
  qcApprovalDate: '',
}

export default function ProcessingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [records, setRecords] = useState<ProcessingRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProcessingRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<ProcessingRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const resetForm = () => { setForm(initialForm); setEditingRecord(null) }

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
      const res = await fetch(`/api/processing?${params}`)
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchRecords()
    }
  }, [status, router, fetchRecords])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        inputQuantityKg: form.inputQuantityKg ? parseFloat(form.inputQuantityKg) : undefined,
        inputWeightKg: form.inputWeightKg ? parseFloat(form.inputWeightKg) : undefined,
        finalOutputWeightKg: form.finalOutputWeightKg ? parseFloat(form.finalOutputWeightKg) : undefined,
        overallOutturn: form.overallOutturn ? parseFloat(form.overallOutturn) : undefined,
        totalProcessingCost: form.totalProcessingCost ? parseFloat(form.totalProcessingCost) : undefined,
        costPerKg: form.costPerKg ? parseFloat(form.costPerKg) : undefined,
        finalMoistureContent: form.finalMoistureContent ? parseFloat(form.finalMoistureContent) : undefined,
        cupScore: form.cupScore ? parseFloat(form.cupScore) : undefined,
        qcApprovalDate: form.qcApprovalDate || undefined,
      }
      if (editingRecord) Object.assign(payload, { id: editingRecord.id })

      const res = await fetch('/api/processing', {
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
      const res = await fetch(`/api/processing?id=${deletingRecord.id}`, { method: 'DELETE' })
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

  const openEditDialog = (record: ProcessingRecord) => {
    setEditingRecord(record)
    setForm({
      jobOrderId: record.jobOrderId || '',
      processingDate: record.processingDate ? record.processingDate.slice(0, 10) : '',
      batchIdInput: record.batchIdInput || '',
      coffeeTypeInput: record.coffeeTypeInput || '',
      coffeeVarietyInput: record.coffeeVarietyInput || '',
      inputQuantityKg: record.inputQuantityKg?.toString() || '',
      processingMethod: record.processingMethod || '',
      targetOutputProduct: record.targetOutputProduct || '',
      operatorName: record.operatorName || '',
      plantFacilityName: record.plantFacilityName || '',
      inputWeightKg: record.inputWeightKg?.toString() || '',
      finalOutputWeightKg: record.finalOutputWeightKg?.toString() || '',
      overallOutturn: record.overallOutturn?.toString() || '',
      totalProcessingCost: record.totalProcessingCost?.toString() || '',
      costPerKg: record.costPerKg?.toString() || '',
      finalMoistureContent: record.finalMoistureContent?.toString() || '',
      cupScore: record.cupScore?.toString() || '',
      cuppingNotes: record.cuppingNotes || '',
      qcApprovedBy: record.qcApprovedBy || '',
      qcApprovalDate: record.qcApprovalDate ? record.qcApprovalDate.slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)

  const methodColor = (method: string | null) => {
    switch (method?.toLowerCase()) {
      case 'wet': return 'bg-blue-100 text-blue-700'
      case 'dry': return 'bg-amber-100 text-amber-700'
      case 'honey': return 'bg-yellow-100 text-yellow-700'
      case 'natural': return 'bg-green-100 text-green-700'
      case 'semi-washed': return 'bg-purple-100 text-purple-700'
      default: return 'bg-coffee-100 text-coffee-700'
    }
  }

  const stageTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'sorting': return 'bg-cyan-100 text-cyan-700'
      case 'pulping': return 'bg-blue-100 text-blue-700'
      case 'fermentation': return 'bg-purple-100 text-purple-700'
      case 'washing': return 'bg-sky-100 text-sky-700'
      case 'drying': return 'bg-amber-100 text-amber-700'
      case 'hulling': return 'bg-orange-100 text-orange-700'
      case 'grading': return 'bg-green-100 text-green-700'
      case 'packaging': return 'bg-coffee-100 text-coffee-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const cupScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return 'bg-coffee-100 text-coffee-600'
    if (score >= 85) return 'bg-green-100 text-green-700'
    if (score >= 75) return 'bg-blue-100 text-blue-700'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (status === 'loading' || (loading && records.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Cog className="w-9 h-9 text-white animate-pulse" />
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
              <Cog className="w-5 h-5 text-coffee-600" />
              {t('Chế biến', 'Processing Pipeline')}
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
                  <Cog className="w-5 h-5" />
                  {editingRecord ? t('Sửa lệnh chế biến', 'Edit Job Order') : t('Thêm lệnh chế biến', 'Add Job Order')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Order ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Mã lệnh (Job Order ID)', 'Job Order ID')}</Label>
                    <Input value={form.jobOrderId} onChange={(e) => setForm({ ...form, jobOrderId: e.target.value })} placeholder="JO-2024-001" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Processing Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày chế biến', 'Processing Date')}</Label>
                    <Input type="date" value={form.processingDate} onChange={(e) => setForm({ ...form, processingDate: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Batch ID Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Mã lô đầu vào', 'Batch ID Input')}</Label>
                    <Input value={form.batchIdInput} onChange={(e) => setForm({ ...form, batchIdInput: e.target.value })} placeholder="BATCH-2024-001" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Coffee Type Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Loại CP đầu vào', 'Coffee Type Input')}</Label>
                    <Select value={form.coffeeTypeInput} onValueChange={(v) => setForm({ ...form, coffeeTypeInput: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200"><SelectValue placeholder={t('Chọn loại', 'Select type')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robusta">Robusta</SelectItem>
                        <SelectItem value="Arabica">Arabica</SelectItem>
                        <SelectItem value="Liberica">Liberica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coffee Variety Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Giống CP đầu vào', 'Coffee Variety Input')}</Label>
                    <Input value={form.coffeeVarietyInput} onChange={(e) => setForm({ ...form, coffeeVarietyInput: e.target.value })} placeholder={t('Giống', 'Variety')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Input Quantity Kg */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Số lượng đầu vào (kg)', 'Input Quantity (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.inputQuantityKg} onChange={(e) => setForm({ ...form, inputQuantityKg: e.target.value })} placeholder="1000" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Processing Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Phương pháp chế biến', 'Processing Method')}</Label>
                    <Select value={form.processingMethod} onValueChange={(v) => setForm({ ...form, processingMethod: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200"><SelectValue placeholder={t('Chọn PP', 'Select method')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wet">{t('Ướt', 'Wet')}</SelectItem>
                        <SelectItem value="dry">{t('Khô', 'Dry')}</SelectItem>
                        <SelectItem value="honey">{t('Mật ong', 'Honey')}</SelectItem>
                        <SelectItem value="natural">{t('Tự nhiên', 'Natural')}</SelectItem>
                        <SelectItem value="semi-washed">{t('Bán rửa', 'Semi-washed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Output Product */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('SP đầu ra mục tiêu', 'Target Output Product')}</Label>
                    <Input value={form.targetOutputProduct} onChange={(e) => setForm({ ...form, targetOutputProduct: e.target.value })} placeholder={t('Green bean', 'Green bean')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Operator Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Người vận hành', 'Operator Name')}</Label>
                    <Input value={form.operatorName} onChange={(e) => setForm({ ...form, operatorName: e.target.value })} placeholder={t('Nguyễn Văn A', 'Nguyen Van A')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Plant Facility Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Nhà máy', 'Plant Facility')}</Label>
                    <Input value={form.plantFacilityName} onChange={(e) => setForm({ ...form, plantFacilityName: e.target.value })} placeholder={t('Nhà máy ABC', 'Factory ABC')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Input Weight Kg */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('TL đầu vào (kg)', 'Input Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.inputWeightKg} onChange={(e) => setForm({ ...form, inputWeightKg: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Final Output Weight Kg */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('TL đầu ra (kg)', 'Output Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.finalOutputWeightKg} onChange={(e) => setForm({ ...form, finalOutputWeightKg: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Overall Outturn */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tỷ lệ xuất (%)', 'Outturn (%)')}</Label>
                    <Input type="number" step="0.1" value={form.overallOutturn} onChange={(e) => setForm({ ...form, overallOutturn: e.target.value })} placeholder="18.5" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Total Processing Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tổng chi phí (VND)', 'Total Cost (VND)')}</Label>
                    <Input type="number" step="1000" value={form.totalProcessingCost} onChange={(e) => setForm({ ...form, totalProcessingCost: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Cost Per Kg */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Chi phí/kg (VND)', 'Cost/kg (VND)')}</Label>
                    <Input type="number" step="100" value={form.costPerKg} onChange={(e) => setForm({ ...form, costPerKg: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Final Moisture Content */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Độ ẩm cuối (%)', 'Final Moisture (%)')}</Label>
                    <Input type="number" step="0.1" value={form.finalMoistureContent} onChange={(e) => setForm({ ...form, finalMoistureContent: e.target.value })} placeholder="12.0" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Cup Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Điểm cupping', 'Cup Score')}</Label>
                    <Input type="number" step="0.5" value={form.cupScore} onChange={(e) => setForm({ ...form, cupScore: e.target.value })} placeholder="82" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Cupping Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Ghi chú cupping', 'Cupping Notes')}</Label>
                    <Textarea value={form.cuppingNotes} onChange={(e) => setForm({ ...form, cuppingNotes: e.target.value })} placeholder={t('Mô tả hương vị...', 'Describe flavor...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
                  </div>

                  {/* QC Approved By */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('QC duyệt bởi', 'QC Approved By')}</Label>
                    <Input value={form.qcApprovedBy} onChange={(e) => setForm({ ...form, qcApprovedBy: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* QC Approval Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày QC duyệt', 'QC Approval Date')}</Label>
                    <Input type="date" value={form.qcApprovalDate} onChange={(e) => setForm({ ...form, qcApprovalDate: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-coffee-100">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">{t('Hủy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-white rounded-xl">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Đang lưu...', 'Saving...')}</> : editingRecord ? t('Cập nhật', 'Update') : t('Tạo mới', 'Create')}
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
              placeholder={t('Tìm kiếm chế biến...', 'Search processing...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider w-8"></th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Mã lệnh', 'Job Order')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Mã lô', 'Batch Input')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Ngày', 'Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('SL đầu vào', 'Input Qty')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('PP chế biến', 'Method')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('TL đầu ra', 'Output')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Xuất %', 'Outturn')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Cup Score', 'Cup Score')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('QC', 'QC')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-12 text-coffee-400 text-sm">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {t('Không có bản ghi nào', 'No records found')}
                      </td>
                    </tr>
                  ) : (
                    records.map((record, i) => (
                      <motion.tr
                        key={record.id}
                        className={`border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors ${expandedRows.has(record.id) ? 'bg-coffee-50/30' : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td colSpan={11} className="p-0">
                          <table className="w-full">
                            <tbody>
                              <tr className="hover:bg-coffee-50/50 transition-colors">
                                <td className="px-4 py-3 w-8">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleRow(record.id)}>
                                    {expandedRows.has(record.id) ? <ChevronUp className="w-3 h-3 text-coffee-500" /> : <ChevronDown className="w-3 h-3 text-coffee-500" />}
                                  </Button>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge className="bg-coffee-100 text-coffee-800 text-[10px] border border-coffee-200 font-mono">
                                    {record.jobOrderId || '-'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-coffee-600 hidden md:table-cell">{record.batchIdInput || '-'}</td>
                                <td className="px-4 py-3 text-xs text-coffee-600">{record.processingDate ? new Date(record.processingDate).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3 text-xs font-medium text-coffee-800 hidden md:table-cell">{record.inputQuantityKg ? `${record.inputQuantityKg} kg` : '-'}</td>
                                <td className="px-4 py-3">
                                  <Badge className={`${methodColor(record.processingMethod)} text-[10px] border-0`}>
                                    {record.processingMethod || '-'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs font-medium text-coffee-800 hidden lg:table-cell">{record.finalOutputWeightKg ? `${record.finalOutputWeightKg} kg` : '-'}</td>
                                <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{record.overallOutturn ? `${record.overallOutturn}%` : '-'}</td>
                                <td className="px-4 py-3">
                                  {record.cupScore !== null && record.cupScore !== undefined ? (
                                    <Badge className={`${cupScoreColor(record.cupScore)} text-[10px] border-0 font-bold`}>{record.cupScore}</Badge>
                                  ) : <span className="text-xs text-coffee-400">-</span>}
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                  {record.qcApprovedBy ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-coffee-300" />
                                  )}
                                </td>
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
                              </tr>

                              {/* Expandable stages sub-table */}
                              {expandedRows.has(record.id) && record.processingStages.length > 0 && (
                                <tr>
                                  <td colSpan={11} className="px-8 py-3 bg-coffee-50/50">
                                    <div className="rounded-xl border border-coffee-200 overflow-hidden">
                                      <table className="w-full text-left">
                                        <thead>
                                          <tr className="bg-coffee-100/50">
                                            <th className="px-3 py-2 text-[9px] font-bold text-coffee-600 uppercase">{t('Giai đoạn', 'Stage')}</th>
                                            <th className="px-3 py-2 text-[9px] font-bold text-coffee-600 uppercase">{t('Ngày', 'Date')}</th>
                                            <th className="px-3 py-2 text-[9px] font-bold text-coffee-600 uppercase">{t('TL vào', 'In Wt')}</th>
                                            <th className="px-3 py-2 text-[9px] font-bold text-coffee-600 uppercase">{t('TL ra', 'Out Wt')}</th>
                                            <th className="px-3 py-2 text-[9px] font-bold text-coffee-600 uppercase">{t('Thời gian', 'Duration')}</th>
                                            <th className="px-3 py-2 text-[9px] font-bold text-coffee-600 uppercase">{t('Máy', 'Machine')}</th>
                                            <th className="px-3 py-2 text-[9px] font-bold text-coffee-600 uppercase">{t('QC', 'QC')}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {record.processingStages.map((stage) => (
                                            <tr key={stage.id} className="border-t border-coffee-100">
                                              <td className="px-3 py-2">
                                                <Badge className={`${stageTypeColor(stage.stageType)} text-[9px] border-0`}>{stage.stageType || '-'}</Badge>
                                              </td>
                                              <td className="px-3 py-2 text-[10px] text-coffee-600">{stage.stageDate ? new Date(stage.stageDate).toLocaleDateString() : '-'}</td>
                                              <td className="px-3 py-2 text-[10px] text-coffee-600">{stage.inputWeight ? `${stage.inputWeight} kg` : '-'}</td>
                                              <td className="px-3 py-2 text-[10px] text-coffee-600">{stage.outputWeight ? `${stage.outputWeight} kg` : '-'}</td>
                                              <td className="px-3 py-2 text-[10px] text-coffee-600">{stage.durationMinutes ? `${stage.durationMinutes} min` : '-'}</td>
                                              <td className="px-3 py-2 text-[10px] text-coffee-600">{stage.machineUsed || '-'}</td>
                                              <td className="px-3 py-2">
                                                {stage.qualityCheckPassed ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-coffee-300" />}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {expandedRows.has(record.id) && record.processingStages.length === 0 && (
                                <tr>
                                  <td colSpan={11} className="px-8 py-3 bg-coffee-50/50 text-[10px] text-coffee-400 italic">
                                    {t('Chưa có giai đoạn chế biến nào', 'No processing stages recorded')}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-coffee-100">
              <p className="text-[10px] text-coffee-500">{t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0 rounded-lg border-coffee-200"><ChevronLeft className="w-3 h-3" /></Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-coffee-700 text-white' : 'border-coffee-200 text-coffee-600'}`}>{p}</Button>
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0 rounded-lg border-coffee-200"><ChevronRight className="w-3 h-3" /></Button>
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
            {t(`Bạn có chắc muốn xóa lệnh "${deletingRecord?.jobOrderId || ''}"?`, `Are you sure you want to delete job order "${deletingRecord?.jobOrderId || ''}"?`)}
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
