'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Award, Search, Plus, ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, Eye, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
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
  const { t, t2, lang } = useI18n()
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
        const _records = data.data?.data ?? data.data?.items ?? []; setRecords(Array.isArray(_records) ? _records : [])
        setTotal(data.data?.total ?? 0)
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
        toast.success(editingRecord ? t2('Cập nhật thành công!', 'Updated successfully!') : t2('Tạo mới thành công!', 'Created successfully!'))
        setDialogOpen(false)
        resetForm()
        fetchRecords()
      } else {
        toast.error(data.error || t2('Lỗi khi lưu', 'Error saving'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
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
        toast.success(t2('Xóa thành công!', 'Deleted successfully!'))
        setDeleteDialogOpen(false)
        setDeletingRecord(null)
        fetchRecords()
      } else {
        toast.error(data.error || t2('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
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
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'suspended': return 'bg-orange-100 text-orange-700'
      default: return 'bg-muted text-muted-foreground'
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
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Award className="w-9 h-9 text-primary-foreground animate-pulse" />
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
              <Award className="w-5 h-5 text-muted-foreground" />
              {t2('Đánh giá Chứng nhận', 'Certification Assessment')}
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
                {t2('Thêm mới', 'Add New')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {editingRecord ? t2('Sửa đánh giá', 'Edit Assessment') : t2('Thêm đánh giá mới', 'Add New Assessment')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nông dân', 'Farmer')}</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn nông dân', 'Select farmer')} /></SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (<SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Land */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Đất nông trại', 'Farm Land')}</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn đất', 'Select farm land')} /></SelectTrigger>
                      <SelectContent>
                        {farmLands.filter(fl => !form.farmerId || fl.farmerId === form.farmerId).map((fl) => (<SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assessment ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Mã đánh giá', 'Assessment ID')}</Label>
                    <Input value={form.assessmentId} onChange={(e) => setForm({ ...form, assessmentId: e.target.value })} placeholder="CERT-2024-001" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Assessment Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Ngày đánh giá', 'Assessment Date')}</Label>
                    <Input type="date" value={form.assessmentDate} onChange={(e) => setForm({ ...form, assessmentDate: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Certification Standard */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tiêu chuẩn', 'Certification Standard')} *</Label>
                    <Select value={form.certificationStandard} onValueChange={(v) => setForm({ ...form, certificationStandard: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn tiêu chuẩn', 'Select standard')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Organic">{t2('Hữu cơ', 'Organic')}</SelectItem>
                        <SelectItem value="Fairtrade">{t2('Thương mại công bằng', 'Fairtrade')}</SelectItem>
                        <SelectItem value="Rainforest Alliance">{t2('Liên minh rừng mưa', 'Rainforest Alliance')}</SelectItem>
                        <SelectItem value="UTZ">{t2('UTZ', 'UTZ')}</SelectItem>
                        <SelectItem value="4C">{t2('4C', '4C')}</SelectItem>
                        <SelectItem value="GAP">{t2('GAP', 'GAP')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Certifying Body */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tổ chức CC', 'Certifying Body')}</Label>
                    <Input value={form.certifyingBody} onChange={(e) => setForm({ ...form, certifyingBody: e.target.value })} placeholder={t2('Control Union', 'Control Union')} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Assessment Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Loại đánh giá', 'Assessment Type')}</Label>
                    <Select value={form.assessmentType} onValueChange={(v) => setForm({ ...form, assessmentType: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn loại', 'Select type')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">{t2('Ban đầu', 'Initial')}</SelectItem>
                        <SelectItem value="surveillance">{t2('Giám sát', 'Surveillance')}</SelectItem>
                        <SelectItem value="renewal">{t2('Gia hạn', 'Renewal')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scope */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Phạm vi', 'Scope')}</Label>
                    <Input value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} placeholder={t2('Sản xuất cà phê', 'Coffee production')} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Trạng thái', 'Status')}</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">{t2('Đang hiệu lực', 'Active')}</SelectItem>
                        <SelectItem value="Expired">{t2('Hết hạn', 'Expired')}</SelectItem>
                        <SelectItem value="Pending">{t2('Chờ duyệt', 'Pending')}</SelectItem>
                        <SelectItem value="Suspended">{t2('Bị đình chỉ', 'Suspended')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Điểm', 'Score')}</Label>
                    <Input type="number" step="0.5" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="85" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Max Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Điểm tối đa', 'Max Score')}</Label>
                    <Input type="number" step="0.5" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} placeholder="100" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Valid From */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Hiệu lực từ', 'Valid From')}</Label>
                    <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Valid Until */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Hiệu lực đến', 'Valid Until')}</Label>
                    <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Certificate Number */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Số chứng chỉ', 'Certificate Number')}</Label>
                    <Input value={form.certificateNumber} onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })} placeholder="CERT-12345" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Findings */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Kết quả đánh giá', 'Findings')}</Label>
                    <Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} placeholder={t2('Mô tả kết quả...', 'Describe findings...')} className="rounded-xl border-input focus:border-primary" rows={2} />
                  </div>

                  {/* Non Conformities */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Không phù hợp', 'Non-Conformities')}</Label>
                    <Textarea value={form.nonConformities} onChange={(e) => setForm({ ...form, nonConformities: e.target.value })} placeholder={t2('Mô tả không phù hợp...', 'Describe non-conformities...')} className="rounded-xl border-input focus:border-primary" rows={2} />
                  </div>

                  {/* Corrective Actions */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Hành động khắc phục', 'Corrective Actions')}</Label>
                    <Textarea value={form.correctiveActions} onChange={(e) => setForm({ ...form, correctiveActions: e.target.value })} placeholder={t2('Mô tả khắc phục...', 'Describe corrective actions...')} className="rounded-xl border-input focus:border-primary" rows={2} />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Ghi chú', 'Notes')}</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t2('Ghi chú thêm...', 'Additional notes...')} className="rounded-xl border-input focus:border-primary" rows={2} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">{t2('Hủy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang lưu...', 'Saving...')}</> : editingRecord ? t2('Cập nhật', 'Update') : t2('Tạo mới', 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {statusTabs.map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => { setStatusTab(tab.key); setPage(1) }}
                className={`rounded-lg text-xs h-7 px-3 ${statusTab === tab.key ? 'bg-background shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t(tab.vi, tab.en)}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t2('Tìm kiếm chứng nhận...', 'Search certifications...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Mã ĐG', 'Assess. ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Tiêu chuẩn', 'Standard')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Tổ chức CC', 'Body')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Điểm', 'Score')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Hiệu lực đến', 'Valid Until')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {t2('Không có bản ghi nào', 'No records found')}
                      </td>
                    </tr>
                  ) : (
                    records.map((record, i) => (
                      <tr key={record.id}
 className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <Badge className="bg-muted text-foreground text-[10px] border text-border font-mono">
                            {record.assessmentId || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{record.farmer?.fullName || '-'}</p>
                          <p className="text-[10px] text-muted-foreground">{record.farmer?.farmerCode}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground hidden md:table-cell">{record.certificationStandard || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{record.certifyingBody || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{record.assessmentType || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${statusColor(record.status)} text-[10px] border-0`}>
                            {record.status === 'Active' ? t2('Hiệu lực', 'Active') :
                             record.status === 'Expired' ? t2('Hết hạn', 'Expired') :
                             record.status === 'Pending' ? t2('Chờ duyệt', 'Pending') :
                             record.status === 'Suspended' ? t2('Đình chỉ', 'Suspended') : record.status || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {record.score !== null && record.score !== undefined ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                                  style={{ width: `${Math.min(100, (record.score / (record.maxScore || 100)) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-medium text-foreground">
                                {record.score}{record.maxScore ? `/${record.maxScore}` : ''}
                              </span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">-</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{record.validUntil ? new Date(record.validUntil).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/cert-assessments/${record.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
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
              {t2('Xác nhận xóa', 'Confirm Delete')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t(`Bạn có chắc muốn xóa đánh giá "${deletingRecord?.assessmentId || ''}"?`, `Are you sure you want to delete assessment "${deletingRecord?.assessmentId || ''}"?`)}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">{t2('Hủy', 'Cancel')}</Button>
            <Button onClick={handleDelete} disabled={submitting} className="bg-red-600 text-white rounded-xl hover:bg-red-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t2('Xóa', 'Delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
