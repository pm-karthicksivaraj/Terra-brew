'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { getDashboardStats } from '@/lib/spa-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AnimatedCard, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/animations'
import {
  Users, Map, Sprout, Award, ClipboardCheck, Package, TrendingUp,
  Sparkles, Cog, Sun, Filter, Flame, PackageOpen, BarChart3, ArrowRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

const COLORS = ['#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d']

const statCards = [
  { key: 'totalFarmers', label: 'Total Farmers', icon: Users, gradient: 'kpi-emerald' },
  { key: 'totalFarmLands', label: 'Farm Lands', icon: Map, gradient: 'kpi-amber' },
  { key: 'totalCultivations', label: 'Cultivations', icon: Sprout, gradient: 'kpi-blue' },
  { key: 'activeCertifications', label: 'Active Certs', icon: Award, gradient: 'kpi-purple' },
  { key: 'pendingInspections', label: 'Pending Inspections', icon: ClipboardCheck, gradient: 'kpi-rose' },
  { key: 'totalBatches', label: 'Batches Traced', icon: Package, gradient: 'kpi-teal' },
]

const pipelineSteps = [
  { label: 'Cleaning', icon: Sparkles, color: 'text-blue-600' },
  { label: 'Depulping', icon: Cog, color: 'text-green-600' },
  { label: 'Drying', icon: Sun, color: 'text-amber-600' },
  { label: 'Grading', icon: Filter, color: 'text-orange-600' },
  { label: 'Roasting', icon: Flame, color: 'text-red-600' },
  { label: 'Grinding', icon: PackageOpen, color: 'text-purple-600' },
  { label: 'QC', icon: BarChart3, color: 'text-teal-600' },
]

export function DashboardView() {
  const { currentUser, dashboardStats, setDashboardStats, setIsLoading } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        const stats = await getDashboardStats()
        setDashboardStats(stats)
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    if (currentUser) loadDashboard()
  }, [currentUser, setDashboardStats])

  if (!dashboardStats && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <TrendingUp className="h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Data Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Seed demo data or create entries to see your dashboard.</p>
      </div>
    )
  }

  const stats = dashboardStats as any

  return (
    <div className="p-4 md:p-6 space-y-6">
      <FadeIn>
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of your agricultural ecosystem</p>
        </div>
      </FadeIn>

      {/* Premium KPI Cards */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = stats?.[card.key] as number
          return (
            <StaggerItem key={card.key}>
              <AnimatedCard>
                <div className={`rounded-xl p-4 ${card.gradient} text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="h-5 w-5 text-white/80" />
                    </div>
                    {loading ? (
                      <Skeleton className="h-8 w-12 bg-white/20" />
                    ) : (
                      <p className="text-2xl font-bold">{value ?? 0}</p>
                    )}
                    <p className="text-xs text-white/70 mt-1">{card.label}</p>
                  </div>
                </div>
              </AnimatedCard>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* Processing Pipeline Visualization */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-600" />
              Processing Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {pipelineSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className={`h-10 w-10 rounded-full border-2 border-dashed ${i < 3 ? 'border-emerald-400 bg-emerald-50' : 'border-muted-foreground/20 bg-muted/30'} flex items-center justify-center transition-colors`}>
                        <Icon className={`h-4 w-4 ${i < 3 ? step.color : 'text-muted-foreground/40'}`} />
                      </div>
                      <span className={`text-[10px] mt-1 ${i < 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
                      {i < 3 && <div className="h-1 w-1 rounded-full bg-emerald-500 mt-0.5" />}
                    </div>
                    {i < pipelineSteps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 mx-1 shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FadeIn delay={0.3}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Farmers by Province</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.farmersPerProvince?.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.farmersPerProvince}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="province" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cultivations by Crop</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.cultivationsByCrop?.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.cultivationsByCrop}
                      dataKey="count"
                      nameKey="crop"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ crop, percent }: any) => `${crop} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.cultivationsByCrop.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Harvest Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.harvestTrends?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.harvestTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Recent Activity */}
      <FadeIn delay={0.45}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivities?.length ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-emerald-50/50 transition-colors">
                    <Badge
                      className={
                        activity.type === 'Farmer'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      }
                    >
                      {activity.type}
                    </Badge>
                    <p className="text-sm text-gray-700 flex-1">{activity.description}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
