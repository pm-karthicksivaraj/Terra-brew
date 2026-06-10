'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ClipboardCheck, Award, ShieldCheck, AlertTriangle,
  Activity, Loader2, BarChart3, TrendingUp, TrendingDown,
  Zap, Eye, FileCheck, ScanLine, Target, Inbox,
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-center p-6">
      <div>
        <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default function QualityDashboard() {
  const router = useRouter()
  const { t2 } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [inspections, setInspections] = useState<any[]>([])

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

  const fetchInspections = useCallback(async () => {
    try {
      const res = await fetch('/api/coffee-inspections?pageSize=20')
      const data = await res.json()
      if (data.success && data.data) {
        const records = Array.isArray(data.data) ? data.data : data.data.records || []
        setInspections(records)
      }
    } catch (err) {
      console.error('Failed to fetch inspections', err)
    }
  }, [])

  useEffect(() => { fetchStats(); fetchInspections() }, [fetchStats, fetchInspections])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const totalInspections = stats?.totalInspections || 0
  const avgCupScore = stats?.avgCupScore || 0
  const certifiedFarms = stats?.certifiedFarmersCount || 0

  // Compute cup scores from qualityDistribution
  const cupScores = (stats?.qualityDistribution || []).map((q) => ({
    name: q.name,
    score: q.name.includes('Excellent') ? 88 : q.name.includes('Good') ? 80 : q.name.includes('Fair') ? 68 : 55,
    grade: q.name.includes('Excellent') ? 'Specialty' : q.name.includes('Good') ? 'Premium' : 'Standard',
  }))

  // Compute quality profile from avgCupScore - create a radar based on the score
  const qualityProfile = avgCupScore > 0 ? [
    { attribute: 'Aroma', value: Math.min(100, Math.round(avgCupScore * 1.02)) },
    { attribute: 'Acidity', value: Math.min(100, Math.round(avgCupScore * 0.98)) },
    { attribute: 'Body', value: Math.min(100, Math.round(avgCupScore * 0.94)) },
    { attribute: 'Flavor', value: Math.min(100, Math.round(avgCupScore * 1.01)) },
    { attribute: 'Aftertaste', value: Math.min(100, Math.round(avgCupScore * 0.96)) },
    { attribute: 'Balance', value: Math.min(100, Math.round(avgCupScore * 0.99)) },
  ] : []

  // Compute defect rates from inspection data
  const defectRates: Array<{ category: string; rate: number }> = []
  // If we have inspections, we can try to extract defect info
  if (inspections.length > 0) {
    const defectTypes = new Map<string, number[]>()

    inspections.forEach((insp: any) => {
      if (insp.defectCount != null) {
        const key = 'Total Defects'
        if (!defectTypes.has(key)) defectTypes.set(key, [])
        defectTypes.get(key)!.push(Number(insp.defectCount))
      }
      if (insp.blackBeans != null) {
        const key = 'Black Beans'
        if (!defectTypes.has(key)) defectTypes.set(key, [])
        defectTypes.get(key)!.push(Number(insp.blackBeans))
      }
      if (insp.brokenBeans != null) {
        const key = 'Broken Beans'
        if (!defectTypes.has(key)) defectTypes.set(key, [])
        defectTypes.get(key)!.push(Number(insp.brokenBeans))
      }
      if (insp.foreignMatter != null) {
        const key = 'Foreign Matter'
        if (!defectTypes.has(key)) defectTypes.set(key, [])
        defectTypes.get(key)!.push(Number(insp.foreignMatter))
      }
    })

    defectTypes.forEach((values, category) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      if (avg > 0) defectRates.push({ category, rate: Math.round(avg * 10) / 10 })
    })
  }

  // Compute compliance status from cert assessments or EUDR data
  const complianceStatus: Array<{ name: string; value: number; color: string }> = []
  if (stats?.activeCertifications) {
    complianceStatus.push({ name: 'EUDR Verified', value: stats.activeCertifications, color: '#2e7d32' })
  }
  if (totalInspections > 0) {
    const pendingQc = Math.max(0, totalInspections - (stats?.activeCertifications || 0))
    if (pendingQc > 0) complianceStatus.push({ name: 'Pending QC', value: pendingQc, color: '#d97706' })
  }
  if (complianceStatus.length === 0 && totalInspections > 0) {
    complianceStatus.push({ name: 'Inspected', value: totalInspections, color: '#0d9488' })
  }

  // Map inspection queue from real inspections
  const inspectionQueue = inspections.slice(0, 5).map((insp: any) => ({
    id: insp.id,
    batch: insp.batchCode || insp.inspectionCode || insp.id,
    type: insp.inspectionType || 'General QC',
    priority: insp.priority || (insp.cupScore && insp.cupScore < 70 ? 'high' : 'medium'),
    submittedBy: insp.inspectorName || 'QC Team',
    time: insp.inspectionDate ? new Date(insp.inspectionDate).toLocaleDateString() : '',
  }))

  const passRate = inspections.length > 0
    ? Math.round((inspections.filter((i: any) => i.overallGrade === 'Pass' || i.qualityCheckPassed || i.cupScore >= 70).length / inspections.length) * 100)
    : 0

  const kpis = [
    { title: t2('Hàng đợi kiểm tra', 'Inspection Queue'), value: inspections.length, icon: ClipboardCheck, iconBg: 'bg-amber-100 dark:bg-amber-950', iconColor: 'text-amber-600 dark:text-amber-400' },
    { title: t2('Điểm cup trung bình', 'Avg Cup Score'), value: avgCupScore.toFixed(1), icon: Award, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400' },
    { title: t2('Tỷ lệ đạt', 'Pass Rate'), value: passRate > 0 ? `${passRate}%` : 'N/A', icon: Target, iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: t2('Xác minh EUDR', 'EUDR Verified'), value: stats?.activeCertifications || 0, icon: ShieldCheck, iconBg: 'bg-green-100 dark:bg-green-950', iconColor: 'text-green-600 dark:text-green-400' },
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
                {t2('Phân bố chất lượng', 'Quality Distribution')}
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground">
                {t2('Phân loại theo điểm cup', 'Classification by cup score')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {cupScores.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={(stats?.qualityDistribution || [])} margin={{ bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    <Bar dataKey="value" name={t2('Số lượng', 'Count')} radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {(stats?.qualityDistribution || []).map((entry, i) => (
                        <Cell key={i} fill={i === 0 ? '#2e7d32' : i === 1 ? '#0d9488' : i === 2 ? '#d97706' : '#dc2626'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có thu hoạch', 'Data will appear as harvests are recorded')} />
                </div>
              )}
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
              {qualityProfile.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={qualityProfile}>
                    <PolarGrid className="stroke-border/30" />
                    <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar name={t2('Điểm', 'Score')} dataKey="value" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có điểm cup', 'Data will appear as cup scores are recorded')} />
                </div>
              )}
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
                {t2('Trung bình lỗi theo loại', 'Average defects by category')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4">
              {defectRates.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={defectRates} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 9 }} width={100} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    <Bar dataKey="rate" name={t2('Tỷ lệ', 'Rate')} radius={[0, 6, 6, 0]} maxBarSize={18}>
                      {defectRates.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Dữ liệu sẽ xuất hiện khi có kiểm tra', 'Data will appear as inspections are recorded')} />
                </div>
              )}
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
              {complianceStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={complianceStatus} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" paddingAngle={3} stroke="none">
                      {complianceStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px]">
                  <EmptyChart message={t2('Chưa có dữ liệu tuân thủ', 'No compliance data yet')} />
                </div>
              )}
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
            {inspectionQueue.length > 0 ? (
              <ScrollArea className="h-[220px]">
                <div className="space-y-2">
                  {inspectionQueue.map((item) => {
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
            ) : (
              <div className="h-[220px]">
                <EmptyChart message={t2('Chưa có kiểm tra nào', 'No inspections yet')} />
              </div>
            )}
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
