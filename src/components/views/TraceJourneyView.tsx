'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import * as api from '@/lib/spa-api'
import { AnimatedPage, FadeIn, ScaleIn } from '@/components/ui/animations'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Users, MapPin, Sprout, Baby, Tractor, ScanSearch, Wheat, Factory,
  Store, Route, ShoppingBag, ShieldCheck, Info, QrCode, Search,
  CheckCircle2, Circle, Loader2,
} from 'lucide-react'

function MaskedField({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
      <span className="bg-gray-200/80 text-gray-400 px-1.5 py-0.5 rounded text-[11px] tracking-wider select-none">******</span>
      <Tooltip><TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors" /></TooltipTrigger><TooltipContent side="top" className="bg-gray-800 text-white text-xs border-gray-700">Restricted to view</TooltipContent></Tooltip>
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STAGE_DEFS = [
  { key: 'farmer', label: 'Farmer', icon: Users, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50 border-emerald-200', nodeClass: 'bg-emerald-500' },
  { key: 'farmland', label: 'Farm & Land', icon: MapPin, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50/60 border-emerald-200', nodeClass: 'bg-emerald-400' },
  { key: 'cultivation', label: 'Cultivation', icon: Sprout, colorClass: 'text-green-700', bgClass: 'bg-green-50 border-green-200', nodeClass: 'bg-green-500' },
  { key: 'nursery', label: 'Nursery', icon: Baby, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50/60 border-emerald-200', nodeClass: 'bg-emerald-300' },
  { key: 'landprep', label: 'Land Preparation', icon: Tractor, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50/40 border-emerald-200', nodeClass: 'bg-emerald-200' },
  { key: 'cropmonitor', label: 'Crop Monitoring', icon: ScanSearch, colorClass: 'text-lime-700', bgClass: 'bg-lime-50 border-lime-200', nodeClass: 'bg-lime-500' },
  { key: 'harvest', label: 'Harvest', icon: Wheat, colorClass: 'text-amber-700', bgClass: 'bg-amber-50 border-amber-200', nodeClass: 'bg-amber-500' },
  { key: 'processing', label: 'Processing', icon: Factory, colorClass: 'text-orange-700', bgClass: 'bg-orange-50 border-orange-200', nodeClass: 'bg-orange-500' },
  { key: 'procurement', label: 'Procurement', icon: Store, colorClass: 'text-purple-700', bgClass: 'bg-purple-50 border-purple-200', nodeClass: 'bg-purple-500' },
  { key: 'certification', label: 'Certification', icon: ShieldCheck, colorClass: 'text-cyan-700', bgClass: 'bg-cyan-50 border-cyan-200', nodeClass: 'bg-cyan-500' },
]

export function TraceJourneyView() {
  const { currentUser } = useAppStore()
  const [searchType, setSearchType] = useState('farmer')
  const [searchId, setSearchId] = useState('')
  const [journey, setJourney] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  const handleSearch = async () => {
    if (!searchId) return
    setLoading(true)
    setError('')
    setJourney(null)
    try {
      // Fetch farmer data and related records for the trace journey
      const farmer = await api.getFarmer(searchId)
      const farmLands = farmer.farmLands || []
      const cultivations = farmer.cultivations || []
      setJourney({
        farmer,
        farmLand: farmLands[0] || null,
        cultivation: cultivations[0] || null,
        harvest: null,
        processing: null,
        procurement: null,
        certification: null,
      })
    } catch (e: any) {
      setError(e.message || 'Failed to load trace data')
    } finally {
      setLoading(false)
    }
  }

  const toggleStage = (key: string) => {
    setExpandedStages(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const j = journey
  const hasData: Record<string, boolean> = {
    farmer: !!j?.farmer,
    farmland: !!j?.farmLand,
    cultivation: !!j?.cultivation,
    nursery: false,
    landprep: false,
    cropmonitor: false,
    harvest: !!j?.harvest,
    processing: !!j?.processing,
    procurement: !!j?.procurement,
    certification: !!j?.certification,
  }
  const completedCount = STAGE_DEFS.filter(s => hasData[s.key]).length

  return (
    <AnimatedPage viewKey="trace-journey">
      <div className="p-4 md:p-6 space-y-6">
        <FadeIn>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Route className="h-6 w-6 text-emerald-600" /> Trace Journey</h2>
            <p className="text-sm text-muted-foreground">Track the complete journey of your coffee from farm to cup</p>
          </div>
        </FadeIn>

        {/* Search */}
        <FadeIn delay={0.1}>
          <Card><CardContent className="p-4">
            <div className="flex gap-3">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">By Farmer ID</SelectItem>
                  <SelectItem value="batch">By Batch ID</SelectItem>
                  <SelectItem value="lot">By Lot Code</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Enter ID to trace..." className="pl-10" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              </div>
              <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
                Trace
              </Button>
            </div>
          </CardContent></Card>
        </FadeIn>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

        {/* Journey Timeline */}
        {j && (
          <>
            <FadeIn delay={0.2}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / STAGE_DEFS.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{completedCount}/{STAGE_DEFS.length} stages</span>
              </div>
            </FadeIn>

            <div className="space-y-3">
              {STAGE_DEFS.map((stage, i) => {
                const isCompleted = hasData[stage.key]
                const isExpanded = expandedStages.has(stage.key)
                const Icon = stage.icon

                return (
                  <motion.div
                    key={stage.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                  >
                    <div className="flex gap-3">
                      {/* Timeline Node */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${isCompleted ? `${stage.nodeClass} border-transparent text-white` : 'bg-muted border-muted-foreground/20 text-muted-foreground/40'}`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                        >
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                        </motion.div>
                        {i < STAGE_DEFS.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[20px] ${isCompleted ? 'bg-emerald-300' : 'bg-muted-foreground/10'}`} />
                        )}
                      </div>

                      {/* Stage Content */}
                      <div className="flex-1 pb-4">
                        <button
                          className={`w-full text-left rounded-xl border p-4 transition-all ${isCompleted ? `${stage.bgClass} hover:shadow-md` : 'bg-muted/30 border-muted'}`}
                          onClick={() => isCompleted && toggleStage(stage.key)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${isCompleted ? stage.colorClass : 'text-muted-foreground/40'}`} />
                              <span className={`font-medium text-sm ${isCompleted ? stage.colorClass : 'text-muted-foreground/40'}`}>{stage.label}</span>
                            </div>
                            {isCompleted ? (
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Complete</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">No data</Badge>
                            )}
                          </div>

                          {/* Peek Summary */}
                          {isCompleted && !isExpanded && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {getStagePeek(stage.key, j).map((item: any, idx: number) => (
                                <div key={idx}>
                                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                                  <p className="text-xs font-medium truncate">{item.value}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && isCompleted && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-current/10">
                                  {renderStageContent(stage.key, j)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}

        {!j && !loading && !error && (
          <FadeIn delay={0.2}>
            <div className="text-center py-16">
              <Route className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Start Tracing</h3>
              <p className="text-sm text-muted-foreground">Enter a Farmer ID, Batch ID, or Lot Code to view the journey</p>
            </div>
          </FadeIn>
        )}
      </div>
    </AnimatedPage>
  )
}

function getStagePeek(key: string, j: any): { label: string; value: string }[] {
  switch (key) {
    case 'farmer':
      return j?.farmer ? [
        { label: 'Name', value: 'Farmer ***' },
        { label: 'Code', value: j.farmer.farmerCode || '—' },
        { label: 'Location', value: [j.farmer.district, j.farmer.province].filter(Boolean).join(', ') || '—' },
      ] : []
    case 'farmland':
      return j?.farmLand ? [
        { label: 'Farm', value: j.farmLand.farmName },
        { label: 'Area', value: j.farmLand.totalLandHolding ? `${j.farmLand.totalLandHolding} Ha` : '—' },
        { label: 'Soil', value: j.farmLand.soilType || '—' },
      ] : []
    case 'cultivation':
      return j?.cultivation ? [
        { label: 'Crop', value: j.cultivation.cultivatedCrop || '—' },
        { label: 'Variety', value: j.cultivation.cropVariety || '—' },
        { label: 'Plot', value: j.cultivation.farmPlotName },
      ] : []
    case 'harvest':
      return j?.harvest ? [
        { label: 'Method', value: j.harvest.harvestMethod || '—' },
        { label: 'Date', value: formatDate(j.harvest.actualHarvestDate) },
        { label: 'Score', value: j.harvest.cupScore ? String(j.harvest.cupScore) : '—' },
      ] : []
    default:
      return []
  }
}

function renderStageContent(key: string, j: any) {
  switch (key) {
    case 'farmer':
      return j?.farmer ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div><span className="text-xs text-muted-foreground">Name</span><p className="font-medium text-sm flex items-center gap-1">Farmer *** <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-gray-400 cursor-help" /></TooltipTrigger><TooltipContent className="bg-gray-800 text-white text-xs">Restricted to view</TooltipContent></Tooltip></TooltipProvider></p></div>
          <div><span className="text-xs text-muted-foreground">Farmer Code</span><p className="font-mono text-sm">{j.farmer.farmerCode || '—'}</p></div>
          <div><span className="text-xs text-muted-foreground">Contact</span><MaskedField label="Contact" /></div>
          <div><span className="text-xs text-muted-foreground">Email</span><MaskedField label="Email" /></div>
          <div><span className="text-xs text-muted-foreground">Location</span><p className="text-sm">{[j.farmer.district, j.farmer.province].filter(Boolean).join(', ')}</p></div>
          <div><span className="text-xs text-muted-foreground">Cooperative</span><p className="text-sm">{j.farmer.cooperative || '—'}</p></div>
          <div className="flex items-center gap-2 flex-wrap">
            {j.farmer.isCertified && <Badge className="bg-emerald-100 text-emerald-700 text-[10px] border-0"><CheckCircle2 className="h-3 w-3 mr-0.5" />Certified</Badge>}
            {j.farmer.creditScore && <Badge variant="outline" className="text-[10px]">Credit: {j.farmer.creditScore}</Badge>}
          </div>
        </div>
      ) : null
    case 'farmland':
      return j?.farmLand ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div><span className="text-xs text-muted-foreground">Farm Name</span><p className="font-medium text-sm">{j.farmLand.farmName}</p></div>
          <div><span className="text-xs text-muted-foreground">Land Area</span><p className="text-sm">{j.farmLand.totalLandHolding ? `${j.farmLand.totalLandHolding} Ha` : '—'}</p></div>
          <div><span className="text-xs text-muted-foreground">Soil Type</span><p className="text-sm">{j.farmLand.soilType || '—'}</p></div>
          <div><span className="text-xs text-muted-foreground">Irrigation</span><p className="text-sm">{j.farmLand.irrigationType || '—'}</p></div>
          <div><span className="text-xs text-muted-foreground">Ownership</span><p className="text-sm">{j.farmLand.landOwnership || '—'}</p></div>
        </div>
      ) : null
    case 'cultivation':
      return j?.cultivation ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div><span className="text-xs text-muted-foreground">Crop</span><p className="font-medium text-sm">{j.cultivation.cultivatedCrop}</p></div>
          <div><span className="text-xs text-muted-foreground">Variety</span><p className="text-sm">{j.cultivation.cropVariety || '—'}</p></div>
          <div><span className="text-xs text-muted-foreground">Plot</span><p className="text-sm">{j.cultivation.farmPlotName}</p></div>
          <div><span className="text-xs text-muted-foreground">Area</span><p className="text-sm">{j.cultivation.cultivationArea ? `${j.cultivation.cultivationArea} Ha` : '—'}</p></div>
          <div><span className="text-xs text-muted-foreground">Sowing Date</span><p className="text-sm">{formatDate(j.cultivation.sowingDate)}</p></div>
        </div>
      ) : null
    default:
      return <p className="text-xs text-muted-foreground">Details available when data is recorded</p>
  }
}
