'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FileCheck, FileWarning, Clock, AlertTriangle } from 'lucide-react'
import { useI18n } from '@/i18n'

export interface DdsStatusWidgetProps {
  /** Total shipments */
  totalShipments?: number
  /** Shipments with complete DDS */
  completeDds?: number
  /** Plots pending verification */
  pendingPlots?: number
  /** Shipments expiring soon */
  expiringSoon?: number
  /** High risk shipments */
  highRisk?: number
  /** Compact mode for embedding */
  compact?: boolean
  /** Click handler for "Generate DDS" */
  onGenerateDds?: () => void
  /** Click handler for "View Details" */
  onViewDetails?: () => void
}

type TrafficLight = 'green' | 'amber' | 'red'

function getTrafficLight(completeDds: number, totalShipments: number): TrafficLight {
  const pct = totalShipments > 0 ? (completeDds / totalShipments) * 100 : 0
  if (pct >= 90) return 'green'
  if (pct >= 70) return 'amber'
  return 'red'
}

const LIGHT_COLORS: Record<TrafficLight, { bg: string; border: string; icon: string; badge: string; bar: string; glow: string }> = {
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800/50',
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    bar: 'bg-green-500',
    glow: 'shadow-green-500/10',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    bar: 'bg-amber-500',
    glow: 'shadow-amber-500/10',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/50',
    icon: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    bar: 'bg-red-500',
    glow: 'shadow-red-500/10',
  },
}

export function DdsStatusWidget({
  totalShipments = 24,
  completeDds = 16,
  pendingPlots = 5,
  expiringSoon = 3,
  highRisk = 3,
  compact = false,
  onGenerateDds,
  onViewDetails,
}: DdsStatusWidgetProps) {
  const { t2 } = useI18n()
  const trafficLight = getTrafficLight(completeDds, totalShipments)
  const colors = LIGHT_COLORS[trafficLight]
  const pct = totalShipments > 0 ? Math.round((completeDds / totalShipments) * 100) : 0

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${colors.border} ${colors.bg}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${colors.bar} animate-pulse`} />
        <span className="text-xs font-bold text-foreground">
          {completeDds}/{totalShipments}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {t2('DDS hoàn chỉnh', 'DDS Complete')}
        </span>
      </div>
    )
  }

  return (
    <Card className={`rounded-2xl border ${colors.border} ${colors.bg} shadow-sm ${colors.glow} overflow-hidden`}>
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trafficLight === 'green' ? 'bg-green-100 dark:bg-green-900/60' : trafficLight === 'amber' ? 'bg-amber-100 dark:bg-amber-900/60' : 'bg-red-100 dark:bg-red-900/60'}`}>
              {trafficLight === 'green' ? (
                <FileCheck className={`w-4 h-4 ${colors.icon}`} />
              ) : (
                <FileWarning className={`w-4 h-4 ${colors.icon}`} />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {t2('Trạng thái DDS', 'DDS Status')}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t2(`${completeDds} trong ${totalShipments} lô hàng có DDS hoàn chỉnh`, `${completeDds} of ${totalShipments} shipments have complete DDS`)}
              </p>
            </div>
          </div>
          <Badge className={`text-[9px] font-bold tracking-wider border ${colors.badge}`}>
            {trafficLight === 'green' ? t2('ĐẠT', 'PASS') : trafficLight === 'amber' ? t2('CẢNH BÁO', 'CAUTION') : t2('RỦI RO', 'RISK')}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{t2('Tỷ lệ hoàn thành', 'Completion Rate')}</span>
            <span className={`font-bold ${colors.icon}`}>{pct}%</span>
          </div>
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-sm font-bold text-foreground">{pendingPlots}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{t2('Plots chờ', 'Pending')}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-sm font-bold text-foreground">{highRisk}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{t2('Rủi ro cao', 'High Risk')}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span className="text-sm font-bold text-foreground">{expiringSoon}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{t2('Sắp hết hạn', 'Expiring')}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {trafficLight !== 'green' && onGenerateDds && (
            <button
              onClick={onGenerateDds}
              className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              {t2('Tạo DDS', 'Generate DDS')}
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 text-[10px] font-medium py-1.5 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              {t2('Xem chi tiết', 'View Details')}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DdsStatusWidget
