'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, MapPin, Search, Plus,
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { formatCurrency } from '@/types'
import { FadeIn, StaggerContainer, StaggerItem, hoverScale, MotionButton } from '@/components/ui/motion'

interface FarmerOption {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLand {
  id: string
  farmName: string
  plotBlockId: string | null
  totalLandHolding: number | null
  altitude: number | null
  soilType: string | null
  noOfTrees: number | null
  estYield: number | null
  childLabourPolicy: boolean
  minimumWageCompliance: boolean
  ppeAvailable: boolean
  isActive: boolean
  createdAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
}

export default function FarmLandsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [items, setItems] = useState<FarmLand[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FarmLand | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Dropdown options
  const [farmers, setFarmers] = useState<FarmerOption[]>([])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  // Form state
  const [form, setForm] = useState({
    farmName: '',
    farmerId: '',
    plotBlockId: '',
    totalLandHolding: '',
    altitude: '',
    latitude: '',
    longitude: '',
    landOwnership: '',
    soilType: '',
    waterSource: '',
    noOfTrees: '',
    estYield: '',
    childLabourPolicy: false,
    minimumWageCompliance: false,
    ppeAvailable: false,
  })

  const resetForm = () => {
    setForm({
      farmName: '', farmerId: '', plotBlockId: '',
      totalLandHolding: '', altitude: '', latitude: '',
      longitude: '', landOwnership: '', soilType: '',
      waterSource: '', noOfTrees: '', estYield: '',
      childLabourPolicy: false, minimumWageCompliance: false,
      ppeAvailable: false,
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
      const res = await fetch(`/api/farmlands?${params}`)
      const data = await res.json()
      if (data.success) {
        const itemsArr = data.data?.data ?? data.data?.items ?? []
        setItems(Array.isArray(itemsArr) ? itemsArr : [])
        setTotal(data.data?.total ?? 0)
      }
    } catch (err) {
      console.error('Failed to fetch farmlands', err)
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchItems()
      fetchFarmers()
    }
  }, [status, router, fetchItems, fetchFarmers])

  const handleEdit = (item: FarmLand) => {
    setEditingItem(item)
    setForm({
      farmName: item.farmName,
      farmerId: item.farmer.id,
      plotBlockId: item.plotBlockId || '',
      totalLandHolding: item.totalLandHolding?.toString() || '',
      altitude: item.altitude?.toString() || '',
      latitude: '',
      longitude: '',
      landOwnership: '',
      soilType: item.soilType || '',
      waterSource: '',
      noOfTrees: item.noOfTrees?.toString() || '',
      estYield: item.estYield?.toString() || '',
      childLabourPolicy: item.childLabourPolicy,
      minimumWageCompliance: item.minimumWageCompliance,
      ppeAvailable: item.ppeAvailable,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmName || !form.farmerId) {
      toast.error(t('Vui lòng điền các trường bắt buộc', 'Please fill required fields'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        totalLandHolding: form.totalLandHolding ? parseFloat(form.totalLandHolding) : undefined,
        altitude: form.altitude ? parseFloat(form.altitude) : undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        noOfTrees: form.noOfTrees ? parseInt(form.noOfTrees) : undefined,
        estYield: form.estYield ? parseFloat(form.estYield) : undefined,
      }

      const url = editingItem ? '/api/farmlands' : '/api/farmlands'
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
        toast.success(editingItem ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo đất nông trại thành công!', 'Farm land created!'))
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
      const res = await fetch(`/api/farmlands?id=${id}`, { method: 'DELETE' })
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
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('Quản lý Đất nông trại', 'Farm Land Management')}
              </h2>
              <p className="text-sm text-muted-foreground">{t(`Tổng số: ${total} mảnh đất`, `Total: ${total} farm lands`)}</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <MotionButton
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-md h-9 px-4 text-xs font-medium cursor-pointer"
                  onClick={() => { resetForm(); setDialogOpen(true) }}
                  {...hoverScale}
                >
                  <Plus className="w-4 h-4" />
                  {t('Thêm đất mới', 'Add New Farm Land')}
                </MotionButton>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {editingItem ? t('Sửa thông tin đất', 'Edit Farm Land') : t('Thêm đất nông trại mới', 'Add New Farm Land')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Farm Name */}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs text-foreground">{t('Tên nông trại', 'Farm Name')} *</Label>
                      <Input
                        value={form.farmName}
                        onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                        placeholder={t('Nhập tên nông trại', 'Enter farm name')}
                        className="rounded-xl border-input focus:border-primary"
                        required
                      />
                    </div>

                    {/* Farmer Select */}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs text-foreground">{t('Nông dân', 'Farmer')} *</Label>
                      <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v })}>
                        <SelectTrigger className="rounded-xl border-input">
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

                    {/* Plot Block ID */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Mã lô đất', 'Plot Block ID')}</Label>
                      <Input
                        value={form.plotBlockId}
                        onChange={(e) => setForm({ ...form, plotBlockId: e.target.value })}
                        placeholder={t('PB-001', 'PB-001')}
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Total Land Holding */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Diện tích (ha)', 'Area (ha)')}</Label>
                      <Input
                        type="number"
                        value={form.totalLandHolding}
                        onChange={(e) => setForm({ ...form, totalLandHolding: e.target.value })}
                        placeholder="2.5"
                        step="0.1"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Altitude */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Độ cao (m)', 'Altitude (m)')}</Label>
                      <Input
                        type="number"
                        value={form.altitude}
                        onChange={(e) => setForm({ ...form, altitude: e.target.value })}
                        placeholder="1200"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Latitude */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Vĩ độ', 'Latitude')}</Label>
                      <Input
                        type="number"
                        value={form.latitude}
                        onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                        placeholder="12.2345"
                        step="0.0001"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Longitude */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Kinh độ', 'Longitude')}</Label>
                      <Input
                        type="number"
                        value={form.longitude}
                        onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                        placeholder="108.4567"
                        step="0.0001"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Land Ownership */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Quyền sở hữu', 'Land Ownership')}</Label>
                      <Select value={form.landOwnership} onValueChange={(v) => setForm({ ...form, landOwnership: v })}>
                        <SelectTrigger className="rounded-xl border-input">
                          <SelectValue placeholder={t('Chọn...', 'Select...')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owned">{t('Sở hữu', 'Owned')}</SelectItem>
                          <SelectItem value="leased">{t('Thuê', 'Leased')}</SelectItem>
                          <SelectItem value="shared">{t('Chung', 'Shared')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Soil Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Loại đất', 'Soil Type')}</Label>
                      <Select value={form.soilType} onValueChange={(v) => setForm({ ...form, soilType: v })}>
                        <SelectTrigger className="rounded-xl border-input">
                          <SelectValue placeholder={t('Chọn loại đất', 'Select soil type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basalt (Đỏ bazan)">{t('Đỏ bazan', 'Basalt Red')}</SelectItem>
                          <SelectItem value="Sandy (Cát)">{t('Cát', 'Sandy')}</SelectItem>
                          <SelectItem value="Clay (Đất sét)">{t('Đất sét', 'Clay')}</SelectItem>
                          <SelectItem value="Loam (Đất thịt)">{t('Đất thịt', 'Loam')}</SelectItem>
                          <SelectItem value="Volcanic (Đất núi lửa)">{t('Đất núi lửa', 'Volcanic')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Water Source */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Nguồn nước', 'Water Source')}</Label>
                      <Select value={form.waterSource} onValueChange={(v) => setForm({ ...form, waterSource: v })}>
                        <SelectTrigger className="rounded-xl border-input">
                          <SelectValue placeholder={t('Chọn nguồn nước', 'Select water source')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rainfed">{t('Tưới tự nhiên', 'Rainfed')}</SelectItem>
                          <SelectItem value="irrigation">{t('Tưới tiêu', 'Irrigation')}</SelectItem>
                          <SelectItem value="well">{t('Giếng', 'Well')}</SelectItem>
                          <SelectItem value="river">{t('Sông/Suối', 'River/Stream')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* No of Trees */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Số cây', 'Trees')}</Label>
                      <Input
                        type="number"
                        value={form.noOfTrees}
                        onChange={(e) => setForm({ ...form, noOfTrees: e.target.value })}
                        placeholder="1200"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>

                    {/* Est Yield */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-foreground">{t('Sản lượng ước (kg)', 'Est. Yield (kg)')}</Label>
                      <Input
                        type="number"
                        value={form.estYield}
                        onChange={(e) => setForm({ ...form, estYield: e.target.value })}
                        placeholder="3500"
                        step="0.1"
                        className="rounded-xl border-input focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="childLabourPolicy"
                        checked={form.childLabourPolicy}
                        onCheckedChange={(v) => setForm({ ...form, childLabourPolicy: !!v })}
                      />
                      <Label htmlFor="childLabourPolicy" className="text-xs text-foreground">{t('Không lao động trẻ em', 'No Child Labour')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="minimumWageCompliance"
                        checked={form.minimumWageCompliance}
                        onCheckedChange={(v) => setForm({ ...form, minimumWageCompliance: !!v })}
                      />
                      <Label htmlFor="minimumWageCompliance" className="text-xs text-foreground">{t('Tuân thủ lương tối thiểu', 'Min Wage Compliance')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="ppeAvailable"
                        checked={form.ppeAvailable}
                        onCheckedChange={(v) => setForm({ ...form, ppeAvailable: !!v })}
                      />
                      <Label htmlFor="ppeAvailable" className="text-xs text-foreground">{t('Có đồ bảo hộ', 'PPE Available')}</Label>
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
        </FadeIn>

        {/* Search */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder={t('Tìm kiếm đất nông trại...', 'Search farm lands...')}
                className="pl-9 rounded-xl border-input focus:border-primary bg-background"
              />
            </div>
            <Badge variant="outline" className="border-border text-muted-foreground text-xs">
              {t(`${total} bản ghi`, `${total} records`)}
            </Badge>
          </div>
        </FadeIn>

        {/* Table */}
        <FadeIn delay={0.2}>
          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Tên nông trại', 'Farm Name')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Nông dân', 'Farmer')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Mã lô', 'Plot ID')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t('Diện tích', 'Area (ha)')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Độ cao', 'Altitude')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Loại đất', 'Soil')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t('Số cây', 'Trees')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">{t('SL ước', 'Est. Yield')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Hành động', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                          {t('Không tìm thấy dữ liệu', 'No data found')}
                        </td>
                      </tr>
                    ) : (
                      <StaggerContainer className="contents">
                        {items.map((item) => (
                          <StaggerItem key={item.id} className="contents">
                            <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <p className="text-xs font-medium text-foreground">{item.farmName}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs text-foreground">{item.farmer.fullName}</p>
                                <p className="text-[10px] text-muted-foreground">{item.farmer.farmerCode || ''}</p>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">{item.plotBlockId || '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{item.totalLandHolding ? `${item.totalLandHolding} ha` : '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.altitude ? `${item.altitude}m` : '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.soilType || '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{item.noOfTrees?.toLocaleString() || '-'}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">{item.estYield ? `${item.estYield.toLocaleString()} kg` : '-'}</td>
                              <td className="px-4 py-3">
                                <Badge className={`${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
                                  {item.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(item)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  {deleteConfirm === item.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-red-600 text-[10px]" onClick={() => handleDelete(item.id)}>
                                        {t('Xóa', 'Del')}
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-7 px-2 p-0 text-muted-foreground text-[10px]" onClick={() => setDeleteConfirm(null)}>
                                        {t('Hủy', 'No')}
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
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
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
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
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
        </FadeIn>
      </div>
    </DashboardShell>
  )
}
