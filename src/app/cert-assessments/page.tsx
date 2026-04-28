'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Award, Search, Plus, ChevronLeft, ChevronRight, Loader2,
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

interface Farmer {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLand {
  id: string
  farmName: string
  farmerId: string
}

interface CertRecord {
  id: string
  farmerId: string | null
  farmLandId: string | null
  assessmentId: string | null
  assessmentDate: string | null
  certificationStandard: string | null
  certifyingBody: string | null
  assessmentType: string | null
  scope: string | null
  status: string | null
  score: number | null
  maxScore: number | null
  findings: string | null
  nonConformities: string | null
  correctiveActions: string | null
  validFrom: string | null
  validUntil: string | null
  certificateNumber: string | null
  notes: string | null
  isActive: boolean
  farmer: Farmer | null
}

const initialForm = {
  farmerId: '',
  farmLandId: '',
  assessmentId: '',
  assessmentDate: '',
  certificationStandard: '',
  certifyingBody: '',
  assessmentType: '',
  scope: '',
  status: 'Active',
  score: '',
  maxScore: '',
  findings: '',
  nonConformities: '',
  correctiveActions: '',
  validFrom: '',
  validUntil: '',
  certificateNumber: '',
  notes: '',
}

type StatusTab = 'all' | 'Active' | 'Expired' | 'Pending' | 'Suspended'

export default function CertAssessmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [records, setRecords] = useState<CertRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<StatusTab>('all')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<CertRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<CertRecord | null>(null)
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
      if (statusTab !== 'all') params.set('status', statusTab)
      const res = await fetch(`/api/cert-assessments?${params}`)
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
  }, [page, pageSize, search, statusTab])

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
        score: form.score ? parseFloat(form.score) : undefined,
        maxScore: form.maxScore ? parseFloat(form.maxScore) : undefined,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
      }
      if (editingRecord) Object.assign(payload, { id: editingRecord.id })

      const res = await fetch('/api/cert-assessments', {
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
      const res = await fetch(`/api/cert-assessments?id=${deletingRecord.id}`, { method: 'DELETE' })
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

  const openEditDialog = (record: CertRecord) => {
    setEditingRecord(record)
    setForm({
      farmerId: record.farmerId || '',
      farmLandId: record.farmLandId || '',
      assessmentId: record.assessmentId || '',
      assessmentDate: record.assessmentDate ? record.assessmentDate.slice(0, 10) : '',
      certificationStandard: record.certificationStandard || '',
      certifyingBody: record.certifyingBody || '',
      assessmentType: record.assessmentType || '',
      scope: record.scope || '',
      status: record.status || 'Active',
      score: record.score?.toString() || '',
      maxScore: record.maxScore?.toString() || '',
      findings: record.findings || '',
      nonConformities: record.nonConformities || '',
      correctiveActions: record.correctiveActions || '',
      validFrom: record.validFrom ? record.validFrom.slice(0, 10) : '',
      validUntil: record.validUntil ? record.validUntil.slice(0, 10) : '',
      certificateNumber: record.certificateNumber || '',
      notes: record.notes || '',
    })
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)

  const statusColor = (s: string | null) => {
    switch (s?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'expired': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'suspended': return 'bg-orange-100 text-orange-700'
      default: return 'bg-coffee-100 text-coffee-600'
    }
  }

  const statusTabs: { key: StatusTab; vi: string; en: string }[] = [
    { key: 'all', vi: 'Tất cả', en: 'All' },
    { key: 'Active', vi: 'Đang hiệu lực', en: 'Active' },
    { key: 'Expired', vi: 'Hết hạn', en: 'Expired' },
    { key: 'Pending', vi: 'Chờ duyệt', en: 'Pending' },
    { key: 'Suspended', vi: 'Bị đình chỉ', en: 'Suspended' },
  ]

  if (status === 'loading' || (loading && records.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Award className="w-9 h-9 text-white animate-pulse" />
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
              <Award className="w-5 h-5 text-coffee-600" />
              {t('Đánh giá Chứng nhận', 'Certification Assessment')}
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
                  <Award className="w-5 h-5" />
                  {editingRecord ? t('Sửa đánh giá', 'Edit Assessment') : t('Thêm đánh giá mới', 'Add New Assessment')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Nông dân', 'Farmer')}</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-coffee-200"><SelectValue placeholder={t('Chọn nông dân', 'Select farmer')} /></SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (<SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Land */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Đất nông trại', 'Farm Land')}</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200"><SelectValue placeholder={t('Chọn đất', 'Select farm land')} /></SelectTrigger>
                      <SelectContent>
                        {farmLands.filter(fl => !form.farmerId || fl.farmerId === form.farmerId).map((fl) => (<SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assessment ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Mã đánh giá', 'Assessment ID')}</Label>
                    <Input value={form.assessmentId} onChange={(e) => setForm({ ...form, assessmentId: e.target.value })} placeholder="CERT-2024-001" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Assessment Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày đánh giá', 'Assessment Date')}</Label>
                    <Input type="date" value={form.assessmentDate} onChange={(e) => setForm({ ...form, assessmentDate: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Certification Standard */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tiêu chuẩn', 'Certification Standard')} *</Label>
                    <Select value={form.certificationStandard} onValueChange={(v) => setForm({ ...form, certificationStandard: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200"><SelectValue placeholder={t('Chọn tiêu chuẩn', 'Select standard')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Organic">{t('Hữu cơ', 'Organic')}</SelectItem>
                        <SelectItem value="Fairtrade">{t('Thương mại công bằng', 'Fairtrade')}</SelectItem>
                        <SelectItem value="Rainforest Alliance">{t('Liên minh rừng mưa', 'Rainforest Alliance')}</SelectItem>
                        <SelectItem value="UTZ">{t('UTZ', 'UTZ')}</SelectItem>
                        <SelectItem value="4C">{t('4C', '4C')}</SelectItem>
                        <SelectItem value="GAP">{t('GAP', 'GAP')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Certifying Body */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tổ chức CC', 'Certifying Body')}</Label>
                    <Input value={form.certifyingBody} onChange={(e) => setForm({ ...form, certifyingBody: e.target.value })} placeholder={t('Control Union', 'Control Union')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Assessment Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Loại đánh giá', 'Assessment Type')}</Label>
                    <Select value={form.assessmentType} onValueChange={(v) => setForm({ ...form, assessmentType: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200"><SelectValue placeholder={t('Chọn loại', 'Select type')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">{t('Ban đầu', 'Initial')}</SelectItem>
                        <SelectItem value="surveillance">{t('Giám sát', 'Surveillance')}</SelectItem>
                        <SelectItem value="renewal">{t('Gia hạn', 'Renewal')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scope */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Phạm vi', 'Scope')}</Label>
                    <Input value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} placeholder={t('Sản xuất cà phê', 'Coffee production')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Trạng thái', 'Status')}</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">{t('Đang hiệu lực', 'Active')}</SelectItem>
                        <SelectItem value="Expired">{t('Hết hạn', 'Expired')}</SelectItem>
                        <SelectItem value="Pending">{t('Chờ duyệt', 'Pending')}</SelectItem>
                        <SelectItem value="Suspended">{t('Bị đình chỉ', 'Suspended')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Điểm', 'Score')}</Label>
                    <Input type="number" step="0.5" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="85" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Max Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Điểm tối đa', 'Max Score')}</Label>
                    <Input type="number" step="0.5" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} placeholder="100" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Valid From */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Hiệu lực từ', 'Valid From')}</Label>
                    <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Valid Until */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Hiệu lực đến', 'Valid Until')}</Label>
                    <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Certificate Number */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Số chứng chỉ', 'Certificate Number')}</Label>
                    <Input value={form.certificateNumber} onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })} placeholder="CERT-12345" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Findings */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Kết quả đánh giá', 'Findings')}</Label>
                    <Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} placeholder={t('Mô tả kết quả...', 'Describe findings...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
                  </div>

                  {/* Non Conformities */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Không phù hợp', 'Non-Conformities')}</Label>
                    <Textarea value={form.nonConformities} onChange={(e) => setForm({ ...form, nonConformities: e.target.value })} placeholder={t('Mô tả không phù hợp...', 'Describe non-conformities...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
                  </div>

                  {/* Corrective Actions */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Hành động khắc phục', 'Corrective Actions')}</Label>
                    <Textarea value={form.correctiveActions} onChange={(e) => setForm({ ...form, correctiveActions: e.target.value })} placeholder={t('Mô tả khắc phục...', 'Describe corrective actions...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Ghi chú', 'Notes')}</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t('Ghi chú thêm...', 'Additional notes...')} className="rounded-xl border-coffee-200 focus:border-coffee-500" rows={2} />
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

        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-coffee-50 rounded-xl p-1">
            {statusTabs.map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => { setStatusTab(tab.key); setPage(1) }}
                className={`rounded-lg text-xs h-7 px-3 ${statusTab === tab.key ? 'bg-white shadow-sm text-coffee-800 font-medium' : 'text-coffee-500 hover:text-coffee-700'}`}
              >
                {t(tab.vi, tab.en)}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm chứng nhận...', 'Search certifications...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Mã ĐG', 'Assess. ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Tiêu chuẩn', 'Standard')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Tổ chức CC', 'Body')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Điểm', 'Score')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Hiệu lực đến', 'Valid Until')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-coffee-400 text-sm">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {t('Không có bản ghi nào', 'No records found')}
                      </td>
                    </tr>
                  ) : (
                    records.map((record, i) => (
                      <tr key={record.id}
 className="border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <Badge className="bg-coffee-100 text-coffee-800 text-[10px] border border-coffee-200 font-mono">
                            {record.assessmentId || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-coffee-800">{record.farmer?.fullName || '-'}</p>
                          <p className="text-[10px] text-coffee-400">{record.farmer?.farmerCode}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-coffee-800 hidden md:table-cell">{record.certificationStandard || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{record.certifyingBody || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{record.assessmentType || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${statusColor(record.status)} text-[10px] border-0`}>
                            {record.status === 'Active' ? t('Hiệu lực', 'Active') :
                             record.status === 'Expired' ? t('Hết hạn', 'Expired') :
                             record.status === 'Pending' ? t('Chờ duyệt', 'Pending') :
                             record.status === 'Suspended' ? t('Đình chỉ', 'Suspended') : record.status || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {record.score !== null && record.score !== undefined ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-coffee-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                                  style={{ width: `${Math.min(100, (record.score / (record.maxScore || 100)) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-medium text-coffee-700">
                                {record.score}{record.maxScore ? `/${record.maxScore}` : ''}
                              </span>
                            </div>
                          ) : <span className="text-xs text-coffee-400">-</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{record.validUntil ? new Date(record.validUntil).toLocaleDateString() : '-'}</td>
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
                    ))
                  )}
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
      </div>

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
            {t(`Bạn có chắc muốn xóa đánh giá "${deletingRecord?.assessmentId || ''}"?`, `Are you sure you want to delete assessment "${deletingRecord?.assessmentId || ''}"?`)}
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
