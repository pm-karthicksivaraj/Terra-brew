'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/lib/store'
import { getModules, login, register, getDashboardStats, seedData, getQRCode } from '@/lib/api'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  AnimatedPage, FadeIn, StaggerContainer, StaggerItem, AnimatedCard, CounterAnimation, ShimmerText, ScaleIn, PulseDot,
} from '@/components/ui/animations'
import { motion } from 'framer-motion'
import {
  Leaf, Coffee, Bean, Droplets, TreePine, Apple, Carrot,
  Wheat, Flower2, Fish, Mountain, Waves, Trees,
  ArrowRight, Plus, Search, Eye, Pencil, Trash2, BarChart3,
  Download, ChevronRight, Shield, Award, MapPin, Sprout, Users,
  QrCode, Package, CheckCircle2, XCircle, AlertTriangle, Loader2,
  TrendingUp, TrendingDown, Calendar, Clock, ClipboardCheck, Store, Truck, Tractor, Route, FileText, Factory,
  Sparkles, Filter, Cog, Flame, Sun, DollarSign, Scale, Activity, Zap, Target, Gem, Banknote, CircleDot,
  EyeOff, Phone, Mail, User, HomeIcon, Landmark, Heart, GraduationCap, Globe, BadgeCheck, BanknoteIcon, Fingerprint, CreditCard, Lock, Share2,
  FlaskConical, Hash, GripVertical
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, ComposedChart
} from 'recharts'
import {
  NurseriesView, NurseryFormView,
  LandPreparationsView, LandPrepFormView,
  CropMonitoringsView, CropMonitoringFormView,
  FertilizerAppsView, FertilizerAppFormView,
  PestDiseaseMgmtsView, PestDiseaseMgmtFormView,
  HarvestTraceabilitiesView, HarvestTraceFormView,
  SmartContractsView, SmartContractFormView,
  MarketplaceView, MarketplaceFormView,
  CoffeeInspectionsView, CoffeeInspectionFormView,
  QRScanView, TraceJourneyView, QRLabelView,
  ProcurementView, ProcurementFormView,
  AdminReportsView,
  CertAssessmentsView, CertAssessmentFormView,
  CollectionCentresView, CollectionCentreFormView,
  ProcurementRecordsView, ProcurementRecordFormView,
  ProcurementTransportsView, ProcurementTransportFormView,
} from '../modules'
import {
  CleaningListView, CleaningFormView,
  DepulpingListView, DepulpingFormView,
  DryingListView, DryingFormView,
  GradingListView, GradingFormView,
  RoastingListView, RoastingFormView,
  GrindingListView, GrindingFormView,
  QcSummaryListView, QcSummaryFormView,
} from '../processing-stages'
import dynamic from 'next/dynamic'

// Load Leaflet map components dynamically (client-only) to avoid SSR issues
const PolygonDisplayMapDynamic = dynamic(
  () => import('../PolygonDisplayMap').then(mod => mod.PolygonDisplayMap),
  { ssr: false, loading: () => <div className="h-[400px] rounded-xl bg-gray-100 flex items-center justify-center text-muted-foreground text-sm">Loading map...</div> }
)
const PolygonMapDynamic = dynamic(
  () => import('../PolygonMap').then(mod => mod.PolygonMap),
  { ssr: false, loading: () => <div className="h-[400px] rounded-xl bg-gray-100 flex items-center justify-center text-muted-foreground text-sm">Loading map...</div> }
)

const MODULES_CONFIG = [
  { slug: 'metrang-coffee', name: 'Terra Brew', desc: 'Coffee Traceability & Quality', icon: Coffee, color: 'from-amber-800 to-amber-950', accent: 'bg-amber-700' },
]

const CHART_COLORS = ['#059669', '#d97706', '#dc2626', '#2563eb', '#7c3aed', '#db2777', '#0891b2']

// ======== MODULE SELECT VIEW (Coffee-Only Landing) ========
function ModuleSelectView() {
  const { setSelectedModule, setCurrentView, setLoading, loading } = useAppStore()
  const { toast } = useToast()
  const t = useTranslations()

  const handleEnter = useCallback(async () => {
    setLoading(true)
    try {
      const modules = await getModules()
      const dbModule = modules.find((m: any) => m.slug === 'metrang-coffee')
      if (dbModule) {
        setSelectedModule(dbModule)
        setCurrentView('login')
      } else {
        toast({ title: t('errors.moduleNotFound'), variant: 'destructive' })
      }
    } catch {
      toast({ title: t('errors.loadingModules'), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [setSelectedModule, setCurrentView, setLoading, toast])

  return (
    <AnimatedPage viewKey="module-select">
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 flex flex-col relative overflow-hidden">
        {/* Floating decorative circles */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-amber-600/8 blur-3xl pointer-events-none"
          animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none"
          animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-10 right-1/4 w-48 h-48 rounded-full bg-orange-400/10 blur-2xl pointer-events-none"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-3xl w-full text-center">
            {/* Logo with glow ring */}
            <ScaleIn delay={0}>
              <div className="relative mx-auto mb-8">
                <div className="absolute inset-0 h-24 w-24 mx-auto rounded-3xl bg-amber-400/20 animate-pulse" />
                <div className="relative mx-auto h-24 w-24 bg-gradient-to-br from-amber-600 to-amber-900 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Coffee className="h-12 w-12 text-white" />
                </div>
              </div>
            </ScaleIn>

            {/* Title with shimmer */}
            <FadeIn delay={0.2}>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
                <ShimmerText className="text-white">{t('app.name')}</ShimmerText>
              </h1>
            </FadeIn>

            {/* Subtitle */}
            <FadeIn delay={0.4}>
              <p className="text-amber-200 text-xl md:text-2xl mb-10 font-light">{t('app.subtitle')}</p>
            </FadeIn>

            {/* Enter button with motion hover */}
            <ScaleIn delay={0.6}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-12 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all h-auto"
                  onClick={handleEnter}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {t('app.enterPlatform')}
                </Button>
              </motion.div>
            </ScaleIn>

            {/* Feature highlights */}
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              {[
                { icon: Sprout, title: t('features.farmManagement.title'), desc: t('features.farmManagement.description') },
                { icon: Factory, title: t('features.processingPipeline.title'), desc: t('features.processingPipeline.description') },
                { icon: Store, title: t('features.marketplace.title'), desc: t('features.marketplace.description') },
              ].map(f => (
                <StaggerItem key={f.title}>
                  <AnimatedCard className="text-center bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 cursor-default">
                    <div className="mx-auto h-12 w-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 border border-amber-700/30">
                      <f.icon className="h-6 w-6 text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                    <p className="text-amber-200/70 text-xs mt-1">{f.desc}</p>
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </main>
        <footer className="p-4 text-center text-amber-400/60 text-xs relative z-10">
          {t('app.footer')}
        </footer>
      </div>
    </AnimatedPage>
  )
}

// ======== LOGIN VIEW ========
function LoginView() {
  const { selectedModule, setCurrentView, setCurrentUser } = useAppStore()
  const { toast } = useToast()
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-create admin user & pre-fill credentials when login page mounts
  useEffect(() => {
    if (!selectedModule) return
    fetch('/api/auth/ensure-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId: selectedModule.id }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.email) {
          setEmail(data.email)
          setPassword(data.password)
        }
      })
      .catch(() => {})
  }, [selectedModule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login({ email, password, moduleId: selectedModule!.id })
      setCurrentUser(user)
      setCurrentView('dashboard')
      toast({ title: `Welcome back, ${user.name}!` })
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setLoading(true)
    try {
      const res = await seedData(selectedModule!.id)
      toast({ title: res.message || 'Seed data created!', description: res.loginHint || '' })
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleFullFlowSeed = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/seed-full-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: selectedModule!.id }),
      }).then(r => r.json())
      if (res.batchId) {
        toast({ 
          title: 'Full Pipeline Seeded!', 
          description: `Batch: ${res.batchId.slice(0, 20)}... | ${res.pipeline?.farmer} → ${res.pipeline?.finalProduct}`,
          duration: 8000,
        })
      } else {
        toast({ title: res.message || 'Seed complete', description: res.loginHint || '' })
      }
    } catch (err: any) {
      toast({ title: err.message || 'Seed failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedPage viewKey="login">
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background orbs */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-emerald-600/8 blur-3xl pointer-events-none"
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-40 h-40 rounded-full bg-teal-400/10 blur-2xl pointer-events-none"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        <Card className="w-full max-w-md border border-white/20 shadow-2xl bg-white/10 backdrop-blur-xl relative z-10">
          <CardHeader className="text-center pb-2">
            <ScaleIn delay={0.1}>
              <div className="mx-auto h-14 w-14 bg-gradient-to-br from-amber-700 to-amber-950 rounded-2xl flex items-center justify-center mb-3">
                <Coffee className="h-7 w-7 text-white" />
              </div>
            </ScaleIn>
            <FadeIn delay={0.2}>
              <CardTitle className="text-2xl text-white">{selectedModule?.name}</CardTitle>
              <CardDescription className="text-emerald-200/70">{t('login.subtitle')}</CardDescription>
            </FadeIn>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FadeIn delay={0.3}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">{t('login.email')}</Label>
                  <Input id="email" type="email" placeholder={t('login.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                </div>
              </FadeIn>
              <FadeIn delay={0.4}>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">{t('login.password')}</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                </div>
              </FadeIn>
              <FadeIn delay={0.5}>
                <motion.button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white rounded-md h-10 font-medium transition-colors disabled:opacity-50"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
                  {t('login.signIn')}
                </motion.button>
              </FadeIn>
              <FadeIn delay={0.6}>
                <div className="text-center space-y-2">
                  <p className="text-sm text-emerald-200/60">
                    {t('login.dontHaveAccount')}{' '}
                    <button type="button" onClick={() => setCurrentView('register')} className="text-emerald-300 font-medium hover:underline">{t('login.register')}</button>
                  </p>
                  {email && (
                    <motion.p
                      className="text-xs text-emerald-300 bg-emerald-400/15 backdrop-blur rounded-lg px-3 py-2 border border-emerald-400/20"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {t('login.prefilledMessage')}
                    </motion.p>
                  )}
                </div>
              </FadeIn>
            </form>
            <Separator className="my-4 bg-white/10" />
            <FadeIn delay={0.7}>
              <div className="space-y-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white" onClick={handleFullFlowSeed} disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('login.loadFullPipeline')}
                  </Button>
                </motion.div>
                <p className="text-xs text-center text-emerald-200/50">{t('login.loadFullPipelineDescription')}</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={handleSeed} disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    Load Sample Data (Basic)
                  </Button>
                </motion.div>
              </div>
            </FadeIn>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}

// ======== REGISTER VIEW ========
function RegisterView() {
  const { selectedModule, setCurrentView, setCurrentUser } = useAppStore()
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'farmer' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await register({ ...form, moduleId: selectedModule!.id })
      setCurrentUser(user)
      setCurrentView('dashboard')
      toast({ title: `Welcome, ${user.name}! Account created.` })
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const registerFields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
  ]

  return (
    <AnimatedPage viewKey="register">
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background orbs */}
        <motion.div
          className="absolute top-24 left-16 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"
          animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-16 right-16 w-64 h-64 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none"
          animate={{ y: [0, 25, 0], x: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <Card className="w-full max-w-md border border-white/20 shadow-2xl bg-white/10 backdrop-blur-xl relative z-10">
          <CardHeader className="text-center">
            <ScaleIn delay={0.1}>
              <CardTitle className="text-2xl text-white">Create Account</CardTitle>
              <CardDescription className="text-emerald-200/70">{selectedModule?.name}</CardDescription>
            </ScaleIn>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {registerFields.map((field, i) => (
                <FadeIn key={field.key} delay={0.2 + i * 0.1}>
                  <div className="space-y-2">
                    <Label className="text-white/80">{field.label}</Label>
                    <Input type={field.type} value={form[field.key as keyof typeof form]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                </FadeIn>
              ))}
              <FadeIn delay={0.5}>
                <div className="space-y-2">
                  <Label className="text-white/80">Role</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin / Back Office</SelectItem>
                      <SelectItem value="inspector">Inspector / Certifier</SelectItem>
                      <SelectItem value="fo">Field Officer</SelectItem>
                      <SelectItem value="farmer">Farmer / Cooperative</SelectItem>
                      <SelectItem value="exporter">Exporter / Trader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FadeIn>
              <FadeIn delay={0.6}>
                <div className="space-y-2">
                  <Label className="text-white/80">Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                </div>
              </FadeIn>
              <FadeIn delay={0.7}>
                <motion.button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white rounded-md h-10 font-medium transition-colors disabled:opacity-50"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
                  Create Account
                </motion.button>
              </FadeIn>
              <FadeIn delay={0.8}>
                <p className="text-center text-sm text-emerald-200/60">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setCurrentView('login')} className="text-emerald-300 font-medium hover:underline">Sign in</button>
                </p>
              </FadeIn>
            </form>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}

// ======== Custom Chart Tooltip (declared outside render) ========
function DashboardChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-gray-600 dark:text-gray-400" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </p>
      ))}
    </div>
  )
}

// ======== DASHBOARD VIEW ========
function DashboardView() {
  const { selectedModule, setCurrentView } = useAppStore()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = useCallback(async () => {
    if (!selectedModule) return
    setLoading(true)
    try {
      const data = await getDashboardStats(selectedModule.id)
      console.log('[Dashboard] Stats loaded:', Object.keys(data || {}))
      setStats(data)
    } catch (err) {
      console.error('[Dashboard] Failed to load stats:', err)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [selectedModule])

  useEffect(() => {
    fetchDashboardStats()
  }, [fetchDashboardStats])

  // ── Premium KPI Cards ──
  const primaryKpis = [
    { label: 'Total Revenue', value: stats?.totalPurchaseAmount || 0, icon: DollarSign, color: 'from-emerald-500 to-emerald-700', textColor: 'text-white', format: 'currency', view: 'procurement-records' },
    { label: 'Total Farmers', value: stats?.totalFarmers || 0, icon: Users, color: 'from-blue-500 to-blue-700', textColor: 'text-white', format: 'number', view: 'farmers' },
    { label: 'Farm Area', value: stats?.totalLandArea || 0, icon: MapPin, color: 'from-amber-500 to-amber-700', textColor: 'text-white', format: 'area', view: 'farmlands' },
    { label: 'Harvest Volume', value: stats?.totalNetWeight || 0, icon: Wheat, color: 'from-lime-500 to-lime-700', textColor: 'text-white', format: 'weight', view: 'harvest-traceabilities' },
    { label: 'Avg Price/kg', value: stats?.avgPricePerKg || 0, icon: Scale, color: 'from-violet-500 to-violet-700', textColor: 'text-white', format: 'price', view: 'procurement-records' },
    { label: 'Quality Score', value: stats?.avgCupScore || 0, icon: Award, color: 'from-rose-500 to-rose-700', textColor: 'text-white', format: 'score', view: 'coffee-inspections' },
  ]

  const secondaryKpis = [
    { label: 'Procurement Orders', value: stats?.totalProcurementRecords || 0, icon: FileText, color: 'bg-purple-50 text-purple-700 border-purple-200', view: 'procurement-records' },
    { label: 'Marketplace', value: stats?.totalMarketplaceListings || 0, icon: Store, color: 'bg-orange-50 text-orange-700 border-orange-200', view: 'marketplace' },
    { label: 'Certified Farms', value: stats?.certifiedFarmersCount || 0, icon: Shield, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', view: 'cert-assessments' },
    { label: 'Smart Contracts', value: stats?.totalSmartContracts || 0, icon: Scale, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', view: 'smart-contracts' },
    { label: 'Nurseries', value: stats?.totalNurseries || 0, icon: Sprout, color: 'bg-green-50 text-green-700 border-green-200', view: 'nurseries' },
    { label: 'Inspections', value: stats?.totalInspections || 0, icon: ClipboardCheck, color: 'bg-teal-50 text-teal-700 border-teal-200', view: 'coffee-inspections' },
  ]

  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency': return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val)
      case 'area': return `${val.toFixed(1)} ha`
      case 'weight': return `${val.toFixed(0)} kg`
      case 'price': return `${val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND`
      case 'score': return val.toFixed(1)
      default: return val.toLocaleString()
    }
  }

  // ── Chart data processors ──
  const processingBarData = (stats?.processingByStage || []).map((s: any) => ({
    name: s.stageType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || s.stageType,
    value: s._count?.stageType || 0,
  }))

  const cropPieData = (stats?.cultivationsByCrop || []).map((c: any) => ({
    name: c.cultivatedCrop || 'Unknown',
    value: c._count?.cultivatedCrop || 0,
  }))

  const provinceBarData = (stats?.farmersPerProvince || []).map((p: any) => ({
    name: p.province || 'Unknown',
    value: p._count?.province || 0,
  }))

  const harvestTrendData = stats?.harvestTrends || []
  const procurementTrendData = stats?.procurementTrends || []
  const qualityDistData = stats?.qualityDistribution || []
  const certTypeData = (stats?.certByType || []).map((c: any) => ({
    name: c.certificationStandard || 'Other',
    value: c._count?.certificationStandard || 0,
  }))

  // Merge harvest + procurement trends for combined chart
  const months = [...new Set([...harvestTrendData.map((h: any) => h.month), ...procurementTrendData.map((p: any) => p.month)])].sort()
  const combinedTrendData = months.map(m => {
    const h = harvestTrendData.find((x: any) => x.month === m)
    const p = procurementTrendData.find((x: any) => x.month === m)
    return {
      month: m,
      name: h?.name || p?.name || m,
      harvests: h?.harvests || 0,
      procurements: p?.procurements || 0,
    }
  })

  // Processing stage icons and labels for pipeline overview
  const processingStages = [
    { key: 'CLEANING_WASHING', label: 'Cleaning & Washing', icon: Sparkles },
    { key: 'DEPULPING_FERMENTATION', label: 'Depulping & Fermentation', icon: Cog },
    { key: 'DRYING_HULLING', label: 'Drying & Hulling', icon: Sun },
    { key: 'GRADING_SORTING', label: 'Grading & Sorting', icon: Filter },
    { key: 'ROASTING_BLENDING', label: 'Roasting & Blending', icon: Flame },
    { key: 'GRINDING_PACKAGING', label: 'Grinding & Packaging', icon: Package },
    { key: 'QUALITY_CONTROL', label: 'Quality Control', icon: BarChart3 },
  ]

  const getStageCount = (stageKey: string) => {
    const found = (stats?.processingByStage || []).find((s: any) => s.stageType === stageKey)
    return found?._count?.stageType || 0
  }

  if (loading) return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <AnimatedPage viewKey="dashboard">
      <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* ── Header ── */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground text-sm mt-1">Real-time analytics for {selectedModule?.name}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                <TrendingUp className="h-3 w-3 mr-1" /> Credit: {stats?.avgCreditScore?.toFixed(0) || 0}/100
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                <Award className="h-3 w-3 mr-1" /> Cup: {stats?.avgCupScore?.toFixed(1) || 0}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <Activity className="h-3 w-3 mr-1" /> {stats?.totalCollectionCentres || 0} Centres
              </Badge>
            </div>
          </div>
        </FadeIn>

        {/* ═══════ ROW 1: Primary KPI Cards (Gradient) ═══════ */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" staggerDelay={0.06}>
          {primaryKpis.map(kpi => (
            <StaggerItem key={kpi.label}>
              <AnimatedCard className="cursor-pointer" onClick={() => kpi.view && setCurrentView(kpi.view as any)}>
                <motion.div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${kpi.color} p-4 text-white shadow-lg`}
                  whileHover={{ scale: 1.03, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.25)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Decorative circle */}
                  <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
                  <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/5" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <kpi.icon className="h-5 w-5 text-white/80" />
                      <div className="h-2 w-2 rounded-full bg-white/60 animate-pulse" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold tracking-tight">
                      {kpi.format === 'currency'
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(kpi.value)
                        : kpi.format === 'area'
                        ? `${kpi.value.toFixed(1)} ha`
                        : kpi.format === 'weight'
                        ? `${kpi.value.toFixed(0)} kg`
                        : kpi.format === 'price'
                        ? `${kpi.value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND`
                        : kpi.format === 'score'
                        ? kpi.value.toFixed(1)
                        : <CounterAnimation target={kpi.value} />
                      }
                    </p>
                    <p className="text-[11px] text-white/70 font-medium mt-1 uppercase tracking-wider">{kpi.label}</p>
                  </div>
                </motion.div>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* ═══════ ROW 2: Secondary KPI Cards ═══════ */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" staggerDelay={0.05}>
          {secondaryKpis.map(kpi => (
            <StaggerItem key={kpi.label}>
              <motion.div
                className={`flex items-center gap-3 p-3 rounded-xl border ${kpi.color} cursor-pointer`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => kpi.view && setCurrentView(kpi.view as any)}
              >
                <div className="shrink-0"><kpi.icon className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="text-lg font-bold leading-tight"><CounterAnimation target={kpi.value} /></p>
                  <p className="text-[10px] font-medium opacity-70 truncate">{kpi.label}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* ═══════ ROW 3: Main Charts (3-column) ═══════ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Harvest & Procurement Trends - Area Chart */}
          <FadeIn delay={0.3} className="lg:col-span-2">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      Supply Chain Trends
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">Harvest &amp; procurement activity over time</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Harvest</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Procurement</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={combinedTrendData}>
                    <defs>
                      <linearGradient id="gradHarvest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradProcurement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<DashboardChartTooltip />} />
                    <Area type="monotone" dataKey="harvests" name="Harvests" stroke="#10b981" strokeWidth={2.5} fill="url(#gradHarvest)" dot={{ r: 3, fill: '#10b981' }} />
                    <Area type="monotone" dataKey="procurements" name="Procurements" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradProcurement)" dot={{ r: 3, fill: '#3b82f6' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Crop Distribution - Doughnut Chart */}
          <FadeIn delay={0.45}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bean className="h-4 w-4 text-amber-600" />
                  Crop Distribution
                </CardTitle>
                <CardDescription className="text-xs">Cultivations by crop type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={cropPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {cropPieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<DashboardChartTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* ═══════ ROW 4: Processing + Quality + Province ═══════ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Processing Stages - Vertical Bar */}
          <FadeIn delay={0.5}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Factory className="h-4 w-4 text-orange-600" />
                  Processing Pipeline
                </CardTitle>
                <CardDescription className="text-xs">Records per processing stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={processingBarData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" fontSize={9} width={100} tickLine={false} axisLine={false} />
                    <Tooltip content={<DashboardChartTooltip />} />
                    <Bar dataKey="value" name="Records" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Quality Score Distribution - Pie */}
          <FadeIn delay={0.6}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-rose-600" />
                  Quality Distribution
                </CardTitle>
                <CardDescription className="text-xs">Cup score breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={qualityDistData}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name.split(' ')[0]}: ${value}` : ''}
                      labelLine={{ strokeWidth: 1 }}
                    >
                      {qualityDistData.map((_, i) => (
                        <Cell key={i} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip content={<DashboardChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Farmers per Province - Horizontal Bar */}
          <FadeIn delay={0.7}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Farmers by Province
                </CardTitle>
                <CardDescription className="text-xs">Geographic distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={provinceBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<DashboardChartTooltip />} />
                    <Bar dataKey="value" name="Farmers" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* ═══════ ROW 5: Financial Overview + Procurement Pipeline ═══════ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Procurement Revenue Trend - Composed Chart */}
          <FadeIn delay={0.75} className="lg:col-span-2">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-600" />
                      Procurement Financial Overview
                    </CardTitle>
                    <CardDescription className="text-xs">Monthly procurement volume &amp; revenue</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={procurementTrendData}>
                    <defs>
                      <linearGradient id="gradAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<DashboardChartTooltip />} />
                    <Bar yAxisId="left" dataKey="weight" name="Weight (kg)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} opacity={0.85} />
                    <Line yAxisId="right" type="monotone" dataKey="amount" name="Revenue (VND)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Certification Breakdown */}
          <FadeIn delay={0.85}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-600" />
                  Certifications
                </CardTitle>
                <CardDescription className="text-xs">By standard type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={certTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={85}
                      dataKey="value"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {certTypeData.map((_, i) => (
                        <Cell key={i} fill={['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'][i] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip content={<DashboardChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* ═══════ ROW 6: Processing Pipeline + Recent Activity ═══════ */}
        {/* Processing Pipeline Overview */}
        <FadeIn delay={0.85}>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Route className="h-4 w-4 text-orange-600" />
                Processing Pipeline Overview
              </CardTitle>
              <CardDescription className="text-xs">7-stage coffee processing — click a stage to manage records</CardDescription>
            </CardHeader>
            <CardContent>
              <StaggerContainer className="flex items-center gap-1 overflow-x-auto pb-2" staggerDelay={0.06}>
                {processingStages.map((stage, i) => {
                  const StageIcon = stage.icon
                  const count = getStageCount(stage.key)
                  return (
                    <StaggerItem key={stage.key}>
                      <div className="flex items-center gap-1 shrink-0">
                        <motion.button
                          onClick={() => {
                            const viewMap: Record<string, any> = {
                              CLEANING_WASHING: 'ps-cleaning-washing',
                              DEPULPING_FERMENTATION: 'ps-depulping-fermentation',
                              DRYING_HULLING: 'ps-drying-hulling',
                              GRADING_SORTING: 'ps-grading-sorting',
                              ROASTING_BLENDING: 'ps-roasting-blending',
                              GRINDING_PACKAGING: 'ps-grinding-packaging',
                              QUALITY_CONTROL: 'ps-quality-control',
                            }
                            setCurrentView(viewMap[stage.key])
                          }}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl min-w-[80px] border transition-colors hover:shadow-md ${count > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                          whileHover={{ scale: 1.05, boxShadow: '0 4px 20px -4px rgba(0,0,0,0.15)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${count > 0 ? 'bg-orange-200' : 'bg-gray-200'}`}>
                            <StageIcon className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-medium text-center leading-tight">{stage.label}</span>
                          {count > 0 && <span className="text-[10px] font-bold bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">{count}</span>}
                        </motion.button>
                        {i < processingStages.length - 1 && (
                          <motion.svg
                            className="h-4 w-4 text-gray-300 shrink-0"
                            viewBox="0 0 16 16" fill="none"
                            animate={{ x: [0, 2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                          >
                            <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </div>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* ═══════ ROW 7: Data Tables ═══════ */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Procurements Table */}
          <FadeIn delay={0.9}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-purple-600" />
                    Recent Procurements
                  </CardTitle>
                  <motion.button
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    whileHover={{ x: 2 }}
                    onClick={() => setCurrentView('procurement-records')}
                  >
                    View All <ChevronRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.recentProcurements?.slice(0, 6)?.map((p: any, idx: number) => (
                    <motion.div
                      key={p.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + idx * 0.05 }}
                    >
                      <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-xs font-bold">
                        {(p.farmer?.fullName || 'U').charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{p.farmer?.fullName || 'Unknown'}</p>
                        <p className="text-[11px] text-muted-foreground">{p.procurementDate ? new Date(p.procurementDate).toLocaleDateString() : '-'} · {p.netWeight || 0} kg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{new Intl.NumberFormat('vi-VN').format(p.totalPurchaseAmount || 0)}</p>
                        <p className="text-[10px] text-muted-foreground">VND</p>
                      </div>
                    </motion.div>
                  ))}
                  {(!stats?.recentProcurements || stats.recentProcurements.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-6">No procurement records yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Recent Inspections + Alerts */}
          <FadeIn delay={0.95}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-teal-600" />
                    Recent Inspections &amp; Alerts
                  </CardTitle>
                  <motion.button
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    whileHover={{ x: 2 }}
                    onClick={() => setCurrentView('coffee-inspections')}
                  >
                    View All <ChevronRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.recentInspections?.map((insp: any, idx: number) => (
                    <motion.div
                      key={insp.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.95 + idx * 0.05 }}
                    >
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        insp.certStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                        insp.certStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{insp.certificationType || 'Inspection'}</p>
                        <p className="text-[11px] text-muted-foreground">{insp.inspectorName || '-'} · {insp.inspectionDate ? new Date(insp.inspectionDate).toLocaleDateString() : '-'}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        insp.certStatus === 'Approved' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                        insp.certStatus === 'Pending' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                        'border-red-200 text-red-700 bg-red-50'
                      }`}>
                        {insp.certStatus || 'Open'}
                      </Badge>
                    </motion.div>
                  ))}
                  {/* Crop Alerts */}
                  {stats?.cropAlerts?.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Active Alerts
                      </p>
                      {stats.cropAlerts.slice(0, 3).map((alert: any, idx: number) => (
                        <div key={alert.id} className="flex items-center gap-2 py-1.5 text-xs">
                          <PulseDot color="bg-amber-500" size="sm" />
                          <span className="text-muted-foreground truncate">{alert.recommendation || 'Field alert triggered'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!stats?.recentInspections || stats.recentInspections.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-6">No inspections yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* ═══════ ROW 8: Marketplace + Payment Status ═══════ */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Marketplace Listings */}
          <FadeIn delay={1.0}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Store className="h-4 w-4 text-orange-600" />
                  Marketplace
                </CardTitle>
                <CardDescription className="text-xs">Active listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.recentMarketplace?.map((ml: any) => (
                    <div key={ml.id} className="p-2.5 rounded-lg border hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium truncate">{ml.coffeeVariety || 'Coffee'} - {ml.processingMethod || 'N/A'}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-muted-foreground">{ml.availableQty || 0} kg available</span>
                        <span className="text-xs font-semibold text-emerald-700">{ml.pricePerKg ? `${ml.pricePerKg.toLocaleString()} VND/kg` : '-'}</span>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentMarketplace || stats.recentMarketplace.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No listings yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Payment Status Overview */}
          <FadeIn delay={1.05}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  Payment Status
                </CardTitle>
                <CardDescription className="text-xs">Procurement payment tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                  <p className="text-3xl font-bold text-emerald-700"><CounterAnimation target={stats?.procurementPaidCount || 0} /></p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">Paid Orders</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                  <p className="text-3xl font-bold text-amber-700"><CounterAnimation target={stats?.procurementPendingCount || 0} /></p>
                  <p className="text-xs text-amber-600 mt-1 font-medium">Pending Payments</p>
                </div>
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-muted-foreground">Payment Rate</span>
                  <span className="font-semibold">
                    {stats?.totalProcurementRecords > 0
                      ? ((stats.procurementPaidCount / stats.totalProcurementRecords) * 100).toFixed(0)
                      : 0}%
                  </span>
                </div>
                <Progress
                  value={stats?.totalProcurementRecords > 0 ? (stats.procurementPaidCount / stats.totalProcurementRecords) * 100 : 0}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </FadeIn>

          {/* Smart Contracts Status */}
          <FadeIn delay={1.1}>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600" />
                  Smart Contracts
                </CardTitle>
                <CardDescription className="text-xs">Contract status overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <p className="text-3xl font-bold text-blue-700"><CounterAnimation target={stats?.smartContractOpenCount || 0} /></p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">Open Contracts</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50">
                  <p className="text-3xl font-bold text-gray-600"><CounterAnimation target={stats?.smartContractClosedCount || 0} /></p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Closed Contracts</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                  <p className="text-lg font-bold text-indigo-700">{stats?.totalMarketplaceAvailableKg?.toFixed(0) || 0} kg</p>
                  <p className="text-[11px] text-indigo-500 font-medium">Available on Marketplace</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </AnimatedPage>
  )
}

// ======== FARMERS LIST VIEW ========
function FarmersView() {
  const { selectedModule, setCurrentView, setSelectedFarmer } = useAppStore()
  const [farmers, setFarmers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!selectedModule) return
    setLoading(true)
    try {
      const data = await (await import('@/lib/api')).getFarmers(selectedModule.id)
      setFarmers(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedModule])

  const filtered = farmers.filter(f =>
    f.fullName.toLowerCase().includes(search.toLowerCase()) ||
    f.farmerCode?.toLowerCase().includes(search.toLowerCase()) ||
    f.province?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AnimatedPage viewKey="farmers">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold">Farmers ({farmers.length})</h2>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedFarmer(null); setCurrentView('farmer-form') }}>
              <Plus className="h-4 w-4 mr-2" /> Add Farmer
            </Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, code, province..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </FadeIn>
        {loading ? <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} className="h-16 w-full" />)}</div> : (
          <FadeIn delay={0.2}>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-emerald-50 to-emerald-100/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Code</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Contact</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Province</th>
                      <th className="text-left p-3 font-medium">Certified</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Credit</th>
                      <th className="text-left p-3 font-medium hidden lg:table-cell">Lands</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f, i) => (
                      <tr key={f.id} className="border-t transition-colors duration-200 hover:bg-emerald-50/50 hover:shadow-sm">
                        <td className="p-3 font-mono text-xs">{f.farmerCode}</td>
                        <td className="p-3 font-medium">{f.fullName}</td>
                        <td className="p-3 hidden md:table-cell">{f.contactNumber}</td>
                        <td className="p-3 hidden lg:table-cell">{f.province}</td>
                        <td className="p-3">
                          {f.isCertified ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                        </td>
                        <td className="p-3 hidden md:table-cell">{f.creditScore ? <Badge variant="outline">{f.creditScore.toFixed(0)}</Badge> : '-'}</td>
                        <td className="p-3 hidden lg:table-cell">{f._count?.farmLands || 0}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <motion.button
                              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                              onClick={() => { setSelectedFarmer(f); setCurrentView('farmer-detail') }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                              onClick={() => { setSelectedFarmer(f); setCurrentView('farmer-form') }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Pencil className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No farmers found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ======== FARMER FORM VIEW ========
function FarmerFormView() {
  const { selectedModule, selectedFarmer, setCurrentView } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({
    fullName: '', lastName: '', contactNumber: '', gender: '', dob: '', education: '',
    maritalStatus: '', guardianName: '', email: '', country: 'Vietnam', province: '',
    district: '', commune: '', village: '', zipCode: '', spouseName: '',
    noOfFamilyMembers: '', childrenBelow18Male: '', childrenBelow18Female: '', schoolGoingMale: '', schoolGoingFemale: '',
    housingOwnership: '', houseType: '', consumerElectronics: '', vehicles: '',
    loanTaken: false, loanTakenFrom: '', loanAmount: '', loanPurpose: '',
    loanInterest: '', loanInterestPeriod: '', loanSecurity: false,
    loanRepaymentAmt: '', loanRepaymentDate: '', isCertified: false,
    certificationType: '', yearOfICS: '', cooperative: '', enrollmentPlace: '',
    nationalIdType: '', nationalIdNo: '',
  })

  useEffect(() => {
    if (selectedFarmer) {
      const f = selectedFarmer as any
      setForm({
        ...form,
        fullName: f.fullName || '', lastName: f.lastName || '', contactNumber: f.contactNumber || '',
        gender: f.gender || '', dob: f.dob ? f.dob.split('T')[0] : '', education: f.education || '',
        maritalStatus: f.maritalStatus || '', guardianName: f.guardianName || '', email: f.email || '',
        country: f.country || 'Vietnam', province: f.province || '', district: f.district || '',
        commune: f.commune || '', village: f.village || '', zipCode: f.zipCode || '',
        spouseName: f.spouseName || '', noOfFamilyMembers: f.noOfFamilyMembers || '',
        childrenBelow18Male: f.childrenBelow18Male || '', childrenBelow18Female: f.childrenBelow18Female || '', schoolGoingMale: f.schoolGoingMale || '', schoolGoingFemale: f.schoolGoingFemale || '',
        housingOwnership: f.housingOwnership || '', houseType: f.houseType || '',
        loanTaken: f.loanTaken || false, loanTakenFrom: f.loanTakenFrom || '',
        loanAmount: f.loanAmount || '', loanPurpose: f.loanPurpose || '',
        loanInterest: f.loanInterest || '', loanInterestPeriod: f.loanInterestPeriod || '',
        loanSecurity: f.loanSecurity || false, loanRepaymentAmt: f.loanRepaymentAmt || '',
        loanRepaymentDate: f.loanRepaymentDate ? f.loanRepaymentDate.split('T')[0] : '',
        isCertified: f.isCertified || false, certificationType: f.certificationType || '',
        yearOfICS: f.yearOfICS || '', cooperative: f.cooperative || '',
        enrollmentPlace: f.enrollmentPlace || '', nationalIdType: f.nationalIdType || '',
        nationalIdNo: f.nationalIdNo || '',
      })
    }
  }, [selectedFarmer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const api = await import('@/lib/api')
      const data = { ...form, moduleId: selectedModule!.id, age: form.dob ? new Date().getFullYear() - new Date(form.dob).getFullYear() : null }
      if (selectedFarmer) {
        await api.updateFarmer(selectedFarmer.id, data)
        toast({ title: 'Farmer updated successfully' })
      } else {
        await api.createFarmer(data)
        toast({ title: 'Farmer created successfully' })
      }
      setCurrentView('farmers')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  const FormField = (label: string, field: string, type = 'text', required = false) => (
    <div className="space-y-1">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <Input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={required} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" />
    </div>
  )

  return (
    <AnimatedPage viewKey="farmer-form">
      <div className="p-4 md:p-6">
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('farmers')}>← Back</Button>
            <h2 className="text-xl font-bold">{selectedFarmer ? 'Edit Farmer' : 'New Farmer Registration'}</h2>
          </div>
        </FadeIn>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 max-w-4xl">
            <FadeIn delay={0.1}>
              <Card><CardHeader><CardTitle className="text-base">Registration Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Enrollment Place</Label>
                  <Select value={form.enrollmentPlace} onValueChange={v => setForm({ ...form, enrollmentPlace: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="At Farmer Place">At Farmer Place</SelectItem>
                      <SelectItem value="At Cooperative">At Cooperative</SelectItem>
                      <SelectItem value="At Warehouse">At Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Cooperative</Label><Input value={form.cooperative} onChange={e => setForm({ ...form, cooperative: e.target.value })} /></div>
                <div className="flex items-end gap-3 pb-1">
                  <Switch checked={form.isCertified} onCheckedChange={v => setForm({ ...form, isCertified: v })} />
                  <Label>Is Certified Farmer</Label>
                </div>
                {form.isCertified && (
                  <>
                    <div className="space-y-1"><Label>Certification Type</Label>
                      <Select value={form.certificationType} onValueChange={v => setForm({ ...form, certificationType: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Group">Group</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Year of ICS</Label><Input value={form.yearOfICS} onChange={e => setForm({ ...form, yearOfICS: e.target.value })} /></div>
                  </>
                )}
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card><CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Full Name <span className="text-red-500">*</span></Label><Input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Last Name <span className="text-red-500">*</span></Label><Input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Contact Number <span className="text-red-500">*</span></Label><Input type="text" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} required className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Gender</Label>
                  <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Education</Label>
                  <Select value={form.education} onValueChange={v => setForm({ ...form, education: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Primary">Primary</SelectItem><SelectItem value="Secondary">Secondary</SelectItem><SelectItem value="UG">UG</SelectItem><SelectItem value="PG">PG</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Marital Status</Label>
                  <Select value={form.maritalStatus} onValueChange={v => setForm({ ...form, maritalStatus: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Un-Married">Un-Married</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Widow">Widow</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Guardian/Parent Name</Label><Input type="text" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>National ID Type</Label>
                  <Select value={form.nationalIdType} onValueChange={v => setForm({ ...form, nationalIdType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="National ID">National ID</SelectItem><SelectItem value="Driving License">Driving License</SelectItem><SelectItem value="Passport">Passport</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>ID Proof Number</Label><Input type="text" value={form.nationalIdNo} onChange={e => setForm({ ...form, nationalIdNo: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card><CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Country</Label><Input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Province</Label><Input type="text" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>District</Label><Input type="text" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Commune</Label><Input type="text" value={form.commune} onChange={e => setForm({ ...form, commune: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Village</Label><Input type="text" value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Zip Code</Label><Input type="text" value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Card><CardHeader><CardTitle className="text-base">Family Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Spouse Name</Label><Input type="text" value={form.spouseName} onChange={e => setForm({ ...form, spouseName: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>No of Family Members</Label><Input type="number" value={form.noOfFamilyMembers} onChange={e => setForm({ ...form, noOfFamilyMembers: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Children Below 18 (Male)</Label><Input type="number" value={form.childrenBelow18Male} onChange={e => setForm({ ...form, childrenBelow18Male: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Children Below 18 (Female)</Label><Input type="number" value={form.childrenBelow18Female} onChange={e => setForm({ ...form, childrenBelow18Female: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>School Going (Male)</Label><Input type="number" value={form.schoolGoingMale} onChange={e => setForm({ ...form, schoolGoingMale: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>School Going (Female)</Label><Input type="number" value={form.schoolGoingFemale} onChange={e => setForm({ ...form, schoolGoingFemale: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.5}>
              <Card><CardHeader><CardTitle className="text-base">Asset Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Housing Ownership</Label>
                  <Select value={form.housingOwnership} onValueChange={v => setForm({ ...form, housingOwnership: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Owned">Owned</SelectItem><SelectItem value="Rent">Rent</SelectItem><SelectItem value="Lease">Lease</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>House Type</Label>
                  <Select value={form.houseType} onValueChange={v => setForm({ ...form, houseType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Brick house">Brick House</SelectItem><SelectItem value="Wooden house">Wooden House</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.6}>
              <Card><CardHeader><CardTitle className="text-base">Finance Information</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="flex items-center gap-3"><Switch checked={form.loanTaken} onCheckedChange={v => setForm({ ...form, loanTaken: v })} /><Label>Loan taken last year?</Label></div>
                {form.loanTaken && (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1"><Label>Loan Taken From</Label>
                    <Select value={form.loanTakenFrom} onValueChange={v => setForm({ ...form, loanTakenFrom: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Bank">Bank</SelectItem><SelectItem value="Relative">Relative</SelectItem><SelectItem value="Friend">Friend</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Loan Amount</Label><Input type="number" value={form.loanAmount} onChange={e => setForm({ ...form, loanAmount: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                  <div className="space-y-1"><Label>Loan Interest (%)</Label><Input type="number" value={form.loanInterest} onChange={e => setForm({ ...form, loanInterest: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                  <div className="space-y-1"><Label>Interest Period</Label>
                    <Select value={form.loanInterestPeriod} onValueChange={v => setForm({ ...form, loanInterestPeriod: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Yearly">Yearly</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Repayment Amount</Label><Input type="number" value={form.loanRepaymentAmt} onChange={e => setForm({ ...form, loanRepaymentAmt: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                  <div className="space-y-1"><Label>Repayment Date</Label><Input type="date" value={form.loanRepaymentDate} onChange={e => setForm({ ...form, loanRepaymentDate: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                </div>)}
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.7}>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setCurrentView('farmers')}>Cancel</Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedFarmer ? 'Update Farmer' : 'Register Farmer'}
                </Button>
              </div>
            </FadeIn>
          </div>
        </form>
      </div>
    </AnimatedPage>
  )
}

// ======== FARMER DETAIL VIEW ========

// Sensitive field component with masking
function SensitiveField({ label, value, icon: Icon, autoReveal = false }: { label: string; value: string | number | null | undefined; icon?: any; autoReveal?: boolean }) {
  const [visible, setVisible] = useState(autoReveal)
  if (!value && value !== 0) return (
    <div className="flex items-start gap-2.5 py-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      <div><p className="text-[11px] text-muted-foreground font-medium">{label}</p><p className="text-sm text-muted-foreground/60">-</p></div>
    </div>
  )
  const masked = typeof value === 'string' ? value.replace(/./g, '\u2022') : '\u2022\u2022\u2022\u2022'
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{visible ? value : masked}</p>
          <button onClick={() => setVisible(!visible)} className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={visible ? 'Hide' : 'Reveal'}>
            {visible ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value, icon: Icon, badge }: { label: string; value: string | number | null | undefined | boolean; icon?: any; badge?: string }) {
  const display = value === true ? 'Yes' : value === false ? 'No' : value ?? '-'
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{typeof display === 'string' && display.length > 30 ? display.slice(0, 30) + '...' : display}</p>
          {badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge}`}>{badge}</span>}
        </div>
      </div>
    </div>
  )
}

function DetailSection({ title, icon: Icon, children, delay = 0, accent = 'emerald' }: { title: string; icon?: any; children: React.ReactNode; delay?: number; accent?: string }) {
  const accentColors: Record<string, string> = {
    emerald: 'bg-emerald-500', blue: 'bg-blue-500', violet: 'bg-violet-500', amber: 'bg-amber-500', rose: 'bg-rose-500', cyan: 'bg-cyan-500', orange: 'bg-orange-500',
  }
  return (
    <FadeIn delay={delay}>
      <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
        <div className={`h-1 ${accentColors[accent] || accentColors.emerald}`} />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {Icon && <div className={`h-7 w-7 rounded-lg ${accentColors[accent] || accentColors.emerald} bg-opacity-10 flex items-center justify-center`} style={{ backgroundColor: `${accentColors[accent] || accentColors.emerald}15` }}>
              <Icon className="h-3.5 w-3.5" style={{ color: accentColors[accent]?.replace('bg-', '') }} />
            </div>}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </FadeIn>
  )
}

function FarmerDetailView() {
  const { selectedFarmer, setCurrentView, setSelectedFarmer, selectedModule } = useAppStore()
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set())

  const fetchFarmerDetail = useCallback(async () => {
    if (!selectedFarmer) return
    setLoading(true)
    try {
      const api = await import('@/lib/api')
      const data = await api.getFarmer(selectedFarmer!.id)
      setDetail(data)
      try {
        const qrRes = await getQRCode(JSON.stringify({ type: 'farmer', id: data.id, name: data.fullName, code: data.farmerCode, module: data.moduleId }))
        if (qrRes?.qr) setQrDataUrl(qrRes.qr)
      } catch { /* QR optional */ }
    } catch (err) {
      console.error('[FarmerDetail] Failed:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedFarmer])

  useEffect(() => { fetchFarmerDetail() }, [fetchFarmerDetail])

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
  if (!detail) return null

  const f = detail
  const initials = (f.fullName || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const formatDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
  const creditColor = f.creditScore >= 80 ? 'text-emerald-600' : f.creditScore >= 60 ? 'text-amber-600' : f.creditScore ? 'text-red-600' : 'text-gray-400'
  const creditBg = f.creditScore >= 80 ? 'from-emerald-500 to-emerald-600' : f.creditScore >= 60 ? 'from-amber-500 to-amber-600' : f.creditScore ? 'from-red-500 to-red-600' : 'from-gray-400 to-gray-500'

  return (
    <AnimatedPage viewKey="farmer-detail">
      <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* HERO HEADER */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
              <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/3" />
            </div>
            <div className="relative z-10 p-5 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => { setCurrentView('farmers'); setSelectedFarmer(null) }}
                  className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedFarmer(f); setCurrentView('farmer-form') }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { navigator.clipboard.writeText(window.location.origin + '/farmer/' + f.id) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </motion.button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className="relative shrink-0">
                  {f.farmerPhoto ? (
                    <img src={f.farmerPhoto} alt={f.fullName} className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover border-4 border-white/20 shadow-xl" />
                  ) : (
                    <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-white/15 backdrop-blur-sm border-4 border-white/20 shadow-xl flex items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold text-white/90">{initials}</span>
                    </div>
                  )}
                  {f.isCertified && (
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg border-2 border-white">
                      <BadgeCheck className="h-4 w-4 text-amber-900" />
                    </div>
                  )}
                  <div className="absolute -top-1 -left-1"><PulseDot color="bg-emerald-300" size="sm" /></div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{f.fullName}</h1>
                    {f.isCertified ? (
                      <Badge className="bg-amber-400/20 text-amber-100 border border-amber-400/30 hover:bg-amber-400/30"><Shield className="h-3 w-3 mr-1" /> Certified</Badge>
                    ) : (
                      <Badge className="bg-white/10 text-white/70 border border-white/10">Non-Certified</Badge>
                    )}
                  </div>
                  {f.farmerCode && <p className="text-emerald-200/80 text-sm font-mono mb-3">ID: {f.farmerCode}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                    {f.province && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{f.province}{f.district ? `, ${f.district}` : ''}</span>}
                    {f.enrollmentDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Enrolled {formatDate(f.enrollmentDate)}</span>}
                    {f.yearsOfFarmingExperience && <span className="flex items-center gap-1"><Sprout className="h-3 w-3" />{f.yearsOfFarmingExperience} yrs experience</span>}
                  </div>
                </div>
                <ScaleIn delay={0.2} className="shrink-0 hidden md:block">
                  <div className="bg-white rounded-xl p-3 shadow-xl">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="h-28 w-28" />
                    ) : (
                      <div className="h-28 w-28 bg-gray-100 rounded-lg flex items-center justify-center"><QrCode className="h-10 w-10 text-gray-300" /></div>
                    )}
                    <p className="text-[10px] text-gray-500 text-center mt-1.5 font-medium">Scan for public profile</p>
                  </div>
                </ScaleIn>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
                {[
                  { label: 'Farm Lands', value: f._count?.farmLands || 0, icon: Landmark },
                  { label: 'Cultivations', value: f._count?.cultivations || 0, icon: Sprout },
                  { label: 'Inspections', value: f._count?.coffeeInspections || 0, icon: ClipboardCheck },
                  { label: 'Credit Score', value: f.creditScore ? `${f.creditScore.toFixed(0)}` : '-', icon: Award },
                  { label: 'Certification', value: f.certificationType || '-', icon: BadgeCheck },
                  { label: 'Cooperative', value: f.cooperative || '-', icon: Users },
                ].map((kpi, i) => (
                  <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
                    <kpi.icon className="h-3.5 w-3.5 text-white/60 mb-1" />
                    <p className="text-lg font-bold text-white">{kpi.value}</p>
                    <p className="text-[10px] text-white/60 font-medium">{kpi.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Mobile QR */}
        <FadeIn delay={0.3} className="md:hidden">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-gray-50 rounded-xl p-2">
                {qrDataUrl ? <img src={qrDataUrl} alt="QR" className="h-20 w-20" /> : <div className="h-20 w-20 bg-gray-100 rounded flex items-center justify-center"><QrCode className="h-8 w-8 text-gray-300" /></div>}
              </div>
              <div>
                <p className="text-sm font-semibold">Farmer QR Code</p>
                <p className="text-xs text-muted-foreground mt-0.5">Scan for public profile</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{f.farmerCode || f.id.slice(0, 8)}</p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* TABS */}
        <FadeIn delay={0.35}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-auto flex-wrap">
              {[
                { key: 'overview', label: 'Overview', icon: User },
                { key: 'personal', label: 'Personal', icon: Fingerprint },
                { key: 'address', label: 'Location', icon: MapPin },
                { key: 'family', label: 'Family', icon: Heart },
                { key: 'assets', label: 'Assets', icon: HomeIcon },
                { key: 'finance', label: 'Finance', icon: DollarSign },
                { key: 'insurance', label: 'Insurance', icon: Shield },
              ].map(tab => (
                <TabsTrigger key={tab.key} value={tab.key}
                  className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
                  <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Registration" icon={FileText} accent="blue" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Farmer Code" value={f.farmerCode} icon={Fingerprint} />
                    <InfoField label="Enrollment Date" value={formatDate(f.enrollmentDate)} icon={Calendar} />
                    <InfoField label="Enrollment Place" value={f.enrollmentPlace} icon={MapPin} />
                    <InfoField label="Cooperative" value={f.cooperative} icon={Users} />
                    <InfoField label="Year of ICS" value={f.yearOfICS} icon={Clock} />
                    <InfoField label="Certification Type" value={f.certificationType} badge={f.isCertified ? 'bg-emerald-100 text-emerald-700' : undefined} icon={BadgeCheck} />
                  </div>
                </DetailSection>
                <DetailSection title="Identity (Protected)" icon={Lock} accent="violet" delay={0.15}>
                  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <span>Sensitive data is masked. Click the <Eye className="inline h-3 w-3 mx-0.5" /> icon to reveal.</span>
                  </div>
                  <div className="space-y-0.5">
                    <SensitiveField label="Phone Number" value={f.contactNumber} icon={Phone} />
                    <SensitiveField label="Email Address" value={f.email} icon={Mail} />
                    <SensitiveField label="National ID Type" value={f.nationalIdType} icon={CreditCard} />
                    <SensitiveField label="National ID Number" value={f.nationalIdNo} icon={Fingerprint} />
                    <SensitiveField label="eKYC Consent" value={f.ekycConsent ? 'Granted' : 'Not Granted'} icon={CheckCircle2} autoReveal />
                  </div>
                </DetailSection>
                <DetailSection title="Credit Score" icon={Award} accent="amber" delay={0.2}>
                  <div className="flex flex-col items-center py-4">
                    <div className={`relative h-28 w-28 rounded-full bg-gradient-to-br ${creditBg} flex items-center justify-center shadow-lg`}>
                      <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                        <span className={`text-3xl font-bold ${creditColor}`}>{f.creditScore ? f.creditScore.toFixed(0) : '-'}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium mt-3">out of 100</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.creditScore >= 80 ? 'Excellent creditworthiness' : f.creditScore >= 60 ? 'Good standing' : f.creditScore ? 'Needs improvement' : 'Not yet assessed'}
                    </p>
                  </div>
                </DetailSection>
                <DetailSection title="Farming Activity" icon={Sprout} accent="emerald" delay={0.25}>
                  <div className="space-y-0.5">
                    <InfoField label="Farming Experience" value={f.yearsOfFarmingExperience ? `${f.yearsOfFarmingExperience} years` : '-'} icon={Clock} />
                    <InfoField label="Total Farm Lands" value={f._count?.farmLands || 0} icon={Landmark} />
                    <InfoField label="Total Cultivations" value={f._count?.cultivations || 0} icon={Sprout} />
                    <InfoField label="Coffee Inspections" value={f._count?.coffeeInspections || 0} icon={ClipboardCheck} />
                    <InfoField label="GAP Training" value={f.gapTrainingAttended ? 'Completed' : 'Not Completed'} icon={GraduationCap} badge={f.gapTrainingAttended ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                    <InfoField label="Ethnic Group" value={f.ethnicGroup} icon={Globe} />
                    <InfoField label="Primary Language" value={f.primaryLanguage} icon={Globe} />
                  </div>
                </DetailSection>
              </div>
              {f.farmLands && f.farmLands.length > 0 && (
                <DetailSection title={`Farm Lands (${f.farmLands.length})`} icon={Landmark} accent="cyan" delay={0.3}>
                  <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {f.farmLands.map((land: any) => (
                      <StaggerItem key={land.id}>
                        <motion.div whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)' }}
                          className="relative border rounded-xl p-4 hover:border-emerald-200 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50/50"
                          onClick={() => { setSelectedFarmLand(land); setCurrentView('farmland-detail') }}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">{land.farmName}</p>
                              <p className="text-[11px] text-muted-foreground">{land.altitude ? `${land.altitude}m altitude` : ''}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <Badge variant="outline" className="text-[10px]">{land.totalLandHolding ? `${land.totalLandHolding} ha` : 'N/A'}</Badge>
                            <Badge variant="outline" className="text-[10px]">{land.landOwnership || 'N/A'}</Badge>
                            {land.soilType && <Badge variant="outline" className="text-[10px]">{land.soilType}</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{land._count?.cultivations || 0} crops</span>
                            <span>{land.waterSource || 'No water info'}</span>
                            <span>{land.fertilityStatus || 'Unknown fertility'}</span>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </DetailSection>
              )}
              {f.cultivations && f.cultivations.length > 0 && (
                <DetailSection title={`Cultivations (${f.cultivations.length})`} icon={Coffee} accent="amber" delay={0.35}>
                  <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {f.cultivations.slice(0, 6).map((c: any) => (
                      <StaggerItem key={c.id}>
                        <div className="border rounded-xl p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center"><Coffee className="h-4 w-4 text-amber-600" /></div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{c.farmPlotName || c.cultivatedCrop || 'Cultivation'}</p>
                              <p className="text-[11px] text-muted-foreground">{c.cultivatedCrop || '-'}{c.coffeeSpecies ? ` \u00b7 ${c.coffeeSpecies}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 text-[11px] text-muted-foreground">
                            {c.cultivationArea && <span>{c.cultivationArea} ha</span>}
                            {c.treeDensity && <span>{c.treeDensity} trees/ha</span>}
                            {c.harvests && <span>{c.harvests.length} harvests</span>}
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </DetailSection>
              )}
            </TabsContent>

            {/* PERSONAL TAB */}
            <TabsContent value="personal" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Basic Information" icon={User} accent="blue" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Full Name" value={f.fullName} icon={User} />
                    <InfoField label="First Name" value={f.firstName} />
                    <InfoField label="Last Name" value={f.lastName} />
                    <InfoField label="Middle Name" value={f.middleName} />
                    <InfoField label="Gender" value={f.gender} />
                    <InfoField label="Date of Birth" value={formatDate(f.dob?.split('T')[0])} icon={Calendar} />
                    <InfoField label="Age" value={f.age} />
                    <InfoField label="Education" value={f.education} icon={GraduationCap} />
                    <InfoField label="Marital Status" value={f.maritalStatus} icon={Heart} />
                    <InfoField label="Guardian Name" value={f.guardianName} />
                  </div>
                </DetailSection>
                <DetailSection title="Contact (Protected)" icon={Lock} accent="rose" delay={0.15}>
                  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-700">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <span>Contact details are hidden for security. Click <Eye className="inline h-3 w-3 mx-0.5" /> to reveal.</span>
                  </div>
                  <div className="space-y-0.5">
                    <SensitiveField label="Phone Number" value={f.contactNumber} icon={Phone} />
                    <SensitiveField label="Email" value={f.email} icon={Mail} />
                  </div>
                </DetailSection>
                <DetailSection title="Identification" icon={Fingerprint} accent="violet" delay={0.2}>
                  <div className="space-y-0.5">
                    <SensitiveField label="National ID Type" value={f.nationalIdType} icon={CreditCard} />
                    <SensitiveField label="National ID Number" value={f.nationalIdNo} icon={Fingerprint} />
                    <InfoField label="eKYC Consent" value={f.ekycConsent ? 'Granted' : 'Not Granted'} icon={CheckCircle2} badge={f.ekycConsent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                  </div>
                </DetailSection>
                <DetailSection title="Training & Experience" icon={GraduationCap} accent="emerald" delay={0.25}>
                  <div className="space-y-0.5">
                    <InfoField label="Farming Experience" value={f.yearsOfFarmingExperience ? `${f.yearsOfFarmingExperience} years` : '-'} icon={Clock} />
                    <InfoField label="GAP Training" value={f.gapTrainingAttended ? 'Attended' : 'Not Attended'} icon={GraduationCap} badge={f.gapTrainingAttended ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                    <InfoField label="Training Date" value={formatDate(f.trainingDate)} icon={Calendar} />
                    <InfoField label="Training Provider" value={f.trainingProvider} />
                    <InfoField label="Ethnic Group" value={f.ethnicGroup} icon={Globe} />
                    <InfoField label="Primary Language" value={f.primaryLanguage} icon={Globe} />
                  </div>
                </DetailSection>
              </div>
            </TabsContent>

            {/* ADDRESS TAB */}
            <TabsContent value="address" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Address Details" icon={MapPin} accent="emerald" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Country" value={f.country} icon={Globe} />
                    <InfoField label="Province" value={f.province} icon={MapPin} />
                    <InfoField label="District" value={f.district} />
                    <InfoField label="Commune" value={f.commune} />
                    <InfoField label="Village" value={f.village} />
                    <InfoField label="Zip Code" value={f.zipCode} />
                  </div>
                </DetailSection>
                <DetailSection title="GPS Coordinates" icon={Globe} accent="blue" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Latitude" value={f.latitude} />
                    <InfoField label="Longitude" value={f.longitude} />
                  </div>
                  {(f.latitude && f.longitude) && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <p className="text-[11px] text-blue-600 font-medium">GPS Location</p>
                      <p className="text-xs text-blue-800 font-mono mt-0.5">{f.latitude}, {f.longitude}</p>
                    </div>
                  )}
                </DetailSection>
              </div>
            </TabsContent>

            {/* FAMILY TAB */}
            <TabsContent value="family" className="space-y-5 mt-0">
              <DetailSection title="Family Information" icon={Heart} accent="rose" delay={0.1}>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-0.5">
                  <InfoField label="Spouse Name" value={f.spouseName} icon={Heart} />
                  <InfoField label="Family Members" value={f.noOfFamilyMembers} icon={Users} />
                  <InfoField label="Children Below 18 (Male)" value={f.childrenBelow18Male} />
                  <InfoField label="Children Below 18 (Female)" value={f.childrenBelow18Female} />
                  <InfoField label="School Going (Male)" value={f.schoolGoingMale} icon={GraduationCap} />
                  <InfoField label="School Going (Female)" value={f.schoolGoingFemale} icon={GraduationCap} />
                </div>
              </DetailSection>
            </TabsContent>

            {/* ASSETS TAB */}
            <TabsContent value="assets" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Housing & Assets" icon={HomeIcon} accent="amber" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Housing Ownership" value={f.housingOwnership} icon={HomeIcon} />
                    <InfoField label="House Type" value={f.houseType} />
                    <InfoField label="Consumer Electronics" value={f.consumerElectronics} />
                    <InfoField label="Vehicles" value={f.vehicles} />
                    <InfoField label="Smartphone" value={f.smartphoneOwnership ? 'Yes' : 'No'} icon={Phone} badge={f.smartphoneOwnership ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'} />
                    <InfoField label="Solar Panel" value={f.solarPanelInstalled ? 'Installed' : 'Not Installed'} icon={Sun} badge={f.solarPanelInstalled ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'} />
                  </div>
                </DetailSection>
                {f.farmEquipmentsJson && (
                  <DetailSection title="Farm Equipment" icon={Tractor} accent="orange" delay={0.15}>
                    <div className="text-sm">
                      {(() => { try { const eq = JSON.parse(f.farmEquipmentsJson); return Array.isArray(eq) ? eq.map((e: any, i: number) => (<div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0 border-gray-100"><Tractor className="h-3.5 w-3.5 text-muted-foreground shrink-0" /><span className="text-sm">{typeof e === 'string' ? e : e.name || e.type || JSON.stringify(e)}</span></div>)) : <p className="text-muted-foreground text-sm">{f.farmEquipmentsJson}</p> } catch { return <p className="text-muted-foreground text-sm">{f.farmEquipmentsJson}</p> } })()}
                    </div>
                  </DetailSection>
                )}
                {f.animalHusbandryJson && (
                  <DetailSection title="Animal Husbandry" icon={Heart} accent="rose" delay={0.2}>
                    <div className="text-sm">
                      {(() => { try { const ah = JSON.parse(f.animalHusbandryJson); return Array.isArray(ah) ? ah.map((a: any, i: number) => (<div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0 border-gray-100"><span className="text-sm">{typeof a === 'string' ? a : a.type || a.name || JSON.stringify(a)}</span></div>)) : <p className="text-muted-foreground text-sm">{f.animalHusbandryJson}</p> } catch { return <p className="text-muted-foreground text-sm">{f.animalHusbandryJson}</p> } })()}
                    </div>
                  </DetailSection>
                )}
              </div>
            </TabsContent>

            {/* FINANCE TAB */}
            <TabsContent value="finance" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Banking (Protected)" icon={Landmark} accent="violet" delay={0.1}>
                  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-violet-50 border border-violet-100 text-xs text-violet-700">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    <span>Financial data is protected. Click <Eye className="inline h-3 w-3 mx-0.5" /> to reveal.</span>
                  </div>
                  <div className="space-y-0.5">
                    <SensitiveField label="Account Type" value={f.accountType} icon={Landmark} />
                    <SensitiveField label="Account Number" value={f.accountNumber} icon={CreditCard} />
                    <SensitiveField label="Bank Name" value={f.bankName} icon={Landmark} />
                    <SensitiveField label="Branch Details" value={f.branchDetails} />
                    <SensitiveField label="Sort Code / SWIFT" value={f.sortCodeSwift} />
                    <SensitiveField label="Tax ID" value={f.taxId} icon={FileText} />
                  </div>
                </DetailSection>
                <DetailSection title="Income" icon={DollarSign} accent="emerald" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Annual Farm Income" value={f.annualFarmIncome ? `${new Intl.NumberFormat('vi-VN').format(f.annualFarmIncome)} VND` : '-'} icon={DollarSign} />
                    <InfoField label="Off-Farm Income Sources" value={f.offFarmIncomeSources} />
                  </div>
                </DetailSection>
                <DetailSection title="Loan Details" icon={BanknoteIcon} accent="amber" delay={0.2}>
                  <div className="space-y-0.5">
                    <InfoField label="Loan Taken" value={f.loanTaken} icon={BanknoteIcon} badge={f.loanTaken ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'} />
                    {f.loanTaken && (<>
                      <InfoField label="Loan From" value={f.loanTakenFrom} />
                      <InfoField label="Loan Amount" value={f.loanAmount ? `${new Intl.NumberFormat('vi-VN').format(f.loanAmount)} VND` : '-'} icon={DollarSign} />
                      <InfoField label="Loan Purpose" value={f.loanPurpose} />
                      <InfoField label="Interest Rate" value={f.loanInterest ? `${f.loanInterest}%` : '-'} />
                      <InfoField label="Interest Period" value={f.loanInterestPeriod} />
                      <InfoField label="Loan Security" value={f.loanSecurity ? 'Yes' : 'No'} icon={Shield} />
                      <InfoField label="Repayment Amount" value={f.loanRepaymentAmt ? `${new Intl.NumberFormat('vi-VN').format(f.loanRepaymentAmt)} VND` : '-'} />
                      <InfoField label="Repayment Date" value={formatDate(f.loanRepaymentDate)} icon={Calendar} />
                      <InfoField label="Repayment Track Record" value={f.repaymentTrackRecord} />
                    </>)}
                  </div>
                </DetailSection>
              </div>
            </TabsContent>

            {/* INSURANCE TAB */}
            <TabsContent value="insurance" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Life Insurance" icon={Heart} accent="rose" delay={0.1}>
                  <InfoField label="Status" value={f.lifeInsurance ? 'Active' : 'Not Active'} icon={Shield} badge={f.lifeInsurance ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                  {f.lifeInsurance && (<div className="space-y-0.5 mt-1">
                    <InfoField label="Provider" value={f.lifeInsProvider} />
                    <InfoField label="Amount" value={f.lifeInsAmount} icon={DollarSign} />
                    <InfoField label="Start Date" value={formatDate(f.lifeInsStartDate)} icon={Calendar} />
                    <InfoField label="End Date" value={formatDate(f.lifeInsEndDate)} icon={Calendar} />
                  </div>)}
                </DetailSection>
                <DetailSection title="Health Insurance" icon={Heart} accent="blue" delay={0.15}>
                  <InfoField label="Status" value={f.healthInsurance ? 'Active' : 'Not Active'} icon={Shield} badge={f.healthInsurance ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                  {f.healthInsurance && (<div className="space-y-0.5 mt-1">
                    <InfoField label="Provider" value={f.healthInsProvider} />
                    <InfoField label="Amount" value={f.healthInsAmount} icon={DollarSign} />
                    <InfoField label="Start Date" value={formatDate(f.healthInsStartDate)} icon={Calendar} />
                    <InfoField label="End Date" value={formatDate(f.healthInsEndDate)} icon={Calendar} />
                  </div>)}
                </DetailSection>
                <DetailSection title="Crop Insurance" icon={Sprout} accent="emerald" delay={0.2}>
                  <InfoField label="Status" value={f.cropInsurance ? 'Active' : 'Not Active'} icon={Shield} badge={f.cropInsurance ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                  {f.cropInsurance && (<div className="space-y-0.5 mt-1">
                    <InfoField label="Provider" value={f.cropInsProvider} />
                    <InfoField label="Crops Covered" value={f.cropInsCrops} />
                    <InfoField label="Area (ha)" value={f.cropInsAreaHa} />
                    <InfoField label="Start Date" value={formatDate(f.cropInsStartDate)} icon={Calendar} />
                    <InfoField label="End Date" value={formatDate(f.cropInsEndDate)} icon={Calendar} />
                  </div>)}
                </DetailSection>
                <DetailSection title="Social Insurance" icon={Users} accent="violet" delay={0.25}>
                  <InfoField label="Status" value={f.socialInsurance ? 'Active' : 'Not Active'} icon={Shield} badge={f.socialInsurance ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                  {f.socialInsurance && (<div className="space-y-0.5 mt-1">
                    <InfoField label="Provider" value={f.socialInsProvider} />
                    <InfoField label="Start Date" value={formatDate(f.socialInsStartDate)} icon={Calendar} />
                    <InfoField label="End Date" value={formatDate(f.socialInsEndDate)} icon={Calendar} />
                  </div>)}
                  <InfoField label="Other Details" value={f.otherInsuranceDetails} />
                </DetailSection>
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}


// ======== FARM LAND DETAIL VIEW ========
function FarmLandDetailView() {
  const { selectedFarmLand, selectedModule, setCurrentView, setSelectedFarmLand, setSelectedCultivation } = useAppStore()
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [qrCode, setQrCode] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!selectedFarmLand) return
    setLoading(true)
    // Generate QR code for public trace page
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/trace?type=farmland&id=${selectedFarmLand.id}&moduleId=${selectedModule?.id || ''}`
      const api = await import('@/lib/api')
      const res = await api.getQRCode(url)
      if (res?.qr) setQrCode(res.qr)
    } catch { /* QR optional */ }
    try {
      const api = await import('@/lib/api')
      const data = await api.getFarmLand(selectedFarmLand!.id)
      setDetail(data)
    } catch (err) {
      console.error('[FarmLandDetail] Failed:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedFarmLand])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
  if (!detail) return null

  const d = detail
  const formatDate = (val: string | null | undefined) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
  const parsePolygon = (geojson: string | null | undefined) => {
    if (!geojson) return null
    try {
      const parsed = JSON.parse(geojson)
      if (parsed.type === 'Polygon' && parsed.coordinates?.[0]) {
        return parsed.coordinates[0].map((c: number[]) => ({ lat: c[1], lng: c[0] }))
      }
    } catch { /* ignore */ }
    return null
  }
  const polygonCoords = parsePolygon(d.eudrGeojson)
  const mapCenter = d.latitude && d.longitude ? { lat: d.latitude, lng: d.longitude } : polygonCoords?.[0] || { lat: 12.5, lng: 108.0 }

  return (
    <AnimatedPage viewKey="farmland-detail">
      <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* HERO HEADER */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
              <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/3" />
            </div>
            <div className="relative z-10 p-5 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => { setCurrentView('farmlands'); setSelectedFarmLand(null) }}
                  className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Back
                </Button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedFarmLand(d); setCurrentView('farmland-form') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </motion.button>
                {/* QR Code Button */}
                {qrCode && (
                  <div className="relative group">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                        <QrCode className="h-3.5 w-3.5" /> QR Trace
                      </button>
                    </motion.div>
                    <div className="absolute right-0 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white rounded-xl shadow-2xl border p-4 w-56">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Scan to view Trace Journey</p>
                        <img src={qrCode} alt="Farm Land Trace QR" className="w-full h-auto rounded-lg" />
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">Sensitive data is hidden</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className="relative shrink-0">
                  {d.farmPhoto ? (
                    <img src={d.farmPhoto} alt={d.farmName} className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover border-4 border-white/20 shadow-xl" />
                  ) : (
                    <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-white/15 backdrop-blur-sm border-4 border-white/20 shadow-xl flex items-center justify-center">
                      <Landmark className="h-10 w-10 text-white/80" />
                    </div>
                  )}
                  <div className="absolute -top-1 -left-1"><PulseDot color="bg-blue-300" size="sm" /></div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{d.farmName}</h1>
                    {d.currentConversionStatus && (
                      <Badge className="bg-amber-400/20 text-amber-100 border border-amber-400/30 hover:bg-amber-400/30">
                        <Award className="h-3 w-3 mr-1" /> {d.currentConversionStatus}
                      </Badge>
                    )}
                  </div>
                  {d.farmer && (
                    <div className="flex items-center gap-2 text-blue-200/80 text-sm mb-3 cursor-pointer hover:text-white" onClick={() => { setSelectedFarmLand(null); if (d.farmer) { const { setSelectedFarmer } = useAppStore.getState(); setSelectedFarmer(d.farmer); setCurrentView('farmer-detail') } }}>
                      <User className="h-3.5 w-3.5" />
                      {d.farmer.fullName}{d.farmer.farmerCode ? ` (${d.farmer.farmerCode})` : ''}
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                    {d.latitude && d.longitude && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</span>}
                    {d.altitude && <span className="flex items-center gap-1"><Mountain className="h-3 w-3" />{d.altitude}m altitude</span>}
                    {d.agroEcologicalZone && <span className="flex items-center gap-1"><TreePine className="h-3 w-3" />{d.agroEcologicalZone}</span>}
                  </div>
                </div>
              </div>
              {/* KPI STRIP */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
                {[
                  { label: 'Total Area', value: d.totalLandHolding ? `${d.totalLandHolding} ha` : '-', icon: MapPin },
                  { label: 'Altitude', value: d.altitude ? `${d.altitude}m` : '-', icon: Mountain },
                  { label: 'Cultivations', value: d.cultivations?.length || d._count?.cultivations || 0, icon: Sprout },
                  { label: 'Soil Analysis', value: d.soilAnalysis?.length || 0, icon: FlaskConical },
                  { label: 'Ownership', value: d.landOwnership || '-', icon: Landmark },
                  { label: 'Water Source', value: d.waterSource || '-', icon: Droplets },
                ].map((kpi, i) => (
                  <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
                    <kpi.icon className="h-3.5 w-3.5 text-white/60 mb-1" />
                    <p className="text-lg font-bold text-white">{kpi.value}</p>
                    <p className="text-[10px] text-white/60 font-medium">{kpi.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* MAP SECTION */}
        {polygonCoords && polygonCoords.length >= 3 && (
          <FadeIn delay={0.25}>
            <DetailSection title="Farm Boundary Map" icon={MapPin} accent="blue" delay={0}>
              <PolygonDisplayMapDynamic center={mapCenter} polygonCoords={polygonCoords} />
            </DetailSection>
          </FadeIn>
        )}

        {/* TABS */}
        <FadeIn delay={0.35}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-auto flex-wrap">
              {[
                { key: 'overview', label: 'Overview', icon: Eye },
                { key: 'land-details', label: 'Land Details', icon: FileText },
                { key: 'soil-irrigation', label: 'Soil & Irrigation', icon: Sprout },
                { key: 'labour', label: 'Labour', icon: Users },
                { key: 'conversion', label: 'Conversion', icon: Award },
                { key: 'soil-analysis', label: 'Soil Analysis', icon: FlaskConical },
              ].map(tab => (
                <TabsTrigger key={tab.key} value={tab.key}
                  className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
                  <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Farm Information" icon={Landmark} accent="blue" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Farm Name" value={d.farmName} icon={Landmark} />
                    <InfoField label="Plot/Block ID" value={d.plotBlockId} icon={Hash } />
                    <InfoField label="Total Land Holding" value={d.totalLandHolding ? `${d.totalLandHolding} ha` : '-'} icon={MapPin} />
                    <InfoField label="Altitude" value={d.altitude ? `${d.altitude}m` : '-'} icon={Mountain} />
                    <InfoField label="Agro-Ecological Zone" value={d.agroEcologicalZone} icon={TreePine} />
                    <InfoField label="GPS" value={d.latitude && d.longitude ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}` : '-'} icon={Globe} />
                    <InfoField label="Conversion Status" value={d.currentConversionStatus} badge={d.currentConversionStatus ? 'bg-blue-100 text-blue-700' : undefined} icon={Award} />
                  </div>
                </DetailSection>
                <DetailSection title="Resources" icon={Droplets} accent="cyan" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Water Source" value={d.waterSource} icon={Droplets} />
                    <InfoField label="Power Source" value={d.powerSource} icon={Zap} />
                    <InfoField label="Land Ownership" value={d.landOwnership} icon={Landmark} />
                    <InfoField label="Approach Road" value={d.approachRoad} icon={Route} />
                  </div>
                </DetailSection>
              </div>
              {d.cultivations && d.cultivations.length > 0 && (
                <DetailSection title={`Cultivations (${d.cultivations.length})`} icon={Coffee} accent="amber" delay={0.2}>
                  <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {d.cultivations.map((c: any) => (
                      <StaggerItem key={c.id}>
                        <motion.div whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)' }}
                          className="relative border rounded-xl p-4 hover:border-amber-200 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50/50"
                          onClick={() => { setSelectedCultivation(c); setCurrentView('cultivation-detail') }}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">{c.farmPlotName || 'Cultivation'}</p>
                              <p className="text-[11px] text-muted-foreground">{c.cultivatedCrop || '-'} {c.cropVariety ? `| ${c.cropVariety}` : ''}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {c.cultivationArea && <Badge variant="outline" className="text-[10px]">{c.cultivationArea} ha</Badge>}
                            {c.harvestSeason && <Badge variant="outline" className="text-[10px]">{c.harvestSeason}</Badge>}
                            {c.treeDensity && <Badge variant="outline" className="text-[10px]">{c.treeDensity} trees/ha</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            {c.harvests && <span>{c.harvests.length} harvests</span>}
                            {c.shadeCover && <span>{c.shadeCover}% shade</span>}
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </DetailSection>
              )}
            </TabsContent>

            {/* LAND DETAILS TAB */}
            <TabsContent value="land-details" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Land Documentation" icon={FileText} accent="blue" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Land Survey No" value={d.landSurveyNo} icon={FileText} />
                    <InfoField label="Red Book Land Title" value={d.redBookLandTitle} icon={FileText} />
                    <InfoField label="Land Ownership" value={d.landOwnership} icon={Landmark} />
                    <InfoField label="Land Document" value={d.landDocument} icon={FileText} />
                  </div>
                </DetailSection>
                <DetailSection title="Land Topography" icon={Mountain} accent="amber" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Approach Road" value={d.approachRoad} icon={Route} />
                    <InfoField label="Land Topology" value={d.landTopology} icon={Mountain} />
                    <InfoField label="Land Gradient" value={d.landGradient} icon={TrendingUp} />
                    <InfoField label="Farm Boundary Plot" value={d.farmBoundaryPlot} icon={MapPin} />
                  </div>
                </DetailSection>
              </div>
              {d.farmPhoto && (
                <DetailSection title="Farm Photo" icon={Landmark} accent="cyan" delay={0.2}>
                  <img src={d.farmPhoto} alt={d.farmName} className="max-w-md rounded-xl border shadow-sm" />
                </DetailSection>
              )}
            </TabsContent>

            {/* SOIL & IRRIGATION TAB */}
            <TabsContent value="soil-irrigation" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Soil Information" icon={Sprout} accent="emerald" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Fertility Status" value={d.fertilityStatus} badge={d.fertilityStatus === 'Good' ? 'bg-emerald-100 text-emerald-700' : d.fertilityStatus === 'Poor' ? 'bg-red-100 text-red-700' : undefined} icon={Sprout} />
                    <InfoField label="Soil Type" value={d.soilType} icon={Globe} />
                    <InfoField label="No. of Trees" value={d.noOfTrees} icon={TreePine} />
                  </div>
                </DetailSection>
                <DetailSection title="Shade Trees" icon={Trees} accent="green" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Shade Tree Species" value={d.shadeTreeSpecies} icon={Trees} />
                    <InfoField label="Shade Tree Density" value={d.shadeTreeDensity} icon={TreePine} />
                    <InfoField label="Shade Tree Cover" value={d.shadeTreeCover ? `${d.shadeTreeCover}%` : '-'} icon={Trees} />
                    <InfoField label="Buffer Zone to Water" value={d.bufferZoneDistanceToWater ? `${d.bufferZoneDistanceToWater}m` : '-'} icon={Droplets} />
                  </div>
                </DetailSection>
                <DetailSection title="Irrigation" icon={Droplets} accent="cyan" delay={0.2}>
                  <div className="space-y-0.5">
                    <InfoField label="Irrigation Source" value={d.irrigationSource} icon={Droplets} />
                    <InfoField label="Irrigation Type" value={d.irrigationType} icon={Droplets} />
                  </div>
                </DetailSection>
              </div>
            </TabsContent>

            {/* LABOUR TAB */}
            <TabsContent value="labour" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Workforce" icon={Users} accent="blue" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Full-time Workers" value={d.fullTimeWorkers} icon={Users} />
                    <InfoField label="Part-time Workers" value={d.partTimeWorkers} icon={Users} />
                    <InfoField label="Seasonal Workers" value={d.seasonalWorkers} icon={Users} />
                    <InfoField label="Family Workers" value={d.familyWorkers} icon={Users} />
                    <InfoField label="Total Workers" value={(d.fullTimeWorkers || 0) + (d.partTimeWorkers || 0) + (d.seasonalWorkers || 0) + (d.familyWorkers || 0)} icon={Users} badge="bg-blue-100 text-blue-700" />
                  </div>
                </DetailSection>
                <DetailSection title="Labour Compliance" icon={Shield} accent="violet" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Child Labour Policy" value={d.childLabourPolicy ? 'Yes' : 'No'} icon={Shield} badge={d.childLabourPolicy ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} />
                    <InfoField label="Minimum Wage Compliance" value={d.minimumWageCompliance ? 'Yes' : 'No'} icon={DollarSign} badge={d.minimumWageCompliance ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} />
                    <InfoField label="PPE Available" value={d.ppeAvailable ? 'Yes' : 'No'} icon={Shield} badge={d.ppeAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                  </div>
                </DetailSection>
              </div>
            </TabsContent>

            {/* CONVERSION TAB */}
            <TabsContent value="conversion" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Conversion Status" icon={Award} accent="amber" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Current Status" value={d.currentConversionStatus} badge={d.currentConversionStatus ? 'bg-amber-100 text-amber-700' : undefined} icon={Award} />
                    <InfoField label="Cert Type" value={d.conversionCertType} icon={BadgeCheck} />
                    <InfoField label="Conversion Date" value={formatDate(d.conversionDate)} icon={Calendar} />
                    <InfoField label="Inspector Name" value={d.inspectorName} icon={ClipboardCheck} />
                    <InfoField label="Qualified" value={d.qualified} icon={CheckCircle2} badge={d.qualified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} />
                    <InfoField label="Remarks" value={d.conversionRemarks} icon={FileText} />
                  </div>
                </DetailSection>
                <DetailSection title="Chemical & Land History" icon={Leaf} accent="emerald" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Last Chemical App Date" value={formatDate(d.lastChemicalAppDate)} icon={Sparkles} />
                    <InfoField label="Conventional Lands" value={d.conventionalLands ? `${d.conventionalLands} ha` : '-'} icon={Landmark} />
                    <InfoField label="Fallow/Pasture Land" value={d.fallowPastureLand ? `${d.fallowPastureLand} ha` : '-'} icon={Landmark} />
                    <InfoField label="Previous Crop History" value={d.previousCropHistory} icon={Wheat} />
                    <InfoField label="Conventional Crops" value={d.conventionalCrops} icon={Sprout} />
                    <InfoField label="Est. Yield" value={d.estYield} icon={TrendingUp} />
                  </div>
                </DetailSection>
              </div>
            </TabsContent>

            {/* SOIL ANALYSIS TAB */}
            <TabsContent value="soil-analysis" className="space-y-5 mt-0">
              <DetailSection title="Soil Analysis Header" icon={FlaskConical} accent="violet" delay={0.1}>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-0.5">
                  <InfoField label="Collection Date" value={formatDate(d.soilCollectionDate)} icon={Calendar} />
                  <InfoField label="Lab Name" value={d.soilLabName} icon={Landmark} />
                  <InfoField label="Lab Test Date" value={formatDate(d.soilLabTestDate)} icon={Calendar} />
                  <InfoField label="Result Date" value={formatDate(d.soilResultDate)} icon={Calendar} />
                  <InfoField label="Samples Info" value={d.soilSamplesInfo} icon={FileText} />
                </div>
              </DetailSection>
              {d.soilAnalysis && d.soilAnalysis.length > 0 && (
                <DetailSection title={`Soil Analysis Records (${d.soilAnalysis.length})`} icon={FlaskConical} accent="emerald" delay={0.15}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-900/10">
                          <TableHead className="text-xs">Criteria</TableHead>
                          <TableHead className="text-xs">Value</TableHead>
                          <TableHead className="text-xs">Unit</TableHead>
                          <TableHead className="text-xs">Min Permissible</TableHead>
                          <TableHead className="text-xs">Max Permissible</TableHead>
                          <TableHead className="text-xs">Organic Matter</TableHead>
                          <TableHead className="text-xs">Heavy Metals</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {d.soilAnalysis.map((sa: any, i: number) => (
                          <TableRow key={sa.id || i} className="transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                            <TableCell className="text-sm font-medium">{sa.criteria || '-'}</TableCell>
                            <TableCell className="text-sm">{sa.criteriaValue || '-'}</TableCell>
                            <TableCell className="text-sm">{sa.unit || '-'}</TableCell>
                            <TableCell className="text-sm">{sa.minPermissible || '-'}</TableCell>
                            <TableCell className="text-sm">{sa.maxPermissible || '-'}</TableCell>
                            <TableCell className="text-sm">{sa.organicMatter ?? '-'}</TableCell>
                            <TableCell className="text-sm">{sa.heavyMetals || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DetailSection>
              )}
              {(!d.soilAnalysis || d.soilAnalysis.length === 0) && (
                <ScaleIn>
                  <div className="text-center py-12 text-muted-foreground">
                    <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No soil analysis records found.</p>
                  </div>
                </ScaleIn>
              )}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

// ======== FARM LANDS LIST VIEW ========
function FarmLandsView() {
  const { selectedModule, setCurrentView, setSelectedFarmLand } = useAppStore()
  const [lands, setLands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedModule) {
      setLoading(true)
      import('@/lib/api').then(api => api.getFarmLands(selectedModule.id)).then(setLands).finally(() => setLoading(false))
    }
  }, [selectedModule])

  return (
    <AnimatedPage viewKey="farmlands">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Farm Lands ({lands.length})</h2>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedFarmLand(null); setCurrentView('farmland-form') }}>
              <Plus className="h-4 w-4 mr-2" /> Add Farm Land
            </Button>
          </div>
        </FadeIn>
        {loading ? <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} className="h-20 w-full" />)}</div> : (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lands.map(l => (
              <StaggerItem key={l.id}>
                <AnimatedCard className="cursor-pointer">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold">{l.farmName}</p>
                          <p className="text-xs text-muted-foreground">{l.farmer?.fullName} ({l.farmer?.farmerCode})</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setSelectedFarmLand(l); setCurrentView('farmland-detail') }} className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors" title="View Details"><Eye className="h-4 w-4" /></motion.button>
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setSelectedFarmLand(l); setCurrentView('farmland-form') }} className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors" title="Edit"><Pencil className="h-4 w-4" /></motion.button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Area:</span> {l.totalLandHolding} ha</div>
                        <div><span className="text-muted-foreground">Ownership:</span> {l.landOwnership}</div>
                        <div><span className="text-muted-foreground">Water:</span> {l.waterSource}</div>
                        <div><span className="text-muted-foreground">Soil:</span> {l.fertilityStatus}</div>
                        <div><span className="text-muted-foreground">Irrigation:</span> {l.irrigationType}</div>
                        <div><span className="text-muted-foreground">Cultivations:</span> {l._count?.cultivations || 0}</div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
            {lands.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No farm lands found. Add one to get started.</div>}
          </StaggerContainer>
        )}
      </div>
    </AnimatedPage>
  )
}

// ======== FARM LAND FORM VIEW ========
function FarmLandFormView() {
  const { selectedModule, selectedFarmLand, setCurrentView } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [farmers, setFarmers] = useState<any[]>([])
  const [polygonCoords, setPolygonCoords] = useState<Array<{lat:number;lng:number}>>([])
  const [form, setForm] = useState<any>({
    farmerId: '', farmName: '', totalLandHolding: '', landOwnership: 'Owned',
    waterSource: '', powerSource: '', fertilityStatus: '', irrigationSource: '',
    irrigationType: '', landTopology: '', landSurveyNo: '', approachRoad: '',
    fullTimeWorkers: '', partTimeWorkers: '', seasonalWorkers: '', familyWorkers: '',
    lastChemicalAppDate: '', conventionalLands: '', fallowPastureLand: '',
    conventionalCrops: '', estYield: '', conversionCertType: '',
    currentConversionStatus: '', inspectorName: '', conversionRemarks: '',
    conversionDate: '', qualified: false,
    soilCollectionDate: '', soilLabTestDate: '', soilResultDate: '', soilSamplesInfo: '',
  })

  useEffect(() => {
    if (selectedModule) {
      import('@/lib/api').then(api => api.getFarmers(selectedModule.id)).then(setFarmers)
    }
  }, [selectedModule])

  useEffect(() => {
    if (selectedFarmLand) {
      setForm(prev => ({ ...prev,
        farmerId: selectedFarmLand.farmerId || '', farmName: selectedFarmLand.farmName || '',
        totalLandHolding: selectedFarmLand.totalLandHolding || '',
        landOwnership: selectedFarmLand.landOwnership || 'Owned',
        waterSource: selectedFarmLand.waterSource || '', powerSource: selectedFarmLand.powerSource || '',
        fertilityStatus: selectedFarmLand.fertilityStatus || '', irrigationSource: selectedFarmLand.irrigationSource || '',
        irrigationType: selectedFarmLand.irrigationType || '', landTopology: selectedFarmLand.landTopology || '',
        landSurveyNo: selectedFarmLand.landSurveyNo || '', fullTimeWorkers: selectedFarmLand.fullTimeWorkers || '',
        partTimeWorkers: selectedFarmLand.partTimeWorkers || '', seasonalWorkers: selectedFarmLand.seasonalWorkers || '',
        familyWorkers: selectedFarmLand.familyWorkers || '', conversionCertType: selectedFarmLand.conversionCertType || '',
        currentConversionStatus: selectedFarmLand.currentConversionStatus || '',
        inspectorName: selectedFarmLand.inspectorName || '',
        conversionRemarks: selectedFarmLand.conversionRemarks || '',
        conversionDate: selectedFarmLand.conversionDate?.split('T')[0] || '',
        qualified: selectedFarmLand.qualified || false,
        lastChemicalAppDate: selectedFarmLand.lastChemicalAppDate?.split('T')[0] || '',
        conventionalLands: selectedFarmLand.conventionalLands || '', estYield: selectedFarmLand.estYield || '',
        soilCollectionDate: selectedFarmLand.soilCollectionDate?.split('T')[0] || '',
        soilLabTestDate: selectedFarmLand.soilLabTestDate?.split('T')[0] || '',
        soilResultDate: selectedFarmLand.soilResultDate?.split('T')[0] || '',
        soilSamplesInfo: selectedFarmLand.soilSamplesInfo || '',
      }))
      // Load existing polygon from eudrGeojson
      if (selectedFarmLand.eudrGeojson) {
        try {
          const parsed = JSON.parse(selectedFarmLand.eudrGeojson)
          if (parsed.type === 'Polygon' && parsed.coordinates?.[0]) {
            setPolygonCoords(parsed.coordinates[0].map((c: number[]) => ({ lat: c[1], lng: c[0] })))
          }
        } catch { /* ignore */ }
      }
    }
  }, [selectedFarmLand])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmerId || !form.farmName) { toast({ title: 'Farmer and Farm Name are required', variant: 'destructive' }); return }
    setLoading(true)
    try {
      const api = await import('@/lib/api')
      const eudrGeojson = polygonCoords.length > 0
        ? JSON.stringify({ type: 'Polygon', coordinates: [polygonCoords.map(c => [c.lng, c.lat])] })
        : selectedFarmLand?.eudrGeojson || null
      const data = { ...form, moduleId: selectedModule!.id, totalLandHolding: parseFloat(form.totalLandHolding) || null, eudrGeojson }
      if (selectedFarmLand) { await api.updateFarmLand(selectedFarmLand.id, data); toast({ title: 'Farm Land updated' }) }
      else { await api.createFarmLand(data); toast({ title: 'Farm Land created' }) }
      setCurrentView('farmlands')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  const FF = (label: string, field: string, type = 'text') => (
    <div className="space-y-1"><Label>{label}</Label><Input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
  )
  const SS = (label: string, field: string, opts: { value: string, label: string }[]) => (
    <div className="space-y-1"><Label>{label}</Label>
      <Select value={form[field]} onValueChange={v => setForm({ ...form, [field]: v })}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>{opts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )

  return (
    <AnimatedPage viewKey="farmland-form">
      <div className="p-4 md:p-6">
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('farmlands')}>← Back</Button>
            <h2 className="text-xl font-bold">{selectedFarmLand ? 'Edit Farm Land' : 'New Farm Land'}</h2>
          </div>
        </FadeIn>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 max-w-4xl">
            <FadeIn delay={0.1}>
              <Card><CardHeader><CardTitle className="text-base">Farm Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Farmer *</Label>
                  <Select value={form.farmerId} onValueChange={v => setForm({ ...form, farmerId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Farmer" /></SelectTrigger>
                    <SelectContent>{farmers.map(f => <SelectItem key={f.id} value={f.id}>{f.fullName} ({f.farmerCode})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Farm/Plot Name *</Label><Input type="text" value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Total Land (ha)</Label><Input type="number" value={form.totalLandHolding} onChange={e => setForm({ ...form, totalLandHolding: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Land Survey No</Label><Input type="text" value={form.landSurveyNo} onChange={e => setForm({ ...form, landSurveyNo: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Land Ownership</Label><Select value={form.landOwnership} onValueChange={v => setForm({ ...form, landOwnership: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Owned">Owned</SelectItem><SelectItem value="Rent">Rent</SelectItem><SelectItem value="Lease">Lease</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Water Source</Label><Select value={form.waterSource} onValueChange={v => setForm({ ...form, waterSource: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Well">Well</SelectItem><SelectItem value="Bore Well">Bore Well</SelectItem><SelectItem value="Pump">Pump</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Power Source</Label><Select value={form.powerSource} onValueChange={v => setForm({ ...form, powerSource: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Solar">Solar</SelectItem><SelectItem value="Electricity">Electricity</SelectItem><SelectItem value="Fuel">Fuel</SelectItem></SelectContent></Select></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card><CardHeader><CardTitle className="text-base">Soil & Irrigation</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Fertility Status</Label><Select value={form.fertilityStatus} onValueChange={v => setForm({ ...form, fertilityStatus: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Good">Good</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Poor">Poor</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Irrigation Type</Label><Select value={form.irrigationType} onValueChange={v => setForm({ ...form, irrigationType: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Drip">Drip</SelectItem><SelectItem value="Canal">Canal</SelectItem><SelectItem value="Rainfed">Rainfed</SelectItem><SelectItem value="Sprinkler">Sprinkler</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Land Topology</Label><Select value={form.landTopology} onValueChange={v => setForm({ ...form, landTopology: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Valley">Valley</SelectItem><SelectItem value="Plains">Plains</SelectItem><SelectItem value="Plateaus">Plateaus</SelectItem></SelectContent></Select></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card><CardHeader><CardTitle className="text-base">Labour</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1"><Label>Full-time Workers</Label><Input type="number" value={form.fullTimeWorkers} onChange={e => setForm({ ...form, fullTimeWorkers: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Part-time Workers</Label><Input type="number" value={form.partTimeWorkers} onChange={e => setForm({ ...form, partTimeWorkers: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Seasonal Workers</Label><Input type="number" value={form.seasonalWorkers} onChange={e => setForm({ ...form, seasonalWorkers: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Family Workers</Label><Input type="number" value={form.familyWorkers} onChange={e => setForm({ ...form, familyWorkers: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Card><CardHeader><CardTitle className="text-base">Conversion & Certification</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Last Chemical App Date</Label><Input type="date" value={form.lastChemicalAppDate} onChange={e => setForm({ ...form, lastChemicalAppDate: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Cert Type</Label><Select value={form.conversionCertType} onValueChange={v => setForm({ ...form, conversionCertType: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="NPOP">NPOP</SelectItem><SelectItem value="NOP">NOP</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Conversion Status</Label><Select value={form.currentConversionStatus} onValueChange={v => setForm({ ...form, currentConversionStatus: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="IC-1">IC-1</SelectItem><SelectItem value="IC-2">IC-2</SelectItem><SelectItem value="IC-3">IC-3</SelectItem><SelectItem value="Organic">Organic</SelectItem><SelectItem value="SRP">SRP</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Conversion Date</Label><Input type="date" value={form.conversionDate} onChange={e => setForm({ ...form, conversionDate: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Inspector Name</Label><Input type="text" value={form.inspectorName} onChange={e => setForm({ ...form, inspectorName: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="flex items-end gap-3 pb-1"><Switch checked={form.qualified} onCheckedChange={v => setForm({ ...form, qualified: v })} /><Label>Qualified</Label></div>
                {form.qualified === false && <div className="sm:col-span-2 lg:col-span-3"><Label>Remarks</Label><Textarea value={form.conversionRemarks} onChange={e => setForm({ ...form, conversionRemarks: e.target.value })} /></div>}
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.5}>
              <Card><CardHeader><CardTitle className="text-base">Soil Analysis</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Collection Date</Label><Input type="date" value={form.soilCollectionDate} onChange={e => setForm({ ...form, soilCollectionDate: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Lab Testing Date</Label><Input type="date" value={form.soilLabTestDate} onChange={e => setForm({ ...form, soilLabTestDate: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Result Date</Label><Input type="date" value={form.soilResultDate} onChange={e => setForm({ ...form, soilResultDate: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="sm:col-span-2 lg:col-span-3"><Label>Samples Info</Label><Textarea value={form.soilSamplesInfo} onChange={e => setForm({ ...form, soilSamplesInfo: e.target.value })} /></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.55}>
              <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> Farm Boundary (Map)</CardTitle><CardDescription className="text-xs">Draw the farm boundary polygon on the map. Click to add points, then click &quot;Finish&quot; to save the shape.</CardDescription></CardHeader><CardContent>
                  <PolygonMapDynamic
                    center={form.latitude && form.longitude ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) } : undefined}
                    existingPolygon={polygonCoords.length > 0 ? polygonCoords : undefined}
                    onPolygonChange={setPolygonCoords}
                  />
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.6}>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setCurrentView('farmlands')}>Cancel</Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedFarmLand ? 'Update' : 'Create'} Farm Land
                </Button>
              </div>
            </FadeIn>
          </div>
        </form>
      </div>
    </AnimatedPage>
  )
}

// ======== CULTIVATION DETAIL VIEW ========
function CultivationDetailView() {
  const { selectedCultivation, selectedModule, setCurrentView, setSelectedCultivation, setSelectedFarmLand, setSelectedFarmer } = useAppStore()
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [qrCode, setQrCode] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!selectedCultivation) return
    setLoading(true)
    // Generate QR code for public trace page
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/trace?type=cultivation&id=${selectedCultivation.id}&moduleId=${selectedModule?.id || ''}`
      const api = await import('@/lib/api')
      const res = await api.getQRCode(url)
      if (res?.qr) setQrCode(res.qr)
    } catch { /* QR optional */ }
    try {
      const api = await import('@/lib/api')
      const data = await api.getCultivation(selectedCultivation!.id)
      setDetail(data)
    } catch (err) {
      console.error('[CultivationDetail] Failed:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCultivation])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
  if (!detail) return null

  const c = detail
  const formatDate = (val: string | null | undefined) => val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

  return (
    <AnimatedPage viewKey="cultivation-detail">
      <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
        {/* HERO HEADER */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
              <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/3" />
            </div>
            <div className="relative z-10 p-5 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={() => { setCurrentView('cultivations'); setSelectedCultivation(null) }}
                  className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Back
                </Button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedCultivation(c); setCurrentView('cultivation-form') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </motion.button>
                {/* QR Code Button */}
                {qrCode && (
                  <div className="relative group">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors">
                        <QrCode className="h-3.5 w-3.5" /> QR Trace
                      </button>
                    </motion.div>
                    <div className="absolute right-0 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white rounded-xl shadow-2xl border p-4 w-56">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Scan to view Trace Journey</p>
                        <img src={qrCode} alt="Cultivation Trace QR" className="w-full h-auto rounded-lg" />
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">Sensitive data is hidden</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className="relative shrink-0">
                  {c.photo ? (
                    <img src={c.photo} alt={c.farmPlotName} className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover border-4 border-white/20 shadow-xl" />
                  ) : (
                    <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-white/15 backdrop-blur-sm border-4 border-white/20 shadow-xl flex items-center justify-center">
                      <Coffee className="h-10 w-10 text-white/80" />
                    </div>
                  )}
                  <div className="absolute -top-1 -left-1"><PulseDot color="bg-amber-300" size="sm" /></div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{c.farmPlotName}</h1>
                    {c.cropCategory && <Badge className="bg-white/10 text-white/80 border border-white/10">{c.cropCategory}</Badge>}
                  </div>
                  <div className="text-amber-200/80 text-sm mb-3">
                    {c.cultivatedCrop || '-'} {c.cropVariety ? `| ${c.cropVariety}` : ''} {c.coffeeSpecies ? `| ${c.coffeeSpecies}` : ''}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                    {c.farmer && (
                      <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => { setSelectedCultivation(null); const { setSelectedFarmer } = useAppStore.getState(); setSelectedFarmer(c.farmer); setCurrentView('farmer-detail') }}>
                        <User className="h-3 w-3" /> {c.farmer.fullName} <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                    {c.farmLand && (
                      <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => { setSelectedCultivation(null); const { setSelectedFarmLand } = useAppStore.getState(); setSelectedFarmLand(c.farmLand); setCurrentView('farmland-detail') }}>
                        <Landmark className="h-3 w-3" /> {c.farmLand.farmName} <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                    {c.latitude && c.longitude && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</span>}
                  </div>
                </div>
              </div>
              {/* KPI STRIP */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6">
                {[
                  { label: 'Area', value: c.cultivationArea ? `${c.cultivationArea} ha` : '-', icon: MapPin },
                  { label: 'Tree Density', value: c.treeDensity ? `${c.treeDensity}/ha` : '-', icon: TreePine },
                  { label: 'Harvests', value: c.harvests?.length || 0, icon: Wheat },
                  { label: 'Shade Cover', value: c.shadeCover ? `${c.shadeCover}%` : '-', icon: Trees },
                  { label: 'Season', value: c.harvestSeason || '-', icon: Calendar },
                ].map((kpi, i) => (
                  <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
                    <kpi.icon className="h-3.5 w-3.5 text-white/60 mb-1" />
                    <p className="text-lg font-bold text-white">{kpi.value}</p>
                    <p className="text-[10px] text-white/60 font-medium">{kpi.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* TABS */}
        <FadeIn delay={0.35}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 h-auto flex-wrap">
              {[
                { key: 'overview', label: 'Overview', icon: Eye },
                { key: 'crop-details', label: 'Crop Details', icon: Sprout },
                { key: 'seed-info', label: 'Seed Information', icon: FlaskConical },
              ].map(tab => (
                <TabsTrigger key={tab.key} value={tab.key}
                  className="rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-1.5">
                  {tab.icon && <tab.icon className="h-3.5 w-3.5" />} {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Cultivation Summary" icon={Coffee} accent="amber" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Plot Name" value={c.farmPlotName} icon={Coffee} />
                    <InfoField label="Plot/Block ID" value={c.plotBlockId} icon={Hash} />
                    <InfoField label="Crop Category" value={c.cropCategory} icon={Sprout} />
                    <InfoField label="Cultivated Crop" value={c.cultivatedCrop} icon={Bean} />
                    <InfoField label="Crop Variety" value={c.cropVariety} icon={Sprout} />
                    <InfoField label="Coffee Species" value={c.coffeeSpecies} icon={Coffee} />
                    <InfoField label="Intercropping" value={c.intercroppingSpecies} icon={Trees} />
                    <InfoField label="GPS" value={c.latitude && c.longitude ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : '-'} icon={Globe} />
                  </div>
                </DetailSection>
                <DetailSection title="Growing Details" icon={Wheat} accent="emerald" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Cultivation Area" value={c.cultivationArea ? `${c.cultivationArea} ha` : '-'} icon={MapPin} />
                    <InfoField label="Planting Spacing" value={c.plantingSpacing} icon={GripVertical} />
                    <InfoField label="Tree Density" value={c.treeDensity ? `${c.treeDensity} trees/ha` : '-'} icon={TreePine} />
                    <InfoField label="Sowing Date" value={formatDate(c.sowingDate)} icon={Calendar} />
                    <InfoField label="Harvest Season" value={c.harvestSeason} icon={Calendar} />
                    <InfoField label="Est. Yield" value={c.estYield} icon={TrendingUp} />
                    <InfoField label="Processing Method" value={c.intendedProcessingMethod} icon={Factory} />
                    <InfoField label="Irrigation Method" value={c.irrigationMethod} icon={Droplets} />
                    <InfoField label="Shade Cover" value={c.shadeCover ? `${c.shadeCover}%` : '-'} icon={Trees} />
                    <InfoField label="Crop Calendar" value={c.cropCalendar} icon={Calendar} />
                  </div>
                </DetailSection>
              </div>

              {/* Farmer Info Card */}
              {c.farmer && (
                <DetailSection title="Farmer" icon={User} accent="blue" delay={0.2}>
                  <div className="flex items-center gap-4 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20 p-2 -m-2 rounded-xl transition-colors" onClick={() => { setSelectedCultivation(null); const { setSelectedFarmer } = useAppStore.getState(); setSelectedFarmer(c.farmer); setCurrentView('farmer-detail') }}>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      {c.farmer.farmerPhoto ? <img src={c.farmer.farmerPhoto} alt={c.farmer.fullName} className="h-12 w-12 rounded-xl object-cover" /> : <User className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{c.farmer.fullName}</p>
                      <p className="text-xs text-muted-foreground">{c.farmer.farmerCode || c.farmer.id.slice(0, 8)} {c.farmer.province ? `| ${c.farmer.province}` : ''}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </DetailSection>
              )}

              {/* FarmLand Info Card */}
              {c.farmLand && (
                <DetailSection title="Farm Land" icon={Landmark} accent="cyan" delay={0.25}>
                  <div className="flex items-center gap-4 cursor-pointer hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 p-2 -m-2 rounded-xl transition-colors" onClick={() => { setSelectedCultivation(null); const { setSelectedFarmLand } = useAppStore.getState(); setSelectedFarmLand(c.farmLand); setCurrentView('farmland-detail') }}>
                    <div className="h-12 w-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
                      <Landmark className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{c.farmLand.farmName}</p>
                      <p className="text-xs text-muted-foreground">{c.farmLand.totalLandHolding ? `${c.farmLand.totalLandHolding} ha` : 'N/A'} | {c.farmLand.landOwnership || 'N/A'} | {c.farmLand.soilType || 'N/A'}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </DetailSection>
              )}

              {/* Harvests List */}
              {c.harvests && c.harvests.length > 0 && (
                <DetailSection title={`Harvests (${c.harvests.length})`} icon={Wheat} accent="amber" delay={0.3}>
                  <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {c.harvests.map((h: any) => (
                      <StaggerItem key={h.id}>
                        <div className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm">{formatDate(h.harvestDate)}</p>
                            {h.quality && <Badge variant="outline" className="text-[10px]">{h.quality}</Badge>}
                          </div>
                          <div className="space-y-1 text-xs">
                            {h.harvestQty && <p className="text-muted-foreground"><span className="font-medium text-foreground">Qty:</span> {h.harvestQty} {h.unit || ''}</p>}
                            {h.processingMethod && <p className="text-muted-foreground"><span className="font-medium text-foreground">Method:</span> {h.processingMethod}</p>}
                            {h.lots && h.lots.length > 0 && <p className="text-muted-foreground"><span className="font-medium text-foreground">Lots:</span> {h.lots.length}</p>}
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </DetailSection>
              )}
            </TabsContent>

            {/* CROP DETAILS TAB */}
            <TabsContent value="crop-details" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Crop Information" icon={Sprout} accent="emerald" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Cultivated Crop" value={c.cultivatedCrop} icon={Bean} />
                    <InfoField label="Crop Category" value={c.cropCategory} icon={Sprout} />
                    <InfoField label="Crop Variety" value={c.cropVariety} icon={Sprout} />
                    <InfoField label="Coffee Species" value={c.coffeeSpecies} icon={Coffee} />
                    <InfoField label="Intercropping Species" value={c.intercroppingSpecies} icon={Trees} />
                    <InfoField label="Harvest Season" value={c.harvestSeason} icon={Calendar} />
                  </div>
                </DetailSection>
                <DetailSection title="Planting & Cultivation" icon={Wheat} accent="amber" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Cultivation Area" value={c.cultivationArea ? `${c.cultivationArea} ha` : '-'} icon={MapPin} />
                    <InfoField label="Planting Spacing" value={c.plantingSpacing} icon={GripVertical} />
                    <InfoField label="Tree Density" value={c.treeDensity ? `${c.treeDensity} trees/ha` : '-'} icon={TreePine} />
                    <InfoField label="Sowing Date" value={formatDate(c.sowingDate)} icon={Calendar} />
                    <InfoField label="Crop Calendar" value={c.cropCalendar} icon={Calendar} />
                    <InfoField label="Est. Yield" value={c.estYield} icon={TrendingUp} />
                    <InfoField label="Intended Processing" value={c.intendedProcessingMethod} icon={Factory} />
                    <InfoField label="Irrigation Method" value={c.irrigationMethod} icon={Droplets} />
                    <InfoField label="Shade Cover" value={c.shadeCover ? `${c.shadeCover}%` : '-'} icon={Trees} />
                  </div>
                </DetailSection>
              </div>
              {c.photo && (
                <DetailSection title="Cultivation Photo" icon={Landmark} accent="cyan" delay={0.2}>
                  <img src={c.photo} alt={c.farmPlotName} className="max-w-md rounded-xl border shadow-sm" />
                </DetailSection>
              )}
            </TabsContent>

            {/* SEED INFORMATION TAB */}
            <TabsContent value="seed-info" className="space-y-5 mt-0">
              <div className="grid md:grid-cols-2 gap-5">
                <DetailSection title="Seed Details" icon={FlaskConical} accent="violet" delay={0.1}>
                  <div className="space-y-0.5">
                    <InfoField label="Seed Source" value={c.seedSource} icon={Sprout} />
                    <InfoField label="Nursery ID" value={c.nurseryId} icon={Landmark} />
                    <InfoField label="Seed Treated" value={c.isSeedTreated ? 'Yes' : 'No'} icon={Shield} badge={c.isSeedTreated ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'} />
                    <InfoField label="Treatment Details" value={c.treatmentDetails} icon={FlaskConical} />
                    <InfoField label="Seed Type" value={c.seedType} icon={Bean} />
                  </div>
                </DetailSection>
                <DetailSection title="Seed Cost" icon={DollarSign} accent="amber" delay={0.15}>
                  <div className="space-y-0.5">
                    <InfoField label="Seed Quantity" value={c.seedQuantity} icon={Scale} />
                    <InfoField label="Seed Price" value={c.seedPrice} icon={DollarSign} />
                    <InfoField label="Seed Cost" value={c.seedCost} icon={DollarSign} />
                  </div>
                </DetailSection>
                <DetailSection title="Sowing Information" icon={Wheat} accent="emerald" delay={0.2}>
                  <div className="space-y-0.5">
                    <InfoField label="Sowing Type" value={c.sowingType} icon={Wheat} />
                    <InfoField label="Sowing Charge By" value={c.sowingChargeBy} icon={Users} />
                    <InfoField label="Sowing Charges" value={c.sowingCharges} icon={DollarSign} />
                    <InfoField label="Sowing Cost" value={c.sowingCost} icon={DollarSign} />
                  </div>
                </DetailSection>
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

// ======== CULTIVATIONS LIST VIEW ========
function CultivationsView() {
  const { selectedModule, setCurrentView, setSelectedCultivation } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedModule) {
      setLoading(true)
      import('@/lib/api').then(api => api.getCultivations(selectedModule.id)).then(setItems).finally(() => setLoading(false))
    }
  }, [selectedModule])

  return (
    <AnimatedPage viewKey="cultivations">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Cultivations ({items.length})</h2>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => { setSelectedCultivation(null); setCurrentView('cultivation-form') }}>
              <Plus className="h-4 w-4 mr-2" /> Add Cultivation
            </Button>
          </div>
        </FadeIn>
        {loading ? <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} className="h-20 w-full" />)}</div> : (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(c => (
              <StaggerItem key={c.id}>
                <AnimatedCard className="cursor-pointer">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-bold">{c.farmPlotName}</p>
                        <div className="flex items-center gap-1">
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setSelectedCultivation(c); setCurrentView('cultivation-detail') }} className="p-1.5 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors" title="View Details"><Eye className="h-4 w-4" /></motion.button>
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setSelectedCultivation(c); setCurrentView('cultivation-form') }} className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors" title="Edit"><Pencil className="h-4 w-4" /></motion.button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div><span className="text-muted-foreground">Area:</span> {c.cultivationArea} ha</div>
                        <div><span className="text-muted-foreground">Season:</span> {c.harvestSeason || '-'}</div>
                        <div><span className="text-muted-foreground">Sowing:</span> {c.sowingDate?.split('T')[0]}</div>
                        <div><span className="text-muted-foreground">Seed:</span> {c.seedSource}</div>
                        <div><span className="text-muted-foreground">Farmer:</span> {c.farmer?.fullName}</div>
                        <div><span className="text-muted-foreground">Plot:</span> {c.farmLand?.farmName}</div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
            {items.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No cultivations found.</div>}
          </StaggerContainer>
        )}
      </div>
    </AnimatedPage>
  )
}

// ======== CULTIVATION FORM VIEW ========
function CultivationFormView() {
  const { selectedModule, selectedCultivation, setCurrentView } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [farmers, setFarmers] = useState<any[]>([])
  const [farmLands, setFarmLands] = useState<any[]>([])
  const [form, setForm] = useState<any>({
    farmerId: '', farmLandId: '', farmPlotName: '', cropCategory: 'Main Crop',
    harvestSeason: '', cultivatedCrop: '', cropVariety: '', cultivationArea: '',
    sowingDate: '', cropCalendar: '', estYield: '', seedSource: '',
    isSeedTreated: false, seedType: '', seedQuantity: '', seedPrice: '',
    seedCost: '', sowingType: '', sowingChargeBy: '', sowingCharges: '', sowingCost: '',
  })

  useEffect(() => {
    if (selectedModule) {
      import('@/lib/api').then(api => {
        api.getFarmers(selectedModule.id).then(setFarmers)
        api.getFarmLands(selectedModule.id).then(setFarmLands)
      })
    }
  }, [selectedModule])

  useEffect(() => {
    if (selectedCultivation) {
      setForm(prev => ({ ...prev,
        farmerId: selectedCultivation.farmerId || '', farmLandId: selectedCultivation.farmLandId || '',
        farmPlotName: selectedCultivation.farmPlotName || '', cropCategory: selectedCultivation.cropCategory || 'Main Crop',
        harvestSeason: selectedCultivation.harvestSeason || '', cultivatedCrop: selectedCultivation.cultivatedCrop || '',
        cropVariety: selectedCultivation.cropVariety || '', cultivationArea: selectedCultivation.cultivationArea || '',
        sowingDate: selectedCultivation.sowingDate?.split('T')[0] || '', estYield: selectedCultivation.estYield || '',
        seedSource: selectedCultivation.seedSource || '', isSeedTreated: selectedCultivation.isSeedTreated || false,
        seedType: selectedCultivation.seedType || '', seedQuantity: selectedCultivation.seedQuantity || '',
        seedPrice: selectedCultivation.seedPrice || '', seedCost: selectedCultivation.seedCost || '',
        sowingType: selectedCultivation.sowingType || '', sowingChargeBy: selectedCultivation.sowingChargeBy || '',
        sowingCharges: selectedCultivation.sowingCharges || '', sowingCost: selectedCultivation.sowingCost || '',
      }))
    }
  }, [selectedCultivation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.farmerId || !form.farmLandId || !form.farmPlotName) { toast({ title: 'Required fields missing', variant: 'destructive' }); return }
    setLoading(true)
    try {
      const api = await import('@/lib/api')
      const data = { ...form, moduleId: selectedModule!.id, cultivationArea: parseFloat(form.cultivationArea) || null }
      if (selectedCultivation) { await api.updateCultivation(selectedCultivation.id, data); toast({ title: 'Cultivation updated' }) }
      else { await api.createCultivation(data); toast({ title: 'Cultivation created' }) }
      setCurrentView('cultivations')
    } catch (err: any) { toast({ title: err.message, variant: 'destructive' }) }
    finally { setLoading(false) }
  }

  const CF = (label: string, field: string, type = 'text', req = false) => (
    <div className="space-y-1"><Label>{label} {req && <span className="text-red-500">*</span>}</Label><Input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={req} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
  )
  const CS = (label: string, field: string, opts: { v: string, l: string }[]) => (
    <div className="space-y-1"><Label>{label}</Label>
      <Select value={form[field]} onValueChange={v => setForm({ ...form, [field]: v })}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>{opts.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )

  const filteredLands = farmLands.filter((l: any) => l.farmerId === form.farmerId)

  return (
    <AnimatedPage viewKey="cultivation-form">
      <div className="p-4 md:p-6">
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('cultivations')}>← Back</Button>
            <h2 className="text-xl font-bold">{selectedCultivation ? 'Edit Cultivation' : 'New Cultivation'}</h2>
          </div>
        </FadeIn>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 max-w-4xl">
            <FadeIn delay={0.1}>
              <Card><CardHeader><CardTitle className="text-base">Cultivation Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Farmer *</Label>
                  <Select value={form.farmerId} onValueChange={v => setForm({ ...form, farmerId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Farmer" /></SelectTrigger>
                    <SelectContent>{farmers.map(f => <SelectItem key={f.id} value={f.id}>{f.fullName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Farm Land *</Label>
                  <Select value={form.farmLandId} onValueChange={v => setForm({ ...form, farmLandId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Plot" /></SelectTrigger>
                    <SelectContent>{filteredLands.map(l => <SelectItem key={l.id} value={l.id}>{l.farmName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Plot Name * <span className="text-red-500">*</span></Label><Input type="text" value={form.farmPlotName} onChange={e => setForm({ ...form, farmPlotName: e.target.value })} required className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Crop Category</Label><Select value={form.cropCategory} onValueChange={v => setForm({ ...form, cropCategory: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Main Crop">Main Crop</SelectItem><SelectItem value="Inter Crop">Inter Crop</SelectItem><SelectItem value="Border Crop">Border Crop</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Cultivated Crop</Label><Input type="text" value={form.cultivatedCrop} onChange={e => setForm({ ...form, cultivatedCrop: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Crop Variety</Label><Input type="text" value={form.cropVariety} onChange={e => setForm({ ...form, cropVariety: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Area (Ha)</Label><Input type="number" value={form.cultivationArea} onChange={e => setForm({ ...form, cultivationArea: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Sowing Date</Label><Input type="date" value={form.sowingDate} onChange={e => setForm({ ...form, sowingDate: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Est. Yield</Label><Input type="text" value={form.estYield} onChange={e => setForm({ ...form, estYield: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card><CardHeader><CardTitle className="text-base">Seed Information</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Seed Source</Label><Select value={form.seedSource} onValueChange={v => setForm({ ...form, seedSource: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Seed Company">Seed Company</SelectItem><SelectItem value="Agent">Agent</SelectItem><SelectItem value="Self-save">Self-save</SelectItem></SelectContent></Select></div>
                <div className="flex items-end gap-3 pb-1"><Switch checked={form.isSeedTreated} onCheckedChange={v => setForm({ ...form, isSeedTreated: v })} /><Label>Seed Treated</Label></div>
                <div className="space-y-1"><Label>Seed Type</Label><Select value={form.seedType} onValueChange={v => setForm({ ...form, seedType: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Certified 1">Certified 1</SelectItem><SelectItem value="Certified 2">Certified 2</SelectItem><SelectItem value="Self-save">Self-save</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Seed Quantity</Label><Input type="number" value={form.seedQuantity} onChange={e => setForm({ ...form, seedQuantity: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Seed Price</Label><Input type="number" value={form.seedPrice} onChange={e => setForm({ ...form, seedPrice: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Seed Cost</Label><Input type="number" value={form.seedCost} onChange={e => setForm({ ...form, seedCost: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Sowing Type</Label><Select value={form.sowingType} onValueChange={v => setForm({ ...form, sowingType: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Row sowing">Row Sowing</SelectItem><SelectItem value="Hand sowing">Hand Sowing</SelectItem><SelectItem value="Drone sowing">Drone Sowing</SelectItem><SelectItem value="Transplanting">Transplanting</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Charge By</Label><Select value={form.sowingChargeBy} onValueChange={v => setForm({ ...form, sowingChargeBy: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="hour">Per Hour</SelectItem><SelectItem value="hectare">Per Hectare</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Sowing Charges</Label><Input type="number" value={form.sowingCharges} onChange={e => setForm({ ...form, sowingCharges: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
                <div className="space-y-1"><Label>Sowing Cost</Label><Input type="number" value={form.sowingCost} onChange={e => setForm({ ...form, sowingCost: e.target.value })} className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20" /></div>
              </CardContent></Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setCurrentView('cultivations')}>Cancel</Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedCultivation ? 'Update' : 'Create'} Cultivation
                </Button>
              </div>
            </FadeIn>
          </div>
        </form>
      </div>
    </AnimatedPage>
  )
}


// ======== BATCHES VIEW (Harvest Traceability) ========
const STAGE_ORDER = ['Harvested', 'Cleaning & Washing', 'Depulping & Fermentation', 'Drying & Hulling', 'Grading & Sorting', 'Roasting & Blending', 'Grinding & Packaging', 'Quality Control', 'Procured', 'Listed']

function BatchesView() {
  const { selectedModule, setCurrentView, setSelectedBatch } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [processingMap, setProcessingMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (selectedModule) {
      setLoading(true)
      Promise.all([
        import('@/lib/api').then(api => api.getHarvestTraceabilities(selectedModule.id)),
        fetch(`/api/processing-stages?moduleId=${selectedModule.id}`).then(r => r.json()),
      ]).then(([harvests, stages]) => {
        setItems(harvests || [])
        const map: Record<string, number> = {}
        ;(stages || []).forEach((s: any) => {
          if (s.batchId) {
            map[s.batchId] = (map[s.batchId] || 0) + 1
          }
        })
        setProcessingMap(map)
      }).finally(() => setLoading(false))
    }
  }, [selectedModule])

  const filtered = items.filter(h => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (h.batchId || '').toLowerCase().includes(q) ||
      (h.farmer?.fullName || '').toLowerCase().includes(q) ||
      (h.coffeeVariety || '').toLowerCase().includes(q) ||
      (h.processingStage || '').toLowerCase().includes(q)
    )
  })

  const getStageProgress = (processingStage: string | null | undefined) => {
    if (!processingStage) return 0
    const idx = STAGE_ORDER.indexOf(processingStage)
    if (idx === -1) return 0
    return idx + 1
  }

  const getStageStatus = (processingStage: string | null | undefined) => {
    const progress = getStageProgress(processingStage)
    if (progress === 0) return { label: 'Harvested', color: 'bg-gray-200 text-gray-700' }
    if (progress >= STAGE_ORDER.length) return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' }
    return { label: 'In Progress', color: 'bg-amber-100 text-amber-700' }
  }

  const handleViewJourney = (batchId: string) => {
    setSelectedBatch({ batchId })
    setCurrentView('trace-journey')
  }

  return (
    <AnimatedPage viewKey="batches">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <div>
            <h2 className="text-2xl font-bold">Batch Traceability</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              View all harvest batches and track their progress through the processing pipeline. Click &apos;View Journey&apos; to see the complete traceability from farm to cup.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches, farmers, varieties..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {filtered.length} batch{filtered.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
        </FadeIn>

        {loading ? <Skeleton className="h-64 w-full" /> : filtered.length === 0 ? (
          <FadeIn delay={0.2}>
            <Card><CardContent className="p-12 text-center text-muted-foreground">
              {items.length === 0
                ? 'No harvest batches yet. Create harvest records to see them here.'
                : 'No batches match your search criteria.'}
            </CardContent></Card>
          </FadeIn>
        ) : (
          <FadeIn delay={0.2}>
            <Card>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[180px]">Batch ID</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Crop / Variety</TableHead>
                      <TableHead>Harvest Date</TableHead>
                      <TableHead>Processing Stage</TableHead>
                      <TableHead className="text-center">Cup Score</TableHead>
                      <TableHead className="text-center">Net Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(h => {
                      const stageProgress = getStageProgress(h.processingStage)
                      const totalStages = STAGE_ORDER.length
                      const pct = Math.min(100, Math.round((stageProgress / totalStages) * 100))
                      const status = getStageStatus(h.processingStage)
                      const displayName = h.farmer?.fullName || 'N/A'
                      const crop = h.cultivation?.cultivatedCrop || 'N/A'
                      const variety = h.coffeeVariety || 'N/A'
                      const harvestDate = h.actualHarvestDate ? new Date(h.actualHarvestDate).toLocaleDateString() : 'N/A'
                      const cupScore = h.cupScore || 'N/A'
                      const weightVal = h.netWeight ?? h.sampleWeight
                      const netWeight = weightVal ? `${weightVal} kg` : 'N/A'
                      const stageLabel = h.processingStage || 'Harvested'
                      const truncatedBatchId = h.batchId && h.batchId.length > 16
                        ? `${h.batchId.slice(0, 16)}...`
                        : h.batchId || 'N/A'

                      return (
                        <TableRow key={h.id}>
                          <TableCell>
                            <span
                              className="font-mono text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded cursor-help"
                              title={h.batchId}
                            >
                              {truncatedBatchId}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{displayName}</TableCell>
                          <TableCell>
                            <span className="text-sm">{crop}</span>
                            {variety !== 'N/A' && <span className="text-xs text-muted-foreground ml-1">/ {variety}</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{harvestDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs whitespace-normal">
                              {stageLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {cupScore !== 'N/A' ? (
                              <span className="font-semibold text-sm">{cupScore}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">{netWeight}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${status.color}`} variant="secondary">
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <Progress value={pct} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1"
                                onClick={() => handleViewJourney(h.batchId)}
                              >
                                <Route className="h-3 w-3" />
                                View Journey
                              </Button>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

// ======== CREDIT SCORE VIEW ========
function CreditScoreView() {
  const { selectedModule } = useAppStore()
  const [farmers, setFarmers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedModule) {
      setLoading(true)
      import('@/lib/api').then(api => api.getFarmers(selectedModule.id)).then(setFarmers).finally(() => setLoading(false))
    }
  }, [selectedModule])

  const scored = farmers.filter(f => f.creditScore).sort((a, b) => (b.creditScore || 0) - (a.creditScore || 0))

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <AnimatedPage viewKey="credit-score">
      <div className="p-4 md:p-6 space-y-4">
        <FadeIn>
          <h2 className="text-2xl font-bold">Credit Score Dashboard</h2>
        </FadeIn>
        {loading ? <Skeleton className="h-64 w-full" /> : (
          <>
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader><CardTitle className="text-sm">Scoring Blueprint</CardTitle></CardHeader>
                <CardContent>
                  <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'Demographics', weight: '15%', factors: 'Age, Education, Marital Status, Family Size' },
                      { label: 'Asset Ownership', weight: '25%', factors: 'Land Area, House Type, Equipment, Livestock' },
                      { label: 'Crop Performance', weight: '25%', factors: 'Crop Type, Yield History, Productivity' },
                      { label: 'Financial Discipline', weight: '35%', factors: 'Loan History, Repayment, Insurance' },
                    ].map(f => (
                      <StaggerItem key={f.label}>
                        <div className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                          <p className="font-medium text-sm">{f.label}</p>
                          <p className="text-emerald-600 font-bold">{f.weight}</p>
                          <p className="text-xs text-muted-foreground mt-1">{f.factors}</p>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </CardContent>
              </Card>
            </FadeIn>
            <StaggerContainer className="space-y-2">
              {scored.map(f => (
                <StaggerItem key={f.id}>
                  <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${getScoreColor(f.creditScore || 0)}`}>
                          {f.creditScore?.toFixed(0)}
                        </div>
                        <div>
                          <p className="font-medium">{f.fullName}</p>
                          <p className="text-xs text-muted-foreground">{f.farmerCode} | {f.province}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full rounded-full ${f.creditScore! >= 80 ? 'bg-emerald-500' : f.creditScore! >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${f.creditScore}%` }} />
                        </div>
                        {f.isCertified && <Badge className="bg-emerald-100 text-emerald-700">Certified</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
              {scored.length === 0 && <div className="text-center py-12 text-muted-foreground">No credit scores available. Register farmers to generate scores.</div>}
            </StaggerContainer>
          </>
        )}
      </div>
    </AnimatedPage>
  )
}

// ======== TRACEABILITY VIEW ========
function TraceabilityView() {
  const { selectedModule, setSelectedBatch, setCurrentView } = useAppStore()
  const { toast } = useToast()
  const [batchInput, setBatchInput] = useState('')
  const [recentBatches, setRecentBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingBatches, setLoadingBatches] = useState(true)

  // Load recent batches
  useEffect(() => {
    if (!selectedModule) return
    setLoadingBatches(true)
    fetch(`/api/harvest-traceabilities?moduleId=${selectedModule.id}&limit=10&isActive=true`)
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : []
        setRecentBatches(items.filter((b: any) => b.batchId).slice(0, 6))
      })
      .catch(() => setRecentBatches([]))
      .finally(() => setLoadingBatches(false))
  }, [selectedModule])

  const handleTrace = async (batchId?: string) => {
    const id = batchId || batchInput.trim()
    if (!id) {
      toast({ title: 'Please enter a batch ID', variant: 'destructive' })
      return
    }
    if (!selectedModule) return

    setLoading(true)
    try {
      // Find the harvest record with the given batchId
      const res = await fetch(`/api/harvest-traceabilities?moduleId=${selectedModule.id}&batchId=${encodeURIComponent(id)}`)
      const data = await res.json()
      const items = Array.isArray(data) ? data : []
      const batch = items.find((b: any) => b.batchId === id) || (items.length > 0 ? items[0] : null)

      if (!batch) {
        toast({ title: 'Batch not found. Try loading sample data first.', variant: 'destructive' })
      } else {
        setSelectedBatch(batch)
        setCurrentView('trace-journey')
      }
    } catch {
      toast({ title: 'Error tracing batch', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const pipelineStages = [
    { stage: 'Farmer', icon: Users, color: 'bg-emerald-100 text-emerald-700' },
    { stage: 'Farm', icon: MapPin, color: 'bg-emerald-100/70 text-emerald-700' },
    { stage: 'Cultivation', icon: Sprout, color: 'bg-green-100 text-green-700' },
    { stage: 'Nursery', icon: Leaf, color: 'bg-lime-100 text-lime-700' },
    { stage: 'Land Prep', icon: Tractor, color: 'bg-lime-50 text-lime-700' },
    { stage: 'Monitoring', icon: BarChart3, color: 'bg-yellow-100 text-yellow-700' },
    { stage: 'Harvest', icon: Wheat, color: 'bg-amber-100 text-amber-700' },
    { stage: 'Processing', icon: Factory, color: 'bg-orange-100 text-orange-700' },
    { stage: 'Procurement', icon: FileText, color: 'bg-purple-100 text-purple-700' },
    { stage: 'Transport', icon: Route, color: 'bg-purple-50 text-purple-700' },
    { stage: 'Market', icon: Store, color: 'bg-rose-100 text-rose-700' },
    { stage: 'Certified', icon: Shield, color: 'bg-cyan-100 text-cyan-700' },
  ]

  return (
    <AnimatedPage viewKey="traceability">
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <FadeIn>
          <div>
            <h2 className="text-2xl font-bold">Trace Journey</h2>
            <p className="text-muted-foreground text-sm mt-1">Enter a batch ID or select a recent batch to view the complete coffee traceability timeline.</p>
          </div>
        </FadeIn>

        {/* Batch Input */}
        <FadeIn delay={0.1}>
          <Card className="border-2 border-dashed border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter Batch ID (e.g., BATCH-XXXX-DK-2025)"
                    className="pl-10 font-mono"
                    value={batchInput}
                    onChange={e => setBatchInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrace()}
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="bg-emerald-700 hover:bg-emerald-800 shrink-0 gap-2"
                    onClick={() => handleTrace()}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
                    Trace Batch
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Pipeline Overview */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Coffee Traceability Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StaggerContainer className="flex items-center gap-1 overflow-x-auto pb-2" staggerDelay={0.04}>
                {pipelineStages.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <StaggerItem key={s.stage}>
                      <div className="flex items-center gap-1 shrink-0">
                        <div className={`flex flex-col items-center gap-1 p-2.5 rounded-lg min-w-[64px] ${s.color}`}>
                          <Icon className="h-4 w-4" />
                          <span className="text-[10px] font-medium leading-tight text-center">{s.stage}</span>
                        </div>
                        {i < pipelineStages.length - 1 && (
                          <motion.svg
                            className="h-4 w-4 text-gray-300 shrink-0"
                            viewBox="0 0 16 16" fill="none"
                            animate={{ x: [0, 2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                          >
                            <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </div>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Recent Batches */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Batches</CardTitle>
              <CardDescription className="text-xs">Click to trace the full journey</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBatches ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : recentBatches.length === 0 ? (
                <div className="text-center py-8">
                  <QrCode className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No batches found.</p>
                  <p className="text-xs text-muted-foreground mt-1">Go to Login and click &quot;Load Full Pipeline Data&quot; to create sample data.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {recentBatches.map((batch) => (
                    <AnimatedCard key={batch.id} className="cursor-pointer">
                      <div
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 group"
                        onClick={() => handleTrace(batch.batchId)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <QrCode className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-medium truncate">{batch.batchId}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="truncate">{batch.farmer?.fullName || '—'}</span>
                              <span className="hidden sm:inline">·</span>
                              <span className="hidden sm:inline truncate">{batch.cultivation?.cultivatedCrop || batch.coffeeVariety || '—'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {batch.cupScore && <Badge variant="outline" className="text-[10px] bg-amber-50 border-amber-200 text-amber-700">Cup {batch.cupScore}</Badge>}
                          <Badge variant="outline" className="text-[10px]">{batch.processingStage || 'Harvested'}</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </AnimatedPage>
  )
}

// ======== MAIN SPA ROUTER ========
export default function Home() {
  const { currentView, selectedModule } = useAppStore()

  const views: Record<string, React.ReactNode> = {
    'module-select': <ModuleSelectView />,
    'login': <LoginView />,
    'register': <RegisterView />,
    'dashboard': <DashboardView />,
    'farmers': <FarmersView />,
    'farmer-form': <FarmerFormView />,
    'farmer-detail': <FarmerDetailView />,
    'farmlands': <FarmLandsView />,
    'farmland-form': <FarmLandFormView />,
    'farmland-detail': <FarmLandDetailView />,
    'cultivations': <CultivationsView />,
    'cultivation-form': <CultivationFormView />,
    'cultivation-detail': <CultivationDetailView />,
    'coffee-inspections': <CoffeeInspectionsView />,
    'batches': <BatchesView />,
    'credit-score': <CreditScoreView />,
    'traceability': <TraceabilityView />,
    'nurseries': <NurseriesView />,
    'nursery-form': <NurseryFormView />,
    'land-preparations': <LandPreparationsView />,
    'land-prep-form': <LandPrepFormView />,
    'crop-monitorings': <CropMonitoringsView />,
    'crop-monitoring-form': <CropMonitoringFormView />,
    'fertilizer-apps': <FertilizerAppsView />,
    'fertilizer-app-form': <FertilizerAppFormView />,
    'pest-disease-mgmts': <PestDiseaseMgmtsView />,
    'pest-disease-mgmt-form': <PestDiseaseMgmtFormView />,
    'harvest-traceabilities': <HarvestTraceabilitiesView />,
    'harvest-trace-form': <HarvestTraceFormView />,
    'smart-contracts': <SmartContractsView />,
    'smart-contract-form': <SmartContractFormView />,
    'marketplace': <MarketplaceView />,
    'marketplace-form': <MarketplaceFormView />,
    'coffee-inspection-form': <CoffeeInspectionFormView />,
    'qr-scan': <QRScanView />,
    'trace-journey': <TraceJourneyView />,
    'qr-label': <QRLabelView />,
    'procurement': <ProcurementView />,
    'procurement-form': <ProcurementFormView />,
    'admin-reports': <AdminReportsView />,
    'cert-assessments': <CertAssessmentsView />,
    'cert-assessment-form': <CertAssessmentFormView />,
    'collection-centres': <CollectionCentresView />,
    'collection-centre-form': <CollectionCentreFormView />,
    'procurement-records': <ProcurementRecordsView />,
    'procurement-record-form': <ProcurementRecordFormView />,
    'procurement-transports': <ProcurementTransportsView />,
    'procurement-transport-form': <ProcurementTransportFormView />,
    'ps-cleaning-washing': <CleaningListView />,
    'ps-cleaning-washing-form': <CleaningFormView />,
    'ps-depulping-fermentation': <DepulpingListView />,
    'ps-depulping-fermentation-form': <DepulpingFormView />,
    'ps-drying-hulling': <DryingListView />,
    'ps-drying-hulling-form': <DryingFormView />,
    'ps-grading-sorting': <GradingListView />,
    'ps-grading-sorting-form': <GradingFormView />,
    'ps-roasting-blending': <RoastingListView />,
    'ps-roasting-blending-form': <RoastingFormView />,
    'ps-grinding-packaging': <GrindingListView />,
    'ps-grinding-packaging-form': <GrindingFormView />,
    'ps-quality-control': <QcSummaryListView />,
    'ps-quality-control-form': <QcSummaryFormView />,
  }

  const showAppShell = currentView !== 'module-select' && currentView !== 'login' && currentView !== 'register'

  return (
    showAppShell ? (
      <AppShell><AnimatedPage viewKey={currentView}>{views[currentView] || <div className="p-6 text-muted-foreground">View not found: {currentView}</div>}</AnimatedPage></AppShell>
    ) : (
      <AnimatedPage viewKey={currentView}>
        {views[currentView] || <div className="p-6 text-muted-foreground">View not found: {currentView}</div>}
      </AnimatedPage>
    )
  )
}