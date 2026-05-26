'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield, ArrowLeft, ChevronRight, ChevronLeft, CheckCircle2,
  MapPin, AlertTriangle, FileCheck, CalendarDays,
  Loader2, Info, Globe2
} from 'lucide-react'
import { toast } from 'sonner'
import { FadeIn } from '@/components/ui/motion'

// Dynamic import for map — SSR must be disabled for Leaflet
const EudrLocationMap = dynamic(
  () => import('@/components/map/eudr-location-map').then(mod => ({ default: mod.EudrLocationMap })),
  { ssr: false, loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-xl" /> }
)

// ─── Coffee Brown Theme ────────────────────────────────────────

const COFFEE_BROWN = '#6D2932'

// ─── Constants ─────────────────────────────────────────────────

const WIZARD_STEPS = [
  { label: 'Basic Info', icon: Shield },
  { label: 'Geolocation & Land', icon: MapPin },
  { label: 'Risk Assessment', icon: AlertTriangle },
  { label: 'Verification & DDS', icon: FileCheck },
  { label: 'Validity & Notes', icon: CalendarDays },
]

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

// ─── Mock dropdown data ────────────────────────────────────────

const MOCK_FARMERS = [
  { id: 'F-001', name: 'Nguyen Van Minh', code: 'TB-ĐL-2024-0347' },
  { id: 'F-002', name: 'Le Thi Hoa', code: 'TB-LĐ-2024-0215' },
  { id: 'F-003', name: 'Tran Van Duc', code: 'TB-GL-2024-0189' },
  { id: 'F-004', name: 'Pham Thi Lan', code: 'TB-LĐ-2024-0432' },
  { id: 'F-005', name: 'Hoang Van Em', code: 'TB-ĐN-2024-0076' },
]

const MOCK_FARM_LANDS = [
  { id: 'FL-001', name: 'Highland Plot A', farmerId: 'F-001' },
  { id: 'FL-002', name: 'Central Valley Plot', farmerId: 'F-002' },
  { id: 'FL-003', name: 'Lowland Expansion', farmerId: 'F-003' },
  { id: 'FL-004', name: 'Shade Garden B', farmerId: 'F-004' },
  { id: 'FL-005', name: 'Mixed Plot C', farmerId: 'F-005' },
]

// ─── Helper Functions ──────────────────────────────────────────

function generateComplianceId(): string {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `EUDR-${year}-${seq}`
}

function getRiskLevelFromScore(score: number): string {
  if (score > 70) return 'critical'
  if (score > 40) return 'high'
  if (score > 20) return 'medium'
  return 'low'
}

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

// ─── Main Component ────────────────────────────────────────────

export default function NewEudrCompliancePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState<any>({
    complianceId: generateComplianceId(),
    batchId: '',
    farmerId: '',
    farmLandId: '',
    status: 'pending',
    riskLevel: 'low',
    geolocationLat: 11.9404,
    geolocationLng: 108.4584,
    landUseType: '',
    landCoverChangeDate: '',
    satelliteImageryRef: '',
    deforestationRiskScore: undefined as number | undefined,
    verificationDate: '',
    verifiedBy: '',
    dueDiligenceStatement: '',
    tracesCertificateRef: '',
    validFrom: '',
    validUntil: '',
    notes: '',
  })

  const updateForm = (field: string, value: any) => {
    setForm((prev: any) => {
      const updated = { ...prev, [field]: value }
      // Auto-calculate risk level when score changes
      if (field === 'deforestationRiskScore' && typeof value === 'number') {
        updated.riskLevel = getRiskLevelFromScore(value)
      }
      return updated
    })
  }

  // Filter farm lands based on selected farmer
  const filteredFarmLands = useMemo(() => {
    if (!form.farmerId) return MOCK_FARM_LANDS
    return MOCK_FARM_LANDS.filter(fl => fl.farmerId === form.farmerId)
  }, [form.farmerId])

  const canAdvance = (): boolean => {
    if (step === 0 && !form.complianceId) return false
    if (step === 1 && (!form.geolocationLat || !form.geolocationLng)) return false
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload: any = {
        complianceId: form.complianceId,
        batchId: form.batchId || undefined,
        farmerId: form.farmerId || undefined,
        farmLandId: form.farmLandId || undefined,
        status: form.status,
        riskLevel: form.riskLevel,
        geolocationLat: form.geolocationLat,
        geolocationLng: form.geolocationLng,
        landUseType: form.landUseType || undefined,
        landCoverChangeDate: form.landCoverChangeDate || undefined,
        satelliteImageryRef: form.satelliteImageryRef || undefined,
        deforestationRiskScore: form.deforestationRiskScore ?? undefined,
        verificationDate: form.verificationDate || undefined,
        verifiedBy: form.verifiedBy || undefined,
        dueDiligenceStatement: form.dueDiligenceStatement || undefined,
        tracesCertificateRef: form.tracesCertificateRef || undefined,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
        notes: form.notes || undefined,
      }

      const res = await fetch('/api/eudr-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('EUDR Compliance Record created successfully!')
        router.push('/eudr-compliance')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create record')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create record')
    } finally {
      setSubmitting(false)
    }
  }

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

        {/* Page Title */}
        <FadeIn delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: COFFEE_BROWN }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">New EUDR Compliance Record</h1>
              <p className="text-sm text-muted-foreground">Create a new EU Deforestation Regulation compliance record</p>
            </div>
          </div>
        </FadeIn>

        {/* Step Indicator */}
        <FadeIn delay={0.1}>
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {WIZARD_STEPS.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2 flex-1">
                    <button
                      className="flex items-center gap-2 group"
                      onClick={() => i < step && setStep(i)}
                      disabled={i > step}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all"
                        style={{
                          backgroundColor: i === step ? COFFEE_BROWN : i < step ? '#22c55e' : 'var(--muted)',
                          color: i === step ? 'white' : i < step ? 'white' : 'var(--muted-foreground)',
                        }}
                      >
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className={`text-sm hidden md:inline ${i === step ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {s.label}
                      </span>
                    </button>
                    {i < WIZARD_STEPS.length - 1 && (
                      <div className="flex-1 h-px bg-border mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Step Content */}
        <FadeIn delay={0.15}>
          <Card className="rounded-xl">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {(() => {
                  const StepIcon = WIZARD_STEPS[step].icon
                  return <StepIcon className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                })()}
                {WIZARD_STEPS[step].label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Step 0: Basic Info */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Compliance ID *</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="EUDR-2024-XXX"
                          value={form.complianceId || ''}
                          onChange={e => updateForm('complianceId', e.target.value)}
                          className="font-mono text-base"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => updateForm('complianceId', generateComplianceId())}
                        >
                          Auto
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Auto-generated. You can override if needed.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Batch ID</Label>
                      <Input
                        placeholder="BATCH-XXX"
                        value={form.batchId || ''}
                        onChange={e => updateForm('batchId', e.target.value)}
                        className="font-mono text-base"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Farmer</Label>
                      <Select value={form.farmerId || '_none'} onValueChange={v => {
                        updateForm('farmerId', v === '_none' ? '' : v)
                        if (v !== '_none') updateForm('farmLandId', '')
                      }}>
                        <SelectTrigger className="text-base"><SelectValue placeholder="Select farmer" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          {MOCK_FARMERS.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name} ({f.code})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Farm Land</Label>
                      <Select value={form.farmLandId || '_none'} onValueChange={v => updateForm('farmLandId', v === '_none' ? '' : v)}>
                        <SelectTrigger className="text-base"><SelectValue placeholder="Select farm land" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          {filteredFarmLands.map(fl => (
                            <SelectItem key={fl.id} value={fl.id}>{fl.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Status</Label>
                      <Select value={form.status} onValueChange={v => updateForm('status', v)}>
                        <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
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
                      <Label className="text-base font-medium">Risk Level</Label>
                      <div className="flex items-center gap-3">
                        <Select value={form.riskLevel} onValueChange={v => updateForm('riskLevel', v)} disabled={form.deforestationRiskScore != null}>
                          <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge className={`${RISK_COLORS[form.riskLevel]} border capitalize text-sm`}>
                          {form.riskLevel}
                        </Badge>
                      </div>
                      {form.deforestationRiskScore != null && (
                        <p className="text-xs text-muted-foreground">Auto-calculated from risk score in Step 3</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Geolocation & Land */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Latitude *</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="11.9404"
                        value={form.geolocationLat || ''}
                        onChange={e => updateForm('geolocationLat', parseFloat(e.target.value) || 0)}
                        className="font-mono text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Longitude *</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="108.4584"
                        value={form.geolocationLng || ''}
                        onChange={e => updateForm('geolocationLng', parseFloat(e.target.value) || 0)}
                        className="font-mono text-base"
                      />
                    </div>
                  </div>

                  {/* OpenStreetMap Preview */}
                  {form.geolocationLat && form.geolocationLng ? (
                    <div className="space-y-2">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Globe2 className="w-4 h-4" style={{ color: COFFEE_BROWN }} />
                        Location Preview
                      </Label>
                      <EudrLocationMap
                        latitude={form.geolocationLat}
                        longitude={form.geolocationLng}
                        complianceId={form.complianceId}
                        zoom={13}
                      />
                      <p className="text-xs text-muted-foreground">Click on the map marker to see details. The map updates as you change coordinates.</p>
                    </div>
                  ) : (
                    <div className="h-[200px] bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-muted-foreground/20">
                      <p className="text-sm text-muted-foreground">Enter coordinates to preview location</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Land Use Type</Label>
                      <Select value={form.landUseType || '_none'} onValueChange={v => updateForm('landUseType', v === '_none' ? '' : v)}>
                        <SelectTrigger className="text-base"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          <SelectItem value="agroforestry">Agroforestry</SelectItem>
                          <SelectItem value="monoculture">Monoculture</SelectItem>
                          <SelectItem value="shade_grown">Shade Grown</SelectItem>
                          <SelectItem value="mixed_use">Mixed Use</SelectItem>
                          <SelectItem value="cleared_land">Cleared Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Land Cover Change Date</Label>
                      <Input
                        type="date"
                        value={form.landCoverChangeDate || ''}
                        onChange={e => updateForm('landCoverChangeDate', e.target.value)}
                        className="text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Satellite Imagery Reference</Label>
                    <Input
                      placeholder="SAT-GFW-2024-XXX"
                      value={form.satelliteImageryRef || ''}
                      onChange={e => updateForm('satelliteImageryRef', e.target.value)}
                      className="font-mono text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Risk Assessment */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Deforestation Risk Score (0-100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={form.deforestationRiskScore ?? ''}
                      onChange={e => updateForm('deforestationRiskScore', parseInt(e.target.value) || 0)}
                      className="font-mono text-base"
                    />
                  </div>

                  {form.deforestationRiskScore != null && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Risk Visualization</span>
                        <span className={`font-bold font-mono ${getRiskScoreColor(form.deforestationRiskScore)}`}>
                          {form.deforestationRiskScore}/100
                        </span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getRiskBarColor(form.deforestationRiskScore)}`}
                          style={{ width: `${Math.min(form.deforestationRiskScore, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low (0-20)</span>
                        <span>Medium (21-40)</span>
                        <span>High (41-70)</span>
                        <span>Critical (71-100)</span>
                      </div>

                      {/* Auto-calculated Risk Level */}
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
                        <AlertTriangle className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                        <div>
                          <p className="text-sm font-medium">Auto-calculated Risk Level</p>
                          <Badge className={`${RISK_COLORS[form.riskLevel]} border capitalize text-sm mt-1`}>
                            {form.riskLevel} Risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-semibold mb-1">EUDR Cutoff Date: December 31, 2020</p>
                        <p>Any deforestation after this date renders the commodity non-compliant with EU regulations. Risk scores are calculated based on satellite imagery analysis, ground survey data, and Global Forest Watch alerts.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Verification & DDS */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Verification Date</Label>
                      <Input
                        type="date"
                        value={form.verificationDate || ''}
                        onChange={e => updateForm('verificationDate', e.target.value)}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Verified By</Label>
                      <Input
                        placeholder="Dr. Name"
                        value={form.verifiedBy || ''}
                        onChange={e => updateForm('verifiedBy', e.target.value)}
                        className="text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Due Diligence Statement (DDS) Document URL</Label>
                    <Input
                      placeholder="/docs/dds/EUDR-2024-XXX.pdf"
                      value={form.dueDiligenceStatement || ''}
                      onChange={e => updateForm('dueDiligenceStatement', e.target.value)}
                      className="font-mono text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">TRACES-NT Certificate Reference</Label>
                    <Input
                      placeholder="TRACES-NT/VN/2024/XXXXX"
                      value={form.tracesCertificateRef || ''}
                      onChange={e => updateForm('tracesCertificateRef', e.target.value)}
                      className="font-mono text-base"
                    />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Globe2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-semibold mb-1">TRACES-NT: EU Trade Control and Expert System</p>
                        <p>All DDS documents must be submitted through TRACES-NT before placing commodities on the EU market.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Validity & Notes */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Valid From</Label>
                      <Input
                        type="date"
                        value={form.validFrom || ''}
                        onChange={e => updateForm('validFrom', e.target.value)}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Valid Until</Label>
                      <Input
                        type="date"
                        value={form.validUntil || ''}
                        onChange={e => updateForm('validUntil', e.target.value)}
                        className="text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Notes</Label>
                    <Textarea
                      placeholder="Additional compliance notes, observations, remediation plans..."
                      value={form.notes || ''}
                      onChange={e => updateForm('notes', e.target.value)}
                      rows={5}
                      className="text-base"
                    />
                  </div>

                  {/* Summary before submit */}
                  <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                      Record Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Compliance ID:</span><p className="font-mono font-medium">{form.complianceId}</p></div>
                      <div><span className="text-muted-foreground">Status:</span><p><Badge className={`${STATUS_COLORS[form.status]} border capitalize`}>{form.status?.replace('_', ' ')}</Badge></p></div>
                      <div><span className="text-muted-foreground">Risk Level:</span><p><Badge className={`${RISK_COLORS[form.riskLevel]} border capitalize`}>{form.riskLevel}</Badge></p></div>
                      <div><span className="text-muted-foreground">Coordinates:</span><p className="font-mono">{form.geolocationLat}, {form.geolocationLng}</p></div>
                      <div><span className="text-muted-foreground">Risk Score:</span><p className={`font-mono font-bold ${getRiskScoreColor(form.deforestationRiskScore)}`}>{form.deforestationRiskScore ?? '—'}/100</p></div>
                      <div><span className="text-muted-foreground">Batch ID:</span><p className="font-mono">{form.batchId || '—'}</p></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Navigation Buttons */}
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              className="text-base gap-1.5"
              onClick={() => step > 0 ? setStep(step - 1) : router.push('/eudr-compliance')}
            >
              {step > 0 ? (
                <><ChevronLeft className="w-4 h-4" /> Back</>
              ) : (
                <><ArrowLeft className="w-4 h-4" /> Cancel</>
              )}
            </Button>
            <div className="flex gap-3">
              {step < WIZARD_STEPS.length - 1 ? (
                <Button
                  size="lg"
                  className="text-base gap-1.5 text-white"
                  style={{ backgroundColor: COFFEE_BROWN }}
                  onClick={() => canAdvance() && setStep(step + 1)}
                  disabled={!canAdvance()}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="text-base gap-1.5 text-white"
                  style={{ backgroundColor: COFFEE_BROWN }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Create Record</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </DashboardShell>
  )
}
