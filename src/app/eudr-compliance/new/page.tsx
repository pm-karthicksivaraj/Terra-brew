'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield, ArrowLeft, ChevronRight, ChevronLeft, CheckCircle2,
  MapPin, AlertTriangle, FileCheck, CalendarDays,
  Loader2, Info, Globe2, TreePine, Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { FadeIn } from '@/components/ui/motion'
import type { PolygonCoordinate } from '@/components/map/eudr-draw-map'

// Dynamic import for map — SSR must be disabled for Leaflet
const EudrDrawMap = dynamic(
  () => import('@/components/map/eudr-draw-map').then(mod => ({ default: mod.EudrDrawMap })),
  { ssr: false, loading: () => <div className="h-[450px] bg-muted animate-pulse rounded-xl" /> }
)

// ─── Coffee Brown Theme ────────────────────────────────────────

const COFFEE_BROWN = '#6D2932'

// ─── Constants ─────────────────────────────────────────────────

const WIZARD_STEPS = [
  { label: 'Farm Location', icon: MapPin, description: 'Mark farm location on map & draw boundary' },
  { label: 'Farmer & Farm Details', icon: TreePine, description: 'Select farmer, farm land & land use' },
  { label: 'Compliance Information', icon: Shield, description: 'Risk assessment & supporting documents' },
  { label: 'Review & Submit', icon: CheckCircle2, description: 'Verify all details before submission' },
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

// ─── Types ─────────────────────────────────────────────────────

interface FarmerOption {
  id: string
  fullName: string
  farmerCode: string | null
}

interface FarmLandOption {
  id: string
  farmName: string
  farmerId: string
  polygonGeoJson?: string | null
  latitude?: number | null
  longitude?: number | null
  totalLandHolding?: number | null
}

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
  const [farmers, setFarmers] = useState<FarmerOption[]>([])
  const [farmLands, setFarmLands] = useState<FarmLandOption[]>([])
  const [polygonCoords, setPolygonCoords] = useState<PolygonCoordinate[]>([])
  const [polygonArea, setPolygonArea] = useState<number>(0)

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
    processingMethod: '',
  })

  // Fetch farmers from API
  useEffect(() => {
    async function fetchFarmers() {
      try {
        const res = await fetch('/api/farmers?pageSize=500')
        const data = await res.json()
        if (data.success && data.data) {
          const items = data.data.data || data.data.records || data.data || []
          setFarmers(items.map((f: any) => ({
            id: f.id,
            fullName: f.fullName,
            farmerCode: f.farmerCode,
          })))
        }
      } catch (err) {
        console.error('Failed to fetch farmers', err)
      }
    }
    fetchFarmers()
  }, [])

  // Fetch farm lands from API
  useEffect(() => {
    async function fetchFarmLands() {
      try {
        const res = await fetch('/api/farmlands?pageSize=500')
        const data = await res.json()
        if (data.success && data.data) {
          const items = data.data.data || data.data.records || data.data || []
          setFarmLands(items.map((fl: any) => ({
            id: fl.id,
            farmName: fl.farmName,
            farmerId: fl.farmerId,
            polygonGeoJson: fl.polygonGeoJson,
            latitude: fl.latitude,
            longitude: fl.longitude,
            totalLandHolding: fl.totalLandHolding,
          })))
        }
      } catch (err) {
        console.error('Failed to fetch farm lands', err)
      }
    }
    fetchFarmLands()
  }, [])

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
    if (!form.farmerId) return farmLands
    return farmLands.filter(fl => fl.farmerId === form.farmerId)
  }, [form.farmerId, farmLands])

  // When farm land is selected, auto-fill coordinates from farm land data
  useEffect(() => {
    if (!form.farmLandId) return
    const selectedLand = farmLands.find(fl => fl.id === form.farmLandId)
    if (selectedLand) {
      if (selectedLand.latitude && selectedLand.longitude) {
        updateForm('geolocationLat', selectedLand.latitude)
        updateForm('geolocationLng', selectedLand.longitude)
      }
      if (selectedLand.polygonGeoJson) {
        try {
          const geojson = JSON.parse(selectedLand.polygonGeoJson)
          let coords: PolygonCoordinate[] = []
          if (geojson.type === 'Polygon' && geojson.coordinates) {
            const ring = geojson.coordinates[0]
            coords = ring.map((c: number[]) => ({ lng: c[0], lat: c[1] }))
          }
          if (coords.length >= 3) {
            setPolygonCoords(coords)
            const R = 6371000
            let area = 0
            for (let i = 0; i < coords.length; i++) {
              const j = (i + 1) % coords.length
              const lat1 = (coords[i].lat * Math.PI) / 180
              const lat2 = (coords[j].lat * Math.PI) / 180
              const lng1 = (coords[i].lng * Math.PI) / 180
              const lng2 = (coords[j].lng * Math.PI) / 180
              area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
            }
            area = Math.abs((area * R * R) / 2) / 10000
            setPolygonArea(area)
          }
        } catch {
          // Invalid GeoJSON, ignore
        }
      }
    }
  }, [form.farmLandId, farmLands])

  const canAdvance = (): boolean => {
    if (step === 0 && (!form.geolocationLat || !form.geolocationLng)) return false
    if (step === 1 && !form.farmerId) return false
    return true
  }

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    updateForm('geolocationLat', lat)
    updateForm('geolocationLng', lng)
  }, [])

  const handlePolygonDrawn = useCallback((coords: PolygonCoordinate[]) => {
    setPolygonCoords(coords)
  }, [])

  const handleAreaCalculated = useCallback((area: number) => {
    setPolygonArea(area)
  }, [])

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
        metadata: JSON.stringify({
          polygonCoordinates: polygonCoords.length >= 3 ? polygonCoords : undefined,
          polygonAreaHectares: polygonArea > 0 ? polygonArea : undefined,
          processingMethod: form.processingMethod || undefined,
        }),
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
                      <div className="hidden md:block">
                        <span className={`text-sm ${i === step ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {s.label}
                        </span>
                        <p className="text-xs text-muted-foreground hidden lg:block">{s.description}</p>
                      </div>
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
              {/* ─── Step 0: Farm Location ─── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-semibold mb-1">Mark your farm location</p>
                        <p>Click on the map to set the farm geolocation. Use the &quot;Draw Polygon&quot; button to outline the farm boundary, or upload a GeoJSON file. The polygon area will be auto-calculated in hectares.</p>
                      </div>
                    </div>
                  </div>

                  {/* OpenStreetMap with drawing tools */}
                  <EudrDrawMap
                    center={[form.geolocationLat || 11.9404, form.geolocationLng || 108.4584]}
                    zoom={12}
                    latitude={form.geolocationLat}
                    longitude={form.geolocationLng}
                    onLocationSelect={handleLocationSelect}
                    onPolygonDrawn={handlePolygonDrawn}
                    onAreaCalculated={handleAreaCalculated}
                    existingPolygon={polygonCoords.length >= 3 ? polygonCoords : undefined}
                    height="450px"
                  />

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

                  {polygonArea > 0 && (
                    <div className="p-4 rounded-xl bg-muted/50 border flex items-center gap-3">
                      <MapPin className="w-5 h-5" style={{ color: COFFEE_BROWN }} />
                      <div>
                        <p className="text-sm font-medium">Farm Boundary Area</p>
                        <p className="text-lg font-bold font-mono" style={{ color: COFFEE_BROWN }}>{polygonArea.toFixed(2)} hectares</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Step 1: Farmer & Farm Details ─── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Farmer *</Label>
                      <Select value={form.farmerId || '_none'} onValueChange={v => {
                        updateForm('farmerId', v === '_none' ? '' : v)
                        if (v !== '_none') updateForm('farmLandId', '')
                      }}>
                        <SelectTrigger className="text-base"><SelectValue placeholder="Select farmer" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          {farmers.map(f => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.fullName} {f.farmerCode ? `(${f.farmerCode})` : ''}
                            </SelectItem>
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
                            <SelectItem key={fl.id} value={fl.id}>{fl.farmName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Compliance ID</Label>
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
                      <Label className="text-base font-medium">Processing Method</Label>
                      <Select value={form.processingMethod || '_none'} onValueChange={v => updateForm('processingMethod', v === '_none' ? '' : v)}>
                        <SelectTrigger className="text-base"><SelectValue placeholder="Select method" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">None</SelectItem>
                          <SelectItem value="washed">Washed / Wet</SelectItem>
                          <SelectItem value="natural">Natural / Dry</SelectItem>
                          <SelectItem value="honey">Honey / Semi-washed</SelectItem>
                          <SelectItem value="wet_hulled">Wet Hulled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Land Cover Change Date</Label>
                      <Input
                        type="date"
                        value={form.landCoverChangeDate || ''}
                        onChange={e => updateForm('landCoverChangeDate', e.target.value)}
                        className="text-base"
                      />
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
                </div>
              )}

              {/* ─── Step 2: Compliance Information ─── */}
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

                  <Separator />

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
                    <Label className="text-base font-medium">Due Diligence Statement (DDS)</Label>
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
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Notes</Label>
                    <Textarea
                      placeholder="Additional compliance notes, observations, remediation plans..."
                      value={form.notes || ''}
                      onChange={e => updateForm('notes', e.target.value)}
                      rows={4}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Supporting Documents</Label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="gap-1.5 text-sm" type="button">
                        <Upload className="w-4 h-4" /> Upload Documents
                      </Button>
                      <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</span>
                    </div>
                  </div>

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

              {/* ─── Step 3: Review & Submit ─── */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Location Summary */}
                  <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="w-5 h-5" style={{ color: COFFEE_BROWN }} /> Farm Location
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Latitude:</span><p className="font-mono font-medium">{form.geolocationLat}</p></div>
                      <div><span className="text-muted-foreground">Longitude:</span><p className="font-mono font-medium">{form.geolocationLng}</p></div>
                      <div><span className="text-muted-foreground">Area:</span><p className="font-mono font-medium">{polygonArea > 0 ? `${polygonArea.toFixed(2)} ha` : '—'}</p></div>
                    </div>
                  </div>

                  {/* Farmer & Farm Summary */}
                  <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <TreePine className="w-5 h-5" style={{ color: COFFEE_BROWN }} /> Farmer & Farm Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Compliance ID:</span><p className="font-mono font-medium">{form.complianceId}</p></div>
                      <div>
                        <span className="text-muted-foreground">Farmer:</span>
                        <p className="font-medium">{farmers.find(f => f.id === form.farmerId)?.fullName || form.farmerId || '—'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Farm Land:</span>
                        <p className="font-medium">{farmLands.find(fl => fl.id === form.farmLandId)?.farmName || form.farmLandId || '—'}</p>
                      </div>
                      <div><span className="text-muted-foreground">Batch ID:</span><p className="font-mono">{form.batchId || '—'}</p></div>
                      <div><span className="text-muted-foreground">Land Use:</span><p className="capitalize">{form.landUseType?.replace('_', ' ') || '—'}</p></div>
                      <div><span className="text-muted-foreground">Processing:</span><p className="capitalize">{form.processingMethod?.replace('_', ' ') || '—'}</p></div>
                    </div>
                  </div>

                  {/* Compliance Summary */}
                  <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5" style={{ color: COFFEE_BROWN }} /> Compliance Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p><Badge className={`${STATUS_COLORS[form.status]} border capitalize`}>{form.status?.replace('_', ' ')}</Badge></p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Level:</span>
                        <p><Badge className={`${RISK_COLORS[form.riskLevel]} border capitalize`}>{form.riskLevel}</Badge></p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Score:</span>
                        <p className={`font-mono font-bold ${getRiskScoreColor(form.deforestationRiskScore)}`}>{form.deforestationRiskScore ?? '—'}/100</p>
                      </div>
                      <div><span className="text-muted-foreground">Satellite Ref:</span><p className="font-mono">{form.satelliteImageryRef || '—'}</p></div>
                      <div><span className="text-muted-foreground">Verified By:</span><p>{form.verifiedBy || '—'}</p></div>
                      <div><span className="text-muted-foreground">TRACES-NT:</span><p className="font-mono">{form.tracesCertificateRef || '—'}</p></div>
                    </div>
                    {form.notes && (
                      <div>
                        <span className="text-muted-foreground text-sm">Notes:</span>
                        <p className="text-sm mt-1">{form.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Validity */}
                  <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" style={{ color: COFFEE_BROWN }} /> Validity Period
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Valid From:</span><p className="font-mono">{form.validFrom || '—'}</p></div>
                      <div><span className="text-muted-foreground">Valid Until:</span><p className="font-mono">{form.validUntil || '—'}</p></div>
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
