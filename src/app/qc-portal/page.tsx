'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  ClipboardCheck, Search, Plus, Loader2, Eye,
  CheckCircle2, XCircle, Clock, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface Verification {
  id: string
  verificationCode: string
  targetType: string
  certifyingBody: string
  inspectorName: string
  status: string
  result: string | null
  sampleId: string
  sampleDate: string
  findings: string
  nonConformities: number
  validFrom: string | null
  validUntil: string | null
  createdAt: string
}

const MOCK_VERIFICATIONS: Verification[] = [
  { id: '1', verificationCode: 'QC-2024-001', targetType: 'lot', certifyingBody: 'SCA', inspectorName: 'Dr. Sarah Chen', status: 'completed', result: 'pass', sampleId: 'SMP-001', sampleDate: '2024-11-20', findings: 'All parameters within specification', nonConformities: 0, validFrom: '2024-11-20', validUntil: '2025-11-20', createdAt: '2024-11-18' },
  { id: '2', verificationCode: 'QC-2024-002', targetType: 'shipment', certifyingBody: 'ISO', inspectorName: 'Mark Williams', status: 'in_progress', result: null, sampleId: 'SMP-002', sampleDate: '2024-12-05', findings: 'Testing in progress', nonConformities: 0, validFrom: null, validUntil: null, createdAt: '2024-12-03' },
  { id: '3', verificationCode: 'QC-2024-003', targetType: 'farm', certifyingBody: 'UTZ', inspectorName: 'Linda Tran', status: 'completed', result: 'conditional', sampleId: 'SMP-003', sampleDate: '2024-10-15', findings: 'Minor moisture deviation detected', nonConformities: 1, validFrom: '2024-10-15', validUntil: '2025-04-15', createdAt: '2024-10-12' },
  { id: '4', verificationCode: 'QC-2024-004', targetType: 'lot', certifyingBody: 'Fairtrade', inspectorName: 'James Okafor', status: 'scheduled', result: null, sampleId: 'SMP-004', sampleDate: '2024-12-20', findings: '', nonConformities: 0, validFrom: null, validUntil: null, createdAt: '2024-12-08' },
]

function statusBadge(s: string): string {
  switch (s) {
    case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
    case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function resultBadge(r: string | null): string {
  switch (r) {
    case 'pass': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    case 'fail': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    case 'conditional': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
    default: return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  }
}

export default function QcPortalPage() {
  const { status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()

  const [verifications, setVerifications] = useState<Verification[]>(MOCK_VERIFICATIONS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ targetType: 'lot', certifyingBody: '', inspectorName: '', sampleDate: '', findings: '' })

  const filtered = verifications.filter((v) => {
    const matchesSearch = !search || v.verificationCode.toLowerCase().includes(search.toLowerCase()) || v.inspectorName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const newVerif: Verification = {
        id: String(Date.now()),
        verificationCode: `QC-2024-${String(verifications.length + 1).padStart(3, '0')}`,
        targetType: form.targetType,
        certifyingBody: form.certifyingBody,
        inspectorName: form.inspectorName,
        status: 'scheduled',
        result: null,
        sampleId: `SMP-${String(verifications.length + 1).padStart(3, '0')}`,
        sampleDate: form.sampleDate,
        findings: form.findings,
        nonConformities: 0,
        validFrom: null,
        validUntil: null,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setVerifications([newVerif, ...verifications])
      toast.success(t2('Đã tạo xác minh!', 'Verification created!'))
      setDialogOpen(false)
      setForm({ targetType: 'lot', certifyingBody: '', inspectorName: '', sampleDate: '', findings: '' })
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-primary" />
              {t('qcPortal.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('qcPortal.subtitle')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient gap-2 rounded-xl shadow-sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                {t('qcPortal.createVerification')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  {t('qcPortal.createVerification')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('qcPortal.targetType')}</Label>
                    <Select value={form.targetType} onValueChange={(v) => setForm({ ...form, targetType: v })}>
                      <SelectTrigger className="rounded-xl border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lot">{t2('Lô hàng', 'Lot')}</SelectItem>
                        <SelectItem value="shipment">{t2('Vận chuyển', 'Shipment')}</SelectItem>
                        <SelectItem value="farm">{t2('Nông trại', 'Farm')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('qcPortal.certifyingBody')}</Label>
                    <Input value={form.certifyingBody} onChange={(e) => setForm({ ...form, certifyingBody: e.target.value })} placeholder="SCA, ISO..." className="rounded-xl border-border" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('qcPortal.inspectorName')}</Label>
                    <Input value={form.inspectorName} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} className="rounded-xl border-border" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('qcPortal.sampleDate')}</Label>
                    <Input type="date" value={form.sampleDate} onChange={(e) => setForm({ ...form, sampleDate: e.target.value })} className="rounded-xl border-border" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">{t('qcPortal.findings')}</Label>
                  <Textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} className="rounded-xl border-border min-h-[60px]" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">{t2('Hủy', 'Cancel')}</Button>
                  <Button type="submit" disabled={submitting} className="btn-primary-gradient rounded-xl">
                    {submitting ? (<span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t2('Đang tạo...', 'Creating...')}</span>) : t2('Tạo', 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t2('Tìm xác minh...', 'Search verifications...')} className="pl-9 rounded-xl border-border bg-background" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl border-border"><SelectValue placeholder={t2('Lọc trạng thái', 'Filter status')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t2('Tất cả', 'All')}</SelectItem>
              <SelectItem value="scheduled">{t('qcPortal.statusScheduled')}</SelectItem>
              <SelectItem value="in_progress">{t('qcPortal.statusInProgress')}</SelectItem>
              <SelectItem value="completed">{t('qcPortal.statusCompleted')}</SelectItem>
              <SelectItem value="failed">{t('qcPortal.statusFailed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('qcPortal.verificationCode')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('qcPortal.certifyingBody')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('qcPortal.inspectorName')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('qcPortal.result')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('qcPortal.nonConformities')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Ngày取样', 'Sample Date')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">{v.verificationCode}</td>
                    <td className="px-4 py-3 text-xs text-foreground hidden md:table-cell">{v.certifyingBody}</td>
                    <td className="px-4 py-3 text-xs text-foreground hidden md:table-cell">{v.inspectorName}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${statusBadge(v.status)} text-[10px] border-0`}>
                        {v.status === 'scheduled' ? t('qcPortal.statusScheduled') : v.status === 'in_progress' ? t('qcPortal.statusInProgress') : v.status === 'completed' ? t('qcPortal.statusCompleted') : t('qcPortal.statusFailed')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${resultBadge(v.result)} text-[10px] border-0`}>
                        {v.result === 'pass' ? t('qcPortal.resultPass') : v.result === 'fail' ? t('qcPortal.resultFail') : v.result === 'conditional' ? t('qcPortal.resultConditional') : '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground hidden lg:table-cell">
                      {v.nonConformities > 0 ? (
                        <span className="text-red-500 font-medium">{v.nonConformities}</span>
                      ) : '0'}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground hidden lg:table-cell">
                      {new Date(v.sampleDate).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}
