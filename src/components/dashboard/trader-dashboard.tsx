'use client'

import { useSession } from 'next-auth/react'
import {
  FileCheck, Store, DollarSign, Truck, TrendingUp,
  ShoppingCart, Wheat, Search, BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'
import { formatCurrency } from '@/types'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import {
  useDashboardData, CHART_COLORS, KPIGrid, DashboardHeader,
  QuickActionsPanel, ActivityFeed, EmptyState, DashboardLoading,
} from './shared-components'
import type { KPIConfig, QuickActionConfig } from './shared-components'

export function TraderDashboard() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const { stats, loading } = useDashboardData()

  if (loading) return <DashboardShell><DashboardLoading /></DashboardShell>

  const userName = session?.user?.name || 'User'
  const userRole = (session?.user?.role || '').replace(/_/g, ' ')
  const currency = session?.user?.currency || 'VND'

  const kpis: KPIConfig[] = [
    {
      title: t2('Hợp đồng hoạt động', 'Active Contracts'),
      value: stats?.totalSmartContracts || 0,
      icon: FileCheck, format: 'number',
      iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400',
      trend: 9.5, sparkColor: '#d97706',
    },
    {
      title: t2('Gian hàng thị trường', 'Marketplace Listings'),
      value: stats?.totalMarketplaceListings || 0,
      icon: Store, format: 'number',
      iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400',
      trend: 4.2, sparkColor: '#0d9488',
    },
    {
      title: t2('Doanh thu', 'Revenue'),
      value: stats?.totalPurchaseAmount || 0,
      icon: DollarSign, format: 'currency',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 12.4, sparkColor: '#10b981',
    },
    {
      title: t2('Trạng thái vận chuyển', 'Shipment Status'),
      value: stats?.completedProcessingStages || 0,
      icon: Truck, format: 'number',
      iconBg: 'bg-sky-100 dark:bg-sky-950', iconColor: 'text-sky-600 dark:text-sky-400',
      trend: 6.7, sparkColor: '#0284c7',
    },
    {
      title: t2('Giá TB/kg', 'Avg Price/kg'),
      value: stats?.avgPricePerKg || 0,
      icon: TrendingUp, format: 'currency',
      iconBg: 'bg-rose-100 dark:bg-rose-950', iconColor: 'text-rose-600 dark:text-rose-400',
      trend: 3.2, sparkColor: '#e11d48',
    },
  ]

  const quickActions: QuickActionConfig[] = [
    { icon: FileCheck, label: t2('Tạo hợp đồng', 'Create Contract'), href: '/smart-contracts' },
    { icon: Store, label: t2('Gian hàng mới', 'New Listing'), href: '/marketplace' },
    { icon: ShoppingCart, label: t2('Đặt RFQ', 'Place RFQ'), href: '/rfq' },
    { icon: Truck, label: t2('Đặt vận chuyển', 'Book Shipment'), href: '/shipments' },
    { icon: BarChart3, label: t2('Sàn giao dịch', 'View Trading Desk'), href: '/trading-desk' },
  ]

  const harvestTrends = stats?.harvestTrends || []
  const procurementTrends = stats?.procurementTrends || []
  const mergedTrends = harvestTrends.map((h, i) => ({
    ...h,
    procurement: procurementTrends[i]?.procurements || Math.round(h.harvests * 0.85),
  }))

  const pipelineData = stats?.processingByStage?.length
    ? stats.processingByStage.map(s => ({ stageType: s.stageType, count: s._count.stageType }))
    : []

  const activityFeed = stats?.recentActivity || []

  return (
    <DashboardShell>
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <DashboardHeader
            userName={userName}
            userRole={userRole}
            quickButtons={[
              { icon: FileCheck, label: t2('Hợp đồng mới', 'New Contract'), href: '/smart-contracts' },
              { icon: Store, label: t2('Thị trường', 'Marketplace'), href: '/marketplace' },
            ]}
          />
        </StaggerItem>

        <StaggerItem><KPIGrid kpis={kpis} /></StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Market Trends */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    {t2('Xu hướng thị trường', 'Market Trends')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">12 {t2('tháng', 'months')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {mergedTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={mergedTrends}>
                      <defs>
                        <linearGradient id="traderGradH" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="traderGradP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5a1e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5a1e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                      <Area type="monotone" dataKey="harvests" stroke="#0d9488" fillOpacity={1} fill="url(#traderGradH)" name={t2('Thu hoạch', 'Harvests')} strokeWidth={2} />
                      <Area type="monotone" dataKey="procurement" stroke="#8b5a1e" fillOpacity={1} fill="url(#traderGradP)" name={t2('Thu mua', 'Procurement')} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu thị trường', 'No market data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Supply Status */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  {t2('Trạng thái chuỗi cung ứng', 'Supply Chain Status')}
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
                  <EmptyState message={t2('Chưa có dữ liệu chuỗi cung ứng', 'No supply chain data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <ActivityFeed activities={activityFeed} />
          </div>
        </StaggerItem>

        <StaggerItem>
          <QuickActionsPanel actions={quickActions} title={t2('Thao tác giao dịch', 'Trading Actions')} />
        </StaggerItem>
      </StaggerContainer>
    </DashboardShell>
  )
}
