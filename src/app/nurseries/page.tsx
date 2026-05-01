'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, TreePine, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, Eye,
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

interface Nursery {
  id: string
  nurseryName: string
  nurseryCode: string | null
  nurseryType: string | null
  species: string | null
  variety: string | null
  capacity: number | null
  currentStock: number | null
  healthStatus: string | null
  province: string | null
  district: string | null
  commune: string | null
  latitude: number | null
  longitude: number | null
  location: string | null
  seedSource: string | null
  plantingDate: string | null
  expectedReadyDate: string | null
  germinationRate: number | null
  survivalRate: number | null
  notes: string | null
  isActive: boolean
  createdAt: string
}

export default function NurseriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const [items, setItems] = useState<Nursery[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Nursery | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)


  const [form, setForm] = useState({
    nurseryName: '',
    nurseryCode: '',
    location: '',
    province: '',
    district: '',
    commune: '',
    latitude: '',
    longitude: '',
    nurseryType: '',
    capacity: '',
    currentStock: '',
    species: '',
    variety: '',
    seedSource: '',
    plantingDate: '',
    expectedReadyDate: '',
    germinationRate: '',
    survivalRate: '',
    healthStatus: '',
    notes: '',
  })

  const resetForm = () => {
    setForm({
      nurseryName: '', nurseryCode: '', location: '',
      province: '', district: '', commune: '',
      latitude: '', longitude: '', nurseryType: '',
      capacity: '', currentStock: '', species: '',
      variety: '', seedSource: '', plantingDate: '',
      expectedReadyDate: '', germinationRate: '',
      survivalRate: '', healthStatus: '', notes: '',
    })
    setEditingItem(null)
  }

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
      const res = await fetch(`/api/nurseries?${params}`)
      const data = await res.json()
      if (data.success) {
        const _items = data.data?.data ?? data.data?.items ?? []; setItems(Array.isArray(_items) ? _items : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch nurseries', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchItems()
    }
  }, [status, router, fetchItems])

  const handleEdit = (item: Nursery) => {
    setEditingItem(item)
    setForm({
      nurseryName: item.nurseryName,
      nurseryCode: item.nurseryCode || '',
      location: item.location || '',
      province: item.province || '',
      district: item.district || '',
      commune: item.commune || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
      nurseryType: item.nurseryType || '',
      capacity: item.capacity?.toString() || '',
      currentStock: item.currentStock?.toString() || '',
      species: item.species || '',
      variety: item.variety || '',
      seedSource: item.seedSource || '',
      plantingDate: item.plantingDate ? item.plantingDate.split('T')[0] : '',
      expectedReadyDate: item.expectedReadyDate ? item.expectedReadyDate.split('T')[0] : '',
      germinationRate: item.germinationRate?.toString() || '',
      survivalRate: item.survivalRate?.toString() || '',
      healthStatus: item.healthStatus || '',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nurseryName) {
      toast.error(t2('Vui lòng nhập tên vườn ươm', 'Please enter nursery name'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        currentStock: form.currentStock ? parseInt(form.currentStock) : undefined,
        germinationRate: form.germinationRate ? parseFloat(form.germinationRate) : undefined,
        survivalRate: form.survivalRate ? parseFloat(form.survivalRate) : undefined,
        plantingDate: form.plantingDate || undefined,
        expectedReadyDate: form.expectedReadyDate || undefined,
      }

      const url = '/api/nurseries'
      const method = editingItem ? 'PUT' : 'POST'
      if (editingItem) {
        (payload as any).id = editingItem.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingItem ? t2('Cập nhật thành công!', 'Updated successfully!') : t2('Tạo vườn ươm thành công!', 'Nursery created!'))
        setDialogOpen(false)
        resetForm()
        fetchItems()
      } else {
        toast.error(data.error || t2('Lỗi khi lưu', 'Error saving'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/nurseries?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t2('Xóa thành công!', 'Deleted successfully!'))
        fetchItems()
      } else {
        toast.error(data.error || t2('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    }
    setDeleteConfirm(null)
  }

  const getHealthBadge = (health: string | null) => {
    if (!health) return <span className="text-muted-foreground text-xs">-</span>
    const colors: Record<string, string> = {
      'Excellent': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Good': 'bg-emerald-100 text-emerald-700',
      'Fair': 'bg-yellow-100 text-yellow-700',
      'Poor': 'bg-orange-100 text-orange-700',
      'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Tốt': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Khá': 'bg-emerald-100 text-emerald-700',
      'Trung bình': 'bg-yellow-100 text-yellow-700',
      'Kém': 'bg-orange-100 text-orange-700',
      'Nguy hiểm': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return <Badge className={`${colors[health] || 'bg-muted text-foreground'} text-[10px] border-0`}>{health}</Badge>
  }

  const totalPages = Math.ceil(total / pageSize)

  if (status === 'loading' || (loading && items.length === 0)) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Coffee className="w-9 h-9 text-primary-foreground animate-pulse" />
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
              <TreePine className="w-5 h-5 text-muted-foreground" />
              {t2('Quản lý Vườn ươm', 'Nursery Management')}
            </h2>
            <p className="text-sm text-muted-foreground">{t(`Tổng số: ${total} vườn ươm`, `Total: ${total} nurseries`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t2('Thêm vườn ươm', 'Add Nursery')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <TreePine className="w-5 h-5" />
                  {editingItem ? t2('Sửa vườn ươm', 'Edit Nursery') : t2('Thêm vườn ươm mới', 'Add New Nursery')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nursery Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Tên vườn ươm', 'Nursery Name')} *</Label>
                    <Input
                      value={form.nurseryName}
                      onChange={(e) => setForm({ ...form, nurseryName: e.target.value })}
                      placeholder={t2('Nhập tên vườn ươm', 'Enter nursery name')}
                      className="rounded-xl border-input focus:border-primary"
                      required
                    />
                  </div>

                  {/* Nursery Code */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Mã vườn ươm', 'Nursery Code')}</Label>
                    <Input
                      value={form.nurseryCode}
                      onChange={(e) => setForm({ ...form, nurseryCode: e.target.value })}
                      placeholder="NS-001"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Nursery Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Loại vườn ươm', 'Nursery Type')}</Label>
                    <Select value={form.nurseryType} onValueChange={(v) => setForm({ ...form, nurseryType: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn loại', 'Select type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seedling">{t2('Cây giống', 'Seedling')}</SelectItem>
                        <SelectItem value="clonal">{t2('Cấy ghép', 'Clonal')}</SelectItem>
                        <SelectItem value="grafted">{t2('Ghép cành', 'Grafted')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Vị trí', 'Location')}</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder={t2('Mô tả vị trí', 'Location description')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Province */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tỉnh/Thành phố', 'Province')}</Label>
                    <Input
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      placeholder={t2('Đắk Lắk', 'Dak Lak')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Quận/Huyện', 'District')}</Label>
                    <Input
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder={t('Ea H\'leo', 'Ea H\'leo')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Commune */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Xã/Phường', 'Commune')}</Label>
                    <Input
                      value={form.commune}
                      onChange={(e) => setForm({ ...form, commune: e.target.value })}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Latitude */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Vĩ độ', 'Latitude')}</Label>
                    <Input
                      type="number"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      placeholder="12.6667"
                      step="0.0001"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Longitude */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Kinh độ', 'Longitude')}</Label>
                    <Input
                      type="number"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      placeholder="108.0417"
                      step="0.0001"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Sức chứa', 'Capacity')}</Label>
                    <Input
                      type="number"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="5000"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Current Stock */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tồn kho hiện tại', 'Current Stock')}</Label>
                    <Input
                      type="number"
                      value={form.currentStock}
                      onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                      placeholder="3500"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Species */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Loài', 'Species')}</Label>
                    <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn loài', 'Select species')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coffea canephora">Coffea canephora ({t2('Robusta', 'Robusta')})</SelectItem>
                        <SelectItem value="Coffea arabica">Coffea arabica ({t2('Arabica', 'Arabica')})</SelectItem>
                        <SelectItem value="Coffea liberica">Coffea liberica ({t2('Liberica', 'Liberica')})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Variety */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Giống', 'Variety')}</Label>
                    <Input
                      value={form.variety}
                      onChange={(e) => setForm({ ...form, variety: e.target.value })}
                      placeholder={t2('VD: TR4', 'e.g. TR4')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Seed Source */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nguồn giống', 'Seed Source')}</Label>
                    <Input
                      value={form.seedSource}
                      onChange={(e) => setForm({ ...form, seedSource: e.target.value })}
                      placeholder={t2('VD: WAFCO', 'e.g. WAFCO')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Planting Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Ngày gieo', 'Planting Date')}</Label>
                    <Input
                      type="date"
                      value={form.plantingDate}
                      onChange={(e) => setForm({ ...form, plantingDate: e.target.value })}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Expected Ready Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Ngày dự kiến sẵn sàng', 'Expected Ready Date')}</Label>
                    <Input
                      type="date"
                      value={form.expectedReadyDate}
                      onChange={(e) => setForm({ ...form, expectedReadyDate: e.target.value })}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Germination Rate */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tỷ lệ nảy mầm (%)', 'Germination Rate (%)')}</Label>
                    <Input
                      type="number"
                      value={form.germinationRate}
                      onChange={(e) => setForm({ ...form, germinationRate: e.target.value })}
                      placeholder="85"
                      min="0" max="100"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Survival Rate */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tỷ lệ sống (%)', 'Survival Rate (%)')}</Label>
                    <Input
                      type="number"
                      value={form.survivalRate}
                      onChange={(e) => setForm({ ...form, survivalRate: e.target.value })}
                      placeholder="90"
                      min="0" max="100"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Health Status */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tình trạng sức khỏe', 'Health Status')}</Label>
                    <Select value={form.healthStatus} onValueChange={(v) => setForm({ ...form, healthStatus: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn tình trạng', 'Select status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">{t2('Tuyệt vời', 'Excellent')}</SelectItem>
                        <SelectItem value="Good">{t2('Tốt', 'Good')}</SelectItem>
                        <SelectItem value="Fair">{t2('Trung bình', 'Fair')}</SelectItem>
                        <SelectItem value="Poor">{t2('Kém', 'Poor')}</SelectItem>
                        <SelectItem value="Critical">{t2('Nguy hiểm', 'Critical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-foreground">{t2('Ghi chú', 'Notes')}</Label>
                    <Input
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder={t2('Ghi chú thêm', 'Additional notes')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                    {t2('Hủy', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t2('Đang lưu...', 'Saving...')}
                      </>
                    ) : (
                      editingItem ? t2('Cập nhật', 'Update') : t2('Tạo mới', 'Create')
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t2('Tìm kiếm vườn ươm...', 'Search nurseries...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Tên', 'Name')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Mã', 'Code')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Loài', 'Species')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Giống', 'Variety')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Sức chứa', 'Capacity')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Tồn kho', 'Stock')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">{t2('Sức khỏe', 'Health')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Hành động', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        {t2('Không tìm thấy dữ liệu', 'No data found')}
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={item.id}
 className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-foreground">{item.nurseryName}</p>
                          <p className="text-[10px] text-muted-foreground">{item.province || ''} {item.district ? `• ${item.district}` : ''}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{item.nurseryCode || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.nurseryType || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.species || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.variety || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.capacity?.toLocaleString() || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {item.currentStock !== null && item.capacity ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${Math.min(100, (item.currentStock / item.capacity) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px]">{item.currentStock.toLocaleString()}</span>
                            </div>
                          ) : (item.currentStock?.toLocaleString() || '-')}
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">{getHealthBadge(item.healthStatus)}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
                            {item.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/nurseries/${item.id}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(item)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            {deleteConfirm === item.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-red-600 text-[10px]" onClick={() => handleDelete(item.id)}>
                                  {t2('Xóa', 'Del')}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-muted-foreground text-[10px]" onClick={() => setDeleteConfirm(null)}>
                                  {t2('Hủy', 'No')}
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => setDeleteConfirm(item.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
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
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0 rounded-lg border-input">
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return (
                    <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-primary text-primary-foreground' : 'text-border text-muted-foreground'}`}>
                      {p}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0 rounded-lg border-input">
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
