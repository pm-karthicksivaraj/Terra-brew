'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, MapPin, Wheat, TrendingUp, ShieldCheck,
  Package, Store, Award, FileText, Baby, ClipboardCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedCard, StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/animations'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ======== KPI DATA ========
const KPI_CARDS = [
  { title: 'Total Revenue', value: '$2.4M', change: '+12.5%', icon: DollarSign, gradient: 'kpi-emerald', changeType: 'positive' },
  { title: 'Total Farmers', value: '1,247', change: '+8.2%', icon: Users, gradient: 'kpi-teal', changeType: 'positive' },
  { title: 'Farm Area', value: '3,584 Ha', change: '+5.1%', icon: MapPin, gradient: 'kpi-amber', changeType: 'positive' },
  { title: 'Harvest Volume', value: '18.2T', change: '+15.3%', icon: Wheat, gradient: 'kpi-orange', changeType: 'positive' },
  { title: 'Avg Price/kg', value: '$4.85', change: '+3.2%', icon: TrendingUp, gradient: 'kpi-blue', changeType: 'positive' },
  { title: 'Quality Score', value: '84.5', change: '+2.1', icon: ShieldCheck, gradient: 'kpi-purple', changeType: 'positive' },
  { title: 'Procurement Orders', value: '342', change: '+18.7%', icon: Package, gradient: 'kpi-cyan', changeType: 'positive' },
  { title: 'Marketplace Listings', value: '89', change: '+6.4%', icon: Store, gradient: 'kpi-fuchsia', changeType: 'positive' },
  { title: 'Certified Farms', value: '456', change: '+11.2%', icon: Award, gradient: 'kpi-lime', changeType: 'positive' },
  { title: 'Smart Contracts', value: '67', change: '+22.1%', icon: FileText, gradient: 'kpi-sky', changeType: 'positive' },
  { title: 'Nurseries', value: '124', change: '+4.3%', icon: Baby, gradient: 'kpi-rose', changeType: 'positive' },
  { title: 'Inspections', value: '289', change: '+9.8%', icon: ClipboardCheck, gradient: 'kpi-pink', changeType: 'positive' },
]

// ======== CHART DATA ========
const supplyChainTrends = [
  { month: 'Jul', procurement: 65, processing: 45, shipping: 30 },
  { month: 'Aug', procurement: 78, processing: 58, shipping: 42 },
  { month: 'Sep', procurement: 90, processing: 72, shipping: 55 },
  { month: 'Oct', procurement: 85, processing: 68, shipping: 48 },
  { month: 'Nov', procurement: 95, processing: 80, shipping: 62 },
  { month: 'Dec', procurement: 88, processing: 75, shipping: 58 },
  { month: 'Jan', procurement: 72, processing: 60, shipping: 45 },
  { month: 'Feb', procurement: 82, processing: 65, shipping: 52 },
  { month: 'Mar', procurement: 92, processing: 78, shipping: 60 },
  { month: 'Apr', procurement: 98, processing: 85, shipping: 68 },
  { month: 'May', procurement: 105, processing: 90, shipping: 72 },
  { month: 'Jun', procurement: 110, processing: 95, shipping: 78 },
]

const cropDistribution = [
  { name: 'Arabica', value: 58, color: '#059669' },
  { name: 'Robusta', value: 28, color: '#d97706' },
  { name: 'Liberica', value: 8, color: '#7c3aed' },
  { name: 'Excelsa', value: 6, color: '#0891b2' },
]

// ======== PROCESSING PIPELINE ========
const PIPELINE_STEPS = [
  { step: 1, label: 'Cleaning', status: 'complete', icon: '✓' },
  { step: 2, label: 'Depulping', status: 'complete', icon: '✓' },
  { step: 3, label: 'Drying', status: 'complete', icon: '✓' },
  { step: 4, label: 'Grading', status: 'active', icon: '●' },
  { step: 5, label: 'Roasting', status: 'pending', icon: '○' },
  { step: 6, label: 'Packaging', status: 'pending', icon: '○' },
  { step: 7, label: 'QC', status: 'pending', icon: '○' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient-emerald inline-block">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">Welcome back to Terra Brew Coffee Platform</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Last updated:</span>
            <span className="text-xs font-medium">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </FadeIn>

      {/* KPI Cards Grid */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon
          return (
            <StaggerItem key={kpi.title}>
              <AnimatedCard>
                <Card className="card-lift overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-9 w-9 rounded-lg ${kpi.gradient} flex items-center justify-center`}>
                        <Icon className="h-4.5 w-4.5 text-white" />
                      </div>
                      <span className={`text-xs font-medium ${kpi.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {kpi.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{kpi.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Supply Chain Trends */}
        <FadeIn className="lg:col-span-2" delay={0.1}>
          <Card className="card-lift border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Supply Chain Trends</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly procurement, processing & shipping volumes</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={supplyChainTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.6 0 0)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.6 0 0)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.9 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="procurement" stroke="#059669" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="processing" stroke="#d97706" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="shipping" stroke="#0891b2" strokeWidth={2.5} dot={false} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Crop Distribution */}
        <FadeIn delay={0.2}>
          <Card className="card-lift border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Crop Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">By coffee variety</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.9 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Processing Pipeline Visualization */}
      <FadeIn delay={0.3}>
        <Card className="card-lift border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Processing Pipeline</CardTitle>
            <p className="text-xs text-muted-foreground">Current batch progress through 7-step processing</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {PIPELINE_STEPS.map((step, idx) => (
                <div key={step.step} className="flex items-center shrink-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl min-w-[80px] ${
                      step.status === 'complete'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                        : step.status === 'active'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : 'bg-muted/50 border border-dashed border-muted-foreground/20'
                    }`}
                  >
                    <span className={`text-lg ${
                      step.status === 'complete' ? 'text-emerald-600' : step.status === 'active' ? 'text-white' : 'text-muted-foreground'
                    }`}>
                      {step.icon}
                    </span>
                    <span className={`text-xs font-medium ${
                      step.status === 'complete' ? 'text-emerald-700' : step.status === 'active' ? 'text-white' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    <span className={`text-[10px] ${
                      step.status === 'complete' ? 'text-emerald-500' : step.status === 'active' ? 'text-emerald-100' : 'text-muted-foreground/60'
                    }`}>
                      Step {step.step}
                    </span>
                  </motion.div>
                  {idx < PIPELINE_STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 ${
                      step.status === 'complete' ? 'bg-emerald-400' : 'bg-muted-foreground/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Quick Stats from API if available */}
      {stats && (
        <FadeIn delay={0.4}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Live Database Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-emerald-600">{stats.totalFarmers || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Farmers</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-amber-600">{stats.totalFarmLands || 0}</p>
                  <p className="text-xs text-muted-foreground">Farm Lands</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCultivations || 0}</p>
                  <p className="text-xs text-muted-foreground">Cultivations</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-cyan-600">{stats.certifiedFarmers || 0}</p>
                  <p className="text-xs text-muted-foreground">Certified Farmers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
