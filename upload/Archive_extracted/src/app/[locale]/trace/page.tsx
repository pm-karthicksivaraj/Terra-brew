'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coffee,
  MapPin,
  Sprout,
  Baby,
  Tractor,
  ScanSearch,
  Wheat,
  Factory,
  Store,
  Route,
  ShoppingBag,
  ShieldCheck,
  Users,
  Info,
  ChevronRight,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/* ═══════════════════════════════════════════════════════════════
   MASKED FIELD COMPONENT — shows "******" with tooltip
   ═══════════════════════════════════════════════════════════════ */
function MaskedField({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
      <span className="bg-gray-200/80 text-gray-400 px-1.5 py-0.5 rounded text-[11px] tracking-wider select-none">
        ******
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-800 text-white text-xs border-gray-700"
        >
          Restricted to view
        </TooltipContent>
      </Tooltip>
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADING
   ═══════════════════════════════════════════════════════════════ */
function TraceSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="h-44 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN TRACE PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function TracePageContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || ''
  const id = searchParams.get('id') || ''
  const moduleId = searchParams.get('moduleId') || ''

  const [journey, setJourney] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    if (!type || !id || !moduleId) {
      setError('Missing required parameters: type, id, and moduleId')
      setLoading(false)
      return
    }

    let cancelled = false
    const loadData = async () => {
      try {
        const params = new URLSearchParams({ type, id, moduleId })
        const r = await fetch(`/api/public-trace?${params}`)
        if (cancelled) return
        if (!r.ok) {
          const e = await r.json().catch(() => ({}))
          throw new Error(e.message || 'Failed to load trace data')
        }
        const data = await r.json()
        if (cancelled) return
        setJourney(data)
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    setLoading(true)
    setError('')
    setJourney(null)
    loadData()
    return () => {
      cancelled = true
    }
  }, [type, id, moduleId])

  const toggleStage = (key: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // ─── Helpers ───
  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—'

  const j = journey

  // ─── Timeline stage definitions ───
  const stages: {
    key: string
    label: string
    icon: any
    colorClass: string
    bgClass: string
    nodeClass: string
    hasData: boolean
  }[] = [
    {
      key: 'farmer',
      label: 'Farmer',
      icon: Users,
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50 border-emerald-200',
      nodeClass: 'bg-emerald-500',
      hasData: !!j?.farmer,
    },
    {
      key: 'farmland',
      label: 'Farm & Land',
      icon: MapPin,
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50/60 border-emerald-200',
      nodeClass: 'bg-emerald-400',
      hasData: !!j?.farmLand,
    },
    {
      key: 'cultivation',
      label: 'Cultivation',
      icon: Sprout,
      colorClass: 'text-green-700',
      bgClass: 'bg-green-50 border-green-200',
      nodeClass: 'bg-green-500',
      hasData: !!j?.cultivation,
    },
    {
      key: 'nursery',
      label: 'Nursery',
      icon: Baby,
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50/60 border-emerald-200',
      nodeClass: 'bg-emerald-300',
      hasData: !!j?.nursery,
    },
    {
      key: 'landprep',
      label: 'Land Preparation',
      icon: Tractor,
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50/40 border-emerald-200',
      nodeClass: 'bg-emerald-200',
      hasData: !!j?.landPreparation,
    },
    {
      key: 'cropmonitor',
      label: 'Crop Monitoring',
      icon: ScanSearch,
      colorClass: 'text-lime-700',
      bgClass: 'bg-lime-50 border-lime-200',
      nodeClass: 'bg-lime-500',
      hasData: (j?.cropMonitorings?.length || 0) > 0,
    },
    {
      key: 'harvest',
      label: 'Harvest',
      icon: Wheat,
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50 border-amber-200',
      nodeClass: 'bg-amber-500',
      hasData: !!j?.harvest,
    },
    {
      key: 'processing',
      label: 'Processing',
      icon: Factory,
      colorClass: 'text-orange-700',
      bgClass: 'bg-orange-50 border-orange-200',
      nodeClass: 'bg-orange-500',
      hasData: (j?.processingStages?.length || 0) > 0,
    },
    {
      key: 'procurement',
      label: 'Procurement',
      icon: Store,
      colorClass: 'text-purple-700',
      bgClass: 'bg-purple-50 border-purple-200',
      nodeClass: 'bg-purple-500',
      hasData: !!j?.procurement,
    },
    {
      key: 'transport',
      label: 'Transport',
      icon: Route,
      colorClass: 'text-purple-700',
      bgClass: 'bg-purple-50/60 border-purple-200',
      nodeClass: 'bg-purple-400',
      hasData: !!j?.transport,
    },
    {
      key: 'marketplace',
      label: 'Marketplace',
      icon: ShoppingBag,
      colorClass: 'text-rose-700',
      bgClass: 'bg-rose-50 border-rose-200',
      nodeClass: 'bg-rose-500',
      hasData: !!j?.marketplace,
    },
    {
      key: 'certification',
      label: 'Certification',
      icon: ShieldCheck,
      colorClass: 'text-cyan-700',
      bgClass: 'bg-cyan-50 border-cyan-200',
      nodeClass: 'bg-cyan-500',
      hasData:
        (j?.certifications?.inspections?.length || 0) > 0 ||
        (j?.certifications?.assessments?.length || 0) > 0,
    },
  ]

  const completedCount = stages.filter((s) => s.hasData).length

  // ─── Stage peek summaries ───
  const getStagePeek = (
    key: string
  ): { label: string; value: string }[] => {
    switch (key) {
      case 'farmer':
        return j?.farmer
          ? [
              {
                label: 'Name',
                value: 'Farmer ***',
              },
              {
                label: 'Code',
                value: j.farmer.farmerCode || '—',
              },
              {
                label: 'Location',
                value:
                  [j.farmer.district, j.farmer.province]
                    .filter(Boolean)
                    .join(', ') || '—',
              },
            ]
          : []
      case 'farmland':
        return j?.farmLand
          ? [
              { label: 'Farm', value: j.farmLand.farmName },
              {
                label: 'Area',
                value: j.farmLand.totalLandHolding
                  ? `${j.farmLand.totalLandHolding} Ha`
                  : '—',
              },
              {
                label: 'Altitude',
                value: j.farmLand.altitude
                  ? `${j.farmLand.altitude}m`
                  : '—',
              },
            ]
          : []
      case 'cultivation':
        return j?.cultivation
          ? [
              { label: 'Crop', value: j.cultivation.cultivatedCrop },
              {
                label: 'Variety',
                value: j.cultivation.cropVariety || '—',
              },
              { label: 'Plot', value: j.cultivation.farmPlotName },
            ]
          : []
      case 'nursery':
        return j?.nursery
          ? [
              { label: 'Variety', value: j.nursery.coffeeVariety },
              {
                label: 'Capacity',
                value: j.nursery.nurseryCapacity
                  ? `${j.nursery.nurseryCapacity} plants`
                  : '—',
              },
              { label: 'Health', value: j.nursery.seedlingHealth },
            ]
          : []
      case 'landprep':
        return j?.landPreparation
          ? [
              { label: 'Activity', value: j.landPreparation.activity },
              {
                label: 'Date',
                value: fmtDate(j.landPreparation.eventDate),
              },
              {
                label: 'Implements',
                value: j.landPreparation.implementsUsed || '—',
              },
            ]
          : []
      case 'cropmonitor':
        return (j?.cropMonitorings?.length || 0) > 0
          ? [
              {
                label: 'Visits',
                value: String(j.cropMonitorings.length),
              },
              {
                label: 'Latest Stage',
                value:
                  j.cropMonitorings[j.cropMonitorings.length - 1]
                    ?.growthStage || '—',
              },
              {
                label: 'Alerts',
                value: String(
                  j.cropMonitorings.filter(
                    (c: any) => c.alertTriggered
                  ).length
                ),
              },
            ]
          : []
      case 'harvest':
        return j?.harvest
          ? [
              { label: 'Method', value: j.harvest.method },
              {
                label: 'Date',
                value: fmtDate(j.harvest.actualDate),
              },
              {
                label: 'Cup Score',
                value: j.harvest.cupScore
                  ? String(j.harvest.cupScore)
                  : '—',
              },
            ]
          : []
      case 'processing':
        return (j?.processingStages?.length || 0) > 0
          ? [
              {
                label: 'Stages',
                value: `${j.processingStages.length} completed`,
              },
              {
                label: 'Latest',
                value:
                  j.processingStages[j.processingStages.length - 1]?.stageType?.replace(
                    /_/g,
                    ' '
                  ) || '—',
              },
              {
                label: 'Recorded',
                value: fmtDate(
                  j.processingStages[j.processingStages.length - 1]
                    ?.recordedAt
                ),
              },
            ]
          : []
      case 'procurement':
        return j?.procurement
          ? [
              {
                label: 'Centre',
                value: j.procurement.centre || '—',
              },
              {
                label: 'Weight',
                value: `${j.procurement.netWeight?.toLocaleString()} kg`,
              },
              { label: 'Total', value: 'Restricted' },
            ]
          : []
      case 'transport':
        return j?.transport
          ? [
              {
                label: 'Route',
                value: j.transport.route || '—',
              },
              {
                label: 'Departure',
                value: fmtDate(j.transport.departure),
              },
              {
                label: 'Received',
                value: `${j.transport.receivedWeight?.toLocaleString()} kg`,
              },
            ]
          : []
      case 'marketplace':
        return j?.marketplace
          ? [
              {
                label: 'Variety',
                value: j.marketplace.variety,
              },
              {
                label: 'Available',
                value: `${j.marketplace.qty?.toLocaleString()} kg`,
              },
              {
                label: 'Listed',
                value: fmtDate(j.marketplace.listingDate),
              },
            ]
          : []
      case 'certification': {
        const totalCerts =
          (j?.certifications?.inspections?.length || 0) +
          (j?.certifications?.assessments?.length || 0)
        const compliant =
          j?.certifications?.inspections?.filter(
            (i: any) => i.complianceStatus === 'Compliant'
          ).length || 0
        return totalCerts > 0
          ? [
              { label: 'Certificates', value: `${totalCerts} total` },
              {
                label: 'Compliant',
                value: `${compliant} passed`,
              },
              {
                label: 'Latest',
                value:
                  j.certifications.inspections?.[0]
                    ?.certificationType ||
                  j.certifications.assessments?.[0]
                    ?.certificationStandard ||
                  '—',
              },
            ]
          : []
      }
      default:
        return []
    }
  }

  // ─── Stage detail content with masking ───
  const renderStageContent = (stageKey: string) => {
    return (
      <>
        {/* FARMER — masked sensitive fields */}
        {stageKey === 'farmer' && j?.farmer && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Name
              </span>
              <p className="font-medium text-sm flex items-center gap-1">
                Farmer ***
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-gray-800 text-white text-xs border-gray-700"
                  >
                    Restricted to view
                  </TooltipContent>
                </Tooltip>
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Farmer Code
              </span>
              <p className="font-mono text-sm">
                {j.farmer.farmerCode || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Contact
              </span>
              <MaskedField label="Contact" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Email
              </span>
              <MaskedField label="Email" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Location
              </span>
              <p className="text-sm">
                {[j.farmer.district, j.farmer.province]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Cooperative
              </span>
              <p className="text-sm">
                {j.farmer.cooperative || '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {j.farmer.isCertified && (
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] border-0">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" />
                  Certified
                </Badge>
              )}
              {j.farmer.creditScore && (
                <Badge
                  variant="outline"
                  className="text-[10px]"
                >
                  Credit: {j.farmer.creditScore}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* FARMLAND — all public */}
        {stageKey === 'farmland' && j?.farmLand && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Farm Name
              </span>
              <p className="font-medium text-sm">
                {j.farmLand.farmName}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Land Area
              </span>
              <p className="text-sm">
                {j.farmLand.totalLandHolding
                  ? `${j.farmLand.totalLandHolding} Ha`
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Altitude
              </span>
              <p className="text-sm">
                {j.farmLand.altitude
                  ? `${j.farmLand.altitude}m`
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Soil Type
              </span>
              <p className="text-sm">
                {j.farmLand.soilType || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Irrigation
              </span>
              <p className="text-sm">
                {j.farmLand.irrigationType || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Shade Cover
              </span>
              <p className="text-sm">
                {j.farmLand.shadeTreeCover
                  ? `${j.farmLand.shadeTreeCover}%`
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* CULTIVATION — all public */}
        {stageKey === 'cultivation' && j?.cultivation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Crop
              </span>
              <p className="font-medium text-sm">
                {j.cultivation.cultivatedCrop}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Variety
              </span>
              <p className="text-sm">
                {j.cultivation.cropVariety || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Species
              </span>
              <p className="text-sm italic">
                {j.cultivation.coffeeSpecies || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Plot
              </span>
              <p className="text-sm">
                {j.cultivation.farmPlotName}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Area
              </span>
              <p className="text-sm">
                {j.cultivation.cultivationArea
                  ? `${j.cultivation.cultivationArea} Ha`
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Sowing Date
              </span>
              <p className="text-sm">
                {fmtDate(j.cultivation.sowingDate)}
              </p>
            </div>
          </div>
        )}

        {/* NURSERY — all public */}
        {stageKey === 'nursery' && j?.nursery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Variety
              </span>
              <p className="font-medium text-sm">
                {j.nursery.coffeeVariety}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Capacity
              </span>
              <p className="text-sm">
                {j.nursery.nurseryCapacity || '—'} plants
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Sowing
              </span>
              <p className="text-sm">
                {fmtDate(j.nursery.sowingDate)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Germination
              </span>
              <p className="text-sm">
                {j.nursery.germinationRate
                  ? `${j.nursery.germinationRate}%`
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Health
              </span>
              <p className="text-sm">
                {j.nursery.seedlingHealth}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Survival
              </span>
              <p className="text-sm">
                {j.nursery.survivalRate
                  ? `${j.nursery.survivalRate}%`
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* LAND PREPARATION — all public */}
        {stageKey === 'landprep' && j?.landPreparation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Activity
              </span>
              <p className="font-medium text-sm">
                {j.landPreparation.activity}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Implements
              </span>
              <p className="text-sm">
                {j.landPreparation.implementsUsed || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Date
              </span>
              <p className="text-sm">
                {fmtDate(j.landPreparation.eventDate)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Compost
              </span>
              <p className="text-sm">
                {j.landPreparation.compostApplied
                  ? j.landPreparation.compostType || 'Yes'
                  : 'No'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Planting
              </span>
              <p className="text-sm">
                {fmtDate(j.landPreparation.plantingDate)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Spacing
              </span>
              <p className="text-sm">
                {j.landPreparation.spacing || '—'}
              </p>
            </div>
          </div>
        )}

        {/* CROP MONITORING — all public */}
        {stageKey === 'cropmonitor' &&
          (j?.cropMonitorings?.length || 0) > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">
                    Visits
                  </p>
                  <p className="font-bold text-lg">
                    {j.cropMonitorings.length}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">
                    Latest Stage
                  </p>
                  <p className="font-bold text-xs">
                    {
                      j.cropMonitorings[
                        j.cropMonitorings.length - 1
                      ]?.growthStage
                    }
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">
                    Alerts
                  </p>
                  <p className="font-bold text-lg">
                    {
                      j.cropMonitorings.filter(
                        (c: any) => c.alertTriggered
                      ).length
                    }
                  </p>
                </div>
              </div>
              <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
                {j.cropMonitorings.map(
                  (cm: any, ci: number) => (
                    <div
                      key={ci}
                      className="bg-white/60 rounded-lg p-3 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {fmtDate(cm.visitDate)}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          {cm.growthStage}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                        {cm.plantHeight && (
                          <span>
                            Height: {cm.plantHeight}m
                          </span>
                        )}
                        {cm.canopyCover && (
                          <span>
                            Canopy: {cm.canopyCover}%
                          </span>
                        )}
                        {cm.ndviIndex && (
                          <span>NDVI: {cm.ndviIndex}</span>
                        )}
                        {cm.pestInfestation && (
                          <span className="text-red-600">
                            Pest: {cm.pestType}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}

        {/* HARVEST — all public */}
        {stageKey === 'harvest' && j?.harvest && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Method
              </span>
              <p className="font-medium text-sm">
                {j.harvest.method}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Harvest Date
              </span>
              <p className="text-sm">
                {fmtDate(j.harvest.actualDate)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Processing
              </span>
              <p className="text-sm">
                {j.harvest.processingMethod}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Cherry Ripeness
              </span>
              <p className="text-sm">
                {j.harvest.cherryRipeness
                  ? `${j.harvest.cherryRipeness}%`
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Moisture
              </span>
              <p className="text-sm">
                {j.harvest.moisture
                  ? `${j.harvest.moisture}%`
                  : '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {j.harvest.cupScore && (
                <Badge className="bg-amber-100 text-amber-700 border-0">
                  Cup: {j.harvest.cupScore}
                </Badge>
              )}
              {j.harvest.defectiveBeans && (
                <Badge
                  variant="outline"
                  className="text-[10px]"
                >
                  Defects: {j.harvest.defectiveBeans}%
                </Badge>
              )}
            </div>
            {j.harvest.notes && (
              <p className="col-span-full text-xs text-muted-foreground italic">
                {j.harvest.notes}
              </p>
            )}
          </div>
        )}

        {/* PROCESSING — all public */}
        {stageKey === 'processing' &&
          (j?.processingStages?.length || 0) > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {j.processingStages.map(
                  (ps: any, pi: number) => (
                    <Badge
                      key={pi}
                      variant="outline"
                      className="text-xs bg-white/80 border-orange-200 text-orange-700"
                    >
                      {ps.stageType?.replace(/_/g, ' ')}
                    </Badge>
                  )
                )}
              </div>
              <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
                {j.processingStages.map(
                  (ps: any, pi: number) => (
                    <div
                      key={pi}
                      className="bg-white/70 rounded-lg p-3 border border-orange-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-xs text-orange-700">
                          {ps.stageType?.replace(/_/g, ' ')}
                        </h5>
                        <span className="text-[10px] text-muted-foreground">
                          {fmtDate(ps.recordedAt)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs">
                        {ps.stageData &&
                          Object.entries(ps.stageData)
                            .filter(
                              ([, v]) => v != null && v !== ''
                            )
                            .slice(0, 6)
                            .map(([key, val]) => (
                              <div key={key}>
                                <span className="text-muted-foreground capitalize">
                                  {String(key).replace(
                                    /([A-Z])/g,
                                    ' $1'
                                  )}
                                </span>
                                <p className="font-medium truncate">
                                  {typeof val === 'number'
                                    ? val.toLocaleString()
                                    : String(val).slice(0, 30)}
                                </p>
                              </div>
                            ))}
                      </div>
                      {ps.notes && (
                        <p className="text-[11px] text-muted-foreground italic mt-1">
                          {ps.notes}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </>
          )}

        {/* PROCUREMENT — masked financial fields */}
        {stageKey === 'procurement' && j?.procurement && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Centre
              </span>
              <p className="font-medium text-sm">
                {j.procurement.centre || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Date
              </span>
              <p className="text-sm">
                {fmtDate(j.procurement.date)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Net Weight
              </span>
              <p className="font-bold text-sm">
                {j.procurement.netWeight?.toLocaleString()} kg
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Price/kg
              </span>
              <MaskedField label="Price" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Total Amount
              </span>
              <MaskedField label="Total" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Payment
              </span>
              <p>
                <Badge
                  className={
                    j.procurement.paymentStatus === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700 border-0'
                      : 'bg-amber-100 text-amber-700 border-0'
                  }
                >
                  {j.procurement.paymentStatus}
                </Badge>
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Cherry Grade
              </span>
              <p className="text-sm">
                {j.procurement.cherryRipenessGrade || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Cert Premium
              </span>
              <MaskedField label="Cert Premium" />
            </div>
          </div>
        )}

        {/* TRANSPORT — masked driver & vehicle */}
        {stageKey === 'transport' && j?.transport && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Vehicle
              </span>
              <MaskedField label="Vehicle" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Driver
              </span>
              <MaskedField label="Driver" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Route
              </span>
              <p className="text-sm">
                {j.transport.route || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Departure
              </span>
              <p className="text-sm">
                {fmtDate(j.transport.departure)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Arrival
              </span>
              <p className="text-sm">
                {fmtDate(j.transport.arrival)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Received
              </span>
              <p className="font-bold text-sm">
                {j.transport.receivedWeight?.toLocaleString()} kg
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Transport Cost
              </span>
              <MaskedField label="Cost" />
            </div>
          </div>
        )}

        {/* MARKETPLACE — masked price */}
        {stageKey === 'marketplace' && j?.marketplace && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Variety
              </span>
              <p className="font-medium text-sm">
                {j.marketplace.variety}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Process
              </span>
              <p className="text-sm">
                {j.marketplace.processingMethod || '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Available
              </span>
              <p className="font-bold text-sm">
                {j.marketplace.qty?.toLocaleString()} kg
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Price/kg
              </span>
              <MaskedField label="Price" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Listed
              </span>
              <p className="text-sm">
                {fmtDate(j.marketplace.listingDate)}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Valid Until
              </span>
              <p className="text-sm">
                {fmtDate(j.marketplace.validUntil)}
              </p>
            </div>
            {j.marketplace.certLabels && (
              <div className="col-span-full">
                <span className="text-xs text-muted-foreground">
                  Labels
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {String(j.marketplace.certLabels)
                    .split(',')
                    .map((l: string, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] bg-white/80"
                      >
                        <Leaf className="h-2.5 w-2.5 mr-0.5 text-emerald-600" />
                        {l.trim()}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATION — masked IDs */}
        {stageKey === 'certification' && j?.certifications && (
          <div className="space-y-3">
            {j.certifications.inspections?.map(
              (insp: any, i: number) => (
                <div
                  key={i}
                  className="bg-white/60 rounded-lg p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {insp.certificationType}
                    </span>
                    <Badge
                      className={
                        insp.complianceStatus === 'Compliant'
                          ? 'bg-emerald-100 text-emerald-700 border-0'
                          : 'bg-red-100 text-red-700 border-0'
                      }
                    >
                      {insp.complianceStatus}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Body: {insp.certifyingBody}
                  </p>
                  <p className="text-muted-foreground">
                    Certificate:{' '}
                    <MaskedField label="Certificate" />
                  </p>
                  <div className="flex gap-4 text-muted-foreground">
                    <span>
                      Issued: {fmtDate(insp.certIssueDate)}
                    </span>
                    <span>
                      Expires: {fmtDate(insp.certExpiryDate)}
                    </span>
                  </div>
                </div>
              )
            )}
            {j.certifications.assessments?.map(
              (ca: any, i: number) => (
                <div
                  key={`a-${i}`}
                  className="bg-white/60 rounded-lg p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {ca.certificationStandard}
                    </span>
                    <Badge variant="outline">
                      {ca.certificationOutcome}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Score: <strong>{ca.totalScorePercentage}%</strong>
                  </p>
                  <p className="text-muted-foreground">
                    Date: {fmtDate(ca.assessmentDate)}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </>
    )
  }

  // ─── Loading ───
  if (loading) return <TraceSkeleton />

  // ─── Error ───
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                Terra Brew
              </span>
            </div>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Trace Data
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!j) return null

  // ─── Progress ring ───
  const circumference = 2 * Math.PI * 34
  const progressOffset =
    circumference * (1 - completedCount / stages.length)

  // ─── Breadcrumb labels ───
  const typeLabel =
    type === 'farmland' ? 'Farm Land' : 'Cultivation'
  const breadcrumbItemName =
    j.farmLand?.farmName || j.cultivation?.farmPlotName || typeLabel

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* HEADER                                                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">
              Terra Brew
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
            <Leaf className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Public Trace</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap"
          aria-label="Breadcrumb"
        >
          <span className="hover:text-emerald-600 transition-colors">
            {typeLabel}
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {breadcrumbItemName}
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-emerald-700 font-medium">
            Trace Journey
          </span>
        </motion.nav>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* HERO CARD                                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl shadow-lg"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          {/* Content */}
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Progress ring */}
              <div className="relative h-20 w-20 shrink-0">
                <svg
                  className="h-20 w-20 -rotate-90"
                  viewBox="0 0 80 80"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {completedCount}
                  </span>
                  <span className="text-[10px] text-emerald-200">
                    /{stages.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {j.farmLand?.farmName || 'Trace Journey'}
                </h1>
                <p className="text-emerald-200 text-sm mb-2">
                  {j.cultivation?.cultivatedCrop
                    ? `${j.cultivation.cultivatedCrop}${j.cultivation.cropVariety ? ` · ${j.cultivation.cropVariety}` : ''}`
                    : 'Coffee Traceability'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-white/15 text-white border-0 text-[10px]">
                    Batch:{' '}
                    <span className="font-mono ml-1">
                      {j.batchId?.slice(0, 12)}...
                    </span>
                  </Badge>
                  {j.totalBatches > 1 && (
                    <Badge className="bg-amber-400/20 text-amber-200 border-0 text-[10px]">
                      {j.totalBatches} batches
                    </Badge>
                  )}
                  {j.farmer?.isCertified && (
                    <Badge className="bg-emerald-400/20 text-emerald-200 border-0 text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-0.5" />
                      Certified Farmer
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* DATA PRIVACY NOTICE                                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
        >
          <Info className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Privacy Notice:</span>{' '}
            Personal and financial information is masked (
            <code className="bg-amber-100 px-1 rounded text-[11px] font-mono">
              ******
            </code>
            ) to protect farmer and business confidentiality. Only
            non-sensitive traceability data is displayed.
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TIMELINE                                               */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />

          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const Icon = stage.icon
              const isExpanded = expandedStages.has(stage.key)
              const peek = getStagePeek(stage.key)

              if (!stage.hasData) return null

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * idx, duration: 0.35 }}
                  className="relative"
                >
                  {/* Timeline node */}
                  <div className="absolute left-3 sm:left-3.5 top-5 z-10">
                    <div
                      className={`h-4 w-4 rounded-full ${stage.nodeClass} ring-4 ring-white shadow-sm`}
                    />
                  </div>

                  {/* Card */}
                  <div className="ml-10 sm:ml-12">
                    <div
                      className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-200 ${stage.bgClass}`}
                    >
                      {/* Card header */}
                      <button
                        onClick={() => toggleStage(stage.key)}
                        className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-lg ${stage.nodeClass} bg-opacity-10 flex items-center justify-center`}
                            style={{
                              backgroundColor:
                                stage.nodeClass.replace('bg-', 'rgba(') ? undefined : undefined,
                            }}
                          >
                            <Icon
                              className={`h-4.5 w-4.5 ${stage.colorClass}`}
                            />
                          </div>
                          <div>
                            <h3
                              className={`font-semibold text-sm ${stage.colorClass}`}
                            >
                              {stage.label}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span className="text-[11px] text-muted-foreground">
                                Data available
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Peek summary */}
                        <div className="hidden md:flex items-center gap-4">
                          {peek.slice(0, 3).map((p, pi) => (
                            <div
                              key={pi}
                              className="text-right"
                            >
                              <p className="text-[10px] text-muted-foreground">
                                {p.label}
                              </p>
                              <p className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                                {p.value}
                              </p>
                            </div>
                          ))}
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </div>

                        {/* Mobile chevron */}
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 md:hidden ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: 'auto',
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.25,
                            }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-black/5 pt-3">
                              {renderStageContent(stage.key)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* FOOTER                                                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-gray-900">
                Terra Brew
              </span>
              <span>· Coffee Traceability Platform</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-emerald-500" />
              <span>Transparent · Ethical · Sustainable</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EXPORTED PAGE WITH SUSPENSE BOUNDARY
   ═══════════════════════════════════════════════════════════════ */
export default function TracePage() {
  return (
    <Suspense fallback={<TraceSkeleton />}>
      <TracePageContent />
    </Suspense>
  )
}
