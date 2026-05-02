'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Users, MapPin, Wheat, DollarSign, Award,
  TrendingUp, TrendingDown, Activity, AlertTriangle, Clock,
  PieChart as PieChartIcon, Loader2, ShoppingCart, Store,
  FileCheck, TreePine, ClipboardCheck, Leaf, ShieldCheck,
  ArrowRight, Plus, Search, ChevronRight, Zap, FileWarning,
  CalendarDays, Timer, PackageCheck, Truck, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { formatCurrency } from '@/types'
import type { DashboardStats } from '@/types'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & COLORS
// ═══════════════════════════════════════════════════════════════

const CHART_COLORS = ['#0d9488', '#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516', '#a06b2d', '#2e7d32']

const COFFEE_PALETTE = {
  espresso: '#3a240b',
  roast: '#6d4516',
  caramel: '#8b5a1e',
  latte: '#c9a97e',
  cream: '#f0e6d6',
  green: '#4a7c59',
  teal: '#0d9488',
  amber: '#d97706',
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA — realistic 12-month trends & compliance metrics
// ═══════════════════════════════════════════════════════════════

const MOCK_HARVEST_TRENDS = [
  { month: '2025-05', name: 'May 25', harvests: 18, weight: 4200, procurement: 15, procWeight: 3800, avgCupScore: 82.5 },
  { month: '2025-06', name: 'Jun 25', harvests: 24, weight: 5600, procurement: 20, procWeight: 5100, avgCupScore: 83.1 },
  { month: '2025-07', name: 'Jul 25', harvests: 32, weight: 7800, procurement: 28, procWeight: 7200, avgCupScore: 81.8 },
  { month: '2025-08', name: 'Aug 25', harvests: 28, weight: 6500, procurement: 25, procWeight: 6000, avgCupScore: 84.2 },
  { month: '2025-09', name: 'Sep 25', harvests: 45, weight: 11200, procurement: 40, procWeight: 10500, avgCupScore: 85.6 },
  { month: '2025-10', name: 'Oct 25', harvests: 62, weight: 15800, procurement: 55, procWeight: 14200, avgCupScore: 86.3 },
  { month: '2025-11', name: 'Nov 25', harvests: 78, weight: 19200, procurement: 70, procWeight: 17800, avgCupScore: 84.9 },
  { month: '2025-12', name: 'Dec 25', harvests: 55, weight: 13600, procurement: 48, procWeight: 12500, avgCupScore: 83.5 },
  { month: '2026-01', name: 'Jan 26', harvests: 38, weight: 8900, procurement: 32, procWeight: 8100, avgCupScore: 82.7 },
  { month: '2026-02', name: 'Feb 26', harvests: 22, weight: 5100, procurement: 18, procWeight: 4600, avgCupScore: 83.4 },
  { month: '2026-03', name: 'Mar 26', harvests: 15, weight: 3500, procurement: 12, procWeight: 3100, avgCupScore: 84.1 },
  { month: '2026-04', name: 'Apr 26', harvests: 20, weight: 4800, procurement: 16, procWeight: 4200, avgCupScore: 85.0 },
]

const MOCK_EUDR_COMPLIANCE = [
  { name: 'Compliant', value: 67, color: '#2e7d32' },
  { name: 'Pending Review', value: 21, color: '#d97706' },
  { name: 'Non-Compliant', value: 8, color: '#dc2626' },
  { name: 'Expired', value: 4, color: '#9ca3af' },
]

const MOCK_PROCESSING_PIPELINE = [
  { stageType: 'Harvesting', count: 156 },
  { stageType: 'Pulping', count: 132 },
  { stageType: 'Fermentation', count: 118 },
  { stageType: 'Washing', count: 105 },
  { stageType: 'Drying', count: 98 },
  { stageType: 'Hulling', count: 87 },
  { stageType: 'Sorting', count: 76 },
  { stageType: 'Roasting', count: 52 },
  { stageType: 'Packaging', count: 41 },
  { stageType: 'Export', count: 28 },
]

const MOCK_REVENUE_BY_BUYER = [
  { buyer: 'Neue Kaffee GmbH', revenue: 480000000 },
  { buyer: 'Terra Rossa Srl', revenue: 380000000 },
  { buyer: 'Nordic Bean AB', revenue: 290000000 },
  { buyer: 'Café Direct Ltd', revenue: 220000000 },
  { buyer: 'Bean Brothers Co', revenue: 180000000 },
  { buyer: 'Alpine Roast AG', revenue: 140000000 },
]

const MOCK_FARMERS_BY_PROVINCE = [
  { province: 'Dak Lak', count: 186 },
  { province: 'Lam Dong', count: 142 },
  { province: 'Gia Lai', count: 98 },
  { province: 'Dak Nong', count: 74 },
  { province: 'Kon Tum', count: 51 },
]

const MOCK_RECENT_ACTIVITY = [
  { id: '1', type: 'procurement', action: 'Procurement completed', entity: 'Lot #PRC-2026-0892 — 450kg Robusta', time: '5 min ago' },
  { id: '2', type: 'inspection', action: 'QC inspection passed', entity: 'Batch #B-4419 — Score: 86.5', time: '22 min ago' },
  { id: '3', type: 'farmer', action: 'New farmer registered', entity: 'Nguyễn Văn Minh — Dak Lak', time: '1 hr ago' },
  { id: '4', type: 'contract', action: 'Smart contract executed', entity: 'SC-2026-0344 — 2.4T shipment', time: '2 hrs ago' },
  { id: '5', type: 'alert', action: 'EUDR expiry warning', entity: 'Farm F-1087 — Expires in 14 days', time: '3 hrs ago' },
  { id: '6', type: 'procurement', action: 'Payment processed', entity: 'Lot #PRC-2026-0891 — ₫38.5M', time: '4 hrs ago' },
  { id: '7', type: 'inspection', action: 'Certification renewed', entity: 'UTZ Cert — Farm F-0923', time: '5 hrs ago' },
  { id: '8', type: 'farmer', action: 'Farm area updated', entity: 'Trần Thị Lan — +2.5 ha in Lam Dong', time: '6 hrs ago' },
  { id: '9', type: 'contract', action: 'Contract amendment', entity: 'SC-2026-0298 — Price adjustment', time: '8 hrs ago' },
  { id: '10', type: 'alert', action: 'Quality threshold breach', entity: 'Cup score below 75 — Lot #PRC-2026-0888', time: '10 hrs ago' },
]

// ═══════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1500
    const stepTime = 20
    const steps = duration / stepTime
    const increment = end / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

/** Mini sparkline — lightweight SVG polyline from a data array */
function Sparkline({ data, color = '#0d9488', width = 80, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Radial progress ring for quality score */
function RadialScore({ value, max = 100, size = 56, strokeWidth = 5 }: { value: number; max?: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(value / max, 1)
  const offset = circumference - progress * circumference
  const color = value >= 85 ? '#2e7d32' : value >= 75 ? '#0d9488' : value >= 60 ? '#d97706' : '#dc2626'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/30" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
    </svg>
  )
}

function TrendIndicator({ value, label }: { value: number; label?: string }) {
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value).toFixed(1)}%
      {label && <span className="text-muted-foreground font-normal ml-0.5">{label}</span>}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t2 } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router, fetchStats])

  // ═══ Loading State ═══
  if (status === 'loading' || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading dashboard...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!session) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-foreground" />
            <span className="text-sm text-foreground">{t2('Đang chuyển hướng...', 'Redirecting...')}</span>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const userName = session.user?.name || 'User'
  const userRole = (session.user?.role || '').replace(/_/g, ' ')
  const currency = session.user?.currency || 'VND'

  // Derive KPI values — use API data if available, else sensible defaults
  const totalRevenue = stats?.totalPurchaseAmount || 2850000000
  const totalFarmers = stats?.totalFarmers || 551
  const farmArea = stats?.totalLandArea || 1284.5
  const harvestVolume = stats?.totalCherryWeight || 94800
  const avgPrice = stats?.avgPricePerKg || 48500
  const qualityScore = stats?.avgCupScore || 83.6

  // ═══ Primary KPIs ═══
  const primaryKPIs = [
    {
      title: t2('Tổng doanh thu', 'Total Revenue'),
      value: totalRevenue,
      icon: DollarSign,
      format: 'currency' as const,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 12.4,
      sparkData: [42, 48, 52, 58, 55, 62, 68, 72, 78, 82, 88, 95],
      sparkColor: '#10b981',
    },
    {
      title: t2('Tổng nông dân', 'Total Farmers'),
      value: totalFarmers,
      icon: Users,
      format: 'number' as const,
      iconBg: 'bg-teal-100 dark:bg-teal-950',
      iconColor: 'text-teal-600 dark:text-teal-400',
      trend: 8.2,
      sparkData: [380, 395, 410, 425, 440, 458, 472, 490, 510, 525, 540, 551],
      sparkColor: '#0d9488',
    },
    {
      title: t2('Diện tích (ha)', 'Farm Area (ha)'),
      value: farmArea,
      icon: MapPin,
      format: 'decimal' as const,
      iconBg: 'bg-amber-100 dark:bg-amber-950',
      iconColor: 'text-amber-600 dark:text-amber-400',
      trend: 5.6,
      sparkData: [980, 1000, 1040, 1080, 1100, 1130, 1160, 1190, 1220, 1250, 1265, 1284],
      sparkColor: '#d97706',
    },
    {
      title: t2('Sản lượng (kg)', 'Harvest Volume (kg)'),
      value: harvestVolume,
      icon: Wheat,
      format: 'number' as const,
      iconBg: 'bg-coffee-100 dark:bg-coffee-900',
      iconColor: 'text-coffee-600 dark:text-coffee-400',
      trend: -3.1,
      sparkData: [12000, 10500, 8900, 7800, 6500, 5100, 4800, 8900, 11200, 13600, 15800, 94800],
      sparkColor: '#8b5a1e',
    },
    {
      title: t2('Giá TB/kg', 'Avg Price/kg'),
      value: avgPrice,
      icon: TrendingUp,
      format: 'currency' as const,
      iconBg: 'bg-sky-100 dark:bg-sky-950',
      iconColor: 'text-sky-600 dark:text-sky-400',
      trend: 6.8,
      sparkData: [42000, 43000, 44000, 44500, 45000, 45500, 46000, 47000, 47500, 48000, 48200, 48500],
      sparkColor: '#0284c7',
    },
    {
      title: t2('Điểm chất lượng', 'Quality Score'),
      value: qualityScore,
      icon: Award,
      format: 'score' as const,
      iconBg: 'bg-rose-100 dark:bg-rose-950',
      iconColor: 'text-rose-600 dark:text-rose-400',
      trend: 2.1,
      sparkData: [80.2, 81.0, 81.5, 82.1, 82.4, 82.8, 83.0, 83.3, 83.5, 83.8, 84.0, 83.6],
      sparkColor: '#e11d48',
    },
  ]

  // Use API harvest trends if available, else mock
  const harvestTrends = (stats?.harvestTrends && stats.harvestTrends.length > 0)
    ? stats.harvestTrends
    : MOCK_HARVEST_TRENDS

  // Merge procurement data into trend chart
  const mergedTrends = harvestTrends.map((h, i) => ({
    ...h,
    procurement: MOCK_HARVEST_TRENDS[i]?.procurement || Math.round(h.harvests * 0.85),
    procWeight: MOCK_HARVEST_TRENDS[i]?.procWeight || Math.round(h.weight * 0.9),
  }))

  // EUDR data
  const eudrComplianceRate = 67
  const eudrPendingAssessments = 21
  const eudrHighRisk = 8
  const eudrExpiringSoon = 12

  // Processing pipeline
  const pipelineData = (stats?.processingByStage && stats.processingByStage.length > 0)
    ? stats.processingByStage.map(s => ({ stageType: s.stageType, count: s._count.stageType }))
    : MOCK_PROCESSING_PIPELINE

  // Province data
  const provinceData = (stats?.farmersPerProvince && stats.farmersPerProvince.length > 0)
    ? stats.farmersPerProvince.map(fp => ({ province: fp.province || 'Other', count: fp._count.province }))
    : MOCK_FARMERS_BY_PROVINCE

  // Activity feed
  const activityFeed = (stats?.recentActivity && stats.recentActivity.length > 0)
    ? stats.recentActivity
    : MOCK_RECENT_ACTIVITY

  // ═══ RENDER ═══
  return (
    <DashboardShell>
      <StaggerContainer className="space-y-6">

        {/* ═══════════════════════════════════════════════════════════
            SECTION 1: WELCOME HEADER
        ═══════════════════════════════════════════════════════════ */}
        <StaggerItem>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {t2(`Xin chào, ${userName}`, `Welcome back, ${userName}`)}
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] capitalize font-normal">
                  {userRole}
                </Badge>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/harvest')}>
                <Plus className="w-3.5 h-3.5" />
                {t2('Thu hoạch mới', 'New Harvest')}
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/procurement')}>
                <ShoppingCart className="w-3.5 h-3.5" />
                {t2('Thu mua mới', 'New Procurement')}
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/traceability')}>
                <Search className="w-3.5 h-3.5" />
                {t2('Truy xuất lô', 'Trace Batch')}
              </Button>
            </div>
          </div>
        </StaggerItem>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 2: PRIMARY KPI ROW
        ═══════════════════════════════════════════════════════════ */}
        <StaggerItem>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {primaryKPIs.map((kpi, i) => (
              <MotionCard
                key={i}
                {...hoverScale}
                className="rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-default"
              >
                <CardContent className="p-4 space-y-2">
                  {/* Icon + Trend row */}
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                      <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                    </div>
                    <TrendIndicator value={kpi.trend} />
                  </div>

                  {/* Value */}
                  <div>
                    <p className="text-lg md:text-xl font-bold text-foreground leading-none">
                      {kpi.format === 'currency' ? (
                        <AnimatedCounter value={kpi.value} prefix="" suffix=" ₫" />
                      ) : kpi.format === 'score' ? (
                        <span>{kpi.value.toFixed(1)}<span className="text-xs text-muted-foreground font-normal">/100</span></span>
                      ) : kpi.format === 'decimal' ? (
                        <>{kpi.value.toFixed(1)}<span className="text-xs text-muted-foreground font-normal ml-0.5">ha</span></>
                      ) : (
                        <AnimatedCounter value={kpi.value} />
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.title}</p>
                  </div>

                  {/* Sparkline */}
                  <div className="pt-1">
                    <Sparkline data={kpi.sparkData} color={kpi.sparkColor} width={100} height={24} />
                  </div>
                </CardContent>
              </MotionCard>
            ))}
          </div>
        </StaggerItem>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 3: CHARTS — 2×2 GRID
        ═══════════════════════════════════════════════════════════ */}
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

            {/* 3A: Supply Chain Trends — AreaChart */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    {t2('Xu hướng chuỗi cung ứng', 'Supply Chain Trends')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">12 {t2('tháng', 'months')}</Badge>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground">
                  {t2('Thu hoạch & thu mua hàng tháng', 'Monthly harvests & procurement')}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={mergedTrends}>
                    <defs>
                      <linearGradient id="gradHarvests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradProcurement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5a1e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5a1e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontFamily: 'var(--font-space-mono), monospace' }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'var(--font-space-mono), monospace' }} />
                    <Area type="monotone" dataKey="harvests" stroke="#0d9488" fillOpacity={1} fill="url(#gradHarvests)" name={t2('Thu hoạch', 'Harvests')} strokeWidth={2} />
                    <Area type="monotone" dataKey="procurement" stroke="#8b5a1e" fillOpacity={1} fill="url(#gradProcurement)" name={t2('Thu mua', 'Procurement')} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 3B: EUDR Compliance Status — DonutChart */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    {t2('Tuân thủ EUDR', 'EUDR Compliance Status')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">
                    {MOCK_EUDR_COMPLIANCE.reduce((s, c) => s + c.value, 0)} {t2('hồ sơ', 'records')}
                  </Badge>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground">
                  {t2('Phân bố trạng thái tuân thủ', 'Compliance status distribution')}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={MOCK_EUDR_COMPLIANCE}
                          cx="50%"
                          cy="50%"
                          outerRadius={95}
                          innerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {MOCK_EUDR_COMPLIANCE.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 12, fontFamily: 'var(--font-space-mono), monospace' }}
                          formatter={(value: any, name: any) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 min-w-[120px]">
                    {MOCK_EUDR_COMPLIANCE.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground leading-tight truncate">{entry.name}</p>
                          <p className="text-xs font-bold text-foreground">{entry.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3C: Processing Pipeline — Horizontal BarChart */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    {t2('Quy trình chế biến', 'Processing Pipeline')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">
                    {pipelineData.reduce((s, p) => s + p.count, 0)} {t2('tổng', 'total')}
                  </Badge>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground">
                  {t2('Số lượng theo giai đoạn', 'Count by processing stage')}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pipelineData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis type="number" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <YAxis dataKey="stageType" type="category" tick={{ fontSize: 9 }} className="fill-muted-foreground" width={80} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontFamily: 'var(--font-space-mono), monospace' }} />
                    <Bar dataKey="count" name={t2('Số lượng', 'Count')} radius={[0, 6, 6, 0]} maxBarSize={18}>
                      {pipelineData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 3D: Revenue by Buyer — BarChart */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    {t2('Doanh thu theo người mua', 'Revenue by Buyer')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">Top 6</Badge>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground">
                  {t2('Doanh thu VND theo nhà mua hàng', 'Revenue in VND by buyer')}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MOCK_REVENUE_BY_BUYER} margin={{ bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="buyer" tick={{ fontSize: 8 }} className="fill-muted-foreground" angle={-15} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 12, fontFamily: 'var(--font-space-mono), monospace' }}
                      formatter={(value: any) => [formatCurrency(Number(value), currency), t2('Doanh thu', 'Revenue')]}
                    />
                    <Bar dataKey="revenue" name={t2('Doanh thu', 'Revenue')} radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {MOCK_REVENUE_BY_BUYER.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 4: SECONDARY — Activity Feed + Farmers by Province
        ═══════════════════════════════════════════════════════════ */}
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

            {/* 4A: Recent Activity Feed */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {t2('Hoạt động gần đây', 'Recent Activity')}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-[10px] text-primary h-7 gap-1 rounded-xl">
                    {t2('Xem tất cả', 'View all')}
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ScrollArea className="h-[340px] pr-2">
                  <div className="space-y-1">
                    {activityFeed.map((activity) => {
                      const typeColors: Record<string, string> = {
                        procurement: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                        inspection: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
                        farmer: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
                        contract: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                        alert: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                      }
                      const typeIcons: Record<string, typeof Activity> = {
                        procurement: ShoppingCart,
                        inspection: ClipboardCheck,
                        farmer: Users,
                        contract: FileCheck,
                        alert: AlertTriangle,
                      }
                      const Icon = typeIcons[activity.type] || Activity
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[activity.type] || 'bg-muted text-muted-foreground'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground leading-tight">{activity.action}</p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{activity.entity}</p>
                            <p className="text-[9px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                              <Timer className="w-2.5 h-2.5" />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* 4B: Farmers by Province — BarChart with geographic context */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t2('Nông dân theo tỉnh', 'Farmers by Province')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">
                    {t2('Tây Nguyên', 'Central Highlands')}
                  </Badge>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground">
                  {t2('Phân bố nông dân theo tỉnh', 'Farmer distribution across provinces')}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={provinceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="province" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontFamily: 'var(--font-space-mono), monospace' }} />
                    <Bar dataKey="count" name={t2('Nông dân', 'Farmers')} radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {provinceData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Province summary pills */}
                <div className="flex flex-wrap gap-2 mt-3 px-1">
                  {provinceData.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent/50 text-[10px]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="font-medium text-foreground">{p.province}</span>
                      <span className="text-muted-foreground">{p.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 5 & 6: QUICK ACTIONS + EUDR COMPLIANCE OVERVIEW
        ═══════════════════════════════════════════════════════════ */}
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

            {/* 5: Quick Actions Panel */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow lg:col-span-1">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  {t2('Thao tác nhanh', 'Quick Actions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { icon: Wheat, label: t2('Ghi nhận thu hoạch', 'Record Harvest'), href: '/harvest', count: 0, countLabel: '' },
                  { icon: ShoppingCart, label: t2('Tạo đơn thu mua', 'Create Procurement'), href: '/procurement', count: stats?.procurementPendingCount || 0, countLabel: t2('chờ xử lý', 'pending') },
                  { icon: PackageCheck, label: t2('Chế biến lô mới', 'Process Batch'), href: '/processing/wizard', count: 0, countLabel: '' },
                  { icon: Truck, label: t2('Tạo vận chuyển', 'Create Shipment'), href: '/shipments', count: 0, countLabel: '' },
                  { icon: FileCheck, label: t2('Đánh giá chứng nhận', 'Cert Assessment'), href: '/cert-assessments', count: 0, countLabel: '' },
                  { icon: Eye, label: t2('Xem truy xuất nguồn gốc', 'View Traceability'), href: '/traceability', count: 0, countLabel: '' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(action.href)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground flex-1">{action.label}</span>
                    {action.count > 0 && (
                      <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                        {action.count} {action.countLabel}
                      </Badge>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}

                <Separator className="my-2" />

                {/* Pending items summary */}
                <div className="space-y-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                  <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    {t2('Mục chờ xử lý', 'Pending Items')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{eudrPendingAssessments}</p>
                      <p className="text-[9px] text-amber-600 dark:text-amber-400">{t2('EUDR chờ duyệt', 'EUDR Pending')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats?.procurementPendingCount || 5}</p>
                      <p className="text-[9px] text-amber-600 dark:text-amber-400">{t2('Thu mua chờ', 'Proc. Pending')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6: EUDR Compliance Overview */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {t2('Tổng quan tuân thủ EUDR', 'EUDR Compliance Overview')}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 gap-1.5 rounded-xl"
                    onClick={() => router.push('/eudr-compliance')}
                  >
                    {t2('Xem chi tiết', 'Full Details')}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground">
                  {t2('EU Quy định chống phá rừng — Báo cáo tuân thủ', 'EU Deforestation Regulation — Compliance report')}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-5">
                {/* Compliance Rate Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {t2('Tỷ lệ tuân thủ', 'Compliance Rate')}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{eudrComplianceRate}%</span>
                  </div>
                  <Progress value={eudrComplianceRate} className="h-3 rounded-full" />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>{t2('Mục tiêu: 85%', 'Target: 85%')}</span>
                    <span className={eudrComplianceRate >= 85 ? 'text-emerald-600' : 'text-amber-600'}>
                      {eudrComplianceRate >= 85
                        ? t2('Đạt mục tiêu ✓', 'Target met ✓')
                        : t2('Còn thiếu 18%', '18% below target')}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Compliant */}
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">{t2('Tuân thủ', 'Compliant')}</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">67</p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{t2('hồ sơ', 'records')}</p>
                  </div>

                  {/* Pending */}
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">{t2('Chờ xét duyệt', 'Pending Review')}</span>
                    </div>
                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{eudrPendingAssessments}</p>
                    <p className="text-[9px] text-amber-600 dark:text-amber-400">{t2('hồ sơ', 'records')}</p>
                  </div>

                  {/* High Risk */}
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-[10px] text-red-700 dark:text-red-300 font-medium">{t2('Rủi ro cao', 'High Risk')}</span>
                    </div>
                    <p className="text-xl font-bold text-red-700 dark:text-red-300">{eudrHighRisk}</p>
                    <p className="text-[9px] text-red-600 dark:text-red-400">{t2('cần hành động', 'need action')}</p>
                  </div>

                  {/* Expiring Soon */}
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/50 dark:border-sky-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <FileWarning className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span className="text-[10px] text-sky-700 dark:text-sky-300 font-medium">{t2('Sắp hết hạn', 'Expiring Soon')}</span>
                    </div>
                    <p className="text-xl font-bold text-sky-700 dark:text-sky-300">{eudrExpiringSoon}</p>
                    <p className="text-[9px] text-sky-600 dark:text-sky-400">{t2('trong 30 ngày', 'within 30 days')}</p>
                  </div>
                </div>

                {/* Recent EUDR Actions */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t2('Hành động gần đây', 'Recent EUDR Actions')}
                  </p>
                  {[
                    { text: t2('Đánh giá tuân thủ cho Farm F-1087 đã hoàn thành', 'Compliance assessment for Farm F-1087 completed'), status: 'compliant', time: '2 hrs ago' },
                    { text: t2('Farm F-0923 cần cập nhật giấy tờ EUDR', 'Farm F-0923 requires EUDR documentation update'), status: 'pending', time: '5 hrs ago' },
                    { text: t2('Chứng nhận Farm F-0456 hết hạn trong 14 ngày', 'Farm F-0456 certification expires in 14 days'), status: 'expiring', time: '1 day ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        item.status === 'compliant' ? 'bg-emerald-500' :
                        item.status === 'pending' ? 'bg-amber-500' : 'bg-sky-500'
                      }`} />
                      <p className="text-[10px] text-foreground flex-1 leading-tight">{item.text}</p>
                      <span className="text-[9px] text-muted-foreground shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </StaggerItem>

        {/* ═══════════════════════════════════════════════════════════
            FOOTER SPACER
        ═══════════════════════════════════════════════════════════ */}
        <div className="h-4" />
      </StaggerContainer>
    </DashboardShell>
  )
}
