'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Users, MapPin, Wheat, DollarSign, Award,
  TrendingUp, TrendingDown, Activity, AlertTriangle, Clock,
  ShoppingCart, FileCheck, ClipboardCheck, Loader2,
  Plus, Search, ChevronRight, Zap, Timer, CalendarDays,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import { StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import { formatCurrency } from '@/types'
import type { DashboardStats } from '@/types'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const CHART_COLORS = ['#0d9488', '#8b5a1e', '#d4a574', '#4a7c59', '#c08850', '#6d4516', '#a06b2d', '#2e7d32']

// ═══════════════════════════════════════════════════════════════
// HOOK: useDashboardData
// ═══════════════════════════════════════════════════════════════

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════

export function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1500
    const stepTime = 20
    const steps = duration / stepTime
    const increment = end / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

export function Sparkline({ data, color = '#0d9488', width = 80, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RadialScore({ value, max = 100, size = 56, strokeWidth = 5 }: { value: number; max?: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(value / max, 1)
  const offset = circumference - progress * circumference
  const color = value >= 85 ? '#2e7d32' : value >= 75 ? '#0d9488' : value >= 60 ? '#d97706' : '#dc2626'
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/30" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
    </svg>
  )
}

export function TrendIndicator({ value, label }: { value: number; label?: string }) {
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value).toFixed(1)}%
      {label && <span className="text-muted-foreground font-normal ml-0.5">{label}</span>}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════════════

export interface KPIConfig {
  title: string
  value: number
  icon: React.ElementType
  format: 'currency' | 'number' | 'decimal' | 'score' | 'percent'
  iconBg: string
  iconColor: string
  trend?: number
  sparkData?: number[]
  sparkColor?: string
  suffix?: string
}

export function KPICard({ kpi }: { kpi: KPIConfig }) {
  return (
    <MotionCard
      {...hoverScale}
      className="rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-default"
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
            <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
          </div>
          {kpi.trend !== undefined && <TrendIndicator value={kpi.trend} />}
        </div>
        <div>
          <p className="text-lg md:text-xl font-bold text-foreground leading-none">
            {kpi.format === 'currency' ? (
              <AnimatedCounter value={kpi.value} prefix="" suffix={kpi.suffix || ' ₫'} />
            ) : kpi.format === 'score' ? (
              <span>{kpi.value.toFixed(1)}<span className="text-xs text-muted-foreground font-normal">/100</span></span>
            ) : kpi.format === 'percent' ? (
              <span>{kpi.value.toFixed(1)}<span className="text-xs text-muted-foreground font-normal">%</span></span>
            ) : kpi.format === 'decimal' ? (
              <>{kpi.value.toFixed(1)}<span className="text-xs text-muted-foreground font-normal ml-0.5">{kpi.suffix || 'ha'}</span></>
            ) : (
              <AnimatedCounter value={kpi.value} />
            )}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.title}</p>
        </div>
        {kpi.sparkData && kpi.sparkData.length > 1 && (
          <div className="pt-1">
            <Sparkline data={kpi.sparkData} color={kpi.sparkColor || '#0d9488'} width={100} height={24} />
          </div>
        )}
      </CardContent>
    </MotionCard>
  )
}

export function KPIGrid({ kpis }: { kpis: KPIConfig[] }) {
  const cols = kpis.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : kpis.length <= 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
  return (
    <div className={`grid ${cols} gap-3 md:gap-4`}>
      {kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD HEADER
// ═══════════════════════════════════════════════════════════════

export function DashboardHeader({ userName, userRole, quickButtons }: {
  userName: string
  userRole: string
  quickButtons?: Array<{ icon: React.ElementType; label: string; href: string }>
}) {
  const router = useRouter()
  const { t2 } = useI18n()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t2(`Xin chào, ${userName}`, `Welcome back, ${userName}`)}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px] capitalize font-normal">
            {userRole}
          </Badge>
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      {quickButtons && quickButtons.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {quickButtons.map((btn, i) => (
            <Button key={i} size="sm" variant={i === 0 ? 'default' : 'outline'} className="gap-1.5 rounded-xl text-xs" onClick={() => router.push(btn.href)}>
              <btn.icon className="w-3.5 h-3.5" />
              {btn.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// QUICK ACTIONS PANEL
// ═══════════════════════════════════════════════════════════════

export interface QuickActionConfig {
  icon: React.ElementType
  label: string
  href: string
  count?: number
  countLabel?: string
}

export function QuickActionsPanel({ actions, title }: { actions: QuickActionConfig[]; title?: string }) {
  const router = useRouter()
  const { t2 } = useI18n()

  return (
    <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          {title || t2('Thao tác nhanh', 'Quick Actions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => router.push(action.href)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <action.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground flex-1">{action.label}</span>
            {action.count !== undefined && action.count > 0 && (
              <Badge variant="secondary" className="text-[9px] h-5 gap-0.5">
                {action.count} {action.countLabel}
              </Badge>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════

export function ActivityFeed({ activities }: { activities: Array<{ id: string; type: string; action: string; entity: string; time: string }> }) {
  const { t2 } = useI18n()

  const typeColors: Record<string, string> = {
    procurement: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    inspection: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
    farmer: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
    contract: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    alert: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  }
  const typeIcons: Record<string, React.ElementType> = {
    procurement: ShoppingCart,
    inspection: ClipboardCheck,
    farmer: Users,
    contract: FileCheck,
    alert: AlertTriangle,
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t2('Hoạt động gần đây', 'Recent Activity')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <EmptyState message={t2('Chưa có hoạt động', 'No activity yet')} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t2('Hoạt động gần đây', 'Recent Activity')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-4">
        <ScrollArea className="h-[340px] pr-2">
          <div className="space-y-1">
            {activities.map((activity) => {
              const Icon = typeIcons[activity.type] || Activity
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[activity.type] || 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground leading-tight">{activity.action}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{activity.entity}</p>
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                      <Timer className="w-2.5 h-2.5" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

export function EmptyState({ message, icon: Icon = Activity }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-xs">{message}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

export function DashboardLoading() {
  const { t2 } = useI18n()
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center">
          <Coffee className="w-9 h-9 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{t2('Đang tải...', 'Loading dashboard...')}</span>
        </div>
      </div>
    </div>
  )
}
