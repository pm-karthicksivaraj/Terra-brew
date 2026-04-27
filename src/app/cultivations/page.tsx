'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Sprout, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

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

interface Cultivation {
  id: string
  farmPlotName: string
  cultivatedCrop: string | null
  cropVariety: string | null
  cultivationArea: number | null
  sowingDate: string | null
  estYield: string | null
  isActive: boolean
  createdAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null }
}

export default function CultivationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [items, setItems] = useState<Cultivation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Cultivation | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Dropdown options
  const [farmers, setFarmers] = useState<FarmerOption[]>([])
  const [farmLands, setFarmLands] = useState<FarmLandOption[]>([])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  // Form state
  const [form, setForm] = useState({
    farmPlotName: '',
    farmerId: '',
    farmLandId: '',
    cultivatedCrop: '',
    cropVariety: '',
    coffeeSpecies: '',
    cultivationArea: '',
    plantingSpacing: '',
    treeDensity: '',
    sowingDate: '',
    seedSource: '',
    seedType: '',
    seedQuantity: '',
    seedCost: '',
    intendedProcessingMethod: '',
    irrigationMethod: '',
  })

  const resetForm = () => {
    setForm({
      farmPlotName: '', farmerId: '', farmLandId: '',
      cultivatedCrop: '', cropVariety: '', coffeeSpecies: '',
      cultivationArea: '', plantingSpacing: '', treeDensity: '',
      sowingDate: '', seedSource: '', seedType: '',
      seedQuantity: '', seedCost: '',
      intendedProcessingMethod: '', irrigationMethod: '',
    })
    setEditingItem(null)
  }

  // Filter farmlands by selected farmer
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
      const res = await fetch(`/api/cultivations?${params}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data.data)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error('Failed to fetch cultivations', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  const fetchFarmers = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=500&sortBy=fullName&sortOrder=asc')
      const data = await res.json()
      if (data.success) {
        setFarmers(data.data.farmers.map((f: any) => ({ id: f.id, fullName: f.fullName, farmerCode: f.farmerCode })))
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
        setFarmLands(data.data.data.map((fl: any) => ({ id: fl.id, farmName: fl.farmName, farmerId: fl.farmerId })))
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

  // Reset farmLandId when farmerId changes
  useEffect(() => {
    if (form.farmerId && form.farmLandId) {
      const belongs = farmLands.find((fl) => fl.id === form.farmLandId && fl.farmerId === form.farmerId)
      if (!belongs) setForm((prev) => ({ ...prev, farmLandId: '' }))
    }
  }, [form.farmerId, form.farmLandId, farmLands])

  const handleEdit = (item: Cultivation) => {
    setEditingItem(item)
    setForm({
      farmPlotName: item.farmPlotName,
      farmerId: item.farmer.id,
      farmLandId: item.farmLand.id,
      cultivatedCrop: item.cultivatedCrop || '',
      cropVariety: item.cropVariety || '',
      coffeeSpecies: '',
      cultivationArea: item.cultivationArea?.toString() || '',
      plantingSpacing: '',
      treeDensity: '',
      sowingDate: item.sowingDate ? item.sowingDate.split('T')[0] : '',
      seedSource: '',
      seedType: '',
      seedQuantity: '',
      seedCost: '',
      intendedProcessingMethod: '',
      irrigationMethod: '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmPlotName || !form.farmerId || !form.farmLandId) {
      toast.error(t('Vui lòng điền các trường bắt buộc', 'Please fill required fields'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        cultivationArea: form.cultivationArea ? parseFloat(form.cultivationArea) : undefined,
        plantingSpacing: form.plantingSpacing ? parseFloat(form.plantingSpacing) : undefined,
        treeDensity: form.treeDensity ? parseInt(form.treeDensity) : undefined,
        seedQuantity: form.seedQuantity ? parseFloat(form.seedQuantity) : undefined,
        seedCost: form.seedCost ? parseFloat(form.seedCost) : undefined,
        sowingDate: form.sowingDate || undefined,
      }

      const url = '/api/cultivations'
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
        toast.success(editingItem ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo canh tác thành công!', 'Cultivation created!'))
        setDialogOpen(false)
        resetForm()
        fetchItems()
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
      const res = await fetch(`/api/cultivations?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Xóa thành công!', 'Deleted successfully!'))
        fetchItems()
      } else {
        toast.error(data.error || t('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
    setDeleteConfirm(null)
  }

  const totalPages = Math.ceil(total / pageSize)

  if (status === 'loading' || (loading && items.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
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
              <Sprout className="w-5 h-5 text-coffee-600" />
              {t('Quản lý Canh tác', 'Cultivation Management')}
            </h2>
            <p className="text-sm text-coffee-500">{t(`Tổng số: ${total} canh tác`, `Total: ${total} cultivations`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t('Thêm canh tác mới', 'Add New Cultivation')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-coffee-800 flex items-center gap-2">
                  <Sprout className="w-5 h-5" />
                  {editingItem ? t('Sửa canh tác', 'Edit Cultivation') : t('Thêm canh tác mới', 'Add New Cultivation')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plot Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Tên lô canh tác', 'Plot Name')} *</Label>
                    <Input
                      value={form.farmPlotName}
                      onChange={(e) => setForm({ ...form, farmPlotName: e.target.value })}
                      placeholder={t('Nhập tên lô', 'Enter plot name')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      required
                    />
                  </div>

                  {/* Farmer Select */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Nông dân', 'Farmer')} *</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn nông dân', 'Select farmer')} />
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

                  {/* Farm Land Select (filtered by farmer) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Đất nông trại', 'Farm Land')} *</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })} disabled={!form.farmerId}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn đất', 'Select farm land')} />
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

                  {/* Cultivated Crop */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Cây trồng', 'Crop')}</Label>
                    <Select value={form.cultivatedCrop} onValueChange={(v) => setForm({ ...form, cultivatedCrop: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn cây trồng', 'Select crop')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robusta">{t('Cà phê Robusta', 'Robusta Coffee')}</SelectItem>
                        <SelectItem value="Arabica">{t('Cà phê Arabica', 'Arabica Coffee')}</SelectItem>
                        <SelectItem value="Liberica">{t('Cà phê Liberica', 'Liberica Coffee')}</SelectItem>
                        <SelectItem value="Excelsa">{t('Cà phê Excelsa', 'Excelsa Coffee')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Crop Variety */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Giống', 'Variety')}</Label>
                    <Input
                      value={form.cropVariety}
                      onChange={(e) => setForm({ ...form, cropVariety: e.target.value })}
                      placeholder={t('VD: Catimor', 'e.g. Catimor')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Coffee Species */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Loài cà phê', 'Coffee Species')}</Label>
                    <Select value={form.coffeeSpecies} onValueChange={(v) => setForm({ ...form, coffeeSpecies: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn loài', 'Select species')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coffea canephora">Coffea canephora</SelectItem>
                        <SelectItem value="Coffea arabica">Coffea arabica</SelectItem>
                        <SelectItem value="Coffea liberica">Coffea liberica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cultivation Area */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Diện tích (ha)', 'Area (ha)')}</Label>
                    <Input
                      type="number"
                      value={form.cultivationArea}
                      onChange={(e) => setForm({ ...form, cultivationArea: e.target.value })}
                      placeholder="1.5"
                      step="0.1"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Planting Spacing */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Khoảng cách trồng (m)', 'Planting Spacing (m)')}</Label>
                    <Input
                      type="number"
                      value={form.plantingSpacing}
                      onChange={(e) => setForm({ ...form, plantingSpacing: e.target.value })}
                      placeholder="3x2"
                      step="0.1"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Tree Density */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Mật độ cây (cây/ha)', 'Tree Density (trees/ha)')}</Label>
                    <Input
                      type="number"
                      value={form.treeDensity}
                      onChange={(e) => setForm({ ...form, treeDensity: e.target.value })}
                      placeholder="1667"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Sowing Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày gieo trồng', 'Sowing Date')}</Label>
                    <Input
                      type="date"
                      value={form.sowingDate}
                      onChange={(e) => setForm({ ...form, sowingDate: e.target.value })}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Seed Source */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Nguồn giống', 'Seed Source')}</Label>
                    <Input
                      value={form.seedSource}
                      onChange={(e) => setForm({ ...form, seedSource: e.target.value })}
                      placeholder={t('VD: WAFCO', 'e.g. WAFCO')}
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Seed Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Loại hạt giống', 'Seed Type')}</Label>
                    <Select value={form.seedType} onValueChange={(v) => setForm({ ...form, seedType: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn loại', 'Select type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="certified">{t('Đã chứng nhận', 'Certified')}</SelectItem>
                        <SelectItem value="local">{t('Giống địa phương', 'Local Variety')}</SelectItem>
                        <SelectItem value="hybrid">{t('Lai', 'Hybrid')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seed Quantity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Số lượng hạt (kg)', 'Seed Quantity (kg)')}</Label>
                    <Input
                      type="number"
                      value={form.seedQuantity}
                      onChange={(e) => setForm({ ...form, seedQuantity: e.target.value })}
                      placeholder="50"
                      step="0.1"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Seed Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Chi phí hạt giống', 'Seed Cost')}</Label>
                    <Input
                      type="number"
                      value={form.seedCost}
                      onChange={(e) => setForm({ ...form, seedCost: e.target.value })}
                      placeholder="500000"
                      className="rounded-xl border-coffee-200 focus:border-coffee-500"
                    />
                  </div>

                  {/* Intended Processing Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('PP chế biến dự kiến', 'Intended Processing')}</Label>
                    <Select value={form.intendedProcessingMethod} onValueChange={(v) => setForm({ ...form, intendedProcessingMethod: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn phương pháp', 'Select method')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wet">{t('Ướt', 'Wet Process')}</SelectItem>
                        <SelectItem value="dry">{t('Khô', 'Dry Process')}</SelectItem>
                        <SelectItem value="honey">{t('Mật ong', 'Honey Process')}</SelectItem>
                        <SelectItem value="natural">{t('Tự nhiên', 'Natural')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Irrigation Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('PP tưới tiêu', 'Irrigation Method')}</Label>
                    <Select value={form.irrigationMethod} onValueChange={(v) => setForm({ ...form, irrigationMethod: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn phương pháp', 'Select method')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rainfed">{t('Tưới tự nhiên', 'Rainfed')}</SelectItem>
                        <SelectItem value="drip">{t('Nhỏ giọt', 'Drip Irrigation')}</SelectItem>
                        <SelectItem value="sprinkler">{t('Phun mưa', 'Sprinkler')}</SelectItem>
                        <SelectItem value="flood">{t('Ngập', 'Flood Irrigation')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-coffee-100">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                    {t('Hủy', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-white rounded-xl"
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

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm canh tác...', 'Search cultivations...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Tên lô', 'Plot Name')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Nông trại', 'Farm Land')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Cây trồng', 'Crop')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Giống', 'Variety')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Diện tích', 'Area')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden xl:table-cell">{t('Ngày gieo', 'Sowing Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden xl:table-cell">{t('SL ước', 'Est. Yield')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Hành động', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-coffee-400 text-sm">
                        {t('Không tìm thấy dữ liệu', 'No data found')}
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={item.id}
 className="border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-coffee-800">{item.farmPlotName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-coffee-700">{item.farmer.fullName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{item.farmLand.farmName}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{item.cultivatedCrop || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{item.cropVariety || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{item.cultivationArea ? `${item.cultivationArea} ha` : '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden xl:table-cell">{item.sowingDate ? new Date(item.sowingDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden xl:table-cell">{item.estYield || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px] border-0`}>
                            {item.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-coffee-500 hover:text-coffee-800" onClick={() => handleEdit(item)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            {deleteConfirm === item.id ? (
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-red-600 text-[10px]" onClick={() => handleDelete(item.id)}>
                                  {t('Xóa', 'Del')}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-coffee-400 text-[10px]" onClick={() => setDeleteConfirm(null)}>
                                  {t('Hủy', 'No')}
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-coffee-400 hover:text-red-600" onClick={() => setDeleteConfirm(item.id)}>
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-coffee-100">
              <p className="text-[10px] text-coffee-500">
                {t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0 rounded-lg border-coffee-200">
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return (
                    <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-coffee-700 text-white' : 'border-coffee-200 text-coffee-600'}`}>
                      {p}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0 rounded-lg border-coffee-200">
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
