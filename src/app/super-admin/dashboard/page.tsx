'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, Building2, Package,
  Globe, LogOut, Loader2, Plus, Pencil,
  Check, X, ChevronRight, BarChart3,
  Activity, UserCog, FileText, Search,
  Eye, Power, ArrowRight, Clock,
  AlertTriangle, Leaf, TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface Tenant {
  id: string
  slug: string
  name: string
  legalName?: string | null
  taxId?: string | null
  currency: string
  currencySymbol: string
  language: string
  plan: string
  maxUsers: number
  maxFarmers: number
  isActive: boolean
  enabledModules: string
  createdAt: string
  _count?: { users: number; farmers: number; farmLands: number }
}

interface PlatformUser {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
}

interface AuditLog {
  id: string
  tenantId: string
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
  tenant?: { id: string; name: string; slug: string }
}

interface ModuleDef {
  id: string
  slug: string
  name: string
  description?: string | null
  category?: string | null
  version: string
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

const PLAN_COLORS: Record<string, string> = {
  starter: '#78716c',
  professional: '#0d9488',
  enterprise: '#7c3aed',
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-amber-100 text-amber-700',
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [modules, setModules] = useState<ModuleDef[]>([])
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Tenant dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)

  // Platform user dialog
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [userSubmitting, setUserSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null)

  // Audit log filters
  const [logFilter, setLogFilter] = useState({ action: '', entity: '', search: '' })

  // Tenant form
  const [form, setForm] = useState({
    name: '', slug: '', legalName: '', currency: 'VND', currencySymbol: '₫',
    language: 'vi', timezone: 'Asia/Ho_Chi_Minh', country: 'VN',
    plan: 'starter', maxUsers: 10, maxFarmers: 500,
    enabledModules: {} as Record<string, boolean>,
  })

  // Platform user form
  const [userForm, setUserForm] = useState({
    email: '', password: '', name: '', role: 'support' as 'super_admin' | 'support',
  })

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const resetForm = () => {
    setForm({
      name: '', slug: '', legalName: '', currency: 'VND', currencySymbol: '₫',
      language: 'vi', timezone: 'Asia/Ho_Chi_Minh', country: 'VN',
      plan: 'starter', maxUsers: 10, maxFarmers: 500,
      enabledModules: {},
    })
    setEditingTenant(null)
  }

  const resetUserForm = () => {
    setUserForm({ email: '', password: '', name: '', role: 'support' })
    setEditingUser(null)
  }

  const fetchData = useCallback(async () => {
    try {
      const [tenantsRes, modulesRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/modules'),
      ])
      const tenantsData = await tenantsRes.json()
      const modulesData = await modulesRes.json()
      if (tenantsData.success) setTenants(tenantsData.data.tenants || tenantsData.data || [])
      if (modulesData.success) setModules(modulesData.data || [])
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPlatformUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/platform-users')
      const data = await res.json()
      if (data.success) setPlatformUsers(data.data.users || data.data || [])
    } catch (err) {
      console.error('Failed to fetch platform users', err)
    }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (logFilter.action) params.set('action', logFilter.action)
      if (logFilter.entity) params.set('entity', logFilter.entity)
      const res = await fetch(`/api/audit-logs?${params.toString()}`)
      const data = await res.json()
      if (data.success) setAuditLogs(data.data.logs || data.data || [])
    } catch (err) {
      console.error('Failed to fetch audit logs', err)
    }
  }, [logFilter])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/super-admin')
    } else if (status === 'authenticated') {
      if (!session?.user?.isPlatformAdmin) {
        router.push('/login')
      } else {
        fetchData()
        fetchPlatformUsers()
        fetchAuditLogs()
      }
    }
  }, [status, router, session, fetchData, fetchPlatformUsers, fetchAuditLogs])

  // Refetch audit logs when filters change
  useEffect(() => {
    if (session?.user?.isPlatformAdmin) {
      fetchAuditLogs()
    }
  }, [logFilter, fetchAuditLogs, session?.user?.isPlatformAdmin])

  // ════════════════════════════════════════════════════════════════
  // TENANT HANDLERS
  // ════════════════════════════════════════════════════════════════

  const handleTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingTenant) {
        // Update tenant
        const res = await fetch('/api/tenants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: editingTenant.id,
            name: form.name || undefined,
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
          toast.success(t('Cập nhật tổ chức thành công!', 'Tenant updated!'))
          setDialogOpen(false)
          resetForm()
          fetchData()
        } else {
          toast.error(data.error || 'Error')
        }
      } else {
        // Create tenant
        const payload = { ...form }
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
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const openEditTenant = (tenant: Tenant) => {
    let enabledModules: Record<string, boolean> = {}
    try {
      enabledModules = typeof tenant.enabledModules === 'string'
        ? JSON.parse(tenant.enabledModules)
        : tenant.enabledModules || {}
    } catch {}
    setForm({
      name: tenant.name,
      slug: tenant.slug,
      legalName: tenant.legalName || '',
      currency: tenant.currency,
      currencySymbol: tenant.currencySymbol,
      language: tenant.language,
      timezone: 'Asia/Ho_Chi_Minh',
      country: 'VN',
      plan: tenant.plan,
      maxUsers: tenant.maxUsers,
      maxFarmers: tenant.maxFarmers,
      enabledModules,
    })
    setEditingTenant(tenant)
    setDialogOpen(true)
  }

  const toggleTenantActive = async (tenant: Tenant) => {
    try {
      const res = await fetch(`/api/tenants?id=${tenant.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(
          tenant.isActive
            ? t('Đã vô hiệu hóa tổ chức', 'Tenant deactivated')
            : t('Đã kích hoạt lại tổ chức', 'Tenant reactivated')
        )
        fetchData()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  // ════════════════════════════════════════════════════════════════
  // PLATFORM USER HANDLERS
  // ════════════════════════════════════════════════════════════════

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserSubmitting(true)
    try {
      if (editingUser) {
        const body: any = { userId: editingUser.id }
        if (userForm.name) body.name = userForm.name
        if (userForm.email) body.email = userForm.email
        if (userForm.password) body.password = userForm.password
        if (userForm.role) body.role = userForm.role

        const res = await fetch('/api/platform-users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(t('Cập nhật người dùng thành công!', 'User updated!'))
          setUserDialogOpen(false)
          resetUserForm()
          fetchPlatformUsers()
        } else {
          toast.error(data.error || 'Error')
        }
      } else {
        const res = await fetch('/api/platform-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(t('Tạo người dùng thành công!', 'User created!'))
          setUserDialogOpen(false)
          resetUserForm()
          fetchPlatformUsers()
        } else {
          toast.error(data.error || 'Error')
        }
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setUserSubmitting(false)
    }
  }

  const openEditUser = (user: PlatformUser) => {
    setUserForm({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role as 'super_admin' | 'support',
    })
    setEditingUser(user)
    setUserDialogOpen(true)
  }

  const toggleUserActive = async (user: PlatformUser) => {
    try {
      const res = await fetch(`/api/platform-users?id=${user.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(
          user.isActive
            ? t('Đã vô hiệu hóa người dùng', 'User deactivated')
            : t('Đã kích hoạt lại người dùng', 'User reactivated')
        )
        fetchPlatformUsers()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  // ════════════════════════════════════════════════════════════════
  // COMPUTED STATS & CHART DATA
  // ════════════════════════════════════════════════════════════════

  const activeTenants = tenants.filter(t => t.isActive)
  const totalFarmers = tenants.reduce((sum, t) => sum + (t._count?.farmers || 0), 0)
  const totalUsers = tenants.reduce((sum, t) => sum + (t._count?.users || 0), 0)

  const planDistribution = [
    { name: 'Starter', value: tenants.filter(t => t.plan === 'starter').length },
    { name: 'Professional', value: tenants.filter(t => t.plan === 'professional').length },
    { name: 'Enterprise', value: tenants.filter(t => t.plan === 'enterprise').length },
  ].filter(d => d.value > 0)

  const moduleUsage = MODULE_LIST.map(mod => {
    const count = tenants.filter(t => {
      try {
        const enabled = typeof t.enabledModules === 'string' ? JSON.parse(t.enabledModules) : t.enabledModules
        return enabled[mod] === true
      } catch { return false }
    }).length
    return { name: mod, tenants: count }
  }).filter(m => m.tenants > 0).sort((a, b) => b.tenants - a.tenants).slice(0, 10)

  const recentLogs = auditLogs.slice(0, 5)

  // ════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ════════════════════════════════════════════════════════════════

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

  if (!session?.user?.isPlatformAdmin) {
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

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100" style={{ fontFamily: '"Space Mono", monospace' }}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-stone-800/50">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-500 to-stone-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-100">Terra Brew {t('Quản trị', 'Admin')}</h1>
              <p className="text-[10px] text-stone-500">{t('Nền tảng quản trị', 'Platform Administration')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="gap-1 text-stone-400 hover:text-stone-200 text-xs">
              <Globe className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'EN' : 'VI'}
            </Button>
            <div className="flex items-center gap-2 mr-2">
              <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center">
                <span className="text-[10px] font-bold text-stone-300">{session.user.name?.[0] || 'A'}</span>
              </div>
              <span className="text-[10px] text-stone-400 hidden md:block">{session.user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/super-admin' })} className="text-stone-500 hover:text-red-400 text-xs">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-stone-900 border border-stone-800 rounded-xl p-1 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              {t('Tổng quan', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              {t('Tổ chức', 'Tenants')}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <UserCog className="w-3.5 h-3.5 mr-1.5" />
              {t('Quản trị viên', 'Admins')}
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {t('Nhật ký', 'Audit Log')}
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              Modules
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════
              OVERVIEW TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="overview">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { title: t('Tổng tổ chức', 'Total Tenants'), value: tenants.length, icon: Building2, color: 'from-stone-600 to-stone-800' },
                  { title: t('Hoạt động', 'Active'), value: activeTenants.length, icon: Check, color: 'from-emerald-600 to-emerald-800' },
                  { title: t('Tổng nông dân', 'Total Farmers'), value: totalFarmers, icon: Leaf, color: 'from-teal-600 to-teal-800' },
                  { title: t('Tổng người dùng', 'Total Users'), value: totalUsers, icon: Users, color: 'from-cyan-600 to-cyan-800' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                      <CardContent className="p-4">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-[10px] text-stone-500 mb-1">{stat.title}</p>
                        <p className="text-xl font-bold text-stone-100">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Plan Distribution Chart */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-stone-500" />
                      {t('Phân bố gói dịch vụ', 'Plan Distribution')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {planDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                            {planDistribution.map((entry, index) => (
                              <Cell key={index} fill={Object.values(PLAN_COLORS)[index % Object.values(PLAN_COLORS).length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '12px', fontFamily: '"Space Mono", monospace', fontSize: '10px' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', fontFamily: '"Space Mono", monospace' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-stone-600 text-xs">{t('Chưa có dữ liệu', 'No data yet')}</div>
                    )}
                  </CardContent>
                </Card>

                {/* Module Usage Chart */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                      <Package className="w-4 h-4 text-stone-500" />
                      {t('Sử dụng Modules', 'Module Usage')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {moduleUsage.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={moduleUsage} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
                          <XAxis type="number" tick={{ fill: '#a8a29e', fontSize: 9, fontFamily: '"Space Mono", monospace' }} />
                          <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#a8a29e', fontSize: 8, fontFamily: '"Space Mono", monospace' }} />
                          <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '12px', fontFamily: '"Space Mono", monospace', fontSize: '10px' }} />
                          <Bar dataKey="tenants" fill="#78716c" radius={[0, 4, 4, 0]} name={t('Tổ chức', 'Tenants')} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-stone-600 text-xs">{t('Chưa có dữ liệu', 'No data yet')}</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-stone-500" />
                    {t('Hoạt động gần đây', 'Recent Activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentLogs.length === 0 ? (
                    <div className="py-8 text-center text-stone-600 text-xs">{t('Chưa có hoạt động', 'No activity yet')}</div>
                  ) : (
                    <div className="space-y-2">
                      {recentLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-stone-800/30 hover:bg-stone-800/50 transition-colors">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${ACTION_COLORS[log.action] || 'bg-stone-700 text-stone-400'}`}>
                            <span className="text-[8px] font-bold">{log.action[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-stone-300 truncate">{log.details || `${log.action} ${log.entity}`}</p>
                            <p className="text-[9px] text-stone-600">{log.tenant?.name || '—'} · {new Date(log.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              TENANTS TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="tenants">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-stone-500" />
                  {t('Quản lý Tổ chức', 'Tenant Management')}
                </h2>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
                  <Button
                    className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl hover:from-stone-500 hover:to-stone-700"
                    onClick={() => { resetForm(); setDialogOpen(true) }}
                  >
                    <Plus className="w-4 h-4" />
                    {t('Tạo tổ chức', 'Create Tenant')}
                  </Button>
                  <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-900 border-stone-800 text-stone-100">
                    <DialogHeader>
                      <DialogTitle className="text-stone-100 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-stone-500" />
                        {editingTenant
                          ? t('Chỉnh sửa tổ chức', 'Edit Tenant')
                          : t('Tạo tổ chức mới', 'Create New Tenant')}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTenantSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <Label className="text-xs text-stone-400">{t('Tên tổ chức', 'Name')} *</Label>
                          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                        </div>
                        {!editingTenant && (
                          <div className="space-y-1.5">
                            <Label className="text-xs text-stone-400">Slug *</Label>
                            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-company" className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                          </div>
                        )}
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
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
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
                        <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl border-stone-700 text-stone-400 hover:text-stone-200">{t('Hủy', 'Cancel')}</Button>
                        <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-stone-600 to-stone-800 text-white rounded-xl hover:from-stone-500 hover:to-stone-700">
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTenant ? t('Cập nhật', 'Update') : t('Tạo mới', 'Create')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tenant List */}
              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-stone-800/30 border-b border-stone-800">
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Tổ chức', 'Tenant')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('Gói', 'Plan')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('Người dùng', 'Users')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t('Nông dân', 'Farmers')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t('Modules', 'Modules')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider text-right">{t('Hành động', 'Actions')}</th>
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
                            className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <td className="px-4 py-3">
                              <button
                                onClick={() => router.push(`/super-admin/dashboard/tenants/${tenant.id}`)}
                                className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                              >
                                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-stone-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-stone-200">{tenant.name}</p>
                                  <p className="text-[10px] text-stone-600">{tenant.slug}{tenant.legalName ? ` · ${tenant.legalName}` : ''}</p>
                                </div>
                              </button>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <Badge className={`text-[10px] border-0 ${
                                tenant.plan === 'enterprise' ? 'bg-purple-900/40 text-purple-300' :
                                tenant.plan === 'professional' ? 'bg-teal-900/40 text-teal-300' :
                                'bg-stone-800 text-stone-400'
                              }`}>{tenant.plan}</Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-stone-400 hidden md:table-cell">
                              {tenant._count?.users || 0}/{tenant.maxUsers}
                            </td>
                            <td className="px-4 py-3 text-xs text-stone-400 hidden lg:table-cell">
                              {tenant._count?.farmers || 0}/{tenant.maxFarmers}
                            </td>
                            <td className="px-4 py-3 text-xs text-stone-400 hidden lg:table-cell">{enabledCount}/{MODULE_LIST.length}</td>
                            <td className="px-4 py-3">
                              <Badge className={`${tenant.isActive ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'} text-[10px] border-0`}>
                                {tenant.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => router.push(`/super-admin/dashboard/tenants/${tenant.id}`)} className="text-stone-500 hover:text-stone-200 h-7 w-7 p-0">
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEditTenant(tenant)} className="text-stone-500 hover:text-stone-200 h-7 w-7 p-0">
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 ${tenant.isActive ? 'text-red-500/70 hover:text-red-400' : 'text-emerald-500/70 hover:text-emerald-400'}`}>
                                      <Power className="w-3.5 h-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-stone-900 border-stone-800 text-stone-100">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-stone-100 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        {tenant.isActive ? t('Vô hiệu hóa tổ chức?', 'Deactivate Tenant?') : t('Kích hoạt lại tổ chức?', 'Reactivate Tenant?')}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-stone-400">
                                        {tenant.isActive
                                          ? t(`Bạn có chắc muốn vô hiệu hóa "${tenant.name}"? Tất cả người dùng sẽ không thể truy cập.`, `Are you sure you want to deactivate "${tenant.name}"? All users will lose access.`)
                                          : t(`Bạn có chắc muốn kích hoạt lại "${tenant.name}"?`, `Are you sure you want to reactivate "${tenant.name}"?`)}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-stone-700 text-stone-400 hover:text-stone-200">{t('Hủy', 'Cancel')}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => toggleTenantActive(tenant)} className={tenant.isActive ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}>
                                        {tenant.isActive ? t('Vô hiệu hóa', 'Deactivate') : t('Kích hoạt lại', 'Reactivate')}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {tenants.length === 0 && (
                  <div className="py-12 text-center text-stone-600 text-xs">
                    {t('Chưa có tổ chức nào', 'No tenants yet')}
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              PLATFORM USERS TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="users">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-stone-500" />
                  {t('Quản lý Quản trị viên', 'Platform Admins')}
                </h2>
                <Dialog open={userDialogOpen} onOpenChange={(open) => { setUserDialogOpen(open); if (!open) resetUserForm() }}>
                  <Button
                    className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl hover:from-stone-500 hover:to-stone-700"
                    onClick={() => { resetUserForm(); setUserDialogOpen(true) }}
                  >
                    <Plus className="w-4 h-4" />
                    {t('Tạo quản trị viên', 'Create Admin')}
                  </Button>
                  <DialogContent className="max-w-md rounded-2xl bg-stone-900 border-stone-800 text-stone-100">
                    <DialogHeader>
                      <DialogTitle className="text-stone-100 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-stone-500" />
                        {editingUser
                          ? t('Chỉnh sửa quản trị viên', 'Edit Admin')
                          : t('Tạo quản trị viên mới', 'Create New Admin')}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">{t('Họ tên', 'Full Name')} *</Label>
                        <Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">Email *</Label>
                        <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">
                          {editingUser ? t('Mật khẩu mới (để trống nếu không đổi)', 'New Password (leave blank to keep)') : t('Mật khẩu', 'Password')} {!editingUser && '*'}
                        </Label>
                        <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" {...(editingUser ? {} : { required: true })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">{t('Vai trò', 'Role')}</Label>
                        <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v as 'super_admin' | 'support' })}>
                          <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-stone-800 border-stone-700">
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                        <Button type="button" variant="outline" onClick={() => { setUserDialogOpen(false); resetUserForm() }} className="rounded-xl border-stone-700 text-stone-400 hover:text-stone-200">{t('Hủy', 'Cancel')}</Button>
                        <Button type="submit" disabled={userSubmitting} className="bg-gradient-to-r from-stone-600 to-stone-800 text-white rounded-xl hover:from-stone-500 hover:to-stone-700">
                          {userSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingUser ? t('Cập nhật', 'Update') : t('Tạo mới', 'Create')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-stone-800/30 border-b border-stone-800">
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Quản trị viên', 'Admin')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('Vai trò', 'Role')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('Đăng nhập gần nhất', 'Last Login')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Trạng thái', 'Status')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider text-right">{t('Hành động', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platformUsers.map((pUser, i) => (
                        <motion.tr
                          key={pUser.id}
                          className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-stone-400">{pUser.name[0]}</span>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-stone-200">{pUser.name}</p>
                                <p className="text-[10px] text-stone-600">{pUser.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <Badge className={`text-[10px] border-0 ${
                              pUser.role === 'super_admin' ? 'bg-amber-900/40 text-amber-300' : 'bg-stone-800 text-stone-400'
                            }`}>{pUser.role === 'super_admin' ? 'Super Admin' : 'Support'}</Badge>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-stone-500 hidden md:table-cell">
                            {pUser.lastLoginAt ? new Date(pUser.lastLoginAt).toLocaleString() : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${pUser.isActive ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'} text-[10px] border-0`}>
                              {pUser.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditUser(pUser)} className="text-stone-500 hover:text-stone-200 h-7 w-7 p-0" disabled={pUser.id === session.user.id}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 ${pUser.isActive ? 'text-red-500/70 hover:text-red-400' : 'text-emerald-500/70 hover:text-emerald-400'}`} disabled={pUser.id === session.user.id}>
                                    <Power className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-stone-900 border-stone-800 text-stone-100">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-stone-100 flex items-center gap-2">
                                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                                      {pUser.isActive ? t('Vô hiệu hóa tài khoản?', 'Deactivate Account?') : t('Kích hoạt lại tài khoản?', 'Reactivate Account?')}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-stone-400">
                                      {pUser.isActive
                                        ? t(`${pUser.name} sẽ không thể đăng nhập.`, `${pUser.name} will not be able to sign in.`)
                                        : t(`${pUser.name} sẽ có thể đăng nhập lại.`, `${pUser.name} will be able to sign in again.`)}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-stone-700 text-stone-400 hover:text-stone-200">{t('Hủy', 'Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => toggleUserActive(pUser)} className={pUser.isActive ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}>
                                      {pUser.isActive ? t('Vô hiệu hóa', 'Deactivate') : t('Kích hoạt lại', 'Reactivate')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {platformUsers.length === 0 && (
                  <div className="py-12 text-center text-stone-600 text-xs">
                    {t('Chưa có quản trị viên nào', 'No platform admins yet')}
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              AUDIT LOG TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="audit">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-stone-500" />
                  {t('Nhật ký Hệ thống', 'Audit Log')}
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <Select value={logFilter.action || '_all'} onValueChange={(v) => setLogFilter({ ...logFilter, action: v === '_all' ? '' : v })}>
                  <SelectTrigger className="w-40 rounded-xl border-stone-700 bg-stone-800/50 text-stone-300 text-xs">
                    <SelectValue placeholder={t('Hành động', 'Action')} />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="_all">{t('Tất cả', 'All')}</SelectItem>
                    <SelectItem value="CREATE">CREATE</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="LOGIN">LOGIN</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={t('Tìm kiếm entity...', 'Search entity...')}
                  value={logFilter.entity}
                  onChange={(e) => setLogFilter({ ...logFilter, entity: e.target.value })}
                  className="w-48 rounded-xl border-stone-700 bg-stone-800/50 text-stone-300 text-xs"
                />
              </div>

              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-stone-800/30 border-b border-stone-800">
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Thời gian', 'Time')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Hành động', 'Action')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t('Entity', 'Entity')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t('Chi tiết', 'Details')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t('Tổ chức', 'Tenant')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t('IP', 'IP')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, i) => (
                        <motion.tr
                          key={log.id}
                          className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                        >
                          <td className="px-4 py-3 text-[10px] text-stone-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {new Date(log.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${ACTION_COLORS[log.action] || 'bg-stone-700 text-stone-400'} text-[10px] border-0`}>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-stone-400 hidden md:table-cell">{log.entity}</td>
                          <td className="px-4 py-3 text-[10px] text-stone-400 max-w-[200px] truncate">{log.details || '—'}</td>
                          <td className="px-4 py-3 text-[10px] text-stone-500 hidden lg:table-cell">{log.tenant?.name || '—'}</td>
                          <td className="px-4 py-3 text-[10px] text-stone-600 hidden lg:table-cell font-mono">{log.ipAddress || '—'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {auditLogs.length === 0 && (
                  <div className="py-12 text-center text-stone-600 text-xs">
                    {t('Chưa có nhật ký', 'No audit logs yet')}
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              MODULES TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="modules">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-stone-500" />
                {t('Thị trường Modules', 'Module Marketplace')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod, i: number) => (
                  <motion.div key={mod.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur hover:border-stone-700 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-stone-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-bold text-stone-200">{mod.name}</p>
                              <Badge className={`text-[8px] border-0 ${
                                mod.category === 'core' ? 'bg-emerald-900/40 text-emerald-300' :
                                mod.category === 'premium' ? 'bg-amber-900/40 text-amber-300' :
                                'bg-teal-900/40 text-teal-300'
                              }`}>{mod.category}</Badge>
                            </div>
                            <p className="text-[10px] text-stone-500">{mod.description}</p>
                            <p className="text-[10px] text-stone-600 mt-1">v{mod.version}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
