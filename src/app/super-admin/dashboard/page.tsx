'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Coffee, Shield, Users, Building2, Package, Settings,
  Globe, LogOut, Loader2, Plus, Pencil, Trash2,
  Check, X, ChevronRight, BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

interface Tenant {
  id: string
  slug: string
  name: string
  legalName?: string | null
  currency: string
  language: string
  plan: string
  maxUsers: number
  maxFarmers: number
  isActive: boolean
  enabledModules: string
  createdAt: string
}

const MODULE_LIST = [
  'farmers', 'farmlands', 'cultivations', 'nurseries', 'land-preparations',
  'crop-monitorings', 'fertilizer-apps', 'pest-disease-mgmts',
  'harvest-traceabilities', 'procurement', 'processing',
  'cert-assessments', 'coffee-inspections', 'smart-contracts', 'marketplace',
  'dashboard', 'reports', 'settings', 'users',
]

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const [form, setForm] = useState({
    name: '', slug: '', legalName: '', currency: 'VND', currencySymbol: '₫',
    language: 'vi', timezone: 'Asia/Ho_Chi_Minh', country: 'VN',
    plan: 'starter', maxUsers: 10, maxFarmers: 500,
    enabledModules: {} as Record<string, boolean>,
  })

  const resetForm = () => {
    setForm({
      name: '', slug: '', legalName: '', currency: 'VND', currencySymbol: '₫',
      language: 'vi', timezone: 'Asia/Ho_Chi_Minh', country: 'VN',
      plan: 'starter', maxUsers: 10, maxFarmers: 500,
      enabledModules: {},
    })
    setEditingTenant(null)
  }

  const fetchData = useCallback(async () => {
    try {
      const [tenantsRes, modulesRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/modules'),
      ])
      const tenantsData = await tenantsRes.json()
      const modulesData = await modulesRes.json()
      if (tenantsData.success) setTenants(tenantsData.data.tenants || [])
      if (modulesData.success) setModules(modulesData.data || [])
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/super-admin')
    } else if (status === 'authenticated') {
      if (!session?.user?.isPlatformAdmin) {
        router.push('/login')
      } else {
        fetchData()
      }
    }
  }, [status, router, session, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...form, enabledModules: form.enabledModules }
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Tạo tổ chức thành công!', 'Tenant created!'))
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50" style={{ fontFamily: '"Space Mono", monospace' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
            <Shield className="w-9 h-9 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-stone-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.isPlatformAdmin) return null

  const platformStats = [
    { title: t('Tổng tổ chức', 'Total Tenants'), value: tenants.length, icon: Building2, color: 'from-stone-600 to-stone-800' },
    { title: t('Hoạt động', 'Active'), value: tenants.filter(t => t.isActive).length, icon: Check, color: 'from-green-600 to-green-800' },
    { title: t('Modules', 'Modules'), value: modules.length, icon: Package, color: 'from-coffee-600 to-coffee-800' },
    { title: t('Doanh nghiệp', 'Enterprise'), value: tenants.filter(t => t.plan === 'enterprise').length, icon: BarChart3, color: 'from-purple-600 to-purple-800' },
  ]

  return (
    <div className="min-h-screen bg-stone-50/50" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200/50">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-800">Terra Brew {t('Quản trị', 'Admin')}</h1>
              <p className="text-[10px] text-stone-500">{t('Nền tảng quản trị', 'Platform Administration')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-1 text-stone-500 text-xs">
              <Globe className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/super-admin' })} className="text-stone-500 hover:text-red-600 text-xs">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {platformStats.map((stat, i) => (
              <Card key={i} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[10px] text-stone-500 mb-1">{stat.title}</p>
                  <p className="text-xl font-bold text-stone-800">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tenant Management */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-stone-600" />
              {t('Quản lý Tổ chức', 'Tenant Management')}
            </h2>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl"
                  onClick={() => { resetForm(); setDialogOpen(true) }}
                >
                  <Plus className="w-4 h-4" />
                  {t('Tạo tổ chức', 'Create Tenant')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-stone-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {t('Tạo tổ chức mới', 'Create New Tenant')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-xs text-stone-700">{t('Tên tổ chức', 'Name')} *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-stone-200" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-stone-700">Slug *</Label>
                      <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-company" className="rounded-xl border-stone-200" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-stone-700">{t('Gói', 'Plan')}</Label>
                      <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                        <SelectTrigger className="rounded-xl border-stone-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-stone-700">{t('Ngôn ngữ', 'Language')}</Label>
                      <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                        <SelectTrigger className="rounded-xl border-stone-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-stone-700">{t('Tiền tệ', 'Currency')}</Label>
                      <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                        <SelectTrigger className="rounded-xl border-stone-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VND">VND (₫)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-stone-700">{t('Tối đa người dùng', 'Max Users')}</Label>
                      <Input type="number" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: parseInt(e.target.value) || 10 })} className="rounded-xl border-stone-200" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-stone-700">{t('Tối đa nông dân', 'Max Farmers')}</Label>
                      <Input type="number" value={form.maxFarmers} onChange={(e) => setForm({ ...form, maxFarmers: parseInt(e.target.value) || 500 })} className="rounded-xl border-stone-200" />
                    </div>
                  </div>

                  {/* Module toggles */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <Label className="text-xs font-bold text-stone-700">{t('Bật/Tắt Modules', 'Enable/Disable Modules')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULE_LIST.map(mod => (
                        <div key={mod} className="flex items-center gap-2">
                          <Switch
                            checked={form.enabledModules[mod] || false}
                            onCheckedChange={(v) => setForm({ ...form, enabledModules: { ...form.enabledModules, [mod]: v } })}
                          />
                          <span className="text-[10px] text-stone-600">{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">{t('Hủy', 'Cancel')}</Button>
                    <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-stone-600 to-stone-800 text-white rounded-xl">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Tạo mới', 'Create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tenant List */}
          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider">{t('Tổ chức', 'Tenant')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider hidden md:table-cell">{t('Gói', 'Plan')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider hidden md:table-cell">{t('Ngôn ngữ', 'Lang')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider hidden lg:table-cell">{t('Modules', 'Modules')}</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant, i) => {
                    let enabledCount = 0
                    try {
                      const modObj = typeof tenant.enabledModules === 'string' ? JSON.parse(tenant.enabledModules) : tenant.enabledModules
                      enabledCount = Object.values(modObj).filter(Boolean).length
                    } catch {}
                    return (
                      <motion.tr
                        key={tenant.id}
                        className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-medium text-stone-800">{tenant.name}</p>
                            {tenant.legalName && <p className="text-[10px] text-stone-400">{tenant.legalName}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-500 font-mono">{tenant.slug}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge className={`text-[10px] border-0 ${
                            tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                            tenant.plan === 'professional' ? 'bg-blue-100 text-blue-700' :
                            'bg-stone-100 text-stone-600'
                          }`}>{tenant.plan}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-500 hidden md:table-cell">{tenant.language.toUpperCase()}</td>
                        <td className="px-4 py-3 text-xs text-stone-500 hidden lg:table-cell">{enabledCount}/{MODULE_LIST.length}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px] border-0`}>
                            {tenant.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
                          </Badge>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Module Marketplace */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-stone-600" />
              {t('Thị trường Modules', 'Module Marketplace')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod: any, i: number) => (
                <motion.div key={mod.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="rounded-2xl border border-stone-200/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-stone-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-stone-800">{mod.name}</p>
                            <Badge className={`text-[8px] border-0 ${
                              mod.category === 'core' ? 'bg-green-100 text-green-700' :
                              mod.category === 'premium' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{mod.category}</Badge>
                          </div>
                          <p className="text-[10px] text-stone-500">{mod.description}</p>
                          <p className="text-[10px] text-stone-400 mt-1">v{mod.version}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
