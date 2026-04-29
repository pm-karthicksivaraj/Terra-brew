'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, FileText, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, X, PenTool,
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
import { formatCurrency } from '@/types'

interface SmartContract {
  id: string
  farmerId: string | null
  contractId: string | null
  contractType: string | null
  title: string | null
  description: string | null
  partyA: string | null
  partyB: string | null
  quantityKg: number | null
  pricePerKg: number | null
  totalValue: number | null
  currency: string | null
  deliveryDate: string | null
  deliveryLocation: string | null
  qualityGrade: string | null
  terms: string | null
  status: string | null
  signedByA: boolean
  signedByB: boolean
  signedDateA: string | null
  signedDateB: string | null
  effectiveDate: string | null
  expiryDate: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  farmer?: { id: string; fullName: string; farmerCode: string | null } | null
}

interface FarmerOption {
  id: string
  fullName: string
  farmerCode: string | null
}

const emptyForm = {
  farmerId: '',
  contractId: '',
  contractType: 'Sale',
  title: '',
  description: '',
  partyA: '',
  partyB: '',
  quantityKg: '',
  pricePerKg: '',
  totalValue: '',
  currency: 'VND',
  deliveryDate: '',
  deliveryLocation: '',
  qualityGrade: '',
  terms: '',
  status: 'Draft',
  effectiveDate: '',
  expiryDate: '',
  notes: '',
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Pending: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-blue-100 text-blue-700',
  Expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Draft: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-gray-100 text-gray-500',
}

export default function SmartContractsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [contracts, setContracts] = useState<SmartContract[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SmartContract | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [farmerOptions, setFarmerOptions] = useState<FarmerOption[]>([])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const [form, setForm] = useState(emptyForm)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingItem(null)
  }

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const res = await fetch(`/api/smart-contracts?${params}`)
      const data = await res.json()
      if (data.success) {
        const _items = data.data?.data ?? data.data?.items ?? []; setContracts(Array.isArray(_items) ? _items : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch contracts', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter])

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchContracts()
    }
  }, [status, router, fetchContracts])

  useEffect(() => {
    if (dialogOpen && status === 'authenticated') {
      fetchFarmerOptions()
    }
  }, [dialogOpen, status, fetchFarmerOptions])

  // Auto-calculate totalValue
  useEffect(() => {
    const qty = parseFloat(form.quantityKg) || 0
    const price = parseFloat(form.pricePerKg) || 0
    if (qty > 0 && price > 0) {
      setForm((prev) => ({ ...prev, totalValue: String(qty * price) }))
    }
  }, [form.quantityKg, form.pricePerKg])

  const handleEdit = (item: SmartContract) => {
    setEditingItem(item)
    setForm({
      farmerId: item.farmerId || '',
      contractId: item.contractId || '',
      contractType: item.contractType || 'Sale',
      title: item.title || '',
      description: item.description || '',
      partyA: item.partyA || '',
      partyB: item.partyB || '',
      quantityKg: item.quantityKg !== null ? String(item.quantityKg) : '',
      pricePerKg: item.pricePerKg !== null ? String(item.pricePerKg) : '',
      totalValue: item.totalValue !== null ? String(item.totalValue) : '',
      currency: item.currency || 'VND',
      deliveryDate: item.deliveryDate ? new Date(item.deliveryDate).toISOString().split('T')[0] : '',
      deliveryLocation: item.deliveryLocation || '',
      qualityGrade: item.qualityGrade || '',
      terms: item.terms || '',
      status: item.status || 'Draft',
      effectiveDate: item.effectiveDate ? new Date(item.effectiveDate).toISOString().split('T')[0] : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        quantityKg: form.quantityKg ? parseFloat(form.quantityKg) : undefined,
        pricePerKg: form.pricePerKg ? parseFloat(form.pricePerKg) : undefined,
        totalValue: form.totalValue ? parseFloat(form.totalValue) : undefined,
        deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : undefined,
        effectiveDate: form.effectiveDate ? new Date(form.effectiveDate).toISOString() : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
        farmerId: form.farmerId || undefined,
      }

      const method = editingItem ? 'PUT' : 'POST'
      if (editingItem) {
        (payload as Record<string, unknown>).id = editingItem.id
      }

      const res = await fetch('/api/smart-contracts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingItem ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo hợp đồng thành công!', 'Contract created!'))
        setDialogOpen(false)
        resetForm()
        fetchContracts()
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
      const res = await fetch(`/api/smart-contracts?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Xóa thành công!', 'Deleted successfully!'))
        setDeleteConfirm(null)
        fetchContracts()
      } else {
        toast.error(data.error || t('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  const handleSign = async (id: string, party: 'A' | 'B') => {
    try {
      const payload: Record<string, unknown> = { id }
      if (party === 'A') {
        payload.signedByA = true
        payload.signedDateA = new Date().toISOString()
      } else {
        payload.signedByB = true
        payload.signedDateB = new Date().toISOString()
      }
      const res = await fetch('/api/smart-contracts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t(`Bên ${party === 'A' ? 'A' : 'B'} đã ký!`, `Party ${party} signed!`))
        fetchContracts()
      } else {
        toast.error(data.error || t('Lỗi khi ký', 'Error signing'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const getCurrency = () => session?.user?.currency || 'VND'

  if (status === 'loading' || (loading && contracts.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Coffee className="w-9 h-9 text-primary-foreground animate-pulse" />
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
              <FileText className="w-5 h-5 text-muted-foreground" />
              {t('Hợp đồng Thông minh', 'Smart Contracts')}
            </h2>
            <p className="text-sm text-muted-foreground">{t(`Tổng số: ${total} hợp đồng`, `Total: ${total} contracts`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t('Thêm hợp đồng mới', 'Add New Contract')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {editingItem ? t('Sửa hợp đồng', 'Edit Contract') : t('Thêm hợp đồng mới', 'Add New Contract')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Nông dân', 'Farmer')}</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t('Chọn nông dân', 'Select farmer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmerOptions.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contract ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Mã hợp đồng', 'Contract ID')}</Label>
                    <Input
                      value={form.contractId}
                      onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                      placeholder="SC-001"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t('Tiêu đề', 'Title')} *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder={t('Hợp đồng xuất khẩu cà phê', 'Coffee export contract')}
                      className="rounded-xl border-input focus:border-primary"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t('Mô tả', 'Description')}</Label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={t('Mô tả hợp đồng...', 'Contract description...')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Contract Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Loại HĐ', 'Contract Type')}</Label>
                    <Select value={form.contractType} onValueChange={(v) => setForm({ ...form, contractType: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sale">{t('Bán', 'Sale')}</SelectItem>
                        <SelectItem value="Purchase">{t('Mua', 'Purchase')}</SelectItem>
                        <SelectItem value="Processing">{t('Chế biến', 'Processing')}</SelectItem>
                        <SelectItem value="Export">{t('Xuất khẩu', 'Export')}</SelectItem>
                        <SelectItem value="Service">{t('Dịch vụ', 'Service')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Trạng thái', 'Status')}</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">{t('Nháp', 'Draft')}</SelectItem>
                        <SelectItem value="Pending">{t('Chờ duyệt', 'Pending')}</SelectItem>
                        <SelectItem value="Active">{t('Hiệu lực', 'Active')}</SelectItem>
                        <SelectItem value="Completed">{t('Hoàn thành', 'Completed')}</SelectItem>
                        <SelectItem value="Expired">{t('Hết hạn', 'Expired')}</SelectItem>
                        <SelectItem value="Cancelled">{t('Hủy', 'Cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Party A */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Bên A', 'Party A')}</Label>
                    <Input
                      value={form.partyA}
                      onChange={(e) => setForm({ ...form, partyA: e.target.value })}
                      placeholder={t('Công ty XYZ', 'XYZ Company')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Party B */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Bên B', 'Party B')}</Label>
                    <Input
                      value={form.partyB}
                      onChange={(e) => setForm({ ...form, partyB: e.target.value })}
                      placeholder={t('Nhà nhập khẩu ABC', 'ABC Importer')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Số lượng (kg)', 'Quantity (kg)')}</Label>
                    <Input
                      type="number"
                      value={form.quantityKg}
                      onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                      placeholder="10000"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Price per kg */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Đơn giá/kg', 'Price/kg')}</Label>
                    <Input
                      type="number"
                      value={form.pricePerKg}
                      onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                      placeholder="50000"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Total Value */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Tổng giá trị', 'Total Value')}</Label>
                    <Input
                      type="number"
                      value={form.totalValue}
                      onChange={(e) => setForm({ ...form, totalValue: e.target.value })}
                      className="rounded-xl border-input focus:border-primary bg-muted"
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Tiền tệ', 'Currency')}</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="KRW">KRW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quality Grade */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Hạng chất lượng', 'Quality Grade')}</Label>
                    <Select value={form.qualityGrade} onValueChange={(v) => setForm({ ...form, qualityGrade: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t('Chọn hạng', 'Select grade')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Specialty">{t('Đặc sản', 'Specialty')}</SelectItem>
                        <SelectItem value="Premium">{t('Cao cấp', 'Premium')}</SelectItem>
                        <SelectItem value="Grade 1">{t('Hạng 1', 'Grade 1')}</SelectItem>
                        <SelectItem value="Grade 2">{t('Hạng 2', 'Grade 2')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delivery Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Ngày giao hàng', 'Delivery Date')}</Label>
                    <Input
                      type="date"
                      value={form.deliveryDate}
                      onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Delivery Location */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Địa điểm giao', 'Delivery Location')}</Label>
                    <Input
                      value={form.deliveryLocation}
                      onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
                      placeholder={t('Cảng Cát Lái', 'Cat Lai Port')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Effective Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Ngày hiệu lực', 'Effective Date')}</Label>
                    <Input
                      type="date"
                      value={form.effectiveDate}
                      onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Ngày hết hạn', 'Expiry Date')}</Label>
                    <Input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Terms */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t('Điều khoản', 'Terms')}</Label>
                    <Input
                      value={form.terms}
                      onChange={(e) => setForm({ ...form, terms: e.target.value })}
                      placeholder={t('Điều khoản hợp đồng...', 'Contract terms...')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t('Ghi chú', 'Notes')}</Label>
                    <Input
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder={t('Ghi chú thêm...', 'Additional notes...')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                    {t('Hủy', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
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
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <TabsList className="bg-muted rounded-xl h-8">
              <TabsTrigger value="all" className="text-[10px] data-[state=active]:bg-muted data-[state=active]:text-white rounded-lg px-2">
                {t('Tất cả', 'All')}
              </TabsTrigger>
              <TabsTrigger value="Active" className="text-[10px] data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg px-2">
                {t('Hiệu lực', 'Active')}
              </TabsTrigger>
              <TabsTrigger value="Pending" className="text-[10px] data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-lg px-2">
                {t('Chờ duyệt', 'Pending')}
              </TabsTrigger>
              <TabsTrigger value="Completed" className="text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-2">
                {t('Hoàn thành', 'Completed')}
              </TabsTrigger>
              <TabsTrigger value="Expired" className="text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg px-2">
                {t('Hết hạn', 'Expired')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm hợp đồng...', 'Search contracts...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Mã HĐ', 'Contract ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Tiêu đề', 'Title')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Bên A', 'Party A')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Bên B', 'Party B')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Số lượng', 'Quantity')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Giá trị', 'Total Value')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Chữ ký', 'Signed')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">{t('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileText className="w-10 h-10" />
                          <p className="text-sm">{t('Chưa có hợp đồng nào', 'No contracts found')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    contracts.map((item, i) => (
                      <tr key={item.id}
 className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{item.contractId || '-'}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-medium text-foreground">{item.title || '-'}</p>
                            <p className="text-[10px] text-muted-foreground">{item.farmer?.fullName || ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-[10px] text-border text-muted-foreground">
                            {item.contractType || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.partyA || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.partyB || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          {item.quantityKg ? `${item.quantityKg.toLocaleString()} kg` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground font-medium">
                          {item.totalValue ? formatCurrency(item.totalValue, item.currency || getCurrency()) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${statusColors[item.status || 'Draft'] || 'bg-gray-100 text-gray-600'} text-[10px] border-0`}>
                            {item.status || 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-0.5 text-[10px] ${item.signedByA ? 'text-green-600' : 'text-muted-foreground'}`}>
                              A{item.signedByA ? '✓' : '○'}
                            </span>
                            <span className={`inline-flex items-center gap-0.5 text-[10px] ${item.signedByB ? 'text-green-600' : 'text-muted-foreground'}`}>
                              B{item.signedByB ? '✓' : '○'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!item.signedByA && (
                              <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg hover:bg-green-50 text-[10px] text-green-600 gap-1" onClick={() => handleSign(item.id, 'A')}>
                                <PenTool className="w-3 h-3" />
                                A
                              </Button>
                            )}
                            {!item.signedByB && (
                              <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg hover:bg-green-50 text-[10px] text-green-600 gap-1" onClick={() => handleSign(item.id, 'B')}>
                                <PenTool className="w-3 h-3" />
                                B
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-muted" onClick={() => handleEdit(item)}>
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </Button>
                            {deleteConfirm === item.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-red-100" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-muted" onClick={() => setDeleteConfirm(null)}>
                                  <X className="w-3 h-3 text-muted-foreground" />
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-red-50" onClick={() => setDeleteConfirm(item.id)}>
                                <Trash2 className="w-3 h-3 text-muted-foreground" />
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground">
                {t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 w-7 p-0 rounded-lg border-input"
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
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-primary text-primary-foreground' : 'text-border text-muted-foreground'}`}
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
                  className="h-7 w-7 p-0 rounded-lg border-input"
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
