'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Users, MapPin, Wheat, TrendingUp, ShieldCheck,
  Package, Store, Award, FileText, Baby, ClipboardCheck,
  Sprout, Truck, Factory, Activity, CreditCard,
  Loader2, TreePine, BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────

interface DashboardStats {
  totalFarmers: number
  totalFarmLands: number
  totalCultivations: number
  totalHarvestRecords: number
  totalProcurementRecords: number
  totalMarketplaceListings: number
  completedProcessingStages: number
  totalNurseries: number
  totalCropMonitorings: number
  totalSmartContracts: number
  totalInspections: number
  totalCollectionCentres: number
  certifiedFarmersCount: number
  totalLandPreps: number
  totalFertilizerApps: number
  totalPestMgmts: number
  activeCertifications: number
  procurementPaidCount: number
  procurementPendingCount: number
  avgCreditScore: number
  avgCupScore: number
  totalPurchaseAmount: number
  avgPricePerKg: number
  totalNetWeight: number
  totalCherryWeight: number
  totalLandArea: number
  currency: string
  farmersPerProvince: { province: string; _count: { province: number } }[]
  cultivationsByCrop: { cultivatedCrop: string; _count: { cultivatedCrop: number } }[]
  processingByStage: { stageType: string; _count: { stageType: number } }[]
  certByType: { certificationStandard: string; _count: { certificationStandard: number } }[]
  harvestTrends: { month: string; name: string; harvests: number; weight: number; avgCupScore: number }[]
  qualityDistribution: { name: string; value: number }[]
  recentActivity: { id: string; type: string; action: string; entity: string; time: string }[]
}

// ─── Format helpers ──────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'VND') return formatNumber(amount) + ' ₫'
  return '$' + formatNumber(amount)
}

// ─── Pie chart colors ────────────────────────────────────────────

const PIE_COLORS = ['#059669', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#6366f1', '#ca8a04', '#0d9488']

// ─── Component ───────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data?.data || data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Build KPI cards from real data
  const kpiCards = useMemo(() => {
    if (!stats) return []
    return [
      { title: 'Total Farmers', value: formatNumber(stats.totalFarmers), icon: Users, color: 'bg-emerald-600' },
      { title: 'Farm Lands', value: formatNumber(stats.totalFarmLands), icon: MapPin, color: 'bg-amber-600' },
      { title: 'Cultivations', value: formatNumber(stats.totalCultivations), icon: Sprout, color: 'bg-teal-600' },
      { title: 'Harvest Records', value: formatNumber(stats.totalHarvestRecords), icon: Wheat, color: 'bg-orange-600' },
      { title: 'Procurement Orders', value: formatNumber(stats.totalProcurementRecords), icon: Package, color: 'bg-cyan-600' },
      { title: 'Marketplace Listings', value: formatNumber(stats.totalMarketplaceListings), icon: Store, color: 'bg-fuchsia-600' },
      { title: 'Processing Stages', value: formatNumber(stats.completedProcessingStages), icon: Factory, color: 'bg-violet-600' },
      { title: 'Certified Farmers', value: formatNumber(stats.certifiedFarmersCount), icon: Award, color: 'bg-lime-600' },
      { title: 'Inspections', value: formatNumber(stats.totalInspections), icon: ClipboardCheck, color: 'bg-pink-600' },
      { title: 'Smart Contracts', value: formatNumber(stats.totalSmartContracts), icon: FileText, color: 'bg-sky-600' },
      { title: 'Nurseries', value: formatNumber(stats.totalNurseries), icon: Baby, color: 'bg-rose-600' },
      { title: 'Crop Monitorings', value: formatNumber(stats.totalCropMonitorings), icon: Activity, color: 'bg-indigo-600' },
    ]
  }, [stats])

  // Crop distribution for pie chart
  const cropData = useMemo(() => {
    if (!stats?.cultivationsByCrop?.length) {
      return [
        { name: 'Arabica', value: 58, color: '#059669' },
        { name: 'Robusta', value: 28, color: '#d97706' },
        { name: 'Liberica', value: 8, color: '#7c3aed' },
        { name: 'Excelsa', value: 6, color: '#0891b2' },
      ]
    }
    return stats.cultivationsByCrop.map((item, i) => ({
      name: item.cultivatedCrop || 'Unknown',
      value: item._count.cultivatedCrop,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }))
  }, [stats])

  // Harvest trends for line chart
  const harvestChartData = useMemo(() => {
    if (!stats?.harvestTrends?.length) {
      return [
        { month: 'Jul', harvests: 65, weight: 450, avgCupScore: 78 },
        { month: 'Aug', harvests: 78, weight: 520, avgCupScore: 80 },
        { month: 'Sep', harvests: 90, weight: 680, avgCupScore: 82 },
        { month: 'Oct', harvests: 85, weight: 610, avgCupScore: 79 },
        { month: 'Nov', harvests: 95, weight: 720, avgCupScore: 84 },
        { month: 'Dec', harvests: 88, weight: 650, avgCupScore: 81 },
      ]
    }
    return stats.harvestTrends.map(t => ({
      month: t.name,
      harvests: t.harvests,
      weight: t.weight,
      avgCupScore: t.avgCupScore,
    }))
  }, [stats])

  // Processing stages bar chart
  const processingData = useMemo(() => {
    if (!stats?.processingByStage?.length) return []
    return stats.processingByStage.map(item => ({
      stage: (item.stageType || 'Unknown').replace(/_/g, ' '),
      count: item._count.stageType,
    }))
  }, [stats])

  // Quality distribution
  const qualityData = useMemo(() => {
    if (!stats?.qualityDistribution?.length) return []
    return stats.qualityDistribution
  }, [stats])

  // Recent activity
  const recentActivity = useMemo(() => {
    if (!stats?.recentActivity?.length) return []
    return stats.recentActivity.slice(0, 8)
  }, [stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">Welcome back to Terra Brew Coffee Platform</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {stats?.currency || 'VND'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* KPI Cards Grid */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <StaggerItem key={kpi.title}>
              <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg ${kpi.color} flex items-center justify-center`}>
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.title}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* Key Financial & Quality Metrics */}
      {stats && (
        <FadeIn delay={0.1}>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(stats.totalPurchaseAmount, stats.currency)}</p>
                  <p className="text-xs text-muted-foreground">Total Purchase Amount</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{formatCurrency(stats.avgPricePerKg, stats.currency)}/kg</p>
                  <p className="text-xs text-muted-foreground">Avg Price/kg</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                  <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{formatNumber(stats.totalNetWeight)} kg</p>
                  <p className="text-xs text-muted-foreground">Total Net Weight</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{stats.avgCupScore?.toFixed(1) || '—'}</p>
                  <p className="text-xs text-muted-foreground">Avg Cup Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                  <p className="text-lg font-bold text-cyan-700 dark:text-cyan-400">{stats.avgCreditScore?.toFixed(0) || '—'}</p>
                  <p className="text-xs text-muted-foreground">Avg Credit Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                  <p className="text-lg font-bold text-rose-700 dark:text-rose-400">{formatNumber(stats.totalLandArea)} Ha</p>
                  <p className="text-xs text-muted-foreground">Total Land Area</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Harvest Trends */}
        <FadeIn className="lg:col-span-2" delay={0.15}>
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Harvest Trends</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly harvest volume and quality scores</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={harvestChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.6 0 0)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.6 0 0)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.9 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="harvests" stroke="#059669" strokeWidth={2.5} dot={false} name="Harvests" />
                  <Line type="monotone" dataKey="weight" stroke="#d97706" strokeWidth={2.5} dot={false} name="Weight (kg)" />
                  <Line type="monotone" dataKey="avgCupScore" stroke="#0891b2" strokeWidth={2.5} dot={false} name="Avg Cup Score" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Crop Distribution */}
        <FadeIn delay={0.2}>
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Crop Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">By coffee variety</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={cropData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cropData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.9 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Processing Stages + Quality Distribution */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Processing by Stage */}
        {processingData.length > 0 && (
          <FadeIn delay={0.25}>
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Processing by Stage</CardTitle>
                <p className="text-xs text-muted-foreground">Record count per processing stage type</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={processingData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="oklch(0.6 0 0)" />
                    <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={100} stroke="oklch(0.6 0 0)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.9 0 0)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Quality Distribution */}
        {qualityData.length > 0 && (
          <FadeIn delay={0.3}>
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Quality Distribution</CardTitle>
                <p className="text-xs text-muted-foreground">Cup score breakdown across harvests</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name ?? ''} (${(((percent ?? 0) as number) * 100).toFixed(0)}%)`}
                    >
                      {qualityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.9 0 0)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>

      {/* Procurement Status */}
      {stats && (
        <FadeIn delay={0.35}>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Procurement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{stats.totalProcurementRecords}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{stats.procurementPaidCount}</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{stats.procurementPendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{formatNumber(stats.totalCherryWeight)} kg</p>
                  <p className="text-xs text-muted-foreground">Cherry Weight</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{stats.activeCertifications}</p>
                  <p className="text-xs text-muted-foreground">Active Certifications</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{stats.totalCollectionCentres}</p>
                  <p className="text-xs text-muted-foreground">Collection Centres</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <FadeIn delay={0.4}>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentActivity.map((activity) => {
                  const typeColors: Record<string, string> = {
                    farmer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                    procurement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                    inspection: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
                    contract: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
                    alert: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
                  }
                  const colorClass = typeColors[activity.type] || 'bg-muted text-muted-foreground'
                  const timeAgo = (() => {
                    const diff = Date.now() - new Date(activity.time).getTime()
                    const mins = Math.floor(diff / 60000)
                    if (mins < 1) return 'just now'
                    if (mins < 60) return `${mins}m ago`
                    const hours = Math.floor(mins / 60)
                    if (hours < 24) return `${hours}h ago`
                    return `${Math.floor(hours / 24)}d ago`
                  })()

                  return (
                    <div key={activity.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className={`${colorClass} border-0 text-[10px] px-1.5 py-0 shrink-0`}>
                          {activity.type}
                        </Badge>
                        <span className="text-sm truncate">{activity.action}</span>
                        {activity.entity && (
                          <span className="text-xs text-muted-foreground truncate hidden md:inline">{activity.entity}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeAgo}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
