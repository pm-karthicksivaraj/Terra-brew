'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coffee, Users, Search, Plus, Pencil, Trash2, Eye, EyeOff,
  ChevronLeft, ChevronRight, Globe, LogOut, Loader2,
  X, Check, Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

interface Farmer {
  id: string
  farmerCode: string | null
  fullName: string
  contactNumber: string
  email?: string | null
  gender?: string | null
  age?: number | null
  province?: string | null
  district?: string | null
  commune?: string | null
  village?: string | null
  isCertified: boolean
  certificationType?: string | null
  cooperative?: string | null
  creditScore?: number | null
  yearsOfFarmingExperience?: number | null
  nationalIdNo?: string | null
  loanTaken: boolean
  loanAmount?: number | null
  smartphoneOwnership: boolean
  gapTrainingAttended: boolean
  isActive: boolean
  createdAt: string
}

export default function FarmersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    gender: 'Male',
    age: '',
    province: '',
    district: '',
    commune: '',
    village: '',
    isCertified: false,
    certificationType: '',
    cooperative: '',
    nationalIdNo: '',
    yearsOfFarmingExperience: '',
    creditScore: '',
    loanTaken: false,
    loanAmount: '',
    smartphoneOwnership: false,
    gapTrainingAttended: false,
    ekycConsent: false,
  })

  const resetForm = () => {
    setForm({
      fullName: '', contactNumber: '', email: '', gender: 'Male',
      age: '', province: '', district: '', commune: '', village: '',
      isCertified: false, certificationType: '', cooperative: '',
      nationalIdNo: '', yearsOfFarmingExperience: '', creditScore: '',
      loanTaken: false, loanAmount: '', smartphoneOwnership: false,
      gapTrainingAttended: false, ekycConsent: false,
    })
    setEditingFarmer(null)
  }

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      const res = await fetch(`/api/farmers?${params}`)
      const data = await res.json()
      if (data.success) {
        setFarmers(data.data.farmers)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error('Failed to fetch farmers', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchFarmers()
    }
  }, [status, router, fetchFarmers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age) : undefined,
        yearsOfFarmingExperience: form.yearsOfFarmingExperience ? parseInt(form.yearsOfFarmingExperience) : undefined,
        creditScore: form.creditScore ? parseFloat(form.creditScore) : undefined,
        loanAmount: form.loanAmount ? parseFloat(form.loanAmount) : undefined,
      }

      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Tạo nông dân thành công!', 'Farmer created!'))
        setDialogOpen(false)
        resetForm()
        fetchFarmers()
      } else {
        toast.error(data.error || t('Lỗi khi tạo nông dân', 'Error creating farmer'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (status === 'loading' || (loading && farmers.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coffee-50" style={{ fontFamily: '"Space Mono", monospace' }}>
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
    )
  }

  return (
    <div className="min-h-screen bg-coffee-50/50" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-coffee-200/50">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-coffee-900">Terra Brew</h1>
              <p className="text-[10px] text-coffee-500">{session?.user?.tenantName || 'Dashboard'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-1 text-coffee-500 hover:text-coffee-800 text-xs">
              <Globe className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-coffee-500 text-xs gap-1">
              <ChevronLeft className="w-4 h-4" />
              {t('Bảng điều khiển', 'Dashboard')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })} className="text-coffee-500 hover:text-red-600 text-xs">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-coffee-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-coffee-600" />
                {t('Quản lý Nông dân', 'Farmer Management')}
              </h2>
              <p className="text-sm text-coffee-500">{t(`Tổng số: ${total} nông dân`, `Total: ${total} farmers`)}</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
                  onClick={() => { resetForm(); setDialogOpen(true) }}
                >
                  <Plus className="w-4 h-4" />
                  {t('Thêm nông dân mới', 'Add New Farmer')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-coffee-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {editingFarmer ? t('Sửa thông tin nông dân', 'Edit Farmer') : t('Thêm nông dân mới', 'Add New Farmer')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FullName */}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs text-coffee-700">{t('Họ và tên', 'Full Name')} *</Label>
                      <Input
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder={t('Nhập họ và tên', 'Enter full name')}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                        required
                      />
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Số điện thoại', 'Contact Number')} *</Label>
                      <Input
                        value={form.contactNumber}
                        onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                        placeholder="0912345678"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@example.com"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Giới tính', 'Gender')}</Label>
                      <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                        <SelectTrigger className="rounded-xl border-coffee-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">{t('Nam', 'Male')}</SelectItem>
                          <SelectItem value="Female">{t('Nữ', 'Female')}</SelectItem>
                          <SelectItem value="Other">{t('Khác', 'Other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Tuổi', 'Age')}</Label>
                      <Input
                        type="number"
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        placeholder="35"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Province */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Tỉnh/Thành phố', 'Province')}</Label>
                      <Input
                        value={form.province}
                        onChange={(e) => setForm({ ...form, province: e.target.value })}
                        placeholder={t('Lâm Đồng', 'Lam Dong')}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* District */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Quận/Huyện', 'District')}</Label>
                      <Input
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        placeholder={t('Đà Lạt', 'Da Lat')}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Commune */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Xã/Phường', 'Commune')}</Label>
                      <Input
                        value={form.commune}
                        onChange={(e) => setForm({ ...form, commune: e.target.value })}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Village */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Thôn/Bản', 'Village')}</Label>
                      <Input
                        value={form.village}
                        onChange={(e) => setForm({ ...form, village: e.target.value })}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* National ID */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Số CMND/CCCD', 'National ID')}</Label>
                      <Input
                        value={form.nationalIdNo}
                        onChange={(e) => setForm({ ...form, nationalIdNo: e.target.value })}
                        placeholder="079201012345"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Years of Experience */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Kinh nghiệm (năm)', 'Experience (years)')}</Label>
                      <Input
                        type="number"
                        value={form.yearsOfFarmingExperience}
                        onChange={(e) => setForm({ ...form, yearsOfFarmingExperience: e.target.value })}
                        placeholder="10"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Credit Score */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Điểm tín dụng', 'Credit Score')}</Label>
                      <Input
                        type="number"
                        value={form.creditScore}
                        onChange={(e) => setForm({ ...form, creditScore: e.target.value })}
                        placeholder="80"
                        min="0" max="100"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Cooperative */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Hợp tác xã', 'Cooperative')}</Label>
                      <Input
                        value={form.cooperative}
                        onChange={(e) => setForm({ ...form, cooperative: e.target.value })}
                        placeholder={t('HTX Cà phê Metrang', 'Metrang Coffee Co-op')}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isCertified"
                        checked={form.isCertified}
                        onCheckedChange={(v) => setForm({ ...form, isCertified: !!v })}
                      />
                      <Label htmlFor="isCertified" className="text-xs text-coffee-700">{t('Đã chứng nhận', 'Certified')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="loanTaken"
                        checked={form.loanTaken}
                        onCheckedChange={(v) => setForm({ ...form, loanTaken: !!v })}
                      />
                      <Label htmlFor="loanTaken" className="text-xs text-coffee-700">{t('Có vay vốn', 'Has Loan')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="smartphone"
                        checked={form.smartphoneOwnership}
                        onCheckedChange={(v) => setForm({ ...form, smartphoneOwnership: !!v })}
                      />
                      <Label htmlFor="smartphone" className="text-xs text-coffee-700">{t('Có điện thoại', 'Has Smartphone')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="gapTraining"
                        checked={form.gapTrainingAttended}
                        onCheckedChange={(v) => setForm({ ...form, gapTrainingAttended: !!v })}
                      />
                      <Label htmlFor="gapTraining" className="text-xs text-coffee-700">{t('Đào tạo GAP', 'GAP Training')}</Label>
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
                        t('Tạo mới', 'Create')
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
                placeholder={t('Tìm kiếm nông dân...', 'Search farmers...')}
                className="pl-9 rounded-xl border-coffee-200 focus:border-coffee-500 bg-white"
              />
            </div>
            <Badge variant="outline" className="border-coffee-300 text-coffee-600 text-xs">
              {t(`${total} bản ghi`, `${total} records`)}
            </Badge>
          </div>

          {/* Farmers Table */}
          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-coffee-50 border-b border-coffee-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Mã', 'Code')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Họ và tên', 'Full Name')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Số ĐT', 'Contact')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Tỉnh', 'Province')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('CC', 'Cert')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Điểm TD', 'Credit')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {farmers.map((farmer, i) => (
                      <motion.tr
                        key={farmer.id}
                        className="border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td className="px-4 py-3 text-xs text-coffee-500 font-mono">{farmer.farmerCode || '-'}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-medium text-coffee-800">{farmer.fullName}</p>
                            <p className="text-[10px] text-coffee-400">{farmer.gender} {farmer.age ? `• ${farmer.age}` + t(' tuổi', ' yrs') : ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{farmer.contactNumber}</td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">
                          {farmer.province || '-'}
                          {farmer.district ? <span className="text-coffee-400"> • {farmer.district}</span> : null}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {farmer.isCertified ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px] border-0">{t('Đã CC', 'Certified')}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-coffee-200 text-coffee-400">{t('Chưa', 'No')}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">
                          {farmer.creditScore !== null && farmer.creditScore !== undefined ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-1.5 bg-coffee-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-coffee-500 to-coffee-700"
                                  style={{ width: `${farmer.creditScore}%` }}
                                />
                              </div>
                              <span className="text-[10px]">{farmer.creditScore}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${farmer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px] border-0`}>
                            {farmer.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="h-7 w-7 p-0 rounded-lg border-coffee-200"
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
                        className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-coffee-700 text-white' : 'border-coffee-200 text-coffee-600'}`}
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
                    className="h-7 w-7 p-0 rounded-lg border-coffee-200"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
