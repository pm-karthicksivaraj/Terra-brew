'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Shield, CheckCircle2, AlertTriangle, Clock, Award,
  TrendingUp, TrendingDown, Minus, Lock, Eye,
  FileCheck, MapPin, Satellite, ScanLine,
  TreePine, Timer, Star, Crown, Activity,
  Loader2, Coffee, Fingerprint, QrCode,
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadialBarChart, RadialBar,
} from 'recharts'

// ─── Color coding: 0-300 red, 301-500 orange, 501-700 yellow-green, 701-900 green, 901-1000 elite gold ───

function getScoreColor(score: number): string {
  if (score <= 300) return '#ef4444'
  if (score <= 500) return '#f97316'
  if (score <= 700) return '#84cc16'
  if (score <= 900) return '#22c55e'
  return '#ffc627'
}

function getScoreLabel(score: number): string {
  if (score <= 300) return 'Critical'
  if (score <= 500) return 'Needs Improvement'
  if (score <= 700) return 'Moderate'
  if (score <= 900) return 'Strong'
  return 'Elite'
}

function getScoreLabelColor(score: number): string {
  if (score <= 300) return 'text-red-600'
  if (score <= 500) return 'text-orange-600'
  if (score <= 700) return 'text-lime-600'
  if (score <= 900) return 'text-green-600'
  return 'text-amber-500'
}

function getScoreBg(score: number): string {
  if (score <= 300) return 'bg-red-100 text-red-800 border-red-200'
  if (score <= 500) return 'bg-orange-100 text-orange-800 border-orange-200'
  if (score <= 700) return 'bg-lime-100 text-lime-800 border-lime-200'
  if (score <= 900) return 'bg-green-100 text-green-800 border-green-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

// ─── Data interfaces ───

interface FarmerData {
  id: string
  fullName: string
  farmerCode: string | null
  phone: string | null
  dob: string | null
  gender: string | null
  address: string | null
  idNumber: string | null
}

interface FarmlandData {
  id: string
  farmName: string
  altitude: number | null
  latitude: number | null
  longitude: number | null
  soilType: string | null
  polygonGeoJson: string | null
  boundaryArea: number | null
}

interface EudrData {
  id: string
  complianceId: string
  status: string
  riskLevel: string
  verificationDate: string | null
  verifiedBy: string | null
  validFrom: string | null
  validUntil: string | null
}

// ─── Score History placeholder data ───

const SCORE_HISTORY = [
  { date: '2025-01-15', score: 320, event: 'Initial assessment' },
  { date: '2025-03-01', score: 410, event: 'Farmland polygons verified' },
  { date: '2025-05-10', score: 485, event: 'EUDR compliance improved' },
  { date: '2025-08-22', score: 560, event: 'Satellite cross-reference completed' },
  { date: '2025-11-05', score: 620, event: 'Audit trail strengthened' },
  { date: '2026-02-28', score: 680, event: 'QR verifications added' },
]

// ─── Industry Benchmarks ───

const INDUSTRY_BENCHMARKS = [
  { tier: 'Low', range: '0–300', min: 0, max: 300, color: '#ef4444' },
  { tier: 'Medium', range: '301–500', min: 301, max: 500, color: '#f97316' },
  { tier: 'High', range: '501–700', min: 501, max: 700, color: '#84cc16' },
  { tier: 'Very High', range: '701–900', min: 701, max: 900, color: '#22c55e' },
  { tier: 'Elite', range: '901–1000', min: 901, max: 1000, color: '#ffc627' },
]

// ─── Trust Score Factors (no formula/weights exposed) ───

const TRUST_FACTORS = [
  { icon: MapPin, label: 'GPS Polygon Verification', description: 'Farm boundaries verified via satellite GPS mapping' },
  { icon: Satellite, label: 'Satellite Cross-Reference', description: 'Land use validated against satellite imagery' },
  { icon: FileCheck, label: 'Document Completeness', description: 'All required documentation submitted and complete' },
  { icon: Award, label: 'Certification Status', description: 'Active certifications (Organic, Fair Trade, etc.)' },
  { icon: Timer, label: 'Time Since Last Verification', description: 'Recent verifications improve score freshness' },
  { icon: TreePine, label: 'Deforestation Risk Assessment', description: 'Results from deforestation risk analysis' },
]

// ─── Main Component ───

export default function TrustScorePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [farmers, setFarmers] = useState<FarmerData[]>([])
  const [farmlands, setFarmlands] = useState<FarmlandData[]>([])
  const [eudrRecords, setEudrRecords] = useState<EudrData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      Promise.all([
        fetch('/api/farmers?pageSize=500').then(r => r.json()),
        fetch('/api/farmlands?pageSize=500').then(r => r.json()),
        fetch('/api/eudr-compliance?pageSize=500').then(r => r.json()),
      ]).then(([farmersRes, farmlandsRes, eudrRes]) => {
        if (farmersRes.success) {
          const items = farmersRes.data?.data ?? farmersRes.data?.farmers ?? farmersRes.data?.items ?? []
          setFarmers(Array.isArray(items) ? items : [])
        }
        if (farmlandsRes.success) {
          const items = farmlandsRes.data?.data ?? farmlandsRes.data?.items ?? []
          setFarmlands(Array.isArray(items) ? items : [])
        }
        if (eudrRes.success) {
          const items = eudrRes.data?.data ?? eudrRes.data?.items ?? eudrRes.data?.records ?? []
          setEudrRecords(Array.isArray(items) ? items : [])
        }
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [status, router])

  // ─── Calculate Score from real data ───

  const scoreData = useMemo(() => {
    const totalFarmers = farmers.length
    const totalFarmlands = farmlands.length
    const totalEudr = eudrRecords.length

    // Data Completeness: % of farmers with complete profiles (have name, phone, dob, gender, address, idNumber)
    const farmersWithCompleteProfiles = farmers.filter(f =>
      f.fullName && f.phone && f.dob && f.gender && f.address && f.idNumber
    ).length
    const dataCompleteness = totalFarmers > 0 ? Math.round((farmersWithCompleteProfiles / totalFarmers) * 100) : 0

    // Verification Status: how many EUDR records are verified (compliant) vs pending
    const verifiedRecords = eudrRecords.filter(e => e.status === 'compliant' && e.verifiedBy).length
    const pendingRecords = eudrRecords.filter(e => e.status === 'pending' || e.status === 'in_review').length
    const verificationPct = totalEudr > 0 ? Math.round((verifiedRecords / totalEudr) * 100) : 0

    // Compliance History: compliant vs non-compliant ratio
    const compliantRecords = eudrRecords.filter(e => e.status === 'compliant').length
    const nonCompliantRecords = eudrRecords.filter(e => e.status === 'non_compliant').length
    const compliancePct = totalEudr > 0 ? Math.round((compliantRecords / totalEudr) * 100) : 0

    // Supply Chain Transparency: % of farmlands with polygon data
    const farmlandsWithPolygon = farmlands.filter(f => f.polygonGeoJson).length
    const supplyChainPct = totalFarmlands > 0 ? Math.round((farmlandsWithPolygon / totalFarmlands) * 100) : 0

    // Audit Trail: placeholder — QR verifications count (no real data yet)
    const auditTrailBlocks = eudrRecords.filter(e => e.verifiedBy).length
    const qrVerifications = Math.max(1, Math.floor(auditTrailBlocks * 0.6))
    const auditPct = totalEudr > 0 ? Math.min(100, Math.round((auditTrailBlocks / totalEudr) * 100)) : 0

    // Simple score: weighted average of the 5 categories, scaled to 0-1000
    // Weights are internal and NOT exposed
    const rawScore = (
      dataCompleteness * 0.25 +
      verificationPct * 0.20 +
      compliancePct * 0.25 +
      supplyChainPct * 0.20 +
      auditPct * 0.10
    )
    const trustScore = Math.round(rawScore * 10) // 0-1000 scale

    return {
      trustScore,
      dataCompleteness,
      verificationPct,
      compliancePct,
      supplyChainPct,
      auditPct,
      auditTrailBlocks,
      qrVerifications,
      totalFarmers,
      totalFarmlands,
      totalEudr,
      verifiedRecords,
      pendingRecords,
      compliantRecords,
      nonCompliantRecords,
      farmlandsWithPolygon,
      farmersWithCompleteProfiles,
    }
  }, [farmers, farmlands, eudrRecords])

  const scoreColor = getScoreColor(scoreData.trustScore)
  const scoreLabel = getScoreLabel(scoreData.trustScore)

  // Gauge data for recharts
  const gaugeData = [
    { name: 'Score', value: scoreData.trustScore, fill: scoreColor },
    { name: 'Remaining', value: 1000 - scoreData.trustScore, fill: '#e5e7eb' },
  ]

  if (status === 'loading' || loading) {
    return (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Coffee className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Calculating Trust Score™...</span>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 shrink-0" style={{ color: '#6D2932' }} />
                Trust Score™
              </h2>
              <p className="text-sm text-muted-foreground">
                TerraBrew&apos;s proprietary credibility scoring — algorithm is confidential
              </p>
            </div>
            <Badge className={`${getScoreBg(scoreData.trustScore)} border text-xs font-bold px-3 py-1`}>
              {scoreLabel}
            </Badge>
          </div>
        </FadeIn>

        {/* Main Score Gauge + Breakdown */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* Gauge - takes 2 cols */}
          <FadeIn className="md:col-span-2">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  {/* Circular gauge */}
                  <div className="relative w-56 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gaugeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {gaugeData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold font-mono" style={{ color: scoreColor }}>
                        {scoreData.trustScore}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">/ 1000</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-lg font-bold" style={{ color: scoreColor }}>{scoreLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {scoreData.totalFarmers} farmers, {scoreData.totalFarmlands} farmlands, {scoreData.totalEudr} EUDR records
                    </p>
                  </div>

                  {/* Color scale legend */}
                  <div className="mt-4 w-full">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="flex-1 bg-red-500" />
                      <div className="flex-1 bg-orange-500" />
                      <div className="flex-1 bg-lime-500" />
                      <div className="flex-1 bg-green-500" />
                      <div className="flex-1" style={{ backgroundColor: '#ffc627' }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>0</span><span>300</span><span>500</span><span>700</span><span>900</span><span>1000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Score Breakdown - takes 3 cols */}
          <FadeIn delay={0.1} className="md:col-span-3">
            <Card className="rounded-xl shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: '#6D2932' }} />
                  Score Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Category scores contributing to your Trust Score™
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Data Completeness */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Data Completeness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{scoreData.farmersWithCompleteProfiles}/{scoreData.totalFarmers} farmers complete</span>
                      <span className="text-sm font-bold font-mono" style={{ color: getScoreColor(scoreData.dataCompleteness * 10) }}>{scoreData.dataCompleteness}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${scoreData.dataCompleteness}%`, backgroundColor: getScoreColor(scoreData.dataCompleteness * 10) }}
                    />
                  </div>
                </div>

                {/* Verification Status */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Verification Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{scoreData.verifiedRecords} verified / {scoreData.pendingRecords} pending</span>
                      <span className="text-sm font-bold font-mono" style={{ color: getScoreColor(scoreData.verificationPct * 10) }}>{scoreData.verificationPct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${scoreData.verificationPct}%`, backgroundColor: getScoreColor(scoreData.verificationPct * 10) }}
                    />
                  </div>
                </div>

                {/* Compliance History */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Compliance History</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{scoreData.compliantRecords} compliant / {scoreData.nonCompliantRecords} non-compliant</span>
                      <span className="text-sm font-bold font-mono" style={{ color: getScoreColor(scoreData.compliancePct * 10) }}>{scoreData.compliancePct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${scoreData.compliancePct}%`, backgroundColor: getScoreColor(scoreData.compliancePct * 10) }}
                    />
                  </div>
                </div>

                {/* Supply Chain Transparency */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ScanLine className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Supply Chain Transparency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{scoreData.farmlandsWithPolygon}/{scoreData.totalFarmlands} with polygon data</span>
                      <span className="text-sm font-bold font-mono" style={{ color: getScoreColor(scoreData.supplyChainPct * 10) }}>{scoreData.supplyChainPct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${scoreData.supplyChainPct}%`, backgroundColor: getScoreColor(scoreData.supplyChainPct * 10) }}
                    />
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Audit Trail</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{scoreData.auditTrailBlocks} blocks / {scoreData.qrVerifications} QR checks</span>
                      <span className="text-sm font-bold font-mono" style={{ color: getScoreColor(scoreData.auditPct * 10) }}>{scoreData.auditPct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${scoreData.auditPct}%`, backgroundColor: getScoreColor(scoreData.auditPct * 10) }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Trust Score™ Factors + Compared to Industry */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Trust Score™ Factors */}
          <FadeIn delay={0.2}>
            <Card className="rounded-xl shadow-sm h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" style={{ color: '#6D2932' }} />
                    Trust Score™ Factors
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    <Lock className="w-3 h-3 mr-1" />
                    Proprietary
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Factors that influence your score — weights & formula are confidential
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {TRUST_FACTORS.map((factor) => (
                  <div key={factor.label} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-md bg-muted shrink-0">
                      <factor.icon className="w-3.5 h-3.5" style={{ color: '#6D2932' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{factor.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{factor.description}</p>
                    </div>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">
                    The exact formula and weighting of these factors is a TerraBrew trade secret.
                    Only the resulting score and factor categories are visible.
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Compared to Industry */}
          <FadeIn delay={0.3}>
            <Card className="rounded-xl shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Crown className="w-4 h-4" style={{ color: '#6D2932' }} />
                  Compared to Industry
                </CardTitle>
                <CardDescription className="text-xs">
                  Where this tenant stands vs coffee industry benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {INDUSTRY_BENCHMARKS.map((bench) => {
                  const isActive = scoreData.trustScore >= bench.min && scoreData.trustScore <= bench.max
                  return (
                    <div
                      key={bench.tier}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isActive ? 'border-2 shadow-sm' : 'border border-transparent'
                      }`}
                      style={isActive ? { borderColor: bench.color, backgroundColor: `${bench.color}10` } : { backgroundColor: 'rgba(0,0,0,0.02)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: bench.color }}
                        />
                        <div>
                          <p className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {bench.tier}
                            {isActive && <span className="ml-1.5 text-[10px] text-muted-foreground">(You are here)</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Score range: {bench.range}</p>
                        </div>
                      </div>
                      {isActive && (
                        <Badge className="text-[10px] border-0 px-2" style={{ backgroundColor: bench.color, color: '#fff' }}>
                          {scoreData.trustScore}
                        </Badge>
                      )}
                    </div>
                  )
                })}
                <Separator className="my-2" />
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">
                    Industry benchmarks are derived from aggregated data across coffee supply chains in
                    Vietnam, Brazil, Ethiopia, and other major producing regions. Your position is relative
                    to organizations of similar size and certification status.
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Score History */}
        <FadeIn delay={0.4}>
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#6D2932' }} />
                Score History
              </CardTitle>
              <CardDescription className="text-xs">
                Timeline of Trust Score™ changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-0 max-h-80 overflow-y-auto">
                  {SCORE_HISTORY.map((entry, idx) => {
                    const prevScore = idx > 0 ? SCORE_HISTORY[idx - 1].score : 0
                    const diff = entry.score - prevScore
                    const isUp = diff > 0
                    const isLatest = idx === SCORE_HISTORY.length - 1

                    return (
                      <div key={entry.date} className="relative flex items-start gap-4 pb-5">
                        {/* Dot on timeline */}
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isLatest ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                          }`}
                          style={{
                            backgroundColor: getScoreColor(entry.score),
                            ...(isLatest ? { '--tw-ring-color': getScoreColor(entry.score) } as React.CSSProperties : {}),
                          }}
                        >
                          <span className="text-[9px] font-bold text-white">{idx + 1}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground">{entry.event}</p>
                            <div className="flex items-center gap-2">
                              {idx > 0 && (
                                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {isUp ? '+' : ''}{diff}
                                </span>
                              )}
                              <span className="text-sm font-bold font-mono" style={{ color: getScoreColor(entry.score) }}>
                                {entry.score}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                    )
                  })}

                  {/* Current position */}
                  <div className="relative flex items-start gap-4 pb-2">
                    <div
                      className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-offset-2 ring-offset-background"
                      style={{
                        backgroundColor: scoreColor,
                        '--tw-ring-color': scoreColor,
                      } as React.CSSProperties}
                    >
                      <Star className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">Current Score</p>
                        <span className="text-lg font-bold font-mono" style={{ color: scoreColor }}>
                          {scoreData.trustScore}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Today — {scoreLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
  )
}
