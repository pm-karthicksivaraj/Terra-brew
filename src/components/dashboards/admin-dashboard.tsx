'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Users, MapPin, Wheat, DollarSign, Award,
  TrendingUp, TrendingDown, Activity, AlertTriangle,
  ShieldCheck, Zap, Loader2, ShoppingCart,
  FileCheck, TreePine, ClipboardCheck,
  Clock, ChevronRight, Eye,
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
import { MotionCard, hoverScale } from '@/components/ui/motion'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { formatCurrency } from '@/types'
import type { DashboardStats } from '@/types'

const CHART_COLORS = ['#0d9488', '#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516', '#a06b2d', '#2e7d32']

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

const MOCK_REVENUE_BY_BUYER = [
  { buyer: 'Neue Kaffee GmbH', revenue: 480000000 },
  { buyer: 'Terra Rossa Srl', revenue: 380000000 },
  { buyer: 'Nordic Bean AB', revenue: 290000000 },
  { buyer: 'Café Direct Ltd', revenue: 220000000 },
  { buyer: 'Bean Brothers Co', revenue: 180000000 },
  { buyer: 'Alpine Roast AG', revenue: 140000000 },
]

const MOCK_RECENT_ACTIVITY = [
  { id: '1', type: 'procurement', action: 'Procurement completed', entity: 'Lot #PRC-2026-0892 — 450kg Robusta', time: '5 min ago' },
  { id: '2', type: 'inspection', action: 'QC inspection passed', entity: 'Batch #B-4419 — Score: 86.5', time: '22 min ago' },
  { id: '3', type: 'farmer', action: 'New farmer registered', entity: 'Nguyễn Văn Minh — Dak Lak', time: '1 hr ago' },
  { id: '4', type: 'contract', action: 'Smart contract executed', entity: 'SC-2026-0344 — 2.4T shipment', time: '2 hrs ago' },
  { id: '5', type: 'alert', action: 'EUDR expiry warning', entity: 'Farm F-1087 — Expires in 14 days', time: '3 hrs ago' },
  { id: '6', type: 'procurement', action: 'Payment processed', entity: 'Lot #PRC-2026-0891 — ₫38.5M', time: '4 hrs ago' },
]

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

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { t2 } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const totalRevenue = stats?.totalPurchaseAmount || 2850000000
  const totalFarmers = stats?.totalFarmers || 551
  const farmArea = stats?.totalLandArea || 1284.5
  const harvestVolume = stats?.totalCherryWeight || 94800
  const avgPrice = stats?.avgPricePerKg || 48500
  const qualityScore = stats?.avgCupScore || 83.6
  const currency = 'VND'

  const primaryKPIs = [
    { title: t2('Tổng doanh thu', 'Total Revenue'), value: totalRevenue, icon: DollarSign, format: 'currency' as const, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400', trend: 12.4, sparkData: [42, 48, 52, 58, 55, 62, 68, 72, 78, 82, 88, 95], sparkColor: '#10b981' },
    { title: t2('Tổng nông dân', 'Total Farmers'), value: totalFarmers, icon: Users, format: 'number' as const, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400', trend: 8.2, sparkData: [380, 395, 410, 425, 440, 458, 472, 490, 510, 525, 540, 551], sparkColor: '#0d9488' },
    { title: t2('Diện tích (ha)', 'Farm Area (ha)'), value: farmArea, icon: MapPin, format: 'decimal' as const, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400', trend: 5.6, sparkData: [980, 1000, 1040, 1080, 1100, 1130, 1160, 1190, 1220, 1250, 1265, 1284], sparkColor: '#d97706' },
    { title: t2('Sản lượng (kg)', 'Harvest Volume (kg)'), value: harvestVolume, icon: Wheat, format: 'number' as const, iconBg: 'bg-orange-100 dark:bg-orange-950', iconColor: 'text-orange-600 dark:text-orange-400', trend: -3.1, sparkData: [12000, 10500, 8900, 7800, 6500, 5100, 4800, 8900, 11200, 13600, 15800, 94800], sparkColor: '#8b5a1e' },
    { title: t2('Giá TB/kg', 'Avg Price/kg'), value: avgPrice, icon: TrendingUp, format: 'currency' as const, iconBg: 'bg-cyan-100 dark:bg-cyan-950', iconColor: 'text-cyan-600 dark:text-cyan-400', trend: 6.8, sparkData: [42000, 43000, 44000, 44500, 45000, 45500, 46000, 47000, 47500, 48000, 48200, 48500], sparkColor: '#06b6d4' },
    { title: t2('Điểm chất lượng', 'Quality Score'), value: qualityScore, icon: Award, format: 'score' as const, iconBg: 'bg-rose-100 dark:bg-rose-950', iconColor: 'text-rose-600 dark:text-rose-400', trend: 2.1, sparkData: [80.2, 81.0, 81.5, 82.1, 82.4, 82.8, 83.0, 83.3, 83.5, 83.8, 84.0, 83.6], sparkColor: '#e11d48' },
  ]

  const harvestTrends = (stats?.harvestTrends && stats.harvestTrends.length > 0) ? stats.harvestTrends : MOCK_HARVEST_TRENDS
  const mergedTrends = harvestTrends.map((h, i) => ({
    ...h,
    procurement: MOCK_HARVEST_TRENDS[i]?.procurement || Math.round(h.harvests * 0.85),
    procWeight: MOCK_HARVEST_TRENDS[i]?.procWeight || Math.round(h.weight * 0.9),
  }))
  const activityFeed = (stats?.recentActivity && stats.recentActivity.length > 0) ? stats.recentActivity : MOCK_RECENT_ACTIVITY

  return (
    <StaggerContainer className="space-y-6">
      {/* KPI Cards */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {primaryKPIs.map((kpi, i) => (
            <MotionCard key={i} {...hoverScale} className="rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-default">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                  </div>
                  <TrendIndicator value={kpi.trend} />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold text-foreground leading-none">
                    {kpi.format === 'currency' ? <>{formatCurrency(kpi.value, currency)}</> :
                     kpi.format === 'score' ? <>{kpi.value.toFixed(1)}<span className="text-xs text-muted-foreground font-normal">/100</span></> :
                     kpi.format === 'decimal' ? <>{kpi.value.toFixed(1)}<span className="text-xs text-muted-foreground font-normal ml-0.5">ha</span></> :
                     <>{kpi.value.toLocaleString()}</>}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.title}</p>
                </div>
                <div className="pt-1">
                  <Sparkline data={kpi.sparkData} color={kpi.sparkColor} width={100} height={24} />
                </div>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </StaggerItem>

      {/* Charts Row 1 */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Supply Chain Trends */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t2('Xu hướng chuỗi cung ứng', 'Supply Chain Trends')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Thu hoạch & thu mua hàng tháng', 'Monthly harvests & procurement')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={mergedTrends}>
                  <defs>
                    <linearGradient id="adminGradH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminGradP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5a1e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5a1e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="harvests" stroke="#0d9488" fillOpacity={1} fill="url(#adminGradH)" name={t2('Thu hoạch', 'Harvests')} strokeWidth={2} />
                  <Area type="monotone" dataKey="procurement" stroke="#8b5a1e" fillOpacity={1} fill="url(#adminGradP)" name={t2('Thu mua', 'Procurement')} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* EUDR Compliance Donut */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t2('Tuân thủ EUDR', 'EUDR Compliance Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={MOCK_EUDR_COMPLIANCE} cx="50%" cy="50%" outerRadius={95} innerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                        {MOCK_EUDR_COMPLIANCE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(value) => [`${value}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 min-w-[120px]">
                  {MOCK_EUDR_COMPLIANCE.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground truncate">{entry.name}</p>
                        <p className="text-xs font-bold text-foreground">{entry.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Charts Row 2 */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Revenue by Buyer */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                {t2('Doanh thu theo người mua', 'Revenue by Buyer')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_REVENUE_BY_BUYER} margin={{ bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="buyer" tick={{ fontSize: 8 }} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(value) => [formatCurrency(Number(value), currency)]} />
                  <Bar dataKey="revenue" name={t2('Doanh thu', 'Revenue')} radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {MOCK_REVENUE_BY_BUYER.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t2('Hoạt động gần đây', 'Recent Activity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-1">
                  {activityFeed.map((activity) => {
                    const typeIcons: Record<string, typeof Activity> = {
                      procurement: ShoppingCart, inspection: ClipboardCheck,
                      farmer: Users, contract: FileCheck, alert: AlertTriangle,
                    }
                    const typeColors: Record<string, string> = {
                      procurement: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                      inspection: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
                      farmer: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
                      contract: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                      alert: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
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
                          <p className="text-[9px] text-muted-foreground/70 mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Quick Actions */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {t2('Thao tác nhanh', 'Quick Actions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Wheat, label: t2('Ghi nhận thu hoạch', 'Record Harvest'), href: '/harvest' },
                { icon: ShoppingCart, label: t2('Tạo đơn thu mua', 'New Procurement'), href: '/procurement' },
                { icon: ShieldCheck, label: t2('Kiểm tra EUDR', 'EUDR Check'), href: '/eudr-compliance' },
                { icon: Eye, label: t2('Truy xuất nguồn gốc', 'View Traceability'), href: '/traceability' },
              ].map((action, i) => (
                <Button key={i} variant="outline" className="gap-2 rounded-xl h-auto py-3 text-xs" onClick={() => router.push(action.href)}>
                  <action.icon className="w-4 h-4 text-primary" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}
