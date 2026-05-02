'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { getDashboardStats, getFarmers, getFarmLands, getCultivations, getCertifications, getInspections } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Map,
  Sprout,
  Award,
  ClipboardCheck,
  Package,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const COLORS = ['#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d', '#ea580c']

const statCards = [
  { key: 'totalFarmers', label: 'Total Farmers', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'totalFarmLands', label: 'Farm Lands', icon: Map, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'totalCultivations', label: 'Cultivations', icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'activeCertifications', label: 'Active Certs', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'pendingInspections', label: 'Pending Inspections', icon: ClipboardCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'recentHarvests', label: 'Recent Harvests', icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
]

export function DashboardView() {
  const { selectedModule, dashboardStats, setDashboardStats, setIsLoading, isLoading } = useAppStore()

  useEffect(() => {
    if (!selectedModule) return

    async function loadDashboard() {
      setIsLoading(true)
      try {
        const stats = await getDashboardStats(selectedModule.id)
        setDashboardStats(stats)
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [selectedModule, setDashboardStats, setIsLoading])

  if (!dashboardStats && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <TrendingUp className="h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Data Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Seed demo data or create entries to see your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your agricultural ecosystem</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = dashboardStats?.[card.key as keyof typeof dashboardStats] as number
          return (
            <Card key={card.key} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? <Skeleton className="h-8 w-12" /> : (value ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bar Chart - Farmers per Province */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Farmers by Province</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.farmersPerProvince?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dashboardStats.farmersPerProvince}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="province" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Cultivation by Crop */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cultivations by Crop</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.cultivationsByCrop?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={dashboardStats.cultivationsByCrop}
                    dataKey="count"
                    nameKey="crop"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ crop, percent }) => `${crop} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dashboardStats.cultivationsByCrop.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Chart - Harvest Trends */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Harvest Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardStats?.harvestTrends?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dashboardStats.harvestTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardStats?.recentActivities?.length ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardStats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-emerald-50/50 transition-colors">
                  <Badge
                    variant={activity.type === 'farmer' ? 'default' : 'secondary'}
                    className={
                      activity.type === 'farmer'
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
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
