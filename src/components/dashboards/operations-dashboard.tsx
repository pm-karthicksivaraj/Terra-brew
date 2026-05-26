'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, Package, Truck, Users, Clock,
  Loader2, BarChart3, Zap, Settings, ListChecks,
  ArrowRight, CheckCircle2, AlertCircle, Timer,
  Factory, Warehouse,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area,
} from 'recharts'
import { MotionCard, hoverScale } from '@/components/ui/motion'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import type { DashboardStats } from '@/types'

const CHART_COLORS = ['#0d9488', '#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516']

const MOCK_PIPELINE_STAGES = [
  { stage: 'Receiving', count: 12, capacity: 20 },
  { stage: 'Pulping', count: 8, capacity: 15 },
  { stage: 'Fermentation', count: 6, capacity: 10 },
  { stage: 'Drying', count: 10, capacity: 12 },
  { stage: 'Hulling', count: 5, capacity: 8 },
  { stage: 'Sorting', count: 7, capacity: 10 },
  { stage: 'Packaging', count: 4, capacity: 8 },
]

const MOCK_SHIPMENT_STATUS = [
  { name: 'In Transit', value: 8, color: '#0d9488' },
  { name: 'Booked', value: 5, color: '#d97706' },
  { name: 'Planned', value: 3, color: '#9ca3af' },
  { name: 'Delivered', value: 12, color: '#2e7d32' },
]

const MOCK_TEAM_TASKS = [
  { id: '1', task: 'Process Batch B-4419 — Fermentation', assignee: 'Team A', priority: 'high', status: 'in_progress' },
  { id: '2', task: 'Quality check — Hulling line 2', assignee: 'Team B', priority: 'medium', status: 'pending' },
  { id: '3', task: 'Package lot L-0892 for export', assignee: 'Team C', priority: 'high', status: 'in_progress' },
  { id: '4', task: 'Warehouse inventory count', assignee: 'Team D', priority: 'low', status: 'pending' },
  { id: '5', task: 'Loading container — Hamburg shipment', assignee: 'Team A', priority: 'high', status: 'pending' },
]

const MOCK_THROUGHPUT = [
  { day: 'Mon', processed: 4200, target: 5000 },
  { day: 'Tue', processed: 4800, target: 5000 },
  { day: 'Wed', processed: 5100, target: 5000 },
  { day: 'Thu', processed: 4600, target: 5000 },
  { day: 'Fri', processed: 5200, target: 5000 },
  { day: 'Sat', processed: 3200, target: 4000 },
  { day: 'Sun', processed: 1800, target: 2000 },
]

export default function OperationsDashboard() {
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

  const totalProcessing = stats?.completedProcessingStages || 0
  const totalShipments = 28
  const procurementPending = stats?.procurementPendingCount || 0
  const activeJobs = 7
  const teamTasks = 5
  const onTimeRate = 87

  const kpis = [
    { title: t2('Giai đoạn chế biến', 'Processing Stages'), value: totalProcessing, icon: Factory, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Lô hàng hoạt động', 'Active Shipments'), value: totalShipments, icon: Truck, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
    { title: t2('Thu mua chờ xử lý', 'Pending Procurement'), value: procurementPending, icon: Package, iconBg: 'bg-orange-100 dark:bg-orange-950', iconColor: 'text-orange-600 dark:text-orange-400' },
    { title: t2('Lệnh sản xuất', 'Active Job Orders'), value: activeJobs, icon: Settings, iconBg: 'bg-cyan-100 dark:bg-cyan-950', iconColor: 'text-cyan-600 dark:text-cyan-400' },
    { title: t2('Nhiệm vụ nhóm', 'Team Tasks'), value: teamTasks, icon: ListChecks, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: t2('Tỷ lệ đúng hạn', 'On-Time Rate'), value: `${onTimeRate}%`, icon: Timer, iconBg: 'bg-green-100 dark:bg-green-950', iconColor: 'text-green-600 dark:text-green-400' },
  ]

  return (
    <StaggerContainer className="space-y-6">
      {/* KPI Cards */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {kpis.map((kpi, i) => (
            <MotionCard key={i} {...hoverScale} className="rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-default">
              <CardContent className="p-4 space-y-2">
                <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold text-foreground leading-none">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.title}</p>
                </div>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </StaggerItem>

      {/* Charts Row 1 */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Throughput Area Chart */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {t2('Công suất hàng tuần', 'Weekly Throughput')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Khối lượng đã chế biến vs. mục tiêu (kg)', 'Processed volume vs. target (kg)')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={MOCK_THROUGHPUT}>
                  <defs>
                    <linearGradient id="opsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="processed" stroke="#0d9488" fillOpacity={1} fill="url(#opsGrad)" name={t2('Đã chế biến', 'Processed')} strokeWidth={2} />
                  <Area type="monotone" dataKey="target" stroke="#8b5a1e" fillOpacity={0} name={t2('Mục tiêu', 'Target')} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Processing Pipeline */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Factory className="w-4 h-4 text-primary" />
                {t2('Quy trình chế biến', 'Processing Pipeline')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Công suất hiện tại theo giai đoạn', 'Current capacity by stage')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_PIPELINE_STAGES} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 9 }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="count" name={t2('Hiện tại', 'Current')} fill="#0d9488" radius={[0, 6, 6, 0]} maxBarSize={14} />
                  <Bar dataKey="capacity" name={t2('Công suất', 'Capacity')} fill="#d4a574" radius={[0, 6, 6, 0]} maxBarSize={14} opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Shipment Status + Team Tasks */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Shipment Status Pie */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                {t2('Trạng thái lô hàng', 'Shipment Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={MOCK_SHIPMENT_STATUS} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" paddingAngle={3} stroke="none">
                    {MOCK_SHIPMENT_STATUS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Team Tasks */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary" />
                {t2('Nhiệm vụ nhóm', 'Team Tasks')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ScrollArea className="h-[280px]">
                <div className="space-y-2">
                  {MOCK_TEAM_TASKS.map((task) => {
                    const priorityColors: Record<string, string> = {
                      high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                      low: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                    }
                    const statusIcons: Record<string, typeof CheckCircle2> = {
                      in_progress: Timer,
                      pending: Clock,
                      completed: CheckCircle2,
                    }
                    const StatusIcon = statusIcons[task.status] || Clock
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                        <StatusIcon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground leading-tight">{task.task}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[8px] h-4">{task.assignee}</Badge>
                            <Badge className={`text-[8px] h-4 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                          </div>
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
                { icon: Factory, label: t2('Chế biến lô mới', 'Process Batch'), href: '/processing/wizard' },
                { icon: Truck, label: t2('Tạo vận chuyển', 'Create Shipment'), href: '/shipments' },
                { icon: Package, label: t2('Theo dõi thu mua', 'Track Procurement'), href: '/procurement' },
                { icon: Warehouse, label: t2('Quản lý kho', 'Warehouse'), href: '/processing/stages/warehouse' },
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
