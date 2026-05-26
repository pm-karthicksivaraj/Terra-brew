'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, TreePine, FileText, CheckCircle2,
  Clock, XCircle, ArrowRight, MapPin, Globe, CalendarDays,
  TrendingUp, Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem, PulseDot } from '@/components/ui/animations'
import Link from 'next/link'

// ======== ANIMATED COUNTER ========
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const startTime = useRef<number | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(eased * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [target, duration])

  return <>{count}</>
}

// ======== MINI DONUT CHART ========
function MiniDonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const circumference = 2 * Math.PI * 38
  // Pre-compute offsets for each segment
  const segmentOffsets = segments.map((seg, i) => {
    const prevTotal = segments.slice(0, i).reduce((sum, s) => sum + (total > 0 ? (s.value / total) * 100 : 0), 0)
    return prevTotal
  })

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const percent = total > 0 ? (seg.value / total) * 100 : 0
            const strokeDash = (percent / 100) * circumference
            const offset = (segmentOffsets[i] / 100) * circumference

            return (
              <motion.circle
                key={i}
                cx="50" cy="50" r="38" fill="none"
                stroke={seg.color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                strokeDashoffset={-offset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold">{total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs font-medium">{seg.label}</span>
            <span className="text-xs text-muted-foreground">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ======== SIMPLE AREA CHART (SVG) ========
function ComplianceAreaChart() {
  const data = [
    { month: 'Jul', compliant: 12, total: 18 },
    { month: 'Aug', compliant: 18, total: 24 },
    { month: 'Sep', compliant: 22, total: 28 },
    { month: 'Oct', compliant: 28, total: 32 },
    { month: 'Nov', compliant: 35, total: 40 },
    { month: 'Dec', compliant: 42, total: 48 },
    { month: 'Jan', compliant: 48, total: 52 },
    { month: 'Feb', compliant: 55, total: 60 },
    { month: 'Mar', compliant: 62, total: 68 },
    { month: 'Apr', compliant: 68, total: 75 },
    { month: 'May', compliant: 78, total: 85 },
    { month: 'Jun', compliant: 89, total: 96 },
  ]

  const maxVal = Math.max(...data.map(d => d.total))
  const width = 500
  const height = 160
  const padding = { top: 10, right: 10, bottom: 25, left: 35 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW
  const yScale = (v: number) => padding.top + chartH - (v / maxVal) * chartH

  const totalPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.total)}`).join(' ')
  const compliantPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.compliant)}`).join(' ')

  const compliantAreaPath = compliantPath + ` L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`
  const totalAreaPath = totalPath + ` L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <line key={frac} x1={padding.left} x2={width - padding.right} y1={yScale(maxVal * frac)} y2={yScale(maxVal * frac)} stroke="currentColor" strokeWidth="0.5" className="text-muted/30" />
      ))}
      {/* Y axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <text key={frac} x={padding.left - 5} y={yScale(maxVal * frac) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">{Math.round(maxVal * frac)}</text>
      ))}
      {/* X axis labels */}
      {data.map((d, i) => (
        <text key={i} x={xScale(i)} y={height - 5} textAnchor="middle" className="fill-muted-foreground text-[9px]">{d.month}</text>
      ))}
      {/* Total area */}
      <motion.path
        d={totalAreaPath}
        fill="rgba(217,119,6,0.08)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.path
        d={totalPath}
        fill="none" stroke="#d97706" strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />
      {/* Compliant area */}
      <motion.path
        d={compliantAreaPath}
        fill="rgba(5,150,105,0.12)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.path
        d={compliantPath}
        fill="none" stroke="#059669" strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />
      {/* Dots */}
      {data.map((d, i) => (
        <g key={i}>
          <motion.circle cx={xScale(i)} cy={yScale(d.compliant)} r="2.5" fill="#059669"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }} />
          <motion.circle cx={xScale(i)} cy={yScale(d.total)} r="2.5" fill="#d97706"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }} />
        </g>
      ))}
    </svg>
  )
}

// ======== EUDR KPI DATA ========
const EUDR_KPIS = [
  { title: 'Total Assessments', value: 156, change: '+12', icon: ShieldCheck, gradient: 'kpi-emerald' },
  { title: 'Compliant', value: 124, change: '+8', icon: CheckCircle2, gradient: 'kpi-teal' },
  { title: 'In Review', value: 18, change: '+3', icon: Clock, gradient: 'kpi-amber' },
  { title: 'Non-Compliant', value: 14, change: '-2', icon: XCircle, gradient: 'kpi-rose' },
]

const COMPLIANCE_DONUT = [
  { value: 89, color: '#059669', label: 'Low Risk' },
  { value: 35, color: '#d97706', label: 'Medium Risk' },
  { value: 18, color: '#ea580c', label: 'High Risk' },
  { value: 14, color: '#dc2626', label: 'Critical' },
]

const COMPLIANCE_BY_RISK = [
  { level: 'Low Risk', count: 89, percentage: 57, color: 'bg-emerald-500' },
  { level: 'Medium Risk', count: 35, percentage: 22, color: 'bg-amber-500' },
  { level: 'High Risk', count: 18, percentage: 12, color: 'bg-orange-500' },
  { level: 'Critical Risk', count: 14, percentage: 9, color: 'bg-red-500' },
]

const REGION_GRID = [
  { name: 'Dak Lak', risk: 'low', assessed: 28, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Lam Dong', risk: 'low', assessed: 22, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Gia Lai', risk: 'medium', assessed: 18, color: 'bg-amber-100 text-amber-700' },
  { name: 'Dak Nong', risk: 'low', assessed: 15, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Kon Tum', risk: 'medium', assessed: 12, color: 'bg-amber-100 text-amber-700' },
  { name: 'Son La', risk: 'high', assessed: 10, color: 'bg-orange-100 text-orange-700' },
  { name: 'Quang Tri', risk: 'low', assessed: 8, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Nghe An', risk: 'critical', assessed: 6, color: 'bg-red-100 text-red-700' },
]

// EUDR Deadline: Dec 30, 2025
const EUDR_DEADLINE = new Date('2025-12-30')
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const diff = Math.max(0, EUDR_DEADLINE.getTime() - now.getTime())
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      setTimeLeft({ days, hours, minutes })
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hrs' },
        { value: timeLeft.minutes, label: 'Min' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 min-w-[50px]">
            <p className="text-xl font-bold">{String(item.value).padStart(2, '0')}</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

const RECENT_ACTIVITY = [
  { id: 1, type: 'compliant', message: 'Highland Farm A passed EUDR assessment', time: '2 hours ago' },
  { id: 2, type: 'in_review', message: 'Valley Farm B assessment under review', time: '4 hours ago' },
  { id: 3, type: 'non_compliant', message: 'Hillside Farm C flagged for deforestation risk', time: '1 day ago' },
  { id: 4, type: 'compliant', message: 'Riverside Farm D received low risk score', time: '2 days ago' },
  { id: 5, type: 'in_review', message: 'DDS-006 submitted for TRACES verification', time: '3 days ago' },
]

export default function EudrPage() {
  const [compliances, setCompliances] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/eudr-compliance')
      .then(r => r.json())
      .then(data => setCompliances(Array.isArray(data) ? data : data.items || []))
      .catch(() => {})
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gradient-emerald inline-block">EUDR Compliance</h2>
            <p className="text-sm text-muted-foreground mt-1">EU Deforestation Regulation compliance dashboard</p>
          </div>
          <div className="flex gap-2">
            <Link href="/eudr/deforestation">
              <Button variant="outline" size="sm">
                <TreePine className="h-4 w-4 mr-2" /> Deforestation Map
              </Button>
            </Link>
            <Link href="/eudr/dds">
              <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                <FileText className="h-4 w-4 mr-2" /> New DDS
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* KPI Cards with Animated Counters */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {EUDR_KPIS.map((kpi) => {
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
                      <span className="text-xs font-medium text-emerald-600">{kpi.change}</span>
                    </div>
                    <p className="text-xl font-bold"><AnimatedCounter target={kpi.value} /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.title}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* EUDR Deadline Countdown */}
      <FadeIn delay={0.1}>
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">EUDR Enforcement Deadline</p>
                <p className="text-xs text-emerald-100">December 30, 2025 — All operators must comply</p>
              </div>
            </div>
            <CountdownTimer />
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Compliance Timeline Chart */}
        <FadeIn className="lg:col-span-2" delay={0.15}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> Compliance Trend
                </CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Compliant</div>
                  <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Total Assessed</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ComplianceAreaChart />
            </CardContent>
          </Card>
        </FadeIn>

        {/* Donut Chart */}
        <FadeIn delay={0.2}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <MiniDonutChart segments={COMPLIANCE_DONUT} />
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Risk Map Grid */}
        <FadeIn delay={0.25}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> Regional Risk Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {REGION_GRID.map((region) => (
                  <div key={region.name} className="p-2.5 rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{region.name}</p>
                      <Badge className={`text-[9px] px-1.5 py-0 ${region.color}`}>{region.risk}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{region.assessed} assessed</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Recent Activity Feed */}
        <FadeIn className="lg:col-span-2" delay={0.3}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" /> Recent Activity
                </CardTitle>
                <Link href="/eudr/deforestation">
                  <Button variant="ghost" size="sm" className="text-emerald-600">View All <ArrowRight className="h-3 w-3 ml-1" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {RECENT_ACTIVITY.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.type === 'compliant' ? 'bg-emerald-100 text-emerald-600' :
                      item.type === 'non_compliant' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {item.type === 'compliant' ? <CheckCircle2 className="h-4 w-4" /> :
                       item.type === 'non_compliant' ? <XCircle className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.message}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Risk Level Bars */}
      <FadeIn delay={0.35}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Risk Level Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-4 gap-4">
            {COMPLIANCE_BY_RISK.map((risk) => (
              <div key={risk.level} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${risk.color}`} />
                    <span className="text-sm font-medium">{risk.level}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{risk.count} ({risk.percentage}%)</span>
                </div>
                <Progress value={risk.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>

      {/* EUDR Quick Links */}
      <FadeIn delay={0.4}>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/eudr/deforestation">
            <Card className="card-lift border-0 shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-500/30 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <TreePine className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">Deforestation Assessment</p>
                  <p className="text-xs text-muted-foreground">Satellite imagery & land use analysis</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/eudr/dds">
            <Card className="card-lift border-0 shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-500/30 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold">Due Diligence Statement</p>
                  <p className="text-xs text-muted-foreground">Generate & submit DDS to EU TRACES</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/shipments">
            <Card className="card-lift border-0 shadow-sm cursor-pointer hover:ring-2 hover:ring-emerald-500/30 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <p className="font-semibold">Export Shipments</p>
                  <p className="text-xs text-muted-foreground">Manage EU-bound shipments</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </FadeIn>
    </div>
  )
}
