'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, ShoppingBag, Search, Plus,
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
import { formatCurrency } from '@/types'

interface MarketplaceListing {
  id: string
  farmerId: string | null
  listingId: string | null
  title: string
  description: string | null
  coffeeType: string | null
  coffeeVariety: string | null
  grade: string | null
  quantityKg: number | null
  pricePerKg: number | null
  totalValue: number | null
  currency: string | null
  origin: string | null
  processingMethod: string | null
  cupScore: number | null
  certifications: string | null
  harvestYear: string | null
  availability: string | null
  listingStatus: string | null
  listingDate: string | null
  expiryDate: string | null
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
  listingId: '',
  title: '',
  description: '',
  coffeeType: 'Robusta',
  coffeeVariety: '',
  grade: '',
  quantityKg: '',
  pricePerKg: '',
  totalValue: '',
  currency: 'VND',
  origin: '',
  processingMethod: '',
  cupScore: '',
  certifications: '',
  harvestYear: '',
  availability: 'In Stock',
  listingStatus: 'Draft',
  listingDate: '',
  expiryDate: '',
}

const listingStatusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Sold: 'bg-blue-100 text-blue-700',
  Expired: 'bg-gray-100 text-gray-600',
  Draft: 'bg-yellow-100 text-yellow-700',
}

export default function MarketplacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MarketplaceListing | null>(null)
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

  const fetchListings = useCallback(async () => {
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
        params.set('listingStatus', statusFilter)
      }
      const res = await fetch(`/api/marketplace?${params}`)
      const data = await res.json()
      if (data.success) {
        const _items = data.data?.data ?? data.data?.items ?? []; setListings(Array.isArray(_items) ? _items : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch listings', err)
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
      fetchListings()
    }
  }, [status, router, fetchListings])

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

  const handleEdit = (item: MarketplaceListing) => {
    setEditingItem(item)
    setForm({
      farmerId: item.farmerId || '',
      listingId: item.listingId || '',
      title: item.title,
      description: item.description || '',
      coffeeType: item.coffeeType || 'Robusta',
      coffeeVariety: item.coffeeVariety || '',
      grade: item.grade || '',
      quantityKg: item.quantityKg !== null ? String(item.quantityKg) : '',
      pricePerKg: item.pricePerKg !== null ? String(item.pricePerKg) : '',
      totalValue: item.totalValue !== null ? String(item.totalValue) : '',
      currency: item.currency || 'VND',
      origin: item.origin || '',
      processingMethod: item.processingMethod || '',
      cupScore: item.cupScore !== null ? String(item.cupScore) : '',
      certifications: item.certifications || '',
      harvestYear: item.harvestYear || '',
      availability: item.availability || 'In Stock',
      listingStatus: item.listingStatus || 'Draft',
      listingDate: item.listingDate ? new Date(item.listingDate).toISOString().split('T')[0] : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
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
        cupScore: form.cupScore ? parseFloat(form.cupScore) : undefined,
        listingDate: form.listingDate ? new Date(form.listingDate).toISOString() : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
        farmerId: form.farmerId || undefined,
      }

      const method = editingItem ? 'PUT' : 'POST'
      if (editingItem) {
        (payload as Record<string, unknown>).id = editingItem.id
      }

      const res = await fetch('/api/marketplace', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingItem ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo đăng bán thành công!', 'Listing created!'))
        setDialogOpen(false)
        resetForm()
        fetchListings()
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
      const res = await fetch(`/api/marketplace?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Xóa thành công!', 'Deleted successfully!'))
        setDeleteConfirm(null)
        fetchListings()
      } else {
        toast.error(data.error || t('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const getCurrency = () => session?.user?.currency || 'VND'

  if (status === 'loading' || (loading && listings.length === 0)) {
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
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              {t('Thị trường & Bán hàng', 'Marketplace & Sales')}
            </h2>
            <p className="text-sm text-muted-foreground">{t(`Tổng số: ${total} đăng bán`, `Total: ${total} listings`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t('Thêm đăng bán mới', 'Add New Listing')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {editingItem ? t('Sửa đăng bán', 'Edit Listing') : t('Thêm đăng bán mới', 'Add New Listing')}
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

                  {/* Listing ID */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Mã đăng bán', 'Listing ID')}</Label>
                    <Input
                      value={form.listingId}
                      onChange={(e) => setForm({ ...form, listingId: e.target.value })}
                      placeholder="LST-001"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t('Tiêu đề', 'Title')} *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder={t('Cà phê Robusta Hạng 1', 'Robusta Grade 1 Coffee')}
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
                      placeholder={t('Mô tả sản phẩm...', 'Product description...')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Coffee Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Loại cà phê', 'Coffee Type')}</Label>
                    <Select value={form.coffeeType} onValueChange={(v) => setForm({ ...form, coffeeType: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robusta">Robusta</SelectItem>
                        <SelectItem value="Arabica">Arabica</SelectItem>
                        <SelectItem value="Liberica">Liberica</SelectItem>
                        <SelectItem value="Excelsa">Excelsa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coffee Variety */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Giống', 'Variety')}</Label>
                    <Input
                      value={form.coffeeVariety}
                      onChange={(e) => setForm({ ...form, coffeeVariety: e.target.value })}
                      placeholder={t('Catimor', 'Catimor')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Grade */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Hạng', 'Grade')}</Label>
                    <Select value={form.grade} onValueChange={(v) => setForm({ ...form, grade: v })}>
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

                  {/* Processing Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Phương pháp chế biến', 'Processing Method')}</Label>
                    <Select value={form.processingMethod} onValueChange={(v) => setForm({ ...form, processingMethod: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t('Chọn phương pháp', 'Select method')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Washed">{t('Rửa', 'Washed')}</SelectItem>
                        <SelectItem value="Natural">{t('Tự nhiên', 'Natural')}</SelectItem>
                        <SelectItem value="Honey">{t('Mật ong', 'Honey')}</SelectItem>
                        <SelectItem value="Wet-hulled">{t('Ướt', 'Wet-hulled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Số lượng (kg)', 'Quantity (kg)')}</Label>
                    <Input
                      type="number"
                      value={form.quantityKg}
                      onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                      placeholder="5000"
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
                      placeholder="55000"
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

                  {/* Origin */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Nguồn gốc', 'Origin')}</Label>
                    <Input
                      value={form.origin}
                      onChange={(e) => setForm({ ...form, origin: e.target.value })}
                      placeholder={t('Đắk Lắk, Việt Nam', 'Dak Lak, Vietnam')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Cup Score */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Điểm cupping', 'Cup Score')}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.cupScore}
                      onChange={(e) => setForm({ ...form, cupScore: e.target.value })}
                      placeholder="82.5"
                      min="0" max="100"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Certifications */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Chứng nhận', 'Certifications')}</Label>
                    <Input
                      value={form.certifications}
                      onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                      placeholder="Organic, Fair Trade"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Harvest Year */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Năm thu hoạch', 'Harvest Year')}</Label>
                    <Input
                      value={form.harvestYear}
                      onChange={(e) => setForm({ ...form, harvestYear: e.target.value })}
                      placeholder="2024"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Availability */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Tình trạng', 'Availability')}</Label>
                    <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">{t('Còn hàng', 'In Stock')}</SelectItem>
                        <SelectItem value="Limited">{t('Hạn chế', 'Limited')}</SelectItem>
                        <SelectItem value="Pre-order">{t('Đặt trước', 'Pre-order')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Listing Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Trạng thái', 'Status')}</Label>
                    <Select value={form.listingStatus} onValueChange={(v) => setForm({ ...form, listingStatus: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">{t('Nháp', 'Draft')}</SelectItem>
                        <SelectItem value="Active">{t('Đang bán', 'Active')}</SelectItem>
                        <SelectItem value="Sold">{t('Đã bán', 'Sold')}</SelectItem>
                        <SelectItem value="Expired">{t('Hết hạn', 'Expired')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Listing Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t('Ngày đăng', 'Listing Date')}</Label>
                    <Input
                      type="date"
                      value={form.listingDate}
                      onChange={(e) => setForm({ ...form, listingDate: e.target.value })}
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
                {t('Đang bán', 'Active')}
              </TabsTrigger>
              <TabsTrigger value="Sold" className="text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-2">
                {t('Đã bán', 'Sold')}
              </TabsTrigger>
              <TabsTrigger value="Expired" className="text-[10px] data-[state=active]:bg-gray-600 data-[state=active]:text-white rounded-lg px-2">
                {t('Hết hạn', 'Expired')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm đăng bán...', 'Search listings...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Mã ĐB', 'Listing ID')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Tiêu đề', 'Title')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Hạng', 'Grade')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Số lượng', 'Qty')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Giá/kg', 'Price/kg')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Tổng', 'Total')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">{t('Thao tác', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {listings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ShoppingBag className="w-10 h-10" />
                          <p className="text-sm">{t('Chưa có đăng bán nào', 'No listings found')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    listings.map((item, i) => (
                      <tr key={item.id}
 className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{item.listingId || '-'}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-medium text-foreground">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">{item.coffeeVariety || item.coffeeType || ''} • {item.origin || ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-[10px] text-border text-muted-foreground">
                            {item.coffeeType || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.grade || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          {item.quantityKg ? `${item.quantityKg.toLocaleString()} kg` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground font-medium">
                          {item.pricePerKg ? formatCurrency(item.pricePerKg, item.currency || getCurrency()) : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground font-medium hidden lg:table-cell">
                          {item.totalValue ? formatCurrency(item.totalValue, item.currency || getCurrency()) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${listingStatusColors[item.listingStatus || 'Draft'] || 'bg-gray-100 text-gray-600'} text-[10px] border-0`}>
                            {item.listingStatus === 'Active' ? t('Đang bán', 'Active') :
                             item.listingStatus === 'Sold' ? t('Đã bán', 'Sold') :
                             item.listingStatus === 'Expired' ? t('Hết hạn', 'Expired') :
                             t('Nháp', 'Draft')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
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
