'use client'

import { useSession } from 'next-auth/react'
import {
  DollarSign, Clock, CreditCard, ShoppingCart, Globe,
  FileText, Download, Settings, BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/types'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import {
  useDashboardData, KPIGrid, DashboardHeader,
  QuickActionsPanel, ActivityFeed, EmptyState, DashboardLoading,
} from './shared-components'
import type { KPIConfig, QuickActionConfig } from './shared-components'

export function FinanceDashboard() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const { stats, loading } = useDashboardData()

  if (loading) return <DashboardShell><DashboardLoading /></DashboardShell>

  const userName = session?.user?.name || 'User'
  const userRole = (session?.user?.role || '').replace(/_/g, ' ')
  const currency = session?.user?.currency || 'VND'

  const kpis: KPIConfig[] = [
    {
      title: t2('Tổng doanh thu', 'Total Revenue'),
      value: stats?.totalPurchaseAmount || 0,
      icon: DollarSign, format: 'currency',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: 12.4, sparkColor: '#10b981',
    },
    {
      title: t2('Thanh toán còn nợ', 'Outstanding Payments'),
      value: stats?.procurementPendingCount || 0,
      icon: Clock, format: 'number',
      iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400',
      trend: -5.2, sparkColor: '#d97706',
    },
    {
      title: t2('Trạng thái đăng ký', 'Subscription Status'),
      value: 1,
      icon: CreditCard, format: 'number',
      iconBg: 'bg-sky-100 dark:bg-sky-950', iconColor: 'text-sky-600 dark:text-sky-400',
      trend: 0, sparkColor: '#0284c7',
    },
    {
      title: t2('Chi phí thu mua', 'Procurement Spend'),
      value: stats?.totalPurchaseAmount || 0,
      icon: ShoppingCart, format: 'currency',
      iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400',
      trend: 8.6, sparkColor: '#0d9488',
    },
    {
      title: t2('Tiền tệ', 'Currency'),
      value: 0,
      icon: Globe, format: 'number',
      iconBg: 'bg-rose-100 dark:bg-rose-950', iconColor: 'text-rose-600 dark:text-rose-400',
      suffix: currency,
    },
  ]

  const quickActions: QuickActionConfig[] = [
    { icon: CreditCard, label: t2('Xem thanh toán', 'View Billing'), href: '/billing' },
    { icon: FileText, label: t2('Báo cáo thanh toán', 'Payment Reports'), href: '/analytics' },
    { icon: Download, label: t2('Xuất dữ liệu tài chính', 'Export Financial Data'), href: '/analytics' },
    { icon: Settings, label: t2('Quản lý đăng ký', 'Manage Subscription'), href: '/billing' },
  ]

  const harvestTrends = stats?.harvestTrends || []
  const activityFeed = stats?.recentActivity || []

  return (
    <DashboardShell>
      <StaggerContainer className="space-y-6">
        <StaggerItem>
          <DashboardHeader
            userName={userName}
            userRole={userRole}
            quickButtons={[
              { icon: CreditCard, label: t2('Thanh toán', 'Billing'), href: '/billing' },
              { icon: FileText, label: t2('Báo cáo', 'Reports'), href: '/analytics' },
            ]}
          />
        </StaggerItem>

        <StaggerItem><KPIGrid kpis={kpis} /></StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Revenue Trend */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    {t2('Xu hướng doanh thu', 'Revenue Trend')}
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px]">{currency}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {harvestTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={harvestTrends}>
                      <defs>
                        <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                      <Area type="monotone" dataKey="weight" stroke="#10b981" fillOpacity={1} fill="url(#finGrad)" name={t2('Doanh thu', 'Revenue')} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu doanh thu', 'No revenue data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <ActivityFeed activities={activityFeed} />
          </div>
        </StaggerItem>

        <StaggerItem>
          <QuickActionsPanel actions={quickActions} title={t2('Thao tác tài chính', 'Finance Actions')} />
        </StaggerItem>
      </StaggerContainer>
    </DashboardShell>
  )
}
