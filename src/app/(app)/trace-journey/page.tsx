'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, MapPin, Sprout, Baby, Tractor, ScanSearch,
  Wheat, Factory, Package, Truck, Store, Award,
  Search, QrCode, ChevronDown, ChevronRight, ArrowRight,
  Clock, CheckCircle2, Circle, AlertCircle, Navigation,
  MapPinned, CalendarDays, UserCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem, PulseDot } from '@/components/ui/animations'
import { SensitiveField } from '@/components/ui/sensitive-field'

// ======== TIMELINE STAGES ========
const TRACE_STAGES = [
  { id: 'farmer', label: 'Farmer', icon: Users, color: 'bg-emerald-500', description: 'Origin farmer registration & profile' },
  { id: 'farmland', label: 'Farm Land', icon: MapPin, color: 'bg-emerald-600', description: 'Geolocated farm plot with boundaries' },
  { id: 'cultivation', label: 'Cultivation', icon: Sprout, color: 'bg-green-600', description: 'Coffee variety and growing practices' },
  { id: 'nursery', label: 'Nursery', icon: Baby, color: 'bg-teal-500', description: 'Seedling propagation and management' },
  { id: 'land-prep', label: 'Land Prep', icon: Tractor, color: 'bg-amber-500', description: 'Soil preparation and field readiness' },
  { id: 'crop-monitor', label: 'Crop Monitor', icon: ScanSearch, color: 'bg-lime-500', description: 'Growth monitoring and health checks' },
  { id: 'harvest', label: 'Harvest', icon: Wheat, color: 'bg-amber-600', description: 'Cherry picking and batch creation' },
  { id: 'processing', label: 'Processing', icon: Factory, color: 'bg-orange-500', description: 'Wet/dry milling and quality control' },
  { id: 'procurement', label: 'Procurement', icon: Package, color: 'bg-purple-500', description: 'Purchase, weighing and payment' },
  { id: 'transport', label: 'Transport', icon: Truck, color: 'bg-cyan-600', description: 'Logistics and shipping tracking' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, color: 'bg-cyan-500', description: 'Listing and sales management' },
  { id: 'certification', label: 'Certification', icon: Award, color: 'bg-rose-500', description: 'Quality certification and compliance' },
]

const CURRENT_STAGE_INDEX = 7 // processing is current

// ======== STAGE DETAIL DATA ========
const STAGE_DETAILS: Record<string, Array<{ label: string; value: string; masked?: boolean }>> = {
  'farmer': [
    { label: 'Farmer Name', value: 'Nguyen Van Minh', masked: true },
    { label: 'Farmer Code', value: 'FMR-2024-001' },
    { label: 'Province', value: 'Dak Lak' },
    { label: 'Contact', value: '0901***456', masked: true },
  ],
  'farmland': [
    { label: 'Farm Name', value: 'Highland Farm A' },
    { label: 'Total Area', value: '2.5 Ha' },
    { label: 'Altitude', value: '850m' },
    { label: 'Soil Type', value: 'Basaltic Red' },
  ],
  'cultivation': [
    { label: 'Plot Name', value: 'Plot A1' },
    { label: 'Coffee Variety', value: 'Arabica Bourbon' },
    { label: 'Area', value: '1.2 Ha' },
    { label: 'Planting Date', value: '2020-03-15' },
  ],
  'nursery': [
    { label: 'Nursery Name', value: 'Central Nursery' },
    { label: 'Species', value: 'Coffea Arabica' },
    { label: 'Germination Rate', value: '92%' },
    { label: 'Health Status', value: 'Good' },
  ],
  'land-prep': [
    { label: 'Preparation Type', value: 'Debushing' },
    { label: 'Method', value: 'Manual' },
    { label: 'Date', value: '2024-01-10' },
    { label: 'Soil pH After', value: '6.2' },
  ],
  'crop-monitor': [
    { label: 'Growth Stage', value: 'Ripening' },
    { label: 'Health Score', value: '8.5/10' },
    { label: 'Pest Pressure', value: 'Low' },
    { label: 'Temperature', value: '24°C' },
  ],
  'harvest': [
    { label: 'Batch ID', value: 'BATCH-2024-001' },
    { label: 'Harvest Method', value: 'Selective Picking' },
    { label: 'Cherry Ripeness', value: '95%' },
    { label: 'Cup Score', value: '84.5' },
  ],
  'processing': [
    { label: 'Processing Method', value: 'Washed' },
    { label: 'Moisture Content', value: '11.2%' },
    { label: 'Defective Beans', value: '2.1%' },
    { label: 'Operator', value: 'Plant Alpha' },
  ],
  'procurement': [
    { label: 'Procurement ID', value: 'PROC-2024-042' },
    { label: 'Net Weight', value: '150 kg' },
    { label: 'Price/kg', value: '$4.85' },
    { label: 'Payment Status', value: 'Completed' },
  ],
  'transport': [
    { label: 'Vehicle Number', value: '51B-1234' },
    { label: 'Driver', value: 'Tran Van A', masked: true },
    { label: 'Destination', value: 'HCMC Warehouse' },
    { label: 'Departure', value: '2024-02-15' },
  ],
  'marketplace': [
    { label: 'Listing Title', value: 'Premium Arabica Dak Lak' },
    { label: 'Quantity', value: '500 kg' },
    { label: 'Price/kg', value: '$5.20' },
    { label: 'Status', value: 'Active' },
  ],
  'certification': [
    { label: 'Standard', value: 'Organic EU' },
    { label: 'Certifying Body', value: 'Control Union' },
    { label: 'Certificate #', value: 'CU-2024-VN-001' },
    { label: 'Valid Until', value: '2025-12-31' },
  ],
}

const STAGE_TIMESTAMPS: Record<string, string> = {
  'farmer': '2024-01-05 09:00',
  'farmland': '2024-01-05 09:15',
  'cultivation': '2024-01-08 14:00',
  'nursery': '2024-01-10 10:30',
  'land-prep': '2024-01-15 08:00',
  'crop-monitor': '2024-01-20 11:00',
  'harvest': '2024-02-01 06:30',
  'processing': '2024-02-05 07:00',
  'procurement': '',
  'transport': '',
  'marketplace': '',
  'certification': '',
}

// ======== MASKED FIELD ========
function MaskedField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <SensitiveField value={value} />
    </div>
  )
}

// ======== VERTICAL TIMELINE NODE ========
function TimelineNode({ stage, index, isCompleted, isCurrent, isPending, isExpanded, onToggle }: {
  stage: typeof TRACE_STAGES[0]
  index: number
  isCompleted: boolean
  isCurrent: boolean
  isPending: boolean
  isExpanded: boolean
  onToggle: () => void
}) {
  const Icon = stage.icon
  const details = STAGE_DETAILS[stage.id] || []
  const timestamp = STAGE_TIMESTAMPS[stage.id]

  return (
    <div className="flex gap-4">
      {/* Left: Timeline node + connector */}
      <div className="flex flex-col items-center shrink-0">
        <motion.button
          onClick={onToggle}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08 * index, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          {/* Pulse ring for current */}
          {isCurrent && (
            <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/40" />
          )}
          <div className={`relative h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all ${
            isCompleted
              ? `${stage.color} text-white shadow-md`
              : isCurrent
                ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-200'
                : 'bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/30'
          }`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        </motion.button>

        {/* Connector line */}
        <div className="relative w-0.5 flex-1 min-h-[40px]">
          <motion.div
            className={`absolute inset-x-0 top-0 ${isCompleted ? 'bg-emerald-400' : 'bg-muted-foreground/20'}`}
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ delay: 0.08 * index + 0.3, duration: 0.5 }}
          />
          {isCompleted && (
            <motion.div
              className="absolute inset-x-0 top-0 bg-emerald-300/40"
              style={{
                background: 'linear-gradient(180deg, rgba(52,211,153,0.4) 0%, transparent 100%)',
              }}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: 0.08 * index + 0.3, duration: 0.8 }}
            />
          )}
        </div>
      </div>

      {/* Right: Stage content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 * index + 0.1, duration: 0.35 }}
        className="pb-6 flex-1 min-w-0"
      >
        <button
          onClick={onToggle}
          className="w-full text-left flex items-center gap-2 group"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{stage.label}</h4>
              {isCompleted && (
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" /> Complete
                </Badge>
              )}
              {isCurrent && (
                <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0">
                  <PulseDot color="bg-amber-500" size="sm" /> In Progress
                </Badge>
              )}
              {isPending && (
                <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">Pending</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
            {timestamp && (
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timestamp}
              </p>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        </button>

        {/* Expanded detail panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <motion.div
                layoutId={`stage-detail-${stage.id}`}
                className="mt-3 p-4 rounded-lg bg-muted/30 border"
              >
                <div className="grid grid-cols-2 gap-3">
                  {details.map((detail) => (
                    <div key={detail.label}>
                      {detail.masked ? (
                        <MaskedField label={detail.label} value={detail.value} />
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">{detail.label}</p>
                          <p className="text-sm font-medium">{detail.value || '—'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Mini map placeholder */}
                <div className="mt-3 h-20 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 flex items-center justify-center border border-dashed border-emerald-200 dark:border-emerald-800">
                  <MapPinned className="h-5 w-5 text-emerald-400 mr-2" />
                  <span className="text-xs text-muted-foreground">Location data</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ======== POPULAR BATCH IDS ========
const POPULAR_BATCHES = ['BATCH-2024-001', 'BATCH-2024-015', 'BATCH-2024-042', 'BATCH-2024-088']

// ======== MAIN PAGE ========
export default function TraceJourneyPage() {
  const [batchId, setBatchId] = useState('')
  const [searched, setSearched] = useState(false)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [showRecent, setShowRecent] = useState(false)
  const [animatedStages, setAnimatedStages] = useState(0)

  const handleSearch = () => {
    if (batchId.trim()) {
      setSearched(true)
      setExpandedStage(null)
      setAnimatedStages(0)
    }
  }

  const selectBatch = (id: string) => {
    setBatchId(id)
    setSearched(true)
    setExpandedStage(null)
    setAnimatedStages(0)
    setShowRecent(false)
  }

  // Animate stages one by one
  useEffect(() => {
    if (searched && animatedStages < TRACE_STAGES.length) {
      const timer = setTimeout(() => {
        setAnimatedStages(prev => prev + 1)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [searched, animatedStages])

  const completedCount = CURRENT_STAGE_INDEX
  const totalCount = TRACE_STAGES.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gradient-emerald inline-block">Trace Journey</h2>
            <p className="text-sm text-muted-foreground mt-1">Track a batch through the entire supply chain</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Batch ID..."
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                onFocus={() => setShowRecent(true)}
                onBlur={() => setTimeout(() => setShowRecent(false), 200)}
                className="pl-9 sm:w-64"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {/* Recent searches dropdown */}
              <AnimatePresence>
                {showRecent && !searched && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-1 left-0 right-0 bg-card border rounded-lg shadow-lg z-20 p-2"
                  >
                    <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Popular Batch IDs</p>
                    {POPULAR_BATCHES.map(id => (
                      <button
                        key={id}
                        onClick={() => selectBatch(id)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors font-mono"
                      >
                        {id}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSearch}>
              <QrCode className="h-4 w-4 mr-2" /> Trace
            </Button>
          </div>
        </div>
      </FadeIn>

      {!searched ? (
        /* Empty State */
        <FadeIn delay={0.1}>
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block"
              >
                <QrCode className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">Enter a Batch ID to Begin Tracing</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Type a batch ID in the search box above or select a popular batch to trace the complete journey of a coffee batch from farm to cup.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {POPULAR_BATCHES.map(id => (
                  <Button key={id} variant="outline" size="sm" className="font-mono text-xs" onClick={() => selectBatch(id)}>
                    {id}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <>
          {/* Progress Summary Bar */}
          <FadeIn delay={0.1}>
            <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <Badge className="bg-emerald-600 text-white font-mono text-sm">{batchId || 'BATCH-2024-001'}</Badge>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Farmer: <strong className="text-foreground">Nguyen Van Minh</strong></span>
                    <span className="text-muted-foreground">Variety: <strong className="text-foreground">Arabica Bourbon</strong></span>
                    <span className="text-muted-foreground">Stage: <strong className="text-emerald-600">Processing</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Journey Progress</span>
                      <span className="text-sm font-bold text-emerald-600">{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {completedCount}/{totalCount} stages
                  </div>
                </div>
                {/* Mini stage indicators */}
                <div className="flex items-center gap-1 mt-3">
                  {TRACE_STAGES.map((stage, idx) => {
                    const Icon = stage.icon
                    const isCompleted = idx < CURRENT_STAGE_INDEX
                    const isCurrent = idx === CURRENT_STAGE_INDEX
                    return (
                      <div key={stage.id} className="flex items-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-emerald-500 text-white' :
                          isCurrent ? 'bg-amber-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        {idx < TRACE_STAGES.length - 1 && (
                          <div className={`w-2 h-0.5 ${isCompleted ? 'bg-emerald-400' : 'bg-muted-foreground/20'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Vertical Timeline */}
          <FadeIn delay={0.2}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-emerald-600" /> Supply Chain Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative max-h-[600px] overflow-y-auto pr-2">
                  {TRACE_STAGES.slice(0, animatedStages).map((stage, idx) => {
                    const isCompleted = idx < CURRENT_STAGE_INDEX
                    const isCurrent = idx === CURRENT_STAGE_INDEX
                    const isPending = idx > CURRENT_STAGE_INDEX
                    const isExpanded = expandedStage === stage.id

                    return (
                      <TimelineNode
                        key={stage.id}
                        stage={stage}
                        index={idx}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isPending={isPending}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedStage(isExpanded ? null : stage.id)}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  )
}
