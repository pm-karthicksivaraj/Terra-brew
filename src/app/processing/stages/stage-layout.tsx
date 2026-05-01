'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, AlertTriangle, CheckCircle, XCircle, Factory,
  Eye,
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
import type { LucideIcon } from 'lucide-react'

interface ProcessingStageRecord {
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
  isActive: boolean
  createdAt: string
  updatedAt: string
  jobOrder: {
    id: string
    jobOrderId: string | null
    batchIdInput: string | null
    processingMethod: string | null
  }
}

export interface StageConfig {
  stageType: string
  labelVi: string
  labelEn: string
  icon: LucideIcon
  color: string
}

const initialForm = {
  jobOrderId: '',
  stageDate: '',
  inputWeight: '',
  outputWeight: '',
  durationMinutes: '',
  temperature: '',
  humidity: '',
  machineUsed: '',
  operatorName: '',
  qualityCheckPassed: false,
  notes: '',
}

export function ProcessingStagePage({ config }: { config: StageConfig }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2 } = useI18n()
  const [items, setItems] = useState<ProcessingStageRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<ProcessingStageRecord | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProcessingStageRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<ProcessingStageRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [jobOrders, setJobOrders] = useState<{ id: string; jobOrderId: string | null; batchIdInput: string | null }[]>([])

  const resetForm = () => { setForm(initialForm); setEditingRecord(null) }

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
      const res = await fetch(`/api/processing?${params}`)
      const data = await res.json()
      if (data.success) {
        const allRecords: ProcessingStageRecord[] = []
        const rawItems = data.data?.data ?? data.data?.items ?? []
        for (const jo of Array.isArray(rawItems) ? rawItems : []) {
          for (const stage of jo.processingStages || []) {
            if (stage.stageType?.toLowerCase() === config.stageType.toLowerCase()) {
              allRecords.push({ ...stage, jobOrder: { id: jo.id, jobOrderId: jo.jobOrderId, batchIdInput: jo.batchIdInput, processingMethod: jo.processingMethod } })
            }
          }
        }
        const filtered = search
          ? allRecords.filter((r) =>
              r.operatorName?.toLowerCase().includes(search.toLowerCase()) ||
              r.machineUsed?.toLowerCase().includes(search.toLowerCase()) ||
              r.jobOrder.jobOrderId?.toLowerCase().includes(search.toLowerCase()) ||
              r.jobOrder.batchIdInput?.toLowerCase().includes(search.toLowerCase())
            )
          : allRecords
        setTotal(filtered.length)
        setItems(filtered.slice((page - 1) * pageSize, page * pageSize))
      }
    } catch (err) {
      console.error('Failed to fetch records', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, config.stageType])

  const fetchJobOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/processing?pageSize=500&sortBy=createdAt&sortOrder=desc')
      const data = await res.json()
      if (data.success) {
        const raw = data.data?.data ?? data.data?.items ?? []
        setJobOrders(Array.isArray(raw) ? raw.map((jo: any) => ({ id: jo.id, jobOrderId: jo.jobOrderId, batchIdInput: jo.batchIdInput })) : [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated') {
      fetchItems()
      fetchJobOrders()
    }
  }, [status, router, fetchItems, fetchJobOrders])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        jobOrderId: form.jobOrderId,
        stageType: config.stageType,
        stageDate: form.stageDate || undefined,
        inputWeight: form.inputWeight ? parseFloat(form.inputWeight) : undefined,
        outputWeight: form.outputWeight ? parseFloat(form.outputWeight) : undefined,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        humidity: form.humidity ? parseFloat(form.humidity) : undefined,
        machineUsed: form.machineUsed || undefined,
        operatorName: form.operatorName || undefined,
        qualityCheckPassed: form.qualityCheckPassed,
        notes: form.notes || undefined,
      }

      if (editingRecord) {
        // Update via processing API - find the job order and update stage
        const res = await fetch(`/api/processing`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingRecord.jobOrder.id, processingStages: { update: [{ id: editingRecord.id, ...payload }] } }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(t2('Cap nhat thanh cong!', 'Updated successfully!'))
          setDialogOpen(false)
          resetForm()
          fetchItems()
        } else {
          toast.error(data.error || t2('Loi khi luu', 'Error saving'))
        }
      } else {
        // Create stage via POST to /api/processing with nested stage
        const res = await fetch('/api/processing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobOrderId: `STAGE-${config.stageType.toUpperCase()}-${Date.now()}`,
            processingMethod: config.stageType,
            processingStages: [payload],
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(t2('Tao moi thanh cong!', 'Created successfully!'))
          setDialogOpen(false)
          resetForm()
          fetchItems()
          fetchJobOrders()
        } else {
          toast.error(data.error || t2('Loi khi luu', 'Error saving'))
        }
      }
    } catch {
      toast.error(t2('Loi ket noi', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingRecord) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/processing?id=${deletingRecord.id}&stageId=${deletingRecord.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t2('Xoa thanh cong!', 'Deleted successfully!'))
        setDeleteDialogOpen(false)
        setDeletingRecord(null)
        fetchItems()
      } else {
        toast.error(data.error || t2('Loi khi xoa', 'Error deleting'))
      }
    } catch {
      toast.error(t2('Loi ket noi', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (record: ProcessingStageRecord) => {
    setEditingRecord(record)
    setForm({
      jobOrderId: record.jobOrder.id,
      stageDate: record.stageDate ? record.stageDate.slice(0, 10) : '',
      inputWeight: record.inputWeight?.toString() || '',
      outputWeight: record.outputWeight?.toString() || '',
      durationMinutes: record.durationMinutes?.toString() || '',
      temperature: record.temperature?.toString() || '',
      humidity: record.humidity?.toString() || '',
      machineUsed: record.machineUsed || '',
      operatorName: record.operatorName || '',
      qualityCheckPassed: record.qualityCheckPassed,
      notes: record.notes || '',
    })
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)
  const Icon = config.icon

  const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex items-start gap-2 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground font-medium">{value ?? '-'}</p>
      </div>
    </div>
  )

  if (status === 'loading' || (loading && items.length === 0)) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Icon className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Dang tai...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Icon className="w-5 h-5 text-muted-foreground" />
              {t2(config.labelVi, config.labelEn)}
            </h2>
            <p className="text-sm text-muted-foreground">{t(`${total} ban ghi`, `${total} records`)}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm" onClick={() => { resetForm(); setDialogOpen(true) }}>
                <Plus className="w-4 h-4" />
                {t2('Them moi', 'Add New')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {editingRecord ? t2('Sua ban ghi', 'Edit Record') : t2('Them ban ghi moi', 'Add New Record')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Lenh che bien', 'Job Order')} *</Label>
                    <Select value={form.jobOrderId} onValueChange={(v) => setForm({ ...form, jobOrderId: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chon lenh', 'Select job order')} />
                      </SelectTrigger>
                      <SelectContent>
                        {jobOrders.map((jo) => (
                          <SelectItem key={jo.id} value={jo.id}>
                            {jo.jobOrderId || jo.id} {jo.batchIdInput ? `(${jo.batchIdInput})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Ngay', 'Stage Date')}</Label>
                    <Input type="date" value={form.stageDate} onChange={(e) => setForm({ ...form, stageDate: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('TL dau vao (kg)', 'Input Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.inputWeight} onChange={(e) => setForm({ ...form, inputWeight: e.target.value })} placeholder="100" className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('TL dau ra (kg)', 'Output Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.outputWeight} onChange={(e) => setForm({ ...form, outputWeight: e.target.value })} placeholder="80" className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Thoi gian (phut)', 'Duration (min)')}</Label>
                    <Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} placeholder="60" className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nhiet do', 'Temperature')}</Label>
                    <Input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} placeholder="25" className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Do am', 'Humidity')}</Label>
                    <Input type="number" step="0.1" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} placeholder="65" className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('May', 'Machine Used')}</Label>
                    <Input value={form.machineUsed} onChange={(e) => setForm({ ...form, machineUsed: e.target.value })} placeholder={t2('Ten may', 'Machine name')} className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nguoi van hanh', 'Operator')}</Label>
                    <Input value={form.operatorName} onChange={(e) => setForm({ ...form, operatorName: e.target.value })} placeholder={t2('Nguyen Van A', 'Nguyen Van A')} className="rounded-xl border-input focus:border-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Kiem tra CL', 'QC Passed')}</Label>
                    <Select value={form.qualityCheckPassed ? 'true' : 'false'} onValueChange={(v) => setForm({ ...form, qualityCheckPassed: v === 'true' })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{t2('Dat', 'Passed')}</SelectItem>
                        <SelectItem value="false">{t2('Khong dat', 'Failed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Ghi chu', 'Notes')}</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t2('Ghi chu them...', 'Additional notes...')} className="rounded-xl border-input focus:border-primary" rows={2} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">{t2('Huy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Dang luu...', 'Saving...')}</> : editingRecord ? t2('Cap nhat', 'Update') : t2('Tao moi', 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder={t2('Tim kiem...', 'Search...')} className="pl-9 rounded-xl border-input focus:border-primary bg-background" />
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">{t(`${total} ban ghi`, `${total} records`)}</Badge>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Lenh CB', 'Job Order')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Ma lo', 'Batch')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Ngay', 'Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('TL vao', 'Input')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('TL ra', 'Output')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Thoi gian', 'Duration')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('May', 'Machine')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('QC', 'QC')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Thao tac', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      {t2('Khong co ban ghi nao', 'No records found')}
                    </td>
                  </tr>
                ) : (
                  items.map((record) => (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{record.jobOrder.jobOrderId || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{record.jobOrder.batchIdInput || '-'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{record.stageDate ? new Date(record.stageDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground hidden md:table-cell">{record.inputWeight ? `${record.inputWeight} kg` : '-'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground hidden md:table-cell">{record.outputWeight ? `${record.outputWeight} kg` : '-'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{record.durationMinutes ? `${record.durationMinutes} min` : '-'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{record.machineUsed || '-'}</td>
                      <td className="px-4 py-3">
                        {record.qualityCheckPassed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/processing/stages/${config.stageType}/${record.id}`)} title={t2('Xem chi tiết', 'View Details')}>
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
                  return <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{p}</Button>
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0 rounded-lg border-input"><ChevronRight className="w-3 h-3" /></Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {t2(config.labelVi, config.labelEn)} - {t2('Chi tiet', 'Details')}
            </DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label={t2('Lenh CB', 'Job Order')} value={detailItem.jobOrder.jobOrderId} />
                <InfoRow label={t2('Ma lo', 'Batch')} value={detailItem.jobOrder.batchIdInput} />
                <InfoRow label={t2('Ngay', 'Date')} value={detailItem.stageDate ? new Date(detailItem.stageDate).toLocaleDateString() : null} />
                <InfoRow label={t2('TL vao (kg)', 'Input (kg)')} value={detailItem.inputWeight} />
                <InfoRow label={t2('TL ra (kg)', 'Output (kg)')} value={detailItem.outputWeight} />
                <InfoRow label={t2('Thoi gian (ph)', 'Duration (min)')} value={detailItem.durationMinutes} />
                <InfoRow label={t2('Nhiet do', 'Temperature')} value={detailItem.temperature} />
                <InfoRow label={t2('Do am', 'Humidity')} value={detailItem.humidity} />
                <InfoRow label={t2('May', 'Machine')} value={detailItem.machineUsed} />
                <InfoRow label={t2('Nguoi VH', 'Operator')} value={detailItem.operatorName} />
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${detailItem.qualityCheckPassed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'} text-[10px] border-0 gap-1`}>
                  {detailItem.qualityCheckPassed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {detailItem.qualityCheckPassed ? t2('Dat', 'Passed') : t2('Khong dat', 'Failed')}
                </Badge>
              </div>
              {detailItem.notes && (
                <div className="p-3 rounded-lg bg-muted"><p className="text-sm text-foreground">{detailItem.notes}</p></div>
              )}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div><span className="uppercase">{t2('Ngay tao', 'Created')}</span><p className="font-medium text-xs">{new Date(detailItem.createdAt).toLocaleDateString()}</p></div>
                <div><span className="uppercase">{t2('Cap nhat', 'Updated')}</span><p className="font-medium text-xs">{new Date(detailItem.updatedAt).toLocaleDateString()}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {t2('Xac nhan xoa', 'Confirm Delete')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t2('Ban co chac muon xoa ban ghi nay?', 'Are you sure you want to delete this record?')}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">{t2('Huy', 'Cancel')}</Button>
            <Button onClick={handleDelete} disabled={submitting} className="bg-red-600 text-white rounded-xl hover:bg-red-700">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t2('Xoa', 'Delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
