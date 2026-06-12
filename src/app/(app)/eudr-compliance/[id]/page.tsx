'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Shield, ArrowLeft, MapPin, AlertTriangle, FileCheck,
  CheckCircle2, Clock, Satellite, Globe2, CalendarDays,
  Loader2, TreePine, FileText, Info, LandPlot, Pencil,
  Trash2, X, Save, CircleDot
} from 'lucide-react'
import { FadeIn } from '@/components/ui/motion'
import { toast } from 'sonner'
import type { PolygonCoordinate } from '@/components/map/eudr-draw-map'

// Dynamic import for map
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

// Status flow: pending → in_review → compliant (or non_compliant)
const STATUS_FLOW = [
  { status: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  { status: 'in_review', label: 'In Review', icon: FileCheck, color: 'text-blue-600' },
  { status: 'compliant', label: 'Compliant', icon: CheckCircle2, color: 'text-green-600' },
]

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
  updatedAt?: string
  farmer?: { id: string; fullName: string; farmerCode: string }
  farmLand?: { id: string; farmName: string; polygonGeoJson?: string; latitude?: number; longitude?: number }
  deforestationAssessments?: any[]
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

function getStatusIndex(status: string): number {
  if (status === 'pending') return 0
  if (status === 'in_review') return 1
  if (status === 'compliant') return 2
  if (status === 'non_compliant') return 2 // Terminal state
  if (status === 'expired') return 2 // Terminal state
  return 0
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

// ─── Status Timeline Component ─────────────────────────────────

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = getStatusIndex(currentStatus)
  const isNonCompliant = currentStatus === 'non_compliant'
  const isExpired = currentStatus === 'expired'

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <CircleDot className="w-4 h-4" style={{ color: COFFEE_BROWN }} /> Status Timeline
      </h4>
      <div className="flex items-center gap-0">
        {STATUS_FLOW.map((step, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex && !isNonCompliant && !isExpired
          const StepIcon = step.icon

          return (
            <div key={step.status} className="flex items-center gap-0 flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'text-white' :
                    'bg-muted text-muted-foreground'
                  }`}
                  style={isCurrent ? { backgroundColor: COFFEE_BROWN } : {}}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                <span className={`text-xs ${isCurrent ? 'font-semibold text-foreground' : isCompleted ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-muted'} -ml-2 -mr-2`} />
              )}
            </div>
          )
        })}
      </div>
      {(isNonCompliant || isExpired) && (
        <div className={`mt-2 p-3 rounded-lg text-sm font-medium ${
          isNonCompliant ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
          'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400'
        }`}>
          {isNonCompliant ? '⚠ Non-Compliant — Remediation required' : '⏰ Expired — Re-assessment needed'}
        </div>
      )}
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
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  const fetchRecord = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/eudr-compliance/${id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setRecord(data.data)
        setEditForm({
          status: data.data.status,
          riskLevel: data.data.riskLevel,
          deforestationRiskScore: data.data.deforestationRiskScore,
          landUseType: data.data.landUseType,
          satelliteImageryRef: data.data.satelliteImageryRef,
          verifiedBy: data.data.verifiedBy,
          verificationDate: data.data.verificationDate ? new Date(data.data.verificationDate).toISOString().split('T')[0] : '',
          dueDiligenceStatement: data.data.dueDiligenceStatement,
          tracesCertificateRef: data.data.tracesCertificateRef,
          validFrom: data.data.validFrom ? new Date(data.data.validFrom).toISOString().split('T')[0] : '',
          validUntil: data.data.validUntil ? new Date(data.data.validUntil).toISOString().split('T')[0] : '',
          notes: data.data.notes,
        })
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

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/eudr-compliance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        toast.success('Record updated successfully')
        setIsEditing(false)
        fetchRecord()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update record')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update record')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/eudr-compliance/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Record deleted successfully')
        router.push('/eudr-compliance')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete record')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete record')
    } finally {
      setDeleting(false)
    }
  }

  // Loading state
  if (status === 'loading' || loading) {
    return (
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
    )
  }

  if (!record) {
    return (
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">Compliance record not found</p>
        </div>
    )
  }

  const lat = record.geolocationLat ?? 0
  const lng = record.geolocationLng ?? 0

  // Parse polygon from metadata or farmland
  let polygonCoords: PolygonCoordinate[] | undefined
  let polygonGeoJson: string | undefined

  if (record.farmLand?.polygonGeoJson) {
    polygonGeoJson = record.farmLand.polygonGeoJson
  }

  if (record.metadata) {
    try {
      const meta = typeof record.metadata === 'string' ? JSON.parse(record.metadata) : record.metadata
      if (meta.polygonCoordinates && meta.polygonCoordinates.length >= 3) {
        polygonCoords = meta.polygonCoordinates
      }
    } catch {
      // ignore
    }
  }

  const updateEditForm = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
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

        {/* Action Buttons */}
        <FadeIn delay={0.07}>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-4 h-4" /> Edit Record
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-sm text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                      <Trash2 className="w-4 h-4" /> Delete Record
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Compliance Record</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{record.complianceId}</strong>? This action cannot be undone. The record will be marked as inactive.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Deleting...</> : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  className="gap-1.5 text-sm text-white"
                  style={{ backgroundColor: COFFEE_BROWN }}
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-sm"
                  onClick={() => { setIsEditing(false); fetchRecord() }}
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </>
            )}
          </div>
        </FadeIn>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <FadeIn delay={0.1}>
              <Card className="rounded-xl">
                <CardContent className="p-6">
                  <StatusTimeline currentStatus={record.status} />
                </CardContent>
              </Card>
            </FadeIn>

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

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={editForm.status} onValueChange={v => updateEditForm('status', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_review">In Review</SelectItem>
                              <SelectItem value="compliant">Compliant</SelectItem>
                              <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Risk Level</Label>
                          <Select value={editForm.riskLevel} onValueChange={v => updateEditForm('riskLevel', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Deforestation Risk Score</Label>
                        <Input type="number" min="0" max="100" value={editForm.deforestationRiskScore ?? ''} onChange={e => updateEditForm('deforestationRiskScore', parseInt(e.target.value) || undefined)} className="font-mono" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DetailRow label="Risk Level" value={record.riskLevel?.charAt(0).toUpperCase() + record.riskLevel?.slice(1)} icon={<AlertTriangle className="w-4 h-4" />} />
                      <DetailRow label="Land Use Type" value={record.landUseType?.replace('_', ' ')} icon={<LandPlot className="w-4 h-4" />} />
                      <DetailRow label="Satellite Imagery Ref" value={record.satelliteImageryRef} icon={<Satellite className="w-4 h-4" />} mono />
                    </div>
                  )}
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
                      height="400px"
                      polygonGeoJson={polygonGeoJson}
                      polygonCoordinates={polygonCoords}
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
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Verification Date</Label>
                          <Input type="date" value={editForm.verificationDate || ''} onChange={e => updateEditForm('verificationDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Verified By</Label>
                          <Input value={editForm.verifiedBy || ''} onChange={e => updateEditForm('verifiedBy', e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>DDS Document URL</Label>
                        <Input value={editForm.dueDiligenceStatement || ''} onChange={e => updateEditForm('dueDiligenceStatement', e.target.value)} className="font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label>TRACES-NT Reference</Label>
                        <Input value={editForm.tracesCertificateRef || ''} onChange={e => updateEditForm('tracesCertificateRef', e.target.value)} className="font-mono" />
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            {/* Notes */}
            {(record.notes || isEditing) && (
              <FadeIn delay={0.25}>
                <Card className="rounded-xl">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isEditing ? (
                      <Textarea value={editForm.notes || ''} onChange={e => updateEditForm('notes', e.target.value)} rows={4} />
                    ) : (
                      <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{record.notes || '—'}</p>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Related Deforestation Assessments */}
            {record.deforestationAssessments && record.deforestationAssessments.length > 0 && (
              <FadeIn delay={0.3}>
                <Card className="rounded-xl">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Satellite className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                      Related Deforestation Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {record.deforestationAssessments.map((assessment: any, index: number) => (
                        <div key={assessment.id} className="p-4 rounded-xl bg-muted/50 border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Assessment #{index + 1}</span>
                            <Badge className={`${RISK_COLORS[assessment.riskCategory] || 'bg-gray-100 text-gray-800'} border capitalize text-xs`}>
                              {assessment.riskCategory || '—'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-muted-foreground text-xs">Date:</span><p className="font-mono text-xs">{formatDate(assessment.assessmentDate)}</p></div>
                            <div><span className="text-muted-foreground text-xs">Provider:</span><p className="text-xs capitalize">{assessment.provider || '—'}</p></div>
                            <div><span className="text-muted-foreground text-xs">Risk Score:</span><p className={`font-mono font-bold text-xs ${getRiskScoreColor(assessment.riskScore)}`}>{assessment.riskScore ?? '—'}/100</p></div>
                            <div><span className="text-muted-foreground text-xs">Deforestation:</span><p className={`text-xs font-medium ${assessment.deforestationDetected ? 'text-red-600' : 'text-green-600'}`}>{assessment.deforestationDetected ? 'Detected' : 'None'}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    {record.updatedAt && <DetailRow label="Last Updated" value={formatDate(record.updatedAt)} icon={<Clock className="w-4 h-4" />} />}
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
                  {record.farmLand?.polygonGeoJson && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <p className="text-xs font-medium text-green-800 dark:text-green-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Farm boundary polygon available — shown on map
                      </p>
                    </div>
                  )}
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
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Valid From</Label>
                        <Input type="date" value={editForm.validFrom || ''} onChange={e => updateEditForm('validFrom', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Valid Until</Label>
                        <Input type="date" value={editForm.validUntil || ''} onChange={e => updateEditForm('validUntil', e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
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
                      {JSON.stringify(typeof record.metadata === 'string' ? JSON.parse(record.metadata) : record.metadata, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
  )
}
