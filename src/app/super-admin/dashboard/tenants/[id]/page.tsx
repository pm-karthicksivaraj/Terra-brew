'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield, Users, Building2, Package, ArrowLeft,
  Loader2, Pencil, Power, Check, X, Activity,
  Leaf, MapPin, Clock, AlertTriangle, Eye,
  User, FileText, BarChart3, Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface TenantDetail {
  id: string
  slug: string
  name: string
  legalName?: string | null
  taxId?: string | null
  logoUrl?: string | null
  currency: string
  currencySymbol: string
  language: string
  timezone: string
  dateFormat: string
  enabledModules: string
  country: string
  eudrCompliant: boolean
  certifications?: string | null
  plan: string
  maxUsers: number
  maxFarmers: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
    farmers: number
    farmLands: number
    cultivations: number
    nurseries: number
    landPreparations: number
    cropMonitorings: number
    fertilizerApplications: number
    pestDiseaseManagements: number
    harvestTraceabilities: number
    collectionCentres: number
    procurementRecords: number
    processingJobOrders: number
    certAssessments: number
    coffeeInspections: number
    smartContracts: number
    marketplaceListings: number
    auditLogs: number
  }
  users?: Array<{
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    lastLoginAt?: string | null
    createdAt: string
  }>
  auditLogs?: Array<{
    id: string
    action: string
    entity: string
    entityId?: string | null
    details?: string | null
    ipAddress?: string | null
    createdAt: string
    userId?: string | null
  }>
}

const MODULE_LIST = [
  'farmers', 'farmlands', 'cultivations', 'nurseries', 'land-preparations',
  'crop-monitorings', 'fertilizer-apps', 'pest-disease-mgmts',
  'harvest-traceabilities', 'procurement', 'processing',
  'cert-assessments', 'coffee-inspections', 'smart-contracts', 'marketplace',
  'dashboard', 'reports', 'settings', 'users',
]

const MODULE_LABELS: Record<string, { vi: string; en: string }> = {
  'farmers': { vi: 'Nông dân', en: 'Farmers' },
  'farmlands': { vi: 'Đất nông nghiệp', en: 'Farmlands' },
  'cultivations': { vi: 'Canh tác', en: 'Cultivations' },
  'nurseries': { vi: 'Vườn ươm', en: 'Nurseries' },
  'land-preparations': { vi: 'Chuẩn bị đất', en: 'Land Preparations' },
  'crop-monitorings': { vi: 'Giám sát', en: 'Crop Monitorings' },
  'fertilizer-apps': { vi: 'Phân bón', en: 'Fertilizer Apps' },
  'pest-disease-mgmts': { vi: 'Sâu bệnh', en: 'Pest & Disease' },
  'harvest-traceabilities': { vi: 'Truy xuất thu hoạch', en: 'Harvest Trace' },
  'procurement': { vi: 'Thu mua', en: 'Procurement' },
  'processing': { vi: 'Chế biến', en: 'Processing' },
  'cert-assessments': { vi: 'Chứng nhận', en: 'Certifications' },
  'coffee-inspections': { vi: 'Kiểm tra cà phê', en: 'Inspections' },
  'smart-contracts': { vi: 'Hợp đồng', en: 'Smart Contracts' },
  'marketplace': { vi: 'Thị trường', en: 'Marketplace' },
  'dashboard': { vi: 'Bảng điều khiển', en: 'Dashboard' },
  'reports': { vi: 'Báo cáo', en: 'Reports' },
  'settings': { vi: 'Cài đặt', en: 'Settings' },
  'users': { vi: 'Người dùng', en: 'Users' },
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-900/40 text-green-300',
  UPDATE: 'bg-blue-900/40 text-blue-300',
  DELETE: 'bg-red-900/40 text-red-300',
  LOGIN: 'bg-amber-900/40 text-amber-300',
}

const ROLE_COLORS: Record<string, string> = {
  tenant_admin: 'bg-amber-900/40 text-amber-300',
  manager: 'bg-teal-900/40 text-teal-300',
  inspector: 'bg-blue-900/40 text-blue-300',
  field_officer: 'bg-green-900/40 text-green-300',
  farmer: 'bg-stone-700 text-stone-300',
  viewer: 'bg-stone-800 text-stone-400',
}

export default function TenantDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const tenantId = params.id as string
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const [form, setForm] = useState({
    name: '', legalName: '', currency: 'VND', language: 'vi',
    plan: 'starter', maxUsers: 10, maxFarmers: 500,
    enabledModules: {} as Record<string, boolean>,
  })

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const fetchTenant = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenants?id=${tenantId}`)
      const data = await res.json()
      if (data.success) {
        setTenant(data.data)
      } else {
        toast.error(data.error || 'Error')
        router.push('/super-admin/dashboard')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [tenantId, router, t])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/super-admin')
    } else if (status === 'authenticated') {
      if (!session?.user?.isPlatformAdmin) {
        router.push('/login')
      } else {
        fetchTenant()
      }
    }
  }, [status, router, session, fetchTenant])

  const openEditDialog = () => {
    if (!tenant) return
    let enabledModules: Record<string, boolean> = {}
    try {
      enabledModules = typeof tenant.enabledModules === 'string'
        ? JSON.parse(tenant.enabledModules)
        : tenant.enabledModules || {}
    } catch {}
    setForm({
      name: tenant.name,
      legalName: tenant.legalName || '',
      currency: tenant.currency,
      language: tenant.language,
      plan: tenant.plan,
      maxUsers: tenant.maxUsers,
      maxFarmers: tenant.maxFarmers,
      enabledModules,
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant!.id,
          name: form.name,
          legalName: form.legalName || undefined,
          currency: form.currency,
          language: form.language,
          plan: form.plan,
          maxUsers: form.maxUsers,
          maxFarmers: form.maxFarmers,
          enabledModules: form.enabledModules,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Cập nhật thành công!', 'Updated successfully!'))
        setEditDialogOpen(false)
        fetchTenant()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTenantActive = async () => {
    try {
      const res = await fetch(`/api/tenants?id=${tenant!.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(
          tenant!.isActive
            ? t('Đã vô hiệu hóa', 'Deactivated')
            : t('Đã kích hoạt lại', 'Reactivated')
        )
        fetchTenant()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  const handleModuleToggle = async (mod: string, enabled: boolean) => {
    if (!tenant) return
    try {
      let currentModules: Record<string, boolean> = {}
      try {
        currentModules = typeof tenant.enabledModules === 'string'
          ? JSON.parse(tenant.enabledModules)
          : tenant.enabledModules || {}
      } catch {}
      const newModules = { ...currentModules, [mod]: enabled }

      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id, enabledModules: newModules }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(enabled ? t('Đã bật module', 'Module enabled') : t('Đã tắt module', 'Module disabled'))
        fetchTenant()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  // Computed
  const enabledModules: Record<string, boolean> = (() => {
    try {
      return typeof tenant?.enabledModules === 'string'
        ? JSON.parse(tenant.enabledModules)
        : tenant?.enabledModules || {}
    } catch { return {} }
  })()

  const recordsPerModule = tenant?._count ? [
    { name: t('Nông dân', 'Farmers'), count: tenant._count.farmers || 0 },
    { name: t('Đất', 'Farmlands'), count: tenant._count.farmLands || 0 },
    { name: t('Canh tác', 'Cultivations'), count: tenant._count.cultivations || 0 },
    { name: t('Vườn ươm', 'Nurseries'), count: tenant._count.nurseries || 0 },
    { name: t('Thu hoạch', 'Harvests'), count: tenant._count.harvestTraceabilities || 0 },
    { name: t('Thu mua', 'Procurement'), count: tenant._count.procurementRecords || 0 },
    { name: t('Chế biến', 'Processing'), count: tenant._count.processingJobOrders || 0 },
    { name: t('Chứng nhận', 'Certs'), count: tenant._count.certAssessments || 0 },
  ].filter(d => d.count > 0) : []

  // Loading
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950" style={{ fontFamily: '"Space Mono", monospace' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
            <Shield className="w-9 h-9 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.isPlatformAdmin || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950" style={{ fontFamily: '"Space Mono", monospace' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
            <Shield className="w-9 h-9 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Đang tải...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-stone-800/50">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/super-admin/dashboard')} className="text-stone-400 hover:text-stone-200 gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline text-xs">{t('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-5 bg-stone-800" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-100">{tenant.name}</h1>
              <p className="text-[10px] text-stone-500">{tenant.slug} · {tenant.plan}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${tenant.isActive ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'} text-[10px] border-0`}>
              {tenant.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-1 text-stone-400 hover:text-stone-200 text-xs">
              <Globe className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-6">
          <Button onClick={openEditDialog} className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl hover:from-stone-500 hover:to-stone-700 text-xs">
            <Pencil className="w-3.5 h-3.5" />
            {t('Chỉnh sửa', 'Edit')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className={`gap-2 rounded-xl text-xs ${tenant.isActive ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/20'}`}>
                <Power className="w-3.5 h-3.5" />
                {tenant.isActive ? t('Vô hiệu hóa', 'Deactivate') : t('Kích hoạt lại', 'Reactivate')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-stone-900 border-stone-800 text-stone-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-stone-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  {tenant.isActive ? t('Vô hiệu hóa tổ chức?', 'Deactivate Tenant?') : t('Kích hoạt lại?', 'Reactivate?')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-stone-400">
                  {tenant.isActive
                    ? t('Tất cả người dùng sẽ không thể truy cập.', 'All users will lose access.')
                    : t('Người dùng sẽ có thể đăng nhập lại.', 'Users will be able to sign in again.')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-stone-700 text-stone-400 hover:text-stone-200">{t('Hủy', 'Cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={toggleTenantActive} className={tenant.isActive ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}>
                  {tenant.isActive ? t('Vô hiệu hóa', 'Deactivate') : t('Kích hoạt lại', 'Reactivate')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-stone-900 border border-stone-800 rounded-xl p-1 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              {t('Tổng quan', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {t('Người dùng', 'Users')}
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {t('Nhật ký', 'Audit Log')}
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════
              OVERVIEW TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="overview">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { title: t('Nông dân', 'Farmers'), value: tenant._count?.farmers || 0, max: tenant.maxFarmers, icon: Leaf, color: 'from-teal-600 to-teal-800' },
                  { title: t('Người dùng', 'Users'), value: tenant._count?.users || 0, max: tenant.maxUsers, icon: Users, color: 'from-cyan-600 to-cyan-800' },
                  { title: t('Đất nông nghiệp', 'Farmlands'), value: tenant._count?.farmLands || 0, icon: MapPin, color: 'from-emerald-600 to-emerald-800' },
                  { title: t('Nhật ký', 'Audit Logs'), value: tenant._count?.auditLogs || 0, icon: FileText, color: 'from-stone-600 to-stone-800' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                      <CardContent className="p-4">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-[10px] text-stone-500 mb-1">{stat.title}</p>
                        <p className="text-xl font-bold text-stone-100">{stat.value}</p>
                        {stat.max ? (
                          <div className="mt-2">
                            <Progress value={(stat.value / stat.max) * 100} className="h-1 bg-stone-800" />
                            <p className="text-[9px] text-stone-600 mt-1">{stat.value}/{stat.max}</p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Tenant Info */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-stone-500" />
                      {t('Thông tin tổ chức', 'Tenant Info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: t('Tên', 'Name'), value: tenant.name },
                        { label: 'Slug', value: tenant.slug },
                        { label: t('Tên pháp lý', 'Legal Name'), value: tenant.legalName || '—' },
                        { label: t('Mã số thuế', 'Tax ID'), value: tenant.taxId || '—' },
                        { label: t('Tiền tệ', 'Currency'), value: `${tenant.currency} (${tenant.currencySymbol})` },
                        { label: t('Ngôn ngữ', 'Language'), value: tenant.language.toUpperCase() },
                        { label: t('Múi giờ', 'Timezone'), value: tenant.timezone },
                        { label: t('Quốc gia', 'Country'), value: tenant.country },
                        { label: t('Gói', 'Plan'), value: tenant.plan },
                        { label: 'EUDR', value: tenant.eudrCompliant ? '✓' : '✗' },
                      ].map((item, i) => (
                        <div key={i} className="p-2 rounded-lg bg-stone-800/30">
                          <p className="text-[9px] text-stone-600">{item.label}</p>
                          <p className="text-[11px] text-stone-300 font-medium">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 rounded-lg bg-stone-800/30">
                      <p className="text-[9px] text-stone-600">{t('Ngày tạo', 'Created')}</p>
                      <p className="text-[11px] text-stone-300 font-medium">{new Date(tenant.createdAt).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Records per module chart */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-stone-500" />
                      {t('Bản ghi theo Module', 'Records per Module')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recordsPerModule.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={recordsPerModule}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
                          <XAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 8, fontFamily: '"Space Mono", monospace' }} />
                          <YAxis tick={{ fill: '#a8a29e', fontSize: 9, fontFamily: '"Space Mono", monospace' }} />
                          <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '12px', fontFamily: '"Space Mono", monospace', fontSize: '10px' }} />
                          <Bar dataKey="count" fill="#78716c" radius={[4, 4, 0, 0]} name={t('Số bản ghi', 'Records')} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-stone-600 text-xs">{t('Chưa có dữ liệu', 'No data yet')}</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Activity Timeline */}
              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-stone-500" />
                    {t('Hoạt động gần đây', 'Recent Activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tenant.auditLogs && tenant.auditLogs.length > 0 ? (
                    <div className="space-y-2">
                      {tenant.auditLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg bg-stone-800/30 hover:bg-stone-800/50 transition-colors">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${ACTION_COLORS[log.action] || 'bg-stone-700 text-stone-400'}`}>
                            <span className="text-[8px] font-bold">{log.action[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-stone-300">{log.details || `${log.action} ${log.entity}`}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-stone-600">{log.action} · {log.entity}</span>
                              <span className="text-[9px] text-stone-700">·</span>
                              <span className="text-[9px] text-stone-600">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-stone-600 text-xs">{t('Chưa có hoạt động', 'No activity yet')}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              MODULES TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="modules">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                    <Package className="w-4 h-4 text-stone-500" />
                    {t('Quản lý Modules', 'Module Management')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MODULE_LIST.map((mod) => {
                      const isEnabled = enabledModules[mod] === true
                      return (
                        <div
                          key={mod}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            isEnabled
                              ? 'border-stone-700 bg-stone-800/40'
                              : 'border-stone-800 bg-stone-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-stone-700' : 'bg-stone-800/50'}`}>
                              <Package className={`w-4 h-4 ${isEnabled ? 'text-stone-300' : 'text-stone-600'}`} />
                            </div>
                            <div>
                              <p className={`text-[11px] font-medium ${isEnabled ? 'text-stone-200' : 'text-stone-500'}`}>
                                {MODULE_LABELS[mod]?.[lang] || mod}
                              </p>
                              <p className="text-[9px] text-stone-600">{mod}</p>
                            </div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(v) => handleModuleToggle(mod, v)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              USERS TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="users">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-stone-500" />
                    {t('Người dùng trong tổ chức', 'Users in Tenant')} ({tenant._count?.users || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-stone-800/30 border-b border-stone-800">
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Người dùng', 'User')}</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('Vai trò', 'Role')}</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('Đăng nhập gần nhất', 'Last Login')}</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenant.users?.map((u, i) => (
                          <motion.tr
                            key={u.id}
                            className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
                                  <User className="w-3.5 h-3.5 text-stone-500" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-medium text-stone-200">{u.name}</p>
                                  <p className="text-[9px] text-stone-600">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 hidden md:table-cell">
                              <Badge className={`text-[9px] border-0 ${ROLE_COLORS[u.role] || 'bg-stone-800 text-stone-400'}`}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-[10px] text-stone-500 hidden md:table-cell">
                              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge className={`${u.isActive ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'} text-[9px] border-0`}>
                                {u.isActive ? t('HĐ', 'Active') : t('Tắt', 'Off')}
                              </Badge>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(!tenant.users || tenant.users.length === 0) && (
                    <div className="py-8 text-center text-stone-600 text-xs">{t('Chưa có người dùng', 'No users yet')}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              AUDIT LOG TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="audit">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-500" />
                    {t('Nhật ký hoạt động', 'Activity Log')} ({tenant._count?.auditLogs || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-stone-800/30 border-b border-stone-800">
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Thời gian', 'Time')}</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Hành động', 'Action')}</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Entity', 'Entity')}</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Chi tiết', 'Details')}</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t('IP', 'IP')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenant.auditLogs?.map((log, i) => (
                          <motion.tr
                            key={log.id}
                            className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                          >
                            <td className="px-4 py-2.5 text-[10px] text-stone-500 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge className={`${ACTION_COLORS[log.action] || 'bg-stone-700 text-stone-400'} text-[9px] border-0`}>
                                {log.action}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-[10px] text-stone-400">{log.entity}</td>
                            <td className="px-4 py-2.5 text-[10px] text-stone-400 max-w-[250px] truncate">{log.details || '—'}</td>
                            <td className="px-4 py-2.5 text-[10px] text-stone-600 hidden lg:table-cell font-mono">{log.ipAddress || '—'}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(!tenant.auditLogs || tenant.auditLogs.length === 0) && (
                    <div className="py-8 text-center text-stone-600 text-xs">{t('Chưa có nhật ký', 'No audit logs yet')}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ══════════════════════════════════════════════════════════
          EDIT DIALOG
          ══════════════════════════════════════════════════════════ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader>
            <DialogTitle className="text-stone-100 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-stone-500" />
              {t('Chỉnh sửa tổ chức', 'Edit Tenant')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs text-stone-400">{t('Tên tổ chức', 'Name')} *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t('Tên pháp lý', 'Legal Name')}</Label>
                <Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t('Gói', 'Plan')}</Label>
                <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                  <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t('Ngôn ngữ', 'Language')}</Label>
                <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                  <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t('Tiền tệ', 'Currency')}</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="VND">VND (₫)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t('Tối đa người dùng', 'Max Users')}</Label>
                <Input type="number" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: parseInt(e.target.value) || 10 })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-400">{t('Tối đa nông dân', 'Max Farmers')}</Label>
                <Input type="number" value={form.maxFarmers} onChange={(e) => setForm({ ...form, maxFarmers: parseInt(e.target.value) || 500 })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" />
              </div>
            </div>

            {/* Module toggles */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <Label className="text-xs font-bold text-stone-400">{t('Bật/Tắt Modules', 'Enable/Disable Modules')}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {MODULE_LIST.map(mod => (
                  <div key={mod} className="flex items-center gap-2 p-1 rounded-lg hover:bg-stone-800/30 transition-colors">
                    <Switch
                      checked={form.enabledModules[mod] || false}
                      onCheckedChange={(v) => setForm({ ...form, enabledModules: { ...form.enabledModules, [mod]: v } })}
                    />
                    <span className="text-[10px] text-stone-400">{MODULE_LABELS[mod]?.[lang] || mod}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-xl border-stone-700 text-stone-400 hover:text-stone-200">{t('Hủy', 'Cancel')}</Button>
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-stone-600 to-stone-800 text-white rounded-xl hover:from-stone-500 hover:to-stone-700">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Cập nhật', 'Update')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
