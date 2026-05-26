'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Shield, ArrowLeft, MapPin, AlertTriangle, FileCheck,
  CheckCircle2, Clock, Satellite, Globe2, CalendarDays,
  Loader2, TreePine, ExternalLink, Info, LandPlot, FileText
} from 'lucide-react'
import { FadeIn } from '@/components/ui/motion'

// Dynamic import for map — SSR must be disabled for Leaflet
const EudrLocationMap = dynamic(
  () => import('@/components/map/eudr-location-map').then(mod => ({ default: mod.EudrLocationMap })),
  { ssr: false, loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-xl" /> }
)

// ─── Coffee Brown Theme ────────────────────────────────────────

const COFFEE_BROWN = '#6D2932'

// ─── Constants ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_review: 'bg-blue-100 text-blue-800 border-blue-200',
  compliant: 'bg-green-100 text-green-800 border-green-200',
  non_compliant: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
}

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

// ─── Types ─────────────────────────────────────────────────────

interface EudrDetailRecord {
  id: string
  complianceId: string
  batchId?: string
  farmerId?: string
  farmLandId?: string
  status: string
  riskLevel: string
  deforestationRiskScore?: number
  satelliteImageryRef?: string
  geolocationLat?: number
  geolocationLng?: number
  landUseType?: string
  landCoverChangeDate?: string
  verificationDate?: string
  verifiedBy?: string
  dueDiligenceStatement?: string
  tracesCertificateRef?: string
  validFrom?: string
  validUntil?: string
  notes?: string
  metadata?: any
  createdAt: string
  farmer?: { id: string; fullName: string; farmerCode: string }
  farmLand?: { id: string; farmName: string }
}

// ─── Helper Functions ──────────────────────────────────────────

function getRiskScoreColor(score?: number): string {
  if (!score) return 'text-gray-500'
  if (score > 70) return 'text-red-600'
  if (score > 40) return 'text-yellow-600'
  return 'text-green-600'
}

function getRiskBarColor(score?: number): string {
  if (!score) return 'bg-gray-300'
  if (score > 70) return 'bg-red-500'
  if (score > 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

// ─── Info Row Component ────────────────────────────────────────

function DetailRow({ label, value, icon, mono }: {
  label: string; value: string | number | null | undefined; icon?: React.ReactNode; mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-base text-foreground font-medium ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────

export default function EudrComplianceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const id = params.id as string
  const [record, setRecord] = useState<EudrDetailRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/eudr-compliance/${id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setRecord(data.data)
      } else {
        setRecord(null)
      }
    } catch {
      setRecord(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecord()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router, fetchRecord])

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse" style={{ backgroundColor: COFFEE_BROWN }}>
              <Shield className="w-9 h-9 text-white" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading compliance record...</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!record) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">Compliance record not found</p>
        </div>
      </DashboardShell>
    )
  }

  const lat = record.geolocationLat ?? 0
  const lng = record.geolocationLng ?? 0

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Back Link */}
        <FadeIn>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground text-sm"
            onClick={() => router.push('/eudr-compliance')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to EUDR Compliance
          </Button>
        </FadeIn>

        {/* Header */}
        <FadeIn delay={0.05}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: COFFEE_BROWN }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground font-mono">{record.complianceId}</h1>
                <p className="text-sm text-muted-foreground">EUDR Compliance Record</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              <Badge className={`${STATUS_COLORS[record.status]} border capitalize text-sm px-3 py-1`}>
                {record.status?.replace('_', ' ')}
              </Badge>
              <Badge className={`${RISK_COLORS[record.riskLevel]} border capitalize text-sm px-3 py-1`}>
                {record.riskLevel} Risk
              </Badge>
            </div>
          </div>
        </FadeIn>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Assessment */}
            <FadeIn delay={0.1}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {record.deforestationRiskScore != null && (
                    <>
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Deforestation Risk Score</span>
                        <span className={`font-bold font-mono text-lg ${getRiskScoreColor(record.deforestationRiskScore)}`}>
                          {record.deforestationRiskScore}/100
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getRiskBarColor(record.deforestationRiskScore)}`}
                          style={{ width: `${Math.min(record.deforestationRiskScore, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low (0-20)</span>
                        <span>Medium (21-40)</span>
                        <span>High (41-70)</span>
                        <span>Critical (71-100)</span>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="Risk Level" value={record.riskLevel?.charAt(0).toUpperCase() + record.riskLevel?.slice(1)} icon={<AlertTriangle className="w-4 h-4" />} />
                    <DetailRow label="Land Use Type" value={record.landUseType?.replace('_', ' ')} icon={<LandPlot className="w-4 h-4" />} />
                    <DetailRow label="Land Cover Change Date" value={formatDate(record.landCoverChangeDate)} icon={<CalendarDays className="w-4 h-4" />} />
                    <DetailRow label="Satellite Imagery Ref" value={record.satelliteImageryRef} icon={<Satellite className="w-4 h-4" />} mono />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Geolocation & OpenStreetMap */}
            <FadeIn delay={0.15}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                    Geolocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="Latitude" value={record.geolocationLat ?? '—'} icon={<MapPin className="w-4 h-4" />} mono />
                    <DetailRow label="Longitude" value={record.geolocationLng ?? '—'} mono />
                  </div>

                  {/* OpenStreetMap */}
                  <div className="rounded-xl overflow-hidden border border-border">
                    <EudrLocationMap
                      latitude={lat}
                      longitude={lng}
                      complianceId={record.complianceId}
                      farmerName={record.farmer?.fullName}
                      zoom={12}
                    />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Verification & DDS */}
            <FadeIn delay={0.2}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileCheck className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                    Verification & DDS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="Verification Date" value={formatDate(record.verificationDate)} icon={<CheckCircle2 className="w-4 h-4" />} />
                    <DetailRow label="Verified By" value={record.verifiedBy} icon={<Shield className="w-4 h-4" />} />
                    <DetailRow label="DDS Document URL" value={record.dueDiligenceStatement} icon={<FileText className="w-4 h-4" />} mono />
                    <DetailRow label="TRACES-NT Ref" value={record.tracesCertificateRef} icon={<Globe2 className="w-4 h-4" />} mono />
                  </div>

                  {record.dueDiligenceStatement && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                          <p className="font-semibold mb-1">TRACES-NT: EU Trade Control and Expert System</p>
                          <p>All DDS documents must be submitted through TRACES-NT before placing commodities on the EU market.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Notes */}
            {record.notes && (
              <FadeIn delay={0.25}>
                <Card className="rounded-xl">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{record.notes}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>

          {/* Right column: Sidebar */}
          <div className="space-y-6">
            {/* Compliance ID Card */}
            <FadeIn delay={0.1}>
              <Card className="rounded-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: COFFEE_BROWN }}>
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold font-mono">{record.complianceId}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge className={`${STATUS_COLORS[record.status]} border capitalize`}>{record.status?.replace('_', ' ')}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <DetailRow label="Batch ID" value={record.batchId} mono />
                    <DetailRow label="Created" value={formatDate(record.createdAt)} icon={<Clock className="w-4 h-4" />} />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Farmer Info */}
            <FadeIn delay={0.15}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TreePine className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                    Farmer Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <DetailRow label="Farmer Name" value={record.farmer?.fullName || record.farmerId} icon={<TreePine className="w-4 h-4" />} />
                  <DetailRow label="Farmer Code" value={record.farmer?.farmerCode} mono />
                  <DetailRow label="Farmer ID" value={record.farmerId} mono />
                </CardContent>
              </Card>
            </FadeIn>

            {/* Farm Land Info */}
            <FadeIn delay={0.2}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <LandPlot className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                    Farm Land Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <DetailRow label="Farm Name" value={record.farmLand?.farmName || record.farmLandId} icon={<LandPlot className="w-4 h-4" />} />
                  <DetailRow label="Farm Land ID" value={record.farmLandId} mono />
                  <DetailRow label="Land Use Type" value={record.landUseType?.replace('_', ' ') || '—'} />
                </CardContent>
              </Card>
            </FadeIn>

            {/* Validity Period */}
            <FadeIn delay={0.25}>
              <Card className="rounded-xl">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                    Validity Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <DetailRow label="Valid From" value={formatDate(record.validFrom)} icon={<CalendarDays className="w-4 h-4" />} />
                  <DetailRow label="Valid Until" value={formatDate(record.validUntil)} />
                  {record.validUntil && (
                    <div className="mt-2">
                      {(() => {
                        const daysLeft = Math.ceil((new Date(record.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        return (
                          <div className={`p-3 rounded-lg text-sm font-medium ${
                            daysLeft <= 0 ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                            daysLeft <= 90 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                          }`}>
                            {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Metadata */}
            {record.metadata && (
              <FadeIn delay={0.3}>
                <Card className="rounded-xl">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Info className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                      Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <pre className="text-sm font-mono text-foreground bg-muted/50 p-3 rounded-lg overflow-auto max-h-64">
                      {JSON.stringify(record.metadata, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
