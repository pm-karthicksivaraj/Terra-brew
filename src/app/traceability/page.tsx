'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coffee, GitBranch, Search, Loader2, CheckCircle2, Clock,
  MinusCircle, Shield, ChevronDown, ChevronUp, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

// ─── Types ────────────────────────────────────────────────────────

interface StageData {
  name?: string
  code?: string
  province?: string
  isCertified?: boolean
  farmName?: string
  area?: number
  altitude?: number
  soilType?: string
  trees?: number
  plotName?: string
  crop?: string
  variety?: string
  method?: string
  species?: string
  germinationRate?: number
  healthStatus?: string
  type?: string
  soilPhBefore?: number
  soilPhAfter?: number
  organicMatter?: number
  growthStage?: string
  healthScore?: number
  alertTriggered?: boolean
  alertType?: string
  isOrganic?: boolean
  quantity?: number
  pestOrDisease?: string
  severity?: string
  treatment?: string
  outcome?: string
  batchId?: string
  cupScore?: number
  moisture?: number
  processingStage?: string
  netWeight?: number
  pricePerKg?: number
  totalAmount?: number
  paymentStatus?: string
  collectionCentre?: string
  inputWeight?: number
  outputWeight?: number
  outturn?: number
  stages?: number
  standard?: string
  status?: string
  score?: number
  certBody?: string
  validUntil?: string | Date | null
  inspector?: string
  grade?: string
  passFail?: string
  title?: string
  coffeeType?: string
  [key: string]: unknown
}

interface TraceStage {
  key: string
  icon: string
  nameVi: string
  nameEn: string
  status: 'completed' | 'pending' | 'not_available'
  date: string | null
  data: StageData | null
}

interface ChainVerification {
  valid: boolean
  totalBlocks: number
  brokenAt?: number
  message: string
}

interface TraceabilityData {
  batchId: string
  found: boolean
  farmerName?: string
  farmName?: string
  coffeeVariety?: string
  stages: TraceStage[]
  hashChainBlocks: unknown[]
  chainVerification: ChainVerification | null
  message?: string
}

// ─── Stage detail component ───────────────────────────────────────

function StageDetail({ data }: { data: StageData }) {
  return (
    <div className="mt-2 space-y-1">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined) return null
        if (typeof value === 'object') return null
        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
        return (
          <div key={key} className="flex justify-between text-[11px]">
            <span className="text-coffee-500">{displayKey}</span>
            <span className="text-coffee-800 font-medium truncate ml-2 max-w-[180px]">
              {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Timeline Stage Card ──────────────────────────────────────────

function TimelineCard({
  stage,
  index,
  isLeft,
  lang,
}: {
  stage: TraceStage
  index: number
  isLeft: boolean
  lang: 'vi' | 'en'
}) {
  const [expanded, setExpanded] = useState(false)
  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const statusConfig = {
    completed: {
      dotColor: 'bg-coffee-700',
      lineColor: 'bg-coffee-700',
      borderColor: 'border-coffee-300',
      badgeBg: 'bg-green-100 text-green-700',
      badgeIcon: <CheckCircle2 className="w-3 h-3" />,
      badgeText: t('Hoàn thành', 'Completed'),
    },
    pending: {
      dotColor: 'bg-coffee-300',
      lineColor: 'bg-coffee-200',
      borderColor: 'border-coffee-200',
      badgeBg: 'bg-yellow-100 text-yellow-700',
      badgeIcon: <Clock className="w-3 h-3" />,
      badgeText: t('Đang chờ', 'Pending'),
    },
    not_available: {
      dotColor: 'bg-gray-300',
      lineColor: 'bg-gray-200',
      borderColor: 'border-gray-200',
      badgeBg: 'bg-gray-100 text-gray-500',
      badgeIcon: <MinusCircle className="w-3 h-3" />,
      badgeText: t('Không có', 'N/A'),
    },
  }

  const config = statusConfig[stage.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className="relative flex items-start gap-4 md:gap-0"
    >
      {/* Desktop: alternating layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_48px_1fr] gap-0 w-full items-start">
        {/* Left side */}
        <div className={`flex ${isLeft ? 'justify-end' : 'justify-start'}`}>
          {isLeft ? (
            <div className="w-full max-w-sm pr-4">
              <Card
                className={`rounded-xl border ${config.borderColor} p-3 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => stage.data && setExpanded(!expanded)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stage.icon}</span>
                    <span className="text-xs font-bold text-coffee-800">
                      {t(stage.nameVi, stage.nameEn)}
                    </span>
                  </div>
                  <Badge className={`${config.badgeBg} text-[9px] border-0 flex items-center gap-1`}>
                    {config.badgeIcon}
                    {config.badgeText}
                  </Badge>
                </div>
                {stage.date && (
                  <p className="text-[10px] text-coffee-400 mb-1">
                    {new Date(stage.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                  </p>
                )}
                {stage.data && (
                  <div className="text-[11px] text-coffee-600">
                    {stage.data.name && <span>{stage.data.name}</span>}
                    {stage.data.batchId && <span className="font-mono">{stage.data.batchId}</span>}
                    {stage.data.farmName && <span>{stage.data.farmName}</span>}
                    {stage.data.cupScore != null && (
                      <span className="ml-2 text-coffee-700 font-medium">☕ {stage.data.cupScore}</span>
                    )}
                    {!stage.data.name && !stage.data.batchId && !stage.data.farmName && stage.data.crop && (
                      <span>{stage.data.crop}</span>
                    )}
                  </div>
                )}
                <AnimatePresence>
                  {expanded && stage.data && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-coffee-100 mt-2 pt-2">
                        <StageDetail data={stage.data} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {stage.data && (
                  <div className="flex justify-end mt-1">
                    {expanded ? (
                      <ChevronUp className="w-3 h-3 text-coffee-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-coffee-400" />
                    )}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="w-full max-w-sm" />
          )}
        </div>

        {/* Center timeline dot */}
        <div className="flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full ${config.dotColor} ring-4 ring-white z-10 shrink-0`} />
          {index < 13 && <div className={`w-0.5 h-20 ${config.lineColor}`} />}
        </div>

        {/* Right side */}
        <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
          {!isLeft ? (
            <div className="w-full max-w-sm pl-4">
              <Card
                className={`rounded-xl border ${config.borderColor} p-3 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => stage.data && setExpanded(!expanded)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stage.icon}</span>
                    <span className="text-xs font-bold text-coffee-800">
                      {t(stage.nameVi, stage.nameEn)}
                    </span>
                  </div>
                  <Badge className={`${config.badgeBg} text-[9px] border-0 flex items-center gap-1`}>
                    {config.badgeIcon}
                    {config.badgeText}
                  </Badge>
                </div>
                {stage.date && (
                  <p className="text-[10px] text-coffee-400 mb-1">
                    {new Date(stage.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                  </p>
                )}
                {stage.data && (
                  <div className="text-[11px] text-coffee-600">
                    {stage.data.name && <span>{stage.data.name}</span>}
                    {stage.data.batchId && <span className="font-mono">{stage.data.batchId}</span>}
                    {stage.data.farmName && <span>{stage.data.farmName}</span>}
                    {stage.data.cupScore != null && (
                      <span className="ml-2 text-coffee-700 font-medium">☕ {stage.data.cupScore}</span>
                    )}
                    {!stage.data.name && !stage.data.batchId && !stage.data.farmName && stage.data.crop && (
                      <span>{stage.data.crop}</span>
                    )}
                  </div>
                )}
                <AnimatePresence>
                  {expanded && stage.data && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-coffee-100 mt-2 pt-2">
                        <StageDetail data={stage.data} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {stage.data && (
                  <div className="flex justify-end mt-1">
                    {expanded ? (
                      <ChevronUp className="w-3 h-3 text-coffee-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-coffee-400" />
                    )}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="w-full max-w-sm" />
          )}
        </div>
      </div>

      {/* Mobile: single column layout */}
      <div className="md:hidden flex gap-3 w-full">
        {/* Timeline dot + line */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-3.5 h-3.5 rounded-full ${config.dotColor} ring-3 ring-white z-10`} />
          {index < 13 && <div className={`w-0.5 flex-1 min-h-[16px] ${config.lineColor}`} />}
        </div>
        {/* Card */}
        <div className="flex-1 pb-4">
          <Card
            className={`rounded-xl border ${config.borderColor} p-3 cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => stage.data && setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{stage.icon}</span>
                <span className="text-xs font-bold text-coffee-800">
                  {t(stage.nameVi, stage.nameEn)}
                </span>
              </div>
              <Badge className={`${config.badgeBg} text-[9px] border-0 flex items-center gap-1`}>
                {config.badgeIcon}
                {config.badgeText}
              </Badge>
            </div>
            {stage.date && (
              <p className="text-[10px] text-coffee-400 mb-1">
                {new Date(stage.date).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
              </p>
            )}
            {stage.data && (
              <div className="text-[11px] text-coffee-600">
                {stage.data.name && <span>{stage.data.name}</span>}
                {stage.data.batchId && <span className="font-mono">{stage.data.batchId}</span>}
                {stage.data.farmName && <span>{stage.data.farmName}</span>}
                {stage.data.cupScore != null && (
                  <span className="ml-2 text-coffee-700 font-medium">☕ {stage.data.cupScore}</span>
                )}
                {!stage.data.name && !stage.data.batchId && !stage.data.farmName && stage.data.crop && (
                  <span>{stage.data.crop}</span>
                )}
              </div>
            )}
            <AnimatePresence>
              {expanded && stage.data && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-coffee-100 mt-2 pt-2">
                    <StageDetail data={stage.data} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {stage.data && (
              <div className="flex justify-end mt-1">
                {expanded ? (
                  <ChevronUp className="w-3 h-3 text-coffee-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-coffee-400" />
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────

export default function TraceabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [batchId, setBatchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [traceData, setTraceData] = useState<TraceabilityData | null>(null)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const handleSearch = useCallback(async () => {
    if (!batchId.trim()) {
      toast.error(t('Vui lòng nhập Mã lô', 'Please enter a Batch ID'))
      return
    }
    setLoading(true)
    setTraceData(null)
    try {
      const res = await fetch(`/api/traceability?batchId=${encodeURIComponent(batchId.trim())}`)
      const data = await res.json()
      if (data.success) {
        setTraceData(data.data)
        if (!data.data.found) {
          toast.warning(t('Không tìm thấy dữ liệu cho mã lô này', 'No data found for this batch ID'))
        }
      } else {
        toast.error(data.error || t('Lỗi khi truy xuất', 'Error fetching traceability'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [batchId, t])

  const handleExportReport = useCallback(() => {
    if (!traceData) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const completedStages = traceData.stages.filter((s) => s.status === 'completed').length
    const totalStages = traceData.stages.length

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('Báo cáo Truy xuất', 'Traceability Report')} - ${traceData.batchId}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 40px; color: #3C2415; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 16px; margin-top: 24px; color: #6B4226; }
          .meta { font-size: 12px; color: #8B7355; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #E8D5B7; font-size: 12px; }
          th { background: #F5EBE0; color: #6B4226; font-weight: bold; }
          .completed { color: #166534; }
          .pending { color: #92400E; }
          .na { color: #9CA3AF; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .badge-completed { background: #DCFCE7; color: #166534; }
          .badge-pending { background: #FEF3C7; color: #92400E; }
          .badge-na { background: #F3F4F6; color: #6B7280; }
          .footer { margin-top: 40px; font-size: 10px; color: #8B7355; border-top: 1px solid #E8D5B7; padding-top: 12px; }
          .chain-badge { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; margin-top: 16px; }
          .chain-valid { background: #DCFCE7; color: #166534; }
          .chain-invalid { background: #FEE2E2; color: #991B1B; }
        </style>
      </head>
      <body>
        <h1>☕ ${t('Báo cáo Truy xuất Nguồn gốc', 'End-to-End Traceability Report')}</h1>
        <div class="meta">
          <p><strong>Batch ID:</strong> ${traceData.batchId}</p>
          <p><strong>${t('Nông dân', 'Farmer')}:</strong> ${traceData.farmerName || 'N/A'}</p>
          <p><strong>${t('Nông trại', 'Farm')}:</strong> ${traceData.farmName || 'N/A'}</p>
          <p><strong>${t('Giống cà phê', 'Coffee Variety')}:</strong> ${traceData.coffeeVariety || 'N/A'}</p>
          <p><strong>${t('Ngày xuất', 'Export Date')}:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>${t('Tiến độ', 'Progress')}:</strong> ${completedStages}/${totalStages} ${t('giai đoạn', 'stages completed')}</p>
        </div>

        <h2>${t('Danh sách Giai đoạn', 'Stage Overview')}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>${t('Giai đoạn', 'Stage')}</th>
              <th>${t('Ngày', 'Date')}</th>
              <th>${t('Trạng thái', 'Status')}</th>
              <th>${t('Chi tiết chính', 'Key Details')}</th>
            </tr>
          </thead>
          <tbody>
            ${traceData.stages.map((s, i) => {
              const statusClass = s.status === 'completed' ? 'completed' : s.status === 'pending' ? 'pending' : 'na'
              const badgeClass = s.status === 'completed' ? 'badge-completed' : s.status === 'pending' ? 'badge-pending' : 'badge-na'
              const statusLabel = s.status === 'completed' ? t('Hoàn thành', 'Completed') : s.status === 'pending' ? t('Đang chờ', 'Pending') : t('Không có', 'N/A')
              const keyDetails = s.data ? Object.entries(s.data).filter(([, v]) => v != null && typeof v !== 'object').slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ') : '-'
              return `<tr>
                <td>${s.icon} ${i + 1}</td>
                <td class="${statusClass}">${t(s.nameVi, s.nameEn)}</td>
                <td>${s.date ? new Date(s.date).toLocaleDateString() : '-'}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                <td>${keyDetails}</td>
              </tr>`
            }).join('')}
          </tbody>
        </table>

        ${traceData.chainVerification ? `
          <div>
            <span class="chain-badge ${traceData.chainVerification.valid ? 'chain-valid' : 'chain-invalid'}">
              🔗 ${traceData.chainVerification.valid ? t('Chuỗi hash toàn vẹn', 'Hash Chain Intact') : t('Chuỗi hash bị đứt', 'Hash Chain Broken')}
              — ${traceData.chainVerification.totalBlocks} ${t('khối', 'blocks')}
            </span>
          </div>
        ` : ''}

        <div class="footer">
          <p>Terra Brew Coffee Traceability Platform — ${t('Báo cáo được tạo tự động', 'Report auto-generated')} — ${new Date().toISOString()}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }, [traceData, t])

  if (status === 'loading') {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-coffee-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const completedStages = traceData?.stages.filter((s) => s.status === 'completed').length || 0
  const totalStages = traceData?.stages.length || 14

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-coffee-600" />
              {t('Truy xuất Nguồn gốc E2E', 'E2E Traceability Timeline')}
            </h2>
            <p className="text-sm text-coffee-500">
              {t('Truy xuất từ nông trại đến ly cà phê', 'Trace from farm to cup')}
            </p>
          </div>
          {traceData?.found && (
            <Button
              onClick={handleExportReport}
              variant="outline"
              className="rounded-xl border-coffee-300 text-coffee-700 hover:bg-coffee-50 gap-2"
            >
              <FileText className="w-4 h-4" />
              {t('Xuất báo cáo', 'Export Report')}
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <Card className="rounded-2xl border-0 shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <Input
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder={t('Nhập Mã lô (Batch ID)...', 'Enter Batch ID...')}
                className="pl-9 rounded-xl border-coffee-200 focus:border-coffee-500 font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white rounded-xl gap-2 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitBranch className="w-4 h-4" />
              )}
              {t('Truy xuất', 'Trace')}
            </Button>
          </div>
        </Card>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="flex items-center gap-2 text-coffee-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('Đang truy xuất...', 'Tracing...')}</span>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && traceData && !traceData.found && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="rounded-2xl border-0 shadow-sm p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-coffee-100 flex items-center justify-center">
                    <GitBranch className="w-7 h-7 text-coffee-400" />
                  </div>
                  <p className="text-sm font-medium text-coffee-700">
                    {t('Không tìm thấy dữ liệu', 'No traceability data found')}
                  </p>
                  <p className="text-xs text-coffee-400">
                    {t('Vui lòng kiểm tra lại Mã lô và thử lại', 'Please check the Batch ID and try again')}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {!loading && traceData && traceData.found && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Summary Card */}
              <Card className="rounded-2xl border-0 shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-coffee-800 font-mono">
                      {t('Lô:', 'Batch:')} {traceData.batchId}
                    </span>
                  </div>
                  {traceData.farmerName && (
                    <Badge variant="outline" className="border-coffee-300 text-coffee-600 text-[10px]">
                      🌱 {traceData.farmerName}
                    </Badge>
                  )}
                  {traceData.farmName && (
                    <Badge variant="outline" className="border-coffee-300 text-coffee-600 text-[10px]">
                      🏞️ {traceData.farmName}
                    </Badge>
                  )}
                  {traceData.coffeeVariety && (
                    <Badge variant="outline" className="border-coffee-300 text-coffee-600 text-[10px]">
                      ☕ {traceData.coffeeVariety}
                    </Badge>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-24 h-2 bg-coffee-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-coffee-500 to-coffee-700"
                        style={{ width: `${(completedStages / totalStages) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-coffee-600">
                      {completedStages}/{totalStages}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <div className="relative">
                {traceData.stages.map((stage, index) => (
                  <TimelineCard
                    key={stage.key}
                    stage={stage}
                    index={index}
                    isLeft={index % 2 === 0}
                    lang={lang}
                  />
                ))}
              </div>

              {/* Hash Chain Integrity Badge */}
              {traceData.chainVerification && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8"
                >
                  <Card className={`rounded-2xl border-0 shadow-sm p-5 ${
                    traceData.chainVerification.valid
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50/50'
                      : 'bg-gradient-to-r from-red-50 to-orange-50/50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        traceData.chainVerification.valid
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        <Shield className={`w-5 h-5 ${
                          traceData.chainVerification.valid ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-coffee-800">
                            {t('Chuỗi Hash Blockchain', 'Blockchain Hash Chain')}
                          </span>
                          <Badge className={`text-[10px] border-0 ${
                            traceData.chainVerification.valid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {traceData.chainVerification.valid
                              ? t('✓ Toàn vẹn', '✓ Intact')
                              : t('✗ Bị đứt', '✗ Broken')
                            }
                          </Badge>
                        </div>
                        <p className="text-[11px] text-coffee-600 mt-0.5">
                          {traceData.chainVerification.message}
                          {' — '}
                          {t(
                            `${traceData.chainVerification.totalBlocks} khối đã ghi`,
                            `${traceData.chainVerification.totalBlocks} blocks recorded`
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {!loading && !traceData && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="rounded-2xl border-0 shadow-sm p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
                    <GitBranch className="w-10 h-10 text-coffee-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-coffee-700 mb-1">
                      {t('Nhập Mã lô để bắt đầu', 'Enter a Batch ID to get started')}
                    </p>
                    <p className="text-xs text-coffee-400 max-w-sm mx-auto">
                      {t(
                        'Nhập mã lô thu hoạch để xem toàn bộ hành trình từ nông trại đến ly cà phê của bạn',
                        'Enter a harvest batch ID to view the complete journey from farm to cup'
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {['🌱', '🏞️', '🌿', '🌳', '🔄', '📊', '🧪', '🛡️', '🌾', '🚛', '⚙️', '📋', '🔍', '🏪'].map((emoji, i) => (
                      <span key={i} className="text-xl opacity-30">{emoji}</span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardShell>
  )
}
