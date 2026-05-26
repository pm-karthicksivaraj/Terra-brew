'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertOctagon, AlertTriangle, Info, X, ExternalLink,
  Shield, Clock,
} from 'lucide-react'
import { useI18n } from '@/i18n'

// ─── Types ─────────────────────────────────────────────────────

export type BannerSeverity = 'critical' | 'warning' | 'info'

export interface ComplianceFearBannerProps {
  /** Severity level */
  severity?: BannerSeverity
  /** Deadline date string */
  deadline?: string
  /** Number of non-compliant shipments */
  nonCompliantCount?: number
  /** Penalty percentage string */
  penaltyPct?: string
  /** Link to compliance page */
  complianceLink?: string
  /** Storage key for dismissal persistence (per-user) */
  storageKey?: string
  /** Called when CTA is clicked */
  onAction?: () => void
  /** Custom message override (Vietnamese) */
  messageVi?: string
  /** Custom message override (English) */
  messageEn?: string
}

// ─── Severity Config ───────────────────────────────────────────

const SEVERITY_CONFIG: Record<BannerSeverity, {
  bg: string
  border: string
  text: string
  subtext: string
  iconBg: string
  icon: typeof AlertOctagon
  badge: string
  pulse: string
  ctaVariant: 'destructive' | 'outline' | 'outline'
}> = {
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    subtext: 'text-red-600/70 dark:text-red-400/60',
    iconBg: 'bg-red-100 dark:bg-red-900/60',
    icon: AlertOctagon,
    badge: 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-200',
    pulse: 'animate-pulse',
    ctaVariant: 'destructive',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-300',
    subtext: 'text-amber-600/70 dark:text-amber-400/60',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    icon: AlertTriangle,
    badge: 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200',
    pulse: '',
    ctaVariant: 'outline',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-800',
    text: 'text-sky-800 dark:text-sky-300',
    subtext: 'text-sky-600/70 dark:text-sky-400/60',
    iconBg: 'bg-sky-100 dark:bg-sky-900/60',
    icon: Info,
    badge: 'bg-sky-200 dark:bg-sky-800 text-sky-900 dark:text-sky-200',
    pulse: '',
    ctaVariant: 'outline',
  },
}

// ─── Main Component ────────────────────────────────────────────

export function ComplianceFearBanner({
  severity = 'critical',
  deadline = 'Dec 30, 2025',
  nonCompliantCount = 8,
  penaltyPct = '4%',
  complianceLink = '/eudr-compliance',
  storageKey = 'terra-brew-fear-banner-dismissed',
  onAction,
  messageVi,
  messageEn,
}: ComplianceFearBannerProps) {
  const { t2 } = useI18n()
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)

  // Check if previously dismissed this session
  useEffect(() => {
    try {
      const wasDismissed = sessionStorage.getItem(storageKey)
      if (!wasDismissed) {
        // Small delay for mount animation
        const timer = setTimeout(() => setVisible(true), 200)
        return () => clearTimeout(timer)
      }
    } catch {
      // Fallback: show anyway
      const timer = setTimeout(() => setVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    try {
      sessionStorage.setItem(storageKey, '1')
    } catch {
      // ignore
    }
    // Remove from DOM after animation
    setTimeout(() => setVisible(false), 300)
  }, [storageKey])

  const config = SEVERITY_CONFIG[severity]
  const Icon = config.icon

  const defaultMessageVi = `Hạn EUDR: ${deadline} — ${nonCompliantCount} lô hàng không tuân thủ. Phạt tiền lên tới ${penaltyPct} doanh thu EU.`
  const defaultMessageEn = `EUDR DEADLINE: ${deadline} — ${nonCompliantCount} shipments non-compliant. Potential penalty: up to ${penaltyPct} EU revenue.`

  const message = t2(messageVi || defaultMessageVi, messageEn || defaultMessageEn)

  if (!visible) return null

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${config.border} ${config.bg} transition-all duration-300 ${
        dismissed ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      role="alert"
      aria-live={severity === 'critical' ? 'assertive' : 'polite'}
    >
      {/* Critical pulse overlay */}
      {severity === 'critical' && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="relative flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${config.iconBg} shrink-0`}>
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-bold ${config.text}`}>
              {message}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock className={`w-3 h-3 ${config.subtext}`} />
            <p className={`text-[10px] ${config.subtext}`}>
              {severity === 'critical'
                ? t2('Yêu cầu hành động ngay lập tức', 'Immediate action required')
                : severity === 'warning'
                ? t2('Hành động sớm để tránh rủi ro', 'Act early to avoid risk')
                : t2('Thông tin cập nhật tuân thủ', 'Compliance update')}
            </p>
          </div>
        </div>

        {/* CTA + Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={config.ctaVariant}
            size="sm"
            className="rounded-xl text-xs gap-1.5 h-8"
            onClick={onAction || (() => {
              if (typeof window !== 'undefined') {
                window.location.href = complianceLink
              }
            })}
          >
            <Shield className="w-3.5 h-3.5" />
            {t2('Xử lý ngay', 'Fix Now')}
          </Button>

          <button
            onClick={handleDismiss}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${config.subtext}`}
            aria-label={t2('Đóng', 'Dismiss')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar for urgency */}
      {severity === 'critical' && (
        <div className="h-0.5 bg-red-200 dark:bg-red-900">
          <div className="h-full bg-red-500 animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
        </div>
      )}
    </div>
  )
}

// ─── Multi-Severity Banner Set ─────────────────────────────────

export interface ComplianceBannerSetProps {
  /** Show critical banner */
  showCritical?: boolean
  /** Show warning banner */
  showWarning?: boolean
  /** Show info banner */
  showInfo?: boolean
  /** Props overrides per severity */
  criticalProps?: Partial<ComplianceFearBannerProps>
  warningProps?: Partial<ComplianceFearBannerProps>
  infoProps?: Partial<ComplianceFearBannerProps>
}

export function ComplianceBannerSet({
  showCritical = true,
  showWarning = false,
  showInfo = false,
  criticalProps,
  warningProps,
  infoProps,
}: ComplianceBannerSetProps) {
  return (
    <div className="space-y-3">
      {showCritical && (
        <ComplianceFearBanner
          severity="critical"
          storageKey="terra-brew-fear-critical"
          {...criticalProps}
        />
      )}
      {showWarning && (
        <ComplianceFearBanner
          severity="warning"
          nonCompliantCount={3}
          storageKey="terra-brew-fear-warning"
          {...warningProps}
        />
      )}
      {showInfo && (
        <ComplianceFearBanner
          severity="info"
          nonCompliantCount={0}
          deadline="--"
          storageKey="terra-brew-fear-info"
          messageVi="Cập nhật quy định EUDR mới — xem thay đổi"
          messageEn="New EUDR regulation update — view changes"
          {...infoProps}
        />
      )}
    </div>
  )
}

export default ComplianceFearBanner
