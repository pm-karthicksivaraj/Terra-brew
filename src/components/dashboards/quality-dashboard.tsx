'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ClipboardCheck, Award, ShieldCheck, AlertTriangle,
  Activity, Loader2, BarChart3, TrendingUp, TrendingDown,
  Zap, Eye, FileCheck, ScanLine, Target,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/i18n'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import { MotionCard, hoverScale } from '@/components/ui/motion'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import type { DashboardStats } from '@/types'

const CHART_COLORS = ['#0d9488', '#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516']

const MOCK_INSPECTION_QUEUE = [
  { id: '1', batch: 'B-4419', type: 'Cup Score', priority: 'high', submittedBy: 'Procurement Team', time: '10 min ago' },
  { id: '2', batch: 'B-4420', type: 'Defect Analysis', priority: 'medium', submittedBy: 'Processing Plant A', time: '25 min ago' },
  { id: '3', batch: 'B-4421', type: 'Moisture Check', priority: 'medium', submittedBy: 'Warehouse Team', time: '1 hr ago' },
  { id: '4', batch: 'B-4422', type: 'Full QC', priority: 'low', submittedBy: 'Procurement Team', time: '2 hrs ago' },
  { id: '5', batch: 'B-4423', type: 'EUDR Verification', priority: 'high', submittedBy: 'Compliance Team', time: '3 hrs ago' },
]

const MOCK_CUP_SCORES = [
  { name: 'Arabica SHB', score: 86.5, grade: 'Specialty' },
  { name: 'Robusta Grade 1', score: 78.2, grade: 'Premium' },
  { name: 'Arabica HB', score: 82.1, grade: 'Premium' },
  { name: 'Robusta Grade 2', score: 74.5, grade: 'Standard' },
  { name: 'Arabica GP', score: 80.3, grade: 'Premium' },
  { name: 'Robusta Screen 16', score: 71.8, grade: 'Standard' },
]

const MOCK_DEFECT_RATES = [
  { category: 'Black Beans', rate: 2.1 },
  { category: 'Broken Beans', rate: 3.5 },
  { category: 'Insect Damage', rate: 1.8 },
  { category: 'Sour Beans', rate: 0.9 },
  { category: 'Foreign Matter', rate: 1.2 },
  { category: 'Hull Fragments', rate: 2.8 },
]

const MOCK_QUALITY_PROFILE = [
  { attribute: 'Aroma', value: 85 },
  { attribute: 'Acidity', value: 82 },
  { attribute: 'Body', value: 78 },
  { attribute: 'Flavor', value: 84 },
  { attribute: 'Aftertaste', value: 80 },
  { attribute: 'Balance', value: 83 },
]

const MOCK_COMPLIANCE_STATUS = [
  { name: 'EUDR Verified', value: 42, color: '#2e7d32' },
  { name: 'Pending QC', value: 18, color: '#d97706' },
  { name: 'Failed QC', value: 5, color: '#dc2626' },
  { name: 'Exempt', value: 12, color: '#9ca3af' },
]

export default function QualityDashboard() {
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

  const totalInspections = stats?.totalInspections || 0
  const avgCupScore = stats?.avgCupScore || 83.6
  const queueItems = 5
  const passRate = 92
  const certifiedFarms = stats?.certifiedFarmersCount || 0
  const eudrVerified = 42

  const kpis = [
    { title: t2('Hàng đợi kiểm tra', 'Inspection Queue'), value: queueItems, icon: ClipboardCheck, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
    { title: t2('Điểm cup trung bình', 'Avg Cup Score'), value: avgCupScore.toFixed(1), icon: Award, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Tỷ lệ đạt', 'Pass Rate'), value: `${passRate}%`, icon: Target, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: t2('Xác minh EUDR', 'EUDR Verified'), value: eudrVerified, icon: ShieldCheck, iconBg: 'bg-green-100 dark:bg-green-950', iconColor: 'text-green-600 dark:text-green-400' },
    { title: t2('Tổng kiểm tra', 'Total Inspections'), value: totalInspections, icon: FileCheck, iconBg: 'bg-cyan-100 dark:bg-cyan-950', iconColor: 'text-cyan-600 dark:text-cyan-400' },
    { title: t2('Nông trại có chứng nhận', 'Certified Farms'), value: certifiedFarms, icon: ScanLine, iconBg: 'bg-purple-100 dark:bg-purple-950', iconColor: 'text-purple-600 dark:text-purple-400' },
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
          {/* Cup Scores Bar Chart */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                {t2('Điểm Cup theo loại', 'Cup Scores by Type')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Điểm chất lượng gần đây', 'Recent quality scores')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_CUP_SCORES} margin={{ bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 9 }} domain={[60, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Bar dataKey="score" name={t2('Điểm Cup', 'Cup Score')} radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {MOCK_CUP_SCORES.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 85 ? '#2e7d32' : entry.score >= 75 ? '#0d9488' : '#d97706'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quality Profile Radar */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                {t2('Hồ sơ chất lượng', 'Quality Profile')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Đánh giá cảm quan', 'Sensory evaluation breakdown')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={MOCK_QUALITY_PROFILE}>
                  <PolarGrid className="stroke-border/30" />
                  <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name={t2('Điểm', 'Score')} dataKey="value" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Charts Row 2 */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Defect Rates */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                {t2('Tỷ lệ lỗi', 'Defect Rates')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Phần trăm lỗi theo loại', 'Defect percentage by category')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_DEFECT_RATES} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis type="number" tick={{ fontSize: 9 }} unit="%" />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 9 }} width={100} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} formatter={(value) => [`${value}%`]} />
                  <Bar dataKey="rate" name={t2('Tỷ lệ', 'Rate')} radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {MOCK_DEFECT_RATES.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Compliance Status Pie */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t2('Trạng thái tuân thủ', 'Compliance Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={MOCK_COMPLIANCE_STATUS} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" paddingAngle={3} stroke="none">
                    {MOCK_COMPLIANCE_STATUS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Inspection Queue */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              {t2('Hàng đợi kiểm tra', 'Inspection Queue')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <ScrollArea className="h-[220px]">
              <div className="space-y-2">
                {MOCK_INSPECTION_QUEUE.map((item) => {
                  const priorityColors: Record<string, string> = {
                    high: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
                    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
                    low: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                  }
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px]">{item.batch}</Badge>
                          <span className="text-xs font-medium text-foreground">{item.type}</span>
                          <Badge className={`text-[8px] h-4 ${priorityColors[item.priority]}`}>{item.priority}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{item.submittedBy} — {item.time}</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-[10px] h-7 rounded-lg">{t2('Kiểm tra', 'Inspect')}</Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
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
                { icon: ClipboardCheck, label: t2('Kiểm tra mới', 'New Inspection'), href: '/coffee-inspections' },
                { icon: ShieldCheck, label: t2('Xác minh EUDR', 'EUDR Verify'), href: '/eudr-compliance' },
                { icon: FileCheck, label: t2('Xác nhận QC', 'QC Verification'), href: '/qc-verifications' },
                { icon: Award, label: t2('Đánh giá chứng nhận', 'Cert Assessment'), href: '/cert-assessments' },
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
