'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  TreePine, MapPin, Satellite, AlertTriangle, CheckCircle2,
  Clock, XCircle, Search, Plus, CalendarDays, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem, PulseDot } from '@/components/ui/animations'
import { SensitiveField } from '@/components/ui/sensitive-field'
import Link from 'next/link'

// ======== SAMPLE FARM BOUNDARIES FOR MAP ========
const SAMPLE_FARMS = [
  { id: 1, name: 'Highland Farm A', lat: 12.668, lng: 108.038, risk: 12, status: 'compliant', color: '#059669' },
  { id: 2, name: 'Valley Farm B', lat: 12.655, lng: 108.055, risk: 45, status: 'in_review', color: '#d97706' },
  { id: 3, name: 'Hillside Farm C', lat: 12.680, lng: 108.025, risk: 78, status: 'non_compliant', color: '#dc2626' },
  { id: 4, name: 'Riverside Farm D', lat: 12.645, lng: 108.045, risk: 8, status: 'compliant', color: '#059669' },
  { id: 5, name: 'Mountain Farm E', lat: 12.690, lng: 108.060, risk: 22, status: 'pending', color: '#d97706' },
  { id: 6, name: 'Organic Farm F', lat: 12.635, lng: 108.030, risk: 5, status: 'compliant', color: '#059669' },
]

const SATELLITE_DATES = ['2024-01-15', '2024-03-20', '2024-06-10', '2024-09-05']

// ======== RISK SCORE GAUGE ========
function RiskScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (score / 100) * circumference
  const color = score < 30 ? '#059669' : score < 60 ? '#d97706' : '#dc2626'

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <motion.circle
          cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
        <span className="text-[8px] text-muted-foreground">Risk</span>
      </div>
    </div>
  )
}

// ======== LEAFLET MAP COMPONENT ========
function DeforestationMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return
    let cancelled = false

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        if (cancelled || !mapContainerRef.current) return

        // Fix default icon URLs
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        const map = L.map(mapContainerRef.current, {
          center: [12.668, 108.038],
          zoom: 13,
          zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add risk circles for each farm
        SAMPLE_FARMS.forEach(farm => {
          const riskLevel = farm.risk < 30 ? 'Low' : farm.risk < 60 ? 'Medium' : 'High'
          const radius = Math.max(100, farm.risk * 5)

          const circle = L.circle([farm.lat, farm.lng], {
            radius,
            color: farm.color,
            fillColor: farm.color,
            fillOpacity: 0.25,
            weight: 2,
          }).addTo(map)

          circle.bindTooltip(`<strong>${farm.name}</strong><br/>Risk: ${farm.risk}% (${riskLevel})<br/>Status: ${farm.status.replace('_', ' ')}`, {
            sticky: true,
          })

          // Center marker
          L.circleMarker([farm.lat, farm.lng], {
            radius: 5,
            color: farm.color,
            fillColor: farm.color,
            fillOpacity: 1,
            weight: 2,
          }).addTo(map)
        })

        mapRef.current = map
        setMapReady(true)
      } catch (err) {
        console.error('Failed to initialize map:', err)
      }
    }
    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [mounted])

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        style={{ height: '360px', width: '100%', borderRadius: '12px', zIndex: 1 }}
        className="border border-border overflow-hidden"
      />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-xl" style={{ zIndex: 2 }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <span className="text-xs">Loading map...</span>
          </div>
        </div>
      )}
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2.5" style={{ zIndex: 1000 }}>
        <p className="text-[10px] font-bold text-foreground mb-1.5">Risk Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-600" /><span className="text-[10px]">Low Risk (&lt;30%)</span></div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-amber-600" /><span className="text-[10px]">Medium Risk (30-60%)</span></div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-600" /><span className="text-[10px]">High Risk (&gt;60%)</span></div>
        </div>
      </div>
    </div>
  )
}

// ======== MAIN PAGE ========
interface DeforestationAssessment {
  id: string
  farmLandId?: string
  assessmentDate?: string
  deforestationRiskScore?: number
  landCoverChangeDate?: string
  landUseType?: string
  status?: string
  satelliteImageryRef?: string
}

export default function DeforestationPage() {
  const [assessments, setAssessments] = useState<DeforestationAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewAssessment, setShowNewAssessment] = useState(false)
  const [selectedDate, setSelectedDate] = useState(SATELLITE_DATES[SATELLITE_DATES.length - 1])

  useEffect(() => {
    fetch('/api/deforestation')
      .then(r => r.json())
      .then(data => {
        setAssessments(Array.isArray(data) ? data : data.items || data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredAssessments = assessments.filter(a =>
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.landUseType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayAssessments = filteredAssessments.length > 0 ? filteredAssessments : [
    { id: 'DA-001', assessmentDate: '2024-01-15', deforestationRiskScore: 12, landUseType: 'Coffee Agroforestry', status: 'compliant', satelliteImageryRef: 'SAT-2024-VN-001' },
    { id: 'DA-002', assessmentDate: '2024-01-18', deforestationRiskScore: 45, landUseType: 'Mixed Crop', status: 'in_review', satelliteImageryRef: 'SAT-2024-VN-002' },
    { id: 'DA-003', assessmentDate: '2024-01-20', deforestationRiskScore: 78, landUseType: 'Recent Clear-cut', status: 'non_compliant', satelliteImageryRef: 'SAT-2024-VN-003' },
    { id: 'DA-004', assessmentDate: '2024-01-22', deforestationRiskScore: 8, landUseType: 'Shade-Grown Coffee', status: 'compliant', satelliteImageryRef: 'SAT-2024-VN-004' },
    { id: 'DA-005', assessmentDate: '2024-01-25', deforestationRiskScore: 22, landUseType: 'Coffee Agroforestry', status: 'pending', satelliteImageryRef: 'SAT-2024-VN-005' },
    { id: 'DA-006', assessmentDate: '2024-01-28', deforestationRiskScore: 5, landUseType: 'Organic Coffee', status: 'compliant', satelliteImageryRef: 'SAT-2024-VN-006' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/eudr">
                <Button variant="ghost" size="sm" className="text-emerald-600 -ml-2">← EUDR</Button>
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-gradient-emerald inline-block">Deforestation Assessment</h2>
            <p className="text-sm text-muted-foreground mt-1">Satellite-based deforestation risk analysis for EUDR compliance</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowNewAssessment(!showNewAssessment)}>
              <Plus className="h-4 w-4 mr-1" /> Run Assessment
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* New Assessment Form */}
      {showNewAssessment && (
        <FadeIn>
          <Card className="border-0 shadow-sm ring-2 ring-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Run New Deforestation Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Farm Land</Label>
                  <Input placeholder="Select farm land" />
                </div>
                <div className="space-y-2">
                  <Label>Assessment Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Imagery Source</Label>
                  <Input placeholder="e.g. Sentinel-2, Landsat" />
                </div>
                <div className="space-y-2">
                  <Label>Reference Period</Label>
                  <Input placeholder="e.g. 2020-01-01 to 2024-12-31" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Additional notes for this assessment..." />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowNewAssessment(false)}>
                  <Satellite className="h-4 w-4 mr-1" /> Start Assessment
                </Button>
                <Button variant="outline" onClick={() => setShowNewAssessment(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Summary Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Assessed', value: displayAssessments.length, icon: Satellite, gradient: 'kpi-emerald' },
          { title: 'Low Risk', value: displayAssessments.filter(a => (a.deforestationRiskScore || 0) < 30).length, icon: CheckCircle2, gradient: 'kpi-teal' },
          { title: 'Under Review', value: displayAssessments.filter(a => a.status === 'in_review').length, icon: Clock, gradient: 'kpi-amber' },
          { title: 'Non-Compliant', value: displayAssessments.filter(a => a.status === 'non_compliant').length, icon: AlertTriangle, gradient: 'kpi-rose' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <StaggerItem key={kpi.title}>
              <AnimatedCard>
                <Card className="card-lift overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className={`h-8 w-8 rounded-lg ${kpi.gradient} flex items-center justify-center mb-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      {/* Interactive Leaflet Map */}
      <FadeIn delay={0.1}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> Farm Land Coverage & Risk Map
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DeforestationMap />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Satellite Imagery Timeline */}
      <FadeIn delay={0.15}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600" /> Satellite Imagery Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
              {SATELLITE_DATES.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedDate === date ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="h-40 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 flex items-center justify-center border-2 border-dashed border-emerald-200 dark:border-emerald-800">
                <div className="text-center">
                  <Satellite className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">NDVI Analysis</p>
                  <p className="text-xs text-muted-foreground">{selectedDate} · Sentinel-2</p>
                </div>
              </div>
              <div className="h-40 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 flex items-center justify-center border-2 border-dashed border-amber-200 dark:border-amber-800">
                <div className="text-center">
                  <TreePine className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Land Cover Change</p>
                  <p className="text-xs text-muted-foreground">{selectedDate} · Comparison</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Assessment Detail Cards with Risk Score Gauges */}
      <FadeIn delay={0.2}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Assessment Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto">
              {displayAssessments.map((assessment, idx) => {
                const riskScore = assessment.deforestationRiskScore || 0
                const statusColor = assessment.status === 'compliant' ? 'bg-emerald-100 text-emerald-700' :
                  assessment.status === 'non_compliant' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'

                return (
                  <motion.div
                    key={assessment.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * idx }}
                  >
                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RiskScoreGauge score={riskScore} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{assessment.id}</p>
                              <Badge className={`text-[9px] ${statusColor}`}>{assessment.status?.replace('_', ' ') || 'pending'}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{assessment.landUseType || 'Unknown land use'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString() : '—'}</p>
                            {assessment.satelliteImageryRef && (
                              <p className="text-[10px] font-mono text-muted-foreground mt-1">{assessment.satelliteImageryRef}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
