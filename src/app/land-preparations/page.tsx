'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Shovel, Search, Plus,
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
import { formatCurrency } from '@/types'

interface FarmerOption {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLandOption {
  id: string
  farmName: string
  farmerId: string
}

interface LandPreparation {
  id: string
  preparationDate: string | null
  preparationType: string | null
  method: string | null
  equipmentUsed: string | null
  laborCount: number | null
  laborCost: number | null
  materialsUsed: string | null
  materialCost: number | null
  totalCost: number | null
  soilPhBefore: number | null
  soilPhAfter: number | null
  organicMatterPct: number | null
  notes: string | null
  isActive: boolean
  createdAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null }
}

export default function LandPreparationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const [items, setItems] = useState<LandPreparation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LandPreparation | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [farmers, setFarmers] = useState<FarmerOption[]>([])
  const [farmLands, setFarmLands] = useState<FarmLandOption[]>([])


  const [form, setForm] = useState({
    farmerId: '',
    farmLandId: '',
    preparationDate: '',
    preparationType: '',
    method: '',
    equipmentUsed: '',
    laborCount: '',
    laborCost: '',
    materialsUsed: '',
    materialCost: '',
    totalCost: '',
    soilPhBefore: '',
    soilPhAfter: '',
    organicMatterPct: '',
    notes: '',
  })

  const resetForm = () => {
    setForm({
      farmerId: '', farmLandId: '', preparationDate: '',
      preparationType: '', method: '', equipmentUsed: '',
      laborCount: '', laborCost: '', materialsUsed: '',
      materialCost: '', totalCost: '', soilPhBefore: '',
      soilPhAfter: '', organicMatterPct: '', notes: '',
    })
    setEditingItem(null)
  }

  const filteredFarmLands = useMemo(() => {
    if (!form.farmerId) return farmLands
    return farmLands.filter((fl) => fl.farmerId === form.farmerId)
  }, [farmLands, form.farmerId])

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
      const res = await fetch(`/api/land-preparations?${params}`)
      const data = await res.json()
      if (data.success) {
        const _items = data.data?.data ?? data.data?.items ?? []; setItems(Array.isArray(_items) ? _items : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch land preparations', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  const fetchFarmers = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=500&sortBy=fullName&sortOrder=asc')
      const data = await res.json()
      if (data.success) {
        setFarmers((data.data?.data ?? data.data?.farmers ?? []).map((f: any) => ({ id: f.id, fullName: f.fullName, farmerCode: f.farmerCode })))
      }
    } catch (err) {
      console.error('Failed to fetch farmers', err)
    }
  }, [])

  const fetchFarmLands = useCallback(async () => {
    try {
      const res = await fetch('/api/farmlands?pageSize=500&sortBy=farmName&sortOrder=asc')
      const data = await res.json()
      if (data.success) {
        setFarmLands((data.data?.data ?? []).map((fl: any) => ({ id: fl.id, farmName: fl.farmName, farmerId: fl.farmerId })))
      }
    } catch (err) {
      console.error('Failed to fetch farmlands', err)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchItems()
      fetchFarmers()
      fetchFarmLands()
    }
  }, [status, router, fetchItems, fetchFarmers, fetchFarmLands])

  useEffect(() => {
    if (form.farmerId && form.farmLandId) {
      const belongs = farmLands.find((fl) => fl.id === form.farmLandId && fl.farmerId === form.farmerId)
      if (!belongs) setForm((prev) => ({ ...prev, farmLandId: '' }))
    }
  }, [form.farmerId, form.farmLandId, farmLands])

  const handleEdit = (item: LandPreparation) => {
    setEditingItem(item)
    setForm({
      farmerId: item.farmer.id,
      farmLandId: item.farmLand.id,
      preparationDate: item.preparationDate ? item.preparationDate.split('T')[0] : '',
      preparationType: item.preparationType || '',
      method: item.method || '',
      equipmentUsed: item.equipmentUsed || '',
      laborCount: item.laborCount?.toString() || '',
      laborCost: item.laborCost?.toString() || '',
      materialsUsed: item.materialsUsed || '',
      materialCost: item.materialCost?.toString() || '',
      totalCost: item.totalCost?.toString() || '',
      soilPhBefore: item.soilPhBefore?.toString() || '',
      soilPhAfter: item.soilPhAfter?.toString() || '',
      organicMatterPct: item.organicMatterPct?.toString() || '',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmerId || !form.farmLandId) {
      toast.error(t2('Vui lòng điền các trường bắt buộc', 'Please fill required fields'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        laborCount: form.laborCount ? parseInt(form.laborCount) : undefined,
        laborCost: form.laborCost ? parseFloat(form.laborCost) : undefined,
        materialCost: form.materialCost ? parseFloat(form.materialCost) : undefined,
        totalCost: form.totalCost ? parseFloat(form.totalCost) : undefined,
        soilPhBefore: form.soilPhBefore ? parseFloat(form.soilPhBefore) : undefined,
        soilPhAfter: form.soilPhAfter ? parseFloat(form.soilPhAfter) : undefined,
        organicMatterPct: form.organicMatterPct ? parseFloat(form.organicMatterPct) : undefined,
        preparationDate: form.preparationDate || undefined,
      }

      const url = '/api/land-preparations'
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
        toast.success(editingItem ? t2('Cập nhật thành công!', 'Updated successfully!') : t2('Tạo chuẩn bị đất thành công!', 'Land preparation created!'))
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
      const res = await fetch(`/api/land-preparations?id=${id}`, { method: 'DELETE' })
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
              <Shovel className="w-5 h-5 text-muted-foreground" />
              {t2('Quản lý Chuẩn bị đất', 'Land Preparation Management')}
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
                {t2('Thêm chuẩn bị đất', 'Add Land Preparation')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Shovel className="w-5 h-5" />
                  {editingItem ? t2('Sửa chuẩn bị đất', 'Edit Land Preparation') : t2('Thêm chuẩn bị đất mới', 'Add New Land Preparation')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer Select */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Nông dân', 'Farmer')} *</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn nông dân', 'Select farmer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Land Select */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Đất nông trại', 'Farm Land')} *</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })} disabled={!form.farmerId}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn đất', 'Select farm land')} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredFarmLands.map((fl) => (
                          <SelectItem key={fl.id} value={fl.id}>
                            {fl.farmName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preparation Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Ngày chuẩn bị', 'Preparation Date')}</Label>
                    <Input
                      type="date"
                      value={form.preparationDate}
                      onChange={(e) => setForm({ ...form, preparationDate: e.target.value })}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Preparation Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Loại chuẩn bị', 'Preparation Type')}</Label>
                    <Select value={form.preparationType} onValueChange={(v) => setForm({ ...form, preparationType: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn loại', 'Select type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">{t2('Khởi tạo', 'Initial')}</SelectItem>
                        <SelectItem value="seasonal">{t2('Theo mùa', 'Seasonal')}</SelectItem>
                        <SelectItem value="renovation">{t2('Cải tạo', 'Renovation')}</SelectItem>
                        <SelectItem value="rehabilitation">{t2('Phục hồi', 'Rehabilitation')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Phương pháp', 'Method')}</Label>
                    <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                      <SelectTrigger className="rounded-xl border-input">
                        <SelectValue placeholder={t2('Chọn phương pháp', 'Select method')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plowing">{t2('Cày', 'Plowing')}</SelectItem>
                        <SelectItem value="harrowing">{t2('Bừa', 'Harrowing')}</SelectItem>
                        <SelectItem value="ridging">{t2('Lên luống', 'Ridging')}</SelectItem>
                        <SelectItem value="digging">{t2('Đào', 'Digging')}</SelectItem>
                        <SelectItem value="manual">{t2('Thủ công', 'Manual')}</SelectItem>
                        <SelectItem value="zero_tillage">{t2('Không cày', 'Zero Tillage')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Equipment Used */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Thiết bị sử dụng', 'Equipment Used')}</Label>
                    <Input
                      value={form.equipmentUsed}
                      onChange={(e) => setForm({ ...form, equipmentUsed: e.target.value })}
                      placeholder={t2('Máy cày, Cuốc...', 'Tractor, Hoe...')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Labor Count */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Số nhân công', 'Labor Count')}</Label>
                    <Input
                      type="number"
                      value={form.laborCount}
                      onChange={(e) => setForm({ ...form, laborCount: e.target.value })}
                      placeholder="5"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Labor Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Chi phí nhân công', 'Labor Cost')}</Label>
                    <Input
                      type="number"
                      value={form.laborCost}
                      onChange={(e) => setForm({ ...form, laborCost: e.target.value })}
                      placeholder="2000000"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Materials Used */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Vật liệu sử dụng', 'Materials Used')}</Label>
                    <Input
                      value={form.materialsUsed}
                      onChange={(e) => setForm({ ...form, materialsUsed: e.target.value })}
                      placeholder={t2('Phân chuồng, Vôi...', 'Manure, Lime...')}
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Material Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Chi phí vật liệu', 'Material Cost')}</Label>
                    <Input
                      type="number"
                      value={form.materialCost}
                      onChange={(e) => setForm({ ...form, materialCost: e.target.value })}
                      placeholder="1500000"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Total Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Tổng chi phí', 'Total Cost')}</Label>
                    <Input
                      type="number"
                      value={form.totalCost}
                      onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
                      placeholder="3500000"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Soil pH Before */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('pH đất trước', 'Soil pH Before')}</Label>
                    <Input
                      type="number"
                      value={form.soilPhBefore}
                      onChange={(e) => setForm({ ...form, soilPhBefore: e.target.value })}
                      placeholder="5.2"
                      step="0.1"
                      min="0" max="14"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Soil pH After */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('pH đất sau', 'Soil pH After')}</Label>
                    <Input
                      type="number"
                      value={form.soilPhAfter}
                      onChange={(e) => setForm({ ...form, soilPhAfter: e.target.value })}
                      placeholder="6.0"
                      step="0.1"
                      min="0" max="14"
                      className="rounded-xl border-input focus:border-primary"
                    />
                  </div>

                  {/* Organic Matter % */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">{t2('Hữu cơ (%)', 'Organic Matter (%)')}</Label>
                    <Input
                      type="number"
                      value={form.organicMatterPct}
                      onChange={(e) => setForm({ ...form, organicMatterPct: e.target.value })}
                      placeholder="3.5"
                      step="0.1"
                      min="0" max="100"
                      className="rounded-xl border-input focus:border-primary"
                    />
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
              placeholder={t2('Tìm kiếm chuẩn bị đất...', 'Search land preparations...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t2('Nông trại', 'Farm Land')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Ngày', 'Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t2('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('PP', 'Method')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t2('Thiết bị', 'Equipment')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">{t2('CP nhân công', 'Labor Cost')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">{t2('Tổng CP', 'Total Cost')}</th>
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
                          <p className="text-xs font-medium text-foreground">{item.farmer.fullName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{item.farmLand.farmName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.preparationDate ? new Date(item.preparationDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.preparationType || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.method || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.equipmentUsed || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">{item.laborCost ? formatCurrency(item.laborCost, 'VND') : '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">{item.totalCost ? formatCurrency(item.totalCost, 'VND') : '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
                            {item.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/land-preparations/${item.id}`)}>
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
