'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Shield, AlertTriangle, CheckCircle2, MapPin, FileCheck,
  TreePine, Link2, Satellite, AlertOctagon, ArrowRight,
  FileWarning, ChevronRight, Zap,
} from 'lucide-react'
import { useI18n } from '@/i18n'

// ─── Types ─────────────────────────────────────────────────────

export interface ComplianceBreakdownItem {
  key: string
  labelVi: string
  labelEn: string
  current: number
  total: number
  icon: React.ComponentType<{ className?: string }>
}

export interface EudrComplianceScoreProps {
  /** Overall score 0-100 */
  score?: number
  /** Breakdown items */
  breakdown?: ComplianceBreakdownItem[]
  /** Number of shipments at risk */
  shipmentsAtRisk?: number
  /** Penalty percentage string */
  penaltyPct?: string
  /** Called when "Generate Missing DDS" clicked */
  onGenerateDDS?: () => void
  /** Called when "Fix GPS Gaps" clicked */
  onFixGPS?: () => void
  /** Called when "View Risk Details" clicked */
  onViewRisk?: () => void
}

// ─── Animated Counter Hook ─────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start = 0
    const steps = duration / 16
    const increment = target / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.round(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return value
}

// ─── Risk Utilities ────────────────────────────────────────────

function getRiskLevel(score: number): 'compliant' | 'medium' | 'high' {
  if (score >= 80) return 'compliant'
  if (score >= 60) return 'medium'
  return 'high'
}

function getRiskColors(score: number) {
  const level = getRiskLevel(score)
  switch (level) {
    case 'compliant':
      return {
        ring: '#16a34a',
        bg: 'bg-green-50 dark:bg-green-950/30',
        text: 'text-green-700 dark:text-green-400',
        badgeBg: 'bg-green-100 dark:bg-green-900/50',
        badgeText: 'text-green-800 dark:text-green-300',
        glow: 'shadow-green-500/20',
        progressBg: 'bg-green-500',
        labelVi: 'ĐẠT CHUẨN',
        labelEn: 'COMPLIANT',
      }
    case 'medium':
      return {
        ring: '#d97706',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-400',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
        badgeText: 'text-amber-800 dark:text-amber-300',
        glow: 'shadow-amber-500/20',
        progressBg: 'bg-amber-500',
        labelVi: 'NGUY CƠ TRUNG BÌNH',
        labelEn: 'MEDIUM RISK',
      }
    case 'high':
      return {
        ring: '#dc2626',
        bg: 'bg-red-50 dark:bg-red-950/30',
        text: 'text-red-700 dark:text-red-400',
        badgeBg: 'bg-red-100 dark:bg-red-900/50',
        badgeText: 'text-red-800 dark:text-red-300',
        glow: 'shadow-red-500/20',
        progressBg: 'bg-red-500',
        labelVi: 'NGUY CƠ CAO',
        labelEn: 'HIGH RISK',
      }
  }
}

function getItemStatus(current: number, total: number) {
  const pct = total > 0 ? (current / total) * 100 : 0
  if (pct >= 90) return 'good'
  if (pct >= 60) return 'warning'
  return 'critical'
}

function getItemColor(status: string) {
  switch (status) {
    case 'good': return { bar: 'bg-green-500', icon: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40' }
    case 'warning': return { bar: 'bg-amber-500', icon: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' }
    default: return { bar: 'bg-red-500', icon: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40' }
  }
}

// ─── Default Breakdown Data ────────────────────────────────────

const DEFAULT_BREAKDOWN: ComplianceBreakdownItem[] = [
  { key: 'gps', labelVi: 'Độ phủ GPS', labelEn: 'GPS Plot Coverage', current: 12, total: 15, icon: MapPin },
  { key: 'farm', labelVi: 'Xác minh nông trại', labelEn: 'Farm Verification', current: 13, total: 20, icon: CheckCircle2 },
  { key: 'dds', labelVi: 'Hoàn thành DDS', labelEn: 'DDS Completion', current: 9, total: 20, icon: FileCheck },
  { key: 'deforest', labelVi: 'Kiểm tra phá rừng', labelEn: 'Deforestation Check', current: 18, total: 20, icon: TreePine },
  { key: 'trace', labelVi: 'Chuỗi truy xuất', labelEn: 'Traceability Chain', current: 11, total: 20, icon: Link2 },
]

// ─── Radial Score SVG ──────────────────────────────────────────

function RadialScoreRing({ score, size = 200, strokeWidth = 14 }: { score: number; size?: number; strokeWidth?: number }) {
  const animatedScore = useAnimatedCounter(score, 1600)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(animatedScore / 100, 1)
  const offset = circumference - progress * circumference
  const colors = getRiskColors(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full ${colors.bg} blur-2xl opacity-40`}
        style={{ width: size, height: size }}
      />

      <svg width={size} height={size} className="relative -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 6px ${colors.ring}40)` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl md:text-6xl font-bold tracking-tight" style={{ color: colors.ring }}>
          {animatedScore}
        </span>
        <span className="text-sm font-medium text-muted-foreground -mt-1">%</span>
      </div>
    </div>
  )
}

// ─── Breakdown Row ─────────────────────────────────────────────

function BreakdownRow({ item, t2 }: { item: ComplianceBreakdownItem; t2: (vi: string, en: string) => string }) {
  const pct = item.total > 0 ? Math.round((item.current / item.total) * 100) : 0
  const status = getItemStatus(item.current, item.total)
  const colors = getItemColor(status)
  const Icon = item.icon

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
          </div>
          <span className="text-xs font-medium text-foreground truncate">
            {t2(item.labelVi, item.labelEn)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold tabular-nums" style={{ color: status === 'good' ? '#16a34a' : status === 'warning' ? '#d97706' : '#dc2626' }}>
            {pct}%
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            ({item.current} / {item.total})
          </span>
          {status === 'good' ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : status === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          ) : (
            <AlertOctagon className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────

export function EudrComplianceScore({
  score = 62,
  breakdown = DEFAULT_BREAKDOWN,
  shipmentsAtRisk = 8,
  penaltyPct = '4%',
  onGenerateDDS,
  onFixGPS,
  onViewRisk,
}: EudrComplianceScoreProps) {
  const { t2 } = useI18n()
  const colors = getRiskColors(score)
  const riskLevel = getRiskLevel(score)

  return (
    <div className="space-y-4">
      {/* ═══ Fear Loop Warning Banner ═══ */}
      {shipmentsAtRisk > 0 && (
        <div className="relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40">
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          <div className="relative flex items-center gap-3 px-4 py-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/60 shrink-0">
              <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                {t2(
                  `${shipmentsAtRisk} lô hàng có nguy cơ bị EU từ chối. Phạt tiền lên tới ${penaltyPct} doanh thu EU.`,
                  `${shipmentsAtRisk} shipments at risk of EU rejection. Potential penalty: up to ${penaltyPct} of EU revenue.`
                )}
              </p>
              <p className="text-[10px] text-red-600/70 dark:text-red-400/60 mt-0.5">
                {t2('Hành động ngay để tránh rủi ro tuân thủ', 'Take action now to avoid compliance risk')}
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="shrink-0 rounded-xl text-xs gap-1.5 h-8"
              onClick={onGenerateDDS}
            >
              <Zap className="w-3.5 h-3.5" />
              {t2('Xử lý ngay', 'Fix Now')}
            </Button>
          </div>
        </div>
      )}

      {/* ═══ Main Score Card ═══ */}
      <Card className="rounded-2xl border border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="pb-2 pt-5 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {t2('Điểm Tuân Thủ EUDR', 'EUDR Compliance Score')}
            </CardTitle>
            <Badge className={`${colors.badgeBg} ${colors.badgeText} border-0 text-[10px] font-bold tracking-wider`}>
              {t2(colors.labelVi, colors.labelEn)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-6">
          {/* Score Ring + Label */}
          <div className="flex flex-col items-center py-4">
            <RadialScoreRing score={score} />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {t2('Điểm tuân thủ tổng thể', 'Overall Compliance Score')}
            </p>
          </div>

          {/* ─── Score Breakdown Panel ─── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t2('Chi tiết điểm', 'Score Breakdown')}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              {breakdown.map((item) => (
                <BreakdownRow key={item.key} item={item} t2={t2} />
              ))}
            </div>
          </div>

          {/* ─── Action Panel ─── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t2('Hành động', 'Actions')}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="destructive"
                className="flex-1 rounded-xl gap-2 text-xs font-bold"
                onClick={onGenerateDDS}
              >
                <FileWarning className="w-4 h-4" />
                {t2('Tạo DDS còn thiếu', 'Generate Missing DDS')}
                <Badge variant="outline" className="ml-1 bg-white/20 border-white/30 text-white text-[9px] h-5 px-1.5">
                  {breakdown.find(b => b.key === 'dds') ? breakdown.find(b => b.key === 'dds')!.total - breakdown.find(b => b.key === 'dds')!.current : 11}
                </Badge>
              </Button>

              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2 text-xs font-bold border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                onClick={onFixGPS}
              >
                <Satellite className="w-4 h-4" />
                {t2('Sửa khoảng trống GPS', 'Fix GPS Gaps')}
                <Badge variant="outline" className="ml-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-[9px] h-5 px-1.5">
                  {breakdown.find(b => b.key === 'gps') ? breakdown.find(b => b.key === 'gps')!.total - breakdown.find(b => b.key === 'gps')!.current : 3}
                </Badge>
              </Button>
            </div>

            <button
              onClick={onViewRisk}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/5"
            >
              {t2('Xem chi tiết rủi ro', 'View Risk Details')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EudrComplianceScore
