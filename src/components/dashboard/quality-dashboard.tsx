'use client'

import { useSession } from 'next-auth/react'
import {
  ClipboardCheck, Award, PieChart as PieChartIcon, AlertTriangle, ShieldCheck,
  FileCheck, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import {
  useDashboardData, CHART_COLORS, KPIGrid, DashboardHeader,
  QuickActionsPanel, ActivityFeed, EmptyState, DashboardLoading, RadialScore,
} from './shared-components'
import type { KPIConfig, QuickActionConfig } from './shared-components'

const QUALITY_COLORS = ['#2e7d32', '#0d9488', '#d97706', '#dc2626']

export function QualityDashboard() {
  const { data: session } = useSession()
  const { t2 } = useI18n()
  const { stats, loading } = useDashboardData()

  if (loading) return <DashboardShell><DashboardLoading /></DashboardShell>

  const userName = session?.user?.name || 'User'
  const userRole = (session?.user?.role || '').replace(/_/g, ' ')

  const avgCupScore = stats?.avgCupScore || 0
  const totalInspections = stats?.totalInspections || 0
  const activeCerts = stats?.activeCertifications || 0
  const failedInspections = Math.max(0, totalInspections - activeCerts)

  const kpis: KPIConfig[] = [
    {
      title: t2('Chờ kiểm tra', 'Pending Inspections'),
      value: totalInspections,
      icon: ClipboardCheck, format: 'number',
      iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400',
      trend: 3.2, sparkColor: '#d97706',
    },
    {
      title: t2('Điểm cốc TB', 'Avg Cup Score'),
      value: avgCupScore,
      icon: Award, format: 'score',
      iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400',
      trend: 2.5, sparkColor: '#0d9488',
    },
    {
      title: t2('Phân bố chất lượng', 'Quality Distribution'),
      value: stats?.qualityDistribution?.length || 0,
      icon: PieChartIcon, format: 'number',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400',
      sparkColor: '#10b981',
    },
    {
      title: t2('Kiểm tra thất bại', 'Failed Inspections'),
      value: failedInspections,
      icon: AlertTriangle, format: 'number',
      iconBg: 'bg-red-100 dark:bg-red-950', iconColor: 'text-red-600 dark:text-red-400',
      trend: -1.8, sparkColor: '#dc2626',
    },
    {
      title: t2('Trạng thái chứng nhận', 'Cert Status'),
      value: activeCerts,
      icon: ShieldCheck, format: 'number',
      iconBg: 'bg-green-100 dark:bg-green-950', iconColor: 'text-green-600 dark:text-green-400',
      trend: 6.3, sparkColor: '#2e7d32',
    },
  ]

  const quickActions: QuickActionConfig[] = [
    { icon: ClipboardCheck, label: t2('Kiểm tra mới', 'New Inspection'), href: '/coffee-inspections' },
    { icon: FileCheck, label: t2('Đánh giá chứng nhận', 'Cert Assessment'), href: '/cert-assessments' },
    { icon: Award, label: t2('Xác minh QC', 'QC Verification'), href: '/qc-verifications' },
    { icon: Eye, label: t2('Báo cáo chất lượng', 'View Quality Reports'), href: '/analytics' },
  ]

  const qualityDist = stats?.qualityDistribution?.length
    ? stats.qualityDistribution
    : []

  const certByType = stats?.certByType?.length
    ? stats.certByType.map(c => ({ type: c.certificationStandard || 'Other', count: c._count.certificationStandard }))
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
              { icon: ClipboardCheck, label: t2('Kiểm tra mới', 'New Inspection'), href: '/coffee-inspections' },
              { icon: FileCheck, label: t2('Đánh giá cert', 'Cert Assessment'), href: '/cert-assessments' },
            ]}
          />
        </StaggerItem>

        <StaggerItem><KPIGrid kpis={kpis} /></StaggerItem>

        <StaggerItem>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Quality Score + Distribution */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  {t2('Phân bố chất lượng', 'Quality Distribution')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {qualityDist.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={qualityDist} cx="50%" cy="50%" outerRadius={95} innerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                            {qualityDist.map((_, i) => <Cell key={i} fill={QUALITY_COLORS[i % QUALITY_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 min-w-[120px]">
                      {qualityDist.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: QUALITY_COLORS[i % QUALITY_COLORS.length] }} />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-tight truncate">{entry.name}</p>
                            <p className="text-xs font-bold text-foreground">{entry.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu chất lượng', 'No quality data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Certifications by Type */}
            <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {t2('Chứng nhận theo loại', 'Certifications by Type')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                {certByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={certByType}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="type" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                      <Bar dataKey="count" name={t2('Số lượng', 'Count')} radius={[6, 6, 0, 0]} maxBarSize={36}>
                        {certByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message={t2('Chưa có dữ liệu chứng nhận', 'No certification data yet')} />
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <ActivityFeed activities={activityFeed} />
          </div>
        </StaggerItem>

        <StaggerItem>
          <QuickActionsPanel actions={quickActions} title={t2('Thao tác chất lượng', 'Quality Actions')} />
        </StaggerItem>
      </StaggerContainer>
    </DashboardShell>
  )
}
