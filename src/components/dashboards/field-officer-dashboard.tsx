'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Users, Wheat, AlertTriangle,
  TrendingUp, Activity, Loader2, ClipboardList,
  Bug, TreePine, Zap, ChevronRight, CalendarDays,
  Sprout, Droplets, Eye,
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
  PieChart, Pie, Legend,
} from 'recharts'
import { MotionCard, hoverScale } from '@/components/ui/motion'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import type { DashboardStats } from '@/types'

const CHART_COLORS = ['#0d9488', '#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516']

const MOCK_FARM_VISITS = [
  { id: '1', farmer: 'Nguyễn Văn Minh', location: 'Dak Lak', type: 'Crop Monitoring', due: 'Today', priority: 'high' },
  { id: '2', farmer: 'Trần Thị Lan', location: 'Lam Dong', type: 'Pest Inspection', due: 'Today', priority: 'high' },
  { id: '3', farmer: 'Lê Hoàng Nam', location: 'Gia Lai', type: 'Harvest Verification', due: 'Tomorrow', priority: 'medium' },
  { id: '4', farmer: 'Phạm Minh Tú', location: 'Dak Nong', type: 'Cert Assessment', due: 'In 2 days', priority: 'low' },
  { id: '5', farmer: 'Hoàng Đức Anh', location: 'Kon Tum', type: 'Fertilizer Follow-up', due: 'In 3 days', priority: 'medium' },
]

const MOCK_CROP_ALERTS = [
  { id: '1', type: 'pest', severity: 'high', message: 'Coffee borer beetle detected — Dak Lak region', count: 12, icon: Bug },
  { id: '2', type: 'disease', severity: 'medium', message: 'Leaf rust spreading — Lam Dong farms', count: 8, icon: AlertTriangle },
  { id: '3', type: 'weather', severity: 'low', message: 'Heavy rain expected — Central Highlands', count: 3, icon: Droplets },
]

const MOCK_ACTIVITY = [
  { id: '1', action: 'Registered new farmer', entity: 'Nguyễn Thị Hoa — Dak Lak', time: '2 hrs ago' },
  { id: '2', action: 'Crop monitoring completed', entity: 'Farm F-1087 — Healthy', time: '3 hrs ago' },
  { id: '3', action: 'Pest alert filed', entity: 'Farm F-0923 — Leaf rust', time: '4 hrs ago' },
  { id: '4', action: 'Harvest entry recorded', entity: 'Lot #H-2026-0442 — 320kg', time: '5 hrs ago' },
  { id: '5', action: 'Fertilizer application logged', entity: 'Farm F-1105 — Organic NPK', time: '6 hrs ago' },
]

const MOCK_VISITS_BY_REGION = [
  { region: 'Dak Lak', completed: 28, pending: 12 },
  { region: 'Lam Dong', completed: 22, pending: 8 },
  { region: 'Gia Lai', completed: 15, pending: 10 },
  { region: 'Dak Nong', completed: 12, pending: 6 },
  { region: 'Kon Tum', completed: 8, pending: 5 },
]

const MOCK_HARVEST_TYPES = [
  { name: 'Arabica', value: 45, color: '#0d9488' },
  { name: 'Robusta', value: 40, color: '#8b5a1e' },
  { name: 'Excelsa', value: 10, color: '#d4a574' },
  { name: 'Liberica', value: 5, color: '#4a7c59' },
]

export default function FieldOfficerDashboard() {
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

  const totalFarmers = stats?.totalFarmers || 551
  const totalFarmLands = stats?.totalFarmLands || 420
  const pendingVisits = 5
  const cropAlertsCount = 3
  const harvestEntries = stats?.totalHarvestRecords || 0
  const certifiedFarmers = stats?.certifiedFarmersCount || 0

  const kpis = [
    { title: t2('Nông dân đã đăng ký', 'Registered Farmers'), value: totalFarmers, icon: Users, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Chuyến thăm hôm nay', 'Visits Due Today'), value: pendingVisits, icon: MapPin, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
    { title: t2('Cảnh báo cây trồng', 'Crop Alerts'), value: cropAlertsCount, icon: AlertTriangle, iconBg: 'bg-red-100 dark:bg-red-950', iconColor: 'text-red-600 dark:text-red-400' },
    { title: t2('Mục thu hoạch', 'Harvest Entries'), value: harvestEntries, icon: Wheat, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: t2('Diện tích canh tác', 'Farm Lands'), value: totalFarmLands, icon: TreePine, iconBg: 'bg-green-100 dark:bg-green-950', iconColor: 'text-green-600 dark:text-green-400' },
    { title: t2('Nông dân có chứng nhận', 'Certified Farmers'), value: certifiedFarmers, icon: Sprout, iconBg: 'bg-lime-100 dark:bg-lime-950', iconColor: 'text-lime-600 dark:text-lime-400' },
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
                  <p className="text-lg md:text-xl font-bold text-foreground leading-none">{kpi.value.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.title}</p>
                </div>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </StaggerItem>

      {/* Charts + Visits List */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Farm Visits by Region */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t2('Chuyến thăm theo vùng', 'Farm Visits by Region')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Hoàn thành vs. chờ xử lý', 'Completed vs. Pending')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_VISITS_BY_REGION} margin={{ bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="region" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="completed" name={t2('Hoàn thành', 'Completed')} fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="pending" name={t2('Chờ xử lý', 'Pending')} fill="#d97706" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Harvest Types Pie */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Wheat className="w-4 h-4 text-primary" />
                {t2('Loại thu hoạch', 'Harvest by Type')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={MOCK_HARVEST_TYPES} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" paddingAngle={3} stroke="none">
                    {MOCK_HARVEST_TYPES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(value) => [`${value}%`]} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Visits Due + Crop Alerts */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Upcoming Farm Visits */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  {t2('Chuyến thăm sắp tới', 'Upcoming Farm Visits')}
                </CardTitle>
                <Badge variant="outline" className="text-[9px]">{pendingVisits} {t2('chuyến', 'visits')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-2">
                  {MOCK_FARM_VISITS.map((visit) => {
                    const priorityColors: Record<string, string> = {
                      high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                      low: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                    }
                    return (
                      <div key={visit.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-foreground">{visit.farmer}</p>
                            <Badge variant="outline" className={`text-[8px] h-4 ${priorityColors[visit.priority]}`}>{visit.priority}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{visit.type} — {visit.location}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                          <CalendarDays className="w-3 h-3" />
                          {visit.due}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Crop Alerts */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                {t2('Cảnh báo cây trồng', 'Crop Alerts')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4 space-y-3">
              {MOCK_CROP_ALERTS.map((alert) => {
                const severityColors: Record<string, string> = {
                  high: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
                  medium: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
                  low: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
                }
                const severityBadge: Record<string, string> = {
                  high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                  low: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
                }
                return (
                  <div key={alert.id} className={`p-3 rounded-xl border ${severityColors[alert.severity]}`}>
                    <div className="flex items-start gap-3">
                      <alert.icon className="w-5 h-5 shrink-0 text-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-[8px] h-4 ${severityBadge[alert.severity]}`}>{alert.severity}</Badge>
                          <span className="text-[10px] text-muted-foreground">{alert.count} {t2('nông trại', 'farms')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              <Separator />

              {/* Recent Field Activity */}
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t2('Hoạt động gần đây', 'Recent Field Activity')}</p>
                {MOCK_ACTIVITY.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                    <Activity className="w-3 h-3 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground truncate">{a.action}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Quick Actions — Field Officer specific */}
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
                { icon: Users, label: t2('Đăng ký nông dân', 'Register Farmer'), href: '/farmers' },
                { icon: Wheat, label: t2('Ghi nhận thu hoạch', 'Record Harvest'), href: '/harvest' },
                { icon: TreePine, label: t2('Giám sát cây trồng', 'Crop Monitoring'), href: '/crop-monitorings' },
                { icon: Eye, label: t2('Kiểm tra dịch bệnh', 'Pest Inspection'), href: '/pest-disease' },
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
