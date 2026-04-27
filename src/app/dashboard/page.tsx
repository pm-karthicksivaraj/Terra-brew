'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Users, MapPin, Wheat, DollarSign, Award,
  ShoppingCart, Store, FileCheck, TreePine, ClipboardCheck,
  TrendingUp, Activity, AlertTriangle, Clock,
  PieChart as PieChartIcon, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { formatCurrency } from '@/types'
import type { DashboardStats } from '@/types'

const CHART_COLORS = ['#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516', '#a06b2d', '#2e7d32']

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'vi' | 'en'>('vi')

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

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

  if (status === 'loading' || loading) {
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

  if (!session) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-coffee-500" />
            <span className="text-sm text-coffee-500">{t('Đang chuyển hướng...', 'Redirecting...')}</span>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const currency = session.user?.currency || 'VND'

  const primaryKPIs = [
    { title: t('Tổng doanh thu', 'Total Revenue'), value: stats?.totalPurchaseAmount || 2850000000, icon: DollarSign, format: 'currency', gradient: 'from-amber-600 to-amber-800' },
    { title: t('Tổng nông dân', 'Total Farmers'), value: stats?.totalFarmers || 0, icon: Users, format: 'number', gradient: 'from-coffee-600 to-coffee-800' },
    { title: t('Diện tích (ha)', 'Farm Area (ha)'), value: stats?.totalLandArea || 0, icon: MapPin, format: 'decimal', gradient: 'from-emerald-600 to-emerald-800' },
    { title: t('Sản lượng (kg)', 'Harvest Volume (kg)'), value: stats?.totalCherryWeight || 0, icon: Wheat, format: 'number', gradient: 'from-yellow-600 to-yellow-800' },
    { title: t('Giá TB/kg', 'Avg Price/kg'), value: stats?.avgPricePerKg || 0, icon: TrendingUp, format: 'currency', gradient: 'from-orange-600 to-orange-800' },
    { title: t('Điểm chất lượng', 'Quality Score'), value: stats?.avgCupScore || 0, icon: Award, format: 'score', gradient: 'from-stone-600 to-stone-800' },
  ]

  const secondaryKPIs = [
    { title: t('Đơn thu mua', 'Procurement Orders'), value: stats?.totalProcurementRecords || 0, icon: ShoppingCart, color: 'text-blue-600' },
    { title: t('Danh sách TT', 'Marketplace Listings'), value: stats?.totalMarketplaceListings || 0, icon: Store, color: 'text-purple-600' },
    { title: t('Nông trại CC', 'Certified Farms'), value: stats?.certifiedFarmersCount || 0, icon: FileCheck, color: 'text-green-600' },
    { title: t('HĐ thông minh', 'Smart Contracts'), value: stats?.totalSmartContracts || 0, icon: FileCheck, color: 'text-indigo-600' },
    { title: t('Vườn ươm', 'Nurseries'), value: stats?.totalNurseries || 0, icon: TreePine, color: 'text-teal-600' },
    { title: t('Lần kiểm tra', 'Inspections'), value: stats?.totalInspections || 0, icon: ClipboardCheck, color: 'text-rose-600' },
  ]

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div>
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-coffee-900">
            {t('Bảng điều khiển', 'Dashboard')}
          </h2>
          <p className="text-sm text-coffee-500">{t('Phân tích theo thời gian thực', 'Real-time analytics')}</p>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {primaryKPIs.map((kpi, i) => (
            <div key={i} >
              <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                    <kpi.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <p className="text-[10px] text-coffee-500 mb-1 leading-tight">{kpi.title}</p>
                  <p className="text-base font-bold text-coffee-900">
                    {kpi.format === 'currency' ? (
                      <AnimatedCounter value={kpi.value} prefix="" suffix=" ₫" />
                    ) : kpi.format === 'score' ? (
                      <AnimatedCounter value={kpi.value} suffix="/100" />
                    ) : kpi.format === 'decimal' ? (
                      <>{kpi.value.toFixed(1)} ha</>
                    ) : (
                      <AnimatedCounter value={kpi.value} />
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Secondary KPI Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {secondaryKPIs.map((kpi, i) => (
            <div key={i} >
              <Card className="rounded-xl border border-coffee-200/50 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    <span className="text-[10px] text-coffee-500 leading-tight">{kpi.title}</span>
                  </div>
                  <p className="text-lg font-bold text-coffee-800">
                    <AnimatedCounter value={kpi.value} />
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Supply Chain Trends */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-coffee-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-coffee-600" />
                  {t('Xu hướng chuỗi cung ứng', 'Supply Chain Trends')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={stats?.harvestTrends || []}>
                    <defs>
                      <linearGradient id="colorHarvests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5a1e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5a1e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a574" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4a574" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d6" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} stroke="#b8a089" />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'Space Mono' }} stroke="#b8a089" />
                    <Tooltip contentStyle={{ fontFamily: 'Space Mono', fontSize: 11, borderRadius: 12 }} />
                    <Area type="monotone" dataKey="harvests" stroke="#8b5a1e" fillOpacity={1} fill="url(#colorHarvests)" name={t('Thu hoạch', 'Harvests')} />
                    <Area type="monotone" dataKey="weight" stroke="#d4a574" fillOpacity={1} fill="url(#colorWeight)" name={t('Khối lượng', 'Weight')} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Crop Distribution */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-coffee-800 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-coffee-600" />
                  {t('Phân bố cây trồng', 'Crop Distribution')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={(stats?.cultivationsByCrop || []).map(c => ({
                        name: c.cultivatedCrop || 'Khác',
                        value: c._count.cultivatedCrop,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {(stats?.cultivationsByCrop || []).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: 'Space Mono', fontSize: 11, borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Processing Pipeline */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-coffee-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-coffee-600" />
                  {t('Quy trình chế biến', 'Processing Pipeline')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats?.processingByStage || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d6" />
                    <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} stroke="#b8a089" />
                    <YAxis dataKey="stageType" type="category" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} stroke="#b8a089" width={80} />
                    <Tooltip contentStyle={{ fontFamily: 'Space Mono', fontSize: 11, borderRadius: 12 }} />
                    <Bar dataKey="_count.stageType" name={t('Số lượng', 'Count')} radius={[0, 6, 6, 0]}>
                      {(stats?.processingByStage || []).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quality Distribution */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-coffee-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-coffee-600" />
                  {t('Phân bố chất lượng', 'Quality Distribution')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats?.qualityDistribution || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {(stats?.qualityDistribution || []).map((_, i) => (
                        <Cell key={i} fill={['#2e7d32', '#8b5a1e', '#d4a574', '#c62828'][i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: 'Space Mono', fontSize: 11, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row: Recent Activity + Farmers Per Province */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-coffee-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-coffee-600" />
                  {t('Hoạt động gần đây', 'Recent Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ScrollArea className="h-[260px]">
                  <div className="space-y-3">
                    {(stats?.recentActivity || []).map((activity, i) => {
                      const typeColors: Record<string, string> = {
                        procurement: 'bg-blue-100 text-blue-700',
                        inspection: 'bg-green-100 text-green-700',
                        farmer: 'bg-coffee-100 text-coffee-700',
                        contract: 'bg-purple-100 text-purple-700',
                        alert: 'bg-red-100 text-red-700',
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
                        <div key={activity.id}
 className="flex items-start gap-3 p-2 rounded-lg hover:bg-coffee-50 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[activity.type] || 'bg-gray-100 text-gray-700'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-coffee-800">{activity.action}</p>
                            <p className="text-[10px] text-coffee-500 truncate">{activity.entity}</p>
                            <p className="text-[10px] text-coffee-400 mt-0.5">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Farmers Per Province */}
          <div>
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-coffee-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-coffee-600" />
                  {t('Nông dân theo tỉnh', 'Farmers per Province')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={(stats?.farmersPerProvince || []).map(fp => ({
                    province: fp.province || 'Khác',
                    count: fp._count.province,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d6" />
                    <XAxis dataKey="province" tick={{ fontSize: 9, fontFamily: 'Space Mono' }} stroke="#b8a089" />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'Space Mono' }} stroke="#b8a089" />
                    <Tooltip contentStyle={{ fontFamily: 'Space Mono', fontSize: 11, borderRadius: 12 }} />
                    <Bar dataKey="count" name={t('Nông dân', 'Farmers')} radius={[6, 6, 0, 0]}>
                      {(stats?.farmersPerProvince || []).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
