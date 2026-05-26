'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, AlertTriangle, CheckCircle, FileWarning, Clock,
  TreePine, MapPin, Satellite, FileCheck, Zap, ArrowRight,
  TrendingDown, TrendingUp, AlertOctagon, FileText, ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/i18n'
import { useSession } from 'next-auth/react'
import EudrComplianceScore from '@/components/compliance/eudr-compliance-score'
import { ComplianceFearBanner } from '@/components/compliance/compliance-fear-banner'
import { DdsStatusWidget } from './dds-status-widget'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion'

// Mock data for compliance officer
const MOCK_PENDING_DDS = [
  { id: 'DDS-2026-001', farm: 'Farm F-2034', status: 'expired', risk: 'high', daysSince: 14, reason: 'DDS expired — Re-submission required' },
  { id: 'DDS-2026-002', farm: 'Farm F-1087', status: 'expiring', risk: 'medium', daysSince: 0, reason: 'Expires in 14 days' },
  { id: 'DDS-2026-003', farm: 'Farm F-1891', status: 'missing', risk: 'high', daysSince: 30, reason: 'GPS plot unmapped — Cannot generate DDS' },
  { id: 'DDS-2026-004', farm: 'Farm F-2201', status: 'missing', risk: 'high', daysSince: 22, reason: 'Deforestation check not run' },
  { id: 'DDS-2026-005', farm: 'Farm F-3056', status: 'pending_review', risk: 'medium', daysSince: 5, reason: 'Awaiting verification' },
  { id: 'DDS-2026-006', farm: 'Farm F-4102', status: 'missing', risk: 'high', daysSince: 45, reason: 'No DDS generated' },
]

const MOCK_RISK_ALERTS = [
  { id: '1', severity: 'critical', message: 'Deforestation alert: New clearing near Plot P-567', time: '8 min ago', action: 'Run satellite check' },
  { id: '2', severity: 'critical', message: '8 shipments flagged for EU rejection risk', time: '6 hrs ago', action: 'Generate missing DDS' },
  { id: '3', severity: 'warning', message: 'Compliance score dropped to 62% (target: 85%)', time: '15 min ago', action: 'View risk report' },
  { id: '4', severity: 'warning', message: '5 GPS polygons incomplete — Cannot verify plots', time: '2 hrs ago', action: 'Fix GPS gaps' },
  { id: '5', severity: 'info', message: 'EUDR regulation update: New guidance document published', time: '1 day ago', action: 'Read update' },
]

const MOCK_PLOT_VERIFICATION = [
  { province: 'Dak Lak', total: 62, verified: 48, pending: 14 },
  { province: 'Lam Dong', total: 45, verified: 40, pending: 5 },
  { province: 'Gia Lai', total: 31, verified: 22, pending: 9 },
  { province: 'Dak Nong', total: 18, verified: 15, pending: 3 },
  { province: 'Kon Tum', total: 12, verified: 8, pending: 4 },
]

export function ComplianceOfficerView() {
  const { t2 } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'

  return (
    <StaggerContainer className="space-y-6">
      {/* Fear Banner */}
      <StaggerItem>
        <ComplianceFearBanner
          severity="critical"
          deadline="Dec 30, 2025"
          nonCompliantCount={8}
          penaltyPct="4%"
          complianceLink="/eudr-compliance"
          storageKey="terra-brew-compliance-officer-fear"
          onAction={() => router.push('/eudr-compliance')}
        />
      </StaggerItem>

      {/* Welcome + Actions */}
      <StaggerItem>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              {t2(`Tuân thủ EUDR — ${userName}`, `EUDR Compliance — ${userName}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t2('Bảng điều khiển tuân thủ của bạn — Ưu tiên hành động dưới đây', 'Your compliance dashboard — Prioritize actions below')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="destructive" className="gap-1.5 rounded-xl text-xs font-bold" onClick={() => router.push('/eudr-compliance')}>
              <FileWarning className="w-3.5 h-3.5" />
              {t2('Tạo DDS', 'Generate DDS')}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs" onClick={() => router.push('/eudr-compliance')}>
              <Satellite className="w-3.5 h-3.5" />
              {t2('Chạy kiểm tra vệ tinh', 'Run Satellite Check')}
            </Button>
          </div>
        </div>
      </StaggerItem>

      {/* EUDR Score + DDS Widget */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EudrComplianceScore
              score={62}
              shipmentsAtRisk={8}
              penaltyPct="4%"
              onGenerateDDS={() => router.push('/eudr-compliance')}
              onFixGPS={() => router.push('/eudr-compliance')}
              onViewRisk={() => router.push('/eudr-compliance')}
            />
          </div>
          <div className="space-y-4">
            <DdsStatusWidget
              totalShipments={24}
              completeDds={16}
              pendingPlots={5}
              expiringSoon={3}
              highRisk={3}
              onGenerateDds={() => router.push('/eudr-compliance')}
              onViewDetails={() => router.push('/eudr-compliance')}
            />
            {/* Quick KPIs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
                <p className="text-lg font-bold text-red-600 dark:text-red-400">8</p>
                <p className="text-[9px] text-muted-foreground">{t2('Lô rủi ro cao', 'High Risk')}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">11</p>
                <p className="text-[9px] text-muted-foreground">{t2('DDS chờ xử lý', 'Pending DDS')}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">67%</p>
                <p className="text-[9px] text-muted-foreground">{t2('Tuân thủ', 'Compliant')}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-lg font-bold text-foreground">5</p>
                <p className="text-[9px] text-muted-foreground">{t2('GPS thiếu', 'GPS Gaps')}</p>
              </div>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Pending DDS + Risk Alerts */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending DDS List */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-red-500" />
                  {t2('DDS cần xử lý', 'Pending DDS Actions')}
                </CardTitle>
                <Badge variant="destructive" className="text-[9px]">{MOCK_PENDING_DDS.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {MOCK_PENDING_DDS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push('/eudr-compliance')}
                    className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/30 transition-colors text-left group"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.risk === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{item.farm}</span>
                        <Badge variant="outline" className={`text-[8px] h-4 ${
                          item.status === 'expired' ? 'border-red-300 text-red-600' :
                          item.status === 'missing' ? 'border-red-300 text-red-600' :
                          item.status === 'expiring' ? 'border-amber-300 text-amber-600' :
                          'border-blue-300 text-blue-600'
                        }`}>
                          {item.status === 'expired' ? t2('Hết hạn', 'EXPIRED') :
                           item.status === 'missing' ? t2('Thiếu', 'MISSING') :
                           item.status === 'expiring' ? t2('Sắp hết hạn', 'EXPIRING') :
                           t2('Chờ duyệt', 'REVIEW')}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.reason}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  {t2('Cảnh báo rủi ro', 'Risk Alerts')}
                </CardTitle>
                <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-0 text-[9px] font-bold">
                  {t2('SỰ CHÚ Ý CẦN THIẾT', 'NEEDS ATTENTION')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {MOCK_RISK_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      alert.severity === 'critical'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
                        : 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{alert.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-muted-foreground">{alert.time}</span>
                        <button
                          onClick={() => router.push('/eudr-compliance')}
                          className="text-[9px] font-medium text-primary hover:text-primary/80"
                        >
                          {alert.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Plot Verification by Province */}
      <StaggerItem>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t2('Xác minh theo tỉnh', 'Plot Verification by Province')}
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">{t2('168 plots', '168 plots')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {MOCK_PLOT_VERIFICATION.map((prov) => {
                const pct = Math.round((prov.verified / prov.total) * 100)
                return (
                  <div key={prov.province} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{prov.province}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{prov.verified}/{prov.total}</span>
                        <span className={`text-xs font-bold ${pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}

export default ComplianceOfficerView
