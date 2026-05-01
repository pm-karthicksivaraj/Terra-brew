'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Nfc, Search, Plus, ChevronLeft, ChevronRight, Loader2,
  Shield, CheckCircle2, XCircle, AlertTriangle, Eye, Hash,
  QrCode, Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

// ─── Types ─────────────────────────────────────────────────────────

interface NFCRecord {
  id: string
  qrCode: string
  entityType: string
  entityId: string
  hmacSignature: string
  scanCount: number
  lastScannedAt: string | null
  createdAt: string
  isActive: boolean
}

interface NFCVerifyResult {
  status: 'valid' | 'invalid' | 'not_found'
  message: string
  qrCode: string
  entityType?: string
  entityId?: string
  signatureValid?: boolean
  isNFC?: boolean
  entityDetails?: Record<string, unknown> | null
  scanCount?: number
  lastScannedAt?: string | null
}

interface EntityOption {
  id: string
  label: string
}

// ─── Constants ─────────────────────────────────────────────────────

const ENTITY_TYPES = [
  { value: 'Farmer', labelVi: 'Nông dân', labelEn: 'Farmer' },
  { value: 'FarmLand', labelVi: 'Đất nông trại', labelEn: 'Farm Land' },
  { value: 'Cultivation', labelVi: 'Canh tác', labelEn: 'Cultivation' },
  { value: 'HarvestTraceability', labelVi: 'Thu hoạch', labelEn: 'Harvest Batch' },
  { value: 'ProcurementRecord', labelVi: 'Thu mua', labelEn: 'Procurement' },
  { value: 'ProcessingJobOrder', labelVi: 'Chế biến', labelEn: 'Processing' },
]

const ENTITY_API_MAP: Record<string, string> = {
  Farmer: '/api/farmers',
  FarmLand: '/api/farmlands',
  Cultivation: '/api/cultivations',
  HarvestTraceability: '/api/harvest-traceabilities',
  ProcurementRecord: '/api/procurement',
  ProcessingJobOrder: '/api/processing',
}

const ENTITY_LABEL_KEY: Record<string, string> = {
  Farmer: 'fullName',
  FarmLand: 'farmName',
  Cultivation: 'farmPlotName',
  HarvestTraceability: 'batchId',
  ProcurementRecord: 'procurementId',
  ProcessingJobOrder: 'jobOrderId',
}

const ENTITY_DATA_KEY: Record<string, string> = {
  Farmer: 'farmers',
  FarmLand: 'farmLands',
  Cultivation: 'cultivations',
  HarvestTraceability: 'harvestTraceabilities',
  ProcurementRecord: 'procurementRecords',
  ProcessingJobOrder: 'processingJobOrders',
}

// ─── Helpers ───────────────────────────────────────────────────────

function stripNFCPrefix(entityType: string): string {
  return entityType.startsWith('NFC_') ? entityType.substring(4) : entityType
}

function extractNfcTagId(qrCode: string): string {
  return qrCode.startsWith('NFC-') ? qrCode.substring(4) : qrCode
}

function truncateMiddle(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  const half = Math.floor((maxLen - 3) / 2)
  return str.slice(0, half) + '...' + str.slice(str.length - half)
}

// ─── Component ─────────────────────────────────────────────────────

export default function NFCTagsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  // List state
  const [records, setRecords] = useState<NFCRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Bind dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bindForm, setBindForm] = useState({
    entityType: '',
    entityId: '',
    nfcTagId: '',
  })
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([])
  const [entityOptionsLoading, setEntityOptionsLoading] = useState(false)

  // Verify state
  const [verifyInput, setVerifyInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<NFCVerifyResult | null>(null)


  // ─── Fetch NFC Tags ─────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (entityTypeFilter && entityTypeFilter !== 'all') {
        params.set('entityType', entityTypeFilter)
      }
      const res = await fetch(`/api/nfc?${params}`)
      const data = await res.json()
      if (data.success) {
        setRecords((data.data?.items ?? data.data?.data ?? []) || [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch NFC tags', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, entityTypeFilter])

  // ─── Fetch Entity Options ────────────────────────────────────────

  const fetchEntityOptions = useCallback(async (entityType: string) => {
    if (!entityType) {
      setEntityOptions([])
      return
    }
    setEntityOptionsLoading(true)
    setBindForm(prev => ({ ...prev, entityId: '' }))

    const apiUrl = ENTITY_API_MAP[entityType]
    if (!apiUrl) {
      setEntityOptionsLoading(false)
      return
    }

    try {
      const res = await fetch(`${apiUrl}?pageSize=100`)
      const data = await res.json()
      if (data.success) {
        const dataKey = ENTITY_DATA_KEY[entityType] || 'data'
        const items = data.data?.[dataKey] || data.data?.data || []
        const labelKey = ENTITY_LABEL_KEY[entityType] || 'id'
        const options = items.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          label: (item[labelKey] as string) || (item.id as string).substring(0, 8),
        }))
        setEntityOptions(options)
      } else {
        setEntityOptions([])
      }
    } catch {
      setEntityOptions([])
    } finally {
      setEntityOptionsLoading(false)
    }
  }, [])

  // ─── Effects ─────────────────────────────────────────────────────

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchRecords()
    }
  }, [status, router, fetchRecords])

  useEffect(() => {
    if (bindForm.entityType) {
      fetchEntityOptions(bindForm.entityType)
    } else {
      setEntityOptions([])
    }
  }, [bindForm.entityType, fetchEntityOptions])

  // ─── Handlers ────────────────────────────────────────────────────

  const resetBindForm = () => {
    setBindForm({ entityType: '', entityId: '', nfcTagId: '' })
    setEntityOptions([])
  }

  const handleBindSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bindForm.entityType || !bindForm.entityId || !bindForm.nfcTagId.trim()) {
      toast.error(t2('Vui lòng điền đầy đủ thông tin', 'Please fill in all fields'))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/nfc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: bindForm.entityType,
          entityId: bindForm.entityId,
          nfcTagId: bindForm.nfcTagId.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t2('Gắn NFC Tag thành công!', 'NFC Tag bound successfully!'))
        setDialogOpen(false)
        resetBindForm()
        fetchRecords()
      } else {
        toast.error(data.error || t2('Lỗi khi gắn NFC Tag', 'Error binding NFC Tag'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = useCallback(async () => {
    if (!verifyInput.trim()) {
      toast.error(t2('Vui lòng nhập NFC Tag ID', 'Please enter NFC Tag ID'))
      return
    }
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch('/api/nfc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfcTagId: verifyInput.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setVerifyResult(data.data)
      } else {
        setVerifyResult({
          status: 'not_found',
          message: data.error || t2('Không thể xác minh', 'Unable to verify'),
          qrCode: verifyInput.trim(),
          signatureValid: false,
          entityDetails: null,
          scanCount: 0,
        })
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setVerifying(false)
    }
  }, [verifyInput, t])

  const handleVerifyFromTable = useCallback(async (nfcTagId: string) => {
    setVerifyInput(nfcTagId)
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch('/api/nfc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfcTagId }),
      })
      const data = await res.json()
      if (data.success) {
        setVerifyResult(data.data)
      } else {
        setVerifyResult({
          status: 'not_found',
          message: data.error || t2('Không thể xác minh', 'Unable to verify'),
          qrCode: nfcTagId,
          signatureValid: false,
          entityDetails: null,
          scanCount: 0,
        })
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setVerifying(false)
    }
  }, [t])

  const totalPages = Math.ceil(total / pageSize)

  // ─── Loading State ───────────────────────────────────────────────

  if (status === 'loading' || (loading && records.length === 0)) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br   flex items-center justify-center">
              <Nfc className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <DashboardShell>
      <div>
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Nfc className="w-5 h-5 text-foreground" />
              {t2('Quản lý NFC Tags', 'NFC Tag Management')}
            </h2>
            <p className="text-sm text-foreground">
              {t(
                `Gắn, xác minh và quản lý NFC Tags cho các thực thể truy xuất nguồn gốc`,
                `Bind, verify and manage NFC Tags for traceability entities`
              )}
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetBindForm() }}>
            <DialogTrigger asChild>
              <Button
                className="btn-primary-gradient gap-2 rounded-xl shadow-sm"
                onClick={() => { resetBindForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t2('Gắn NFC Tag', 'Bind NFC Tag')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Nfc className="w-5 h-5" />
                  {t2('Gắn NFC Tag mới', 'Bind New NFC Tag')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBindSubmit} className="space-y-4">
                {/* Entity Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t2('Loại thực thể', 'Entity Type')} *</Label>
                  <Select
                    value={bindForm.entityType}
                    onValueChange={(v) => setBindForm({ ...bindForm, entityType: v, entityId: '' })}
                  >
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder={t2('Chọn loại thực thể...', 'Select entity type...')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((et) => (
                        <SelectItem key={et.value} value={et.value}>
                          {t(et.labelVi, et.labelEn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity ID */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t2('Chọn thực thể', 'Select Entity')} *</Label>
                  {entityOptionsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-foreground py-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t2('Đang tải...', 'Loading...')}
                    </div>
                  ) : entityOptions.length > 0 ? (
                    <Select value={bindForm.entityId} onValueChange={(v) => setBindForm({ ...bindForm, entityId: v })}>
                      <SelectTrigger className="rounded-xl border-border">
                        <SelectValue placeholder={t2('Chọn...', 'Select...')} />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {entityOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            <span className="font-mono text-xs">{opt.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : bindForm.entityType ? (
                    <p className="text-xs text-foreground py-2">{t2('Không có dữ liệu', 'No data available')}</p>
                  ) : (
                    <p className="text-xs text-foreground py-2">{t2('Chọn loại thực thể trước', 'Select entity type first')}</p>
                  )}
                </div>

                {/* NFC Tag ID */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t2('Mã NFC Tag', 'NFC Tag ID')} *</Label>
                  <Input
                    value={bindForm.nfcTagId}
                    onChange={(e) => setBindForm({ ...bindForm, nfcTagId: e.target.value })}
                    placeholder={t2('Nhập mã NFC Tag vật lý...', 'Enter physical NFC Tag ID...')}
                    className="rounded-xl border-border focus:border-border font-mono"
                  />
                  <p className="text-[10px] text-foreground">
                    {t(
                      'Mã ID của chip NFC vật lý, ví dụ: NFC-A1B2C3',
                      'Physical NFC chip ID, e.g.: NFC-A1B2C3'
                    )}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetBindForm() }} className="rounded-xl">
                    {t2('Hủy', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !bindForm.entityType || !bindForm.entityId || !bindForm.nfcTagId.trim()}
                    className="btn-primary-gradient rounded-xl"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang gắn...', 'Binding...')}</>
                    ) : t2('Gắn Tag', 'Bind Tag')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ─── Main Grid: Table + Verify Panel ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ─── NFC Tag List Table ─── */}
          <div className="xl:col-span-2">
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Select
                  value={entityTypeFilter}
                  onValueChange={(v) => { setEntityTypeFilter(v); setPage(1) }}
                >
                  <SelectTrigger className="rounded-xl border-border bg-background">
                    <SelectValue placeholder={t2('Lọc loại thực thể...', 'Filter entity type...')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t2('Tất cả', 'All')}</SelectItem>
                    {ENTITY_TYPES.map((et) => (
                      <SelectItem key={et.value} value={et.value}>
                        {t(et.labelVi, et.labelEn)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="border-border text-foreground text-xs">
                {t(`${total} bản ghi`, `${total} records`)}
              </Badge>
            </div>

            {/* Table */}
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="px-4 py-3 text-[10px] font-bold text-foreground uppercase tracking-wider">
                        {t2('NFC Tag ID', 'NFC Tag ID')}
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-foreground uppercase tracking-wider">
                        {t2('Loại thực thể', 'Entity Type')}
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-foreground uppercase tracking-wider hidden md:table-cell">
                        {t2('Mã thực thể', 'Entity ID')}
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-foreground uppercase tracking-wider hidden lg:table-cell">
                        {t2('QR Code', 'QR Code')}
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-foreground uppercase tracking-wider hidden lg:table-cell">
                        HMAC
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-foreground uppercase tracking-wider hidden md:table-cell">
                        {t2('Ngày tạo', 'Created At')}
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-foreground uppercase tracking-wider">
                        {t2('Thao tác', 'Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-foreground text-sm">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            {t2('Không có NFC Tag nào', 'No NFC tags found')}
                          </td>
                        </tr>
                      ) : (
                        records.map((record, i) => {
                          const tagId = extractNfcTagId(record.qrCode)
                          const rawEntityType = stripNFCPrefix(record.entityType)
                          const entityTypeLabel = ENTITY_TYPES.find(et => et.value === rawEntityType)
                          const displayType = entityTypeLabel
                            ? t(entityTypeLabel.labelVi, entityTypeLabel.labelEn)
                            : rawEntityType

                          return (
                            <tr key={record.id}
 className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="px-4 py-3">
                                <Badge className="bg-muted text-foreground text-[10px] border border-border font-mono font-bold">
                                  {tagId}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className="bg-amber-50 text-amber-700 text-[10px] border border-amber-200">
                                  {displayType}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-xs text-foreground font-mono hidden md:table-cell">
                                {truncateMiddle(record.entityId, 12)}
                              </td>
                              <td className="px-4 py-3 text-xs text-foreground font-mono hidden lg:table-cell">
                                {truncateMiddle(record.qrCode, 16)}
                              </td>
                              <td className="px-4 py-3 text-[10px] text-foreground font-mono hidden lg:table-cell">
                                {truncateMiddle(record.hmacSignature, 20)}
                              </td>
                              <td className="px-4 py-3 text-xs text-foreground hidden md:table-cell">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-foreground hover:text-foreground"
                                  onClick={() => handleVerifyFromTable(tagId)}
                                  title={t2('Xác minh', 'Verify')}
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      )}
</tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-[10px] text-foreground">
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
                          className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-muted text-white' : 'border-border text-foreground'}`}
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
          </div>

          {/* ─── NFC Verification Panel ─── */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br   flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {t2('Xác minh NFC', 'NFC Verification')}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">
                    {t2('Mã NFC Tag ID', 'NFC Tag ID')}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                      <Input
                        value={verifyInput}
                        onChange={(e) => setVerifyInput(e.target.value)}
                        placeholder={t2('Nhập NFC Tag ID...', 'Enter NFC Tag ID...')}
                        className="pl-9 rounded-xl border-border focus:border-border font-mono text-xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      />
                    </div>
                    <Button
                      onClick={handleVerify}
                      disabled={verifying}
                      className="btn-primary-gradient rounded-xl gap-2 shrink-0"
                    >
                      {verifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      {t2('Xác minh', 'Verify')}
                    </Button>
                  </div>
                </div>

                {/* Verification Result */}
                {verifyResult && (
                    <div key={verifyResult.status}>
                      {/* ─── Valid ─── */}
                      {verifyResult.status === 'valid' && (
                        <div className="rounded-xl border-2 border-green-200 bg-green-50/80 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-sm font-bold text-green-800">
                              {t2('Hợp lệ — Tag toàn vẹn', 'Valid — Tag Intact')}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                                {verifyResult.entityType}
                              </Badge>
                              <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                                <Shield className="w-3 h-3 mr-1" />
                                {t2('Chữ ký hợp lệ', 'Signature Valid')}
                              </Badge>
                              {verifyResult.isNFC && (
                                <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                                  <Nfc className="w-3 h-3 mr-1" />
                                  NFC
                                </Badge>
                              )}
                            </div>

                            {/* Entity Details */}
                            {verifyResult.entityDetails && (
                              <div className="bg-card/60 rounded-lg p-3 space-y-1">
                                {Object.entries(verifyResult.entityDetails).slice(0, 8).map(([key, value]) => {
                                  if (value === null || value === undefined || typeof value === 'object') return null
                                  return (
                                    <div key={key} className="flex justify-between text-[11px]">
                                      <span className="text-foreground">{key}</span>
                                      <span className="text-foreground font-medium truncate ml-2 max-w-[140px]">
                                        {String(value)}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-[10px] text-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {t(`Lượt quét: ${verifyResult.scanCount || 0}`, `Scans: ${verifyResult.scanCount || 0}`)}
                              </span>
                              {verifyResult.lastScannedAt && (
                                <span>{new Date(verifyResult.lastScannedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─── Invalid ─── */}
                      {verifyResult.status === 'invalid' && (
                        <div className="rounded-xl border-2 border-red-200 bg-red-50/80 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-sm font-bold text-red-800">
                              {t2('Không hợp lệ — Phát hiện giả mạo!', 'Invalid — Tampering Detected!')}
                            </span>
                          </div>
                          <p className="text-xs text-red-700">
                            {verifyResult.message}
                          </p>
                          <div className="bg-card/60 rounded-lg p-2 space-y-1">
                            <div className="flex items-center gap-1 text-[10px] text-foreground mb-1">
                              <Hash className="w-3 h-3" />
                              HMAC Signature
                            </div>
                            <p className="text-[10px] font-mono text-red-700 break-all">
                              {t(
                                'Chữ ký không khớp — dữ liệu có thể đã bị thay đổi!',
                                'Signature mismatch — data may have been altered!'
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ─── Not Found ─── */}
                      {verifyResult.status === 'not_found' && (
                        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50/80 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <span className="text-sm font-bold text-yellow-800">
                              {t2('Không tìm thấy', 'Not Found')}
                            </span>
                          </div>
                          <p className="text-xs text-yellow-700">
                            {t(
                              'NFC Tag không tồn tại trong hệ thống. Vui lòng kiểm tra lại mã.',
                              'NFC Tag not found in system. Please double check the ID.'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
</div>
            </Card>

            {/* ─── Info Card ─── */}
            <div className="mt-4">
              <Card className="rounded-2xl border-0 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br   flex items-center justify-center">
                    <QrCode className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">
                    {t2('NFC vs QR Code', 'NFC vs QR Code')}
                  </h4>
                </div>
                <div className="space-y-2 text-[10px] text-foreground">
                  <div className="flex items-start gap-2">
                    <Nfc className="w-3.5 h-3.5 text-foreground mt-0.5 shrink-0" />
                    <p>{t2('NFC Tags sử dụng chip vật lý, chống sao chép tốt hơn QR Code.', 'NFC Tags use physical chips, harder to copy than QR Codes.')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-foreground mt-0.5 shrink-0" />
                    <p>{t2('Mỗi NFC Tag được ký bằng HMAC-SHA256 để đảm bảo tính toàn vẹn.', 'Each NFC Tag is signed with HMAC-SHA256 to ensure integrity.')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Link2 className="w-3.5 h-3.5 text-foreground mt-0.5 shrink-0" />
                    <p>{t2('NFC Tags được ghi vào chuỗi khối (hash chain) để truy xuất nguồn gốc.', 'NFC Tags are recorded in hash chain for traceability.')}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
