'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Truck, Search, Plus, ChevronLeft, ChevronRight, Loader2,
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
import { formatCurrency } from '@/types'

interface Farmer {
  id: string
  fullName: string
  farmerCode: string | null
}

interface CollectionCentre {
  id: string
  centreName: string
  centreId: string | null
}

interface ProcurementRecord {
  id: string
  farmerId: string
  collectionCentreId: string | null
  procurementId: string | null
  procurementDate: string | null
  batchId: string | null
  coffeeType: string | null
  coffeeVariety: string | null
  grossWeight: number | null
  tareWeight: number | null
  netWeight: number | null
  moistureContentAtGate: number | null
  adjustedNetWeight: number | null
  cherryRipenessGrade: string | null
  defects: number | null
  purchasePricePerKg: number | null
  totalPurchaseAmount: number | null
  priceBasis: string | null
  certPremiumApplied: number | null
  paymentMethod: string | null
  paymentStatus: string | null
  vehicleNumber: string | null
  driverName: string | null
  departureTime: string | null
  destination: string | null
  transportCost: number | null
  transportNotes: string | null
  isActive: boolean
  farmer: Farmer
  collectionCentre: CollectionCentre | null
}

const initialForm = {
  farmerId: '',
  collectionCentreId: '',
  procurementId: '',
  procurementDate: '',
  batchId: '',
  coffeeType: '',
  coffeeVariety: '',
  grossWeight: '',
  tareWeight: '',
  netWeight: '',
  moistureContentAtGate: '',
  adjustedNetWeight: '',
  cherryRipenessGrade: '',
  defects: '',
  purchasePricePerKg: '',
  totalPurchaseAmount: '',
  priceBasis: '',
  certPremiumApplied: '',
  paymentMethod: '',
  paymentStatus: 'Pending',
  vehicleNumber: '',
  driverName: '',
  departureTime: '',
  destination: '',
  transportCost: '',
  transportNotes: '',
}

type PaymentTab = 'all' | 'Completed' | 'Pending' | 'Failed'

export default function ProcurementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const [records, setRecords] = useState<ProcurementRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('all')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProcurementRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<ProcurementRecord | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)

  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [centres, setCentres] = useState<CollectionCentre[]>([])


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
      if (paymentTab !== 'all') params.set('paymentStatus', paymentTab)
      const res = await fetch(`/api/procurement?${params}`)
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
  }, [page, pageSize, search, paymentTab])

  const fetchFarmers = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=1000')
      const data = await res.json()
      if (data.success) setFarmers(data.data?.data ?? data.data?.farmers ?? [])
    } catch { /* ignore */ }
  }, [])

  const fetchCentres = useCallback(async () => {
    try {
      const res = await fetch('/api/collection-centres?pageSize=1000')
      const data = await res.json()
      if (data.success) setCentres(data.data?.data ?? data.data?.centres ?? [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchRecords()
      fetchFarmers()
      fetchCentres()
    }
  }, [status, router, fetchRecords, fetchFarmers, fetchCentres])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        grossWeight: form.grossWeight ? parseFloat(form.grossWeight) : undefined,
        tareWeight: form.tareWeight ? parseFloat(form.tareWeight) : undefined,
        netWeight: form.netWeight ? parseFloat(form.netWeight) : undefined,
        moistureContentAtGate: form.moistureContentAtGate ? parseFloat(form.moistureContentAtGate) : undefined,
        adjustedNetWeight: form.adjustedNetWeight ? parseFloat(form.adjustedNetWeight) : undefined,
        defects: form.defects ? parseFloat(form.defects) : undefined,
        purchasePricePerKg: form.purchasePricePerKg ? parseFloat(form.purchasePricePerKg) : undefined,
        totalPurchaseAmount: form.totalPurchaseAmount ? parseFloat(form.totalPurchaseAmount) : undefined,
        certPremiumApplied: form.certPremiumApplied ? parseFloat(form.certPremiumApplied) : undefined,
        transportCost: form.transportCost ? parseFloat(form.transportCost) : undefined,
        departureTime: form.departureTime || undefined,
      }
      if (editingRecord) Object.assign(payload, { id: editingRecord.id })

      const res = await fetch('/api/procurement', {
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
      const res = await fetch(`/api/procurement?id=${deletingRecord.id}`, { method: 'DELETE' })
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

  const openEditDialog = (record: ProcurementRecord) => {
    setEditingRecord(record)
    setForm({
      farmerId: record.farmerId,
      collectionCentreId: record.collectionCentreId || '',
      procurementId: record.procurementId || '',
      procurementDate: record.procurementDate ? record.procurementDate.slice(0, 10) : '',
      batchId: record.batchId || '',
      coffeeType: record.coffeeType || '',
      coffeeVariety: record.coffeeVariety || '',
      grossWeight: record.grossWeight?.toString() || '',
      tareWeight: record.tareWeight?.toString() || '',
      netWeight: record.netWeight?.toString() || '',
      moistureContentAtGate: record.moistureContentAtGate?.toString() || '',
      adjustedNetWeight: record.adjustedNetWeight?.toString() || '',
      cherryRipenessGrade: record.cherryRipenessGrade || '',
      defects: record.defects?.toString() || '',
      purchasePricePerKg: record.purchasePricePerKg?.toString() || '',
      totalPurchaseAmount: record.totalPurchaseAmount?.toString() || '',
      priceBasis: record.priceBasis || '',
      certPremiumApplied: record.certPremiumApplied?.toString() || '',
      paymentMethod: record.paymentMethod || '',
      paymentStatus: record.paymentStatus || 'Pending',
      vehicleNumber: record.vehicleNumber || '',
      driverName: record.driverName || '',
      departureTime: record.departureTime ? record.departureTime.slice(0, 16) : '',
      destination: record.destination || '',
      transportCost: record.transportCost?.toString() || '',
      transportNotes: record.transportNotes || '',
    })
    setDialogOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)

  const paymentStatusColor = (s: string | null) => {
    switch (s?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const paymentTabs: { key: PaymentTab; vi: string; en: string }[] = [
    { key: 'all', vi: 'Tất cả', en: 'All' },
    { key: 'Completed', vi: 'Đã thanh toán', en: 'Completed' },
    { key: 'Pending', vi: 'Chờ thanh toán', en: 'Pending' },
    { key: 'Failed', vi: 'Thất bại', en: 'Failed' },
  ]

  if (status === 'loading' || (loading && records.length === 0)) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Truck className="w-9 h-9 text-primary-foreground animate-pulse" />
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
              <Truck className="w-5 h-5 text-muted-foreground" />
              {t2('Thu mua & Thu hoạch', 'Procurement & Collection')}
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
                  <Truck className="w-5 h-5" />
                  {editingRecord ? t2('Sửa bản ghi', 'Edit Record') : t2('Thêm bản ghi mới', 'Add New Record')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nông dân', 'Farmer')} *</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn nông dân', 'Select farmer')} /></SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (<SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Collection Centre */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Trạm thu mua', 'Collection Centre')}</Label>
                    <Select value={form.collectionCentreId} onValueChange={(v) => setForm({ ...form, collectionCentreId: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn trạm', 'Select centre')} /></SelectTrigger>
                      <SelectContent>
                        {centres.map((c) => (<SelectItem key={c.id} value={c.id}>{c.centreName} {c.centreId ? `(${c.centreId})` : ''}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Procurement ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Mã thu mua', 'Procurement ID')}</Label>
                    <Input value={form.procurementId} onChange={(e) => setForm({ ...form, procurementId: e.target.value })} placeholder="PROC-2024-001" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Procurement Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Ngày thu mua', 'Procurement Date')}</Label>
                    <Input type="date" value={form.procurementDate} onChange={(e) => setForm({ ...form, procurementDate: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Batch ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Mã lô', 'Batch ID')}</Label>
                    <Input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} placeholder="BATCH-2024-001" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Coffee Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Loại cà phê', 'Coffee Type')}</Label>
                    <Select value={form.coffeeType} onValueChange={(v) => setForm({ ...form, coffeeType: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn loại', 'Select type')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robusta">{t2('Cà phê Robusta', 'Robusta Coffee')}</SelectItem>
                        <SelectItem value="Arabica">{t2('Cà phê Arabica', 'Arabica Coffee')}</SelectItem>
                        <SelectItem value="Liberica">{t2('Cà phê Liberica', 'Liberica Coffee')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coffee Variety */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Giống cà phê', 'Coffee Variety')}</Label>
                    <Input value={form.coffeeVariety} onChange={(e) => setForm({ ...form, coffeeVariety: e.target.value })} placeholder={t2('Giống', 'Variety')} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Gross Weight */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Trọng lượng cả bì (kg)', 'Gross Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.grossWeight} onChange={(e) => setForm({ ...form, grossWeight: e.target.value })} placeholder="100" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Tare Weight */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Trọng lượng bì (kg)', 'Tare Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.tareWeight} onChange={(e) => setForm({ ...form, tareWeight: e.target.value })} placeholder="5" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Net Weight */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Trọng lượng tịnh (kg)', 'Net Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.netWeight} onChange={(e) => setForm({ ...form, netWeight: e.target.value })} placeholder="95" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Moisture at Gate */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Độ ẩm tại cổng (%)', 'Moisture at Gate (%)')}</Label>
                    <Input type="number" step="0.1" value={form.moistureContentAtGate} onChange={(e) => setForm({ ...form, moistureContentAtGate: e.target.value })} placeholder="14.5" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Adjusted Net Weight */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('TL tịnh điều chỉnh (kg)', 'Adjusted Net Weight (kg)')}</Label>
                    <Input type="number" step="0.1" value={form.adjustedNetWeight} onChange={(e) => setForm({ ...form, adjustedNetWeight: e.target.value })} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Cherry Ripeness Grade */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Hạng độ chín', 'Cherry Ripeness Grade')}</Label>
                    <Select value={form.cherryRipenessGrade} onValueChange={(v) => setForm({ ...form, cherryRipenessGrade: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn hạng', 'Select grade')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade1">{t2('Hạng 1', 'Grade 1')}</SelectItem>
                        <SelectItem value="Grade2">{t2('Hạng 2', 'Grade 2')}</SelectItem>
                        <SelectItem value="Grade3">{t2('Hạng 3', 'Grade 3')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Purchase Price Per Kg */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Giá/kg (VND)', 'Price/kg (VND)')}</Label>
                    <Input type="number" step="100" value={form.purchasePricePerKg} onChange={(e) => setForm({ ...form, purchasePricePerKg: e.target.value })} placeholder="45000" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Total Purchase Amount */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tổng tiền (VND)', 'Total Amount (VND)')}</Label>
                    <Input type="number" step="1000" value={form.totalPurchaseAmount} onChange={(e) => setForm({ ...form, totalPurchaseAmount: e.target.value })} placeholder="4275000" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Phương thức TT', 'Payment Method')}</Label>
                    <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue placeholder={t2('Chọn PT', 'Select method')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">{t2('Tiền mặt', 'Cash')}</SelectItem>
                        <SelectItem value="bank_transfer">{t2('Chuyển khoản', 'Bank Transfer')}</SelectItem>
                        <SelectItem value="mobile_money">{t2('Ví điện tử', 'Mobile Money')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Trạng thái TT', 'Payment Status')}</Label>
                    <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}>
                      <SelectTrigger className="rounded-xl border-input"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Completed">{t2('Đã thanh toán', 'Completed')}</SelectItem>
                        <SelectItem value="Pending">{t2('Chờ thanh toán', 'Pending')}</SelectItem>
                        <SelectItem value="Failed">{t2('Thất bại', 'Failed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle Number */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Số xe', 'Vehicle Number')}</Label>
                    <Input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="47A-12345" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Driver Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tên tài xế', 'Driver Name')}</Label>
                    <Input value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} placeholder={t2('Nguyễn Văn A', 'Nguyen Van A')} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Destination */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Điểm đến', 'Destination')}</Label>
                    <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder={t2('Nhà máy', 'Factory')} className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Transport Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Chi phí vận chuyển (VND)', 'Transport Cost (VND)')}</Label>
                    <Input type="number" step="1000" value={form.transportCost} onChange={(e) => setForm({ ...form, transportCost: e.target.value })} placeholder="500000" className="rounded-xl border-input focus:border-primary" />
                  </div>

                  {/* Transport Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Ghi chú vận chuyển', 'Transport Notes')}</Label>
                    <Textarea value={form.transportNotes} onChange={(e) => setForm({ ...form, transportNotes: e.target.value })} placeholder={t2('Ghi chú thêm...', 'Additional notes...')} className="rounded-xl border-input focus:border-primary" rows={2} />
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

        {/* Payment Status Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {paymentTabs.map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => { setPaymentTab(tab.key); setPage(1) }}
                className={`rounded-lg text-xs h-7 px-3 ${paymentTab === tab.key ? 'bg-background shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t(tab.vi, tab.en)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t2('Tìm kiếm thu mua...', 'Search procurement...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Mã thu mua', 'Proc. ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Mã lô', 'Batch ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Ngày', 'Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Loại CP', 'Coffee Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('TL tịnh (kg)', 'Net Wt')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Giá/kg', 'Price/kg')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Tổng tiền', 'Total')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('TT', 'Payment')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
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
                            {record.procurementId || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{record.batchId || '-'}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{record.farmer?.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{record.farmer?.farmerCode}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{record.procurementDate ? new Date(record.procurementDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{record.coffeeType || '-'}</td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{record.netWeight !== null && record.netWeight !== undefined ? `${record.netWeight}` : '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{record.purchasePricePerKg ? formatCurrency(record.purchasePricePerKg, 'VND') : '-'}</td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground hidden lg:table-cell">{record.totalPurchaseAmount ? formatCurrency(record.totalPurchaseAmount, 'VND') : '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${paymentStatusColor(record.paymentStatus)} text-[10px] border-0`}>
                            {record.paymentStatus === 'Completed' ? t2('Đã TT', 'Paid') :
                             record.paymentStatus === 'Pending' ? t2('Chờ TT', 'Pending') :
                             record.paymentStatus === 'Failed' ? t2('Lỗi', 'Failed') : record.paymentStatus || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/procurement/${record.id}`)}>
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
            {t(`Bạn có chắc muốn xóa bản ghi thu mua "${deletingRecord?.procurementId || ''}"?`, `Are you sure you want to delete procurement "${deletingRecord?.procurementId || ''}"?`)}
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
