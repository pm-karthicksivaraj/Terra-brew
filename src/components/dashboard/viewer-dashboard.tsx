'use client'

import { useSession } from 'next-auth/react'
import {
  DollarSign, Users, MapPin, Wheat, Award,
  TrendingUp, Activity, ShieldCheck, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { formatCurrency } from '@/types'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import {
  useDashboardData, CHART_COLORS, KPIGrid, DashboardHeader,
  ActivityFeed, EmptyState, DashboardLoading,
} from './shared-components'
import type { KPIConfig } from './shared-components'

const EUDR_COLORS = ['#2e7d32', '#d97706', '#dc2626', '#9ca3af']

export function ViewerDashboard() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const { stats, loading } = useDashboardData()

  if (loading) return <DashboardShell><DashboardLoading /></DashboardShell>

  const userName = session?.user?.name || 'User'
  const userRole = (session?.user?.role || '').replace(/_/g, ' ')
  const currency = session?.user?.currency || 'VND'

  // Read-only KPIs (same as admin but no action)
  const kpis: KPIConfig[] = [
    {
      title: t2('Tổng doanh thu', 'Total Revenue'),
      value: stats?.totalPurchaseAmount || 0,
      icon: DollarSign, format: 'currency',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 12.4, sparkColor: '#10b981',
    },
    {
      title: t2('Tổng nông dân', 'Total Farmers'),
      value: stats?.totalFarmers || 0,
      icon: Users, format: 'number',
      iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400',
      trend: 8.2, sparkColor: '#0d9488',
    },
    {
      title: t2('Diện tích (ha)', 'Farm Area (ha)'),
      value: stats?.totalLandArea || 0,
      icon: MapPin, format: 'decimal',
      iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400',
      trend: 5.6, sparkColor: '#d97706',
    },
    {
      title: t2('Sản lượng (kg)', 'Harvest Volume (kg)'),
      value: stats?.totalCherryWeight || 0,
      icon: Wheat, format: 'number',
      iconBg: 'bg-coffee-100 dark:bg-coffee-900', iconColor: 'text-coffee-600 dark:text-coffee-400',
      trend: -3.1, sparkColor: '#8b5a1e',
    },
    {
      title: t2('Giá TB/kg', 'Avg Price/kg'),
      value: stats?.avgPricePerKg || 0,
      icon: TrendingUp, format: 'currency',
      iconBg: 'bg-sky-100 dark:bg-sky-950', iconColor: 'text-sky-600 dark:text-sky-400',
      trend: 6.8, sparkColor: '#0284c7',
    },
    {
      title: t2('Điểm chất lượng', 'Quality Score'),
      value: stats?.avgCupScore || 0,
      icon: Award, format: 'score',
      iconBg: 'bg-rose-100 dark:bg-rose-950', iconColor: 'text-rose-600 dark:text-rose-400',
      trend: 2.1, sparkColor: '#e11d48',
    },
  ]

  const harvestTrends = stats?.harvestTrends || []
  const procurementTrends = stats?.procurementTrends || []
  const mergedTrends = harvestTrends.map((h, i) => ({
    ...h,
    procurement: procurementTrends[i]?.procurements || Math.round(h.harvests * 0.85),
  }))

  const eudrData = stats?.qualityDistribution?.length
    ? stats.qualityDistribution
    : []

  const pipelineData = stats?.processingByStage?.length
    ? stats.processingByStage.map(s => ({ stageType: s.stageType, count: s._count.stageType }))
    : []

  const provinceData = stats?.farmersPerProvince?.length
    ? stats.farmersPerProvince.map(fp => ({ province: fp.province || 'Other', count: fp._count.province }))
    : []

  const activityFeed = stats?.recentActivity || []

  return (
    <DashboardShell>
      <StaggerContainer className="space-y-6">
        {/* Header — no quick action buttons for viewer */}
        <StaggerItem>
          <DashboardHeader userName={userName} userRole={userRole} />
        </StaggerItem>

        {/* Read-only badge */}
        <StaggerItem>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t2('Chế độ chỉ xem', 'Read-only view')}</span>
          </div>
        </StaggerItem>

        <StaggerItem><KPIGrid kpis={kpis} /></StaggerItem>

        {/* Charts — read only, no quick actions */}
        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Supply Chain Trends */}
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    {t2('Xu hướng chuỗi cung ứng', 'Supply Chain Trends')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">12 {t2('tháng', 'months')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {mergedTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={mergedTrends}>
                      <defs>
                        <linearGradient id="viewerGradH" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="viewerGradP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5a1e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5a1e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="harvests" stroke="#0d9488" fillOpacity={1} fill="url(#viewerGradH)" name={t2('Thu hoạch', 'Harvests')} strokeWidth={2} />
                      <Area type="monotone" dataKey="procurement" stroke="#8b5a1e" fillOpacity={1} fill="url(#viewerGradP)" name={t2('Thu mua', 'Procurement')} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu xu hướng', 'No trend data yet')} />
                )}
              </CardContent>
            </Card>

            {/* EUDR Compliance */}
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {t2('Tuân thủ EUDR', 'EUDR Compliance Status')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {eudrData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={eudrData} cx="50%" cy="50%" outerRadius={95} innerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                            {eudrData.map((_, i) => <Cell key={i} fill={EUDR_COLORS[i % EUDR_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 min-w-[120px]">
                      {eudrData.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: EUDR_COLORS[i % EUDR_COLORS.length] }} />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-tight truncate">{entry.name}</p>
                            <p className="text-xs font-bold text-foreground">{entry.value}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu tuân thủ', 'No compliance data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Processing Pipeline */}
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  {t2('Quy trình chế biến', 'Processing Pipeline')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {pipelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={pipelineData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis type="number" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis dataKey="stageType" type="category" tick={{ fontSize: 9 }} className="fill-muted-foreground" width={80} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                      <Bar dataKey="count" name={t2('Số lượng', 'Count')} radius={[0, 6, 6, 0]} maxBarSize={18}>
                        {pipelineData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu chế biến', 'No processing data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <ActivityFeed activities={activityFeed} />
          </div>
        </StaggerItem>
      </StaggerContainer>
    </DashboardShell>
  )
}
