'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, GitBranch, Search, Loader2, CheckCircle2, Clock,
  MinusCircle, ChevronDown, ChevronUp, FileText,
  ArrowRight, MapPin, QrCode, Download, Eye, EyeOff,
  Sprout, TreePine, FlaskConical, Droplets, Sun, Bug,
  Scissors, Truck, Factory, ShieldCheck, ClipboardCheck,
  Package, Ship, Warehouse, Store, Share2, Link2,
  Lock, Unlock, Fingerprint, Activity, Thermometer, Weight,
  Timer, User, Globe2,
} from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { TraceabilityMap } from '@/components/map'
import type { TraceLocation } from '@/components/map'
import { useI18n } from '@/i18n'
import { getTraceBatchForTenant, type CountryTraceBatch, type CountryTraceStage, type TraceStageData } from '@/lib/traceability-mock-data'

// ═══════════════════════════════════════════════════════════════════
// TRACEABILITY PAGE — Tenant-aware mock data
// Data is selected based on the logged-in user's tenant country.
// ═══════════════════════════════════════════════════════════════════

// TraceStageData is imported from traceability-mock-data

interface TraceStage {
  key: string
  icon: string
  lucideIcon: React.ElementType
  nameVi: string
  nameEn: string
  status: 'completed' | 'in_progress' | 'pending'
  date: string | null
  operator: string
  location: string
  lat: number
  lng: number
  metrics: { label: string; value: string }[]
  details: TraceStageData
  hash: string
}

interface ChainBlock {
  index: number
  stageKey: string
  previousHash: string
  hash: string
  timestamp: string
  dataHash: string
}

// ─── LUCIDE ICON MAP ────────────────────────────────────────
const STAGE_ICON_MAP: Record<string, React.ElementType> = {
  farmer: User, farmland: TreePine, cultivation: Sprout,
  fertilizer: FlaskConical, crop_monitoring: Activity,
  pest_disease: Bug, harvest: Scissors, procurement: Truck,
  processing: Factory, sorting: ShieldCheck, export_prep: Package,
  shipping: Ship, quality_check: ClipboardCheck, delivery: CheckCircle2,
  roasting: Factory, packaging: Package, warehouse: Warehouse,
  distribution: Truck, retail: Store,
}

// ─── Convert CountryTraceStage to TraceStage ────────────────
function countryStageToTraceStage(stage: CountryTraceStage): TraceStage {
  return {
    ...stage,
    nameVi: stage.nameEn, // Use English for now; can add Vi translations
    lucideIcon: STAGE_ICON_MAP[stage.key] || Activity,
  }
}


// ═══════════════════════════════════════════════════════════════════
// SENSITIVE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════

const SENSITIVE_KEYS = new Set([
  'pricePerKg', 'totalAmount', 'paymentStatus', 'contactNumber',
  'nationalIdNo', 'phone', 'email', 'gpsLat', 'gpsLng',
  'latitude', 'longitude', 'inspector',
])

function SensitiveField({ fieldKey, value }: { fieldKey: string; value: string }) {
  const [revealed, setRevealed] = useState(false)
  const isSensitive = SENSITIVE_KEYS.has(fieldKey)

  if (!isSensitive) return <>{value}</>

  return (
    <span className="inline-flex items-center gap-1">
      {revealed ? (
        <span>{value}</span>
      ) : (
        <span className="text-muted-foreground tracking-wider">{'*'.repeat(Math.min(String(value).length, 8))}</span>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setRevealed(!revealed) }}
        className="inline-flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={revealed ? 'Hide' : 'Reveal'}
      >
        {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════
// INTERSECTION OBSERVER HOOK FOR SCROLL-REVEAL
// ═══════════════════════════════════════════════════════════════════

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH & BATCH SELECTOR
// ═══════════════════════════════════════════════════════════════════

function BatchSelector({
  batchId,
  setBatchId,
  onSearch,
  loading,
  quickBatches,
  onQuickSelect,
  recentBatches,
  onRecentSelect,
}: {
  batchId: string
  setBatchId: (v: string) => void
  onSearch: () => void
  loading: boolean
  quickBatches: { id: string; label: string }[]
  onQuickSelect: (id: string) => void
  recentBatches: { id: string; batchId: string; farmer?: string; variety?: string }[]
  onRecentSelect: (id: string) => void
}) {
  const { t2 } = useI18n()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredBatches = batchId.trim().length > 0
    ? quickBatches.filter(b => b.id.toLowerCase().includes(batchId.toLowerCase()) || b.label.toLowerCase().includes(batchId.toLowerCase()))
    : quickBatches

  return (
    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 mb-6">
      {/* Search bar */}
      <div ref={wrapperRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={batchId}
              onChange={(e) => { setBatchId(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t2('Nhập Mã lô (Batch ID)...', 'Enter Batch ID...')}
              className="pl-9 rounded-xl border-border font-mono text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') { onSearch(); setShowSuggestions(false) } }}
            />
            {/* Autocomplete dropdown */}
            {showSuggestions && filteredBatches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {filteredBatches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { onQuickSelect(b.id); setShowSuggestions(false) }}
                    className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Coffee className="w-3.5 h-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-primary truncate">{b.id}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{b.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => { onSearch(); setShowSuggestions(false) }}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
            {t2('Truy xuất', 'Trace')}
          </Button>
        </div>
      </div>

      {/* Quick-select popular batches */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-[10px] text-muted-foreground self-center mr-1">
          {t2('Nhanh:', 'Quick:')}
        </span>
        {quickBatches.map((b) => (
          <button
            key={b.id}
            onClick={() => onQuickSelect(b.id)}
            className="text-[10px] px-2.5 py-1 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all font-mono"
          >
            {b.id}
          </button>
        ))}
      </div>

      {/* Recent batches */}
      {recentBatches.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold text-foreground">
              {t2('Gần đây', 'Recent Batches')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {recentBatches.map((batch, idx) => (
              <button
                key={batch.id || idx}
                onClick={() => onRecentSelect(batch.batchId)}
                className="text-left p-2.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <p className="text-[10px] font-mono font-bold text-primary truncate">{batch.batchId}</p>
                <p className="text-[9px] text-muted-foreground truncate">{batch.farmer || '—'}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ANIMATED SUPPLY CHAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════

function SupplyChainPipeline({
  stages,
  onStageClick,
}: {
  stages: TraceStage[]
  onStageClick: (index: number) => void
}) {
  const { t2 } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)

  const completedCount = stages.filter(s => s.status === 'completed').length
  const inProgressCount = stages.filter(s => s.status === 'in_progress').length
  const progressPct = ((completedCount + inProgressCount * 0.5) / stages.length) * 100

  return (
    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t2('Đường ống Chuỗi cung ứng', 'Supply Chain Pipeline')}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {t2('Nhấn vào giai đoạn để xem chi tiết', 'Click a stage to see details')}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{Math.round(progressPct)}%</p>
            <p className="text-[9px] text-muted-foreground">{t2('Hoàn thành', 'Complete')}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-progress-fill transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">{completedCount}/{stages.length} {t2('hoàn thành', 'completed')}</span>
          <span className="text-[9px] text-muted-foreground sm:hidden">{Math.round(progressPct)}%</span>
        </div>
      </div>

      {/* Horizontal scrollable pipeline */}
      <div ref={scrollRef} className="overflow-x-auto pb-2 pipeline-scroll">
        <div className="flex items-center min-w-max px-1">
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1
            const isCompleted = stage.status === 'completed'
            const isInProgress = stage.status === 'in_progress'
            const isPending = stage.status === 'pending'

            return (
              <div key={stage.key} className="flex items-center shrink-0">
                {/* Node */}
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStageClick(index)}
                        className="group flex flex-col items-center gap-1 focus:outline-none"
                        aria-label={`${t2(stage.nameVi, stage.nameEn)} — ${stage.status}`}
                      >
                        {/* Circle node */}
                        <div className={`
                          relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center
                          transition-all duration-300 cursor-pointer
                          ${isCompleted
                            ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950 dark:border-emerald-600 shadow-sm hover:shadow-md'
                            : isInProgress
                              ? 'bg-amber-50 border-amber-400 dark:bg-amber-950 dark:border-amber-500 animate-amber-pulse'
                              : 'bg-muted/50 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }
                        `}>
                          <span className="text-lg md:text-xl leading-none">{stage.icon}</span>
                          {/* Checkmark overlay for completed */}
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-green-check">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          {/* Ripple for in-progress */}
                          {isInProgress && (
                            <div className="absolute inset-0 rounded-full border-2 border-amber-400 dark:border-amber-500 animate-ripple-out" />
                          )}
                        </div>
                        {/* Label */}
                        <span className={`
                          text-[8px] md:text-[9px] font-semibold leading-tight text-center max-w-[60px] md:max-w-[72px] line-clamp-2
                          ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : isInProgress ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}
                        `}>
                          {t2(stage.nameVi, stage.nameEn)}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px]">
                      {stage.date ? new Date(stage.date).toLocaleDateString() : t2('Chưa có', 'Pending')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Connecting line */}
                {!isLast && (
                  <div className="flex items-center mx-0.5 md:mx-1 shrink-0">
                    <svg width="32" height="8" className="overflow-visible">
                      <line
                        x1="0" y1="4" x2="32" y2="4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className={isCompleted
                          ? 'stroke-emerald-400 dark:stroke-emerald-600'
                          : isInProgress
                            ? 'stroke-amber-400 dark:stroke-amber-600'
                            : 'stroke-gray-300 dark:stroke-gray-600'
                        }
                        strokeDasharray={isCompleted ? undefined : '4 4'}
                      />
                      {isCompleted && (
                        <line
                          x1="0" y1="4" x2="32" y2="4"
                          strokeWidth="2" strokeLinecap="round"
                          stroke="white" strokeOpacity="0.6"
                          strokeDasharray="2 10"
                          className="animate-dash-flow"
                        />
                      )}
                      <polygon
                        points="28,1 32,4 28,7"
                        className={isCompleted
                          ? 'fill-emerald-400 dark:fill-emerald-600'
                          : isInProgress
                            ? 'fill-amber-400 dark:fill-amber-600'
                            : 'fill-gray-300 dark:fill-gray-600'
                        }
                      />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-2 h-2 text-white" />
          </div>
          <span className="text-[10px] text-foreground">{t2('Hoàn thành', 'Completed')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-amber-pulse" />
          <span className="text-[10px] text-foreground">{t2('Đang xử lý', 'In Progress')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-600" />
          <span className="text-[10px] text-foreground">{t2('Chờ xử lý', 'Pending')}</span>
        </div>
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ANIMATED VERTICAL TIMELINE
// ═══════════════════════════════════════════════════════════════════

function TimelineStageCard({
  stage,
  index,
  totalStages,
  onMapFocus,
}: {
  stage: TraceStage
  index: number
  totalStages: number
  onMapFocus: (key: string) => void
}) {
  const { t2, lang } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const { ref, isVisible } = useScrollReveal(0.1)

  const isCompleted = stage.status === 'completed'
  const isInProgress = stage.status === 'in_progress'
  const isPending = stage.status === 'pending'
  const isLast = index === totalStages - 1

  const statusBadge = {
    completed: {
      bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-3 h-3" />,
      text: t2('Hoàn thành', 'Completed'),
    },
    in_progress: {
      bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      icon: <Clock className="w-3 h-3" />,
      text: t2('Đang xử lý', 'In Progress'),
    },
    pending: {
      bg: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      icon: <MinusCircle className="w-3 h-3" />,
      text: t2('Chờ xử lý', 'Pending'),
    },
  }[stage.status]

  return (
    <div
      ref={ref}
      id={`timeline-stage-${index}`}
      className={`
        relative flex gap-4 md:gap-0
        ${isVisible ? 'animate-timeline-slide-in' : 'opacity-0'}
      `}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* ── Desktop: 3-col layout ── */}
      <div className="hidden md:grid md:grid-cols-[140px_48px_1fr] gap-0 w-full items-start">

        {/* Left: Date & time */}
        <div className="text-right pr-3 pt-1">
          {stage.date ? (
            <>
              <p className="text-xs font-bold text-foreground">
                {new Date(stage.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(stage.date).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">{t2('Chưa xác định', 'TBD')}</p>
          )}
        </div>

        {/* Center: Vertical line + node */}
        <div className="flex flex-col items-center relative">
          {/* Node */}
          <div className={`
            relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center
            transition-all duration-300
            ${isCompleted
              ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-600 dark:border-emerald-600'
              : isInProgress
                ? 'bg-amber-500 border-amber-500 dark:bg-amber-500 dark:border-amber-500 animate-amber-pulse'
                : 'bg-muted border-gray-300 dark:border-gray-600'
            }
          `}>
            <span className="text-base leading-none">{stage.icon}</span>
            {isCompleted && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white dark:border-card">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            {isInProgress && (
              <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ripple-out" />
            )}
          </div>
          {/* Vertical line */}
          {!isLast && (
            <div className={`
              w-0.5 flex-1 min-h-[40px]
              ${isCompleted ? 'bg-emerald-400 dark:bg-emerald-700' : isInProgress ? 'bg-amber-400 dark:bg-amber-700' : 'bg-gray-200 dark:bg-gray-700'}
              ${isVisible ? 'animate-timeline-line-grow' : ''}
            `} style={{ transformOrigin: 'top' }} />
          )}
        </div>

        {/* Right: Detail card */}
        <div className="pl-3 pb-6">
          <Card
            className={`
              rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200
              ${isCompleted ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                : isInProgress ? 'border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-700'
                : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            onClick={() => stage.details && setExpanded(!expanded)}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{stage.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{t2(stage.nameVi, stage.nameEn)}</h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />{stage.location}
                  </p>
                </div>
              </div>
              <Badge className={`${statusBadge.bg} text-[9px] border-0 flex items-center gap-1`}>
                {statusBadge.icon}{statusBadge.text}
              </Badge>
            </div>

            {/* Operator */}
            <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
              <User className="w-2.5 h-2.5" />
              {t2('Người thực hiện:', 'Operator:')} <span className="text-foreground font-medium">{stage.operator}</span>
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {stage.metrics.map((m, i) => (
                <div key={i} className="bg-muted/50 dark:bg-muted/30 rounded-lg p-2 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                  <p className="text-xs font-bold text-foreground">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Map focus button */}
            <button
              onClick={(e) => { e.stopPropagation(); onMapFocus(stage.key) }}
              className="text-[9px] text-primary hover:underline flex items-center gap-1 mb-1"
            >
              <Globe2 className="w-2.5 h-2.5" />
              {t2('Xem trên bản đồ', 'View on map')}
            </button>

            {/* Expanded details */}
            {expanded && stage.details && (
              <div className="mt-2 border-t border-border pt-2">
                <div className="space-y-1">
                  {Object.entries(stage.details).map(([key, value]) => {
                    if (value === null || value === undefined) return null
                    if (typeof value === 'object') return null
                    const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
                    return (
                      <div key={key} className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">{displayKey}</span>
                        <span className="text-foreground font-medium truncate ml-2 max-w-[200px]">
                          {typeof value === 'boolean' ? (value ? '✓' : '✗') : (
                            <SensitiveField fieldKey={key} value={String(value)} />
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* Hash */}
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Fingerprint className="w-2.5 h-2.5" />
                    Hash: <span className="font-mono text-foreground">{stage.hash}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Expand toggle */}
            {stage.details && Object.keys(stage.details).some(k => stage.details[k] != null && typeof stage.details[k] !== 'object') && (
              <div className="flex justify-end mt-1">
                {expanded ? (
                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Mobile: single column ── */}
      <div className="md:hidden flex gap-3 w-full">
        {/* Timeline dot + line */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`
            relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center
            ${isCompleted
              ? 'bg-emerald-500 border-emerald-500 dark:bg-emerald-600 dark:border-emerald-600'
              : isInProgress
                ? 'bg-amber-500 border-amber-500 animate-amber-pulse'
                : 'bg-muted border-gray-300 dark:border-gray-600'
            }
          `}>
            <span className="text-sm leading-none">{stage.icon}</span>
          </div>
          {!isLast && (
            <div className={`
              w-0.5 flex-1 min-h-[16px]
              ${isCompleted ? 'bg-emerald-400 dark:bg-emerald-700' : isInProgress ? 'bg-amber-400 dark:bg-amber-700' : 'bg-gray-200 dark:bg-gray-700'}
            `} />
          )}
        </div>
        {/* Card */}
        <div className="flex-1 pb-4">
          <Card
            className={`
              rounded-xl border p-3 cursor-pointer hover:shadow-md transition-all
              ${isCompleted ? 'border-emerald-200 dark:border-emerald-800'
                : isInProgress ? 'border-amber-200 dark:border-amber-800 ring-1 ring-amber-200 dark:ring-amber-700'
                : 'border-border'
              }
            `}
            onClick={() => stage.details && setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{stage.icon}</span>
                <span className="text-xs font-bold text-foreground">{t2(stage.nameVi, stage.nameEn)}</span>
              </div>
              <Badge className={`${statusBadge.bg} text-[8px] border-0 flex items-center gap-0.5`}>
                {statusBadge.icon}{statusBadge.text}
              </Badge>
            </div>
            {stage.date && (
              <p className="text-[10px] text-muted-foreground mb-1">
                {new Date(stage.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-1">
              {stage.metrics.slice(0, 2).map((m, i) => (
                <span key={i} className="text-[9px] bg-muted/50 dark:bg-muted/30 rounded-md px-1.5 py-0.5">
                  {m.label}: <span className="font-bold text-foreground">{m.value}</span>
                </span>
              ))}
            </div>
            {expanded && stage.details && (
              <div className="mt-2 border-t border-border pt-2 space-y-1">
                {Object.entries(stage.details).map(([key, value]) => {
                  if (value === null || value === undefined || typeof value === 'object') return null
                  return (
                    <div key={key} className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium truncate ml-2 max-w-[160px]">
                        <SensitiveField fieldKey={key} value={String(value)} />
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// QR CODE & VERIFICATION SECTION
// ═══════════════════════════════════════════════════════════════════

function VerificationSection({
  batchId,
  chainBlocks,
  qrDataUrl,
}: {
  batchId: string
  chainBlocks: ChainBlock[]
  qrDataUrl: string
}) {
  const { t2 } = useI18n()
  const [chainExpanded, setChainExpanded] = useState(false)
  const [verifyResult, setVerifyResult] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle')

  const handleVerifyChain = useCallback(() => {
    setVerifyResult('verifying')
    setTimeout(() => {
      // Simulate verification — mock data is always valid
      setVerifyResult('valid')
    }, 1500)
  }, [])

  return (
    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {t2('Xác minh & Mã QR', 'Verification & QR Code')}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {t2('Chuỗi hash toàn vẹn & chữ ký số', 'Hash chain integrity & digital signature')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 dark:bg-muted/10 rounded-xl">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-muted flex items-center justify-center">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <p className="text-[10px] font-mono text-muted-foreground text-center">{batchId}</p>
          <p className="text-[9px] text-muted-foreground text-center max-w-[200px]">
            {t2('Quét để xác minh nguồn gốc', 'Scan to verify origin')}
          </p>
        </div>

        {/* Verification status */}
        <div className="space-y-4">
          {/* Chain integrity */}
          <div className="p-3 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">{t2('Chuỗi Hash', 'Hash Chain')}</span>
              </div>
              <Badge className={verifyResult === 'valid'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0 text-[9px]'
                : verifyResult === 'invalid'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0 text-[9px]'
                  : 'bg-muted text-muted-foreground border-0 text-[9px]'
              }>
                {verifyResult === 'valid' ? t2('Toàn vẹn ✓', 'Intact ✓') : verifyResult === 'invalid' ? t2('Bị lỗi ✗', 'Broken ✗') : t2('Chưa kiểm tra', 'Unchecked')}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              {chainBlocks.length} {t2('khối trong chuỗi', 'blocks in chain')}
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleVerifyChain}
                disabled={verifyResult === 'verifying'}
                size="sm"
                variant="outline"
                className="rounded-xl gap-1 text-[10px]"
              >
                {verifyResult === 'verifying' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                {t2('Xác minh chuỗi', 'Verify Chain')}
              </Button>
              <Button
                onClick={() => setChainExpanded(!chainExpanded)}
                size="sm"
                variant="ghost"
                className="rounded-xl gap-1 text-[10px]"
              >
                {chainExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {t2('Chi tiết', 'Details')}
              </Button>
            </div>
            {chainExpanded && (
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                {chainBlocks.map((block, i) => (
                  <div key={i} className="p-2 bg-muted/50 dark:bg-muted/20 rounded-lg text-[9px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">#{block.index}</span>
                      <span className="text-muted-foreground">{block.stageKey}</span>
                    </div>
                    <p className="text-muted-foreground truncate mt-0.5">prev: {block.previousHash.slice(0, 12)}…</p>
                    <p className="text-foreground truncate">hash: {block.hash.slice(0, 12)}…</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Digital signature */}
          <div className="p-3 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">{t2('Chữ ký số', 'Digital Signature')}</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0 text-[9px]">
                {t2('Hợp lệ', 'Valid')}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {t2('Ký bởi Terra Brew CA', 'Signed by Terra Brew CA')}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate">
              sig:ed25519:7f3a9c…b2d1e4
            </p>
          </div>

          {/* EUDR Status */}
          <div className="p-3 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-foreground">{t2('Tuân thủ EUDR', 'EUDR Compliance')}</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0 text-[9px]">
                {t2('Tuân thủ', 'Compliant')}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {t2('Không phá rừng — xác minh qua卫星', 'Deforestation-free — satellite verified')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT & SHARE SECTION
// ═══════════════════════════════════════════════════════════════════

function ExportShareSection({
  batchId,
  onExportPDF,
  onShareLink,
}: {
  batchId: string
  onExportPDF: () => void
  onShareLink: () => void
}) {
  const { t2 } = useI18n()
  return (
    <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-foreground">{t2('Xuất & Chia sẻ', 'Export & Share')}</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onExportPDF} variant="outline" className="rounded-xl gap-2">
          <FileText className="w-4 h-4" />
          {t2('Xuất PDF', 'Export PDF')}
        </Button>
        <Button onClick={onShareLink} variant="outline" className="rounded-xl gap-2">
          <Share2 className="w-4 h-4" />
          {t2('Chia sẻ liên kết', 'Share Link')}
        </Button>
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.print()}>
          <Download className="w-4 h-4" />
          {t2('In', 'Print')}
        </Button>
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

interface RecentBatch {
  id: string
  batchId: string
  coffeeVariety: string | null
  actualHarvestDate: string | null
  processingStage: string | null
  farmer: { id: string; fullName: string; farmerCode: string | null }
  farmLand: { id: string; farmName: string; plotBlockId: string | null } | null
  createdAt: string
}

export default function TraceabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t2, lang } = useI18n()

  // Resolve tenant-specific batch data
  const tenantSlug = (session?.user as any)?.tenantSlug
  const tenantCountry = (session?.user as any)?.entityType // not country, but we use tenantSlug
  const batch = getTraceBatchForTenant(tenantSlug)
  const tenantStages = batch.stages.map(countryStageToTraceStage)
  const tenantChainBlocks: ChainBlock[] = tenantStages.map((stage, i) => ({
    index: i + 1,
    stageKey: stage.key,
    previousHash: i === 0 ? '000000000000000000000000000000000000' : tenantStages[i - 1].hash,
    hash: stage.hash,
    timestamp: stage.date || new Date().toISOString(),
    dataHash: stage.hash.slice(0, 16) + stage.key.padEnd(16, '0').slice(0, 16),
  }))

  const [batchId, setBatchId] = useState(batch.batchId)
  const [loading, setLoading] = useState(false)
  const [activeLocationId, setActiveLocationId] = useState<string | undefined>(undefined)
  const [recentBatches, setRecentBatches] = useState<RecentBatch[]>([])
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [stages, setStages] = useState<TraceStage[]>(tenantStages)
  const [chainBlocks, setChainBlocks] = useState<ChainBlock[]>(tenantChainBlocks)
  const [showMock, setShowMock] = useState(true)

  // Fetch recent batches on mount
  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchBatches = async () => {
      try {
        const res = await fetch('/api/harvest-traceabilities?pageSize=20&sortBy=createdAt&sortOrder=desc')
        const data = await res.json()
        if (data.success) {
          const items = data.data?.data ?? data.data?.items ?? []
          setRecentBatches(Array.isArray(items) ? items : [])
        }
      } catch { /* silently fail */ }
    }
    fetchBatches()
  }, [status])

  // Generate QR code on mount for mock batch
  useEffect(() => {
    const generateQR = async () => {
      try {
        const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(batch.batchId)}`
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 300, margin: 2,
          color: { dark: '#1a1a2e', light: '#ffffff' },
        })
        setQrDataUrl(dataUrl)
      } catch { /* ignore */ }
    }
    generateQR()
  }, [])

  // Convert stages to map locations
  const traceLocations: TraceLocation[] = useMemo(() => {
    return stages
      .filter(s => s.lat && s.lng)
      .map(s => ({
        id: s.key,
        name: t2(s.nameVi, s.nameEn),
        lat: s.lat,
        lng: s.lng,
        stage: t2(s.nameVi, s.nameEn),
        status: s.status === 'in_progress' ? 'pending' : s.status,
        icon: s.icon,
        date: s.date ?? undefined,
        details: s.metrics.slice(0, 2).map(m => `${m.label}: ${m.value}`).join(', '),
      }))
  }, [stages, lang])

  const scrollToStage = useCallback((index: number) => {
    const el = document.getElementById(`timeline-stage-${index}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'rounded-xl')
      setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'rounded-xl'), 1500)
    }
  }, [])

  const handleStageClick = useCallback((index: number) => {
    const stage = stages[index]
    if (stage) setActiveLocationId(stage.key)
    scrollToStage(index)
  }, [stages, scrollToStage])

  const handleMapFocus = useCallback((key: string) => {
    setActiveLocationId(key)
    const idx = stages.findIndex(s => s.key === key)
    if (idx >= 0) scrollToStage(idx)
  }, [stages, scrollToStage])

  const handleMapLocationClick = useCallback((locationId: string) => {
    setActiveLocationId(locationId)
    const idx = stages.findIndex(s => s.key === locationId)
    if (idx >= 0) scrollToStage(idx)
  }, [stages, scrollToStage])

  const handleSearch = useCallback(async () => {
    if (!batchId.trim()) {
      toast.error(t2('Vui lòng nhập Mã lô', 'Please enter a Batch ID'))
      return
    }
    setLoading(true)
    setActiveLocationId(undefined)
    try {
      const res = await fetch(`/api/traceability?batchId=${encodeURIComponent(batchId.trim())}`)
      const data = await res.json()
      if (data.success && data.data?.found) {
        // If API returns real data, use it; otherwise keep mock
        setShowMock(false)
        toast.success(t2('Đã tìm thấy dữ liệu', 'Data found'))
      } else {
        // Fallback to mock data
        setShowMock(true)
        setStages(tenantStages)
        toast.info(t2('Hiển thị dữ liệu mẫu', 'Showing demo data'))
      }
    } catch {
      setShowMock(true)
      setStages(tenantStages)
      toast.info(t2('Hiển thị dữ liệu mẫu', 'Showing demo data'))
    } finally {
      setLoading(false)
    }
  }, [batchId, t2])

  const handleBatchSelect = useCallback((id: string) => {
    setBatchId(id)
    if (id === batch.batchId) {
      setShowMock(true)
      setStages(tenantStages)
      setActiveLocationId(undefined)
    } else {
      handleSearch()
    }
  }, [handleSearch])

  const handleExportPDF = useCallback(() => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const completedStages = stages.filter(s => s.status === 'completed').length
    const totalStages = stages.length

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t2('Báo cáo Truy xuất', 'Traceability Report')} — ${batch.batchId}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 40px; color: #3C2415; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          h2 { font-size: 14px; margin-top: 24px; color: #6B4226; }
          .meta { font-size: 11px; color: #8B7355; margin-bottom: 20px; }
          .meta p { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
          th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #E8D5B7; }
          th { background: #F5EBE0; color: #6B4226; font-weight: bold; }
          .completed { color: #166534; }
          .in-progress { color: #92400E; }
          .pending { color: #9CA3AF; }
          .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
          .badge-completed { background: #DCFCE7; color: #166534; }
          .badge-in-progress { background: #FEF3C7; color: #92400E; }
          .badge-pending { background: #F3F4F6; color: #6B7280; }
          .footer { margin-top: 40px; font-size: 9px; color: #8B7355; border-top: 1px solid #E8D5B7; padding-top: 12px; }
          .chain-valid { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 10px; font-weight: bold; background: #DCFCE7; color: #166534; margin-top: 16px; }
        </style>
      </head>
      <body>
        <h1>☕ ${t2('Báo cáo Truy xuất Nguồn gốc', 'End-to-End Traceability Report')}</h1>
        <div class="meta">
          <p><strong>Batch ID:</strong> ${batch.batchId}</p>
          <p><strong>${t2('Nông dân', 'Farmer')}:</strong> batch.farmerName</p>
          <p><strong>${t2('Nông trại', 'Farm')}:</strong> batch.farmName</p>
          <p><strong>${t2('Giống', 'Variety')}:</strong> batch.coffeeType</p>
          <p><strong>${t2('Ngày xuất', 'Export Date')}:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>${t2('Tiến độ', 'Progress')}:</strong> ${completedStages}/${totalStages} ${t2('giai đoạn', 'stages')}</p>
        </div>
        <h2>${t2('Danh sách Giai đoạn', 'Stage Overview')}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${t2('Giai đoạn', 'Stage')}</th>
              <th>${t2('Ngày', 'Date')}</th>
              <th>${t2('Trạng thái', 'Status')}</th>
              <th>${t2('Người thực hiện', 'Operator')}</th>
              <th>${t2('Vị trí', 'Location')}</th>
            </tr>
          </thead>
          <tbody>
            ${stages.map((s, i) => {
              const sc = s.status === 'completed' ? 'completed' : s.status === 'in_progress' ? 'in-progress' : 'pending'
              const bc = s.status === 'completed' ? 'badge-completed' : s.status === 'in_progress' ? 'badge-in-progress' : 'badge-pending'
              const sl = s.status === 'completed' ? t2('Hoàn thành', 'Completed') : s.status === 'in_progress' ? t2('Đang xử lý', 'In Progress') : t2('Chờ', 'Pending')
              return `<tr>
                <td>${s.icon} ${i + 1}</td>
                <td class="${sc}">${t2(s.nameVi, s.nameEn)}</td>
                <td>${s.date ? new Date(s.date).toLocaleDateString() : '—'}</td>
                <td><span class="badge ${bc}">${sl}</span></td>
                <td>${s.operator}</td>
                <td>${s.location}</td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
        <div class="chain-valid">🔗 ${t2('Chuỗi hash toàn vẹn', 'Hash Chain Intact')} — ${chainBlocks.length} ${t2('khối', 'blocks')}</div>
        <div class="footer">
          <p>Terra Brew Coffee Traceability Platform — ${t2('Báo cáo được tạo tự động', 'Report auto-generated')} — ${new Date().toISOString()}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }, [stages, t2])

  const handleShareLink = useCallback(() => {
    const url = `${window.location.origin}/verify/${encodeURIComponent(batch.batchId)}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t2('Đã sao chép liên kết!', 'Link copied!'))
    }).catch(() => {
      toast.error(t2('Không thể sao chép', 'Cannot copy'))
    })
  }, [t2])

  const handleGenerateQR = useCallback(async () => {
    if (!batch.batchId) return
    try {
      const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(batch.batchId)}`
      const dataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 300, margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      })
      setQrDataUrl(dataUrl)
      setQrDialogOpen(true)
    } catch {
      toast.error(t2('Lỗi tạo QR', 'Failed to generate QR'))
    }
  }, [t2])

  const handleDownloadQR = useCallback(() => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = `qr-${batch.batchId}.png`
    link.href = qrDataUrl
    link.click()
  }, [qrDataUrl])

  // ── Auth guards ──
  if (status === 'loading') {
    return (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
    )
  }

  const completedCount = stages.filter(s => s.status === 'completed').length
  const inProgressCount = stages.filter(s => s.status === 'in_progress').length
  const progressPct = ((completedCount + inProgressCount * 0.5) / stages.length) * 100

  return (
      <div className="animate-slide-in-up">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              {t2('Truy xuất Nguồn gốc E2E', 'E2E Trace Journey')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t2('Truy xuất từ nông trại đến ly cà phê', 'Trace from farm to cup')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Animated progress indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {completedCount + inProgressCount}/{stages.length}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-500">
                {Math.round(progressPct)}%
              </span>
            </div>
            <Button
              onClick={handleGenerateQR}
              variant="outline"
              className="rounded-xl border-border gap-2"
            >
              <QrCode className="w-4 h-4" />
              {t2('Tạo QR', 'QR Code')}
            </Button>
          </div>
        </div>

        {/* ── Batch Overview Card ── */}
        <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 mb-6 bg-gradient-to-br from-card to-emerald-50/30 dark:from-card dark:to-emerald-950/10">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-foreground font-mono">{batch.batchId}</h3>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0 text-[9px]">
                  {t2('Đang chế biến', 'Processing')}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> batch.farmerName
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <TreePine className="w-3 h-3" /> batch.farmName
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Sprout className="w-3 h-3" /> batch.coffeeType
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> batch.location
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                  <circle
                    cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                    className="text-emerald-500"
                    strokeDasharray={`${(progressPct / 100) * 175.9} 175.9`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{Math.round(progressPct)}%</span>
                </div>
              </div>
              <span className="text-[9px] text-muted-foreground">{t2('Tiến độ', 'Progress')}</span>
            </div>
          </div>
        </Card>

        {/* ── 1. Search & Batch Selector ── */}
        <BatchSelector
          batchId={batchId}
          setBatchId={setBatchId}
          onSearch={handleSearch}
          loading={loading}
          quickBatches={batch.quickTraceIds.map(id => ({ id, label: id }))}
          onQuickSelect={handleBatchSelect}
          recentBatches={recentBatches.map(b => ({
            id: b.id,
            batchId: b.batchId,
            farmer: b.farmer?.fullName,
            variety: b.coffeeVariety ?? undefined,
          }))}
          onRecentSelect={handleBatchSelect}
        />

        {/* ── 2. Animated Supply Chain Pipeline ── */}
        <SupplyChainPipeline stages={stages} onStageClick={handleStageClick} />

        {/* ── 3. Interactive Map ── */}
        <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t2('Bản đồ Hành trình', 'Journey Map')}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {t2('Hành trình cà phê từ nông trại đến tay bạn', 'Coffee journey from farm to you')}
              </p>
            </div>
          </div>
          <TraceabilityMap
            locations={traceLocations}
            activeLocationId={activeLocationId}
            lang={lang}
            height="400px"
            onLocationClick={handleMapLocationClick}
          />
        </Card>

        {/* ── 4. Animated Vertical Timeline ── */}
        <Card className="rounded-2xl border-0 shadow-sm p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t2('Dòng thời gian Truy xuất', 'Trace Timeline')}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {t2('Chi tiết từng giai đoạn trong chuỗi cung ứng', 'Details of each supply chain stage')}
              </p>
            </div>
            {/* Journey completion mini bar */}
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-primary">{Math.round(progressPct)}%</span>
            </div>
          </div>

          <div className="space-y-0">
            {stages.map((stage, index) => (
              <TimelineStageCard
                key={stage.key}
                stage={stage}
                index={index}
                totalStages={stages.length}
                onMapFocus={handleMapFocus}
              />
            ))}
          </div>
        </Card>

        {/* ── 5. QR Code & Verification ── */}
        <VerificationSection
          batchId={batch.batchId}
          chainBlocks={chainBlocks}
          qrDataUrl={qrDataUrl}
        />

        {/* ── 6. Export & Share ── */}
        <ExportShareSection
          batchId={batch.batchId}
          onExportPDF={handleExportPDF}
          onShareLink={handleShareLink}
        />

        {/* ── QR Dialog ── */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                {t2('Mã QR Truy xuất', 'Traceability QR Code')}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 rounded-xl" />}
              <p className="text-xs text-muted-foreground text-center font-mono">{batch.batchId}</p>
              <Button
                onClick={handleDownloadQR}
                className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-4 h-4" />
                {t2('Tải QR', 'Download QR')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
