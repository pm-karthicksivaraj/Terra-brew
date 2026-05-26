'use client'

import { useSession } from 'next-auth/react'
import {
  ShoppingCart, Activity, Truck, Award, ShieldCheck,
  Wheat, PackageCheck, ClipboardCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import {
  useDashboardData, CHART_COLORS, KPIGrid, DashboardHeader,
  QuickActionsPanel, ActivityFeed, EmptyState, DashboardLoading,
} from './shared-components'
import type { KPIConfig, QuickActionConfig } from './shared-components'

export function OperationsDashboard() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const { stats, loading } = useDashboardData()

  if (loading) return <DashboardShell><DashboardLoading /></DashboardShell>

  const userName = session?.user?.name || 'User'
  const userRole = (session?.user?.role || '').replace(/_/g, ' ')

  const kpis: KPIConfig[] = [
    {
      title: t2('Thu mua hoạt động', 'Active Procurements'),
      value: stats?.totalProcurementRecords || 0,
      icon: ShoppingCart, format: 'number',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 6.5, sparkColor: '#10b981',
    },
    {
      title: t2('Chờ chế biến', 'Pending Processing'),
      value: stats?.procurementPendingCount || 0,
      icon: Activity, format: 'number',
      iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400',
      trend: -2.3, sparkColor: '#d97706',
    },
    {
      title: t2('Trạng thái vận chuyển', 'Shipment Status'),
      value: stats?.completedProcessingStages || 0,
      icon: Truck, format: 'number',
      iconBg: 'bg-sky-100 dark:bg-sky-950', iconColor: 'text-sky-600 dark:text-sky-400',
      trend: 8.1, sparkColor: '#0284c7',
    },
    {
      title: t2('Điểm chất lượng', 'Quality Score'),
      value: stats?.avgCupScore || 0,
      icon: Award, format: 'score',
      iconBg: 'bg-rose-100 dark:bg-rose-950', iconColor: 'text-rose-600 dark:text-rose-400',
      trend: 1.9, sparkColor: '#e11d48',
    },
    {
      title: t2('Tuân thủ EUDR', 'EUDR Compliance'),
      value: stats?.activeCertifications || 0,
      icon: ShieldCheck, format: 'number',
      iconBg: 'bg-green-100 dark:bg-green-950', iconColor: 'text-green-600 dark:text-green-400',
      trend: 4.2, sparkColor: '#2e7d32',
    },
  ]

  const quickActions: QuickActionConfig[] = [
    { icon: ShoppingCart, label: t2('Thu mua mới', 'New Procurement'), href: '/procurement' },
    { icon: PackageCheck, label: t2('Chế biến lô', 'Process Batch'), href: '/processing/wizard' },
    { icon: Truck, label: t2('Tạo vận chuyển', 'Create Shipment'), href: '/shipments' },
    { icon: ClipboardCheck, label: t2('Lên lịch kiểm tra', 'Schedule Inspection'), href: '/coffee-inspections' },
  ]

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
              { icon: ShoppingCart, label: t2('Thu mua mới', 'New Procurement'), href: '/procurement' },
              { icon: PackageCheck, label: t2('Chế biến', 'Process Batch'), href: '/processing/wizard' },
            ]}
          />
        </StaggerItem>

        <StaggerItem><KPIGrid kpis={kpis} /></StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Processing Pipeline — focus on bottlenecks */}
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
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {pipelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
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

        <StaggerItem>
          <QuickActionsPanel actions={quickActions} title={t2('Thao tác vận hành', 'Operations Actions')} />
        </StaggerItem>
      </StaggerContainer>
    </DashboardShell>
  )
}
