'use client'

import { useSession } from 'next-auth/react'
import {
  Users, MapPin, ClipboardCheck, AlertTriangle, Wheat,
  UserPlus, TreePine, Leaf, Eye,
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

export function FieldDashboard() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const { stats, loading } = useDashboardData()

  if (loading) return <DashboardShell><DashboardLoading /></DashboardShell>

  const userName = session?.user?.name || 'User'
  const userRole = (session?.user?.role || '').replace(/_/g, ' ')

  const kpis: KPIConfig[] = [
    {
      title: t2('Nông dân của tôi', 'My Farmers'),
      value: stats?.totalFarmers || 0,
      icon: Users, format: 'number',
      iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400',
      trend: 5.3, sparkColor: '#0d9488',
    },
    {
      title: t2('Nông trại đã thăm', 'Farms Visited'),
      value: stats?.totalFarmLands || 0,
      icon: MapPin, format: 'number',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 7.8, sparkColor: '#10b981',
    },
    {
      title: t2('Chờ kiểm tra', 'Pending Inspections'),
      value: stats?.totalInspections || 0,
      icon: ClipboardCheck, format: 'number',
      iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400',
      trend: -1.2, sparkColor: '#d97706',
    },
    {
      title: t2('Cảnh báo cây trồng', 'Crop Alerts'),
      value: stats?.totalCropMonitorings || 0,
      icon: AlertTriangle, format: 'number',
      iconBg: 'bg-red-100 dark:bg-red-950', iconColor: 'text-red-600 dark:text-red-400',
      trend: 2.4, sparkColor: '#dc2626',
    },
    {
      title: t2('Sản lượng thu hoạch', 'Harvest Volume'),
      value: stats?.totalCherryWeight || 0,
      icon: Wheat, format: 'number',
      iconBg: 'bg-coffee-100 dark:bg-coffee-900', iconColor: 'text-coffee-600 dark:text-coffee-400',
      trend: 3.1, sparkColor: '#8b5a1e',
    },
  ]

  const quickActions: QuickActionConfig[] = [
    { icon: UserPlus, label: t2('Đăng ký nông dân', 'Register Farmer'), href: '/farmers' },
    { icon: Wheat, label: t2('Ghi nhận thu hoạch', 'Record Harvest'), href: '/harvest' },
    { icon: Leaf, label: t2('Giám sát cây trồng', 'Log Crop Monitoring'), href: '/crop-monitorings' },
    { icon: MapPin, label: t2('Thêm đất nông trại', 'Add Farm Land'), href: '/farmlands' },
  ]

  const provinceData = stats?.farmersPerProvince?.length
    ? stats.farmersPerProvince.map(fp => ({ province: fp.province || 'Other', count: fp._count.province }))
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
              { icon: UserPlus, label: t2('Đăng ký nông dân', 'Register Farmer'), href: '/farmers' },
              { icon: Wheat, label: t2('Ghi nhận thu hoạch', 'Record Harvest'), href: '/harvest' },
            ]}
          />
        </StaggerItem>

        <StaggerItem><KPIGrid kpis={kpis} /></StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Farmers by Province */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t2('Nông dân theo tỉnh', 'Farmers by Province')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">{t2('Tây Nguyên', 'Central Highlands')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {provinceData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={provinceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis dataKey="province" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                        <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                        <Bar dataKey="count" name={t2('Nông dân', 'Farmers')} radius={[6, 6, 0, 0]} maxBarSize={40}>
                          {provinceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-3 px-1">
                      {provinceData.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent/50 text-[10px]">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="font-medium text-foreground">{p.province}</span>
                          <span className="text-muted-foreground">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu tỉnh', 'No province data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <ActivityFeed activities={activityFeed} />
          </div>
        </StaggerItem>

        <StaggerItem>
          <QuickActionsPanel actions={quickActions} title={t2('Thao tác hiện trường', 'Field Actions')} />
        </StaggerItem>
      </StaggerContainer>
    </DashboardShell>
  )
}
