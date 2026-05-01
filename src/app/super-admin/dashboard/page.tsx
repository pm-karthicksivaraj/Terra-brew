'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
import { useI18n } from '@/i18n'
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

// ─── Multi-Region/Country/Currency Constants ───────────────────

const COUNTRIES = [
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND', symbol: '₫', language: 'vi', languageName: 'Tiếng Việt', timezone: 'Asia/Ho_Chi_Minh', region: 'Southeast Asia' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB', symbol: 'Br', language: 'am', languageName: 'አማርኛ', timezone: 'Africa/Addis_Ababa', region: 'Africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', symbol: 'KSh', language: 'sw', languageName: 'Swahili', timezone: 'Africa/Nairobi', region: 'Africa' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', symbol: 'R$', language: 'pt', languageName: 'Português', timezone: 'America/Sao_Paulo', region: 'South America' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', symbol: 'Rp', language: 'id', languageName: 'Bahasa Indonesia', timezone: 'Asia/Jakarta', region: 'Southeast Asia' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP', symbol: '$', language: 'es', languageName: 'Español', timezone: 'America/Bogota', region: 'South America' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX', symbol: 'USh', language: 'en', languageName: 'English', timezone: 'Africa/Kampala', region: 'Africa' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', currency: 'PGK', symbol: 'K', language: 'en', languageName: 'English', timezone: 'Pacific/Port_Moresby', region: 'Pacific' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹', language: 'hi', languageName: 'हिन्दी', timezone: 'Asia/Kolkata', region: 'South Asia' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', language: 'en', languageName: 'English', timezone: 'America/New_York', region: 'North America' },
] as const

const REGIONS = [...new Set(COUNTRIES.map(c => c.region))]

const ALL_CURRENCIES = [...new Map(COUNTRIES.map(c => [c.currency, { code: c.currency, symbol: c.symbol }])).values()]

const ALL_LANGUAGES = [...new Map(COUNTRIES.map(c => [c.language, { code: c.language, name: c.languageName }])).values()]

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t2, lang, setLang } = useI18n()
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
    language: 'vi', timezone: 'Asia/Ho_Chi_Minh', country: 'VN', region: 'Southeast Asia',
    plan: 'starter', maxUsers: 10, maxFarmers: 500, eudrCompliant: false,
    enabledModules: {} as Record<string, boolean>,
  })

  // Platform user form
  const [userForm, setUserForm] = useState({
    email: '', password: '', name: '', role: 'support' as 'super_admin' | 'support',
  })


  const resetForm = () => {
    setForm({
      name: '', slug: '', legalName: '', currency: 'VND', currencySymbol: '₫',
      language: 'vi', timezone: 'Asia/Ho_Chi_Minh', country: 'VN', region: 'Southeast Asia',
      plan: 'starter', maxUsers: 10, maxFarmers: 500, eudrCompliant: false,
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
          toast.success(t2('Cập nhật tổ chức thành công!', 'Tenant updated!'))
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
          toast.success(t2('Tạo tổ chức thành công!', 'Tenant created!'))
          setDialogOpen(false)
          resetForm()
          fetchData()
        } else {
          toast.error(data.error || 'Error')
        }
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
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
      region: 'Southeast Asia',
      plan: tenant.plan,
      maxUsers: tenant.maxUsers,
      maxFarmers: tenant.maxFarmers,
      eudrCompliant: false,
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
            ? t2('Đã vô hiệu hóa tổ chức', 'Tenant deactivated')
            : t2('Đã kích hoạt lại tổ chức', 'Tenant reactivated')
        )
        fetchData()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
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
          toast.success(t2('Cập nhật người dùng thành công!', 'User updated!'))
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
          toast.success(t2('Tạo người dùng thành công!', 'User created!'))
          setUserDialogOpen(false)
          resetUserForm()
          fetchPlatformUsers()
        } else {
          toast.error(data.error || 'Error')
        }
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
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
            ? t2('Đã vô hiệu hóa người dùng', 'User deactivated')
            : t2('Đã kích hoạt lại người dùng', 'User reactivated')
        )
        fetchPlatformUsers()
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
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
      <div className="min-h-screen flex items-center justify-center bg-stone-950" >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center">
            <Shield className="w-9 h-9 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.isPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950" >
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
    <div className="min-h-screen bg-stone-950 text-stone-100" >
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-stone-800/50">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-500 to-stone-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-100">Terra Brew {t2('Quản trị', 'Admin')}</h1>
              <p className="text-[10px] text-stone-500">{t2('Nền tảng quản trị', 'Platform Administration')}</p>
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
              {t2('Tổng quan', 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              {t2('Tổ chức', 'Tenants')}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <UserCog className="w-3.5 h-3.5 mr-1.5" />
              {t2('Quản trị viên', 'Admins')}
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {t2('Nhật ký', 'Audit Log')}
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-stone-700 data-[state=active]:text-stone-100 text-stone-400 rounded-lg text-xs px-4">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              {t2('Cài đặt', 'Settings')}
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════
              OVERVIEW TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="overview">
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { title: t2('Tổng tổ chức', 'Total Tenants'), value: tenants.length, icon: Building2, color: 'from-stone-600 to-stone-800' },
                  { title: t2('Hoạt động', 'Active'), value: activeTenants.length, icon: Check, color: 'from-emerald-600 to-emerald-800' },
                  { title: t2('Tổng nông dân', 'Total Farmers'), value: totalFarmers, icon: Leaf, color: 'from-teal-600 to-teal-800' },
                  { title: t2('Tổng người dùng', 'Total Users'), value: totalUsers, icon: Users, color: 'from-cyan-600 to-cyan-800' },
                ].map((stat, i) => (
                  <div key={i} >
                    <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                      <CardContent className="p-4">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-[10px] text-stone-500 mb-1">{stat.title}</p>
                        <p className="text-xl font-bold text-stone-100">{stat.value}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Plan Distribution Chart */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-stone-500" />
                      {t2('Phân bố gói dịch vụ', 'Plan Distribution')}
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
                          <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '12px', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '10px' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter, system-ui, sans-serif' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-stone-600 text-xs">{t2('Chưa có dữ liệu', 'No data yet')}</div>
                    )}
                  </CardContent>
                </Card>

                {/* Module Usage Chart */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                      <Package className="w-4 h-4 text-stone-500" />
                      {t2('Sử dụng Modules', 'Module Usage')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {moduleUsage.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={moduleUsage} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
                          <XAxis type="number" tick={{ fill: '#a8a29e', fontSize: 9, fontFamily: 'Inter, system-ui, sans-serif' }} />
                          <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#a8a29e', fontSize: 8, fontFamily: 'Inter, system-ui, sans-serif' }} />
                          <Tooltip contentStyle={{ background: '#1c1917', border: '1px solid #44403c', borderRadius: '12px', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '10px' }} />
                          <Bar dataKey="tenants" fill="#78716c" radius={[0, 4, 4, 0]} name={t2('Tổ chức', 'Tenants')} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-stone-600 text-xs">{t2('Chưa có dữ liệu', 'No data yet')}</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-stone-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-stone-500" />
                    {t2('Hoạt động gần đây', 'Recent Activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentLogs.length === 0 ? (
                    <div className="py-8 text-center text-stone-600 text-xs">{t2('Chưa có hoạt động', 'No activity yet')}</div>
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
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              TENANTS TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="tenants">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-stone-500" />
                  {t2('Quản lý Tổ chức', 'Tenant Management')}
                </h2>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
                  <Button
                    className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl hover:from-stone-500 hover:to-stone-700"
                    onClick={() => { resetForm(); setDialogOpen(true) }}
                  >
                    <Plus className="w-4 h-4" />
                    {t2('Tạo tổ chức', 'Create Tenant')}
                  </Button>
                  <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-900 border-stone-800 text-stone-100">
                    <DialogHeader>
                      <DialogTitle className="text-stone-100 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-stone-500" />
                        {editingTenant
                          ? t2('Chỉnh sửa tổ chức', 'Edit Tenant')
                          : t2('Tạo tổ chức mới', 'Create New Tenant')}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTenantSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <Label className="text-xs text-stone-400">{t2('Tên tổ chức', 'Name')} *</Label>
                          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                        </div>
                        {!editingTenant && (
                          <div className="space-y-1.5">
                            <Label className="text-xs text-stone-400">Slug *</Label>
                            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-company" className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Tên pháp lý', 'Legal Name')}</Label>
                          <Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Gói', 'Plan')}</Label>
                          <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                            <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-stone-800 border-stone-700">
                              <SelectItem value="starter">{t2('Khởi nghiệp', 'Starter')}</SelectItem>
                              <SelectItem value="professional">{t2('Chuyên nghiệp', 'Professional')}</SelectItem>
                              <SelectItem value="enterprise">{t2('Doanh nghiệp', 'Enterprise')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Quốc gia', 'Country')}</Label>
                          <Select value={form.country} onValueChange={(v) => {
                            const c = COUNTRIES.find(x => x.code === v)
                            if (c) setForm({ ...form, country: c.code, currency: c.currency, currencySymbol: c.symbol, language: c.language, timezone: c.timezone, region: c.region })
                          }}>
                            <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-stone-800 border-stone-700">
                              {COUNTRIES.map(c => (
                                <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Ngôn ngữ', 'Language')}</Label>
                          <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                            <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-stone-800 border-stone-700">
                              {ALL_LANGUAGES.map(l => (
                                <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Tiền tệ', 'Currency')}</Label>
                          <Select value={form.currency} onValueChange={(v) => {
                            const c = ALL_CURRENCIES.find(x => x.code === v)
                            setForm({ ...form, currency: v, currencySymbol: c?.symbol || '$' })
                          }}>
                            <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-stone-800 border-stone-700">
                              {ALL_CURRENCIES.map(c => (
                                <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Múi giờ', 'Timezone')}</Label>
                          <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Khu vực', 'Region')}</Label>
                          <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                            <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-stone-800 border-stone-700">
                              {REGIONS.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={form.eudrCompliant} onCheckedChange={(v) => setForm({ ...form, eudrCompliant: v })} />
                          <Label className="text-xs text-stone-400">EUDR {t2('Tuân thủ', 'Compliant')}</Label>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Tối đa người dùng', 'Max Users')}</Label>
                          <Input type="number" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: parseInt(e.target.value) || 10 })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-stone-400">{t2('Tối đa nông dân', 'Max Farmers')}</Label>
                          <Input type="number" value={form.maxFarmers} onChange={(e) => setForm({ ...form, maxFarmers: parseInt(e.target.value) || 500 })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" />
                        </div>
                      </div>

                      {/* Module toggles */}
                      <div className="space-y-2 pt-2 border-t border-stone-800">
                        <Label className="text-xs font-bold text-stone-400">{t2('Bật/Tắt Modules', 'Enable/Disable Modules')}</Label>
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
                        <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl border-stone-700 text-stone-400 hover:text-stone-200">{t2('Hủy', 'Cancel')}</Button>
                        <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-stone-600 to-stone-800 text-white rounded-xl hover:from-stone-500 hover:to-stone-700">
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTenant ? t2('Cập nhật', 'Update') : t2('Tạo mới', 'Create')}
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
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t2('Tổ chức', 'Tenant')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t2('Gói', 'Plan')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t2('Người dùng', 'Users')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t2('Nông dân', 'Farmers')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t2('Modules', 'Modules')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider text-right">{t2('Hành động', 'Actions')}</th>
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
                          <tr key={tenant.id}
 className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors">
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
                                {tenant.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
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
                                        {tenant.isActive ? t2('Vô hiệu hóa tổ chức?', 'Deactivate Tenant?') : t2('Kích hoạt lại tổ chức?', 'Reactivate Tenant?')}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-stone-400">
                                        {tenant.isActive
                                          ? t2(`Bạn có chắc muốn vô hiệu hóa "${tenant.name}"? Tất cả người dùng sẽ không thể truy cập.`, `Are you sure you want to deactivate "${tenant.name}"? All users will lose access.`)
                                          : t2(`Bạn có chắc muốn kích hoạt lại "${tenant.name}"?`, `Are you sure you want to reactivate "${tenant.name}"?`)}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-stone-700 text-stone-400 hover:text-stone-200">{t2('Hủy', 'Cancel')}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => toggleTenantActive(tenant)} className={tenant.isActive ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}>
                                        {tenant.isActive ? t2('Vô hiệu hóa', 'Deactivate') : t2('Kích hoạt lại', 'Reactivate')}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {tenants.length === 0 && (
                  <div className="py-12 text-center text-stone-600 text-xs">
                    {t2('Chưa có tổ chức nào', 'No tenants yet')}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              PLATFORM USERS TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="users">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-stone-500" />
                  {t2('Quản lý Quản trị viên', 'Platform Admins')}
                </h2>
                <Dialog open={userDialogOpen} onOpenChange={(open) => { setUserDialogOpen(open); if (!open) resetUserForm() }}>
                  <Button
                    className="bg-gradient-to-r from-stone-600 to-stone-800 text-white gap-2 rounded-xl hover:from-stone-500 hover:to-stone-700"
                    onClick={() => { resetUserForm(); setUserDialogOpen(true) }}
                  >
                    <Plus className="w-4 h-4" />
                    {t2('Tạo quản trị viên', 'Create Admin')}
                  </Button>
                  <DialogContent className="max-w-md rounded-2xl bg-stone-900 border-stone-800 text-stone-100">
                    <DialogHeader>
                      <DialogTitle className="text-stone-100 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-stone-500" />
                        {editingUser
                          ? t2('Chỉnh sửa quản trị viên', 'Edit Admin')
                          : t2('Tạo quản trị viên mới', 'Create New Admin')}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">{t2('Họ tên', 'Full Name')} *</Label>
                        <Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">Email *</Label>
                        <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">
                          {editingUser ? t2('Mật khẩu mới (để trống nếu không đổi)', 'New Password (leave blank to keep)') : t2('Mật khẩu', 'Password')} {!editingUser && '*'}
                        </Label>
                        <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 focus:border-stone-500" {...(editingUser ? {} : { required: true })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-stone-400">{t2('Vai trò', 'Role')}</Label>
                        <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v as 'super_admin' | 'support' })}>
                          <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-stone-800 border-stone-700">
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                        <Button type="button" variant="outline" onClick={() => { setUserDialogOpen(false); resetUserForm() }} className="rounded-xl border-stone-700 text-stone-400 hover:text-stone-200">{t2('Hủy', 'Cancel')}</Button>
                        <Button type="submit" disabled={userSubmitting} className="bg-gradient-to-r from-stone-600 to-stone-800 text-white rounded-xl hover:from-stone-500 hover:to-stone-700">
                          {userSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingUser ? t2('Cập nhật', 'Update') : t2('Tạo mới', 'Create')}
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
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t2('Quản trị viên', 'Admin')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t2('Vai trò', 'Role')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t2('Đăng nhập gần nhất', 'Last Login')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t2('Trạng thái', 'Status')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider text-right">{t2('Hành động', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platformUsers.map((pUser, i) => (
                        <tr key={pUser.id}
 className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors">
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
                              {pUser.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
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
                                      {pUser.isActive ? t2('Vô hiệu hóa tài khoản?', 'Deactivate Account?') : t2('Kích hoạt lại tài khoản?', 'Reactivate Account?')}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-stone-400">
                                      {pUser.isActive
                                        ? t2(`${pUser.name} sẽ không thể đăng nhập.`, `${pUser.name} will not be able to sign in.`)
                                        : t2(`${pUser.name} sẽ có thể đăng nhập lại.`, `${pUser.name} will be able to sign in again.`)}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-stone-700 text-stone-400 hover:text-stone-200">{t2('Hủy', 'Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => toggleUserActive(pUser)} className={pUser.isActive ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}>
                                      {pUser.isActive ? t2('Vô hiệu hóa', 'Deactivate') : t2('Kích hoạt lại', 'Reactivate')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {platformUsers.length === 0 && (
                  <div className="py-12 text-center text-stone-600 text-xs">
                    {t2('Chưa có quản trị viên nào', 'No platform admins yet')}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              AUDIT LOG TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="audit">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-stone-500" />
                  {t2('Nhật ký Hệ thống', 'Audit Log')}
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <Select value={logFilter.action || '_all'} onValueChange={(v) => setLogFilter({ ...logFilter, action: v === '_all' ? '' : v })}>
                  <SelectTrigger className="w-40 rounded-xl border-stone-700 bg-stone-800/50 text-stone-300 text-xs">
                    <SelectValue placeholder={t2('Hành động', 'Action')} />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    <SelectItem value="_all">{t2('Tất cả', 'All')}</SelectItem>
                    <SelectItem value="CREATE">{t2('Tạo', 'CREATE')}</SelectItem>
                    <SelectItem value="UPDATE">{t2('Cập nhật', 'UPDATE')}</SelectItem>
                    <SelectItem value="DELETE">{t2('Xóa', 'DELETE')}</SelectItem>
                    <SelectItem value="LOGIN">{t2('Đăng nhập', 'LOGIN')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={t2('Tìm kiếm entity...', 'Search entity...')}
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
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t2('Thời gian', 'Time')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t2('Hành động', 'Action')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">{t2('Entity', 'Entity')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider">{t2('Chi tiết', 'Details')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t2('Tổ chức', 'Tenant')}</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell">{t2('IP', 'IP')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, i) => (
                        <tr key={log.id}
 className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {auditLogs.length === 0 && (
                  <div className="py-12 text-center text-stone-600 text-xs">
                    {t2('Chưa có nhật ký', 'No audit logs yet')}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              MODULES TAB
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="modules">
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-stone-500" />
                {t2('Thị trường Modules', 'Module Marketplace')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod, i: number) => (
                  <div key={mod.id} >
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
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════
              SETTINGS TAB — Platform + Region Configuration
              ══════════════════════════════════════════════════════════ */}
          <TabsContent value="settings">
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-stone-500" />
                {t2('Cài đặt Nền tảng', 'Platform Settings')}
              </h2>

              {/* Region Overview */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">{t2('Tổng quan Khu vực', 'Region Overview')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {REGIONS.map(region => {
                    const regionTenants = tenants.filter(t => {
                      try { return JSON.parse(t.enabledModules || '{}').region === region || (t as any).region === region } catch { return false }
                    })
                    const regionCountries = COUNTRIES.filter(c => c.region === region)
                    return (
                      <Card key={region} className="rounded-2xl border border-stone-800 bg-stone-900/50 hover:border-stone-700 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-stone-500" />
                            <p className="text-xs font-bold text-stone-200">{region}</p>
                          </div>
                          <div className="flex gap-1 mb-2 flex-wrap">
                            {regionCountries.map(c => (
                              <span key={c.code} className="text-sm" title={c.name}>{c.flag}</span>
                            ))}
                          </div>
                          <p className="text-[10px] text-stone-500">
                            {regionTenants.length} {t2('tổ chức', 'tenants')}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Supported Countries Table */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">{t2('Quốc gia được hỗ trợ', 'Supported Countries')}</h3>
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-stone-800/30 border-b border-stone-800">
                          <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase">{t2('Quốc gia', 'Country')}</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase">{t2('Tiền tệ', 'Currency')}</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase">{t2('Ngôn ngữ', 'Language')}</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase">{t2('Múi giờ', 'Timezone')}</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-stone-500 uppercase">{t2('Khu vực', 'Region')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COUNTRIES.map(c => (
                          <tr key={c.code} className="border-b border-stone-800/50 hover:bg-stone-800/20 transition-colors">
                            <td className="px-4 py-3 text-xs text-stone-200">{c.flag} {c.name}</td>
                            <td className="px-4 py-3 text-xs text-stone-400">{c.currency} ({c.symbol})</td>
                            <td className="px-4 py-3 text-xs text-stone-400">{c.languageName}</td>
                            <td className="px-4 py-3 text-xs text-stone-400 font-mono">{c.timezone}</td>
                            <td className="px-4 py-3"><Badge className="text-[9px] border-0 bg-stone-800 text-stone-400">{c.region}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Platform Settings Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform Info */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300">{t2('Thông tin Nền tảng', 'Platform Info')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Tên nền tảng', 'Platform Name')}</Label>
                      <Input defaultValue="Terra Brew" className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Email hỗ trợ', 'Support Email')}</Label>
                      <Input defaultValue="support@terrabrew.platform" className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Ngôn ngữ mặc định', 'Default Language')}</Label>
                      <Select defaultValue="vi">
                        <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-stone-800 border-stone-700">
                          {ALL_LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Tiền tệ mặc định', 'Default Currency')}</Label>
                      <Select defaultValue="VND">
                        <SelectTrigger className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-stone-800 border-stone-700">
                          {ALL_CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.symbol})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* API Settings */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300">API {t2('Cài đặt', 'Settings')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Giới hạn API/phút', 'Rate Limit/min')}</Label>
                      <Input type="number" defaultValue={100} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Kích thước lô tối đa', 'Max Batch Size')}</Label>
                      <Input type="number" defaultValue={50} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('URL Webhook', 'Webhook URL')}</Label>
                      <Input placeholder="https://..." className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300">{t2('Bảo mật', 'Security')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Thời gian phiên (giây)', 'Session Timeout (s)')}</Label>
                      <Input type="number" defaultValue={86400} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Lần đăng nhập sai tối đa', 'Max Login Attempts')}</Label>
                      <Input type="number" defaultValue={5} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Độ dài mật khẩu tối thiểu', 'Min Password Length')}</Label>
                      <Input type="number" defaultValue={8} className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card className="rounded-2xl border border-stone-800 bg-stone-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-stone-300">{t2('Giao diện', 'Theme')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Màu chính', 'Primary Color')}</Label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue="#8b5a1e" className="w-8 h-8 rounded-lg border border-stone-700 cursor-pointer" />
                        <Input defaultValue="#8b5a1e" className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs flex-1" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Logo URL', 'Logo URL')}</Label>
                      <Input defaultValue="/logo.svg" className="rounded-xl border-stone-700 bg-stone-800/50 text-stone-100 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-stone-500">{t2('Email thông báo', 'Email Notifications')}</Label>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked />
                        <span className="text-[10px] text-stone-400">{t2('Bật', 'Enabled')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
