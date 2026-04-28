'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Droplets, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, Leaf,
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

interface FertilizerApp {
  id: string
  applicationDate: string | null
  fertilizerType: string | null
  fertilizerName: string | null
  nutrientContent: string | null
  applicationRate: number | null
  unit: string | null
  totalQuantity: number | null
  applicationMethod: string | null
  costPerUnit: number | null
  totalCost: number | null
  weatherAtApplication: string | null
  appliedBy: string | null
  isOrganic: boolean
  certificationNumber: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null }
}

export default function FertilizerAppsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [items, setItems] = useState<FertilizerApp[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FertilizerApp | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [farmers, setFarmers] = useState<FarmerOption[]>([])
  const [farmLands, setFarmLands] = useState<FarmLandOption[]>([])

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const [form, setForm] = useState({
    farmerId: '',
    farmLandId: '',
    applicationDate: '',
    fertilizerType: '',
    fertilizerName: '',
    nutrientContent: '',
    applicationRate: '',
    unit: '',
    totalQuantity: '',
    applicationMethod: '',
    costPerUnit: '',
    totalCost: '',
    weatherAtApplication: '',
    appliedBy: '',
    isOrganic: false,
    certificationNumber: '',
    notes: '',
  })

  const resetForm = () => {
    setForm({
      farmerId: '', farmLandId: '', applicationDate: '',
      fertilizerType: '', fertilizerName: '', nutrientContent: '',
      applicationRate: '', unit: '', totalQuantity: '',
      applicationMethod: '', costPerUnit: '', totalCost: '',
      weatherAtApplication: '', appliedBy: '',
      isOrganic: false, certificationNumber: '', notes: '',
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
      const res = await fetch(`/api/fertilizer-apps?${params}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data.data)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error('Failed to fetch fertilizer applications', err)
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

  const handleEdit = (item: FertilizerApp) => {
    setEditingItem(item)
    setForm({
      farmerId: item.farmer.id,
      farmLandId: item.farmLand.id,
      applicationDate: item.applicationDate ? item.applicationDate.split('T')[0] : '',
      fertilizerType: item.fertilizerType || '',
      fertilizerName: item.fertilizerName || '',
      nutrientContent: item.nutrientContent || '',
      applicationRate: item.applicationRate?.toString() || '',
      unit: item.unit || '',
      totalQuantity: item.totalQuantity?.toString() || '',
      applicationMethod: item.applicationMethod || '',
      costPerUnit: item.costPerUnit?.toString() || '',
      totalCost: item.totalCost?.toString() || '',
      weatherAtApplication: item.weatherAtApplication || '',
      appliedBy: item.appliedBy || '',
      isOrganic: item.isOrganic,
      certificationNumber: item.certificationNumber || '',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmerId || !form.farmLandId) {
      toast.error(t('Vui lòng điền các trường bắt buộc', 'Please fill required fields'))
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        applicationRate: form.applicationRate ? parseFloat(form.applicationRate) : undefined,
        totalQuantity: form.totalQuantity ? parseFloat(form.totalQuantity) : undefined,
        costPerUnit: form.costPerUnit ? parseFloat(form.costPerUnit) : undefined,
        totalCost: form.totalCost ? parseFloat(form.totalCost) : undefined,
        applicationDate: form.applicationDate || undefined,
      }

      const url = '/api/fertilizer-apps'
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
        toast.success(editingItem ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo phân bón thành công!', 'Fertilizer application created!'))
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
      const res = await fetch(`/api/fertilizer-apps?id=${id}`, { method: 'DELETE' })
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
              <Droplets className="w-5 h-5 text-coffee-600" />
              {t('Quản lý Phân bón', 'Fertilizer Application Management')}
            </h2>
            <p className="text-sm text-coffee-500">{t(`Tổng số: ${total} bản ghi`, `Total: ${total} records`)}</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
                onClick={() => { resetForm(); setDialogOpen(true) }}
              >
                <Plus className="w-4 h-4" />
                {t('Thêm phân bón', 'Add Fertilizer App')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-coffee-800 flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  {editingItem ? t('Sửa phân bón', 'Edit Fertilizer App') : t('Thêm phân bón mới', 'Add New Fertilizer App')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Farmer */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Nông dân', 'Farmer')} *</Label>
                    <Select value={form.farmerId} onValueChange={(v) => setForm({ ...form, farmerId: v, farmLandId: '' })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn nông dân', 'Select farmer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {farmers.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Land */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Đất nông trại', 'Farm Land')} *</Label>
                    <Select value={form.farmLandId} onValueChange={(v) => setForm({ ...form, farmLandId: v })} disabled={!form.farmerId}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn đất', 'Select farm land')} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredFarmLands.map((fl) => (
                          <SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Application Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Ngày bón', 'Application Date')}</Label>
                    <Input type="date" value={form.applicationDate} onChange={(e) => setForm({ ...form, applicationDate: e.target.value })} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Fertilizer Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Loại phân bón', 'Fertilizer Type')}</Label>
                    <Select value={form.fertilizerType} onValueChange={(v) => setForm({ ...form, fertilizerType: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn loại', 'Select type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organic">{t('Hữu cơ', 'Organic')}</SelectItem>
                        <SelectItem value="inorganic">{t('Vô cơ', 'Inorganic')}</SelectItem>
                        <SelectItem value="bio_fertilizer">{t('Vi sinh', 'Bio-fertilizer')}</SelectItem>
                        <SelectItem value="foliar">{t('Phun lá', 'Foliar')}</SelectItem>
                        <SelectItem value="compound">{t('Hỗn hợp', 'Compound')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fertilizer Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tên phân bón', 'Fertilizer Name')}</Label>
                    <Input value={form.fertilizerName} onChange={(e) => setForm({ ...form, fertilizerName: e.target.value })} placeholder={t('VD: NPK 16-16-8', 'e.g. NPK 16-16-8')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Nutrient Content */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Thành phần DD', 'Nutrient Content')}</Label>
                    <Input value={form.nutrientContent} onChange={(e) => setForm({ ...form, nutrientContent: e.target.value })} placeholder="N-P-K: 16-16-8" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Application Rate */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Liều lượng', 'Application Rate')}</Label>
                    <Input type="number" value={form.applicationRate} onChange={(e) => setForm({ ...form, applicationRate: e.target.value })} placeholder="250" step="0.1" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Unit */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Đơn vị', 'Unit')}</Label>
                    <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn đơn vị', 'Select unit')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">{t('kg', 'kg')}</SelectItem>
                        <SelectItem value="g">{t('g', 'g')}</SelectItem>
                        <SelectItem value="liters">{t('Lít', 'Liters')}</SelectItem>
                        <SelectItem value="ml">{t('ml', 'ml')}</SelectItem>
                        <SelectItem value="bags">{t('Bao', 'Bags')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Total Quantity */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tổng số lượng', 'Total Quantity')}</Label>
                    <Input type="number" value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} placeholder="500" step="0.1" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Application Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('PP bón', 'Application Method')}</Label>
                    <Select value={form.applicationMethod} onValueChange={(v) => setForm({ ...form, applicationMethod: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn PP', 'Select method')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="broadcasting">{t('Rải', 'Broadcasting')}</SelectItem>
                        <SelectItem value="banding">{t('Băng', 'Banding')}</SelectItem>
                        <SelectItem value="foliar_spray">{t('Phun lá', 'Foliar Spray')}</SelectItem>
                        <SelectItem value="drip_fertigation">{t('Nhỏ giọt', 'Drip Fertigation')}</SelectItem>
                        <SelectItem value="basal">{t('Bón lót', 'Basal')}</SelectItem>
                        <SelectItem value="top_dressing">{t('Bón thúc', 'Top Dressing')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost Per Unit */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Đơn giá', 'Cost Per Unit')}</Label>
                    <Input type="number" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} placeholder="25000" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Total Cost */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Tổng chi phí', 'Total Cost')}</Label>
                    <Input type="number" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: e.target.value })} placeholder="12500000" className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Weather at Application */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Thời tiết khi bón', 'Weather at Application')}</Label>
                    <Select value={form.weatherAtApplication} onValueChange={(v) => setForm({ ...form, weatherAtApplication: v })}>
                      <SelectTrigger className="rounded-xl border-coffee-200">
                        <SelectValue placeholder={t('Chọn thời tiết', 'Select weather')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunny">{t('Nắng', 'Sunny')}</SelectItem>
                        <SelectItem value="cloudy">{t('Nhiều mây', 'Cloudy')}</SelectItem>
                        <SelectItem value="rainy">{t('Mưa', 'Rainy')}</SelectItem>
                        <SelectItem value="dry">{t('Khô', 'Dry')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Applied By */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-coffee-700">{t('Người bón', 'Applied By')}</Label>
                    <Input value={form.appliedBy} onChange={(e) => setForm({ ...form, appliedBy: e.target.value })} placeholder={t('Tên người thực hiện', 'Name of applicator')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>

                  {/* Organic + Certification */}
                  <div className="space-y-3 md:col-span-2 border-t border-coffee-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <Label className="text-xs font-semibold text-coffee-800">{t('Chứng nhận hữu cơ', 'Organic Certification')}</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isOrganic"
                          checked={form.isOrganic}
                          onCheckedChange={(v) => setForm({ ...form, isOrganic: !!v })}
                        />
                        <Label htmlFor="isOrganic" className="text-xs text-coffee-700">{t('Phân bón hữu cơ', 'Organic Fertilizer')}</Label>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-coffee-700">{t('Số chứng nhận', 'Certification Number')}</Label>
                        <Input
                          value={form.certificationNumber}
                          onChange={(e) => setForm({ ...form, certificationNumber: e.target.value })}
                          placeholder="CERT-2024-001"
                          className="rounded-xl border-coffee-200 focus:border-coffee-500"
                          disabled={!form.isOrganic}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs text-coffee-700">{t('Ghi chú', 'Notes')}</Label>
                    <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t('Ghi chú thêm', 'Additional notes')} className="rounded-xl border-coffee-200 focus:border-coffee-500" />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-coffee-100">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                    {t('Hủy', 'Cancel')}
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-white rounded-xl">
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('Đang lưu...', 'Saving...')}</>
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
              placeholder={t('Tìm kiếm phân bón...', 'Search fertilizer apps...')}
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
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Nông dân', 'Farmer')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Nông trại', 'Farm Land')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Ngày', 'Date')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Loại', 'Type')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Tên PB', 'Name')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Liều lượng', 'Rate')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden xl:table-cell">{t('SL', 'Quantity')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden xl:table-cell">{t('Tổng CP', 'Cost')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Hữu cơ', 'Organic')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Hành động', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-coffee-400 text-sm">
                        {t('Không tìm thấy dữ liệu', 'No data found')}
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => (
                      <tr key={item.id}
 className="border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-coffee-800">{item.farmer.fullName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{item.farmLand.farmName}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{item.applicationDate ? new Date(item.applicationDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{item.fertilizerType || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{item.fertilizerName || '-'}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">
                          {item.applicationRate ? `${item.applicationRate} ${item.unit || ''}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden xl:table-cell">
                          {item.totalQuantity ? `${item.totalQuantity} ${item.unit || ''}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden xl:table-cell">{item.totalCost ? formatCurrency(item.totalCost, 'VND') : '-'}</td>
                        <td className="px-4 py-3">
                          {item.isOrganic ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                              <Leaf className="w-3 h-3 mr-1" />
                              {t('Hữu cơ', 'Organic')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-coffee-200 text-coffee-400">{t('Không', 'No')}</Badge>
                          )}
                        </td>
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
