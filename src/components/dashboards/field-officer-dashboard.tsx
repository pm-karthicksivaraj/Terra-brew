'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Users, Wheat, AlertTriangle,
  TrendingUp, Activity, Loader2, ClipboardList,
  Bug, TreePine, Zap, ChevronRight, CalendarDays,
  Sprout, Droplets, Eye, Inbox,
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-center p-6">
      <div>
        <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return <EmptyState message={message} />
}

export default function FieldOfficerDashboard() {
  const router = useRouter()
  const { t2 } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cropMonitorings, setCropMonitorings] = useState<any[]>([])
  const [farmVisits, setFarmVisits] = useState<any[]>([])

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

  const fetchCropMonitorings = useCallback(async () => {
    try {
      const res = await fetch('/api/crop-monitorings')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setCropMonitorings(records)
      }
    } catch (err) {
      console.error('Failed to fetch crop monitorings', err)
    }
  }, [])

  const fetchFarmVisits = useCallback(async () => {
    try {
      const res = await fetch('/api/farmers?pageSize=10')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setFarmVisits(records.slice(0, 5))
      }
    } catch (err) {
      console.error('Failed to fetch farmers', err)
    }
  }, [])

  useEffect(() => { fetchStats(); fetchCropMonitorings(); fetchFarmVisits() }, [fetchStats, fetchCropMonitorings, fetchFarmVisits])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const totalFarmers = stats?.totalFarmers || 0
  const totalFarmLands = stats?.totalFarmLands || 0
  const cropAlertsCount = stats?.totalCropMonitorings || 0
  const harvestEntries = stats?.totalHarvestRecords || 0
  const certifiedFarmers = stats?.certifiedFarmersCount || 0

  // Compute visits by region from farmersPerProvince
  const visitsByRegion = (stats?.farmersPerProvince || []).map((p) => ({
    region: p.province || 'Unknown',
    completed: p._count.province,
    pending: 0,
  }))

  // Compute harvest types from cultivationsByCrop
  const harvestTypes = (stats?.cultivationsByCrop || []).map((c, i) => ({
    name: c.cultivatedCrop || 'Unknown',
    value: c._count.cultivatedCrop,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  // Compute crop alerts from real crop monitoring data
  const cropAlerts = cropMonitorings.slice(0, 3).map((cm: any, i: number) => ({
    id: cm.id || String(i),
    type: cm.healthStatus === 'At Risk' ? 'pest' : cm.healthStatus === 'Needs Attention' ? 'disease' : 'weather',
    severity: cm.healthStatus === 'At Risk' ? 'high' : cm.healthStatus === 'Needs Attention' ? 'medium' : 'low',
    message: `${cm.healthStatus || 'Monitoring'} — ${cm.observationNotes || 'Crop monitoring record'}`,
    count: 1,
    icon: cm.healthStatus === 'At Risk' ? Bug : cm.healthStatus === 'Needs Attention' ? AlertTriangle : Droplets,
  }))

  // Compute activity from recentActivity
  const activityFeed = (stats?.recentActivity || []).slice(0, 3)

  const kpis = [
    { title: t2('Nông dân đã đăng ký', 'Registered Farmers'), value: totalFarmers, icon: Users, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Chuyến thăm hôm nay', 'Visits Due Today'), value: farmVisits.length, icon: MapPin, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
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
                {t2('Nông dân theo tỉnh', 'Farmers by province')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {visitsByRegion.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={visitsByRegion} margin={{ bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="region" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="completed" name={t2('Nông dân', 'Farmers')} fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có nông dân', 'Data will appear as farmers are registered')} />
                </div>
              )}
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
              {harvestTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={harvestTypes} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" paddingAngle={3} stroke="none">
                      {harvestTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có canh tác', 'Data will appear as cultivations are added')} />
                </div>
              )}
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
                <Badge variant="outline" className="text-[9px]">{farmVisits.length} {t2('chuyến', 'visits')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {farmVisits.length > 0 ? (
                <ScrollArea className="h-[280px] pr-2">
                  <div className="space-y-2">
                    {farmVisits.map((farmer: any) => (
                      <div key={farmer.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-foreground">{farmer.farmerName || farmer.name || 'Unknown'}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{farmer.province || 'Unknown region'}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                          <CalendarDays className="w-3 h-3" />
                          {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-[280px]">
                  <EmptyState message={t2('Chưa có chuyến thăm', 'No visits scheduled yet')} />
                </div>
              )}
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
              {cropAlerts.length > 0 ? (
                <>
                  {cropAlerts.map((alert) => {
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
                    const Icon = alert.icon
                    return (
                      <div key={alert.id} className={`p-3 rounded-xl border ${severityColors[alert.severity]}`}>
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 shrink-0 text-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-foreground">{alert.message}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[8px] h-4 ${severityBadge[alert.severity]}`}>{alert.severity}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <Separator />
                </>
              ) : (
                <div className="py-6">
                  <EmptyState message={t2('Không có cảnh báo', 'No alerts at this time')} />
                </div>
              )}

              {/* Recent Field Activity */}
              {activityFeed.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t2('Hoạt động gần đây', 'Recent Field Activity')}</p>
                  {activityFeed.map((a: any) => (
                    <div key={a.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                      <Activity className="w-3 h-3 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-foreground truncate">{a.action}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
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
